import { useState, useEffect } from "react";
import { useForm, Head } from "@inertiajs/react";
import axios from "axios";
import TransactionLayout from "@/TransactionLayout/TransactionLayout";
import LineItemsTable from "@/TransactionLayout/LineItemsTable";
import SearchableSelect from "@/Components/SearchableSelect";
import CommonInput from "@/Components/CommonInput";
import QuickAddPayee from "@/Components/QuickAddPayee";
import QuickAddAccount from "@/Components/QuickAddAccount";
import InventoryItemSidePanel from "@/Components/InventoryItemSidePanel";

export default function SupplierCreditForm({ auth, nextCreditNo = "", credit = null }) {
    const currencyPrefix = auth.company?.home_currency_prefix || 'Rs.';

    const [supplierOptions, setSupplierOptions] = useState([]);
    const [productOptions, setProductOptions] = useState([]);
    const [accountOptions, setAccountOptions] = useState([]);

    // Accordion States (Expanded by default)
    const [isCategoryExpanded, setIsCategoryExpanded] = useState(true);
    const [isItemsExpanded, setIsItemsExpanded] = useState(true);

    // Modal States
    const [isPayeeModalOpen, setIsPayeeModalOpen] = useState(false);
    const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
    const [isItemModalOpen, setIsItemModalOpen] = useState(false);
    const [accountModalType, setAccountModalType] = useState('expense');
    const [addingItemRowIndex, setAddingItemRowIndex] = useState(null);
    const [savedOnce, setSavedOnce] = useState(!!credit?.id);

    const fetchSuppliers = (search = "") => {
        axios.get(route('api.payees', { search, type: 'Supplier' })).then(res => setSupplierOptions(res.data));
    };

    const fetchProducts = (search = "") => {
        return axios.get(route('api.items', { search })).then(res => {
            setProductOptions(res.data);
            return res.data;
        });
    };

    const fetchAccounts = (search = "") => {
        axios.get(route('api.accounts', { search })).then(res => {
            setAccountOptions(res.data);
        });
    };

    useEffect(() => {
        fetchSuppliers();
        fetchProducts();
        fetchAccounts();
    }, []);

    const getInitialDate = () => {
        if (credit?.credit_date) return credit.credit_date;
        const cached = localStorage.getItem('last_transaction_date');
        if (cached) return cached;
        return new Date().toISOString().split('T')[0];
    };

    const { data, setData, post, patch, processing, errors, reset, transform } = useForm({
        supplier: credit?.supplier_id || "",
        creditDate: getInitialDate(),
        creditNo: credit?.credit_no || nextCreditNo || "1001",
        memo: credit?.memo || "",
        items: credit?.items?.filter(i => !i.item_id).map(i => ({
            category: i.chart_of_acc_id,
            description: i.description,
            amount: i.amount
        })) || [
            { category: "", description: "", amount: "0.00" },
            { category: "", description: "", amount: "0.00" },
        ],
        itemDetails: credit?.items?.filter(i => i.item_id).map(i => ({
            product: i.item_id,
            description: i.description,
            qty: i.quantity,
            rate: i.rate,
            amount: i.amount
        })) || [
            { product: "", description: "", qty: "1", rate: "0.00", amount: "0.00" },
            { product: "", description: "", qty: "1", rate: "0.00", amount: "0.00" },
        ],
    });

    useEffect(() => {
        if (credit) {
            setData({
                supplier: credit.supplier_id || "",
                creditDate: credit.credit_date || "",
                creditNo: credit.credit_no || "",
                memo: credit.memo || "",
                items: credit.items?.filter(i => !i.item_id).map(i => ({
                    category: i.chart_of_acc_id,
                    description: i.description,
                    amount: i.amount
                })) || [{ category: "", description: "", amount: "0.00" }],
                itemDetails: credit.items?.filter(i => i.item_id).map(i => ({
                    product: i.item_id,
                    description: i.description,
                    qty: i.quantity,
                    rate: i.rate,
                    amount: i.amount
                })) || [{ product: "", description: "", qty: "1", rate: "0.00", amount: "0.00" }],
            });
        } else {
            const cachedDate = localStorage.getItem('last_transaction_date') || new Date().toISOString().split('T')[0];
            setData({
                supplier: "",
                creditDate: cachedDate,
                creditNo: nextCreditNo || "1001",
                memo: "",
                items: [
                    { category: "", description: "", amount: "0.00" },
                    { category: "", description: "", amount: "0.00" },
                ],
                itemDetails: [
                    { product: "", description: "", qty: "1", rate: "0.00", amount: "0.00" },
                    { product: "", description: "", qty: "1", rate: "0.00", amount: "0.00" },
                ],
            });
        }
    }, [credit?.id, nextCreditNo]);

    const totalAmount = (
        data.items.reduce((sum, item) => sum + (parseFloat(String(item.amount).replace(/,/g, '')) || 0), 0) +
        data.itemDetails.reduce((sum, item) => sum + (parseFloat(String(item.amount).replace(/,/g, '')) || 0), 0)
    ).toFixed(2);

    const parseCurrency = (val) => parseFloat(String(val).replace(/,/g, "")) || 0;
    const formatCurrencyValue = (val) => val.toLocaleString('en-US', { minimumFractionDigits: 2 });

    const handleItemChange = (index, field, value) => {
        const updated = [...data.items];
        updated[index][field] = value;
        setData("items", updated);
    };

    const handleProductItemChange = (index, field, value) => {
        const updated = [...data.itemDetails];
        updated[index][field] = value;

        if (field === "product") {
            const product = productOptions.find(p => p.value === value);
            if (product) {
                const costPrice = parseFloat(product.purchase_price || product.rate || 0);
                updated[index].rate = formatCurrencyValue(costPrice);
                const q = parseFloat(updated[index].qty) || 0;
                updated[index].amount = formatCurrencyValue(q * costPrice);
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

    const handleSave = (actionType) => {
        transform((data) => ({
            ...data,
            items: data.items
                .filter(item => item.category && parseCurrency(item.amount) > 0)
                .map(item => ({
                    ...item,
                    amount: parseCurrency(item.amount)
                })),
            itemDetails: data.itemDetails
                .filter(item => item.product && parseCurrency(item.amount) > 0)
                .map(item => ({
                    ...item,
                    rate: parseCurrency(item.rate),
                    amount: parseCurrency(item.amount)
                }))
        }));

        const url = credit?.id ? route('SupplierCredit.update', credit.id) : route('supplier-credit.store');
        const method = credit?.id ? patch : post;

        method(url, {
            preserveScroll: true,
            onSuccess: () => {
                showToast('success', 'Record saved successfully.');
                setSavedOnce(true);
                if (actionType === 'new') {
                    setSavedOnce(false);
                    reset();
                }
            }
        });
    };

    const BILL_COLUMNS = [
        {
            key: "category",
            label: "Category",
            placeholder: "Choose a category",
            options: accountOptions,
            onSearch: fetchAccounts,
            type: "select",
            width: "320px",
            onAddNew: () => {
                setAccountModalType('expense');
                setIsAccountModalOpen(true);
            }
        },
        { key: "description", label: "Description" },
        {
            key: "amount",
            label: "Amount",
            type: "currency",
            className: "text-right",
            inputClass: "text-right",
            width: "140px"
        },
    ];

    const ITEM_COLUMNS = [
        {
            key: "product",
            label: "Product/Service",
            placeholder: "Select product",
            options: productOptions,
            onSearch: fetchProducts,
            onAddNew: (index) => {
                setAddingItemRowIndex(index);
                setIsItemModalOpen(true);
            },
            type: "select",
            width: "320px"
        },
        { key: "description", label: "Description", placeholder: "Enter description" },
        { key: "qty", label: "Qty", type: "number", width: "100px", className: "text-right" },
        { key: "rate", label: "Rate", type: "currency", width: "140px", className: "text-right", inputClass: "text-right" },
        { key: "amount", label: "Amount", type: "currency", width: "160px", className: "text-right", inputClass: "text-right" },
    ];

    return (
        <TransactionLayout
            historyType="supplier return"
            title={credit?.id ? `Edit Supplier Return` : `Supplier Return`}
            amount={totalAmount}
            currencyPrefix={currencyPrefix}
            processing={processing}
            dirty={!savedOnce}
            onSave={() => handleSave('save')}
            onSaveAndNew={() => handleSave('new')}
        >
            <Head title="Supplier Return" />
            <div className="py-6 px-1 space-y-8">
                {/* Error Banner */}
                {errors.error && (
                    <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded">
                        {errors.error}
                    </div>
                )}

                <div className="flex items-start gap-8">
                    <div className="w-[320px]">
                        <SearchableSelect
                            label="Supplier"
                            placeholder="Select a supplier"
                            value={data.supplier}
                            onSearch={fetchSuppliers}
                            onAddNew={() => setIsPayeeModalOpen(true)}
                            onChange={(val) => setData('supplier', val)}
                            options={supplierOptions}
                            error={errors.supplier}
                        />
                    </div>
                    <div className="w-[180px]">
                        <CommonInput
                            type="date"
                            label="Supplier Return date"
                            value={data.creditDate}
                            onChange={(e) => {
                                const newDate = e.target.value;
                                localStorage.setItem('last_transaction_date', newDate);
                                setData('creditDate', newDate);
                            }}
                            error={errors.creditDate}
                            size="sm"
                        />
                    </div>
                    <div className="w-[160px]">
                        <CommonInput
                            label="Supplier Return no."
                            value={data.creditNo}
                            onChange={(e) => setData('creditNo', e.target.value)}
                            error={errors.creditNo}
                            size="sm"
                            inputClass="font-mono text-right"
                        />
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
                                columns={BILL_COLUMNS}
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

                <div className="w-[400px] mt-8">
                    <CommonInput
                        type="textarea"
                        label="Memo"
                        placeholder="Add a memo..."
                        value={data.memo}
                        onChange={(e) => setData('memo', e.target.value)}
                        size="sm"
                        className="h-24"
                    />
                </div>
            </div>

            <QuickAddPayee
                isOpen={isPayeeModalOpen}
                onClose={() => setIsPayeeModalOpen(false)}
                onSuccess={(newPayee) => {
                    fetchSuppliers();
                    if (newPayee) setData("supplier", newPayee.value);
                }}
                initialType="supplier"
            />

            <QuickAddAccount
                isOpen={isAccountModalOpen}
                onClose={() => setIsAccountModalOpen(false)}
                type={accountModalType}
                onSuccess={(newAcc) => {
                    if (newAcc) {
                        fetchAccounts();
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
                    fetchProducts().then(() => {
                        if (addingItemRowIndex !== null && newItem) {
                            const updated = [...data.itemDetails];
                            updated[addingItemRowIndex].product = newItem.id;
                            updated[addingItemRowIndex].description = newItem.description || "";
                            const costPrice = parseFloat(newItem.cost_price || newItem.purchase_price || newItem.sale_price || 0);
                            updated[addingItemRowIndex].rate = formatCurrencyValue(costPrice);
                            const q = parseFloat(updated[addingItemRowIndex].qty) || 0;
                            updated[addingItemRowIndex].amount = formatCurrencyValue(q * costPrice);
                            setData("itemDetails", updated);
                        }
                        setAddingItemRowIndex(null);
                    });
                }}
            />
        </TransactionLayout>
    );
}
