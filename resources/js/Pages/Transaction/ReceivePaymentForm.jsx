import { useState, useEffect } from "react";
import axios from "axios";
import TransactionLayout from "@/TransactionLayout/TransactionLayout";
import SearchableSelect from "@/Components/SearchableSelect";
import CommonInput from "@/Components/CommonInput";
import { Head } from "@inertiajs/react";

export default function ReceivePaymentForm({ accounts = [], paymentMethods = [] }) {
    const [customerOptions, setCustomerOptions] = useState([]);
    
    const fetchCustomers = (search = "") => {
        axios.get(route('api.payees', { search, type: 'Customer' })).then(res => {
            setCustomerOptions(res.data);
        });
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    const accountOptions = accounts.map(acc => ({ value: acc.id, label: `${acc.account_code} - ${acc.name}` }));
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
            <Head title="Receive Payment" />

            <div className="py-6 space-y-8">
                {/* ROW 1: Customer & Summaries */}
                <div className="flex items-start justify-between gap-8">
                    <div className="flex items-start gap-6 flex-1">
                        <div className="w-[380px]">
                            <SearchableSelect
                                label="Customer"
                                options={customerOptions}
                                value={form.customer}
                                onChange={(val) => setForm({ ...form, customer: val })}
                                placeholder="Choose a customer"
                                size="sm"
                            />
                        </div>
                    </div>

                    {/* Amount Summary */}
                    <div className="text-right flex flex-col items-end">
                        <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-1">Amount Received</p>
                        <p className="text-4xl font-black tracking-tighter text-slate-900 leading-none">
                            <span className="text-slate-400 text-[10px] font-medium mr-1">LKR</span>
                            {parseFloat(form.amountReceived || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </p>
                    </div>
                </div>

                {/* ROW 2: Payment Details */}
                <div className="flex items-end gap-6">
                    <div className="w-[180px]">
                        <CommonInput
                            type="date"
                            label="Payment Date"
                            value={form.paymentDate}
                            onChange={(e) => setForm({ ...form, paymentDate: e.target.value })}
                            size="sm"
                        />
                    </div>
                    <div className="w-[180px]">
                        <SearchableSelect
                            label="Payment method"
                            options={methodOptions}
                            value={form.paymentMethod}
                            onChange={(val) => setForm({ ...form, paymentMethod: val })}
                            placeholder="Choose method"
                            size="sm"
                        />
                    </div>
                    <div className="w-[180px]">
                        <CommonInput
                            label="Reference no."
                            value={form.referenceNo}
                            onChange={(e) => setForm({ ...form, referenceNo: e.target.value })}
                            size="sm"
                            inputClass="font-mono"
                        />
                    </div>
                    <div className="w-[220px]">
                        <SearchableSelect
                            label="Deposit To"
                            options={accountOptions}
                            value={form.depositTo}
                            onChange={(val) => setForm({ ...form, depositTo: val })}
                            placeholder="Select Account"
                            size="sm"
                        />
                    </div>
                    <div className="w-[180px]">
                        <CommonInput
                            type="number"
                            label="Amount Received"
                            placeholder="0.00"
                            value={form.amountReceived}
                            onChange={(e) => setForm({ ...form, amountReceived: e.target.value })}
                            size="sm"
                        />
                    </div>
                </div>

                {/* ROW 3: Memo */}
                <div className="w-[500px] mt-8 pt-4 border-t border-slate-100">
                    <CommonInput
                        type="textarea"
                        label="Memo"
                        placeholder="Add a memo..."
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
