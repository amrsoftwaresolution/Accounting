import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export default function SidePanel({ isOpen, onClose, title, children, dirty = false, actions }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!mounted) return null;

    return createPortal(
        <div 
            className={`fixed inset-0 z-[100] transition-all duration-500 ${isOpen ? 'visible' : 'invisible'}`}
        >
            {/* Backdrop */}
            <div 
                className={`absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
                onClick={onClose}
            />
            
            {/* Panel */}
            <div 
                className={`absolute top-0 right-0 h-full w-full max-w-lg bg-white shadow-2xl transition-transform duration-500 ease-out transform ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                        <h2 className="text-xl font-bold text-slate-800 tracking-tight">{title}</h2>
                        <button 
                            onClick={() => {
                                if (dirty && !confirm('You have unsaved changes. Are you sure you want to close?')) return;
                                onClose();
                            }}
                            className="p-2 rounded-full hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-all"
                        >
                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                        {children}
                    </div>

                    {/* Dark Footer */}
                    <div className="px-6 py-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
                        <button
                            onClick={() => {
                                if (dirty && !confirm('You have unsaved changes. Are you sure you want to close?')) return;
                                onClose();
                            }}
                            className="text-xs font-bold text-slate-400 hover:text-white uppercase tracking-widest transition-colors"
                        >
                            Cancel
                        </button>
                        <div className="flex items-center gap-3">
                            {actions}
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}
