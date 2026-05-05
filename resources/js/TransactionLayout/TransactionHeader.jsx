import { router, usePage } from '@inertiajs/react';

export default function TransactionHeader({ title, amount }) {
    const { auth } = usePage().props;
    const company = auth.company;
    const currencyPrefix = company?.home_currency_prefix || company?.home_currency || '$';

    return (
        <div className="flex items-center justify-between border-b px-6 py-1.5 bg-white">

            {/* LEFT SIDE */}
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-slate-100 rounded-lg text-slate-500">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h1 className="text-lg font-semibold text-gray-800">
                        {title}
                    </h1>
                </div>

                {amount !== null && amount !== undefined && (
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5">Amount</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-[11px] font-bold text-slate-400">{currencyPrefix}</span>
                            <span className="text-xl font-black tracking-tight text-slate-900 leading-none">
                                {parseFloat(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* RIGHT SIDE */}
            <div className="flex items-center gap-6">
                {/* Icons */}
                <div className="flex items-center gap-4 text-gray-500 text-sm">
                    <button
                        onClick={() => router.get(route('dashboard'))}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
                    >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
