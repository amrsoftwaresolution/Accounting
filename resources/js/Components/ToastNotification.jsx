import { useState, useEffect } from "react";
import { usePage } from "@inertiajs/react";

export default function ToastNotification() {
    const { flash } = usePage().props;
    const [toast, setToast] = useState(null);

    useEffect(() => {
        if (flash?.success) {
            setToast({ type: 'success', message: flash.success });
            const timer = setTimeout(() => setToast(null), 5000);
            return () => clearTimeout(timer);
        } else if (flash?.error) {
            setToast({ type: 'error', message: flash.error });
            const timer = setTimeout(() => setToast(null), 7000);
            return () => clearTimeout(timer);
        } else if (flash?.warning) {
            setToast({ type: 'warning', message: flash.warning });
            const timer = setTimeout(() => setToast(null), 5000);
            return () => clearTimeout(timer);
        } else if (flash?.info) {
            setToast({ type: 'info', message: flash.info });
            const timer = setTimeout(() => setToast(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [flash]);

    if (!toast) return null;

    const colors = {
        success: {
            bg: "bg-emerald-50/95 border-emerald-100",
            iconBg: "bg-emerald-100/80 text-emerald-600",
            text: "text-emerald-800",
            badge: "bg-emerald-500/10 text-emerald-700"
        },
        error: {
            bg: "bg-rose-50/95 border-rose-100",
            iconBg: "bg-rose-100/80 text-rose-600",
            text: "text-rose-800",
            badge: "bg-rose-500/10 text-rose-700"
        },
        warning: {
            bg: "bg-amber-50/95 border-amber-100",
            iconBg: "bg-amber-100/80 text-amber-600",
            text: "text-amber-800",
            badge: "bg-amber-500/10 text-amber-700"
        },
        info: {
            bg: "bg-blue-50/95 border-blue-100",
            iconBg: "bg-blue-100/80 text-blue-600",
            text: "text-blue-800",
            badge: "bg-blue-500/10 text-blue-700"
        }
    };

    const config = colors[toast.type] || colors.info;

    return (
        <div className={`fixed top-6 right-6 z-[9999] max-w-sm w-full bg-white border ${config.bg} rounded-2xl shadow-xl shadow-slate-200/50 p-4 animate-in slide-in-from-top-4 fade-in duration-300 flex items-start gap-3`}>
            <div className={`p-1.5 rounded-xl ${config.iconBg} flex-shrink-0 flex items-center justify-center`}>
                {toast.type === 'success' && (
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                )}
                {toast.type === 'error' && (
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                )}
                {toast.type === 'warning' && (
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                )}
                {toast.type === 'info' && (
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                )}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md ${config.badge}`}>
                        {toast.type}
                    </span>
                </div>
                <p className="text-xs font-semibold text-slate-800 mt-2 leading-relaxed">
                    {toast.message}
                </p>
            </div>
            <button 
                onClick={() => setToast(null)} 
                className="text-slate-400 hover:text-slate-600 transition-colors p-0.5 rounded-lg hover:bg-slate-100/50"
            >
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        </div>
    );
}
