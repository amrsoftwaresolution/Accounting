import { useState } from "react";
import { useForm, usePage } from "@inertiajs/react";
import TransactionLayout from "@/TransactionLayout/TransactionLayout";
import LineItemsTable from "@/TransactionLayout/LineItemsTable";
import SearchableSelect from "@/Components/SearchableSelect";

export default function SupplierCreditForm({ suppliers = [], accounts = [] }) {
    const { auth } = usePage().props;
    const currencyPrefix = auth.company?.home_currency_prefix || "Rs.";
    // 1. Map Options
    const supplierOptions = suppliers.map(s => ({
        value: s.id,
        label: s.display_name || s.name,
        address: s.mailing_address
    }));

    const accountOptions = accounts.map(acc => ({
        value: acc.id,
        label: `${acc.account_code} - ${acc.name}`
    }));

    // 2. Define Columns (Category, Description, Amount)
    const CREDIT_COLUMNS = [
        {
            key: "category",
            label: "Category",
            placeholder: "Choose an account",
            options: accountOptions,
            type: "select"
        },
        { key: "description", label: "Description", placeholder: "Enter description" },
        { key: "amount", label: "Amount", type: "number", className: "text-right", inputClass: "text-right font-bold" },
    ];

    // 3. State Management
    const [form, setForm] = useState({
        supplier_id: "",
        mailing_address: "",
        date: new Date().toISOString().split('T')[0],
        ref: "",
        memo: ""
    });

    const [items, setItems] = useState([{ category: "", description: "", amount: "" }]);
    const { post, processing } = useForm();

    // 4. Calculations
    const totalAmount = items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0).toFixed(2);

    // 5. Handlers
    const handleSupplierChange = (val) => {
        const selected = supplierOptions.find(s => s.value === val);
        setForm({
            ...form,
            supplier_id: val,
            mailing_address: selected?.address || ""
        });
    };

    const handleItemChange = (index, field, value) => {
        const updated = [...items];
        updated[index][field] = value;
        setItems(updated);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validate required fields
        if (!form.supplier_id) {
            alert('Please select a supplier');
            return;
        }

        if (items.some(item => !item.category || !item.amount)) {
            alert('Please fill in all required fields in line items');
            return;
        }

        post(route('SupplierCredit.store'), {
            data: {
                supplier_id: form.supplier_id,
                date: form.date,
                ref: form.ref,
                memo: form.memo,
                items: items.filter(item => item.category && item.amount)
            }
        });
    };

    return (
        <form onSubmit={handleSubmit}>
            <TransactionLayout
                historyType="supplier return"
                title="Supplier Return"
                amount={totalAmount}
                onAddLine={() => setItems([...items, { category: "", description: "", amount: "" }])}
                onClearRows={() => setItems([{ category: "", description: "", amount: "" }])}
                onSubmit={handleSubmit}
                isSubmitting={processing}
            >
                {/* TOP SECTION */}
                <div className="grid grid-cols-12 gap-10 py-8 border-b border-slate-200">

                    {/* Left Side: Supplier & Address */}
                    <div className="col-span-6 space-y-6">
                        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-sm space-y-4">
                            <SearchableSelect
                                label="Supplier"
                                placeholder="Choose a supplier"
                                value={form.supplier_id}
                                onChange={handleSupplierChange}
                                options={supplierOptions}
                            />

                            <div>
                                <label className="text-[10px] text-slate-400 uppercase font-black tracking-wider block mb-1">
                                    Mailing address
                                </label>
                                <textarea
                                    className="w-full border border-slate-200 rounded-lg p-3 text-sm h-24 outline-none focus:border-primary transition-all bg-slate-50/30"
                                    value={form.mailing_address}
                                    onChange={(e) => setForm({...form, mailing_address: e.target.value})}
                                    placeholder="Supplier address will appear here..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Metadata & Real-time Total */}
                    <div className="col-span-6 flex flex-col justify-between">
                        <div className="flex justify-end">
                            <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl min-w-[280px] text-right transform transition-all hover:scale-[1.02]">
                                <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Return Amount</p>
                                <p className="text-3xl font-black tracking-tighter">
                                    <span className="text-slate-400 text-sm font-medium mr-2">{currencyPrefix}</span>
                                    {parseFloat(totalAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6 mt-auto">
                            <div>
                                <label className="text-xs text-slate-500 block mb-1 font-bold">Supplier Return date</label>
                                <input
                                    type="date"
                                    className="w-full border-b border-slate-300 py-2 text-sm outline-none focus:border-primary bg-transparent transition-all"
                                    value={form.date}
                                    onChange={(e) => setForm({...form, date: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 block mb-1 font-bold">Ref no.</label>
                                <input
                                    className="w-full border-b border-slate-300 py-2 text-sm outline-none focus:border-primary bg-transparent transition-all font-mono"
                                    placeholder="Credit reference"
                                    value={form.ref}
                                    onChange={(e) => setForm({...form, ref: e.target.value})}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* TABLE SECTION */}
                <LineItemsTable
                    columns={CREDIT_COLUMNS}
                    items={items}
                    handleItemChange={handleItemChange}
                    addRow={() => setItems([...items, { category: "", description: "", amount: "" }])}
                    removeRow={(index) => setItems(items.filter((_, i) => i !== index))}
                    clearRows={() => setItems([{ category: "", description: "", amount: "" }])}
                    totals={{ "Total": totalAmount }}
                    currencyPrefix={currencyPrefix}
                    hideActions={true}
                />

                {/* BOTTOM SECTION */}
                <div className="mt-10 max-w-2xl">
                    <label className="text-[10px] text-slate-400 uppercase font-black tracking-wider block mb-2">Memo</label>
                    <textarea
                        placeholder="Add a note for this credit..."
                        className="w-full border border-slate-200 rounded-xl p-4 text-sm h-28 outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all bg-white shadow-sm"
                        value={form.memo}
                        onChange={(e) => setForm({...form, memo: e.target.value})}
                    />
                </div>
            </TransactionLayout>
        </form>
    );
}
