import TransactionHeader from "./TransactionHeader";
import { router } from '@inertiajs/react';
export default function TransactionLayout({
    title,
    amount,
    children,
    onSave,          // ✅ ADD
    onSaveAndNew     // ✅ ADD (optional)
}) {
    return (
        <div className="flex flex-col h-screen bg-white">

            {/* HEADER */}
            <TransactionHeader title={title} amount={amount} />

            {/* CONTENT */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
                {children}
            </div>

            {/* FOOTER - All 5 buttons visible */}
            <div className="sticky bottom-0 bg-white border-t border-gray-300 px-6 py-4 flex items-center justify-between shadow-md">

                {/* Left - Cancel */}
                <button
    onClick={() => router.visit('/journal-entries')} // or wherever
    className="border border-green-600 text-green-600 bg-white px-6 py-2 rounded text-sm font-medium hover:bg-green-50"
>
    Cancel
</button>

                {/* Right - Save & Save and new */}
                <div className="flex gap-4">
    <button
        onClick={onSave}   // 🔥 CONNECTED
        className="bg-green-600 text-white hover:bg-green-700 px-5 py-2 rounded text-sm font-medium"
    >
        Save
    </button>

    <button
        onClick={onSaveAndNew} // optional
        className="bg-green-600 text-white hover:bg-green-700 px-5 py-2 rounded text-sm font-medium"
    >
        Save and new
    </button>
</div>
            </div>
        </div>
    );
}
