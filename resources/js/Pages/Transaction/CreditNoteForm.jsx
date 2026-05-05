import { useState, useEffect } from "react";
import { useForm } from "@inertiajs/react";
import TransactionLayout from "@/TransactionLayout/TransactionLayout";
import LineItemsTable from "@/TransactionLayout/LineItemsTable";
import SearchableSelect from "@/Components/SearchableSelect";
import CommonInput from "@/Components/CommonInput";

export default function CreditNoteForm({ auth, customers = [], items: products = [], nextCreditNoteNo = "", creditNote = null }) {
    const company = auth.company;
    const currencyPrefix = company?.home_currency_prefix || company?.home_currency || '$';
    const customerOptions = customers.map(c => ({ value: c.id, label: c.display_name || c.name }));
    const productOptions = products.map(p => ({ value: p.id, label: p.name, rate: p.sale_price }));

    const COLUMNS = [
        {
            key: "product",
            label: "Product/Service",
            placeholder: "Select product",
            options: productOptions,
            type: "select",
            width: "320px"
        },
        { key: "description", label: "Description", placeholder: "Enter description" },
        { key: "qty", label: "Qty", type: "number", width: "100px", className: "text-right" },
        { key: "rate", label: "Rate", type: "currency", width: "140px", className: "text-right", inputClass: "text-right" },
        { key: "amount", label: "Amount", type: "currency", width: "160px", className: "text-right", inputClass: "text-right" },
    ];

    const [currentAction, setCurrentAction] = useState('save');

    const { data, setData, post, patch, processing, errors, reset, clearErrors, transform } = useForm({
        customer: creditNote?.customer || "",
        email: creditNote?.email || "",
        creditNoteDate: creditNote?.creditNoteDate || new Date().toISOString().split('T')[0],
        creditNoteNo: creditNote?.creditNoteNo || nextCreditNoteNo || "1001",
        memo: creditNote?.memo || "",
        statementMessage: creditNote?.statementMessage || "",
        items: creditNote?.items || [
            { product: "", description: "", qty: "1", rate: "0.00", amount: "0.00" },
            { product: "", description: "", qty: "1", rate: "0.00", amount: "0.00" },
        ],
        action: 'save'
    });

    useEffect(() => {
        transform((data) => ({
            ...data,
            action: currentAction,
        }));
    }, [currentAction]);

    const totalAmount = data.items.reduce(
        (sum, item) => sum + (parseFloat(String(item.amount).replace(/,/g, '')) || 0),
        0
    ).toFixed(2);

    const handleItemChange = (index, field, value) => {
        const updated = [...data.items];
        updated[index][field] = value;

        if (field === "product") {
            const product = products.find(p => p.id === value);
            if (product) {
                updated[index].rate = product.sale_price;
                const q = parseFloat(updated[index].qty) || 0;
                updated[index].amount = (q * product.sale_price).toFixed(2);
            }
        }

        if (field === "qty" || field === "rate") {
            const q = parseFloat(updated[index].qty) || 0;
            const r = parseFloat(updated[index].rate) || 0;
            updated[index].amount = (q * r).toFixed(2);
        }
        setData("items", updated);
    };

    const handleSave = (action = 'save') => {
        setCurrentAction(action);
        const url = creditNote?.id ? route('credit-note.update', creditNote.id) : route('credit-note.store');
        const method = creditNote?.id ? patch : post;

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
            title={creditNote?.id ? `Edit Credit Note no.${data.creditNoteNo}` : `Credit Note no.${data.creditNoteNo}`}
            amount={totalAmount}
            processing={processing}
            onSave={() => handleSave('save')}
            onSaveAndClose={() => handleSave('close')}
            onSaveAndNew={() => handleSave('new')}
            onAddLine={() => {
                setData("items", [...data.items, { product: "", description: "", qty: "1", rate: "0.00", amount: "0.00" }]);
            }}
            onClearRows={() => {
                setData("items", [{ product: "", description: "", qty: "1", rate: "0.00", amount: "0.00" }]);
            }}
        >
            <div className="py-6 px-1 space-y-8">
                <div className="flex items-start justify-between gap-8">
                    <div className="flex items-start gap-6 flex-1">
                        <div className="w-[320px]">
                            <SearchableSelect
                                label="Customer"
                                placeholder="Select a customer"
                                value={data.customer}
                                onChange={(val) => {
                                    const customer = customers.find(c => c.id === val);
                                    if (customer) {
                                        setData(d => ({
                                            ...d,
                                            customer: val,
                                            email: customer.email || "",
                                        }));
                                    } else {
                                        setData('customer', val);
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
                                onChange={(e) => setData("email", e.target.value)}
                                size="sm"
                                error={errors.email}
                            />
                        </div>
                    </div>

                    <div className="text-right flex flex-col items-end">
                        <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-1">Credit Amount</p>
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
                            label="Credit note date"
                            value={data.creditNoteDate}
                            onChange={(e) => setData('creditNoteDate', e.target.value)}
                            size="sm"
                        />
                    </div>
                    <div className="w-[160px]">
                        <CommonInput
                            label="Credit note no."
                            value={data.creditNoteNo}
                            onChange={(e) => setData('creditNoteNo', e.target.value)}
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
                addRow={() => setData("items", [...data.items, { product: "", description: "", qty: "1", rate: "0.00", amount: "0.00" }])}
                removeRow={(index) => setData("items", data.items.filter((_, i) => i !== index))}
                clearRows={() => setData("items", [{ product: "", description: "", qty: "1", rate: "0.00", amount: "0.00" }])}
                totals={{ "Total": totalAmount }}
                currencyPrefix={currencyPrefix}
                hideActions={true}
            />

            <div className="grid grid-cols-2 gap-10 mt-8">
                <div className="space-y-6">
                    <div className="w-[400px]">
                        <CommonInput
                            type="textarea"
                            label="Message displayed on credit note"
                            placeholder="Enter message"
                            value={data.memo}
                            onChange={(e) => setData('memo', e.target.value)}
                            size="sm"
                            className="h-20"
                        />
                    </div>
                    <div className="w-[400px]">
                        <CommonInput
                            type="textarea"
                            label="Message displayed on statement"
                            placeholder="Enter message"
                            value={data.statementMessage}
                            onChange={(e) => setData('statementMessage', e.target.value)}
                            size="sm"
                            className="h-20"
                        />
                    </div>
                </div>
            </div>
        </TransactionLayout>
    );
}
