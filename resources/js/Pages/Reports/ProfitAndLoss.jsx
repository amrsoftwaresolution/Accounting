import React, { useState } from 'react';
import ReportLayout from '@/Layouts/ReportLayout';
import { Head, Link, router } from '@inertiajs/react';
import CommonInput from '@/Components/CommonInput';
import { useDateFormat, formatDate } from '@/Utils/dateFormat';

export default function ProfitAndLoss({ reportData, filters, auth }) {
    const dateFormat = useDateFormat();
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');
    const [datePreset, setDatePreset] = useState('custom');
    const [displayBy, setDisplayBy] = useState(filters.display_by || 'total');

    const handleRunReport = (overrideStart, overrideEnd, overrideDisplayBy) => {
        const s = typeof overrideStart === 'string' ? overrideStart : startDate;
        const e = typeof overrideEnd === 'string' ? overrideEnd : endDate;
        const d = typeof overrideDisplayBy === 'string' ? overrideDisplayBy : displayBy;
        router.get(route('reports.profit-loss'), { start_date: s, end_date: e, display_by: d }, {
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
    const cogs = reportData.cogs || [];
    const expense = reportData.expense || [];

    const totalIncome = income.reduce((sum, item) => sum + item.total_balance, 0);
    const totalCogs = cogs.reduce((sum, item) => sum + item.total_balance, 0);
    const grossProfit = totalIncome - totalCogs;
    const totalExpense = expense.reduce((sum, item) => sum + item.total_balance, 0);
    const netIncome = grossProfit - totalExpense;

    const homeCurrency = auth.company?.home_currency_prefix || auth.company?.home_currency || 'LKR';

    const Currency = ({ value }) => (
        <span className={value < 0 ? 'text-red-600' : 'text-slate-900'}>
            <span className="text-[10px] font-bold text-slate-400 mr-1">{homeCurrency}</span>
            {value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
    );

    const isMonthWise = filters.display_by === 'month';
    const monthCols = filters.months || [];
    const formatMonth = (ym) => {
        const [y, m] = ym.split('-');
        const d = new Date(y, parseInt(m) - 1, 1);
        return new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }).format(d);
    };

    const totalIncomeMonthly = {};
    const totalCogsMonthly = {};
    const grossProfitMonthly = {};
    const totalExpenseMonthly = {};
    const netIncomeMonthly = {};

    if (isMonthWise) {
        monthCols.forEach(ym => {
            totalIncomeMonthly[ym] = income.reduce((sum, item) => sum + (item.total_monthly_balances?.[ym] || 0), 0);
            totalCogsMonthly[ym] = cogs.reduce((sum, item) => sum + (item.total_monthly_balances?.[ym] || 0), 0);
            grossProfitMonthly[ym] = totalIncomeMonthly[ym] - totalCogsMonthly[ym];
            totalExpenseMonthly[ym] = expense.reduce((sum, item) => sum + (item.total_monthly_balances?.[ym] || 0), 0);
            netIncomeMonthly[ym] = grossProfitMonthly[ym] - totalExpenseMonthly[ym];
        });
    }

    const flattenAccounts = (accounts, prefix = "") => {
        let flattened = [];
        accounts.forEach(acc => {
            flattened.push({
                name: prefix + acc.name,
                balance: acc.balance,
                monthly_balances: acc.monthly_balances
            });
            if (acc.children && acc.children.length > 0) {
                flattened = flattened.concat(flattenAccounts(acc.children, prefix + "  "));
                flattened.push({
                    name: prefix + "Total " + acc.name,
                    balance: acc.total_balance,
                    monthly_balances: acc.total_monthly_balances
                });
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
        csvContent += `"${formatDate(startDate, dateFormat)} - ${formatDate(endDate, dateFormat)}"\n\n`;

        // Headers
        csvContent += `"Category","Account Name"`;
        if (isMonthWise) {
            monthCols.forEach(ym => {
                csvContent += `,"${formatMonth(ym)}"`;
            });
        }
        csvContent += `,"Balance (${homeCurrency})"\n`;

        // Income
        csvContent += `"INCOME"\n`;
        const flatIncome = flattenAccounts(income);
        flatIncome.forEach(item => {
            let row = `,"${item.name}"`;
            if (isMonthWise) {
                monthCols.forEach(ym => row += `,${item.monthly_balances?.[ym] || 0}`);
            }
            row += `,${item.balance}\n`;
            csvContent += row;
        });
        let incomeTotalRow = `,"Total Income"`;
        if (isMonthWise) {
            monthCols.forEach(ym => incomeTotalRow += `,${totalIncomeMonthly[ym] || 0}`);
        }
        incomeTotalRow += `,${totalIncome}\n\n`;
        csvContent += incomeTotalRow;

        // Cost of Goods Sold
        csvContent += `"COST OF GOODS SOLD"\n`;
        const flatCogs = flattenAccounts(cogs);
        flatCogs.forEach(item => {
            let row = `,"${item.name}"`;
            if (isMonthWise) {
                monthCols.forEach(ym => row += `,${item.monthly_balances?.[ym] || 0}`);
            }
            row += `,${item.balance}\n`;
            csvContent += row;
        });
        let cogsTotalRow = `,"Total Cost of Goods Sold"`;
        if (isMonthWise) {
            monthCols.forEach(ym => cogsTotalRow += `,${totalCogsMonthly[ym] || 0}`);
        }
        cogsTotalRow += `,${totalCogs}\n`;
        csvContent += cogsTotalRow;

        // Gross Profit
        let grossProfitRow = `,"GROSS PROFIT"`;
        if (isMonthWise) {
            monthCols.forEach(ym => grossProfitRow += `,${grossProfitMonthly[ym] || 0}`);
        }
        grossProfitRow += `,${grossProfit}\n\n`;
        csvContent += grossProfitRow;

        // Expenses
        csvContent += `"EXPENSES"\n`;
        const flatExpense = flattenAccounts(expense);
        flatExpense.forEach(item => {
            let row = `,"${item.name}"`;
            if (isMonthWise) {
                monthCols.forEach(ym => row += `,${item.monthly_balances?.[ym] || 0}`);
            }
            row += `,${item.balance}\n`;
            csvContent += row;
        });
        let expenseTotalRow = `,"Total Expenses"`;
        if (isMonthWise) {
            monthCols.forEach(ym => expenseTotalRow += `,${totalExpenseMonthly[ym] || 0}`);
        }
        expenseTotalRow += `,${totalExpense}\n\n`;
        csvContent += expenseTotalRow;

        // Net Income
        let netIncomeRow = `,"Net Income"`;
        if (isMonthWise) {
            monthCols.forEach(ym => netIncomeRow += `,${netIncomeMonthly[ym] || 0}`);
        }
        netIncomeRow += `,${netIncome}\n`;
        csvContent += netIncomeRow;

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
            <div className="w-[160px] pb-[1px]">
                <CommonInput
                    type="select"
                    label="Display columns by"
                    value={displayBy}
                    onChange={(e) => {
                        setDisplayBy(e.target.value);
                    }}
                    size="sm"
                >
                    <option value="total">Total Only</option>
                    <option value="month">Months</option>
                </CommonInput>
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
        const paddingLeft = `${2 + depth * 1.5}rem`;

        return (
            <React.Fragment>
                <tr className="hover:bg-gray-50 transition-colors">
                    <td className="py-2 px-3 text-gray-900" style={{ paddingLeft }}>
                        {item.name}
                    </td>
                    {isMonthWise && monthCols.map(ym => (
                        <td key={ym} className="py-2 px-3 text-right tabular-nums">
                            {hasChildren && (item.monthly_balances?.[ym] || 0) === 0 ? null : (
                                <Currency value={item.monthly_balances?.[ym] || 0} />
                            )}
                        </td>
                    ))}
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
                        {isMonthWise && monthCols.map(ym => (
                            <td key={ym} className="py-2 px-3 text-right tabular-nums">
                                <Currency value={item.total_monthly_balances?.[ym] || 0} />
                            </td>
                        ))}
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
                    {formatDate(filters.start_date, dateFormat)} - {formatDate(filters.end_date, dateFormat)}
                </p>
            </div>

            <div className="w-full overflow-x-auto pb-10">
                <table className="w-full text-[13px] text-left border-collapse">
                    <thead>
                        <tr className="border-y-2 border-gray-300">
                            <th className="py-2.5 px-3 font-semibold text-gray-900 w-2/5">
                                Account
                            </th>
                            {isMonthWise && monthCols.map(ym => (
                                <th key={ym} className="py-2.5 px-3 font-semibold text-gray-900 text-right w-32 whitespace-nowrap">
                                    {formatMonth(ym)}
                                </th>
                            ))}
                            <th className="py-2.5 px-3 font-semibold text-gray-900 text-right w-32 whitespace-nowrap">
                                Total <span className="inline-block ml-1 text-gray-400 text-[10px]">↕</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {/* Income Section */}
                        <tr className="bg-gray-50 border-y border-gray-300">
                            <td colSpan={isMonthWise ? monthCols.length + 2 : 2} className="py-2 px-3 font-bold text-gray-900">
                                <span className="inline-block mr-1 text-[10px]">▼</span> Income
                            </td>
                        </tr>
                        {income.map((item) => (
                            <AccountRow key={item.id} item={item} />
                        ))}
                        <tr className="border-t border-b-2 border-gray-300 bg-white font-semibold">
                            <td className="py-2 px-3 pl-8 text-gray-900">Total Income</td>
                            {isMonthWise && monthCols.map(ym => (
                                <td key={ym} className="py-2 px-3 text-right tabular-nums text-gray-900"><Currency value={totalIncomeMonthly[ym] || 0} /></td>
                            ))}
                            <td className="py-2 px-3 text-right tabular-nums text-gray-900"><Currency value={totalIncome} /></td>
                        </tr>

                        {/* Cost of Goods Sold Section */}
                        <tr className="bg-gray-50 border-y border-gray-300">
                            <td colSpan={isMonthWise ? monthCols.length + 2 : 2} className="py-2 px-3 font-bold text-gray-900 mt-4">
                                <span className="inline-block mr-1 text-[10px]">▼</span> Cost of Goods Sold
                            </td>
                        </tr>
                        {cogs.map((item) => (
                            <AccountRow key={item.id} item={item} />
                        ))}
                        <tr className="border-t border-b border-gray-300 bg-white font-semibold">
                            <td className="py-2 px-3 pl-8 text-gray-900">Total Cost of Goods Sold</td>
                            {isMonthWise && monthCols.map(ym => (
                                <td key={ym} className="py-2 px-3 text-right tabular-nums text-gray-900"><Currency value={totalCogsMonthly[ym] || 0} /></td>
                            ))}
                            <td className="py-2 px-3 text-right tabular-nums text-gray-900"><Currency value={totalCogs} /></td>
                        </tr>

                        {/* Gross Profit */}
                        <tr className="border-b-2 border-gray-300 font-bold bg-white text-[13px]">
                            <td className="py-2.5 px-3 pl-8 text-gray-900">GROSS PROFIT</td>
                            {isMonthWise && monthCols.map(ym => (
                                <td key={ym} className="py-2.5 px-3 text-right tabular-nums text-gray-900"><Currency value={grossProfitMonthly[ym] || 0} /></td>
                            ))}
                            <td className="py-2.5 px-3 text-right tabular-nums text-gray-900"><Currency value={grossProfit} /></td>
                        </tr>

                        {/* Expense Section */}
                        <tr className="bg-gray-50 border-y border-gray-300">
                            <td colSpan={isMonthWise ? monthCols.length + 2 : 2} className="py-2 px-3 font-bold text-gray-900 mt-4">
                                <span className="inline-block mr-1 text-[10px]">▼</span> Expenses
                            </td>
                        </tr>
                        {expense.map((item) => (
                            <AccountRow key={item.id} item={item} />
                        ))}
                        <tr className="border-t border-b-2 border-gray-300 bg-white font-semibold">
                            <td className="py-2 px-3 pl-8 text-gray-900">Total Expenses</td>
                            {isMonthWise && monthCols.map(ym => (
                                <td key={ym} className="py-2 px-3 text-right tabular-nums text-gray-900"><Currency value={totalExpenseMonthly[ym] || 0} /></td>
                            ))}
                            <td className="py-2 px-3 text-right tabular-nums text-gray-900"><Currency value={totalExpense} /></td>
                        </tr>

                        {/* Net Income */}
                        <tr className="border-t-2 border-b-4 border-gray-400 font-bold bg-white text-[14px]">
                            <td className="py-3 px-3 text-gray-900">NET INCOME</td>
                            {isMonthWise && monthCols.map(ym => (
                                <td key={ym} className="py-3 px-3 text-right tabular-nums text-gray-900"><Currency value={netIncomeMonthly[ym] || 0} /></td>
                            ))}
                            <td className="py-3 px-3 text-right tabular-nums text-gray-900"><Currency value={netIncome} /></td>
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
