import { useState } from "react";
import TransactionLayout from "@/TransactionLayout/TransactionLayout";
import LineItemsTable from "@/TransactionLayout/LineItemsTable";
import BottomSection from "@/TransactionLayout/BottomSection";
import SearchableSelect from "@/Components/SearchableSelect";
import TermModal from "@/Components/TermModal";

export default function InvoiceForm({ customers = [], accounts = [], nextInvoiceNo = "" }) {
    const customerOptions = customers.map(c => ({ value: c.id, label: c.name }));
    const accountOptions = accounts.map(acc => ({ value: acc.id, label: `${acc.account_code} - ${acc.name}` }));

    // 1. Define Invoice Specific Columns
    const INVOICE_COLUMNS = [
        { key: "serviceDate", label: "Service Date", type: "date", placeholder: "" },
        { 
            key: "product", 
            label: "Product/Service", 
            placeholder: "Select product",
            options: [
                { label: "Product A", value: "A" },
                { label: "Service B", value: "B" },
                { label: "Consulting", value: "C" }
            ]
        },
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
        invoiceDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        invoiceNo: nextInvoiceNo || "0001",
        memo: "",
        statementMemo: "",
    });

    const [isTermModalOpen, setIsTermModalOpen] = useState(false);
    const [termOptions, setTermOptions] = useState([
        { label: "Net 30", value: "Net 30" },
        { label: "Net 15", value: "Net 15" },
        { label: "Due on receipt", value: "Due on receipt" }
    ]);

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

        if (field === "qty" || field === "rate") {
            const q = parseFloat(updated[index].qty) || 0;
            const r = parseFloat(updated[index].rate) || 0;
            updated[index].amount = (q * r).toFixed(2);
        }
        setItems(updated);
        setIsDirty(true);
    };

    const handleAddTerm = (newTerm) => {
        const option = { label: newTerm.name, value: newTerm.name };
        setTermOptions([...termOptions, option]);
        setForm({ ...form, terms: newTerm.name });
        setIsDirty(true);
    };

    const [isDirty, setIsDirty] = useState(false);

    const handleSave = (type = 'save') => {
        // Mock save logic
        console.log(`Saving with type: ${type}`, form, items);
        setIsDirty(false);
        if (type === 'close') window.history.back();
        if (type === 'new') window.location.reload();
    };

    return (
        <TransactionLayout 
            title={`Invoice no.${form.invoiceNo}`} 
            amount={totalAmount}
            dirty={isDirty}
            onSave={() => handleSave('save')}
            onSaveAndClose={() => handleSave('close')}
            onSaveAndNew={() => handleSave('new')}
            onAddLine={() => {
                setItems([...items, { product: "", service_date: "", description: "", qty: "1", rate: "0.00", amount: "0.00", tax: "" }]);
                setIsDirty(true);
            }}
            onClearRows={() => {
                setItems([{ product: "", service_date: "", description: "", qty: "1", rate: "0.00", amount: "0.00", tax: "" }]);
                setIsDirty(true);
            }}
        >

            {/* TOP SECTION: Redesigned for Premium Look */}
            <div className="grid grid-cols-12 gap-10 py-8 border-b border-slate-200">
                
                {/* Left Column: Customer & Address */}
                <div className="col-span-4 space-y-6">
                    <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm space-y-4">
                        <SearchableSelect 
                            label="Customer"
                            placeholder="Select a customer"
                            value={form.customer}
                            onChange={(val) => {
                                setForm({...form, customer: val});
                                setIsDirty(true);
                            }}
                            options={customerOptions}
                            initialLimit={10}
                        />
                        <div>
                            <label className="text-xs text-slate-500 block mb-1 font-bold">Billing address</label>
                            <textarea
                                className="w-full border border-slate-200 p-3 text-sm h-24 rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all bg-slate-50/30"
                                value={form.billingAddress}
                                placeholder="Enter billing address..."
                                onChange={(e) => {
                                    setForm({...form, billingAddress: e.target.value});
                                    setIsDirty(true);
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* Right Column: Financial Details */}
                <div className="col-span-8 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <div className="grid grid-cols-4 gap-4 flex-1">
                            <div>
                                <SearchableSelect 
                                    label="Terms"
                                    value={form.terms}
                                    onChange={(val) => {
                                        setForm({...form, terms: val});
                                        setIsDirty(true);
                                    }}
                                    onAddNew={() => setIsTermModalOpen(true)}
                                    options={termOptions}
                                    initialLimit={5}
                                />
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 block mb-1 font-bold">Invoice date</label>
                                <input 
                                    type="date" 
                                    className="w-full border-b border-slate-300 py-1.5 text-sm outline-none focus:border-primary bg-transparent transition-all" 
                                    value={form.invoiceDate} 
                                    onChange={(e) => setForm({...form, invoiceDate: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 block mb-1 font-bold">Due date</label>
                                <input 
                                    type="date" 
                                    className="w-full border-b border-slate-300 py-1.5 text-sm outline-none focus:border-primary bg-transparent transition-all" 
                                    value={form.dueDate} 
                                    onChange={(e) => setForm({...form, dueDate: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 block mb-1 font-bold">Invoice no.</label>
                                <input 
                                    className="w-full border-b border-slate-300 py-1.5 text-sm outline-none focus:border-primary bg-transparent transition-all font-mono" 
                                    value={form.invoiceNo} 
                                    onChange={(e) => setForm({...form, invoiceNo: e.target.value})}
                                />
                            </div>
                        </div>

                        {/* Balance Summary Box */}
                        <div className="ml-10 text-right bg-slate-900 text-white p-6 rounded-2xl shadow-xl min-w-[240px] transform hover:scale-105 transition-transform">
                            <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Balance Due</p>
                            <p className="text-3xl font-black tracking-tighter">
                                <span className="text-slate-400 text-sm font-medium mr-1">LKR</span>
                                {totalAmount}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <LineItemsTable
                columns={INVOICE_COLUMNS}
                items={items}
                handleItemChange={handleItemChange}
                addRow={() => setItems([...items, { product: "", service_date: "", description: "", qty: "1", rate: "0.00", amount: "0.00", tax: "" }])}
                removeRow={(index) => setItems(items.filter((_, i) => i !== index))}
                clearRows={() => setItems([{ product: "", service_date: "", description: "", qty: "1", rate: "0.00", amount: "0.00", tax: "" }])}
                totals={{ "Total": totalAmount }}
                hideActions={true}
            />

            <div className="grid grid-cols-2 gap-10 mt-8">
                <div className="space-y-6">
                    <div>
                        <label className="text-xs font-bold text-slate-600 block mb-2">Message on invoice</label>
                        <textarea
                            placeholder="This will show up on the invoice."
                            className="w-full border border-slate-200 rounded-lg p-3 text-sm h-24 outline-none focus:border-[#00713D] transition-all"
                            value={form.memo}
                            onChange={(e) => setForm({...form, memo: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-600 block mb-2">Message on statement</label>
                        <textarea
                            placeholder="If you send statements to customers, this will show up as the description for this invoice."
                            className="w-full border border-slate-200 rounded-lg p-3 text-sm h-24 outline-none focus:border-[#00713D] transition-all"
                            value={form.statementMemo}
                            onChange={(e) => setForm({...form, statementMemo: e.target.value})}
                        />
                    </div>
                </div>
                <div className="pt-4 flex flex-col items-end">
                    {/* Totals already handled inside LineItemsTable based on my previous edit, 
                        but I'll move them here for better control if needed.
                    */}
                </div>
            </div>

            <TermModal 
                isOpen={isTermModalOpen} 
                onClose={() => setIsTermModalOpen(false)}
                onSave={handleAddTerm}
            />

        </TransactionLayout>
    );
}
