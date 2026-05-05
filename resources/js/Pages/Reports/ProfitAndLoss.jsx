import React from 'react';
import ReportLayout from '@/Layouts/ReportLayout';
import { Head, router } from '@inertiajs/react';

export default function ProfitAndLoss({ reportData, filters, auth }) {
    const handleFilterChange = (key, value) => {
        router.get(route('reports.profit-loss'), { ...filters, [key]: value }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const income = reportData.income || [];
    const expense = reportData.expense || [];

    const totalIncome = income.reduce((sum, item) => sum + item.balance, 0);
    const totalExpense = expense.reduce((sum, item) => sum + item.balance, 0);
    const netIncome = totalIncome - totalExpense;

    const homeCurrency = auth.company?.home_currency_prefix || auth.company?.home_currency || 'LKR';

    const Currency = ({ value }) => (
        <span className={value < 0 ? 'text-red-600' : 'text-slate-900'}>
            <span className="text-[10px] font-bold text-slate-400 mr-1">{homeCurrency}</span>
            {value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
    );

    const filterElements = (
        <div className="flex gap-4">
            <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">From</label>
                <input 
                    type="date" 
                    value={filters.start_date}
                    onChange={(e) => handleFilterChange('start_date', e.target.value)}
                    className="text-xs font-bold bg-transparent border-b border-slate-200 outline-none focus:border-primary transition-colors py-1"
                />
            </div>
            <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">To</label>
                <input 
                    type="date" 
                    value={filters.end_date}
                    onChange={(e) => handleFilterChange('end_date', e.target.value)}
                    className="text-xs font-bold bg-transparent border-b border-slate-200 outline-none focus:border-primary transition-colors py-1"
                />
            </div>
        </div>
    );

    return (
        <ReportLayout
            title="Profit and Loss"
            filters={filterElements}
        >
            <Head title="Profit and Loss" />
            
            <div className="text-center mb-12">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">{auth.company?.company_name}</h2>
                <h3 className="text-lg font-bold text-slate-600 mt-1 uppercase tracking-widest">Profit and Loss</h3>
                <p className="text-xs text-slate-400 mt-2 font-medium">
                    {new Date(filters.start_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} - {new Date(filters.end_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
            </div>

            <div className="space-y-10">
                {/* Income Section */}
                <section>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 border-b border-slate-100 pb-2">Income</h4>
                    <div className="space-y-3">
                        {income.map((item, index) => (
                            <div key={index} className="flex justify-between text-xs font-medium text-slate-700">
                                <span className="pl-4">{item.name}</span>
                                <Currency value={item.balance} />
                            </div>
                        ))}
                        <div className="flex justify-between text-sm font-black text-slate-900 pt-4 border-t-2 border-slate-900">
                            <span>Total Income</span>
                            <Currency value={totalIncome} />
                        </div>
                    </div>
                </section>

                {/* Expense Section */}
                <section>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 border-b border-slate-100 pb-2">Expenses</h4>
                    <div className="space-y-3">
                        {expense.map((item, index) => (
                            <div key={index} className="flex justify-between text-xs font-medium text-slate-700">
                                <span className="pl-4">{item.name}</span>
                                <Currency value={item.balance} />
                            </div>
                        ))}
                        <div className="flex justify-between text-sm font-black text-slate-900 pt-4 border-t-2 border-slate-900">
                            <span>Total Expenses</span>
                            <Currency value={totalExpense} />
                        </div>
                    </div>
                </section>

                {/* Net Income */}
                <section className="pt-6">
                    <div className="flex justify-between text-lg font-black text-slate-900 border-t-4 border-slate-900 py-4 px-2 bg-slate-50 rounded-lg">
                        <span className="uppercase tracking-tighter italic">Net Income</span>
                        <Currency value={netIncome} />
                    </div>
                </section>
            </div>

            <div className="mt-20 text-[10px] text-slate-400 font-bold text-center uppercase tracking-widest italic">
                Accrual Basis | Generated on {new Date().toLocaleDateString()}
            </div>
        </ReportLayout>
    );
}
