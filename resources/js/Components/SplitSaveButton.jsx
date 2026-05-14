import { useState, useRef, useEffect } from 'react';

export default function SplitSaveButton({ onSave, onSaveAndClose, onSaveAndNew, processing, lastAction = 'save' }) {
    const [isOpen, setIsOpen] = useState(false);
    const [currentAction, setCurrentAction] = useState(lastAction);
    const dropdownRef = useRef(null);

    // Sync with prop if it changes
    useEffect(() => {
        if (lastAction) setCurrentAction(lastAction);
    }, [lastAction]);

    const allActions = [
        { id: 'save', label: 'Save', onClick: onSave },
        { id: 'close', label: 'Save and Close', onClick: onSaveAndClose },
        { id: 'new', label: 'Save and New', onClick: onSaveAndNew },
    ];

    const mainAction = allActions.find(a => a.id === currentAction) || allActions[0];
    const otherActions = allActions.filter(a => a.id !== currentAction);

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
        setCurrentAction(action.id);
        action.onClick();
        setIsOpen(false);
    };

    return (
        <div className="relative inline-flex shadow-xl" ref={dropdownRef}>
            <button
                type="button"
                disabled={processing}
                onClick={() => mainAction.onClick()}
                className="inline-flex items-center px-6 py-2 bg-emerald-600 border border-transparent rounded-l-lg text-[10px] font-black text-white uppercase tracking-widest hover:bg-emerald-500 focus:outline-none transition-all disabled:opacity-50 h-9 min-w-[120px] justify-center"
            >
                {processing ? (
                    <span className="flex items-center gap-2">
                        <svg className="animate-spin h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving
                    </span>
                ) : mainAction.label}
            </button>
            <div className="relative block">
                <button
                    type="button"
                    disabled={processing}
                    onClick={() => setIsOpen(!isOpen)}
                    className="relative inline-flex items-center px-2 py-2 bg-emerald-600 border-l border-emerald-700 rounded-r-lg text-white hover:bg-emerald-500 focus:outline-none transition-all disabled:opacity-50 h-9"
                >
                    <svg className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
                    </svg>
                </button>

                {isOpen && (
                    <div className="origin-bottom-right absolute right-0 bottom-full mb-3 w-48 rounded-xl shadow-[0_-10px_40px_rgba(0,0,0,0.3)] bg-slate-800 border border-slate-700 divide-y divide-slate-700 focus:outline-none z-50 animate-in slide-in-from-bottom-2 duration-200 overflow-hidden">
                        <div className="py-1">
                            {otherActions.map((action, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleActionClick(action)}
                                    className="w-full text-left px-4 py-3 text-[9px] font-black text-slate-300 uppercase tracking-widest hover:bg-slate-700 hover:text-white transition-all flex items-center justify-between group"
                                >
                                    {action.label}
                                    <svg className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
