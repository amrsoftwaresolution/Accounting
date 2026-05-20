import React, { useState, useRef, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Link } from '@inertiajs/react';

export default function ReportLayout({ children, title, filters, onFilterChange, onExportExcel, onExportPDF }) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleExportPDF = () => {
        if (onExportPDF) {
            onExportPDF();
            return;
        }

        // Default Client-Side PDF Generation
        const loadScript = () => {
            return new Promise((resolve, reject) => {
                if (window.html2pdf) {
                    resolve(window.html2pdf);
                    return;
                }
                const script = document.createElement('script');
                script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
                script.onload = () => resolve(window.html2pdf);
                script.onerror = reject;
                document.head.appendChild(script);
            });
        };

        loadScript().then((html2pdf) => {
            const element = document.getElementById('report-content');
            const cleanTitle = title ? title.replace(/[^a-z0-9]/gi, '_') : 'Report';
            const opt = {
                margin:       [0.4, 0.4, 0.4, 0.4],
                filename:     `${cleanTitle}.pdf`,
                image:        { type: 'jpeg', quality: 0.98 },
                html2canvas:  { scale: 2, useCORS: true, letterRendering: true },
                jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
            };
            html2pdf().set(opt).from(element).save();
        }).catch(err => {
            console.error('Failed to load html2pdf library:', err);
            window.print();
        });
    };

    return (
        <AuthenticatedLayout
            header={title}
        >
            <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
                {/* Report Controls */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex flex-wrap items-end gap-6 print:hidden">
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
                        
                        <div className="relative" ref={dropdownRef}>
                            <button 
                                onClick={() => setIsOpen(!isOpen)}
                                className="flex items-center gap-2 px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all font-bold text-xs uppercase tracking-wider shadow-sm"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                Export
                                <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {isOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-1 overflow-hidden transition-all animate-in fade-in slide-in-from-top-2 duration-150">
                                    <button 
                                        onClick={() => {
                                            setIsOpen(false);
                                            handleExportPDF();
                                        }}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                                    >
                                        <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                        </svg>
                                        Export to PDF
                                    </button>
                                    
                                    {onExportExcel && (
                                        <button 
                                            onClick={() => {
                                                setIsOpen(false);
                                                onExportExcel();
                                            }}
                                            className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors border-t border-slate-100"
                                        >
                                            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            Export to Excel
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Report Content */}
                <div id="report-content" className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden print:shadow-none print:border-none">
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
                    .date-picker-input::-webkit-calendar-picker-indicator {
                        background: transparent;
                        bottom: 0;
                        color: transparent;
                        cursor: pointer;
                        height: auto;
                        left: 0;
                        position: absolute;
                        right: 0;
                        top: 0;
                        width: auto;
                        opacity: 0;
                        z-index: 10;
                    }
                `}} />
            </div>
        </AuthenticatedLayout>
    );
}
