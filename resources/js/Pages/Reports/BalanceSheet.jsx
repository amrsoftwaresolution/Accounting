import React from 'react';
import ReportLayout from '@/Layouts/ReportLayout';
import { Head, router } from '@inertiajs/react';

export default function BalanceSheet({ reportData, filters, auth }) {
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

    const filterElements = (
        <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">As of</label>
            <input 
                type="date" 
                value={filters.as_of_date}
                onChange={(e) => handleFilterChange('as_of_date', e.target.value)}
                className="text-xs font-bold bg-transparent border-b border-slate-200 outline-none focus:border-primary transition-colors py-1"
            />
        </div>
    );

    return (
        <ReportLayout
            title="Balance Sheet"
            filters={filterElements}
        >
            <Head title="Balance Sheet" />
            
            <div className="text-center mb-12">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">{auth.company?.company_name}</h2>
                <h3 className="text-lg font-bold text-slate-600 mt-1 uppercase tracking-widest">Balance Sheet</h3>
                <p className="text-xs text-slate-400 mt-2 font-medium">
                    As of {new Date(filters.as_of_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
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
