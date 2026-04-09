import { router } from '@inertiajs/react';
export default function TransactionHeader({ title, amount }) {
    return (
        <div className="flex items-center justify-between border-b px-6 py-3 bg-white">

            {/* LEFT SIDE */}
            <div className="flex items-center gap-2">
                <span className="text-gray-500 text-lg">⏱</span>
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
                    className="text-lg hover:text-gray-700">
                        ❌
                    </button>
                </div>
            </div>
        </div>
    );
}
