import React, { useState } from 'react';
import ReportLayout from '@/Layouts/ReportLayout';
import { Head, router, Link } from '@inertiajs/react';
import CommonInput from '@/Components/CommonInput';
import { useDateFormat, formatDate } from '@/Utils/dateFormat';
import ReportDateFilter from '@/Components/ReportDateFilter';

export default function CustomerBalance({ reportData, filters, auth }) {
    const dateFormat = useDateFormat();

    const handleFilterChange = (newFilters) => {
        router.get(route('reports.customer-balance'), { 
            start_date: newFilters.start_date, 
            end_date: newFilters.end_date,
            type: newFilters.type,
            display_by: filters.display_by
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const displayBy = filters.display_by || 'total';
    const isMonthWise = displayBy === 'month';
    const monthCols = filters.months || [];

    const toggleDisplayBy = () => {
        const newDisplayBy = displayBy === 'month' ? 'total' : 'month';
        router.get(route('reports.customer-balance'), {
            ...filters,
            display_by: newDisplayBy,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const customers = reportData || [];
    const totalBalance = customers.reduce((sum, item) => sum + item.balance, 0);

    const homeCurrency = auth.company?.home_currency_prefix || auth.company?.home_currency || '';

    const Currency = ({ value }) => (
        <span className={value < 0 ? 'text-red-600' : 'text-slate-900'}>
            <span className="text-[10px] font-bold text-slate-400 mr-1">{homeCurrency}</span>
            {value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
    );

    const handleExportExcel = () => {
        const companyName = auth.company?.company_name || 'Company';
        const endDate = filters.end_date;

        let csvContent = "";

        // Add Title Header
        csvContent += `"${companyName}"\n`;
        csvContent += `"Customer Report"\n`;
        csvContent += `"As of ${formatDate(endDate, dateFormat)}"\n\n`;

        if (isMonthWise) {
            csvContent += `"Customer Name","Email","Phone",`;
            monthCols.forEach(m => {
                csvContent += `"${m} Balance",`;
            });
            csvContent += `"Final Balance (${homeCurrency})"\n`;

            customers.forEach(item => {
                csvContent += `"${item.name}","${item.email || ''}","${item.phone || ''}",`;
                monthCols.forEach(m => {
                    const mData = item.monthly_balances?.[m] || 0;
                    csvContent += `${mData},`;
                });
                csvContent += `${item.balance}\n`;
            });

            csvContent += `\n"Total",,,`;
            monthCols.forEach(m => {
                const mTotalAmt = customers.reduce((sum, item) => sum + (item.monthly_balances?.[m] || 0), 0);
                csvContent += `${mTotalAmt},`;
            });
            csvContent += `${totalBalance}\n`;
        } else {
            // Headers
            csvContent += `"Customer Name","Email","Phone","Balance (${homeCurrency})"\n`;

            // Customers
            customers.forEach(item => {
                csvContent += `"${item.name}","${item.email || ''}","${item.phone || ''}",${item.balance}\n`;
            });

            // Total
            csvContent += `\n"Total",,,${totalBalance}\n`;
        }

        // Create download blob
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `${companyName.replace(/[^a-z0-9]/gi, '_')}_Customer_Balance_As_Of_${endDate}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const filterElements = (
        <div className="flex flex-row flex-wrap items-end gap-3">
            <ReportDateFilter 
                currentFilter={{ start_date: filters.start_date, end_date: filters.end_date, type: filters.type }}
                onFilterChange={handleFilterChange}
            />
            <button
                onClick={toggleDisplayBy}
                className="flex items-center gap-1.5 hover:text-gray-900 transition-colors h-[30px] px-3 border border-slate-300 rounded-sm text-xs text-slate-700 bg-white shadow-sm hover:bg-slate-50 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 mb-[1px]"
            >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                {displayBy === 'month' ? 'View Totals' : 'View by Month'}
            </button>
        </div>
    );

    return (
        <ReportLayout
            title="Customer Report"
            filters={filterElements}
            onExportExcel={handleExportExcel}
        >
            <Head title="Customer Report" />

            <div className="text-center mb-8 font-serif">
                <h2 className="text-xl font-bold text-gray-900">Customer Balance Summary</h2>
                <h3 className="text-sm text-gray-700 mt-1">{auth.company?.company_name}</h3>
                <p className="text-[13px] text-gray-500 mt-1">
                    As of {formatDate(filters.end_date, dateFormat)}
                </p>
            </div>

            <div className="w-full overflow-x-auto pb-10">
                <table className="w-full text-[13px] text-left border-collapse table-fixed min-w-max">
                    <thead>
                        <tr className="border-y-2 border-gray-300">
                            <th className="py-2.5 px-3 font-semibold text-gray-900 w-64">
                                Customer <span className="inline-block ml-1 text-gray-400 text-[10px]">▲</span>
                            </th>
                            {isMonthWise ? (
                                <>
                                    {monthCols.map(m => {
                                        const d = new Date(m + '-01');
                                        return (
                                            <th key={m} className="py-2.5 px-3 font-semibold text-gray-900 text-right whitespace-nowrap min-w-[100px]">
                                                {d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                            </th>
                                        );
                                    })}
                                    <th className="py-2.5 px-3 font-semibold text-gray-900 text-right w-32 border-l border-gray-100">Final Balance</th>
                                </>
                            ) : (
                                <th className="py-2.5 px-3 font-semibold text-gray-900 text-right">
                                    Open Balance <span className="inline-block ml-1 text-gray-400 text-[10px]">↕</span>
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {customers.length === 0 ? (
                            <tr>
                                <td colSpan={isMonthWise ? monthCols.length + 2 : 2} className="py-8 text-center text-gray-500">No customer balances found.</td>
                            </tr>
                        ) : (
                            customers.map((item, index) => (
                                <tr key={index} className="hover:bg-gray-50 transition-colors group">
                                    <td className="py-2 px-3 text-gray-900">
                                        {item.name}
                                        {(item.email || item.phone) && (
                                            <span className="block text-[11px] text-gray-400 mt-0.5">
                                                {item.email} {item.email && item.phone && '|'} {item.phone}
                                            </span>
                                        )}
                                    </td>
                                    {isMonthWise ? (
                                        <>
                                            {monthCols.map(m => {
                                                const mData = item.monthly_balances?.[m] || 0;
                                                return (
                                                    <td key={m} className="py-2 px-3 text-right tabular-nums">
                                                        <Currency value={mData} />
                                                    </td>
                                                );
                                            })}
                                            <td className="py-2 px-3 text-right tabular-nums font-bold border-l border-gray-100">
                                                <Link href={route('reports.customer-detail', item.id) + '?end_date=' + filters.end_date} className="hover:underline cursor-pointer decoration-slate-400 underline-offset-4">
                                                    <Currency value={item.balance} />
                                                </Link>
                                            </td>
                                        </>
                                    ) : (
                                        <td className="py-2 px-3 text-right tabular-nums">
                                            <Link href={route('reports.customer-detail', item.id) + '?end_date=' + filters.end_date} className="hover:underline cursor-pointer decoration-slate-400 underline-offset-4">
                                                <Currency value={item.balance} />
                                            </Link>
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                        {isMonthWise ? (
                            <tr className="border-t-2 border-b-2 border-gray-400 font-bold bg-white">
                                <td className="py-3 px-3 text-gray-900 uppercase">TOTAL</td>
                                {monthCols.map(m => {
                                    const mTotalAmt = customers.reduce((sum, item) => sum + (item.monthly_balances?.[m] || 0), 0);
                                    return (
                                        <td key={m} className="py-3 px-3 text-right tabular-nums text-gray-900">
                                            <Currency value={mTotalAmt} />
                                        </td>
                                    );
                                })}
                                <td className="py-3 px-3 text-right tabular-nums text-gray-900 border-l border-gray-200">
                                    <Currency value={totalBalance} />
                                </td>
                            </tr>
                        ) : (
                            <tr className="border-t-2 border-b-2 border-gray-400 font-bold bg-white">
                                <td className="py-2.5 px-3 text-gray-900">TOTAL</td>
                                <td className="py-2.5 px-3 text-right tabular-nums text-gray-900">
                                    <Currency value={totalBalance} />
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="mt-20 text-[10px] text-slate-400 font-bold text-center uppercase tracking-widest italic">
                Generated on {formatDate(new Date(), dateFormat)}
            </div>
        </ReportLayout>
    );
}
