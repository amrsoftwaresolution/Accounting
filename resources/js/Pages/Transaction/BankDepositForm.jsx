import { useState, useEffect } from "react";
import { useForm, Head } from "@inertiajs/react";
import axios from "axios";
import TransactionLayout from "@/TransactionLayout/TransactionLayout";
import LineItemsTable from "@/TransactionLayout/LineItemsTable";
import SearchableSelect from "@/Components/SearchableSelect";
import CommonInput from "@/Components/CommonInput";
import QuickAddPayee from "@/Components/QuickAddPayee";
import QuickAddAccount from "@/Components/QuickAddAccount";

export default function BankDepositForm({ auth, nextDepositNo = "" }) {
    const company = auth.company;
    const currencyPrefix = company?.home_currency_prefix || company?.home_currency || '$';

    const [payeeOptions, setPayeeOptions] = useState([]);
    const [accountOptions, setAccountOptions] = useState([]);
    const [paymentMethodOptions, setPaymentMethodOptions] = useState([]);

    const [isPayeeModalOpen, setIsPayeeModalOpen] = useState(false);
    const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
    const [accountModalTarget, setAccountModalTarget] = useState(null);
    const [accountModalRowIndex, setAccountModalRowIndex] = useState(null);

    const fetchPayees = (search = "") => {
        axios.get(route('api.payees', { search })).then(res => setPayeeOptions(res.data));
    };

    const fetchAccounts = (search = "") => {
        axios.get(route('api.accounts', { search })).then(res => setAccountOptions(res.data));
    };

    const fetchPaymentMethods = () => {
        axios.get(route('api.payment-methods')).then(res => setPaymentMethodOptions(res.data));
    };

    const openAccountModal = (target, rowIndex = null) => {
        setAccountModalTarget(target);
        setAccountModalRowIndex(rowIndex);
        setIsAccountModalOpen(true);
    };

    useEffect(() => {
        fetchPayees();
        fetchAccounts();
        fetchPaymentMethods();
    }, []);

    const COLUMNS = [
        { key: "receivedFrom", label: "Received From", placeholder: "Select payee", options: payeeOptions, type: 'select', onAddNew: () => setIsPayeeModalOpen(true) },
        { key: "account", label: "Account", placeholder: "Select account", options: accountOptions, type: 'select', onAddNew: (index) => openAccountModal('item', index) },
        { key: "description", label: "Description", placeholder: "Enter description" },
        { key: "paymentMethod", label: "Payment Method", placeholder: "Select method", options: paymentMethodOptions, type: 'select' },
        { key: "refNo", label: "Ref no.", placeholder: "Reference" },
        { key: "amount", label: "Amount", type: "currency", className: "text-right", inputClass: "text-right" },
    ];

    const { data, setData, post, processing, errors, reset, clearErrors, transform } = useForm({
        depositTo: "",
        depositDate: localStorage.getItem('last_transaction_date') || new Date().toISOString().split('T')[0],
        depositNo: nextDepositNo || "1001",
        items: [
            { receivedFrom: "", account: "", description: "", paymentMethod: "", refNo: "", amount: "0.00" }
        ],
        cashBackAccount: "",
        cashBackMemo: "",
        cashBackAmount: "0.00",
        memo: "",
        action: 'save'
    });

    const totalAmount = data.items.reduce((sum, it) => sum + (parseFloat(String(it.amount).replace(/,/g, '')) || 0), 0).toFixed(2);
    const cashBackAmount = parseFloat(String(data.cashBackAmount).replace(/,/g, '')) || 0;
    const otherFundsTotal = cashBackAmount.toFixed(2);

    const handleItemChange = (index, field, value) => {
        const updated = [...data.items];
        updated[index][field] = value;
        setData('items', updated);
    };

    const handleSave = (action = 'save') => {
        transform((d) => ({ ...d, action }));
        post(route('deposit.store'), {
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
            historyType="bank deposit"
            title={`Bank Deposit #${data.depositNo}`}
            amount={parseFloat(totalAmount)}
            processing={processing}
            onSave={() => handleSave('save')}
            onSaveAndClose={() => handleSave('close')}
            onSaveAndNew={() => handleSave('new')}
            onAddLine={() => setData('items', [...data.items, { receivedFrom: "", account: "", description: "", paymentMethod: "", refNo: "", amount: "0.00" }])}
            onClearRows={() => setData('items', [{ receivedFrom: "", account: "", description: "", paymentMethod: "", refNo: "", amount: "0.00" }])}
        >
            <Head title="Bank Deposit" />

            <div className="py-6 px-1 space-y-8">
                <div className="flex items-start justify-between gap-8">
                    <div className="flex items-start gap-6 flex-1">
                        <div className="w-[320px]">
                            <SearchableSelect
                                label="Account"
                                options={accountOptions}
                                value={data.depositTo}
                                onChange={(val) => setData('depositTo', val)}
                                onSearch={fetchAccounts}
                                onAddNew={() => openAccountModal('depositTo')}
                                placeholder="Select account"
                                size="sm"
                                error={errors.depositTo}
                            />
                        </div>

                        <div className="w-[180px]">
                            <CommonInput
                                type="date"
                                label="Date"
                                value={data.depositDate}
                                onChange={(e) => {
                                    const newDate = e.target.value;
                                    localStorage.setItem('last_transaction_date', newDate);
                                    setData('depositDate', newDate);
                                }}
                                size="sm"
                                error={errors.depositDate}
                            />
                        </div>
                    </div>

                    <div className="text-right flex flex-col items-end">
                        <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-1">Amount</p>
                        <p className="text-4xl font-black tracking-tighter text-slate-900 leading-none">
                            <span className="text-slate-400 text-[10px] font-medium mr-1">{currencyPrefix}</span>
                            {parseFloat(totalAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </p>
                        <div className="w-full max-w-[180px] mt-3">
                            <CommonInput
                                label="Deposit no."
                                value={data.depositNo}
                                onChange={(e) => setData('depositNo', e.target.value)}
                                size="sm"
                                inputClass="font-mono text-right"
                            />
                        </div>
                    </div>
                </div>

                <LineItemsTable
                    columns={COLUMNS}
                    items={data.items}
                    handleItemChange={handleItemChange}
                    addRow={() => setData('items', [...data.items, { receivedFrom: "", account: "", description: "", paymentMethod: "", refNo: "", amount: "0.00" }])}
                    removeRow={(index) => setData('items', data.items.filter((_, i) => i !== index))}
                    clearRows={() => setData('items', [{ receivedFrom: "", account: "", description: "", paymentMethod: "", refNo: "", amount: "0.00" }])}
                    totals={{ "Total": totalAmount }}
                    currencyPrefix={currencyPrefix}
                />

                <div className="grid gap-6 lg:grid-cols-[1fr_auto] mt-8">
                    <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                        <CommonInput
                            type="textarea"
                            label="Memo"
                            placeholder="Add a note for this deposit..."
                            value={data.memo}
                            onChange={(e) => setData('memo', e.target.value)}
                            size="sm"
                            className="h-24"
                        />
                    </div>

                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 flex flex-col justify-end">
                        <div className="border-t border-slate-200 pt-5 mt-auto w-64">
                            <div className="flex items-center justify-between text-sm font-bold text-slate-700 mb-3">
                                <span>Total</span>
                                <span>{currencyPrefix}{parseFloat(totalAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm font-bold text-slate-900">
                                <span>Total (LKR)</span>
                                <span>{currencyPrefix}{parseFloat(totalAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <QuickAddPayee
                isOpen={isPayeeModalOpen}
                onClose={() => setIsPayeeModalOpen(false)}
                onSuccess={(newPayee) => {
                    fetchPayees();
                    if (newPayee) {
                        const updated = [...data.items];
                        if (updated.length > 0) {
                            updated[0].receivedFrom = newPayee.value;
                            setData('items', updated);
                        }
                    }
                }}
                initialType="customer"
            />

            <QuickAddAccount
                isOpen={isAccountModalOpen}
                onClose={() => {
                    setIsAccountModalOpen(false);
                    setAccountModalTarget(null);
                    setAccountModalRowIndex(null);
                }}
                onSuccess={(newAccount) => {
                    fetchAccounts();
                    if (!newAccount) {
                        setAccountModalTarget(null);
                        setAccountModalRowIndex(null);
                        return;
                    }

                    if (accountModalTarget === 'depositTo') {
                        setData('depositTo', newAccount.value);
                    }
                    if (accountModalTarget === 'cashBackAccount') {
                        setData('cashBackAccount', newAccount.value);
                    }
                    if (accountModalTarget === 'item' && accountModalRowIndex !== null) {
                        const updated = [...data.items];
                        if (updated[accountModalRowIndex]) {
                            updated[accountModalRowIndex].account = newAccount.value;
                            setData('items', updated);
                        }
                    }

                    setAccountModalTarget(null);
                    setAccountModalRowIndex(null);
                }}
            />

        </TransactionLayout>
    );
}
