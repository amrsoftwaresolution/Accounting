import React, { useState } from 'react';
import ReportLayout from '@/Layouts/ReportLayout';
import { Head, router, Link } from '@inertiajs/react';
import CommonInput from '@/Components/CommonInput';
import { useDateFormat, formatDate } from '@/Utils/dateFormat';

export default function InventoryDetail({ item, lines, filters, auth }) {
    const dateFormat = useDateFormat();
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');
    const [datePreset, setDatePreset] = useState('custom');

    const handleRunReport = (start = startDate, end = endDate) => {
        router.get(route('reports.inventory-detail', item.id), { start_date: start, end_date: end }, {
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

    const handleExportExcel = () => {
        const companyName = auth.company?.company_name || 'GrowDigitec';
        
        let csvContent = "";
        csvContent += `"${companyName}"\n`;
        csvContent += `"Inventory Detail: ${item.name}"\n`;
        csvContent += `"Date Range: ${startDate ? formatDate(startDate, dateFormat) : 'All Time'} to ${endDate ? formatDate(endDate, dateFormat) : 'Present'}"\n\n`;

        // Headers
        csvContent += `"Date","Transaction Type","Ref #","Memo","Qty Change"\n`;

        lines.forEach(line => {
            csvContent += `"${formatDate(line.date, dateFormat)}","${line.transaction_type}","${line.reference || ''}","${line.memo || ''}",${line.qty_change}\n`;
        });

        // Create download blob
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `${companyName.replace(/[^a-z0-9]/gi, '_')}_Inventory_Detail_${item.name}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const filterElements = (
        <div className="flex items-end gap-4 flex-wrap">
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
                    <div className="w-[130px]">
                        <CommonInput
                            type="date"
                            label="From Date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            size="sm"
                        />
                    </div>
                    <div className="w-[130px]">
                        <CommonInput
                            type="date"
                            label="To Date"
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
            
            <div className="ml-auto">
                <Link 
                    href={route('reports.inventory-summary')}
                    className="flex items-center text-[12px] font-medium text-slate-500 hover:text-slate-800 pb-[1px]"
                >
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                    Back to Summary
                </Link>
            </div>
        </div>
    );

    return (
        <ReportLayout
            title={`Inventory Detail - ${item.name}`}
            filters={filterElements}
            onExportExcel={handleExportExcel}
        >
            <Head title={`Inventory Detail - ${item.name}`} />

            <div className="text-center mb-8 font-serif">
                <h2 className="text-xl font-bold text-gray-900">Inventory Transaction Detail</h2>
                <h3 className="text-sm text-gray-700 mt-1">{auth.company?.company_name}</h3>
                <h4 className="text-md font-semibold text-primary mt-2">{item.name} {item.sku ? `(SKU: ${item.sku})` : ''}</h4>
                <p className="text-[13px] text-gray-500 mt-1">
                    {startDate ? formatDate(startDate, dateFormat) : 'All Time'} 
                    {' '}to{' '} 
                    {endDate ? formatDate(endDate, dateFormat) : 'Present'}
                </p>
            </div>

            <div className="w-full overflow-x-auto pb-10">
                <table className="w-full text-[13px] text-left border-collapse">
                    <thead>
                        <tr className="border-y-2 border-gray-300">
                            <th className="py-2.5 px-3 font-semibold text-gray-900">Date</th>
                            <th className="py-2.5 px-3 font-semibold text-gray-900">Transaction Type</th>
                            <th className="py-2.5 px-3 font-semibold text-gray-900">Ref #</th>
                            <th className="py-2.5 px-3 font-semibold text-gray-900 w-1/3">Memo / Description</th>
                            <th className="py-2.5 px-3 font-semibold text-gray-900 text-right">Qty Change</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {lines.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="py-8 text-center text-gray-500">No inventory transactions found for this period.</td>
                            </tr>
                        ) : (
                            lines.map((line) => (
                                <tr key={line.id} className="hover:bg-gray-50 transition-colors group">
                                    <td className="py-2 px-3 text-gray-600 whitespace-nowrap">
                                        {formatDate(line.date, dateFormat)}
                                    </td>
                                    <td className="py-2 px-3 text-gray-900 capitalize">
                                        {line.transaction_type.replace('_', ' ')}
                                    </td>
                                    <td className="py-2 px-3 text-gray-600">
                                        {line.reference || '-'}
                                    </td>
                                    <td className="py-2 px-3 text-gray-600">
                                        {line.memo || '-'}
                                    </td>
                                    <td className="py-2 px-3 text-right tabular-nums font-medium">
                                        <span className={line.qty_change > 0 ? 'text-green-600' : (line.qty_change < 0 ? 'text-red-600' : 'text-gray-900')}>
                                            {line.qty_change > 0 ? '+' : ''}{line.qty_change}
                                        </span>
                                    </td>
                                </tr>
                            ))
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
