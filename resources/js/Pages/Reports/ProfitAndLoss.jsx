import React, { useRef } from 'react';
import ReportLayout from '@/Layouts/ReportLayout';
import { Head, router } from '@inertiajs/react';

export default function ProfitAndLoss({ reportData, filters, auth }) {
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

    const handleExportExcel = () => {
        const companyName = auth.company?.company_name || 'GrowDigitec';
        const startDate = filters.start_date;
        const endDate = filters.end_date;
        
        let csvContent = "";
        
        // Add Title Header
        csvContent += `"${companyName}"\n`;
        csvContent += `"Profit and Loss"\n`;
        csvContent += `"${new Date(startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} - ${new Date(endDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}"\n\n`;
        
        // Headers
        csvContent += `"Category","Account Name","Balance (${homeCurrency})"\n`;
        
        // Income
        csvContent += `"INCOME"\n`;
        income.forEach(item => {
            csvContent += `,"${item.name}",${item.balance}\n`;
        });
        csvContent += `,"Total Income",${totalIncome}\n\n`;
        
        // Expenses
        csvContent += `"EXPENSES"\n`;
        expense.forEach(item => {
            csvContent += `,"${item.name}",${item.balance}\n`;
        });
        csvContent += `,"Total Expenses",${totalExpense}\n\n`;
        
        // Net Income
        csvContent += `,"Net Income",${netIncome}\n`;
        
        // Create download blob
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `${companyName.replace(/[^a-z0-9]/gi, '_')}_Profit_And_Loss_${startDate}_to_${endDate}.csv`);
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
            title="Profit and Loss"
            filters={filterElements}
            onExportExcel={handleExportExcel}
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
