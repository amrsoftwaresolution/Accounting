import { useState, useEffect, useRef } from "react";
import { useForm, usePage } from "@inertiajs/react";
import TransactionLayout from "@/TransactionLayout/TransactionLayout";
import LineItemsTable from "@/TransactionLayout/LineItemsTable";
import SearchableSelect from "@/Components/SearchableSelect";
import CommonInput from "@/Components/CommonInput";
import QuickAddAccount from "@/Components/QuickAddAccount";
import QuickAddPayee from "@/Components/QuickAddPayee";
import QuickAddPaymentMethod from "@/Components/QuickAddPaymentMethod";
import axios from "axios";

export default function ExpenseForm({ 
    auth,
    paymentMethods = [],
    expense = null,
    lastPaymentDate = null,
    lastSaveAction = 'save'
}) {
    const company = auth.company;
    const currencyPrefix = company?.home_currency_prefix || company?.home_currency || '$';
    
    const [payeeOptions, setPayeeOptions] = useState([]);
    const [accountOptions, setAccountOptions] = useState([]);
    const [localPaymentMethods, setLocalPaymentMethods] = useState(paymentMethods);

    // Modal States
    const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
    const [isPayeeModalOpen, setIsPayeeModalOpen] = useState(false);
    const [isPaymentMethodModalOpen, setIsPaymentMethodModalOpen] = useState(false);
    const [accountModalType, setAccountModalType] = useState('asset');

    // Fetch payees from API
    const fetchPayees = (search = "") => {
        axios.get(route('api.payees', { search })).then(res => {
            setPayeeOptions(res.data);
        });
    };

    // Fetch accounts from API
    const fetchAccounts = (search = "", type = "") => {
        axios.get(route('api.accounts', { search, type })).then(res => {
            setAccountOptions(res.data);
        });
    };

    useEffect(() => {
        fetchPayees();
        fetchAccounts();
    }, []);

    const methodOptions = localPaymentMethods.map(m => ({ value: m.id, label: m.name }));

    // useForm
    const { data, setData, post, patch, processing, errors, reset, clearErrors, transform } = useForm({
        payee: expense?.payee || expense?.payee_id || "",
        account: expense?.account || expense?.payment_account_id || "",
        date: expense?.date || expense?.payment_date || lastPaymentDate || new Date().toISOString().split('T')[0],
        method: expense?.method || expense?.payment_method_id || "",
        ref: expense?.ref || expense?.reference_no || "",
        memo: expense?.memo || "",
        items: expense?.items || [{ category: "", description: "", amount: "0.00" }],
        action: 'save'
    });

    const actionRef = useRef(lastSaveAction);

    const parseCurrency = (val) => parseFloat(String(val).replace(/,/g, "")) || 0;
    const totalAmount = data.items.reduce((sum, item) => sum + parseCurrency(item.amount), 0).toFixed(2);
    const selectedAccountBalance = accountOptions.find(a => String(a.value) === String(data.account))?.balance || "0.00";

    useEffect(() => {
        transform((data) => ({
            ...data,
            action: actionRef.current,
            items: data.items
                .filter(item => item.category)
                .map(item => ({
                    ...item,
                    amount: String(item.amount).replace(/,/g, '')
                }))
        }));
    }, [transform]);

    const handleItemChange = (index, field, value) => {
        const updatedItems = [...data.items];
        updatedItems[index][field] = value;
        setData("items", updatedItems);
    };

    const handleSave = (action = 'save') => {
        actionRef.current = action;
        const url = expense?.id ? route('expense.update', expense.id) : route('expense.store');
        const method = expense?.id ? patch : post;

        method(url, {
            preserveScroll: true,
            onSuccess: () => {
                if (action === 'new') {
                    reset();
                    clearErrors();
                }
            }
        });
    };

    const EXPENSE_COLUMNS = [
        { 
            key: "category", 
            label: "Category", 
            placeholder: "Choose a category",
            options: accountOptions,
            type: "select",
            width: "280px",
            onAddNew: () => {
                setAccountModalType('expense');
                setIsAccountModalOpen(true);
            }
        },
        { key: "description", label: "Description", placeholder: "What was this for?" },
        { 
            key: "amount", 
            label: "Amount", 
            type: "currency", 
            className: "text-right", 
            inputClass: "text-right",
            width: "120px"
        },
        { 
            key: "customer", 
            label: "Customer", 
            placeholder: "Select customer",
            options: payeeOptions.filter(p => p.type === 'Customer'),
            type: "select",
            width: "220px",
            onAddNew: () => setIsPayeeModalOpen(true)
        },
    ];

    return (
        <TransactionLayout
            title={expense?.id ? `Edit Expense no.${data.ref}` : "New Expense"}
            amount={totalAmount}
            processing={processing}
            onSave={() => handleSave('save')}
            onSaveAndClose={() => handleSave('close')}
            onSaveAndNew={() => handleSave('new')}
            onAddLine={() => {
                setData("items", [...data.items, { category: "", description: "", amount: "0.00", customer: "" }]);
            }}
            onClearRows={() => {
                setData("items", [{ category: "", description: "", amount: "0.00", customer: "" }]);
            }}
            lastAction={lastSaveAction}
        >
            <div className="py-6 px-1 space-y-8">
                {/* ROW 1: Payee & Account */}
                <div className="flex items-start justify-between gap-8">
                    <div className="flex items-start gap-6 flex-1">
                        <div className="w-[380px]">
                            <SearchableSelect 
                                label="Payee"
                                placeholder="Who did you pay?"
                                value={data.payee}
                                onChange={(val) => setData("payee", val)}
                                options={payeeOptions}
                                onSearch={fetchPayees}
                                size="sm"
                                error={errors.payee}
                                onAddNew={() => setIsPayeeModalOpen(true)}
                            />
                        </div>
                        <div className="w-[380px]">
                            <div className="mb-6">
                                <SearchableSelect 
                                    label="Payment account"
                                    placeholder="Select account"
                                    value={data.account}
                                    onChange={(val) => setData("account", val)}
                                    options={accountOptions}
                                    onSearch={fetchAccounts}
                                    initialLimit={10}
                                    size="sm"
                                    error={errors.account}
                                    onAddNew={() => {
                                        setAccountModalType('asset');
                                        setIsAccountModalOpen(true);
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Balance Display */}
                    {data.account && (
                        <div className="text-right flex flex-col items-end">
                            <p className="text-xs text-slate-500 uppercase font-black tracking-widest mb-1">Account Balance</p>
                            <p className="text-4xl font-black tracking-tighter text-slate-900 leading-none">
                                <span className="text-slate-400 text-sm font-medium mr-1">{currencyPrefix}</span>
                                {parseFloat(accountOptions.find(a => String(a.value) === String(data.account))?.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </p>
                        </div>
                    )}
                </div>

                {/* ROW 2: Date, Method, Ref */}
                <div className="flex items-end gap-6">
                    <div className="w-[200px]">
                        <CommonInput 
                            type="date"
                            label="Payment Date"
                            value={data.date}
                            onChange={(e) => setData("date", e.target.value)}
                            size="sm"
                            error={errors.date}
                        />
                    </div>
                    <div className="w-[220px]">
                        <SearchableSelect 
                            label="Payment Method"
                            placeholder="Select method"
                            value={data.method}
                            onChange={(val) => setData("method", val)}
                            options={methodOptions}
                            onAddNew={() => setIsPaymentMethodModalOpen(true)}
                            size="sm"
                            error={errors.method}
                        />
                    </div>
                    <div className="w-[180px]">
                        <CommonInput 
                            label="Ref no."
                            placeholder=""
                            value={data.ref}
                            onChange={(e) => setData("ref", e.target.value)}
                            size="sm"
                            error={errors.ref}
                        />
                    </div>
                </div>
            </div>

            <LineItemsTable
                columns={EXPENSE_COLUMNS}
                items={data.items}
                handleItemChange={handleItemChange}
                addRow={() => setData("items", [...data.items, { category: "", description: "", amount: "0.00" }])}
                removeRow={(index) => setData("items", data.items.filter((_, i) => i !== index))}
                clearRows={() => setData("items", [{ category: "", description: "", amount: "0.00" }])}
                totals={{ "Total": totalAmount }}
                currencyPrefix={currencyPrefix}
                hideActions={true}
            />

            <div className="mt-8 grid grid-cols-12 gap-8">
                <div className="col-span-4">
                    <CommonInput 
                        type="textarea"
                        label="Memo"
                        placeholder="Add a memo..."
                        value={data.memo}
                        onChange={(e) => setData("memo", e.target.value)}
                        className="h-24"
                        size="sm"
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

            {/* Quick Add Modals */}
            <QuickAddPayee 
                isOpen={isPayeeModalOpen} 
                onClose={() => setIsPayeeModalOpen(false)}
                onSuccess={(newPayee) => {
                    if (newPayee) {
                        fetchPayees();
                        setData("payee", newPayee.value);
                    }
                }}
            />

            <QuickAddPaymentMethod
                isOpen={isPaymentMethodModalOpen}
                onClose={() => setIsPaymentMethodModalOpen(false)}
                onSuccess={(newMethod) => {
                    if (newMethod) {
                        setLocalPaymentMethods([...localPaymentMethods, { id: newMethod.value, name: newMethod.label }]);
                        setData("method", newMethod.value);
                    }
                }}
            />

            <QuickAddAccount 
                isOpen={isAccountModalOpen} 
                onClose={() => setIsAccountModalOpen(false)} 
                type={accountModalType}
                onSuccess={(newAcc) => {
                    if (newAcc) {
                        fetchAccounts();
                        setData("account", newAcc.value);
                    }
                }}
            />
        </TransactionLayout>
    );
}
