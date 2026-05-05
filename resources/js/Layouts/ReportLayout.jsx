import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Link } from '@inertiajs/react';

export default function ReportLayout({ children, title, filters, onFilterChange }) {
    return (
        <AuthenticatedLayout
            header={title}
        >
            <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
                {/* Report Controls */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex flex-wrap items-end gap-6">
                    {filters}
                    <div className="flex-1" />
                    <div className="flex gap-2">
                        <button 
                            onClick={() => window.print()}
                            className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 text-slate-600 rounded-lg hover:bg-slate-100 transition-all font-bold text-xs uppercase tracking-wider border border-slate-200"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                            Print
                        </button>
                        <button className="flex items-center gap-2 px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all font-bold text-xs uppercase tracking-wider shadow-sm">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                            Export
                        </button>
                    </div>
                </div>

                {/* Report Content */}
                <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden print:shadow-none print:border-none">
                    <div className="p-10">
                        {children}
                    </div>
                </div>
                
                <style dangerouslySetInnerHTML={{ __html: `
                    @media print {
                        body { background: white !important; }
                        .no-print { display: none !important; }
                        header { display: none !important; }
                        .fixed { position: static !important; }
                        main { padding: 0 !important; }
                    }
                `}} />
            </div>
        </AuthenticatedLayout>
    );
}
