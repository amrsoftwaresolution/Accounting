import { useState, useEffect, useRef } from "react";
import { useForm, usePage, Head } from "@inertiajs/react";
import TransactionLayout from "@/TransactionLayout/TransactionLayout";
import LineItemsTable from "@/TransactionLayout/LineItemsTable";
import SearchableSelect from "@/Components/SearchableSelect";
import CommonInput from "@/Components/CommonInput";
import QuickAddAccount from "@/Components/QuickAddAccount";
import QuickAddPayee from "@/Components/QuickAddPayee";
import QuickAddPaymentMethod from "@/Components/QuickAddPaymentMethod";
import InventoryItemSidePanel from "@/Components/InventoryItemSidePanel";
import { showToast } from "@/Components/ToastNotification";
import axios from "axios";

export default function ExpenseForm({
    auth,
    expense = null,
    nextExpenseNo = ""
}) {
    const company = auth.company;
    const currencyPrefix = company?.home_currency_prefix || company?.home_currency || '$';

    // Accordion States (Expanded by default)
    const [isCategoryExpanded, setIsCategoryExpanded] = useState(true);
    const [isItemsExpanded, setIsItemsExpanded] = useState(() => {
        return expense?.itemDetails && expense.itemDetails.some(i => i.product) ? true : false;
    });

    const [payeeOptions, setPayeeOptions] = useState([]);
    const [accountOptions, setAccountOptions] = useState([]);
    const [productOptions, setProductOptions] = useState([]);
    const [paymentMethodOptions, setPaymentMethodOptions] = useState([]);

    // Modal States
    const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
    const [isPayeeModalOpen, setIsPayeeModalOpen] = useState(false);
    const [isPaymentMethodModalOpen, setIsPaymentMethodModalOpen] = useState(false);
    const [isItemModalOpen, setIsItemModalOpen] = useState(false);
    const [accountModalType, setAccountModalType] = useState('asset');
    const [addingItemRowIndex, setAddingItemRowIndex] = useState(null);

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

    // Fetch products/services from API
    const fetchItems = async (search = '') => {
        try {
            const response = await axios.get(route('api.items', { search }));
            setProductOptions(response.data);
            return response.data;
        } catch (error) {
            console.error("Failed to fetch items:", error);
        }
    };

    const fetchPaymentMethods = () => {
        axios.get(route('api.payment-methods')).then(res => setPaymentMethodOptions(res.data));
    };
    const [savedOnce, setSavedOnce] = useState(!!expense?.id);
    
    useEffect(() => {
        fetchPayees();
        fetchAccounts();
        fetchItems();
        fetchPaymentMethods();
    }, []);

    const parseCurrency = (val) => parseFloat(String(val).replace(/,/g, "")) || 0;
    const formatCurrencyValue = (val) => val.toLocaleString('en-US', { minimumFractionDigits: 2 });

    const getInitialPaymentDate = () => {
        if (expense?.paymentDate) return expense.paymentDate;
        const cached = localStorage.getItem('last_transaction_date');
        if (cached) return cached;
        return new Date().toISOString().split('T')[0];
    };

    const initialPaymentDate = getInitialPaymentDate();

    // useForm
    const { data, setData, post, patch, processing, errors, reset, clearErrors, transform } = useForm({
        payee: expense?.payee || expense?.payee_id || "",
        account: expense?.paymentAccount || expense?.account || expense?.payment_account_id || "",
        date: expense?.paymentDate || expense?.date || initialPaymentDate,
        method: expense?.paymentMethod || expense?.method || expense?.payment_method_id || "",
        ref: expense?.referenceNo || expense?.ref || expense?.reference_no || nextExpenseNo || "",
        memo: expense?.memo || "",
        items: expense?.items && expense.items.length > 0 ? expense.items.map(i => ({...i, amount: parseFloat(i.amount||0).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})})) : [
            { category: "", description: "", amount: "0.00" },
        ],
        itemDetails: expense?.itemDetails && expense.itemDetails.length > 0 ? expense.itemDetails.map(i => ({
            ...i,
            qty: parseFloat(i.qty||0).toLocaleString('en-US'),
            rate: parseFloat(i.rate||0).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}),
            amount: parseFloat(i.amount||0).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})
        })) : [
            { product: "", description: "", qty: "1", rate: "0.00", amount: "0.00" },
        ],
        action: 'save'
    });

    const actionRef = useRef('save');

    const totalAmount = (
        data.items.reduce((sum, item) => sum + parseCurrency(item.amount), 0) +
        data.itemDetails.reduce((sum, item) => sum + parseCurrency(item.amount), 0)
    ).toFixed(2);

    const selectedAccountBalance = accountOptions.find(a => String(a.value) === String(data.account))?.balance || "0.00";

    useEffect(() => {
        if (expense) {
            setData({
                payee: expense.payee || expense.payee_id || "",
                account: expense.paymentAccount || expense.account || expense.payment_account_id || "",
                date: expense.paymentDate || expense.date || "",
                method: expense.paymentMethod || expense.method || "",
                ref: expense.referenceNo || expense.ref || "",
                memo: expense.memo || "",
                items: expense.items && expense.items.length > 0 ? expense.items.map(i => ({...i, amount: parseFloat(i.amount||0).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})})) : [
                    { category: "", description: "", amount: "0.00" }
                ],
                itemDetails: expense.itemDetails && expense.itemDetails.length > 0 ? expense.itemDetails.map(i => ({
                    ...i,
                    qty: parseFloat(i.qty||0).toLocaleString('en-US'),
                    rate: parseFloat(i.rate||0).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}),
                    amount: parseFloat(i.amount||0).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})
                })) : [
                    { product: "", description: "", qty: "1", rate: "0.00", amount: "0.00" }
                ],
                action: 'save'
            });
        } else {
            const cachedDate = localStorage.getItem('last_transaction_date') || new Date().toISOString().split('T')[0];
            setData({
                payee: "",
                account: "",
                date: cachedDate,
                method: "",
                ref: nextExpenseNo || "",
                memo: "",
                items: [
                    { category: "", description: "", amount: "0.00" },
                ],
                itemDetails: [
                    { product: "", description: "", qty: "1", rate: "0.00", amount: "0.00" },
                ],
                action: 'save'
            });
        }
        clearErrors();
    }, [expense?.id]);

    useEffect(() => {
        transform((data) => ({
            ...data,
            action: actionRef.current,
            items: data.items
                .filter(item => item.category && (parseFloat(String(item.amount).replace(/,/g, '')) > 0))
                .map(item => ({
                    ...item,
                    amount: String(item.amount).replace(/,/g, '')
                })),
            itemDetails: data.itemDetails
                .filter(item => item.product && (parseFloat(String(item.amount).replace(/,/g, '')) > 0))
                .map(item => ({
                    ...item,
                    qty: String(item.qty).replace(/,/g, ''),
                    rate: String(item.rate).replace(/,/g, ''),
                    amount: String(item.amount).replace(/,/g, '')
                }))
        }));
    }, [transform]);

    const handleItemChange = (index, field, value) => {
        const updatedItems = [...data.items];
        updatedItems[index][field] = value;
        setData("items", updatedItems);
    };

    const handleProductItemChange = (index, field, value) => {
        const updated = [...data.itemDetails];
        updated[index][field] = value;

        if (field === "product") {
            const product = productOptions.find(p => p.value === value);
            if (product) {
                const rateValue = parseFloat(product.purchase_price) || parseFloat(product.rate) || 0;
                updated[index].rate = formatCurrencyValue(rateValue);
                const q = parseFloat(updated[index].qty) || 0;
                updated[index].amount = formatCurrencyValue(q * rateValue);
                updated[index].description = product.description || "";
            }
        }

        if (field === "qty" || field === "rate") {
            const q = parseFloat(updated[index].qty) || 0;
            const r = parseCurrency(updated[index].rate);
            updated[index].amount = formatCurrencyValue(q * r);
        }
        setData("itemDetails", updated);
    };

    const handlePaymentDateChange = (dateVal) => {
        localStorage.setItem('last_transaction_date', dateVal);
        setData("date", dateVal);
    };

    const handleSave = (action = 'save') => {
    actionRef.current = action;
    const url = expense?.id ? route('expense.update', expense.id) : route('expense.store');
    const method = expense?.id ? patch : post;

    method(url, {
        preserveScroll: true,
        onSuccess: () => {
            showToast('success', 'Record saved successfully.');
            setSavedOnce(true);
            
            if (action === 'new') {
                const currentRef = data.ref || nextExpenseNo || 'EXP-0001';
                const num = parseInt(String(currentRef).replace(/[^0-9]/g, '')) || 0;
                const nextRef = 'EXP-' + String(num + 1).padStart(4, '0');

                reset();
                clearErrors();
                fetchAccounts();
                const cachedDate = localStorage.getItem('last_transaction_date') || new Date().toISOString().split('T')[0];
                setData({
                    payee: "", account: "", date: cachedDate, method: "", ref: nextRef, memo: "",
                    items: [{ category: "", description: "", amount: "0.00" }],
                    itemDetails: [{ product: "", description: "", qty: "1", rate: "0.00", amount: "0.00" }],
                    action: 'save'
                });
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
    ];

    const ITEM_COLUMNS = [
        {
            key: "product",
            label: "Product/Service",
            placeholder: "Select product",
            options: productOptions,
            onSearch: fetchItems,
            type: "select",
            width: "280px",
            onAddNew: (index) => {
                setAddingItemRowIndex(index);
                setIsItemModalOpen(true);
            }
        },
        { key: "description", label: "Description", placeholder: "Enter description" },
        { key: "qty", label: "Qty", type: "number", width: "80px", className: "text-right" },
        { key: "rate", label: "Rate", type: "currency", width: "120px", className: "text-right", inputClass: "text-right" },
        { key: "amount", label: "Amount", type: "currency", width: "140px", className: "text-right", inputClass: "text-right" },
    ];

    return (
        <TransactionLayout
            historyType="expense"
            title={expense?.id ? `Edit Payment no.${data.ref}` : "New Payment"}
            amount={totalAmount}
            processing={processing}
            dirty={!savedOnce}
            onSave={() => handleSave('save')}
            onSaveAndClose={() => handleSave('close')}
            onSaveAndNew={() => handleSave('new')}
        >
            <Head title={expense?.id ? `Edit Payment no.${data.ref}` : "New Payment"} />
            <div className="py-6 px-1 space-y-8">
                {/* Error Banner */}
                {errors.error && (
                    <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded">
                        {errors.error}
                    </div>
                )}

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
                                {parseFloat(selectedAccountBalance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
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
                            onChange={(e) => handlePaymentDateChange(e.target.value)}
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
                            options={paymentMethodOptions}
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

            {/* Collapsible Category details Accordion */}
            <div className="mt-8 border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm transition-all duration-300">
                <button
                    type="button"
                    onClick={() => setIsCategoryExpanded(!isCategoryExpanded)}
                    className="w-full flex items-center justify-between px-5 py-4 bg-slate-50 hover:bg-slate-100/80 transition-colors duration-200 text-left border-b border-slate-200"
                >
                    <div className="flex items-center gap-3">
                        <span className={`text-slate-500 transition-transform duration-300 transform inline-block text-xs ${isCategoryExpanded ? 'rotate-90' : ''}`}>
                            ▶
                        </span>
                        <span className="font-semibold text-slate-700 text-sm">Category details</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold uppercase tracking-wider">
                            {data.items.filter(item => item.category).length} lines
                        </span>
                    </div>
                    <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                        Total Category: <span className="text-slate-800 font-black">{currencyPrefix} {data.items.reduce((sum, item) => sum + (parseFloat(String(item.amount).replace(/,/g, '')) || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </span>
                </button>
                {isCategoryExpanded && (
                    <div className="p-4 bg-slate-50/10">
                        <LineItemsTable
                            columns={EXPENSE_COLUMNS}
                            items={data.items}
                            handleItemChange={handleItemChange}
                            addRow={() => setData("items", [...data.items, { category: "", description: "", amount: "0.00" }])}
                            removeRow={(index) => {
                                const remaining = data.items.filter((_, i) => i !== index);
                                setData("items", remaining.length > 0 ? remaining : [{ category: "", description: "", amount: "0.00" }]);
                            }}
                            clearRows={() => setData("items", [{ category: "", description: "", amount: "0.00" }])}
                            currencyPrefix={currencyPrefix}
                            hideActions={true}
                        />
                    </div>
                )}
            </div>

            {/* Collapsible Item details Accordion */}
            <div className="mt-6 border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm transition-all duration-300">
                <button
                    type="button"
                    onClick={() => setIsItemsExpanded(!isItemsExpanded)}
                    className="w-full flex items-center justify-between px-5 py-4 bg-slate-50 hover:bg-slate-100/80 transition-colors duration-200 text-left border-b border-slate-200"
                >
                    <div className="flex items-center gap-3">
                        <span className={`text-slate-500 transition-transform duration-300 transform inline-block text-xs ${isItemsExpanded ? 'rotate-90' : ''}`}>
                            ▶
                        </span>
                        <span className="font-semibold text-slate-700 text-sm">Item details</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold uppercase tracking-wider">
                            {data.itemDetails.filter(item => item.product).length} lines
                        </span>
                    </div>
                    <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                        Total Item: <span className="text-slate-800 font-black">{currencyPrefix} {data.itemDetails.reduce((sum, item) => sum + (parseFloat(String(item.amount).replace(/,/g, '')) || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </span>
                </button>
                {isItemsExpanded && (
                    <div className="p-4 bg-slate-50/10">
                        <LineItemsTable
                            columns={ITEM_COLUMNS}
                            items={data.itemDetails}
                            handleItemChange={handleProductItemChange}
                            addRow={() => setData("itemDetails", [...data.itemDetails, { product: "", description: "", qty: "1", rate: "0.00", amount: "0.00" }])}
                            removeRow={(index) => {
                                const remaining = data.itemDetails.filter((_, i) => i !== index);
                                setData("itemDetails", remaining.length > 0 ? remaining : [{ product: "", description: "", qty: "1", rate: "0.00", amount: "0.00" }]);
                            }}
                            clearRows={() => setData("itemDetails", [{ product: "", description: "", qty: "1", rate: "0.00", amount: "0.00" }])}
                            currencyPrefix={currencyPrefix}
                            hideActions={true}
                        />
                    </div>
                )}
            </div>

            <div className="mt-8 grid grid-cols-12 gap-8 pb-12">
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
                        setPaymentMethodOptions([...paymentMethodOptions, newMethod]);
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

            <InventoryItemSidePanel
                isOpen={isItemModalOpen}
                onClose={() => {
                    setIsItemModalOpen(false);
                    setAddingItemRowIndex(null);
                }}
                onSuccess={(newItem) => {
                    fetchItems().then(() => {
                        if (addingItemRowIndex !== null && newItem) {
                            const updated = [...data.itemDetails];
                            updated[addingItemRowIndex].product = newItem.id;
                            updated[addingItemRowIndex].description = newItem.description || "";
                            const rateValue = parseFloat(newItem.purchase_price) || parseFloat(newItem.sale_price) || 0;
                            updated[addingItemRowIndex].rate = formatCurrencyValue(rateValue);
                            const q = parseFloat(updated[addingItemRowIndex].qty) || 0;
                            updated[addingItemRowIndex].amount = formatCurrencyValue(q * rateValue);
                            setData("itemDetails", updated);
                        }
                        setAddingItemRowIndex(null);
                    });
                }}
            />
        </TransactionLayout>
    );
}

