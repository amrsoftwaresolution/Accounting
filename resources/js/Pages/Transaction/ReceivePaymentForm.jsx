import { useState, useEffect } from "react";
import { useForm } from "@inertiajs/react";
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
    const [currentAction, setCurrentAction] = useState('save');

    const { data, setData, post, processing, errors, reset, clearErrors, transform } = useForm({
        customer: "",
        email: "",
        paymentDate: "2026-04-06",
        paymentMethod: "",
        referenceNo: "",
        depositTo: "Cash Rasly",
        amountReceived: "0.00",
        memo: "",
        action: 'save',
    });

    useEffect(() => {
        transform((data) => ({
            ...data,
            action: currentAction,
        }));
    }, [currentAction]);

    const submit = (action = 'save') => {
        setCurrentAction(action);

        post(route('payment.store'), {
            preserveScroll: true,
            preserveState: action === 'save',
            onSuccess: () => {
                if (action === 'new') {
                    reset();
                    clearErrors();
                }
            }
        });
    };

    return (
        <TransactionLayout
            title="Receive Payment"
            amount={parseFloat(data.amountReceived || 0).toFixed(2)}
            onSave={() => submit('save')}
            onSaveAndClose={() => submit('close')}
            onSaveAndNew={() => submit('new')}
            processing={processing}
            dirty={Object.keys(data).some((key) => key !== 'action' && String(data[key]) !== "")}
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
                                value={data.customer}
                                onChange={(val) => setData("customer", val)}
                                placeholder="Choose a customer"
                                size="sm"
                                error={errors.customer}
                            />
                        </div>
                    </div>

                    {/* Amount Summary */}
                    <div className="text-right flex flex-col items-end">
                        <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-1">Amount Received</p>
                        <p className="text-4xl font-black tracking-tighter text-slate-900 leading-none">
                            <span className="text-slate-400 text-[10px] font-medium mr-1">LKR</span>
                            {parseFloat(data.amountReceived || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </p>
                    </div>
                </div>

                {/* ROW 2: Payment Details */}
                <div className="flex items-end gap-6">
                    <div className="w-[180px]">
                        <CommonInput
                            type="date"
                            label="Payment Date"
                            value={data.paymentDate}
                            onChange={(e) => setData("paymentDate", e.target.value)}
                            size="sm"
                            error={errors.paymentDate}
                        />
                    </div>
                    <div className="w-[220px]">
                        <SearchableSelect
                            label="Payment Method"
                            placeholder="Select method"
                            value={data.paymentMethod}
                            onChange={(val) => setData("paymentMethod", val)}
                            options={methodOptions}
                            size="sm"
                            error={errors.paymentMethod}
                        />
                    </div>
                    <div className="w-[180px]">
                        <CommonInput
                            label="Reference no."
                            value={data.referenceNo}
                            onChange={(e) => setData("referenceNo", e.target.value)}
                            size="sm"
                            inputClass="font-mono"
                            error={errors.referenceNo}
                        />
                    </div>
                    <div className="w-[220px]">
                        <SearchableSelect
                            label="Deposit To"
                            options={accountOptions}
                            value={data.depositTo}
                            onChange={(val) => setData("depositTo", val)}
                            placeholder="Select Account"
                            size="sm"
                            error={errors.depositTo}
                        />
                    </div>
                    <div className="w-[180px]">
                        <CommonInput
                            type="number"
                            label="Amount Received"
                            placeholder="0.00"
                            value={data.amountReceived}
                            onChange={(e) => setData("amountReceived", e.target.value)}
                            size="sm"
                            error={errors.amountReceived}
                        />
                    </div>
                </div>

                {/* ROW 3: Memo */}
                <div className="w-[500px] mt-8 pt-4 border-t border-slate-100">
                    <CommonInput
                        type="textarea"
                        label="Memo"
                        placeholder="Add a memo..."
                        value={data.memo}
                        onChange={(e) => setData("memo", e.target.value)}
                        size="sm"
                        className="h-24"
                        error={errors.memo}
                    />
                </div>
            </div>

        </TransactionLayout>
    );
}
