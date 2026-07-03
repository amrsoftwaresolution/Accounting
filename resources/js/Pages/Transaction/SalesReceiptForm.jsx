import { useState, useEffect } from "react";
import { useForm, Head, router } from "@inertiajs/react";
import axios from "axios";
import TransactionLayout from "@/TransactionLayout/TransactionLayout";
import LineItemsTable from "@/TransactionLayout/LineItemsTable";
import SearchableSelect from "@/Components/SearchableSelect";
import CommonInput from "@/Components/CommonInput";
import QuickAddPayee from "@/Components/QuickAddPayee";
import QuickAddAccount from "@/Components/QuickAddAccount";
import InventoryItemSidePanel from "@/Components/InventoryItemSidePanel";
import QuickAddPaymentMethod from "@/Components/QuickAddPaymentMethod";
import { showToast } from "@/Components/ToastNotification";

export default function SalesReceiptForm({ auth, paymentMethods = [], nextReceiptNo = "", receipt = null }) {
    const company = auth.company;
    const currencyPrefix = company?.home_currency_prefix || company?.home_currency || '$';

    const [customerOptions, setCustomerOptions] = useState([]);
    const [productOptions, setProductOptions] = useState([]);
    const [accountOptions, setAccountOptions] = useState([]);
    const paymentMethodOptions = paymentMethods.map(pm => ({ value: pm.id, label: pm.name }));

    // Modal States
    const [isPayeeModalOpen, setIsPayeeModalOpen] = useState(false);
    const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
    const [isItemModalOpen, setIsItemModalOpen] = useState(false);
    const [isMethodModalOpen, setIsMethodModalOpen] = useState(false);
    const [addingItemRowIndex, setAddingItemRowIndex] = useState(null);
    const [savedOnce, setSavedOnce] = useState(!!receipt?.id);

    const fetchCustomers = (search = "") => {
        axios.get(route('api.payees', { search, type: 'Customer' })).then(res => setCustomerOptions(res.data));
    };

    const fetchAccounts = (search = "") => {
        axios.get(route('api.accounts', { search })).then(res => setAccountOptions(res.data));
    };

    const fetchProducts = (search = "") => {
        return axios.get(route('api.items', { search })).then(res => {
            setProductOptions(res.data);
            return res.data;
        });
    };

    useEffect(() => {
        fetchCustomers();
        fetchAccounts();
        fetchProducts();
    }, []);

    useEffect(() => {
        if (receipt) {
            setData({
                customer: receipt.customer || "",
                email: receipt.email || "",
                billingAddress: receipt.billingAddress || "",
                receiptDate: receipt.receiptDate || "",
                receiptNo: receipt.receiptNo || "",
                paymentMethod: receipt.paymentMethod || "",
                depositTo: receipt.depositTo || "",
                memo: receipt.memo || "",
                statementMessage: receipt.statementMessage || "",
                items: receipt.items && receipt.items.length > 0 ? receipt.items : [
                    { serviceDate: "", product: "", description: "", qty: "1", rate: "0.00", amount: "0.00" }
                ],
                action: 'save'
            });
        } else {
            setData({
                customer: "",
                email: "",
                billingAddress: "",
                receiptDate: localStorage.getItem('last_transaction_date') || new Date().toISOString().split('T')[0],
                receiptNo: nextReceiptNo || "1001",
                paymentMethod: "",
                depositTo: "",
                memo: "",
                statementMessage: "",
                items: [
                    { serviceDate: "", product: "", description: "", qty: "1", rate: "0.00", amount: "0.00" },
                    { serviceDate: "", product: "", description: "", qty: "1", rate: "0.00", amount: "0.00" },
                ],
                action: 'save'
            });
        }
        clearErrors();
    }, [receipt?.id]);

    const COLUMNS = [
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
            width: "280px"
        },
        { key: "description", label: "Description", placeholder: "Enter description" },
        { key: "qty", label: "Qty", type: "number", min: "0", width: "80px", className: "text-right" },
        { key: "rate", label: "Rate", type: "currency", width: "120px", className: "text-right", inputClass: "text-right" },
        { key: "amount", label: "Amount", type: "currency", width: "140px", className: "text-right", inputClass: "text-right" },
    ];

    const { data, setData, post, patch, processing, errors, reset, clearErrors, transform } = useForm({
        customer: receipt?.customer || "",
        email: receipt?.email || "",
        billingAddress: receipt?.billingAddress || "",
        receiptDate: receipt?.receiptDate || localStorage.getItem('last_transaction_date') || new Date().toISOString().split('T')[0],
        receiptNo: receipt?.receiptNo || nextReceiptNo || "1001",
        paymentMethod: receipt?.paymentMethod || "",
        depositTo: receipt?.depositTo || "",
        memo: receipt?.memo || "",
        statementMessage: receipt?.statementMessage || "",
        items: receipt?.items || [
            { serviceDate: "", product: "", description: "", qty: "1", rate: "0.00", amount: "0.00" },
            { serviceDate: "", product: "", description: "", qty: "1", rate: "0.00", amount: "0.00" },
        ],
        action: 'save'
    });

    const totalAmount = data.items.reduce(
        (sum, item) => sum + (parseFloat(String(item.amount).replace(/,/g, '')) || 0),
        0
    ).toFixed(2);

    const parseCurrency = (val) => parseFloat(String(val).replace(/,/g, "")) || 0;
    const formatCurrencyValue = (val) => val.toLocaleString('en-US', { minimumFractionDigits: 2 });

    const handleItemChange = (index, field, value) => {
        const updated = [...data.items];
        updated[index][field] = value;

        if (field === "product") {
            const product = productOptions.find(p => p.value === value);
            if (product) {
                const rateValue = parseFloat(product.rate || 0);
                updated[index].rate = formatCurrencyValue(rateValue);
                const q = parseFloat(updated[index].qty) || 0;
                updated[index].amount = formatCurrencyValue(q * rateValue);
                updated[index].description = product.description || "";
            }
        }

        if (field === "qty" || field === "rate") {
            let q = parseFloat(updated[index].qty) || 0;
            if (q < 0) {
                q = 0;
                updated[index].qty = "0";
            }
            const r = parseCurrency(updated[index].rate);
            updated[index].amount = formatCurrencyValue(q * r);
        } else if (field === "amount") {
            const a = parseCurrency(value);
            let q = parseFloat(updated[index].qty) || 0;
            if (q < 0) {
                q = 0;
                updated[index].qty = "0";
            }
            if (q !== 0) {
                updated[index].rate = formatCurrencyValue(a / q);
            }
        }
        setData("items", updated);
    };

    const handleSave = (actionType = 'save') => {
        transform((data) => ({
            ...data,
            action: actionType,
            items: data.items.filter(item => item.product && item.product !== "")
        }));

        const url = receipt?.id ? route('receipt.update', receipt.id) : route('receipt.store');
        const submitMethod = receipt?.id ? patch : post;

        submitMethod(url, {
            preserveScroll: true,
            preserveState: actionType === 'save',
            onSuccess: () => {
                showToast('success', 'Record saved successfully.');
                setSavedOnce(true);
                if (actionType === 'new') {
                    setSavedOnce(false);
                    reset();
                    clearErrors();
                }
            }
        });
    };

    return (
        <TransactionLayout
            historyType="cash sale"
            title={`Sales Receipt #${data.receiptNo}`}
            amount={totalAmount}
            processing={processing}
            dirty={!savedOnce}
            onSave={() => handleSave('save')}
            onSaveAndClose={() => handleSave('close')}
            onSaveAndNew={() => handleSave('new')}
            onAddLine={() => {
                setData("items", [...data.items, { product: "", serviceDate: "", description: "", qty: "1", rate: "0.00", amount: "0.00" }]);
            }}
            onClearRows={() => {
                setData("items", [{ product: "", serviceDate: "", description: "", qty: "1", rate: "0.00", amount: "0.00" }]);
            }}
        >
            <Head title="Cash sale" />

            {/* Error Banner */}
            {errors.error && (
                <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded">
                    {errors.error}
                </div>
            )}

            <div className="py-6 px-1 space-y-8">
                <div className="flex items-start justify-between gap-8">
                    <div className="flex items-start gap-6 flex-1">
                        <div className="w-[320px]">
                            <SearchableSelect
                                label="Customer"
                                placeholder="Select a customer"
                                value={data.customer}
                                onSearch={fetchCustomers}
                                onAddNew={() => setIsPayeeModalOpen(true)}
                                onChange={(val) => {
                                    const customer = customerOptions.find(c => c.value === val);
                                    setData(d => ({
                                        ...d,
                                        customer: val,
                                        email: customer?.email || d.email,
                                        billingAddress: customer?.billing_address || d.billingAddress
                                    }));
                                }}
                                options={customerOptions}
                                size="sm"
                                error={errors.customer}
                            />
                        </div>
                        <div className="w-[320px]">
                            <CommonInput
                                label="Customer email"
                                placeholder="Separate emails with a comma"
                                value={data.email}
                                onChange={(e) => setData("email", e.target.value)}
                                size="sm"
                                error={errors.email}
                            />
                        </div>
                    </div>

                    <div className="text-right flex flex-col items-end">
                        <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-1">Total Amount</p>
                        <p className="text-4xl font-black tracking-tighter text-slate-900 leading-none">
                            <span className="text-slate-400 text-[10px] font-medium mr-1">{currencyPrefix}</span>
                            {parseFloat(totalAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </p>
                    </div>
                </div>

                <div className="flex items-end gap-6 flex-wrap">
                    <div className="w-[240px]">
                        <CommonInput
                            type="textarea"
                            label="Billing address"
                            value={data.billingAddress}
                            onChange={(e) => setData("billingAddress", e.target.value)}
                            className="h-[74px]"
                            size="sm"
                            error={errors.billingAddress}
                        />
                    </div>
                    <div className="w-[180px]">
                        <CommonInput
                            type="date"
                            label="Cash sale date"
                            value={data.receiptDate}
                            onChange={(e) => {
                                const newDate = e.target.value;
                                localStorage.setItem('last_transaction_date', newDate);
                                setData('receiptDate', newDate);
                            }}
                            size="sm"
                            error={errors.receiptDate}
                        />
                    </div>
                    <div className="w-[180px]">
                        <SearchableSelect
                            label="Payment method"
                            value={data.paymentMethod}
                            onChange={(val) => setData('paymentMethod', val)}
                            options={paymentMethodOptions}
                            onAddNew={() => setIsMethodModalOpen(true)}
                            size="sm"
                            error={errors.paymentMethod}
                        />
                    </div>
                    <div className="w-[240px]">
                        <SearchableSelect
                            label="Deposit to"
                            placeholder="Select account"
                            value={data.depositTo}
                            onSearch={fetchAccounts}
                            onAddNew={() => setIsAccountModalOpen(true)}
                            onChange={(val) => setData('depositTo', val)}
                            options={accountOptions}
                            size="sm"
                            error={errors.depositTo}
                        />
                    </div>
                    <div className="w-[160px]">
                        <CommonInput
                            label="Receipt no."
                            value={data.receiptNo}
                            onChange={(e) => setData('receiptNo', e.target.value)}
                            size="sm"
                            inputClass="font-mono text-right"
                            error={errors.receiptNo}
                        />
                    </div>
                </div>
            </div>

            <LineItemsTable
                columns={COLUMNS}
                items={data.items}
                handleItemChange={handleItemChange}
                addRow={() => setData("items", [...data.items, { product: "", serviceDate: "", description: "", qty: "1", rate: "0.00", amount: "0.00" }])}
                removeRow={(index) => setData("items", data.items.filter((_, i) => i !== index))}
                clearRows={() => setData("items", [{ product: "", serviceDate: "", description: "", qty: "1", rate: "0.00", amount: "0.00" }])}
                totals={{ "Total": totalAmount }}
                currencyPrefix={currencyPrefix}
                hideActions={true}
                errors={errors}
            />

            <div className="grid grid-cols-2 gap-10 mt-8">
                <div className="w-[400px]">
                    <CommonInput
                        type="textarea"
                        label="Memo"
                        placeholder="This will show up on the Cash Sale."
                        value={data.memo}
                        onChange={(e) => setData('memo', e.target.value)}
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
                    fetchCustomers();
                    if (newPayee) setData("customer", newPayee.value);
                }}
                initialType="customer"
            />

            <QuickAddAccount
                isOpen={isAccountModalOpen}
                onClose={() => setIsAccountModalOpen(false)}
                onSuccess={(newAccount) => {
                    fetchAccounts();
                    if (newAccount) setData("depositTo", newAccount.value);
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
                            const updated = [...data.items];
                            updated[addingItemRowIndex].product = newItem.id;
                            updated[addingItemRowIndex].description = newItem.description || "";
                            const rateValue = parseFloat(newItem.sale_price || 0);
                            updated[addingItemRowIndex].rate = formatCurrencyValue(rateValue);
                            const q = parseFloat(updated[addingItemRowIndex].qty) || 0;
                            updated[addingItemRowIndex].amount = formatCurrencyValue(q * rateValue);
                            setData("items", updated);
                        }
                        setAddingItemRowIndex(null);
                    });
                }}
            />

            <QuickAddPaymentMethod
                isOpen={isMethodModalOpen}
                onClose={() => setIsMethodModalOpen(false)}
                onSuccess={() => router.reload({ only: ['paymentMethods'] })}
            />

        </TransactionLayout>
    );
}
