import { useState, useRef, useEffect } from 'react';

export default function SplitSaveButton({ onSave, onSaveAndClose, onSaveAndNew, processing }) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const actions = [
        { label: 'Save and Close', onClick: onSaveAndClose },
        { label: 'Save and New', onClick: onSaveAndNew },
    ];

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative inline-flex shadow-sm rounded-xl" ref={dropdownRef}>
            <button
                type="button"
                disabled={processing}
                onClick={onSave}
                className="inline-flex items-center px-6 py-2.5 bg-[#00713D] border border-transparent rounded-l-xl text-xs font-bold text-white uppercase tracking-widest hover:bg-[#005a30] focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all disabled:opacity-50"
            >
                {processing ? 'Saving...' : 'Save'}
            </button>
            <div className="-ml-px relative block">
                <button
                    type="button"
                    disabled={processing}
                    onClick={() => setIsOpen(!isOpen)}
                    className="relative inline-flex items-center px-2 py-2.5 bg-[#00713D] border-l border-green-700 rounded-r-xl text-white hover:bg-[#005a30] focus:outline-none transition-all disabled:opacity-50"
                >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                    </svg>
                </button>

                {isOpen && (
                    <div className="origin-bottom-right absolute right-0 bottom-full mb-2 w-48 rounded-xl shadow-2xl bg-white ring-1 ring-black ring-opacity-5 divide-y divide-slate-50 focus:outline-none z-50 animate-in slide-in-from-bottom-2 duration-200">
                        <div className="py-1">
                            {actions.map((action, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => {
                                        action.onClick();
                                        setIsOpen(false);
                                    }}
                                    className="w-full text-left px-4 py-3 text-[11px] font-bold text-slate-700 uppercase tracking-wider hover:bg-slate-50 transition-colors"
                                >
                                    {action.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
