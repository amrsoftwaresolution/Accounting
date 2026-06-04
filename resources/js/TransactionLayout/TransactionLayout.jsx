import { useEffect, useState } from 'react';
import TransactionHeader from "./TransactionHeader";
import { router } from '@inertiajs/react';
import SplitSaveButton from "@/Components/SplitSaveButton";
import ToastNotification from "@/Components/ToastNotification";

export default function TransactionLayout({
    title,
    amount,
    children,
    onSave,
    onSaveAndClose,
    onSaveAndNew,
    onAddLine,
    onClearRows,
    processing = false,
    dirty = false,
    historyType = null,
    lastAction = 'save'
}) {
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(dirty);

    useEffect(() => {
        setHasUnsavedChanges(dirty);
    }, [dirty]);

    useEffect(() => {
        const markDirty = () => setHasUnsavedChanges(true);

        document.addEventListener('input', markDirty, true);
        document.addEventListener('change', markDirty, true);

        return () => {
            document.removeEventListener('input', markDirty, true);
            document.removeEventListener('change', markDirty, true);
        };
    }, []);

    const handleClose = () => {
        if (hasUnsavedChanges) {
            if (confirm('You have unsaved changes. Are you sure you want to close?')) {
                window.history.back();
            }
        } else {
            window.history.back();
        }
    };

    return (
        <div className="flex flex-col h-screen bg-slate-50">
            {/* HEADER */}
<<<<<<< HEAD
            <TransactionHeader title={title} amount={amount} historyType={historyType} dirty={hasUnsavedChanges} />
=======
            <TransactionHeader title={title} amount={amount} onClose={handleClose} />
>>>>>>> 6d0d435a033b9d4ac792157d5af0b462f7470bca

            {/* CONTENT */}
            <div className="flex-1 overflow-y-auto px-8 py-6 custom-scrollbar">
                <div className="max-w-7xl mx-auto">
                    {children}
                </div>
            </div>

            {/* FOOTER - DARK THEME */}
            <div className="sticky bottom-0 bg-slate-900 border-t border-slate-800 px-8 py-1 flex items-center justify-between shadow-2xl z-50">
                {/* Left - Actions */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleClose}
                        className="px-4 py-2 border border-primary-600 rounded-lg text-[10px] font-black uppercase tracking-widest text-primary-100 hover:bg-primary-600 transition-all"
                    >
                        Cancel
                    </button>

                    <div className="h-4 w-[1px] bg-slate-700 mx-2"></div>

                    {onAddLine && (
                        <button
                            type="button"
                            onClick={onAddLine}
                            className="px-4 py-2 border border-primary-600 rounded-lg text-[10px] font-black uppercase tracking-widest text-primary-100 hover:bg-primary-600 transition-all"
                        >
                            Add lines
                        </button>
                    )}
                    {onClearRows && (
                        <button
                            type="button"
                            onClick={onClearRows}
                            className="px-4 py-2 border border-primary-600 rounded-lg text-[10px] font-black uppercase tracking-widest text-primary-100 hover:bg-primary-600 transition-all"
                        >
                            Clear all lines
                        </button>
                    )}
                </div>

                {/* Right - Unified Save Button */}
                <div className="flex items-center gap-4">
                    <SplitSaveButton
                        onSave={onSave}
                        onSaveAndClose={onSaveAndClose}
                        onSaveAndNew={onSaveAndNew}
                        processing={processing}
                        lastAction={lastAction}
                    />
                </div>
            </div>
            <ToastNotification />
        </div>
    );
}
