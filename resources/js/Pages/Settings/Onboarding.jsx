import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import CompanySettings from './Partials/CompanySettings';
import SalesSettings from './Partials/SalesSettings';
import ApplicationLogo from '@/Components/ApplicationLogo';

export default function Onboarding({ company, salesSettings }) {
    const [step, setStep] = useState(1);

    const steps = [
        { id: 1, name: 'Company Profile', icon: 'business' },
        { id: 2, name: 'Sales Preferences', icon: 'receipt_long' },
        { id: 3, name: 'Finish', icon: 'celebration' },
    ];

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">
            <Head title="Setup Your Workspace" />

            {/* Header */}
            <header className="bg-white border-b border-slate-200 py-4 px-6 fixed top-0 w-full z-10">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#00713D] rounded-lg shadow-lg shadow-emerald-100">
                            <ApplicationLogo className="h-6 w-auto filter brightness-0 invert" />
                        </div>
                        <span className="text-lg font-black tracking-tight text-slate-800 uppercase">JobAlign Book</span>
                    </div>
                    <div className="flex items-center gap-6">
                        <nav className="flex items-center gap-2">
                            {steps.map((s, i) => (
                                <React.Fragment key={s.id}>
                                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-300 ${
                                        step === s.id 
                                            ? 'bg-emerald-50 text-[#00713D]' 
                                            : step > s.id 
                                                ? 'text-slate-400' 
                                                : 'text-slate-300'
                                    }`}>
                                        <span className={`text-xs font-black h-5 w-5 rounded-full flex items-center justify-center border-2 ${
                                            step === s.id ? 'border-[#00713D]' : 'border-current'
                                        }`}>
                                            {step > s.id ? '✓' : s.id}
                                        </span>
                                        <span className="text-[10px] font-bold uppercase tracking-widest">{s.name}</span>
                                    </div>
                                    {i < steps.length - 1 && <div className="w-4 h-px bg-slate-200" />}
                                </React.Fragment>
                            ))}
                        </nav>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="pt-24 pb-20 px-6">
                <div className="max-w-3xl mx-auto">
                    {step === 1 && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="mb-8 text-center">
                                <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Let's build your profile</h1>
                                <p className="text-slate-500 text-sm font-medium">Add your business details and branding to get started.</p>
                            </div>
                            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
                                <CompanySettings settings={company} />
                                <div className="p-8 bg-slate-50 border-t border-slate-200 flex justify-end">
                                    <button 
                                        onClick={() => setStep(2)}
                                        className="px-8 py-3 bg-[#00713D] text-white font-bold rounded-2xl hover:bg-[#005a30] transition-all hover:-translate-y-0.5 shadow-lg shadow-emerald-200 flex items-center gap-2"
                                    >
                                        Next: Sales Settings
                                        <span className="material-icons text-sm">arrow_forward</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="mb-8 text-center">
                                <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Configure your sales</h1>
                                <p className="text-slate-500 text-sm font-medium">How would you like to handle your invoices and payments?</p>
                            </div>
                            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
                                <SalesSettings settings={salesSettings} />
                                <div className="p-8 bg-slate-50 border-t border-slate-200 flex justify-between">
                                    <button 
                                        onClick={() => setStep(1)}
                                        className="px-6 py-3 text-slate-600 font-bold hover:text-slate-900 transition-colors flex items-center gap-2"
                                    >
                                        <span className="material-icons text-sm">arrow_back</span>
                                        Back
                                    </button>
                                    <button 
                                        onClick={() => setStep(3)}
                                        className="px-8 py-3 bg-[#00713D] text-white font-bold rounded-2xl hover:bg-[#005a30] transition-all hover:-translate-y-0.5 shadow-lg shadow-emerald-200 flex items-center gap-2"
                                    >
                                        Next: Ready to go
                                        <span className="material-icons text-sm">arrow_forward</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="animate-in zoom-in fade-in duration-700">
                            <div className="max-w-md mx-auto text-center py-12">
                                <div className="w-24 h-24 bg-emerald-100 text-[#00713D] rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                                    <span className="material-icons text-5xl">celebration</span>
                                </div>
                                <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-4">You're all set!</h1>
                                <p className="text-slate-500 text-sm font-medium mb-12">Your workspace is ready. You can now start creating invoices, tracking expenses, and growing your business.</p>
                                
                                <button 
                                    onClick={() => router.post(route('onboarding.complete'))}
                                    className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-slate-200 flex items-center justify-center gap-3 group"
                                >
                                    Go to Dashboard
                                    <span className="material-icons transition-transform group-hover:translate-x-1">rocket_launch</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
