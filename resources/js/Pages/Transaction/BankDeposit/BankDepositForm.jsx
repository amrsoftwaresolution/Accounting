import { useState, useEffect } from "react";
import { useForm, Head } from "@inertiajs/react";
import axios from "axios";
import TransactionLayout from "@/TransactionLayout/TransactionLayout";
import LineItemsTable from "@/TransactionLayout/LineItemsTable";
import SearchableSelect from "@/Components/SearchableSelect";
import CommonInput from "@/Components/CommonInput";
import QuickAddPayee from "@/Components/QuickAddPayee";
import QuickAddAccount from "@/Components/QuickAddAccount";
import { showToast } from "@/Components/ToastNotification";

export default function BankDepositForm({ auth, nextRef = "", deposit = null }) {
    const company = auth.company;
    const currencyPrefix = company?.home_currency_prefix || company?.home_currency || 'LKR ';

    const [payeeOptions, setPayeeOptions] = useState([]);
    const [accountOptions, setAccountOptions] = useState([]);
    const [depositAccountOptions, setDepositAccountOptions] = useState([]);
    const [paymentMethodOptions, setPaymentMethodOptions] = useState([]);

    const [isPayeeModalOpen, setIsPayeeModalOpen] = useState(false);
    const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
    const [accountModalTarget, setAccountModalTarget] = useState(null);
    const [accountModalRowIndex, setAccountModalRowIndex] = useState(null);
    const [isDirty, setIsDirty] = useState(false);
    const [savedEntryId, setSavedEntryId] = useState(deposit?.id || null);
    const defaultCurrencyCode = company?.home_currency || 'LKR';

    const fetchPayees = (search = "") => {
        axios.get(route('api.payees', { search })).then(res => setPayeeOptions(res.data));
    };

    const fetchAccounts = (search = "") => {
        axios.get(route('api.accounts', { search })).then(res => setAccountOptions(res.data));
    };

    const fetchDepositAccounts = (search = "") => {
        axios.get(route('api.accounts', { search, type: 'asset' })).then(res => setDepositAccountOptions(res.data));
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
        fetchDepositAccounts();
        fetchPaymentMethods();
    }, []);

    const COLUMNS = [
        { key: "receivedFrom", label: "Received From", placeholder: "Select payee", options: payeeOptions, type: 'select', onAddNew: () => setIsPayeeModalOpen(true) },
        { key: "account", label: "Account", placeholder: "Select account", options: accountOptions, type: 'select', onAddNew: (index) => openAccountModal('item', index) },
        { key: "description", label: "Description", placeholder: "Enter description" },
        { key: "paymentMethod", label: "ReceivePayment Method", placeholder: "Select method", options: paymentMethodOptions, type: 'select' },
        { key: "refNo", label: "Ref no.", placeholder: "Reference" },
        { key: "amount", label: "Amount", type: "currency", className: "text-right", inputClass: "text-right" },
    ];

    const { data, setData, post, patch, processing, errors, reset, clearErrors, transform } = useForm({
        depositTo: deposit?.depositTo || "",
        depositDate: deposit?.depositDate || localStorage.getItem('last_transaction_date') || new Date().toISOString().split('T')[0],
        depositNo: deposit?.depositNo || nextRef || "1001",
        items: deposit?.items && deposit.items.length > 0 ? deposit.items.map(i => ({
            ...i,
            amount: parseFloat(i.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        })) : [
            { receivedFrom: "", account: "", description: "", paymentMethod: "", refNo: "", amount: "0.00" }
        ],
        cashBackAccount: deposit?.cashBackAccount || "",
        cashBackMemo: deposit?.cashBackMemo || "",
        cashBackAmount: deposit?.cashBackAmount ? parseFloat(deposit.cashBackAmount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00",
        memo: deposit?.memo || "",
        action: 'save'
    });

    useEffect(() => {
        if (deposit) {
            setData({
                depositTo: deposit.depositTo || "",
                depositDate: deposit.depositDate || "",
                depositNo: deposit.depositNo || "",
                items: deposit.items && deposit.items.length > 0 ? deposit.items.map(i => ({
                    ...i,
                    amount: parseFloat(i.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                })) : [
                    { receivedFrom: "", account: "", description: "", paymentMethod: "", refNo: "", amount: "0.00" }
                ],
                cashBackAccount: deposit.cashBackAccount || "",
                cashBackMemo: deposit.cashBackMemo || "",
                cashBackAmount: deposit.cashBackAmount ? parseFloat(deposit.cashBackAmount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00",
                memo: deposit.memo || "",
                action: 'save'
            });
        }
        clearErrors();
    }, [deposit]);

    const totalAmount = data.items.reduce((sum, it) => sum + (parseFloat(String(it.amount).replace(/,/g, '')) || 0), 0).toFixed(2);
    const cashBackAmount = parseFloat(String(data.cashBackAmount).replace(/,/g, '')) || 0;
    const otherFundsTotal = cashBackAmount.toFixed(2);


    const handleItemChange = (index, field, value) => {
        const updated = [...data.items];
        updated[index][field] = value;
        setData('items', updated);
        setIsDirty(true);
    };

    const handleSave = (action = 'save') => {
        transform((d) => ({ ...d, action }));
        const url = deposit?.id ? route('bank-deposit.update', deposit.id) : route('bank-deposit.store');
        const method = deposit?.id ? patch : post;

        method(url, {
            onSuccess: (page) => {
                showToast('success', 'Record saved successfully.');
                setIsDirty(false);

                const newId = page.props?.flash?.journal_entry_id
                    || page.props?.deposit?.id
                    || page.props?.record?.id;
                if (newId && !savedEntryId) {
                    setSavedEntryId(newId);
                }

                if (action === 'new') {
                    setSavedEntryId(null);
                    const currentRef = data.depositNo || nextRef || '1001';
                    const num = parseInt(String(currentRef).replace(/[^0-9]/g, '')) || 1000;
                    const nextRef = String(num + 1).padStart(4, '0');
                    const currentDate = data.depositDate;
                    reset();
                    setData('depositNo', nextRef);
                    setData('depositDate', currentDate);
                    clearErrors();
                    setIsDirty(false);
                }
            }
        });
    };

    return (
        <TransactionLayout
            historyType="bank_deposit"
            title={deposit?.id ? `Edit Bank Deposit #${data.depositNo}` : `Bank Deposit #${data.depositNo}`}
            amount={parseFloat(totalAmount)}
            processing={processing}
            dirty={isDirty}
            onSave={() => handleSave('save')}
            onSaveAndClose={() => handleSave('close')}
            onSaveAndNew={() => handleSave('new')}
            onDelete={deposit?.id ? () => {
                if (confirm('Are you sure you want to delete this deposit?')) {
                    router.delete(route('bank-deposit.destroy', deposit.id));
                }
            } : undefined}
            onAddLine={() => { setData('items', [...data.items, { receivedFrom: "", account: "", description: "", paymentMethod: "", refNo: "", amount: "0.00" }]); setIsDirty(true); }}
            onClearRows={() => { setData('items', [{ receivedFrom: "", account: "", description: "", paymentMethod: "", refNo: "", amount: "0.00" }]); setIsDirty(true); }}
        >
            <Head title="Bank Deposit" />

            <div className="py-6 px-1 space-y-8">
                <div className="flex items-start justify-between gap-8">
                    <div className="flex items-start gap-6 flex-1">
                        <div className="w-[320px]">
                            <SearchableSelect
                                label="Account"
                                options={depositAccountOptions}
                                value={data.depositTo}
                                onChange={(val) => { setData('depositTo', val); setIsDirty(true); }}
                                onSearch={fetchDepositAccounts}
                                onAddNew={() => openAccountModal('depositTo')}
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
                                    setIsDirty(true);
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
                                onChange={(e) => { setData('depositNo', e.target.value); setIsDirty(true); }}

                                onFocus={(e) => {
                                    const val = e.target.value.replace(/,/g, '');
                                    setData('depositNo', val);
                                    setTimeout(() => e.target.select(), 0);
                                }}

                                onBlur={(e) => {
                                    const val = e.target.value.replace(/,/g, '');
                                    setData('depositNo', val);
                                }}

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
                    addRow={() => { setData('items', [...data.items, { receivedFrom: "", account: "", description: "", paymentMethod: "", refNo: "", amount: "0.00" }]); setIsDirty(true); }}
                    removeRow={(index) => { setData('items', data.items.filter((_, i) => i !== index)); setIsDirty(true); }}
                    clearRows={() => { setData('items', [{ receivedFrom: "", account: "", description: "", paymentMethod: "", refNo: "", amount: "0.00" }]); setIsDirty(true); }}
                    totals={{ "Total": totalAmount }}
                    currencyPrefix={currencyPrefix}
                />

                <div className="mt-8 grid grid-cols-12 gap-8 pb-12">
                    <div className="col-span-4">
                        <CommonInput
                            type="textarea"
                            label="Memo"
                            placeholder="Add a note for this deposit..."
                            value={data.memo}
                            onChange={(e) => { setData('memo', e.target.value); setIsDirty(true); }}
                            size="sm"
                            className="h-24"
                            error={errors.memo}
                        />
                    </div>

                    <div className="col-span-8 flex flex-col justify-end items-end pb-2">
                        <div className="text-right flex items-center gap-6">
                            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Grand Total</span>
                            <span className="text-3xl font-black tracking-tighter text-slate-900 leading-none">
                                <span className="text-slate-400 text-sm font-bold mr-2">{currencyPrefix}</span>
                                {parseFloat(totalAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </span>
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
