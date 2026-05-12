import { useState } from "react";
import { Head, usePage, router } from "@inertiajs/react";
import TransactionLayout from "@/TransactionLayout/TransactionLayout";
import LineItemsTable from "@/TransactionLayout/LineItemsTable";
import SearchableSelect from "@/Components/SearchableSelect";
import TermModal from "@/Components/TermModal";

export default function BillForm({ suppliers = [], accounts = [], nextBillNo = "" }) {
    const { auth } = usePage().props;
    const currencyPrefix = auth.company?.home_currency_prefix || "Rs.";

    const supplierOptions = suppliers.map(s => ({ value: s.id, label: s.display_name || s.name }));
    const accountOptions = accounts.map(acc => ({ value: acc.id, label: `${acc.account_code} - ${acc.name}` }));

    const BILL_COLUMNS = [
        {
            key: "account_id",
            label: "Category",
            type: "select",
            options: accountOptions,
            placeholder: "Select account",
            className: "w-[40%]"
        },
        { key: "description", label: "Description", placeholder: "Enter description", className: "w-[40%]" },
        { key: "amount", label: "Amount", type: "number", className: "text-right w-[20%]", inputClass: "text-right font-semibold" },
    ];

    const [form, setForm] = useState({
        supplier: "",
        mailingAddress: "",
        terms: "Net 30",
        billDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        billNo: nextBillNo || "1001",
        memo: "",
    });

    const [items, setItems] = useState([
        { account_id: "", description: "", amount: "" },
        { account_id: "", description: "", amount: "" },
    ]);

    const [isDirty, setIsDirty] = useState(false);
    const [isTermModalOpen, setIsTermModalOpen] = useState(false);

    const totalAmount = items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0).toFixed(2);

    const handleItemChange = (index, field, value) => {
        const updated = [...items];
        updated[index][field] = value;
        setItems(updated);
        setIsDirty(true);
    };

    const handleSave = (type = 'save') => {
        if (!form.supplier) return alert("Please select a supplier");

        const payload = {
            ...form,
            items: items
                .filter(item => item.account_id && item.amount)
                .map(item => ({
                    category: item.account_id,
                    description: item.description,
                    amount: item.amount
                }))
        };

        router.post(route('bills.store'), payload, {
            onSuccess: () => {
                alert("Bill Saved Successfully ✅");
                setIsDirty(false);
                if (type === 'close') window.history.back();
                if (type === 'new') window.location.reload();
            },
            onError: (errors) => {
                console.error("Server Errors:", errors);
                alert("Error: " + Object.values(errors).flat().join(", "));
            }
        });
    };

    return (
        <TransactionLayout
            title={`Bill no.${form.billNo}`}
            amount={totalAmount}
            dirty={isDirty}
            onSave={() => handleSave('save')}
            onSaveAndClose={() => handleSave('close')}
            onSaveAndNew={() => handleSave('new')}
            onAddLine={() => setItems([...items, { account_id: "", description: "", amount: "" }])}
            onClearRows={() => setItems([{ account_id: "", description: "", amount: "" }])}
        >
            <Head title="Create Bill" />

            <div className="grid grid-cols-12 gap-10 py-8 border-b border-slate-200">
                <div className="col-span-4 space-y-6">
                    <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm space-y-4">
                        <SearchableSelect
                            label="Supplier"
                            placeholder="Select a supplier"
                            value={form.supplier}
                            onChange={(val) => { setForm({...form, supplier: val}); setIsDirty(true); }}
                            options={supplierOptions}
                        />
                        <div>
                            <label className="text-xs text-slate-500 block mb-1 font-bold">Mailing address</label>
                            <textarea
                                className="w-full border border-slate-200 p-3 text-sm h-24 rounded-lg outline-none focus:border-primary bg-slate-50/30"
                                value={form.mailingAddress}
                                onChange={(e) => { setForm({...form, mailingAddress: e.target.value}); setIsDirty(true); }}
                            />
                        </div>
                    </div>
                </div>

                <div className="col-span-8 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <div className="grid grid-cols-4 gap-4 flex-1">
                            <div>
                                <SearchableSelect
                                    label="Terms"
                                    value={form.terms}
                                    options={[{label: 'Net 30', value: 'Net 30'}]}
                                    onChange={(val) => setForm({...form, terms: val})}
                                />
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 block mb-1 font-bold">Bill date</label>
                                <input type="date" className="w-full border-b border-slate-300 py-1.5 text-sm" value={form.billDate} onChange={(e) => setForm({...form, billDate: e.target.value})} />
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 block mb-1 font-bold">Due date</label>
                                <input type="date" className="w-full border-b border-slate-300 py-1.5 text-sm" value={form.dueDate} onChange={(e) => setForm({...form, dueDate: e.target.value})} />
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 block mb-1 font-bold">Bill no.</label>
                                <input className="w-full border-b border-slate-300 py-1.5 text-sm font-mono" value={form.billNo} onChange={(e) => setForm({...form, billNo: e.target.value})} />
                            </div>
                        </div>

                        <div className="ml-10 text-right bg-slate-900 text-white p-6 rounded-2xl shadow-xl min-w-[240px]">
                            <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Total Amount</p>
                            <p className="text-3xl font-black">
                                <span className="text-slate-400 text-sm font-medium mr-1">{currencyPrefix}</span>
                                {totalAmount}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <LineItemsTable
                columns={BILL_COLUMNS}
                items={items}
                handleItemChange={handleItemChange}
                addRow={() => setItems([...items, { account_id: "", description: "", amount: "" }])}
                removeRow={(index) => setItems(items.filter((_, i) => i !== index))}
                totals={{ "Total": totalAmount }}
                currencyPrefix={currencyPrefix}
            />

            <div className="mt-8">
                <label className="text-xs font-bold text-slate-600 block mb-2">Memo</label>
                <textarea
                    className="w-1/2 border border-slate-200 rounded-lg p-3 text-sm h-24 outline-none"
                    value={form.memo}
                    onChange={(e) => setForm({...form, memo: e.target.value})}
                />
            </div>
        </TransactionLayout>
    );
}
