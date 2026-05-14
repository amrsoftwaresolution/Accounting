import { useState, useEffect } from "react";
import { useForm, Head, router } from "@inertiajs/react";
import axios from "axios";
import TransactionLayout from "@/TransactionLayout/TransactionLayout";
import SearchableSelect from "@/Components/SearchableSelect";
import CommonInput from "@/Components/CommonInput";
import QuickAddPayee from "@/Components/QuickAddPayee";
import QuickAddPaymentMethod from "@/Components/QuickAddPaymentMethod";
import QuickAddAccount from "@/Components/QuickAddAccount";

export default function ReceivePaymentForm({ paymentMethods = [] }) {
    const [customerOptions, setCustomerOptions] = useState([]);
    const [accountOptions, setAccountOptions] = useState([]);
    
    // Modal States
    const [isPayeeModalOpen, setIsPayeeModalOpen] = useState(false);
    const [isMethodModalOpen, setIsMethodModalOpen] = useState(false);
    const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);

    const fetchCustomers = (search = "") => {
        axios.get(route('api.payees', { search, type: 'Customer' })).then(res => {
            setCustomerOptions(res.data);
        });
    };

    const fetchAccounts = (search = "") => {
        axios.get(route('api.accounts', { search })).then(res => {
            setAccountOptions(res.data);
        });
    };

    useEffect(() => {
        fetchCustomers();
        fetchAccounts();
    }, []);

    const methodOptions = paymentMethods.map(m => ({ value: m.id, label: m.name }));
    const [currentAction, setCurrentAction] = useState('save');

    const { data, setData, post, processing, errors, reset, clearErrors, transform } = useForm({
        customer: "",
        email: "",
        paymentDate: new Date().toISOString().split('T')[0],
        paymentMethod: "",
        referenceNo: "",
        depositTo: "",
        amountReceived: "0.00",
        memo: "",
        action: 'save',
    });

    useEffect(() => {
        transform((data) => ({
            ...data,
            amountReceived: String(data.amountReceived).replace(/,/g, ''),
            action: currentAction,
        }));
    }, [currentAction, data.amountReceived]);

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
                                onSearch={fetchCustomers}
                                onAddNew={() => setIsPayeeModalOpen(true)}
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
                            onAddNew={() => setIsMethodModalOpen(true)}
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
                            onSearch={fetchAccounts}
                            onAddNew={() => setIsAccountModalOpen(true)}
                            value={data.depositTo}
                            onChange={(val) => setData("depositTo", val)}
                            placeholder="Select Account"
                            size="sm"
                            error={errors.depositTo}
                        />
                    </div>
                    <div className="w-[180px]">
                        <CommonInput
                            type="text"
                            label="Amount Received"
                            placeholder="0.00"
                            value={data.amountReceived}
                            onChange={(e) => {
                                // Allow only numbers and decimal point
                                const val = e.target.value.replace(/[^0-9.]/g, '');
                                setData("amountReceived", val);
                            }}
                            onBlur={(e) => {
                                const val = parseFloat(e.target.value || 0);
                                setData("amountReceived", val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
                            }}
                            onFocus={(e) => {
                                const val = e.target.value.replace(/,/g, '');
                                setData("amountReceived", val);
                            }}
                            size="sm"
                            inputClass="text-right font-semibold"
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

            <QuickAddPayee
                isOpen={isPayeeModalOpen}
                onClose={() => setIsPayeeModalOpen(false)}
                onSuccess={(newPayee) => {
                    if (newPayee) {
                        fetchCustomers();
                        setData("customer", newPayee.value);
                    }
                }}
                initialType="customer"
            />

            <QuickAddAccount
                isOpen={isAccountModalOpen}
                onClose={() => setIsAccountModalOpen(false)}
                onSuccess={(newAccount) => {
                    fetchAccounts();
                    if (newAccount) {
                        setData("depositTo", newAccount.value);
                    }
                }}
            />

            <QuickAddPaymentMethod
                isOpen={isMethodModalOpen}
                onClose={() => setIsMethodModalOpen(false)}
                onSuccess={(newMethod) => {
                    router.reload({ only: ['paymentMethods'] });
                }}
            />

        </TransactionLayout>
    );
}
