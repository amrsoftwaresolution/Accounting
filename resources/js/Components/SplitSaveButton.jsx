import { useState, useRef, useEffect } from 'react';

export default function SplitSaveButton({ onSave, onSaveAndClose, onSaveAndNew, processing, lastAction = 'save' }) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleActionClick = (action) => {
        action.onClick();
        setIsOpen(false);
    };

    // Separate primary Save button
    const primaryButton = (
        <button
            type="button"
            disabled={processing}
            onClick={onSave}
            className="inline-flex items-center px-4 py-2 bg-primary border border-transparent rounded-lg text-[10px] font-black uppercase tracking-widest text-white hover:bg-primary-600 transition-all focus:outline-none disabled:opacity-50 h-8 min-w-[100px] justify-center"
        >
            {processing ? (
                <span className="flex items-center gap-2">
                    <svg className="animate-spin h-3 w-3 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Saving
                </span>
            ) : 'Save'}
        </button>
    );

    // Secondary button with dropdown for Save & New and Save & Close
    const secondaryButton = (
        <div className="relative inline-flex" ref={dropdownRef}>
            <button
                type="button"
                disabled={processing}
                onClick={onSaveAndNew}
                className="inline-flex items-center px-4 py-2 bg-primary border border-transparent rounded-l-lg text-[10px] font-black uppercase tracking-widest text-white hover:bg-primary-600 transition-all focus:outline-none disabled:opacity-50 h-8 min-w-[100px] justify-center"
            >
                Save & New
            </button>
            <button
                type="button"
                disabled={processing}
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center px-2 py-2 bg-primary border-l border-primary-600 rounded-r-lg text-white hover:bg-primary-600 focus:outline-none transition-all disabled:opacity-50 h-8"
            >
                <svg className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            {isOpen && (
                <div className="origin-bottom-right absolute right-0 bottom-full mb-3 w-48 rounded-xl shadow-[0_-10px_40px_rgba(0,0,0,0.3)] bg-slate-800 border border-slate-700 divide-y divide-slate-700 focus:outline-none z-50 animate-in slide-in-from-bottom-2 duration-200 overflow-hidden">
                    <div className="py-1">
                        <button
                            onClick={() => handleActionClick({ id: 'close', label: 'Save and Close', onClick: onSaveAndClose })}
                            className="w-full text-left px-4 py-3 text-[9px] font-black text-slate-300 uppercase tracking-widest hover:bg-slate-700 hover:text-white transition-all flex items-center justify-between group"
                        >
                            Save and Close
                            <svg className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <div className="flex items-center gap-4">
            {primaryButton}
            {secondaryButton}
        </div>
    );
}
