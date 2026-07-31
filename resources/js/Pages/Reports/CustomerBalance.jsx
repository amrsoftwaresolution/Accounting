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
            type: newFilters.type 
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

        // Headers
        csvContent += `"Customer Name","Email","Phone","Balance (${homeCurrency})"\n`;

        // Customers
        customers.forEach(item => {
            csvContent += `"${item.name}","${item.email || ''}","${item.phone || ''}",${item.balance}\n`;
        });

        // Total
        csvContent += `\n"Total",,,${totalBalance}\n`;

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
        <ReportDateFilter 
            currentFilter={{ start_date: filters.start_date, end_date: filters.end_date, type: filters.type }}
            onFilterChange={handleFilterChange}
        />
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
                <table className="w-full text-[13px] text-left border-collapse">
                    <thead>
                        <tr className="border-y-2 border-gray-300">
                            <th className="py-2.5 px-3 font-semibold text-gray-900 w-3/4">
                                Customer <span className="inline-block ml-1 text-gray-400 text-[10px]">▲</span>
                            </th>
                            <th className="py-2.5 px-3 font-semibold text-gray-900 text-right">
                                Open Balance <span className="inline-block ml-1 text-gray-400 text-[10px]">↕</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {customers.length === 0 ? (
                            <tr>
                                <td colSpan="2" className="py-8 text-center text-gray-500">No customer balances found.</td>
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
                                    <td className="py-2 px-3 text-right tabular-nums">
                                        <Link href={route('reports.customer-detail', item.id) + '?end_date=' + filters.end_date} className="hover:underline cursor-pointer decoration-slate-400 underline-offset-4">
                                            <Currency value={item.balance} />
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        )}
                        <tr className="border-t-2 border-b-2 border-gray-400 font-bold bg-white">
                            <td className="py-2.5 px-3 text-gray-900">TOTAL</td>
                            <td className="py-2.5 px-3 text-right tabular-nums text-gray-900">
                                <Currency value={totalBalance} />
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div className="mt-20 text-[10px] text-slate-400 font-bold text-center uppercase tracking-widest italic">
                Generated on {formatDate(new Date(), dateFormat)}
            </div>
        </ReportLayout>
    );
}
