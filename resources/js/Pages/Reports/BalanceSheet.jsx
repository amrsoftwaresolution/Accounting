import React, { useRef } from 'react';
import ReportLayout from '@/Layouts/ReportLayout';
import { Head, router } from '@inertiajs/react';

export default function BalanceSheet({ reportData, filters, auth }) {
    const fromDateRef = useRef(null);
    const toDateRef = useRef(null);

    const openDatePicker = (ref) => {
        if (ref.current) {
            try {
                ref.current.showPicker();
            } catch (err) {
                ref.current.click();
            }
        }
    };
    const handleFilterChange = (key, value) => {
        router.get(route('reports.balance-sheet'), { ...filters, [key]: value }, {
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
        <div className="flex gap-4">
            <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">From</label>
                <div 
                    onClick={() => openDatePicker(fromDateRef)}
                    className="relative flex items-center group cursor-pointer border-b border-slate-200 focus-within:border-primary transition-colors py-1"
                >
                    <input 
                        ref={fromDateRef}
                        type="date" 
                        value={filters.start_date}
                        onChange={(e) => handleFilterChange('start_date', e.target.value)}
                        className="text-xs font-bold bg-transparent outline-none cursor-pointer w-28 date-picker-input [color-scheme:light]"
                    />
                </div>
            </div>
            <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">To</label>
                <div 
                    onClick={() => openDatePicker(toDateRef)}
                    className="relative flex items-center group cursor-pointer border-b border-slate-200 focus-within:border-primary transition-colors py-1"
                >
                    <input 
                        ref={toDateRef}
                        type="date" 
                        value={filters.end_date}
                        onChange={(e) => handleFilterChange('end_date', e.target.value)}
                        className="text-xs font-bold bg-transparent outline-none cursor-pointer w-28 date-picker-input [color-scheme:light]"
                    />
                </div>
            </div>
        </div>
    );

    return (
        <ReportLayout
            title="Balance Sheet"
            filters={filterElements}
            onExportExcel={handleExportExcel}
        >
            <Head title="Balance Sheet" />
            
            <div className="text-center mb-12">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">{auth.company?.company_name}</h2>
                <h3 className="text-lg font-bold text-slate-600 mt-1 uppercase tracking-widest">Balance Sheet</h3>
                <p className="text-xs text-slate-400 mt-2 font-medium">
                    {new Date(filters.start_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} - {new Date(filters.end_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
            </div>

            <div className="space-y-12">
                {/* Assets Section */}
                <section>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 border-b border-slate-100 pb-2">Assets</h4>
                    <div className="space-y-3">
                        {asset.map((item, index) => (
                            <div key={index} className="flex justify-between text-xs font-medium text-slate-700">
                                <span className="pl-4">{item.name}</span>
                                <Currency value={item.balance} />
                            </div>
                        ))}
                        <div className="flex justify-between text-sm font-black text-slate-900 pt-4 border-t-2 border-slate-900">
                            <span>Total Assets</span>
                            <Currency value={totalAsset} />
                        </div>
                    </div>
                </section>

                {/* Liabilities & Equity Section */}
                <section>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 border-b border-slate-100 pb-2">Liabilities and Equity</h4>
                    
                    <div className="space-y-8">
                        {/* Liabilities */}
                        <div className="pl-4 space-y-3">
                            <h5 className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2 italic">Liabilities</h5>
                            {liability.map((item, index) => (
                                <div key={index} className="flex justify-between text-xs font-medium text-slate-700">
                                    <span className="pl-4">{item.name}</span>
                                    <Currency value={item.balance} />
                                </div>
                            ))}
                            <div className="flex justify-between text-xs font-black text-slate-900 pt-2 border-t border-slate-100">
                                <span>Total Liabilities</span>
                                <Currency value={totalLiability} />
                            </div>
                        </div>

                        {/* Equity */}
                        <div className="pl-4 space-y-3">
                            <h5 className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2 italic">Equity</h5>
                            {equity.map((item, index) => (
                                <div key={index} className="flex justify-between text-xs font-medium text-slate-700">
                                    <span className="pl-4">{item.name}</span>
                                    <Currency value={item.balance} />
                                </div>
                            ))}
                            <div className="flex justify-between text-xs font-black text-slate-900 pt-2 border-t border-slate-100">
                                <span>Total Equity</span>
                                <Currency value={totalEquity} />
                            </div>
                        </div>

                        <div className="flex justify-between text-sm font-black text-slate-900 pt-4 border-t-2 border-slate-900">
                            <span>Total Liabilities and Equity</span>
                            <Currency value={totalLiabilityEquity} />
                        </div>
                    </div>
                </section>
            </div>

            <div className="mt-20 text-[10px] text-slate-400 font-bold text-center uppercase tracking-widest italic">
                Accrual Basis | Generated on {new Date().toLocaleDateString()}
            </div>
        </ReportLayout>
    );
}
