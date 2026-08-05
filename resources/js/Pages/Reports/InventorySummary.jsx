import React, { useState } from 'react';
import ReportLayout from '@/Layouts/ReportLayout';
import { Head, router, Link } from '@inertiajs/react';
import { useDateFormat, formatDate } from '@/Utils/dateFormat';
import ReportDateFilter from '@/Components/ReportDateFilter';

export default function InventorySummary({ reportData, filters = {}, auth }) {
    const dateFormat = useDateFormat();
    const groups = reportData || [];
    
    const displayBy = filters.display_by || 'total';
    const isMonthWise = displayBy === 'month';
    const monthCols = filters.months || [];

    const totalAssetValue = groups.reduce((sum, group) => {
        return sum + group.items.reduce((itemSum, item) => itemSum + item.asset_value, 0);
    }, 0);

    const [collapsedGroups, setCollapsedGroups] = useState(new Set());

    const toggleGroup = (categoryName) => {
        setCollapsedGroups(prev => {
            const next = new Set(prev);
            if (next.has(categoryName)) {
                next.delete(categoryName);
            } else {
                next.add(categoryName);
            }
            return next;
        });
    };

    const handleFilterChange = (newFilters) => {
        router.get(route('reports.inventory-summary'), { 
            start_date: newFilters.start_date, 
            end_date: newFilters.end_date,
            type: newFilters.type,
            display_by: filters.display_by
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const toggleDisplayBy = () => {
        const newDisplayBy = displayBy === 'month' ? 'total' : 'month';
        router.get(route('reports.inventory-summary'), {
            ...filters,
            display_by: newDisplayBy,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
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

    const homeCurrency = auth.company?.home_currency_prefix || auth.company?.home_currency || '';

    const Currency = ({ value }) => (
        <span className={value < 0 ? 'text-red-600' : 'text-slate-900'}>
            <span className="text-[10px] font-bold text-slate-400 mr-1">{homeCurrency}</span>
            {value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
    );

    const handleExportExcel = () => {
        const companyName = auth.company?.company_name || 'Company';
        
        let csvContent = "";
        // Add Title Header
        csvContent += `"${companyName}"\n`;
        csvContent += `"Inventory Summary Report"\n`;
        csvContent += `"As of ${formatDate(new Date(), dateFormat)}"\n\n`;

        if (isMonthWise) {
            csvContent += `"Category","Item Name","SKU",`;
            monthCols.forEach(m => {
                csvContent += `"${m} Value (${homeCurrency})",`;
            });
            csvContent += `"Final Qty on Hand","Avg Cost (${homeCurrency})","Final Asset Value (${homeCurrency})"\n`;

            groups.forEach(group => {
                group.items.forEach(item => {
                    csvContent += `"${group.category}","${item.name}","${item.sku || ''}",`;
                    monthCols.forEach(m => {
                        const mVal = item.monthly_balances?.[m] || 0;
                        csvContent += `${mVal},`;
                    });
                    csvContent += `${item.qty_on_hand},${item.avg_cost},${item.asset_value}\n`;
                });
            });

            csvContent += `\n"Total",,,`;
            monthCols.forEach(m => {
                const mTotal = groups.reduce((sum, g) => sum + g.items.reduce((itemSum, item) => itemSum + (item.monthly_balances?.[m] || 0), 0), 0);
                csvContent += `${mTotal},`;
            });
            csvContent += `,,${totalAssetValue}\n`;
        } else {
            // Headers
            csvContent += `"Category","Item Name","SKU","Qty on Hand","Avg Cost (${homeCurrency})","Asset Value (${homeCurrency})"\n`;

            // Items
            groups.forEach(group => {
                group.items.forEach(item => {
                    csvContent += `"${group.category}","${item.name}","${item.sku || ''}",${item.qty_on_hand},${item.avg_cost},${item.asset_value}\n`;
                });
            });

            // Total
            csvContent += `\n"Total",,,,,${totalAssetValue}\n`;
        }

        // Create download blob
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `${companyName.replace(/[^a-z0-9]/gi, '_')}_Inventory_Summary.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <ReportLayout
            title="Inventory Summary"
            filters={filterElements}
            onExportExcel={handleExportExcel}
        >
            <Head title="Inventory Summary Report" />

            <div className="text-center mb-8 font-serif">
                <h2 className="text-xl font-bold text-gray-900">Inventory Summary Report</h2>
                <h3 className="text-sm text-gray-700 mt-1">{auth.company?.company_name}</h3>
                <p className="text-[13px] text-gray-500 mt-1">
                    {filters.end_date ? `As of ${formatDate(filters.end_date, dateFormat)}` : `As of ${formatDate(new Date(), dateFormat)}`}
                </p>
            </div>

            <div className="w-full overflow-x-auto pb-10">
                <table className="w-full text-[13px] text-left border-collapse table-fixed min-w-max">
                    <thead>
                        <tr className="border-y-2 border-gray-300">
                            <th className="py-2.5 px-3 font-semibold text-gray-900 w-64">
                                Product / Service
                            </th>
                            <th className="py-2.5 px-3 font-semibold text-gray-900 text-right w-32">
                                SKU
                            </th>
                            {isMonthWise ? (
                                <>
                                    {monthCols.map(m => {
                                        const d = new Date(m + '-01');
                                        return (
                                            <th key={m} className="py-2.5 px-6 font-semibold text-gray-900 text-right whitespace-nowrap min-w-[120px]">
                                                {d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                            </th>
                                        );
                                    })}
                                    <th className="py-2.5 px-3 font-semibold text-gray-900 text-right w-32 border-l border-gray-100">
                                        Qty on Hand
                                    </th>
                                    <th className="py-2.5 px-3 font-semibold text-gray-900 text-right w-32">
                                        Avg Cost
                                    </th>
                                    <th className="py-2.5 px-3 font-semibold text-gray-900 text-right w-32">
                                        Final Value
                                    </th>
                                </>
                            ) : (
                                <>
                                    <th className="py-2.5 px-3 font-semibold text-gray-900 text-right w-[15%]">
                                        Qty on Hand
                                    </th>
                                    <th className="py-2.5 px-3 font-semibold text-gray-900 text-right w-[15%]">
                                        Calculated Average
                                    </th>
                                    <th className="py-2.5 px-3 font-semibold text-gray-900 text-right w-[15%]">
                                        Asset Value
                                    </th>
                                </>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {groups.length === 0 ? (
                            <tr>
                                <td colSpan={isMonthWise ? monthCols.length + 5 : 5} className="py-8 text-center text-gray-500">No inventory items found.</td>
                            </tr>
                        ) : (
                            groups.map((group, groupIdx) => {
                                const isCollapsed = collapsedGroups.has(group.category);
                                const categoryTotal = group.items.reduce((sum, item) => sum + item.asset_value, 0);

                                return (
                                    <React.Fragment key={groupIdx}>
                                        {/* Group Header Row */}
                                        <tr 
                                            className="bg-slate-50/50 hover:bg-slate-100 cursor-pointer transition-colors"
                                            onClick={() => toggleGroup(group.category)}
                                        >
                                            <td colSpan={isMonthWise ? monthCols.length + 5 : 5} className="py-2 px-3 font-bold text-gray-800">
                                                <div className="flex items-center gap-2 whitespace-nowrap">
                                                    <svg 
                                                        className={`w-4 h-4 text-gray-500 transition-transform flex-shrink-0 ${isCollapsed ? '' : 'rotate-90'}`} 
                                                        fill="none" viewBox="0 0 24 24" stroke="currentColor"
                                                    >
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                                    </svg>
                                                    <span className="truncate">{group.category}</span>
                                                </div>
                                            </td>
                                        </tr>

                                        {/* Transaction Lines */}
                                        {!isCollapsed && group.items.map((item, index) => (
                                            <tr key={index} className="hover:bg-gray-50 transition-colors bg-white">
                                                <td className="py-2 px-3 text-gray-900 font-medium pl-10">
                                                    <Link href={route('reports.inventory-detail', item.id)} className="hover:underline cursor-pointer decoration-slate-400 underline-offset-4 text-primary">
                                                        {item.name}
                                                    </Link>
                                                </td>
                                                <td className="py-2 px-3 text-right text-gray-500 text-xs">
                                                    {item.sku || '-'}
                                                </td>
                                                {isMonthWise ? (
                                                    <>
                                                        {monthCols.map(m => {
                                                            const mVal = item.monthly_balances?.[m] || 0;
                                                            return (
                                                                <td key={m} className="py-2 px-6 text-right tabular-nums">
                                                                    <Currency value={mVal} />
                                                                </td>
                                                            );
                                                        })}
                                                        <td className="py-2 px-3 text-right tabular-nums text-gray-900 font-semibold border-l border-gray-100">
                                                            {item.qty_on_hand}
                                                        </td>
                                                        <td className="py-2 px-3 text-right tabular-nums">
                                                            <Currency value={item.avg_cost} />
                                                        </td>
                                                        <td className="py-2 px-3 text-right tabular-nums font-semibold">
                                                            <Currency value={item.asset_value} />
                                                        </td>
                                                    </>
                                                ) : (
                                                    <>
                                                        <td className="py-2 px-3 text-right tabular-nums text-gray-900 font-semibold">
                                                            {item.qty_on_hand}
                                                        </td>
                                                        <td className="py-2 px-3 text-right tabular-nums">
                                                            <Currency value={item.avg_cost} />
                                                        </td>
                                                        <td className="py-2 px-3 text-right tabular-nums font-semibold">
                                                            <Currency value={item.asset_value} />
                                                        </td>
                                                    </>
                                                )}
                                            </tr>
                                        ))}

                                        {/* Group Footer Total (only show if expanded and has lines) */}
                                        {!isCollapsed && group.items.length > 0 && (
                                            <tr className="border-t border-gray-100 bg-white">
                                                <td colSpan={isMonthWise ? monthCols.length + 4 : 4} className="py-2 px-3 font-semibold text-gray-700 pl-10 text-right">
                                                    Total for {group.category}
                                                </td>
                                                <td className="py-2 px-3 text-right font-semibold text-gray-900 tabular-nums">
                                                    <Currency value={categoryTotal} />
                                                </td>
                                            </tr>
                                        )}
                                        
                                        {/* Spacing row for cleaner look between groups */}
                                        <tr className="h-4"></tr>
                                    </React.Fragment>
                                );
                            })
                        )}
                        {isMonthWise ? (
                            <tr className="border-t-2 border-gray-400 font-bold bg-white">
                                <td className="py-3 px-3 text-gray-900 uppercase tracking-wide text-right" colSpan="2">Total Asset Value</td>
                                {monthCols.map(m => {
                                    const mTotal = groups.reduce((sum, g) => sum + g.items.reduce((itemSum, item) => itemSum + (item.monthly_balances?.[m] || 0), 0), 0);
                                    return (
                                        <td key={m} className="py-3 px-3 text-right tabular-nums text-gray-900">
                                            <Currency value={mTotal} />
                                        </td>
                                    );
                                })}
                                <td className="py-3 px-3 text-right tabular-nums text-gray-900" colSpan="2"></td>
                                <td className="py-3 px-3 text-right tabular-nums text-gray-900 text-lg">
                                    <Currency value={totalAssetValue} />
                                </td>
                            </tr>
                        ) : (
                            <tr className="border-t-2 border-gray-400 font-bold bg-white">
                                <td className="py-3 px-3 text-gray-900 uppercase tracking-wide" colSpan="4">Total Asset Value</td>
                                <td className="py-3 px-3 text-right tabular-nums text-gray-900 text-lg">
                                    <Currency value={totalAssetValue} />
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
