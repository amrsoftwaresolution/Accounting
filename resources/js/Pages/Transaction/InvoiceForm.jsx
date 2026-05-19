import { useState, useEffect, useRef } from "react";
import { useForm, usePage } from "@inertiajs/react";
import TransactionLayout from "@/TransactionLayout/TransactionLayout";
import LineItemsTable from "@/TransactionLayout/LineItemsTable";
import SearchableSelect from "@/Components/SearchableSelect";
import CommonInput from "@/Components/CommonInput";
import TermModal from "@/Components/TermModal";
import QuickAddPayee from "@/Components/QuickAddPayee";
import QuickAddItem from "@/Components/QuickAddItem";
import axios from "axios";

export default function InvoiceForm({
    auth,
    nextInvoiceNo = "",
    invoice = null,
    lastInvoiceDate = null,
    lastDueDate = null,
    lastSaveAction = 'save'
}) {
    const { props } = usePage();
    const company = auth.company;
    const currencyPrefix = company?.home_currency_prefix || company?.home_currency || '$';

    const [customerOptions, setCustomerOptions] = useState([]);
    const [productOptions, setProductOptions] = useState([]);

    // Modal States
    const [isPayeeModalOpen, setIsPayeeModalOpen] = useState(false);
    const [isTermModalOpen, setIsTermModalOpen] = useState(false);
    const [isItemModalOpen, setIsItemModalOpen] = useState(false);
    const [addingItemRowIndex, setAddingItemRowIndex] = useState(null);

    const fetchPayees = (search = "") => {
        axios.get(route('api.payees', { search, type: 'Customer' })).then(res => {
            setCustomerOptions(res.data);
        });
    };

    const fetchItems = (search = "") => {
        return axios.get(route('api.items', { search })).then(res => {
            setProductOptions(res.data);
            return res.data;
        });
    };

    useEffect(() => {
        fetchPayees();
        fetchItems();
    }, []);

    // 1. Define Invoice Specific Columns
    const INVOICE_COLUMNS = [
        { key: "serviceDate", label: "Service Date", type: "date", width: "150px" },
        {
            key: "product",
            label: "Product/Service",
            placeholder: "Select product",
            options: productOptions,
            onSearch: fetchItems,
            onAddNew: (index) => {
                setAddingItemRowIndex(index);
                setIsItemModalOpen(true);
            },
            type: "select",
            width: "280px",
            hideChevron: true
        },
        { key: "description", label: "Description", placeholder: "Enter description" },
        { key: "qty", label: "Qty", type: "number", width: "80px", className: "text-right" },
        { key: "rate", label: "Rate", type: "currency", width: "120px", className: "text-right", inputClass: "text-right" },
        { key: "amount", label: "Amount", type: "currency", width: "140px", className: "text-right", inputClass: "text-right" },
    ];

    const actionRef = useRef(lastSaveAction);

    const [termOptions, setTermOptions] = useState([
        { label: "Net 30", value: "Net 30" },
        { label: "Net 15", value: "Net 15" },
        { label: "Due on receipt", value: "Due on receipt" }
    ]);

    const { data, setData, post, patch, processing, errors, reset, clearErrors, transform } = useForm({
        customer: invoice?.customer || "",
        email: invoice?.email || "",
        billingAddress: invoice?.billingAddress || "",
        terms: invoice?.terms || "Net 30",
        invoiceDate: invoice?.invoiceDate || lastInvoiceDate || new Date().toISOString().split('T')[0],
        dueDate: invoice?.dueDate || lastDueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        invoiceNo: invoice?.invoiceNo || nextInvoiceNo || "0001",
        memo: invoice?.memo || "",
        items: invoice?.items || [
            { serviceDate: "", product: "", description: "", qty: "1", rate: "0.00", amount: "0.00" },
            { serviceDate: "", product: "", description: "", qty: "1", rate: "0.00", amount: "0.00" },
        ],
        action: lastSaveAction
    });

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
                const rateValue = parseFloat(product.rate) || 0;
                updated[index].rate = formatCurrencyValue(rateValue);
                const q = parseFloat(updated[index].qty) || 0;
                updated[index].amount = formatCurrencyValue(q * rateValue);
            }
        }

        if (field === "qty" || field === "rate") {
            const q = parseFloat(updated[index].qty) || 0;
            const r = parseCurrency(updated[index].rate);
            updated[index].amount = formatCurrencyValue(q * r);
        }
        setData("items", updated);
    };

    const handleAddTerm = (newTerm) => {
        const option = { label: newTerm.name, value: newTerm.name };
        setTermOptions([...termOptions, option]);
        setData("terms", newTerm.name);
    };

    const handleSave = (action = 'save') => {
        actionRef.current = action;
        const url = invoice?.id ? route('invoice.update', invoice.id) : route('invoice.store');
        const method = invoice?.id ? patch : post;

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

    return (
        <TransactionLayout
            title={invoice?.id ? `Edit Invoice no.${data.invoiceNo}` : `Invoice no.${data.invoiceNo}`}
            amount={totalAmount}
            processing={processing}
            onSave={() => handleSave('save')}
            onSaveAndClose={() => handleSave('close')}
            onSaveAndNew={() => handleSave('new')}
            onAddLine={() => {
                setData("items", [...data.items, { product: "", serviceDate: "", description: "", qty: "1", rate: "0.00", amount: "0.00" }]);
            }}
            onClearRows={() => {
                setData("items", [{ product: "", serviceDate: "", description: "", qty: "1", rate: "0.00", amount: "0.00" }]);
            }}
            lastAction={lastSaveAction}
        >
            <div className="py-6 px-1 space-y-8">
                {/* ROW 1: Customer & Email & Balance */}
                <div className="flex items-start justify-between gap-8">
                    <div className="flex items-start gap-6 flex-1">
                        <div className="w-[320px]">
                            <SearchableSelect
                                label="Customer"
                                placeholder="Select a customer"
                                value={data.customer}
                                onChange={(val) => {
                                    setData('customer', val);
                                    const customer = customerOptions.find(c => c.value === val);
                                    if (customer) {
                                        // We might need to fetch full customer details if needed
                                        // But for now let's assume we have what we need or just use the val
                                    }
                                }}
                                options={customerOptions}
                                onSearch={fetchPayees}
                                size="sm"
                                error={errors.customer}
                                onAddNew={() => setIsPayeeModalOpen(true)}
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

                    {/* Balance Display */}
                    <div className="text-right flex flex-col items-end">
                        <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-1">Balance Due</p>
                        <p className="text-4xl font-black tracking-tighter text-slate-900 leading-none">
                            <span className="text-slate-400 text-[10px] font-medium mr-1">{currencyPrefix}</span>
                            {parseFloat(totalAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </p>
                    </div>
                </div>

                {/* ROW 2: Address, Terms, Dates, No */}
                <div className="flex items-end gap-6">
                    <div className="w-[240px]">
                        <CommonInput
                            type="textarea"
                            label="Billing address"
                            placeholder=""
                            value={data.billingAddress}
                            onChange={(e) => setData("billingAddress", e.target.value)}
                            rows={1}
                            size="sm"
                            inputClass="min-h-[30px] h-auto"
                        />
                    </div>
                    <div className="w-[180px]">
                        <SearchableSelect
                            label="Terms"
                            value={data.terms}
                            onChange={(val) => setData('terms', val)}
                            onAddNew={() => setIsTermModalOpen(true)}
                            options={termOptions}
                            size="sm"
                        />
                    </div>
                    <div className="w-[160px]">
                        <CommonInput
                            type="date"
                            label="Invoice date"
                            value={data.invoiceDate}
                            onChange={(e) => setData('invoiceDate', e.target.value)}
                            size="sm"
                        />
                    </div>
                    <div className="w-[160px]">
                        <CommonInput
                            type="date"
                            label="Due date"
                            value={data.dueDate}
                            onChange={(e) => setData('dueDate', e.target.value)}
                            size="sm"
                        />
                    </div>
                    <div className="flex-1"></div>
                    <div className="w-[160px]">
                        <CommonInput
                            label="Invoice no."
                            value={data.invoiceNo}
                            onChange={(e) => setData('invoiceNo', e.target.value)}
                            size="sm"
                            inputClass="font-mono text-right"
                        />
                    </div>
                </div>
            </div>

            <LineItemsTable
                columns={INVOICE_COLUMNS}
                items={data.items}
                handleItemChange={handleItemChange}
                addRow={() => setData("items", [...data.items, { product: "", serviceDate: "", description: "", qty: "1", rate: "0.00", amount: "0.00" }])}
                removeRow={(index) => setData("items", data.items.filter((_, i) => i !== index))}
                clearRows={() => setData("items", [{ product: "", serviceDate: "", description: "", qty: "1", rate: "0.00", amount: "0.00" }])}
                totals={{ "Total": totalAmount }}
                currencyPrefix={currencyPrefix}
                hideActions={true}
            />

            <div className="grid grid-cols-2 gap-10 mt-8">
                <div className="w-[400px]">
                    <CommonInput
                        type="textarea"
                        label="Message on invoice"
                        placeholder="This will show up on the invoice."
                        value={data.memo}
                        onChange={(e) => setData('memo', e.target.value)}
                        size="sm"
                        className="h-24"
                    />
                </div>
                <div className="pt-4 flex flex-col items-end">
                </div>
            </div>

            <TermModal
                isOpen={isTermModalOpen}
                onClose={() => setIsTermModalOpen(false)}
                onSave={handleAddTerm}
            />

            <QuickAddPayee
                isOpen={isPayeeModalOpen}
                onClose={() => setIsPayeeModalOpen(false)}
                onSuccess={(newPayee) => {
                    if (newPayee) {
                        fetchPayees();
                        setData("customer", newPayee.value);
                    }
                }}
                initialType="customer"
            />

            <QuickAddItem
                isOpen={isItemModalOpen}
                onClose={() => {
                    setIsItemModalOpen(false);
                    setAddingItemRowIndex(null);
                }}
                onSuccess={(newItem) => {
                    fetchItems().then(() => {
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
