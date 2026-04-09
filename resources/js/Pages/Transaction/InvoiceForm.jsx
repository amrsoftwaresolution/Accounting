import { useState } from "react";
import TransactionLayout from "@/TransactionLayout/TransactionLayout";
import LineItemsTable from "@/TransactionLayout/LineItemsTable";
import BottomSection from "@/TransactionLayout/BottomSection";

export default function InvoiceForm() {
    // 1. Define Invoice Specific Columns
    const INVOICE_COLUMNS = [
        { key: "serviceDate", label: "Service Date", type: "date" },
        { key: "product", label: "Product/Service", placeholder: "Select product" },
        { key: "description", label: "Description", placeholder: "Enter description" },
        { key: "qty", label: "Qty", type: "number", className: "w-20" },
        { key: "rate", label: "Rate", type: "number", className: "text-right" },
        { key: "amount", label: "Amount", type: "number", className: "text-right", inputClass: "font-semibold" },
    ];

    // 2. Initial State
    const [form, setForm] = useState({
        customer: "",
        email: "",
        billingAddress: "",
        terms: "Net 30",
        invoiceDate: "2026-04-06",
        dueDate: "2026-05-06",
        invoiceNo: "1003",
        memo: "", // Message on invoice
        statementMemo: "", // Message on statement
    });

    const [items, setItems] = useState([
        { serviceDate: "", product: "", description: "", qty: "", rate: "", amount: "" },
        { serviceDate: "", product: "", description: "", qty: "", rate: "", amount: "" },
    ]);

    // 3. Calculation Logic
    const totalAmount = items.reduce(
        (sum, item) => sum + (parseFloat(item.amount) || 0),
        0
    ).toFixed(2);

    const handleItemChange = (index, field, value) => {
        const updated = [...items];
        updated[index][field] = value;

        // Auto-calculate amount if Qty or Rate changes
        if (field === "qty" || field === "rate") {
            const q = parseFloat(updated[index].qty) || 0;
            const r = parseFloat(updated[index].rate) || 0;
            updated[index].amount = (q * r).toFixed(2);
        }
        setItems(updated);
    };

    return (
        <TransactionLayout title={`Invoice no.${form.invoiceNo}`} amount={totalAmount}>

            {/* TOP SECTION: Invoice Specific Header Fields */}
            <div className="grid grid-cols-4 gap-6 py-4 border-b">
                <div className="col-span-1">
                    <label className="text-xs text-gray-500">Customer</label>
                    <select className="w-full border-b border-gray-300 py-1 text-sm bg-transparent outline-none">
                        <option>Select a customer</option>
                    </select>
                </div>
                <div className="col-span-1">
                    <label className="text-xs text-gray-500">Customer email</label>
                    <input
                        type="email"
                        placeholder="Separate emails with a comma"
                        className="w-full border-b border-gray-300 py-1 text-sm outline-none"
                        value={form.email}
                        onChange={(e) => setForm({...form, email: e.target.value})}
                    />
                </div>
                <div className="col-span-2 text-right">
                    <p className="text-xs text-gray-400 uppercase">Balance Due</p>
                    <p className="text-3xl font-bold text-gray-800 tracking-tight">LKR {totalAmount}</p>
                </div>

                <div className="col-span-1">
                    <label className="text-xs text-gray-500">Billing address</label>
                    <textarea
                        className="w-full border border-gray-200 p-2 text-sm h-20 rounded"
                        value={form.billingAddress}
                        onChange={(e) => setForm({...form, billingAddress: e.target.value})}
                    />
                </div>
                <div>
                    <label className="text-xs text-gray-500">Terms</label>
                    <select className="w-full border-b border-gray-300 py-1 text-sm bg-transparent outline-none">
                        <option>Net 30</option>
                    </select>
                </div>
                <div>
                    <label className="text-xs text-gray-500">Invoice date</label>
                    <input type="date" className="w-full border-b border-gray-300 py-1 text-sm" value={form.invoiceDate} />
                </div>
                <div>
                    <label className="text-xs text-gray-500">Due date</label>
                    <input type="date" className="w-full border-b border-gray-300 py-1 text-sm" value={form.dueDate} />
                </div>
            </div>

            {/* REUSED: Universal Table */}
            <LineItemsTable
                columns={INVOICE_COLUMNS}
                items={items}
                handleItemChange={handleItemChange}
                addRow={() => setItems([...items, { serviceDate: "", product: "", description: "", qty: "", rate: "", amount: "" }])}
                removeRow={(index) => setItems(items.filter((_, i) => i !== index))}
                clearRows={() => setItems([{ serviceDate: "", product: "", description: "", qty: "", rate: "", amount: "" }])}
                totals={{ "Total": totalAmount, "Balance due": totalAmount }}
            />

            {/* REUSED: Bottom Section with added Statement Memo */}
            <div className="grid grid-cols-2 gap-10">
                <BottomSection form={form} setForm={setForm} />
                <div className="pt-4">
                    <label className="text-xs text-gray-500">Message on statement</label>
                    <textarea
                        placeholder="If you send statements to customers, this will show up as the description for this invoice."
                        className="w-full border-b border-gray-300 text-sm py-1"
                        value={form.statementMemo}
                        onChange={(e) => setForm({...form, statementMemo: e.target.value})}
                    />
                </div>
            </div>

        </TransactionLayout>
    );
}
