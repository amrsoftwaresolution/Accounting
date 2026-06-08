import { router, usePage } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import RecentTransactionHistory from '@/Components/RecentTransactionHistory';

export default function TransactionHeader({ title, amount, historyType = null, dirty = false, onClose }) {
    const { auth } = usePage().props;
    const company = auth.company;
    const currencyPrefix = company?.home_currency_prefix || company?.home_currency || '$';

    return (
        <div className="flex items-center justify-between border-b px-6 py-1.5 bg-white">

            {/* LEFT SIDE */}
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                    <ApplicationLogo className="h-7 w-auto" />
                    <div className="h-6 w-px bg-slate-200 mx-1" />
                    {historyType && <RecentTransactionHistory historyType={historyType} dirty={dirty} />}
                    <h1 className="text-lg font-semibold text-gray-800">
                        {title}
                    </h1>
                </div>
            </div>

            {/* RIGHT SIDE */}
            <div className="flex items-center gap-6">
                {/* Icons */}
                <div className="flex items-center gap-4 text-gray-500 text-sm">
                    <button
                        onClick={onClose || (() => router.get(route('dashboard')))}
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
