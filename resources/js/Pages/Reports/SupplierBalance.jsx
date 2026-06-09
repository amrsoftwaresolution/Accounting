import React, { useState } from 'react';
import ReportLayout from '@/Layouts/ReportLayout';
import { Head, router, Link } from '@inertiajs/react';
import CommonInput from '@/Components/CommonInput';

export default function SupplierBalance({ reportData, filters, auth }) {
    const [endDate, setEndDate] = useState(filters.end_date || '');
    const [datePreset, setDatePreset] = useState('custom');

    const handleRunReport = (overrideEnd) => {
        const e = overrideEnd !== undefined ? overrideEnd : endDate;
        router.get(route('reports.supplier-balance'), { end_date: e }, {
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

    const suppliers = reportData || [];
    const totalBalance = suppliers.reduce((sum, item) => sum + item.balance, 0);

    const homeCurrency = auth.company?.home_currency_prefix || auth.company?.home_currency || 'LKR';

    const Currency = ({ value }) => (
        <span className={value < 0 ? 'text-red-600' : 'text-slate-900'}>
            <span className="text-[10px] font-bold text-slate-400 mr-1">{homeCurrency}</span>
            {value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
    );

    const handleExportExcel = () => {
        const companyName = auth.company?.company_name || 'GrowDigitec';
        const endDate = filters.end_date;
        
        let csvContent = "";
        
        // Add Title Header
        csvContent += `"${companyName}"\n`;
        csvContent += `"Supplier Report"\n`;
        csvContent += `"As of ${new Date(endDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}"\n\n`;
        
        // Headers
        csvContent += `"Supplier Name","Email","Phone","Balance (${homeCurrency})"\n`;
        
        // Suppliers
        suppliers.forEach(item => {
            csvContent += `"${item.name}","${item.email || ''}","${item.phone || ''}",${item.balance}\n`;
        });
        
        // Total
        csvContent += `\n"Total",,,${totalBalance}\n`;
        
        // Create download blob
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `${companyName.replace(/[^a-z0-9]/gi, '_')}_Supplier_Report_As_Of_${endDate}.csv`);
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
                    <option value="all">All Dates (Today)</option>
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
                            label="As of Date"
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

    return (
        <ReportLayout
            title="Supplier Report"
            filters={filterElements}
            onExportExcel={handleExportExcel}
        >
            <Head title="Supplier Report" />
            
            <div className="text-center mb-8 font-serif">
                <h2 className="text-xl font-bold text-gray-900">Supplier Balance Summary</h2>
                <h3 className="text-sm text-gray-700 mt-1">{auth.company?.company_name}</h3>
                <p className="text-[13px] text-gray-500 mt-1">
                    As of {new Date(filters.end_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
            </div>

            <div className="w-full overflow-x-auto pb-10">
                <table className="w-full text-[13px] text-left border-collapse">
                    <thead>
                        <tr className="border-y-2 border-gray-300">
                            <th className="py-2.5 px-3 font-semibold text-gray-900 w-3/4">
                                Supplier <span className="inline-block ml-1 text-gray-400 text-[10px]">▲</span>
                            </th>
                            <th className="py-2.5 px-3 font-semibold text-gray-900 text-right">
                                Open Balance <span className="inline-block ml-1 text-gray-400 text-[10px]">↕</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {suppliers.length === 0 ? (
                            <tr>
                                <td colSpan="2" className="py-8 text-center text-gray-500">No supplier balances found.</td>
                            </tr>
                        ) : (
                            suppliers.map((item, index) => (
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
                                        <Link href={route('reports.supplier-detail', item.id) + '?end_date=' + filters.end_date} className="hover:underline cursor-pointer decoration-slate-400 underline-offset-4">
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
                Generated on {new Date().toLocaleDateString()}
            </div>
        </ReportLayout>
    );
}
