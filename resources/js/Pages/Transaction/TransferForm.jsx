import { useState } from "react";
import TransactionLayout from "@/TransactionLayout/TransactionLayout";
import BottomSection from "@/TransactionLayout/BottomSection";

export default function TransferForm() {
    const [form, setForm] = useState({
        transferFrom: "",
        transferTo: "",
        transferAmount: "",
        date: "2026-04-06",
        memo: "",
    });

    // Formatting the amount for the header
    const displayAmount = parseFloat(form.transferAmount || 0).toFixed(2);

    return (
        <TransactionLayout title="Transfer" amount={displayAmount}>

            {/* TOP SECTION: Transfer Specific Fields */}
            <div className="grid grid-cols-2 gap-x-20 gap-y-6 py-6 border-b">

                {/* Left Column */}
                <div className="space-y-6">
                    <div>
                        <label className="text-xs text-gray-500 block mb-1">Transfer Funds From</label>
                        <select
                            className="w-full border-b border-gray-300 py-1 text-sm bg-transparent outline-none focus:border-green-600"
                            value={form.transferFrom}
                            onChange={(e) => setForm({...form, transferFrom: e.target.value})}
                        >
                            <option value="">Select Account</option>
                            <option value="cash">Cash</option>
                            <option value="bank">Bank Account</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-xs text-gray-500 block mb-1">Transfer Funds To</label>
                        <select
                            className="w-full border-b border-gray-300 py-1 text-sm bg-transparent outline-none focus:border-green-600"
                            value={form.transferTo}
                            onChange={(e) => setForm({...form, transferTo: e.target.value})}
                        >
                            <option value="">Select Account</option>
                            <option value="petty_cash">Petty Cash</option>
                            <option value="savings">Savings</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-xs text-gray-500 block mb-1">Transfer Amount</label>
                        <input
                            type="number"
                            placeholder="0.00"
                            className="w-1/2 border border-gray-300 rounded px-2 py-1 text-sm focus:border-green-600 outline-none"
                            value={form.transferAmount}
                            onChange={(e) => setForm({...form, transferAmount: e.target.value})}
                        />
                    </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    <div>
                        <p className="text-xs text-gray-400">Balance</p>
                        <p className="text-sm font-medium text-gray-700">LKR 0.00</p>
                    </div>

                    <div>
                        <p className="text-xs text-gray-400">Balance</p>
                        <p className="text-sm font-medium text-gray-700">LKR 0.00</p>
                    </div>

                    <div>
                        <label className="text-xs text-gray-500 block mb-1">Date</label>
                        <input
                            type="date"
                            className="w-full border-b border-gray-300 py-1 text-sm bg-transparent outline-none focus:border-green-600"
                            value={form.date}
                            onChange={(e) => setForm({...form, date: e.target.value})}
                        />
                    </div>
                </div>
            </div>

            {/* Reusing your BottomSection for Memo & Attachments */}
            <div className="mt-6">
                <BottomSection form={form} setForm={setForm} />
            </div>

            <div className="text-center text-[10px] text-gray-400 mt-10">
                Privacy
            </div>

        </TransactionLayout>
    );
}
