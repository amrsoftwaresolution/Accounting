import React, { useRef } from 'react';
import ReportLayout from '@/Layouts/ReportLayout';
import { Head, router } from '@inertiajs/react';

export default function CustomerBalance({ reportData, filters, auth }) {
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
        router.get(route('reports.customer-balance'), { ...filters, [key]: value }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const customers = reportData || [];
    const totalBalance = customers.reduce((sum, item) => sum + item.balance, 0);

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
        csvContent += `"Customer Report"\n`;
        csvContent += `"As of ${new Date(endDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}"\n\n`;
        
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
        <div className="flex gap-4">
            <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">As Of</label>
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
            title="Customer Report"
            filters={filterElements}
            onExportExcel={handleExportExcel}
        >
            <Head title="Customer Report" />
            
            <div className="text-center mb-12">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">{auth.company?.company_name}</h2>
                <h3 className="text-lg font-bold text-slate-600 mt-1 uppercase tracking-widest">Customer Report</h3>
                <p className="text-xs text-slate-400 mt-2 font-medium">
                    As of {new Date(filters.end_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
            </div>

            <div className="space-y-10">
                <section>
                    <div className="grid grid-cols-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 border-b border-slate-100 pb-2 px-4">
                        <div className="col-span-2">Customer</div>
                        <div className="text-right col-span-2">Balance</div>
                    </div>
                    <div className="space-y-3">
                        {customers.length === 0 ? (
                            <div className="text-center py-8 text-slate-400 text-sm font-medium">No customer balances found.</div>
                        ) : (
                            customers.map((item, index) => (
                                <div key={index} className="grid grid-cols-4 items-center text-xs font-medium text-slate-700 hover:bg-slate-50 p-2 rounded-lg transition-colors">
                                    <div className="col-span-2 flex flex-col pl-4">
                                        <span className="font-bold text-slate-900">{item.name}</span>
                                        {(item.email || item.phone) && (
                                            <span className="text-[10px] text-slate-400 mt-0.5">
                                                {item.email} {item.email && item.phone && '|'} {item.phone}
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-right col-span-2">
                                        <Currency value={item.balance} />
                                    </div>
                                </div>
                            ))
                        )}
                        <div className="flex justify-between text-sm font-black text-slate-900 pt-4 border-t-2 border-slate-900 px-2">
                            <span>Total</span>
                            <Currency value={totalBalance} />
                        </div>
                    </div>
                </section>
            </div>

            <div className="mt-20 text-[10px] text-slate-400 font-bold text-center uppercase tracking-widest italic">
                Generated on {new Date().toLocaleDateString()}
            </div>
        </ReportLayout>
    );
}
