import React, { useState } from 'react';
import ReportLayout from '@/Layouts/ReportLayout';
import { Head, router } from '@inertiajs/react';
import CommonInput from '@/Components/CommonInput';

export default function BalanceSheet({ reportData, filters, auth }) {
    const [startDate, setStartDate] = useState(filters.start_date);
    const [endDate, setEndDate] = useState(filters.end_date);

    const handleRunReport = () => {
        router.get(route('reports.balance-sheet'), { start_date: startDate, end_date: endDate }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const asset = reportData.asset || [];
    const liability = reportData.liability || [];
    const equity = reportData.equity || [];

    const totalAsset = asset.reduce((sum, item) => sum + item.balance, 0);
    const totalLiability = liability.reduce((sum, item) => sum + item.balance, 0);
    const totalEquity = equity.reduce((sum, item) => sum + item.balance, 0);
    const totalLiabilityEquity = totalLiability + totalEquity;

    const homeCurrency = auth.company?.home_currency_prefix || auth.company?.home_currency || 'LKR';

    const Currency = ({ value }) => (
        <span className={value < 0 ? 'text-red-600' : 'text-slate-900'}>
            <span className="text-[10px] font-bold text-slate-400 mr-1">{homeCurrency}</span>
            {value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
    );

    const handleExportExcel = () => {
        const companyName = auth.company?.company_name || 'GrowDigitec';
        const startDate = filters.start_date;
        const endDate = filters.end_date;
        
        let csvContent = "";
        
        // Add Title Header
        csvContent += `"${companyName}"\n`;
        csvContent += `"Balance Sheet"\n`;
        csvContent += `"${new Date(startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} - ${new Date(endDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}"\n\n`;
        
        // Headers
        csvContent += `"Category","Account Name","Balance (${homeCurrency})"\n`;
        
        // Assets
        csvContent += `"ASSETS"\n`;
        asset.forEach(item => {
            csvContent += `,"${item.name}",${item.balance}\n`;
        });
        csvContent += `,"Total Assets",${totalAsset}\n\n`;
        
        // Liabilities & Equity
        csvContent += `"LIABILITIES AND EQUITY"\n`;
        csvContent += `"Liabilities"\n`;
        liability.forEach(item => {
            csvContent += `,"${item.name}",${item.balance}\n`;
        });
        csvContent += `,"Total Liabilities",${totalLiability}\n\n`;
        
        csvContent += `"Equity"\n`;
        equity.forEach(item => {
            csvContent += `,"${item.name}",${item.balance}\n`;
        });
        csvContent += `,"Total Equity",${totalEquity}\n\n`;
        
        csvContent += `,"Total Liabilities and Equity",${totalLiabilityEquity}\n`;
        
        // Create download blob
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `${companyName.replace(/[^a-z0-9]/gi, '_')}_Balance_Sheet_${startDate}_to_${endDate}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const filterElements = (
        <div className="flex items-end gap-4">
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
                onClick={handleRunReport}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-bold text-xs uppercase tracking-wider h-[38px] mb-[1px]"
            >
                Run Report
            </button>
        </div>
    );

    return (
        <ReportLayout
            title="Balance Sheet"
            filters={filterElements}
            onExportExcel={handleExportExcel}
        >
            <Head title="Balance Sheet" />
            
            <div className="text-center mb-8 font-serif">
                <h2 className="text-xl font-bold text-gray-900">Balance Sheet</h2>
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
                        {/* Assets Section */}
                        <tr className="bg-gray-50 border-y border-gray-300">
                            <td colSpan="2" className="py-2 px-3 font-bold text-gray-900">
                                <span className="inline-block mr-1 text-[10px]">▼</span> ASSETS
                            </td>
                        </tr>
                        {asset.map((item, index) => (
                            <tr key={`asset-${index}`} className="hover:bg-gray-50 transition-colors">
                                <td className="py-2 px-3 pl-8 text-gray-900">{item.name}</td>
                                <td className="py-2 px-3 text-right tabular-nums"><Currency value={item.balance} /></td>
                            </tr>
                        ))}
                        <tr className="border-t border-b-2 border-gray-300 bg-white font-semibold">
                            <td className="py-2 px-3 pl-8 text-gray-900">Total Assets</td>
                            <td className="py-2 px-3 text-right tabular-nums text-gray-900"><Currency value={totalAsset} /></td>
                        </tr>

                        {/* Liabilities & Equity Section */}
                        <tr className="bg-gray-50 border-y border-gray-300">
                            <td colSpan="2" className="py-2 px-3 font-bold text-gray-900 mt-4">
                                <span className="inline-block mr-1 text-[10px]">▼</span> LIABILITIES AND EQUITY
                            </td>
                        </tr>
                        
                        {/* Liabilities Sub-section */}
                        <tr className="bg-white">
                            <td colSpan="2" className="py-2 px-3 pl-6 font-semibold text-gray-700 italic">
                                Liabilities
                            </td>
                        </tr>
                        {liability.map((item, index) => (
                            <tr key={`liab-${index}`} className="hover:bg-gray-50 transition-colors">
                                <td className="py-2 px-3 pl-10 text-gray-900">{item.name}</td>
                                <td className="py-2 px-3 text-right tabular-nums"><Currency value={item.balance} /></td>
                            </tr>
                        ))}
                        <tr className="border-t border-gray-200 bg-white font-medium">
                            <td className="py-2 px-3 pl-10 text-gray-900">Total Liabilities</td>
                            <td className="py-2 px-3 text-right tabular-nums text-gray-900"><Currency value={totalLiability} /></td>
                        </tr>

                        {/* Equity Sub-section */}
                        <tr className="bg-white mt-2">
                            <td colSpan="2" className="py-2 px-3 pl-6 font-semibold text-gray-700 italic border-t border-gray-100">
                                Equity
                            </td>
                        </tr>
                        {equity.map((item, index) => (
                            <tr key={`eq-${index}`} className="hover:bg-gray-50 transition-colors">
                                <td className="py-2 px-3 pl-10 text-gray-900">{item.name}</td>
                                <td className="py-2 px-3 text-right tabular-nums"><Currency value={item.balance} /></td>
                            </tr>
                        ))}
                        <tr className="border-t border-gray-200 bg-white font-medium">
                            <td className="py-2 px-3 pl-10 text-gray-900">Total Equity</td>
                            <td className="py-2 px-3 text-right tabular-nums text-gray-900"><Currency value={totalEquity} /></td>
                        </tr>

                        <tr className="border-t-2 border-b-4 border-gray-400 font-bold bg-white text-[14px]">
                            <td className="py-3 px-3 text-gray-900">TOTAL LIABILITIES AND EQUITY</td>
                            <td className="py-3 px-3 text-right tabular-nums text-gray-900"><Currency value={totalLiabilityEquity} /></td>
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
