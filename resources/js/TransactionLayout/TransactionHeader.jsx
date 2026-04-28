import { router } from '@inertiajs/react';
export default function TransactionHeader({ title, amount }) {
    return (
        <div className="flex items-center justify-between border-b px-6 py-1.5 bg-white">

            {/* LEFT SIDE */}
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
