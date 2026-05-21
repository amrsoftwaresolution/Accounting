import { useState } from "react";
import { usePage } from "@inertiajs/react";
import TransactionLayout from "@/TransactionLayout/TransactionLayout";
import LineItemsTable from "@/TransactionLayout/LineItemsTable";
import SearchableSelect from "@/Components/SearchableSelect";

export default function CreditNoteForm({ customers = [] }) {
    const { auth } = usePage().props;
    const currencyPrefix = auth.company?.home_currency_prefix || "Rs.";
    // 1. Setup Options
    const customerOptions = customers.map(c => ({
        value: c.id,
        label: c.display_name || c.name,
        email: c.email,
        address: c.billing_address
    }));

    // 2. Table Columns Configuration
    const CREDIT_NOTE_COLUMNS = [
        { key: "service_date", label: "Service Date", type: "date" },
        { key: "description", label: "Description", placeholder: "What is this credit for?" },
        { key: "amount", label: "Amount", type: "number", className: "w-40 text-right", inputClass: "text-right font-bold" },
    ];

    // 3. State Management
    const [form, setForm] = useState({
        customer_id: "",
        email: "",
        billing_address: "",
        date: new Date().toISOString().split('T')[0],
        credit_note_no: "1003",
        message_on_note: "",
        message_on_statement: "",
        discount_percent: 0
    });

    const [items, setItems] = useState([
        { service_date: "", description: "", amount: "" }
    ]);

    // 4. Calculations
    const subtotal = items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
    const discountAmount = (subtotal * (parseFloat(form.discount_percent) || 0)) / 100;
    const totalCredit = subtotal - discountAmount;

    // 5. Handlers
    const handleCustomerChange = (val) => {
        const customer = customerOptions.find(c => c.value === val);
        setForm({
            ...form,
            customer_id: val,
            email: customer?.email || "",
            billing_address: customer?.address || ""
        });
    };

    const handleItemChange = (index, field, value) => {
        const updated = [...items];
        updated[index][field] = value;
        setItems(updated);
    };

    return (
        <TransactionLayout
            title={`Sales Return #${form.credit_note_no}`}
            amount={totalCredit.toFixed(2)}
            onAddLine={() => setItems([...items, { service_date: "", description: "", amount: "" }])}
            onClearRows={() => setItems([{ service_date: "", description: "", amount: "" }])}
        >
            {/* TOP SECTION */}
            <div className="py-8 border-b border-slate-200">
                <div className="grid grid-cols-12 gap-8">

                    {/* Left: Customer Selection & Billing */}
                    <div className="col-span-8 space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <SearchableSelect
                                label="Customer"
                                placeholder="Choose a customer"
                                value={form.customer_id}
                                onChange={handleCustomerChange}
                                options={customerOptions}
                            />
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
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="text-xs text-slate-500 block mb-1 font-bold">Billing Address</label>
                                <textarea
                                    className="w-full border border-slate-200 rounded-lg p-3 text-sm h-24 outline-none focus:border-primary transition-all bg-white shadow-sm"
                                    value={form.billing_address}
                                    onChange={(e) => setForm({...form, billing_address: e.target.value})}
                                />
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs text-slate-500 block mb-1 font-bold">Sales Return Date</label>
                                    <input
                                        type="date"
                                        className="w-full border-b border-slate-300 py-1.5 text-sm outline-none focus:border-primary bg-transparent"
                                        value={form.date}
                                        onChange={(e) => setForm({...form, date: e.target.value})}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Header Amount & Reference */}
                    <div className="col-span-4 flex flex-col items-end justify-between">
                        <div className="text-right bg-slate-900 text-white p-6 rounded-2xl shadow-xl min-w-[260px]">
                            <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Amount to Credit</p>
                            <p className="text-4xl font-black tracking-tighter">
                                <span className="text-slate-400 text-sm font-medium mr-1">{currencyPrefix}</span>
                                {totalCredit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </p>
                        </div>
                        <div className="w-full max-w-[180px]">
                            <label className="text-xs text-slate-500 block mb-1 font-bold text-right">Sales Return no.</label>
                            <input
                                className="w-full border-b border-slate-300 py-1.5 text-sm text-right outline-none font-mono font-bold"
                                value={form.credit_note_no}
                                onChange={(e) => setForm({...form, credit_note_no: e.target.value})}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* TABLE SECTION */}
            <LineItemsTable
                columns={CREDIT_NOTE_COLUMNS}
                items={items}
                handleItemChange={handleItemChange}
                addRow={() => setItems([...items, { service_date: "", description: "", amount: "" }])}
                removeRow={(index) => setItems(items.filter((_, i) => i !== index))}
                clearRows={() => setItems([{ service_date: "", description: "", amount: "" }])}
                totals={{ "Amount": subtotal.toFixed(2) }}
                currencyPrefix={currencyPrefix}
            />

            {/* BOTTOM SECTION */}
            <div className="mt-10 grid grid-cols-2 gap-12">
                {/* Messages */}
                <div className="space-y-6">
                    <div>
                        <label className="text-xs font-bold text-slate-600 block mb-2 uppercase tracking-wide">Message displayed on sales return</label>
                        <textarea
                            className="w-full border border-slate-200 rounded-lg p-3 text-sm h-20 outline-none focus:border-primary transition-all shadow-sm"
                            value={form.message_on_note}
                            onChange={(e) => setForm({...form, message_on_note: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-600 block mb-2 uppercase tracking-wide">Message displayed on statement</label>
                        <textarea
                            className="w-full border border-slate-200 rounded-lg p-3 text-sm h-20 outline-none focus:border-primary transition-all shadow-sm"
                            value={form.message_on_statement}
                            onChange={(e) => setForm({...form, message_on_statement: e.target.value})}
                        />
                    </div>
                </div>

                {/* Totals Breakdown */}
                <div className="flex flex-col items-end space-y-4 pt-4">
                    <div className="flex justify-between w-72 text-sm text-slate-600">
                        <span>Subtotal</span>
                        <span className="font-semibold">{currencyPrefix} {subtotal.toFixed(2)}</span>
                    </div>

                    <div className="flex items-center justify-between w-72 gap-4">
                        <select
                            className="text-xs border-none bg-slate-100 rounded px-2 py-1 outline-none font-bold"
                            value="Discount Percent"
                        >
                            <option>Discount Percent</option>
                        </select>
                        <div className="flex items-center gap-2 border-b border-slate-300 w-24">
                            <input
                                type="number"
                                className="w-full text-right text-sm py-1 outline-none bg-transparent"
                                value={form.discount_percent}
                                onChange={(e) => setForm({...form, discount_percent: e.target.value})}
                            />
                            <span className="text-xs text-slate-400">%</span>
                        </div>
                    </div>

                    <div className="flex justify-between w-72 text-sm font-bold border-t border-slate-200 pt-4">
                        <span>Total</span>
                        <span>{currencyPrefix} {totalCredit.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between w-72 text-lg font-black text-slate-900">
                        <span>Total Credit</span>
                        <span>{currencyPrefix} {totalCredit.toFixed(2)}</span>
                    </div>
                </div>
            </div>
        </TransactionLayout>
    );
}
