import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Select({ companies }) {
    const { post } = useForm();

    const handleSelect = (companyId) => {
        post(route('companies.switch', companyId));
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
            <Head title="Select Company" />
            
            <div className="w-full max-w-2xl">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Welcome Back</h1>
                    <p className="text-slate-500 font-medium">Please select the company you want to work with today</p>
                </div>

                <div className={companies.length === 0 ? 'flex flex-col items-center' : 'grid grid-cols-1 md:grid-cols-2 gap-4'}>
                    {companies.length > 0 ? (
                        <>
                            {companies.map((company) => (
                                <button
                                    key={company.id}
                                    onClick={() => handleSelect(company.id)}
                                    className="group relative bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-primary hover:shadow-xl hover:shadow-primary/5 transition-all text-left flex items-start gap-4"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-slate-100 group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                                        {company.logo_path ? (
                                            <img src={company.logo_path} alt="" className="w-8 h-8 object-contain" />
                                        ) : (
                                            <span className="text-xl font-bold text-slate-400 group-hover:text-primary transition-colors">
                                                {company.company_name.charAt(0)}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-slate-900 group-hover:text-primary transition-colors">
                                            {company.company_name}
                                        </h3>
                                        <p className="text-xs text-slate-400 mt-1 uppercase font-bold tracking-wider">
                                            {company.pivot?.role || 'Admin'}
                                        </p>
                                    </div>
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                        <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </button>
                            ))}

                            <Link
                                href={route('companies.create')}
                                className="bg-slate-100 p-6 rounded-2xl border-2 border-dashed border-slate-200 hover:bg-slate-200 hover:border-slate-300 transition-all text-center flex flex-col items-center justify-center gap-2 group"
                            >
                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-400 group-hover:text-slate-600 transition-colors">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                    </svg>
                                </div>
                                <span className="text-sm font-bold text-slate-500">Create New Company</span>
                            </Link>
                        </>
                    ) : (
                        <div className="bg-white p-12 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 text-center w-full max-w-md">
                            <div className="w-20 h-20 bg-primary/5 rounded-3xl flex items-center justify-center mx-auto mb-6 text-primary">
                                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-black text-slate-900 mb-2">No Companies Found</h2>
                            <p className="text-sm text-slate-500 mb-8 font-medium leading-relaxed">It looks like you haven't joined or created a company yet. Create your first one to start managing your finances.</p>
                            
                            <Link
                                href={route('companies.create')}
                                className="inline-flex items-center justify-center gap-3 w-full bg-primary text-white font-black py-4 rounded-2xl hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 transition-all uppercase tracking-widest text-xs"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" />
                                </svg>
                                Create Your First Company
                            </Link>
                        </div>
                    )}
                </div>

                <div className="mt-12 text-center">
                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="text-xs font-bold text-slate-400 hover:text-red-500 uppercase tracking-widest transition-colors"
                    >
                        Sign Out
                    </Link>
                </div>
            </div>
        </div>
    );
}
