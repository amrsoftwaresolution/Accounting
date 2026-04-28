import { useState } from "react";
import axios from "axios";
import TransactionLayout from "@/TransactionLayout/TransactionLayout";
import SearchableSelect from "@/Components/SearchableSelect";
import MemoInput from "@/Components/MemoInput";
import { Head } from "@inertiajs/react";

export default function TransferForm({ accounts = [] }) {
    const [form, setForm] = useState({
        transferFrom: "",
        transferTo: "",
        transferAmount: "",
        date: new Date().toISOString().split('T')[0],
        memo: "",
    });

    const [isProcessing, setIsProcessing] = useState(false);

    // Prepare account options for SearchableSelect
    const accountOptions = accounts.map(acc => ({
        value: acc.id,
        label: `${acc.account_code} - ${acc.name}`,
        balance: acc.balance
    }));

    const selectedFrom = accountOptions.find(opt => opt.value === form.transferFrom);
    const selectedTo = accountOptions.find(opt => opt.value === form.transferTo);

    const handleSave = async (type = 'save') => {
        if (!form.transferFrom || !form.transferTo || !form.transferAmount) {
            alert("Please fill all required fields");
            return;
        }

        setIsProcessing(true);
        try {
            const res = await axios.post(route('transfer.store'), {
                date: form.date,
                transfer_from: form.transferFrom,
                transfer_to: form.transferTo,
                amount: parseFloat(form.transferAmount),
                memo: form.memo
            });

            alert("Transfer Successful ✅");
            if (type === 'close') window.history.back();
            if (type === 'new') window.location.reload();
            if (type === 'save') window.location.reload();

        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || "Error processing transfer ❌");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <TransactionLayout
            title="Transfer Funds"
            amount={parseFloat(form.transferAmount || 0).toFixed(2)}
            onSave={() => handleSave('save')}
            onSaveAndClose={() => handleSave('close')}
            onSaveAndNew={() => handleSave('new')}
            processing={isProcessing}
        >
            <Head title="Transfer Funds" />

            <div className="grid grid-cols-2 gap-x-20 gap-y-8 py-8 border-b">
                {/* Left Column */}
                <div className="space-y-8">
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Transfer Funds From</label>
                        <SearchableSelect
                            options={accountOptions}
                            value={form.transferFrom}
                            onChange={(val) => setForm({ ...form, transferFrom: val })}
                            placeholder="Select Source Account"
                        />
                        {selectedFrom && (
                            <div className="mt-2 flex items-center justify-between">
                                <span className="text-[10px] text-slate-400 font-bold uppercase">Current Balance</span>
                                <span className="text-xs font-bold text-slate-700">LKR {parseFloat(selectedFrom.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Transfer Funds To</label>
                        <SearchableSelect
                            options={accountOptions}
                            value={form.transferTo}
                            onChange={(val) => setForm({ ...form, transferTo: val })}
                            placeholder="Select Destination Account"
                        />
                        {selectedTo && (
                            <div className="mt-2 flex items-center justify-between">
                                <span className="text-[10px] text-slate-400 font-bold uppercase">Current Balance</span>
                                <span className="text-xs font-bold text-slate-700">LKR {parseFloat(selectedTo.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>
                        )}
                    </div>

                    <div className="pt-4 bg-slate-50 -mx-4 px-4 py-6 rounded-2xl border border-slate-100">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Transfer Amount</label>
                        <div className="flex items-baseline gap-3">
                            <span className="text-2xl font-black text-slate-300">LKR</span>
                            <input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                className="w-full bg-transparent border-none p-0 text-4xl font-black text-slate-900 outline-none focus:ring-0 placeholder:text-slate-200"
                                value={form.transferAmount}
                                onChange={(e) => setForm({ ...form, transferAmount: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="space-y-8">
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Date</label>
                        <input
                            type="date"
                            className="w-full border-b border-slate-200 py-2 text-sm bg-transparent outline-none focus:border-blue-500 transition-colors"
                            value={form.date}
                            onChange={(e) => setForm({ ...form, date: e.target.value })}
                        />
                    </div>

                    <div className="pt-10">
                        <MemoInput
                            value={form.memo}
                            onChange={(val) => setForm({ ...form, memo: val })}
                            placeholder="Why are you transferring these funds?"
                        />
                    </div>
                </div>
            </div>
        </TransactionLayout>
    );
}
