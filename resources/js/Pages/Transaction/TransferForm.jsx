import { useState } from "react";
import axios from "axios";
import TransactionLayout from "@/TransactionLayout/TransactionLayout";
import SearchableSelect from "@/Components/SearchableSelect";
import CommonInput from "@/Components/CommonInput";
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

            <div className="py-6 px-1 space-y-8">
                {/* ROW 1: From & To & Balance Display */}
                <div className="flex items-start justify-between gap-8">
                    <div className="flex items-start gap-6 flex-1">
                        <div className="w-[380px]">
                            <SearchableSelect 
                                label="Transfer Funds From"
                                options={accountOptions}
                                value={form.transferFrom}
                                onChange={(val) => setForm({ ...form, transferFrom: val })}
                                placeholder="Select Source Account"
                                size="sm"
                            />
                            {selectedFrom && (
                                <div className="mt-1 flex items-baseline gap-2">
                                    <span className="text-[8px] text-slate-400 font-black uppercase tracking-widest">Balance</span>
                                    <span className="text-[10px] font-bold text-slate-700">LKR {parseFloat(selectedFrom.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                </div>
                            )}
                        </div>
                        <div className="w-[380px]">
                            <SearchableSelect 
                                label="Transfer Funds To"
                                options={accountOptions}
                                value={form.transferTo}
                                onChange={(val) => setForm({ ...form, transferTo: val })}
                                placeholder="Select Destination Account"
                                size="sm"
                            />
                            {selectedTo && (
                                <div className="mt-1 flex items-baseline gap-2">
                                    <span className="text-[8px] text-slate-400 font-black uppercase tracking-widest">Balance</span>
                                    <span className="text-[10px] font-bold text-slate-700">LKR {parseFloat(selectedTo.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Amount Display */}
                    <div className="text-right flex flex-col items-end">
                        <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-1">Transfer Amount</p>
                        <p className="text-4xl font-black tracking-tighter text-slate-900 leading-none">
                            <span className="text-slate-400 text-[10px] font-medium mr-1">LKR</span>
                            {parseFloat(form.transferAmount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </p>
                    </div>
                </div>

                {/* ROW 2: Date, Amount Input */}
                <div className="flex items-end gap-6">
                    <div className="w-[180px]">
                        <CommonInput 
                            type="date"
                            label="Date"
                            value={form.date}
                            onChange={(e) => setForm({ ...form, date: e.target.value })}
                            size="sm"
                        />
                    </div>
                    <div className="w-[180px]">
                        <CommonInput 
                            type="number"
                            label="Transfer Amount"
                            placeholder="0.00"
                            value={form.transferAmount}
                            onChange={(e) => setForm({ ...form, transferAmount: e.target.value })}
                            size="sm"
                        />
                    </div>
                </div>

                {/* ROW 3: Memo */}
                <div className="w-[500px] mt-8 pt-4 border-t border-slate-100">
                    <CommonInput 
                        type="textarea"
                        label="Memo"
                        placeholder="Why are you transferring these funds?"
                        value={form.memo}
                        onChange={(e) => setForm({ ...form, memo: e.target.value })}
                        size="sm"
                        className="h-24"
                    />
                </div>
            </div>
        </TransactionLayout>
    );
}
