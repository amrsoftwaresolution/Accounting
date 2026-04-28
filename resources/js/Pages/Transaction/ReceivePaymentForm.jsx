import { useState } from "react";
import TransactionLayout from "@/TransactionLayout/TransactionLayout";
import SearchableSelect from "@/Components/SearchableSelect";
import MemoInput from "@/Components/MemoInput";

export default function ReceivePaymentForm({ accounts = [], customers = [], paymentMethods = [] }) {
    const accountOptions = accounts.map(acc => ({ value: acc.id, label: `${acc.account_code} - ${acc.name}` }));
    const customerOptions = customers.map(c => ({ value: c.id, label: c.display_name || c.name }));
    const methodOptions = paymentMethods.map(m => ({ value: m.id, label: m.name }));

    const [form, setForm] = useState({
        customer: "",
        email: "",
        paymentDate: "2026-04-06",
        paymentMethod: "",
        referenceNo: "",
        depositTo: "Cash Rasly",
        amountReceived: "0.00",
        memo: "",
    });

    return (
        <TransactionLayout
            title="Receive Payment"
            amount={parseFloat(form.amountReceived || 0).toFixed(2)}
        >
            {/* TOP SECTION: Redesigned for Premium Look */}
            <div className="grid grid-cols-12 gap-10 py-8 border-b border-slate-200">
                
                {/* Left Column: Customer Selection */}
                <div className="col-span-4">
                    <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm space-y-6">
                        <SearchableSelect
                            label="Customer"
                            options={customerOptions}
                            value={form.customer}
                            onChange={(val) => setForm({ ...form, customer: val })}
                            placeholder="Choose a customer"
                            initialLimit={10}
                        />
                        <button className="w-full border border-primary text-primary py-2 rounded-lg text-sm font-bold hover:bg-primary/5 transition-colors">
                            Find by invoice no.
                        </button>
                    </div>
                </div>

                {/* Right Column: Payment Details & Summary */}
                <div className="col-span-8 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <div className="grid grid-cols-2 gap-x-8 gap-y-6 flex-1">
                            <div>
                                <label className="text-xs text-slate-500 block mb-1 font-bold">Payment Date</label>
                                <input
                                    type="date"
                                    className="w-full border-b border-slate-300 py-1.5 text-sm outline-none focus:border-primary bg-transparent transition-all"
                                    value={form.paymentDate}
                                    onChange={(e) => setForm({ ...form, paymentDate: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 block mb-1 font-bold">Payment method</label>
                                <SearchableSelect
                                    options={methodOptions}
                                    value={form.paymentMethod}
                                    onChange={(val) => setForm({ ...form, paymentMethod: val })}
                                    placeholder="Choose method"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 block mb-1 font-bold">Reference no.</label>
                                <input
                                    type="text"
                                    className="w-full border-b border-slate-300 py-1.5 text-sm outline-none focus:border-[#00713D] bg-transparent transition-all font-mono"
                                    value={form.referenceNo}
                                    onChange={(e) => setForm({ ...form, referenceNo: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 block mb-1 font-bold">Deposit To</label>
                                <SearchableSelect
                                    options={accountOptions}
                                    value={form.depositTo}
                                    onChange={(val) => setForm({ ...form, depositTo: val })}
                                    placeholder="Select Account"
                                    initialLimit={10}
                                />
                            </div>
                        </div>

                        {/* Amount Received Summary Box */}
                        <div className="ml-10 flex flex-col items-end gap-2">
                            <div className="text-right bg-slate-900 text-white p-6 rounded-2xl shadow-xl min-w-[240px] transform hover:scale-105 transition-transform">
                                <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Amount Received</p>
                                <p className="text-3xl font-black tracking-tighter">
                                    <span className="text-slate-400 text-sm font-medium mr-1">LKR</span>
                                    {parseFloat(form.amountReceived || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </p>
                            </div>
                            
                            <div className="text-right px-2">
                                <label className="text-[10px] text-slate-500 font-bold uppercase block">Amount to apply</label>
                                <input
                                    type="number"
                                    placeholder="0.00"
                                    className="text-xl font-bold text-slate-800 text-right outline-none bg-transparent w-32 border-b border-dashed border-slate-300 focus:border-primary"
                                    value={form.amountReceived}
                                    onChange={(e) => setForm({ ...form, amountReceived: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Reusing BottomSection */}
            <div className="mt-8 max-w-md">
                <MemoInput
                    value={form.memo}
                    onChange={(val) => setForm({ ...form, memo: val })}
                    placeholder="Add a memo..."
                />
            </div>

        </TransactionLayout>
    );
}
