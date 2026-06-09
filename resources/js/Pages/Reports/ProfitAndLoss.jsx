import React, { useState } from 'react';
import ReportLayout from '@/Layouts/ReportLayout';
import { Head, Link, router } from '@inertiajs/react';
import CommonInput from '@/Components/CommonInput';

export default function ProfitAndLoss({ reportData, filters, auth }) {
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');
    const [datePreset, setDatePreset] = useState('custom');

    const handleRunReport = (overrideStart, overrideEnd) => {
        const s = overrideStart !== undefined ? overrideStart : startDate;
        const e = overrideEnd !== undefined ? overrideEnd : endDate;
        router.get(route('reports.profit-loss'), { start_date: s, end_date: e }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handlePresetChange = (e) => {
        const val = e.target.value;
        setDatePreset(val);
        
        let newStart = startDate;
        let newEnd = endDate;
        const currentYear = new Date().getFullYear();

        if (val === 'all') {
            newStart = '';
            newEnd = '';
        } else if (val === 'this_year') {
            newStart = `${currentYear}-01-01`;
            newEnd = `${currentYear}-12-31`;
        } else if (val === 'last_year') {
            newStart = `${currentYear - 1}-01-01`;
            newEnd = `${currentYear - 1}-12-31`;
        }

        if (val !== 'custom') {
            setStartDate(newStart);
            setEndDate(newEnd);
            handleRunReport(newStart, newEnd);
        }
    };

    const income = reportData.income || [];
    const expense = reportData.expense || [];

    const totalIncome = income.reduce((sum, item) => sum + item.total_balance, 0);
    const totalExpense = expense.reduce((sum, item) => sum + item.total_balance, 0);
    const netIncome = totalIncome - totalExpense;

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
        const startDate = filters.start_date;
        const endDate = filters.end_date;
        
        let csvContent = "";
        
        // Add Title Header
        csvContent += `"${companyName}"\n`;
        csvContent += `"Profit and Loss"\n`;
        csvContent += `"${new Date(startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} - ${new Date(endDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}"\n\n`;
        
        // Headers
        csvContent += `"Category","Account Name","Balance (${homeCurrency})"\n`;
        
        // Income
        csvContent += `"INCOME"\n`;
        const flatIncome = flattenAccounts(income);
        flatIncome.forEach(item => {
            csvContent += `,"${item.name}",${item.balance}\n`;
        });
        csvContent += `,"Total Income",${totalIncome}\n\n`;
        
        // Expenses
        csvContent += `"EXPENSES"\n`;
        const flatExpense = flattenAccounts(expense);
        flatExpense.forEach(item => {
            csvContent += `,"${item.name}",${item.balance}\n`;
        });
        csvContent += `,"Total Expenses",${totalExpense}\n\n`;
        
        // Net Income
        csvContent += `,"Net Income",${netIncome}\n`;
        
        // Create download blob
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `${companyName.replace(/[^a-z0-9]/gi, '_')}_Profit_And_Loss_${startDate}_to_${endDate}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const filterElements = (
        <div className="flex items-end gap-4">
            <div className="w-[160px]">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Date Period</label>
                <select 
                    value={datePreset}
                    onChange={handlePresetChange}
                    className="w-full h-9 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-colors"
                >
                    <option value="all">All Dates</option>
                    <option value="this_year">Current Year</option>
                    <option value="last_year">Last Year</option>
                    <option value="custom">Customize</option>
                </select>
            </div>
            {datePreset === 'custom' && (
                <>
                    <div className="w-[140px]">
                        <CommonInput 
                            type="date"
                            label="From"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            size="sm"
                        />
                    </div>
                    <div className="w-[140px]">
                        <CommonInput 
                            type="date"
                            label="To"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            size="sm"
                        />
                    </div>
                    <button 
                        onClick={() => handleRunReport()}
                        className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-bold text-xs uppercase tracking-wider h-[38px] mb-[1px]"
                    >
                        Run Report
                    </button>
                </>
            )}
        </div>
    );

    const AccountRow = ({ item, depth = 0 }) => {
        const hasChildren = item.children && item.children.length > 0;
        const paddingLeft = `${2 + depth * 1.5}rem`;

        return (
            <React.Fragment>
                <tr className="hover:bg-gray-50 transition-colors">
                    <td className="py-2 px-3 text-gray-900" style={{ paddingLeft }}>
                        {item.name}
                    </td>
                    <td className="py-2 px-3 text-right tabular-nums">
                        {hasChildren && item.balance === 0 ? null : (
                            <Link href={route('chart-of-account.history', item.id) + '?start_date=' + filters.start_date + '&end_date=' + filters.end_date} className="hover:underline cursor-pointer decoration-slate-400 underline-offset-4">
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
            title="Profit and Loss"
            filters={filterElements}
            onExportExcel={handleExportExcel}
        >
            <Head title="Profit and Loss" />
            
            <div className="text-center mb-8 font-serif">
                <h2 className="text-xl font-bold text-gray-900">Profit and Loss Summary</h2>
                <h3 className="text-sm text-gray-700 mt-1">{auth.company?.company_name}</h3>
                <p className="text-[13px] text-gray-500 mt-1">
                    {new Date(filters.start_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} - {new Date(filters.end_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
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
                        {/* Income Section */}
                        <tr className="bg-gray-50 border-y border-gray-300">
                            <td colSpan="2" className="py-2 px-3 font-bold text-gray-900">
                                <span className="inline-block mr-1 text-[10px]">▼</span> Income
                            </td>
                        </tr>
                        {income.map((item) => (
                            <AccountRow key={item.id} item={item} />
                        ))}
                        <tr className="border-t border-b-2 border-gray-300 bg-white font-semibold">
                            <td className="py-2 px-3 pl-8 text-gray-900">Total Income</td>
                            <td className="py-2 px-3 text-right tabular-nums text-gray-900"><Currency value={totalIncome} /></td>
                        </tr>

                        {/* Expense Section */}
                        <tr className="bg-gray-50 border-y border-gray-300">
                            <td colSpan="2" className="py-2 px-3 font-bold text-gray-900 mt-4">
                                <span className="inline-block mr-1 text-[10px]">▼</span> Expenses
                            </td>
                        </tr>
                        {expense.map((item) => (
                            <AccountRow key={item.id} item={item} />
                        ))}
                        <tr className="border-t border-b-2 border-gray-300 bg-white font-semibold">
                            <td className="py-2 px-3 pl-8 text-gray-900">Total Expenses</td>
                            <td className="py-2 px-3 text-right tabular-nums text-gray-900"><Currency value={totalExpense} /></td>
                        </tr>

                        {/* Net Income */}
                        <tr className="border-t-2 border-b-4 border-gray-400 font-bold bg-white text-[14px]">
                            <td className="py-3 px-3 text-gray-900">NET INCOME</td>
                            <td className="py-3 px-3 text-right tabular-nums text-gray-900"><Currency value={netIncome} /></td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div className="mt-20 text-[10px] text-slate-400 font-bold text-center uppercase tracking-widest italic">
                Accrual Basis | Generated on {new Date().toLocaleDateString()}
            </div>
        </ReportLayout>
    );
}
