import { useState, useEffect } from "react";
import TransactionLayout from "@/TransactionLayout/TransactionLayout";
import LineItemsTable from "@/TransactionLayout/LineItemsTable";
import SearchableSelect from "@/Components/SearchableSelect";

export default function SalesReceipt({
    customers = [],
    products = [],
    paymentMethods = [],
    depositAccounts = []
}) {
    // 1. Setup Options
    const customerOptions = customers.map(c => ({
        value: c.id,
        label: c.display_name || c.name,
        email: c.email,
        address: c.billing_address
    }));

    const productOptions = products.map(p => ({
        value: p.id,
        label: p.name,
        rate: p.sales_rate || 0,
        description: p.description || ""
    }));

    const methodOptions = paymentMethods.map(m => ({ value: m.id, label: m.name }));
    const accountOptions = depositAccounts.map(acc => ({ value: acc.id, label: acc.name }));

    // 2. Table Columns Configuration
    const SALES_COLUMNS = [
        { key: "service_date", label: "Service Date", type: "date" },
        {
            key: "product_id",
            label: "Product/Service",
            options: productOptions,
            placeholder: "Select a product"
        },
        { key: "description", label: "Description" },
        { key: "qty", label: "Qty", type: "number", className: "w-20 text-right" },
        { key: "rate", label: "Rate", type: "number", className: "w-32 text-right" },
        { key: "amount", label: "Amount", type: "number", className: "w-32 text-right", inputClass: "bg-slate-50 font-bold" },
    ];

    // 3. State Management
    const [form, setForm] = useState({
        customer_id: "",
        email: "",
        billing_address: "",
        date: new Date().toISOString().split('T')[0],
        payment_method: "",
        reference_no: "",
        deposit_to: "",
        receipt_no: "1003", // This would ideally come from props/backend
        message_on_receipt: "",
        message_on_statement: ""
    });

    const [items, setItems] = useState([
        { service_date: "", product_id: "", description: "", qty: 1, rate: 0, amount: 0 }
    ]);

    // 4. Calculations
    const subtotal = items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
    const total = subtotal; // You can add tax/discount logic here

    // 5. Handlers
    const handleItemChange = (index, field, value) => {
        const updated = [...items];
        updated[index][field] = value;

        // Auto-fill logic when product is selected
        if (field === "product_id") {
            const product = productOptions.find(p => p.value === value);
            if (product) {
                updated[index].rate = product.rate;
                updated[index].description = product.description;
            }
        }

        // Calculate line amount
        const qty = parseFloat(updated[index].qty) || 0;
        const rate = parseFloat(updated[index].rate) || 0;
        updated[index].amount = (qty * rate).toFixed(2);

        setItems(updated);
    };

    const handleCustomerChange = (val) => {
        const customer = customerOptions.find(c => c.value === val);
        setForm({
            ...form,
            customer_id: val,
            email: customer?.email || "",
            billing_address: customer?.address || ""
        });
    };

    return (
        <TransactionLayout
            title={`Sales Receipt #${form.receipt_no}`}
            amount={total.toFixed(2)}
            onAddLine={() => setItems([...items, { service_date: "", product_id: "", description: "", qty: 1, rate: 0, amount: 0 }])}
            onClearRows={() => setItems([{ service_date: "", product_id: "", description: "", qty: 1, rate: 0, amount: 0 }])}
        >
            {/* TOP FORM SECTION */}
            <div className="py-8 border-b border-slate-200">
                <div className="grid grid-cols-12 gap-6">
                    {/* Left Column: Customer Info */}
                    <div className="col-span-8 grid grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <SearchableSelect
                                label="Customer"
                                placeholder="Choose a customer"
                                value={form.customer_id}
                                onChange={handleCustomerChange}
                                options={customerOptions}
                            />
                            <div>
                                <label className="text-xs text-slate-500 block mb-1 font-bold">Billing address</label>
                                <textarea
                                    className="w-full border border-slate-200 rounded-lg p-2 text-sm h-24 outline-none focus:border-primary transition-all"
                                    value={form.billing_address}
                                    onChange={(e) => setForm({...form, billing_address: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-slate-500 block mb-1 font-bold">Email</label>
                                <input
                                    type="email"
                                    placeholder="Email (Separate emails with a comma)"
                                    className="w-full border-b border-slate-300 py-1.5 text-sm outline-none focus:border-primary bg-transparent"
                                    value={form.email}
                                    onChange={(e) => setForm({...form, email: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 block mb-1 font-bold">Sales Receipt Date</label>
                                <input
                                    type="date"
                                    className="w-full border-b border-slate-300 py-1.5 text-sm outline-none focus:border-primary bg-transparent"
                                    value={form.date}
                                    onChange={(e) => setForm({...form, date: e.target.value})}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Amount Summary */}
                    <div className="col-span-4 flex flex-col items-end justify-between">
                        <div className="text-right bg-slate-900 text-white p-6 rounded-2xl shadow-xl min-w-[240px]">
                            <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Total Amount</p>
                            <p className="text-3xl font-black tracking-tighter">
                                <span className="text-slate-400 text-sm font-medium mr-1">LKR</span>
                                {total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </p>
                        </div>
                        <div className="w-full max-w-[200px]">
                            <label className="text-xs text-slate-500 block mb-1 font-bold text-right">Sales Receipt no.</label>
                            <input
                                className="w-full border-b border-slate-300 py-1.5 text-sm text-right outline-none font-mono"
                                value={form.receipt_no}
                                onChange={(e) => setForm({...form, receipt_no: e.target.value})}
                            />
                        </div>
                    </div>
                </div>

                {/* Middle Row: Payment Info */}
                <div className="grid grid-cols-4 gap-6 mt-6">
                    <SearchableSelect
                        label="Payment method"
                        placeholder="Choose method"
                        value={form.payment_method}
                        onChange={(val) => setForm({...form, payment_method: val})}
                        options={methodOptions}
                    />
                    <div>
                        <label className="text-xs text-slate-500 block mb-1 font-bold">Reference no.</label>
                        <input
                            className="w-full border-b border-slate-300 py-1.5 text-sm outline-none focus:border-primary"
                            value={form.reference_no}
                            onChange={(e) => setForm({...form, reference_no: e.target.value})}
                        />
                    </div>
                    <SearchableSelect
                        label="Deposit to"
                        placeholder="Select account"
                        value={form.deposit_to}
                        onChange={(val) => setForm({...form, deposit_to: val})}
                        options={accountOptions}
                    />
                </div>
            </div>

            {/* TABLE SECTION */}
            <LineItemsTable
                columns={SALES_COLUMNS}
                items={items}
                handleItemChange={handleItemChange}
                addRow={() => setItems([...items, { service_date: "", product_id: "", description: "", qty: 1, rate: 0, amount: 0 }])}
                removeRow={(index) => setItems(items.filter((_, i) => i !== index))}
                clearRows={() => setItems([{ service_date: "", product_id: "", description: "", qty: 1, rate: 0, amount: 0 }])}
                totals={{ "Amount": subtotal.toFixed(2) }}
            />

            {/* BOTTOM SECTION */}
            <div className="mt-8 grid grid-cols-2 gap-12">
                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-slate-600 block mb-2">Message displayed on sales receipt</label>
                        <textarea
                            className="w-full border border-slate-200 rounded-lg p-3 text-sm h-20 outline-none focus:border-primary transition-all"
                            value={form.message_on_receipt}
                            onChange={(e) => setForm({...form, message_on_receipt: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-600 block mb-2">Message displayed on statement</label>
                        <textarea
                            className="w-full border border-slate-200 rounded-lg p-3 text-sm h-20 outline-none focus:border-primary transition-all"
                            value={form.message_on_statement}
                            onChange={(e) => setForm({...form, message_on_statement: e.target.value})}
                        />
                    </div>
                </div>

                <div className="flex flex-col justify-end items-end space-y-3">
                    <div className="flex justify-between w-64 text-sm">
                        <span className="text-slate-500">Subtotal</span>
                        <span className="font-bold">LKR {subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between w-64 text-lg border-t pt-3">
                        <span className="font-black">Total</span>
                        <span className="font-black">LKR {total.toFixed(2)}</span>
                    </div>
                </div>
            </div>
        </TransactionLayout>
    );
}
