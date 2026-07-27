import React, { useState, useMemo } from 'react';
import ReportLayout from '@/Layouts/ReportLayout';
import { Head, Link, router } from '@inertiajs/react';
import ReportDateFilter from '@/Components/ReportDateFilter';
import { useDateFormat, formatDate } from '@/Utils/dateFormat';
import { getEditRoute } from '@/Utils/routeUtils';
export default function SalesByItem({ reportData, filters, auth }) {
    const dateFormat = useDateFormat();
    const [collapsedGroups, setCollapsedGroups] = useState(new Set());

    const toggleGroup = (id) => {
        setCollapsedGroups(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };



    const handleFilterChange = (newFilters) => {
        router.get(route('reports.sales-by-item'), {
            start_date: newFilters.start_date,
            end_date: newFilters.end_date,
            type: newFilters.type
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const items = reportData || [];
    const totalAmount = items.reduce((sum, group) => sum + parseFloat(group.item.total_amount || 0), 0);
    const totalQuantity = items.reduce((sum, group) => sum + parseFloat(group.item.total_qty || 0), 0);

    const homeCurrency = auth.company?.home_currency_prefix || auth.company?.home_currency || '';

    const Currency = ({ value }) => (
        <span className={value < 0 ? 'text-red-600' : 'text-slate-900'}>
            <span className="text-[10px] font-bold text-slate-400 mr-1">{homeCurrency}</span>
            {parseFloat(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
    );

    const formatQty = (val) => {
        if (val < 0) return <span className="text-red-600">-{Math.abs(val).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>;
        return <span>{Number(val).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>;
    };

    const handleExportExcel = () => {
        const companyName = auth.company?.company_name || 'Company';
        let csvContent = `"${companyName}"\n"Sales By Item Report"\n`;
        csvContent += `"Date Range: ${filters.start_date} to ${filters.end_date}"\n\n`;
        csvContent += `"Date","Transaction Type","Number","Customer","Item Name","Quantity Sold","Rate","Total Amount (${homeCurrency})"\n`;

        items.forEach(group => {
            group.lines.forEach(line => {
                csvContent += `"${line.date}","${line.transaction_type}","${line.reference}","${line.contact_name}","${group.item.name}",${line.qty},${line.rate},${line.amount}\n`;
            });
            csvContent += `"","","","","Total for ${group.item.name}",${group.item.total_qty},"","${group.item.total_amount}"\n\n`;
        });
        csvContent += `"","","","","Grand Total",${totalQuantity},"","${totalAmount}"\n`;

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `Sales_By_Item.csv`);
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
            title="Sales By Item"
            filters={filterElements}
            onExportExcel={handleExportExcel}
        >
            <Head title="Sales By Item" />

            <div className="text-center mb-8 font-serif">
                <h2 className="text-xl font-bold text-gray-900">Sales By Item</h2>
                <h3 className="text-sm text-gray-700 mt-1">{auth.company?.company_name}</h3>
                <p className="text-[13px] text-gray-500 mt-1">
                    {filters.start_date ? formatDate(filters.start_date, dateFormat) : 'Beginning'} - {formatDate(filters.end_date, dateFormat)}
                </p>
            </div>

            <div className="w-full overflow-x-auto pb-10">
                <table className="w-full text-[13px] text-left border-collapse table-fixed">
                    <thead>
                        <tr className="border-y-2 border-gray-300">
                            <th className="py-2.5 px-3 font-semibold text-gray-900 w-[12%]">Date</th>
                            <th className="py-2.5 px-3 font-semibold text-gray-900 w-[15%]">Transaction Type</th>
                            <th className="py-2.5 px-3 font-semibold text-gray-900 w-[10%]">Number</th>
                            <th className="py-2.5 px-3 font-semibold text-gray-900 w-[23%]">Customer</th>
                            <th className="py-2.5 px-3 font-semibold text-gray-900 text-right w-[10%]">Qty</th>
                            <th className="py-2.5 px-3 font-semibold text-gray-900 text-right w-[15%]">Rate</th>
                            <th className="py-2.5 px-3 font-semibold text-gray-900 text-right w-[15%]">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {items.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="py-8 text-center text-gray-500">
                                    No records found for this period.
                                </td>
                            </tr>
                        ) : (
                            items.map((group) => {
                                const displayName = group.item.name;
                                const isCollapsed = collapsedGroups.has(group.item.id);
                                return (
                                    <React.Fragment key={group.item.id}>
                                        {/* Group Header Row */}
                                        <tr
                                            className="bg-slate-50/50 hover:bg-slate-100 cursor-pointer transition-colors"
                                            onClick={() => toggleGroup(group.item.id)}
                                        >
                                            <td colSpan="7" className="py-2 px-3 font-bold text-gray-800">
                                                <div className="flex items-center gap-2 whitespace-nowrap">
                                                    <svg
                                                        className={`w-4 h-4 text-gray-500 transition-transform flex-shrink-0 ${isCollapsed ? '' : 'rotate-90'}`}
                                                        fill="none" viewBox="0 0 24 24" stroke="currentColor"
                                                    >
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                                    </svg>
                                                    <span className="truncate">{displayName}</span>
                                                    {group.item.sku && <span className="text-gray-500 font-normal text-xs ml-2">SKU: {group.item.sku}</span>}
                                                </div>
                                            </td>
                                        </tr>

                                        {/* Transaction Lines */}
                                        {!isCollapsed && group.lines.map((tx) => (
                                            <tr key={tx.id} className="hover:bg-slate-50 transition-colors bg-white">
                                                <td className="py-2 px-3 text-gray-600 pl-10">
                                                    {tx.date}
                                                </td>
                                                <td className="py-2 px-3 text-gray-600 capitalize truncate">
                                                    {tx.transaction_type}
                                                </td>
                                                <td className="py-2 px-3 text-gray-600">
                                                    {tx.reference || '-'}
                                                </td>
                                                <td className="py-2 px-3 text-gray-600 truncate" title={tx.contact_name}>
                                                    {tx.contact_name || '-'}
                                                </td>
                                                <td className="py-2 px-3 text-right tabular-nums text-gray-900">
                                                    {formatQty(tx.qty)}
                                                </td>
                                                <td className="py-2 px-3 text-right tabular-nums text-gray-600">
                                                    {tx.rate ? <Currency value={tx.rate} /> : '-'}
                                                </td>
                                                <td className="py-2 px-3 text-right tabular-nums font-medium text-gray-900">
                                                    <Link href={route(getEditRoute(tx.transaction_type), tx.journal_entry_id)} className="text-indigo-600 hover:text-indigo-900 hover:underline">
                                                        <Currency value={tx.amount} />
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}

                                        {/* Group Footer Total */}
                                        {!isCollapsed && group.lines.length > 0 && (
                                            <tr className="border-t border-gray-100 bg-white">
                                                <td colSpan="4" className="py-2 px-3 font-semibold text-gray-700 pl-10 text-right">
                                                    Total for {displayName}
                                                </td>
                                                <td className="py-2 px-3 text-right font-semibold text-gray-900 tabular-nums">
                                                    {formatQty(group.item.total_qty)}
                                                </td>
                                                <td className="py-2 px-3"></td>
                                                <td className="py-2 px-3 text-right font-semibold text-gray-900 tabular-nums">
                                                    <Currency value={group.item.total_amount} />
                                                </td>
                                            </tr>
                                        )}

                                        <tr className="h-4"></tr>
                                    </React.Fragment>
                                );
                            })
                        )}

                        {/* Grand Total Footer Row */}
                        {items.length > 0 && (
                            <tr className="border-t-2 border-gray-300">
                                <td colSpan="4" className="py-3 px-3 font-bold text-gray-900 text-lg uppercase text-right">
                                    Grand Total
                                </td>
                                <td className="py-3 px-3 text-right font-bold text-gray-900 text-lg tabular-nums">
                                    {formatQty(totalQuantity)}
                                </td>
                                <td className="py-3 px-3"></td>
                                <td className="py-3 px-3 text-right font-bold text-gray-900 text-lg tabular-nums">
                                    <Currency value={totalAmount} />
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </ReportLayout>
    );
}
