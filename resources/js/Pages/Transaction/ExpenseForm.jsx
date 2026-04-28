import { useState } from "react";
import TransactionLayout from "@/TransactionLayout/TransactionLayout";
import LineItemsTable from "@/TransactionLayout/LineItemsTable";
import SearchableSelect from "@/Components/SearchableSelect";

export default function ExpenseForm({ suppliers = [], customers = [], employees = [], accounts = [], paymentMethods = [] }) {
    // Combine all payees
    const payeeOptions = [
        ...suppliers.map(s => ({ value: s.id, label: s.display_name || s.name, type: 'Supplier' })),
        ...customers.map(c => ({ value: c.id, label: c.display_name || c.name, type: 'Customer' })),
        ...employees.map(e => ({ value: e.id, label: e.user_name || e.name, type: 'Employee' }))
    ].sort((a, b) => a.label.localeCompare(b.label));

    const accountOptions = accounts.map(acc => ({ value: acc.id, label: `${acc.account_code} - ${acc.name}`, balance: acc.balance }));
    const methodOptions = paymentMethods.map(m => ({ value: m.id, label: m.name }));

    // 1. Define the columns for this specific page
    const EXPENSE_COLUMNS = [
        { 
            key: "category", 
            label: "Category", 
            placeholder: "Choose a category",
            options: accountOptions,
            type: "select"
        },
        { key: "description", label: "Description", placeholder: "What was this for?" },
        { key: "amount", label: "Amount", type: "number", className: "text-right", inputClass: "text-right" },
    ];

    const [form, setForm] = useState({ 
        payee: "", 
        account: "", 
        date: new Date().toISOString().split('T')[0], 
        method: "", 
        ref: "", 
        memo: "" 
    });
    const [items, setItems] = useState([{ category: "", description: "", amount: "" }]);

    const totalAmount = items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0).toFixed(2);

    const selectedAccountBalance = accounts.find(a => a.id === form.account)?.balance || "0.00";

    const handleItemChange = (index, field, value) => {
        const updated = [...items];
        updated[index][field] = value;
        setItems(updated);
    };

    return (
        <TransactionLayout 
            title="Expense" 
            amount={totalAmount}
            onAddLine={() => setItems([...items, { category: "", description: "", amount: "" }])}
            onClearRows={() => setItems([{ category: "", description: "", amount: "" }])}
        >
            {/* TOP SECTION: Redesigned for consistency */}
            <div className="grid grid-cols-12 gap-10 py-8 border-b border-slate-200">
                <div className="col-span-5 space-y-6">
                    <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm space-y-4">
                        <div className="space-y-1">
                            <SearchableSelect 
                                label="Payee"
                                placeholder="Who did you pay?"
                                value={form.payee}
                                onChange={(val) => setForm({...form, payee: val})}
                                options={payeeOptions}
                                initialLimit={10}
                            />
                        </div>
                        <div className="space-y-1 flex items-end gap-3">
                            <div className="flex-1">
                                <SearchableSelect 
                                    label="Payment account"
                                    placeholder="Select account"
                                    value={form.account}
                                    onChange={(val) => setForm({...form, account: val})}
                                    options={accountOptions}
                                    initialLimit={10}
                                />
                            </div>
                            {form.account && (
                                <div className="pb-2 min-w-[120px]">
                                    <p className="text-[10px] text-slate-400 uppercase font-bold">Balance</p>
                                    <p className="text-xs font-bold text-slate-600">
                                        <span className="text-[10px] font-medium mr-1 text-slate-400">LKR</span>
                                        {parseFloat(selectedAccountBalance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="col-span-7 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <div className="grid grid-cols-3 gap-8 flex-1">
                            <div>
                                <label className="text-xs text-slate-500 block mb-1 font-bold">Payment date</label>
                                <input 
                                    type="date" 
                                    className="w-full border-b border-slate-300 py-1.5 text-sm outline-none focus:border-primary bg-transparent transition-all" 
                                    value={form.date} 
                                    onChange={(e) => setForm({...form, date: e.target.value})}
                                />
                            </div>
                            <div>
                                <SearchableSelect 
                                    label="Payment method"
                                    placeholder="Choose method"
                                    value={form.method}
                                    onChange={(val) => setForm({...form, method: val})}
                                    options={methodOptions}
                                />
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 block mb-1 font-bold">Ref no.</label>
                                <input 
                                    className="w-full border-b border-slate-300 py-1.5 text-sm outline-none focus:border-primary bg-transparent transition-all font-mono" 
                                    value={form.ref} 
                                    onChange={(e) => setForm({...form, ref: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="ml-10 text-right bg-slate-900 text-white p-6 rounded-2xl shadow-xl min-w-[240px] transform hover:scale-105 transition-transform">
                            <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Amount Paid</p>
                            <p className="text-3xl font-black tracking-tighter">
                                <span className="text-slate-400 text-sm font-medium mr-1">LKR</span>
                                {totalAmount}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <LineItemsTable
                columns={EXPENSE_COLUMNS}
                items={items}
                handleItemChange={handleItemChange}
                addRow={() => setItems([...items, { category: "", description: "", amount: "" }])}
                removeRow={(index) => setItems(items.filter((_, i) => i !== index))}
                clearRows={() => setItems([{ category: "", description: "", amount: "" }])}
                totals={{ "Total": totalAmount }}
                hideActions={true}
            />

            <div className="mt-8 max-w-lg">
                <label className="text-xs font-bold text-slate-600 block mb-2">Memo</label>
                <textarea
                    placeholder="Add a memo..."
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm h-24 outline-none focus:border-primary transition-all"
                    value={form.memo}
                    onChange={(e) => setForm({...form, memo: e.target.value})}
                />
            </div>
        </TransactionLayout>
    );
}
