import { useState, useEffect } from "react";
import { useForm } from "@inertiajs/react";
import TransactionLayout from "@/TransactionLayout/TransactionLayout";
import LineItemsTable from "@/TransactionLayout/LineItemsTable";
import SearchableSelect from "@/Components/SearchableSelect";
import CommonInput from "@/Components/CommonInput";

export default function SalesReceiptForm({ auth, customers = [], items: products = [], accounts = [], paymentMethods = [], nextReceiptNo = "", receipt = null }) {
    const company = auth.company;
    const currencyPrefix = company?.home_currency_prefix || company?.home_currency || '$';
    const customerOptions = customers.map(c => ({ value: c.id, label: c.display_name || c.name }));
    const productOptions = products.map(p => ({ value: p.id, label: p.name, rate: p.sale_price }));
    const accountOptions = accounts.map(a => ({ value: a.id, label: `${a.account_code} - ${a.name}` }));
    const paymentMethodOptions = paymentMethods.map(pm => ({ value: pm.id, label: pm.name }));

    const COLUMNS = [
        { key: "serviceDate", label: "Service Date", type: "date", width: "150px" },
        {
            key: "product",
            label: "Product/Service",
            placeholder: "Select product",
            options: productOptions,
            type: "select",
            width: "280px"
        },
        { key: "description", label: "Description", placeholder: "Enter description" },
        { key: "qty", label: "Qty", type: "number", width: "80px", className: "text-right" },
        { key: "rate", label: "Rate", type: "currency", width: "120px", className: "text-right", inputClass: "text-right" },
        { key: "amount", label: "Amount", type: "currency", width: "140px", className: "text-right", inputClass: "text-right" },
    ];

    const [currentAction, setCurrentAction] = useState('save');

    const { data, setData, post, patch, processing, errors, reset, clearErrors, transform } = useForm({
        customer: receipt?.customer || "",
        email: receipt?.email || "",
        billingAddress: receipt?.billingAddress || "",
        receiptDate: receipt?.receiptDate || new Date().toISOString().split('T')[0],
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
        const url = receipt?.id ? route('receipt.update', receipt.id) : route('receipt.store');
        const method = receipt?.id ? patch : post;

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
            title={receipt?.id ? `Edit Sales Receipt no.${data.receiptNo}` : `Sales Receipt no.${data.receiptNo}`}
            amount={totalAmount}
            processing={processing}
            onSave={() => handleSave('save')}
            onSaveAndClose={() => handleSave('close')}
            onSaveAndNew={() => handleSave('new')}
            onAddLine={() => {
                setData("items", [...data.items, { product: "", service_date: "", description: "", qty: "1", rate: "0.00", amount: "0.00" }]);
            }}
            onClearRows={() => {
                setData("items", [{ product: "", service_date: "", description: "", qty: "1", rate: "0.00", amount: "0.00" }]);
            }}
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
                                    const customer = customers.find(c => c.id === val);
                                    if (customer) {
                                        setData(d => ({
                                            ...d,
                                            customer: val,
                                            email: customer.email || "",
                                            billingAddress: customer.billing_address || ""
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

                    {/* Balance Display */}
                    <div className="text-right flex flex-col items-end">
                        <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-1">Total Amount</p>
                        <p className="text-4xl font-black tracking-tighter text-slate-900 leading-none">
                            <span className="text-slate-400 text-[10px] font-medium mr-1">{currencyPrefix}</span>
                            {parseFloat(totalAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </p>
                    </div>
                </div>

                {/* ROW 2: Address, Payment Method, Deposit To, Dates, No */}
                <div className="flex items-end gap-6 flex-wrap">
                    <div className="w-[240px]">
                        <CommonInput
                            type="textarea"
                            label="Billing address"
                            placeholder=""
                            value={data.billingAddress}
                            onChange={(e) => setData("billingAddress", e.target.value)}
                            className="h-[74px]"
                            size="sm"
                        />
                    </div>
                    <div className="w-[180px]">
                        <CommonInput
                            type="date"
                            label="Sales receipt date"
                            value={data.receiptDate}
                            onChange={(e) => setData('receiptDate', e.target.value)}
                            size="sm"
                        />
                    </div>
                    <div className="w-[180px]">
                        <SearchableSelect
                            label="Payment method"
                            value={data.paymentMethod}
                            onChange={(val) => setData('paymentMethod', val)}
                            options={paymentMethodOptions}
                            size="sm"
                        />
                    </div>
                    <div className="w-[240px]">
                        <SearchableSelect
                            label="Deposit to"
                            placeholder="Select account"
                            value={data.depositTo}
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
            />

            <div className="grid grid-cols-2 gap-10 mt-8">
                <div className="space-y-6">
                    <div className="w-[400px]">
                        <CommonInput
                            type="textarea"
                            label="Message displayed on sales receipt"
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
