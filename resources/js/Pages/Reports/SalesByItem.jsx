import React from 'react';
import ReportLayout from '@/Layouts/ReportLayout';
import { Head, router } from '@inertiajs/react';
import ReportDateFilter from '@/Components/ReportDateFilter';
import { useDateFormat, formatDate } from '@/Utils/dateFormat';

export default function SalesByItem({ reportData, filters, auth }) {
    const dateFormat = useDateFormat();

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
    const totalAmount = items.reduce((sum, item) => sum + parseFloat(item.total_amount), 0);
    const totalQuantity = items.reduce((sum, item) => sum + parseFloat(item.total_quantity), 0);

    const homeCurrency = auth.company?.home_currency_prefix || auth.company?.home_currency || '';

    const Currency = ({ value }) => (
        <span className={value < 0 ? 'text-red-600' : 'text-slate-900'}>
            <span className="text-[10px] font-bold text-slate-400 mr-1">{homeCurrency}</span>
            {parseFloat(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
    );

    const handleExportExcel = () => {
        const companyName = auth.company?.company_name || 'Company';
        let csvContent = `"${companyName}"\n"Sales By Item Report"\n`;
        csvContent += `"Date Range: ${filters.start_date} to ${filters.end_date}"\n\n`;
        csvContent += `"Item Name","Quantity Sold","Total Amount (${homeCurrency})"\n`;

        items.forEach(item => {
            csvContent += `"${item.item_name}",${item.total_quantity},${item.total_amount}\n`;
        });
        csvContent += `\n"Total",${totalQuantity},${totalAmount}\n`;

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
                <table className="w-full text-[13px] text-left border-collapse">
                    <thead>
                        <tr className="border-y-2 border-gray-300">
                            <th className="py-2.5 px-3 font-semibold text-gray-900">Item Name</th>
                            <th className="py-2.5 px-3 font-semibold text-gray-900 text-right">Quantity Sold</th>
                            <th className="py-2.5 px-3 font-semibold text-gray-900 text-right">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {items.length === 0 ? (
                            <tr>
                                <td colSpan="3" className="py-8 text-center text-gray-500">No sales found for this period.</td>
                            </tr>
                        ) : (
                            items.map((item, index) => (
                                <tr key={index} className="hover:bg-gray-50 transition-colors group">
                                    <td className="py-2 px-3 text-gray-900">{item.item_name}</td>
                                    <td className="py-2 px-3 text-right tabular-nums">{parseFloat(item.total_quantity).toLocaleString()}</td>
                                    <td className="py-2 px-3 text-right tabular-nums"><Currency value={item.total_amount} /></td>
                                </tr>
                            ))
                        )}
                        <tr className="border-t-2 border-b-2 border-gray-400 font-bold bg-white">
                            <td className="py-2.5 px-3 text-gray-900">TOTAL</td>
                            <td className="py-2.5 px-3 text-right tabular-nums text-gray-900">{parseFloat(totalQuantity).toLocaleString()}</td>
                            <td className="py-2.5 px-3 text-right tabular-nums text-gray-900"><Currency value={totalAmount} /></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </ReportLayout>
    );
}
