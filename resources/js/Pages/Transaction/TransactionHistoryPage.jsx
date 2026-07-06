import { router, usePage } from '@inertiajs/react';
import { useDateFormat, formatDate } from '@/Utils/dateFormat';

const typeLabel = (type = '') => {
    return String(type || '')
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());
};

const getEditRoute = (type) => {
    switch (type) {
        case 'invoice':
            return 'invoice.edit';
        case 'bill':
            return 'bill.edit';
        case 'expense':
            return 'expense.edit';
        default:
            return 'journal-entries.edit';
    }
};

export default function TransactionHistoryPage() {
    const { records = [], transactionType = 'invoice' } = usePage().props;
    const dateFormat = useDateFormat();

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="mx-auto flex max-w-3xl flex-col px-6 py-8">
                <div className="mb-4 flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">History</p>
                        <h1 className="text-lg font-semibold text-slate-800">{typeLabel(transactionType)} history</h1>
                    </div>
                    <button
                        type="button"
                        onClick={() => router.visit(route('dashboard'))}
                        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.25em] text-slate-600 hover:bg-slate-100"
                    >
                        Close
                    </button>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-100 px-4 py-3 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
                        All records
                    </div>
                    <div className="max-h-[70vh] overflow-y-auto p-2 text-[11px] text-slate-700">
                        {records.length === 0 ? (
                            <div className="px-3 py-8 text-center text-[10px] uppercase tracking-[0.25em] text-slate-400">No history found</div>
                        ) : (
                            records.map((record) => (
                                <button
                                    key={record.id}
                                    type="button"
                                    onClick={() => router.visit(route(getEditRoute(transactionType), record.id))}
                                    className="mb-1 block w-full rounded-lg px-3 py-2 text-left text-[11px] text-slate-700 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:bg-slate-100"
                                >
                                    {record.number || record.id} • {formatDate(record.date, dateFormat) || '—'} • {record.name || '—'}
                                </button>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
