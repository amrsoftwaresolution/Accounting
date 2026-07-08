import React, { useState } from 'react';
import ReportLayout from '@/Layouts/ReportLayout';
import { Head, router, Link } from '@inertiajs/react';
import CommonInput from '@/Components/CommonInput';
import { useDateFormat, formatDate } from '@/Utils/dateFormat';

export default function InventorySummary({ reportData, auth }) {
    const dateFormat = useDateFormat();
    const items = reportData || [];
    
    const totalAssetValue = items.reduce((sum, item) => sum + item.asset_value, 0);

    const homeCurrency = auth.company?.home_currency_prefix || auth.company?.home_currency || 'LKR';

    const Currency = ({ value }) => (
        <span className={value < 0 ? 'text-red-600' : 'text-slate-900'}>
            <span className="text-[10px] font-bold text-slate-400 mr-1">{homeCurrency}</span>
            {value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
    );

    const handleExportExcel = () => {
        const companyName = auth.company?.company_name || 'GrowDigitec';
        
        let csvContent = "";
        // Add Title Header
        csvContent += `"${companyName}"\n`;
        csvContent += `"Inventory Summary Report"\n`;
        csvContent += `"As of ${formatDate(new Date(), dateFormat)}"\n\n`;

        // Headers
        csvContent += `"Item Name","SKU","Qty on Hand","Avg Cost (${homeCurrency})","Asset Value (${homeCurrency})"\n`;

        // Items
        items.forEach(item => {
            csvContent += `"${item.name}","${item.sku || ''}",${item.qty_on_hand},${item.avg_cost},${item.asset_value}\n`;
        });

        // Total
        csvContent += `\n"Total",,,,${totalAssetValue}\n`;

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
            onExportExcel={handleExportExcel}
        >
            <Head title="Inventory Summary Report" />

            <div className="text-center mb-8 font-serif">
                <h2 className="text-xl font-bold text-gray-900">Inventory Summary Report</h2>
                <h3 className="text-sm text-gray-700 mt-1">{auth.company?.company_name}</h3>
                <p className="text-[13px] text-gray-500 mt-1">
                    As of {formatDate(new Date(), dateFormat)}
                </p>
            </div>

            <div className="w-full overflow-x-auto pb-10">
                <table className="w-full text-[13px] text-left border-collapse">
                    <thead>
                        <tr className="border-y-2 border-gray-300">
                            <th className="py-2.5 px-3 font-semibold text-gray-900 w-1/2">
                                Item / Product <span className="inline-block ml-1 text-gray-400 text-[10px]">▲</span>
                            </th>
                            <th className="py-2.5 px-3 font-semibold text-gray-900 text-right">
                                SKU
                            </th>
                            <th className="py-2.5 px-3 font-semibold text-gray-900 text-right">
                                Qty on Hand
                            </th>
                            <th className="py-2.5 px-3 font-semibold text-gray-900 text-right">
                                Avg Cost
                            </th>
                            <th className="py-2.5 px-3 font-semibold text-gray-900 text-right">
                                Asset Value
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {items.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="py-8 text-center text-gray-500">No inventory items found.</td>
                            </tr>
                        ) : (
                            items.map((item, index) => (
                                <tr key={index} className="hover:bg-gray-50 transition-colors group">
                                    <td className="py-2 px-3 text-gray-900 font-medium">
                                        <Link href={route('reports.inventory-detail', item.id)} className="hover:underline cursor-pointer decoration-slate-400 underline-offset-4 text-primary">
                                            {item.name}
                                        </Link>
                                    </td>
                                    <td className="py-2 px-3 text-right text-gray-500 text-xs">
                                        {item.sku || '-'}
                                    </td>
                                    <td className="py-2 px-3 text-right tabular-nums text-gray-900 font-semibold">
                                        {item.qty_on_hand}
                                    </td>
                                    <td className="py-2 px-3 text-right tabular-nums">
                                        <Currency value={item.avg_cost} />
                                    </td>
                                    <td className="py-2 px-3 text-right tabular-nums font-semibold">
                                        <Currency value={item.asset_value} />
                                    </td>
                                </tr>
                            ))
                        )}
                        <tr className="border-t-2 border-b-2 border-gray-400 font-bold bg-white">
                            <td className="py-2.5 px-3 text-gray-900" colSpan="4">TOTAL ASSET VALUE</td>
                            <td className="py-2.5 px-3 text-right tabular-nums text-gray-900">
                                <Currency value={totalAssetValue} />
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
