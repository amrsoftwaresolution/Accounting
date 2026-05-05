import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        company_name: '',
        company_email: '',
        phone: '',
        industry: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('companies.store'));
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
            <Head title="Create New Company" />
            
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Create New Company</h1>
                    <p className="text-slate-500 font-medium text-sm">Let's set up your new workspace</p>
                </div>

                <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Company Name *</label>
                        <input
                            type="text"
                            value={data.company_name}
                            onChange={(e) => setData('company_name', e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none font-medium"
                            placeholder="e.g. Acme Corp"
                        />
                        {errors.company_name && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase tracking-wider">{errors.company_name}</p>}
                    </div>

                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Company Email</label>
                        <input
                            type="email"
                            value={data.company_email}
                            onChange={(e) => setData('company_email', e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-primary transition-all outline-none font-medium"
                            placeholder="hello@company.com"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Phone</label>
                            <input
                                type="text"
                                value={data.phone}
                                onChange={(e) => setData('phone', e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-primary transition-all outline-none font-medium"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Industry</label>
                            <input
                                type="text"
                                value={data.industry}
                                onChange={(e) => setData('industry', e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-primary transition-all outline-none font-medium"
                            />
                        </div>
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full bg-primary text-white font-black py-4 rounded-xl hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 transition-all disabled:opacity-50 uppercase tracking-widest text-xs"
                        >
                            {processing ? 'Creating...' : 'Get Started'}
                        </button>
                        
                        <Link
                            href={route('companies.index')}
                            className="block text-center mt-6 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest"
                        >
                            Back to Selection
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
