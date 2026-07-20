import { useState, useEffect, useRef } from "react";
import { useForm, Head } from "@inertiajs/react";
import axios from "axios";
import TransactionLayout from "@/TransactionLayout/TransactionLayout";
import LineItemsTable from "@/TransactionLayout/LineItemsTable";
import SearchableSelect from "@/Components/SearchableSelect";
import CommonInput from "@/Components/CommonInput";
import QuickAddPayee from "@/Components/QuickAddPayee";
import { showToast } from "@/Components/ToastNotification";
import InventoryItemSidePanel from "@/Components/InventoryItemSidePanel";

export default function CreditNoteForm({ auth, nextCreditNoteNo = "", creditNote = null }) {
    const company = auth.company;
    const currencyPrefix = company?.home_currency_prefix || company?.home_currency || 'LKR ';

    const [customerOptions, setCustomerOptions] = useState([]);
    const [productOptions, setProductOptions] = useState([]);

    // Modal States
    const [isPayeeModalOpen, setIsPayeeModalOpen] = useState(false);
    const [isItemModalOpen, setIsItemModalOpen] = useState(false);
    const [addingItemRowIndex, setAddingItemRowIndex] = useState(null);

    const fetchCustomers = (search = "") => {
        axios.get(route('api.payees', { search, type: 'Customer' })).then(res => setCustomerOptions(res.data));
    };

    const fetchProducts = (search = "") => {
        return axios.get(route('api.items', { search })).then(res => {
            setProductOptions(res.data);
            return res.data;
        });
    };

    const searchItems = async (search = "") => {
        const response = await axios.get(route('api.items', { search }));
        return response.data;
    };

    useEffect(() => {
        fetchCustomers();
        fetchProducts();
    }, []);

    const COLUMNS = [
        {
            key: "product",
            label: "Product/Service",
            placeholder: "Select product",
            options: productOptions,
            onSearch: searchItems,
            onAddNew: (index) => {
                setAddingItemRowIndex(index);
                setIsItemModalOpen(true);
            },
            type: "select",
            width: "320px"
        },
        { key: "description", label: "Description", placeholder: "Enter description" },
        { key: "qty", label: "Qty", type: "number", min: "0", width: "100px", className: "text-right" },
        { key: "rate", label: "Rate", type: "currency", width: "140px", className: "text-right", inputClass: "text-right" },
        { key: "amount", label: "Amount", type: "currency", width: "160px", className: "text-right", inputClass: "text-right" },
    ];


    const getInitialDate = () => {
        if (creditNote?.creditNoteDate) return creditNote.creditNoteDate;
        const cached = localStorage.getItem('last_transaction_date');
        if (cached) return cached;
        return new Date().toISOString().split('T')[0];
    };

const actionRef = useRef('save');
    const [isDirty, setIsDirty] = useState(false);
    const [savedEntryId, setSavedEntryId] = useState(creditNote?.id || null);

    const { data, setData, post, patch, processing, errors, reset, clearErrors, transform } = useForm({
        customer: creditNote?.customer || "",
        email: creditNote?.email || "",
        creditNoteDate: getInitialDate(),
        creditNoteNo: creditNote?.creditNoteNo || (nextCreditNoteNo ? String(parseInt(nextCreditNoteNo)).padStart(4, '0') : "1001"),
        memo: creditNote?.memo || "",
        statementMessage: creditNote?.statementMessage || "",
        action: 'save',
        items: creditNote?.items || [
            { product: "", description: "", qty: "1", rate: "0.00", amount: "0.00" },
            { product: "", description: "", qty: "1", rate: "0.00", amount: "0.00" },
        ],
    });

    useEffect(() => {
        if (creditNote) {
            setData(prev => ({
                ...prev,
                customer: creditNote.customer || "",
                email: creditNote.email || "",
                creditNoteDate: creditNote.creditNoteDate || "",
                creditNoteNo: creditNote.creditNoteNo || "",
                memo: creditNote.memo || "",
                statementMessage: creditNote.statementMessage || "",
                items: creditNote.items || [
                    { product: "", description: "", qty: "1", rate: "0.00", amount: "0.00" },
                    { product: "", description: "", qty: "1", rate: "0.00", amount: "0.00" },
                ]
            }));
        } else {
            const cachedDate = localStorage.getItem('last_transaction_date') || new Date().toISOString().split('T')[0];
            setData(prev => ({
                ...prev,
                customer: "",
                email: "",
                creditNoteDate: cachedDate,
                creditNoteNo: nextCreditNoteNo ? String(parseInt(nextCreditNoteNo)).padStart(4, '0') : "1001",
                memo: "",
                statementMessage: "",
                items: [
                    { product: "", description: "", qty: "1", rate: "0.00", amount: "0.00" },
                    { product: "", description: "", qty: "1", rate: "0.00", amount: "0.00" },
                ]
            }));
        }
        clearErrors();
    }, [creditNote?.id, nextCreditNoteNo]);

    useEffect(() => {
    transform((data) => ({
        ...data,
        action: actionRef.current,
        items: data.items
            .filter(item => item.product)
            .map(item => ({
                ...item,
                rate: String(item.rate).replace(/,/g, ''),
                amount: String(item.amount).replace(/,/g, '')
            }))
    }));
}, [transform]);

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
            let q = parseFloat(String(updated[index].qty).replace(/,/g, '')) || 0;
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
        setIsDirty(true);
    };

    const handleSave = (action = 'save') => {
        actionRef.current = action;

        const currentId = savedEntryId || creditNote?.id;
        const url = currentId ? route('credit-note.update', currentId) : route('credit-note.store');
        const method = currentId ? patch : post;

        method(url, {
            preserveScroll: true,
            preserveState: action === 'save',
            onSuccess: (page) => {
                showToast('success', 'Record saved successfully.');
                setIsDirty(false);

                const newId = page.props?.flash?.journal_entry_id
                           || page.props?.creditNote?.id
                           || page.props?.record?.id;
                if (newId && !savedEntryId) {
                    setSavedEntryId(newId);
                }

                if (action === 'new') {
                    setSavedEntryId(null);
                    const currentNo = data.creditNoteNo || '1001';
                    const num = parseInt(String(currentNo).replace(/[^0-9]/g, '')) || 1000;
                    const nextNo = String(num + 1).padStart(4, '0');
                    setData({
                        customer: "", email: "",
                        creditNoteDate: localStorage.getItem('last_transaction_date') || new Date().toISOString().split('T')[0],
                        creditNoteNo: nextNo, memo: "", statementMessage: "", action: 'save',
                        items: [
                            { product: "", description: "", qty: "1", rate: "0.00", amount: "0.00" },
                            { product: "", description: "", qty: "1", rate: "0.00", amount: "0.00" },
                        ]
                    });
                    reset();
                    clearErrors();
                    setIsDirty(false);
                }
            }
        });
    };
    return (
        <TransactionLayout
            historyType="sales return"
            title={`Sales Return #${data.creditNoteNo}`}
            amount={totalAmount}
            processing={processing}
            dirty={isDirty}
            onSave={() => handleSave('save')}
            onSaveAndClose={() => handleSave('close')}
            onSaveAndNew={() => handleSave('new')}
            onAddLine={() => {
                setData("items", [...data.items, { product: "", description: "", qty: "1", rate: "0.00", amount: "0.00" }]);
                setIsDirty(true);
            }}
            onClearRows={() => {
                setData("items", [{ product: "", description: "", qty: "1", rate: "0.00", amount: "0.00" }]);
                setIsDirty(true);
            }}
        >
            <Head title="Sales Return" />
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
                                    setIsDirty(true);

                                    // ADD THIS - fetch full customer info including email
                                    if (val) {
                                        axios.get(route('api.customers.info', val)).then(res => {
                                            if (res.data) {
                                                setData(d => ({
                                                    ...d,
                                                    email: res.data.email || d.email,
                                                    billingAddress: res.data.billing_address || d.billingAddress
                                                }));
                                            }
                                        }).catch(err => console.error("Failed to fetch customer info:", err));
                                    }
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
                                onChange={(e) => { setData("email", e.target.value); setIsDirty(true); }}
                                size="sm"
                                error={errors.email}
                            />
                        </div>
                    </div>

                    <div className="text-right flex flex-col items-end">
                        <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-1">Return Amount</p>
                        <p className="text-4xl font-black tracking-tighter text-slate-900 leading-none">
                            <span className="text-slate-400 text-[10px] font-medium mr-1">{currencyPrefix}</span>
                            {parseFloat(totalAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </p>
                    </div>
                </div>

                <div className="flex items-end gap-6 flex-wrap">
                    <div className="w-[180px]">
                        <CommonInput
                            type="date"
                            label="Sales Return date"
                            value={data.creditNoteDate}
                            onChange={(e) => {
                                const newDate = e.target.value;
                                localStorage.setItem('last_transaction_date', newDate);
                                setData('creditNoteDate', newDate);
                                setIsDirty(true);
                            }}
                            size="sm"
                            error={errors.creditNoteDate}
                        />
                    </div>
                    <div className="w-[160px]">
                        <CommonInput
                            label="Sales Return no."
                            value={data.creditNoteNo}
                            onChange={(e) => { setData('creditNoteNo', e.target.value); setIsDirty(true); }}
                            onFocus={(e) => {
                                const val = e.target.value.replace(/,/g, '');
                                setData('creditNoteNo', val);
                                setTimeout(() => e.target.select(), 0);
                            }}

                            onBlur={(e) => {
                                const val = e.target.value.replace(/,/g, '');
                                setData('creditNoteNo', val);
                            }}
                            size="sm"
                            inputClass="font-mono text-right"
                            error={errors.creditNoteNo}
                        />
                    </div>
                </div>
            </div>

            <LineItemsTable
                columns={COLUMNS}
                items={data.items}
                handleItemChange={handleItemChange}
                addRow={() => {
                    setData("items", [...data.items, { product: "", description: "", qty: "1", rate: "0.00", amount: "0.00" }]);
                    setIsDirty(true);
                }}
                removeRow={(index) => {
                    setData("items", data.items.filter((_, i) => i !== index));
                    setIsDirty(true);
                }}
                clearRows={() => {
                    setData("items", [{ product: "", description: "", qty: "1", rate: "0.00", amount: "0.00" }]);
                    setIsDirty(true);
                }}
                totals={{ "Total": totalAmount }}
                currencyPrefix={currencyPrefix}
                hideActions={true}
                errors={errors}
            />

            <div className="grid grid-cols-2 gap-10 mt-8">
                <div className="space-y-6">
                    <div className="w-[400px]">
                        <CommonInput
                            type="textarea"
                            label="Message displayed on sales return"
                            placeholder="Enter message"
                            value={data.memo}
                            onChange={(e) => { setData('memo', e.target.value); setIsDirty(true); }}
                            size="sm"
                            className="h-20"
                            error={errors.memo}
                        />
                    </div>
                    <div className="w-[400px]">
                        <CommonInput
                            type="textarea"
                            label="Message displayed on statement"
                            placeholder="Enter message"
                            value={data.statementMessage}
                            onChange={(e) => { setData('statementMessage', e.target.value); setIsDirty(true); }}
                            size="sm"
                            className="h-20"
                            error={errors.statementMessage}
                        />
                    </div>
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

        </TransactionLayout>
    );
}
