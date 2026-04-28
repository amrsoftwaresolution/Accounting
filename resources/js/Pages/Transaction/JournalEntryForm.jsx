import { useState, useEffect } from "react";
import axios from "axios";
import TransactionLayout from "@/TransactionLayout/TransactionLayout";
import LineItemsTable from "@/TransactionLayout/LineItemsTable";
import MemoInput from "@/Components/MemoInput";
import { Head } from "@inertiajs/react";

export default function JournalEntryForm({ journalEntry = null, accounts = [], nextJournalNo = "" }) {
    // 1. Prepare account options for LineItemsTable
    const accountOptions = accounts.map(acc => ({
        value: acc.id,
        label: `${acc.account_code} - ${acc.name}`
    }));

    const JOURNAL_COLUMNS = [
        { 
            key: "account_id", 
            label: "Account", 
            type: "select", 
            options: accountOptions,
            placeholder: "Select account",
            className: "w-[30%]"
        },
        { key: "debit", label: "Debits", type: "number", className: "text-right w-[12%]", inputClass: "text-right" },
        { key: "credit", label: "Credits", type: "number", className: "text-right w-[12%]", inputClass: "text-right" },
        { key: "description", label: "Description", placeholder: "Enter description", className: "w-[36%]" },
    ];

    // 2. Initial state logic for Create vs Edit
    const [form, setForm] = useState({
        date: journalEntry?.date || new Date().toISOString().split('T')[0],
        journalNo: journalEntry?.reference || nextJournalNo || "",
        memo: journalEntry?.description || "",
    });

    const [items, setItems] = useState([
        { account_id: "", debit: "", credit: "", description: "" },
        { account_id: "", debit: "", credit: "", description: "" },
    ]);

    useEffect(() => {
        if (journalEntry && journalEntry.lines) {
            setItems(journalEntry.lines.map(line => ({
                account_id: line.chart_of_acc_id,
                debit: line.debit || "",
                credit: line.credit || "",
                description: line.memo || ""
            })));
        }
    }, [journalEntry]);

    const [isDirty, setIsDirty] = useState(false);

    // 3. Totals
    const totals = items.reduce(
        (acc, item) => {
            acc.debit += parseFloat(item.debit) || 0;
            acc.credit += parseFloat(item.credit) || 0;
            return acc;
        },
        { debit: 0, credit: 0 }
    );

    const handleItemChange = (index, field, value) => {
        const updated = [...items];
        updated[index][field] = value;

        if (field === "debit" && parseFloat(value) > 0) updated[index].credit = "";
        if (field === "credit" && parseFloat(value) > 0) updated[index].debit = "";

        setItems(updated);
        setIsDirty(true);
    };

    const handleSave = async (type = 'save') => {
        try {
            const payload = {
                date: form.date,
                reference_no: form.journalNo,
                description: form.memo,
                lines: items.filter(i => i.account_id && (i.debit || i.credit))
            };

            if (journalEntry) {
                await axios.patch(`/journal-entries/${journalEntry.id}`, payload);
            } else {
                await axios.post("/journal-entries", payload);
            }

            alert("Saved Successfully ✅");
            setIsDirty(false);

            if (type === 'close') window.history.back();
            if (type === 'new') window.location.reload();
            if (type === 'save' && !journalEntry) window.location.reload(); // Reset for new if was create

        } catch (error) {
            console.error(error.response?.data || error);
            alert(error.response?.data?.message || "Error saving entry ❌");
        }
    };

    return (
        <TransactionLayout
            title={journalEntry ? `Edit Journal Entry #${form.journalNo}` : `New Journal Entry`}
            amount={totals.debit.toFixed(2)}
            dirty={isDirty}
            onSave={() => handleSave('save')}
            onSaveAndClose={() => handleSave('close')}
            onSaveAndNew={() => handleSave('new')}
            onAddLine={() => {
                setItems([...items, { account_id: "", debit: "", credit: "", description: "" }]);
                setIsDirty(true);
            }}
            onClearRows={() => {
                setItems([
                    { account_id: "", debit: "", credit: "", description: "" },
                    { account_id: "", debit: "", credit: "", description: "" },
                ]);
                setIsDirty(true);
            }}
        >
            <Head title={journalEntry ? "Edit Journal Entry" : "New Journal Entry"} />

            <div className="grid grid-cols-3 gap-8 py-4 border-b">
                <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Journal date</label>
                    <input
                        type="date"
                        className="w-full border-b border-slate-200 py-1 text-sm focus:border-blue-500 transition-colors"
                        value={form.date}
                        onChange={(e) => {
                            setForm({ ...form, date: e.target.value });
                            setIsDirty(true);
                        }}
                    />
                </div>

                <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Journal no.</label>
                    <input
                        type="text"
                        className="w-full border-b border-slate-200 py-1 text-sm focus:border-blue-500 transition-colors"
                        value={form.journalNo}
                        onChange={(e) => {
                            setForm({ ...form, journalNo: e.target.value });
                            setIsDirty(true);
                        }}
                    />
                </div>
            </div>

            <LineItemsTable
                columns={JOURNAL_COLUMNS}
                items={items}
                handleItemChange={handleItemChange}
                addRow={() =>
                    setItems([...items, { account_id: "", debit: "", credit: "", description: "" }])
                }
                removeRow={(index) =>
                    setItems(items.filter((_, i) => i !== index))
                }
                moveRow={(index, direction) => {
                    const newItems = [...items];
                    const targetIndex = direction === 'up' ? index - 1 : index + 1;
                    if (targetIndex >= 0 && targetIndex < items.length) {
                        [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
                        setItems(newItems);
                        setIsDirty(true);
                    }
                }}
                totals={{
                    Debits: totals.debit.toFixed(2),
                    Credits: totals.credit.toFixed(2),
                }}
                clearRows={() => setItems([
                    { account_id: "", debit: "", credit: "", description: "" },
                    { account_id: "", debit: "", credit: "", description: "" },
                ])}
                hideActions={true}
            />

            <div className="mt-8 max-w-md">
                <MemoInput
                    value={form.memo}
                    onChange={(val) => {
                        setForm({ ...form, memo: val });
                        setIsDirty(true);
                    }}
                    placeholder="Add a memo for this journal entry..."
                />
            </div>
        </TransactionLayout>
    );
}
