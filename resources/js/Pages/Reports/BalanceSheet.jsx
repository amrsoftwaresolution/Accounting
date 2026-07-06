import React, { useState } from 'react';
import ReportLayout from '@/Layouts/ReportLayout';
import { Head, Link, router } from '@inertiajs/react';
import CommonInput from '@/Components/CommonInput';
import { useDateFormat, formatDate } from '@/Utils/dateFormat';

export default function BalanceSheet({ reportData, filters, auth }) {
    const dateFormat = useDateFormat();
    const [endDate, setEndDate] = useState(filters.end_date || '');
    const [datePreset, setDatePreset] = useState('custom');

    const handleRunReport = (overrideEnd) => {
        const e = typeof overrideEnd === 'string' ? overrideEnd : endDate;
        router.get(route('reports.balance-sheet'), { end_date: e }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handlePresetChange = (e) => {
        const val = e.target.value;
        setDatePreset(val);

        let newEnd = endDate;
        const currentYear = new Date().getFullYear();

        if (val === 'all') {
            newEnd = ''; // Defaults to today in backend
        } else if (val === 'this_year') {
            newEnd = `${currentYear}-12-31`;
        } else if (val === 'last_year') {
            newEnd = `${currentYear - 1}-12-31`;
        }

        if (val !== 'custom') {
            setEndDate(newEnd);
            handleRunReport(newEnd);
        }
    };

    const asset = reportData.asset || [];
    const liability = reportData.liability || [];
    const equity = reportData.equity || [];

    const totalAsset = asset.reduce((sum, item) => sum + item.total_balance, 0);
    const totalLiability = liability.reduce((sum, item) => sum + item.total_balance, 0);
    const totalEquity = equity.reduce((sum, item) => sum + item.total_balance, 0);
    const totalLiabilityEquity = totalLiability + totalEquity;

    const homeCurrency = auth.company?.home_currency_prefix || auth.company?.home_currency || 'LKR';

    const Currency = ({ value }) => (
        <span className={value < 0 ? 'text-red-600' : 'text-slate-900'}>
            <span className="text-[10px] font-bold text-slate-400 mr-1">{homeCurrency}</span>
            {value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
    );

    const flattenAccounts = (accounts, prefix = "") => {
        let flattened = [];
        accounts.forEach(acc => {
            flattened.push({ name: prefix + acc.name, balance: acc.balance });
            if (acc.children && acc.children.length > 0) {
                flattened = flattened.concat(flattenAccounts(acc.children, prefix + "  "));
                flattened.push({ name: prefix + "Total " + acc.name, balance: acc.total_balance });
            }
        });
        return flattened;
    };

    const handleExportExcel = () => {
        const companyName = auth.company?.company_name || 'GrowDigitec';
        const endDate = filters.end_date;

        let csvContent = "";

        // Add Title Header
        csvContent += `"${companyName}"\n`;
        csvContent += `"Balance Sheet"\n`;
        csvContent += `"As of ${formatDate(endDate, dateFormat)}"\n\n`;

        // Headers
        csvContent += `"Category","Account Name","Balance (${homeCurrency})"\n`;

        // Assets
        csvContent += `"ASSETS"\n`;
        const flatAsset = flattenAccounts(asset);
        flatAsset.forEach(item => {
            csvContent += `,"${item.name}",${item.balance}\n`;
        });
        csvContent += `,"Total Assets",${totalAsset}\n\n`;

        // Liabilities & Equity
        csvContent += `"LIABILITIES AND EQUITY"\n`;
        csvContent += `"Liabilities"\n`;
        const flatLiability = flattenAccounts(liability);
        flatLiability.forEach(item => {
            csvContent += `,"${item.name}",${item.balance}\n`;
        });
        csvContent += `,"Total Liabilities",${totalLiability}\n\n`;

        csvContent += `"Equity"\n`;
        const flatEquity = flattenAccounts(equity);
        flatEquity.forEach(item => {
            csvContent += `,"${item.name}",${item.balance}\n`;
        });
        csvContent += `,"Total Equity",${totalEquity}\n\n`;

        csvContent += `,"Total Liabilities and Equity",${totalLiabilityEquity}\n`;

        // Create download blob
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `${companyName.replace(/[^a-z0-9]/gi, '_')}_Balance_Sheet_As_Of_${endDate}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const filterElements = (
        <div className="flex items-end gap-4">
            <div className="w-[160px] pb-[1px]">
                <CommonInput
                    type="select"
                    label="Date Period"
                    value={datePreset}
                    onChange={handlePresetChange}
                    size="sm"
                >
                    <option value="all">All Dates</option>
                    <option value="this_year">Current Year</option>
                    <option value="last_year">Last Year</option>
                    <option value="custom">Customize</option>
                </CommonInput>
            </div>
            {datePreset === 'custom' && (
                <>
                    <div className="w-[140px]">
                        <CommonInput
                            type="date"
                            label="As of Date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            size="sm"
                        />
                    </div>
                    <button
                        onClick={() => handleRunReport()}
                        className="px-4 bg-slate-900 text-white rounded-sm hover:bg-slate-800 transition-colors font-bold text-[11px] uppercase tracking-wider h-[30px]"
                    >
                        Run Report
                    </button>
                </>
            )}
        </div>
    );

    const AccountRow = ({ item, depth = 0 }) => {
        const hasChildren = item.children && item.children.length > 0;
        const paddingLeft = depth === 0 ? '2rem' : `${2 + depth * 1.5}rem`;

        return (
            <React.Fragment>
                <tr className="hover:bg-gray-50 transition-colors">
                    <td className="py-2 px-3 text-gray-900" style={{ paddingLeft }}>
                        {item.name}
                    </td>
                    <td className="py-2 px-3 text-right tabular-nums">
                        {hasChildren && item.balance === 0 ? null : (
                            <Link href={route('chart-of-account.history', item.id) + '?end_date=' + filters.end_date} className="hover:underline cursor-pointer decoration-slate-400 underline-offset-4">
                                <Currency value={item.balance} />
                            </Link>
                        )}
                    </td>
                </tr>
                {hasChildren && item.children.map(child => (
                    <AccountRow key={child.id} item={child} depth={depth + 1} />
                ))}
                {hasChildren && (
                    <tr className="hover:bg-gray-50 transition-colors font-medium border-t border-gray-100">
                        <td className="py-2 px-3 text-gray-700" style={{ paddingLeft }}>
                            Total {item.name}
                        </td>
                        <td className="py-2 px-3 text-right tabular-nums">
                            <Currency value={item.total_balance} />
                        </td>
                    </tr>
                )}
            </React.Fragment>
        );
    };

    return (
        <ReportLayout
            title="Balance Sheet"
            filters={filterElements}
            onExportExcel={handleExportExcel}
        >
            <Head title="Balance Sheet" />

            <div className="text-center mb-8 font-serif">
                <h2 className="text-xl font-bold text-gray-900">Balance Sheet</h2>
                <h3 className="text-sm text-gray-700 mt-1">{auth.company?.company_name}</h3>
                <p className="text-[13px] text-gray-500 mt-1">
                    As of {formatDate(filters.end_date, dateFormat)}
                </p>
            </div>

            <div className="w-full overflow-x-auto pb-10">
                <table className="w-full text-[13px] text-left border-collapse">
                    <thead>
                        <tr className="border-y-2 border-gray-300">
                            <th className="py-2.5 px-3 font-semibold text-gray-900 w-3/4">
                                Account
                            </th>
                            <th className="py-2.5 px-3 font-semibold text-gray-900 text-right">
                                Total <span className="inline-block ml-1 text-gray-400 text-[10px]">↕</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {/* Assets Section */}
                        <tr className="bg-gray-50 border-y border-gray-300">
                            <td colSpan="2" className="py-2 px-3 font-bold text-gray-900">
                                <span className="inline-block mr-1 text-[10px]">▼</span> ASSETS
                            </td>
                        </tr>
                        {asset.map((item) => (
                            <AccountRow key={item.id} item={item} />
                        ))}
                        <tr className="border-t border-b-2 border-gray-300 bg-white font-semibold">
                            <td className="py-2 px-3 pl-8 text-gray-900">Total Assets</td>
                            <td className="py-2 px-3 text-right tabular-nums text-gray-900"><Currency value={totalAsset} /></td>
                        </tr>

                        {/* Liabilities & Equity Section */}
                        <tr className="bg-gray-50 border-y border-gray-300">
                            <td colSpan="2" className="py-2 px-3 font-bold text-gray-900 mt-4">
                                <span className="inline-block mr-1 text-[10px]">▼</span> LIABILITIES AND EQUITY
                            </td>
                        </tr>

                        {/* Liabilities Sub-section */}
                        <tr className="bg-white">
                            <td colSpan="2" className="py-2 px-3 pl-6 font-semibold text-gray-700 italic">
                                Liabilities
                            </td>
                        </tr>
                        {liability.map((item) => (
                            <AccountRow key={item.id} item={item} />
                        ))}
                        <tr className="border-t border-gray-200 bg-white font-medium">
                            <td className="py-2 px-3 pl-8 text-gray-900">Total Liabilities</td>
                            <td className="py-2 px-3 text-right tabular-nums text-gray-900"><Currency value={totalLiability} /></td>
                        </tr>

                        {/* Equity Sub-section */}
                        <tr className="bg-white mt-2">
                            <td colSpan="2" className="py-2 px-3 pl-6 font-semibold text-gray-700 italic border-t border-gray-100">
                                Equity
                            </td>
                        </tr>
                        {equity.map((item) => (
                            <AccountRow key={item.id} item={item} />
                        ))}
                        <tr className="border-t border-gray-200 bg-white font-medium">
                            <td className="py-2 px-3 pl-8 text-gray-900">Total Equity</td>
                            <td className="py-2 px-3 text-right tabular-nums text-gray-900"><Currency value={totalEquity} /></td>
                        </tr>

                        <tr className="border-t-2 border-b-4 border-gray-400 font-bold bg-white text-[14px]">
                            <td className="py-3 px-3 text-gray-900">TOTAL LIABILITIES AND EQUITY</td>
                            <td className="py-3 px-3 text-right tabular-nums text-gray-900"><Currency value={totalLiabilityEquity} /></td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div className="mt-20 text-[10px] text-slate-400 font-bold text-center uppercase tracking-widest italic">
                Accrual Basis | Generated on {formatDate(new Date(), dateFormat)}
            </div>
        </ReportLayout>
    );
}
