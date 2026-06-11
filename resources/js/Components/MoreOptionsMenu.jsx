import { useEffect, useRef, useState } from 'react';
import { router } from '@inertiajs/react';

export default function MoreOptionsMenu({
    copyRoute = null,
    deleteRoute = null,
    recordId = null,
    listRoute = 'dashboard',
    label = 'More Options',
}) {
    const [open, setOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleCopy = () => {
        setOpen(false);

        if (copyRoute) {
            const params = recordId ? { copy: recordId } : {};
            router.get(route(copyRoute, params));
            return;
        }

        window.alert('Copy is not available for this record type yet.');
    };
    const handleDelete = () => {
        if (!deleteRoute || !recordId) {
            window.alert('Delete is not available for this record type yet.');
            return;
        }

        const confirmed = window.confirm('Delete Record\n\nAre you sure you want to delete this record?');
        if (!confirmed) return;

        setOpen(false);

        router.delete(route(deleteRoute, recordId), {
            onError: (errors) => {
                const message = Object.values(errors || {}).find(Boolean) || 'This record cannot be deleted right now.';
                window.alert(message);
            },
        });
    };

    if (!recordId || (!copyRoute && !deleteRoute)) {
        return null;
    }

    return (
        <div className="relative" ref={menuRef}>
            <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-600 shadow-sm transition hover:border-[#00713D] hover:text-[#00713D] focus:outline-none"
            >
                {label}
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {open && (
                <div className="absolute right-0 z-50 mt-2 w-48 rounded-xl border border-slate-200 bg-white p-1 shadow-2xl ring-1 ring-black/5">
                    {copyRoute && (
                        <button
                            type="button"
                            onClick={handleCopy}
                            className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
                        >
                            Copy
                            <span className="text-[10px] uppercase tracking-[0.25em] text-slate-400">New</span>
                        </button>
                    )}
                    {deleteRoute && (
                        <button
                            type="button"
                            onClick={handleDelete}
                            className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-rose-600 transition hover:bg-rose-50"
                        >
                            Delete
                            <span className="text-[10px] uppercase tracking-[0.25em] text-rose-400">Confirm</span>
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
