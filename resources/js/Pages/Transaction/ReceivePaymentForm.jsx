import { useState } from "react";
import TransactionLayout from "@/TransactionLayout/TransactionLayout";
import BottomSection from "@/TransactionLayout/BottomSection";

export default function ReceivePaymentForm() {
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
            {/* TOP SECTION: Payment Details */}
            <div className="py-6 border-b space-y-6">

                {/* Row 1: Customer and Email */}
                <div className="grid grid-cols-3 gap-8 items-start">
                    <div>
                        <label className="text-xs text-gray-500 block mb-1 font-medium">Customer</label>
                        <select
                            className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:ring-1 focus:ring-green-600 outline-none"
                            value={form.customer}
                            onChange={(e) => setForm({...form, customer: e.target.value})}
                        >
                            <option value="">Choose a customer</option>
                        </select>
                    </div>

                    <div className="relative">
                        <label className="text-xs text-gray-500 block mb-1 font-medium">Email</label>
                        <input
                            type="email"
                            placeholder="Email (Separate emails with a comma)"
                            className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:ring-1 focus:ring-green-600 outline-none"
                            value={form.email}
                            onChange={(e) => setForm({...form, email: e.target.value})}
                        />
                        <div className="flex items-center gap-2 mt-1">
                            <input type="checkbox" id="sendLater" className="rounded border-gray-300" />
                            <label htmlFor="sendLater" className="text-[10px] text-gray-500">Send later</label>
                        </div>
                    </div>

                    <div className="flex flex-col items-end">
                        <button className="border border-green-600 text-green-700 px-4 py-1 rounded text-sm font-medium hover:bg-green-50">
                            Find by invoice no.
                        </button>
                        <div className="mt-4 text-right">
                             <p className="text-[10px] text-gray-400 uppercase font-bold">Amount Received</p>
                             <p className="text-3xl font-bold text-gray-800 tracking-tight">LKR {form.amountReceived}</p>
                             <p className="text-[10px] text-gray-400">Customer balance LKR 0.00</p>
                        </div>
                    </div>
                </div>

                {/* Row 2: Date */}
                <div className="w-1/4">
                    <label className="text-xs text-gray-500 block mb-1 font-medium">Payment Date</label>
                    <input
                        type="date"
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-green-600"
                        value={form.paymentDate}
                        onChange={(e) => setForm({...form, paymentDate: e.target.value})}
                    />
                </div>

                {/* Row 3: Method, Ref, Deposit To, and Amount Received */}
                <div className="grid grid-cols-4 gap-6 items-end">
                    <div>
                        <label className="text-xs text-gray-500 block mb-1 font-medium">Payment method</label>
                        <select
                            className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm outline-none focus:ring-1 focus:ring-green-600"
                            value={form.paymentMethod}
                            onChange={(e) => setForm({...form, paymentMethod: e.target.value})}
                        >
                            <option value="">Choose payment method</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-xs text-gray-500 block mb-1 font-medium">Reference no.</label>
                        <input
                            type="text"
                            className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm outline-none focus:ring-1 focus:ring-green-600"
                            value={form.referenceNo}
                            onChange={(e) => setForm({...form, referenceNo: e.target.value})}
                        />
                    </div>

                    <div>
                        <label className="text-xs text-gray-500 block mb-1 font-medium">Deposit To</label>
                        <select
                            className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm outline-none focus:ring-1 focus:ring-green-600"
                            value={form.depositTo}
                            onChange={(e) => setForm({...form, depositTo: e.target.value})}
                        >
                            <option value="Cash Rasly">Cash Rasly</option>
                        </select>
                    </div>

                    <div className="text-right">
                        <label className="text-xs text-gray-500 block mb-1 font-medium">Amount received</label>
                        <input
                            type="number"
                            placeholder="0.00"
                            className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm text-right outline-none focus:ring-1 focus:ring-green-600"
                            value={form.amountReceived}
                            onChange={(e) => setForm({...form, amountReceived: e.target.value})}
                        />
                    </div>
                </div>
            </div>

            {/* Reusing BottomSection */}
            <div className="mt-6">
                <BottomSection form={form} setForm={setForm} />
            </div>

            <div className="text-center text-[10px] text-gray-400 mt-10">
                Privacy
            </div>

        </TransactionLayout>
    );
}
