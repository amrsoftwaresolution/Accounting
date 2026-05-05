import { useState, useEffect } from "react";
import axios from "axios";
import TransactionLayout from "@/TransactionLayout/TransactionLayout";
import LineItemsTable from "@/TransactionLayout/LineItemsTable";
import CommonInput from "@/Components/CommonInput";
import SearchableSelect from "@/Components/SearchableSelect";
import { Head } from "@inertiajs/react";

export default function JournalEntryForm({ journalEntry = null, accounts = [], nextJournalNo = "" }) {
    const [payeeOptions, setPayeeOptions] = useState([]);
    
    // Fetch payees from API
    const fetchPayees = (search = "") => {
        axios.get(route('api.payees', { search })).then(res => {
            setPayeeOptions(res.data);
        });
    };

    useEffect(() => {
        fetchPayees();
    }, []);

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
            className: "w-[25%]"
        },
        { key: "debit", label: "Debits", type: "currency", className: "text-right w-[10%]", inputClass: "text-right" },
        { key: "credit", label: "Credits", type: "currency", className: "text-right w-[10%]", inputClass: "text-right" },
        { key: "description", label: "Description", placeholder: "Enter description", className: "w-[30%]" },
        { 
            key: "payee_id", 
            label: "Name", 
            type: "select", 
            options: payeeOptions,
            placeholder: "Select name",
            className: "w-[25%]" 
        },
    ];

    // 2. Initial state logic for Create vs Edit
    const [form, setForm] = useState({
        date: journalEntry?.date || new Date().toISOString().split('T')[0],
        journalNo: journalEntry?.reference || nextJournalNo || "",
        memo: journalEntry?.description || "",
    });

    const [items, setItems] = useState([
        { account_id: "", debit: "", credit: "", description: "", payee_id: "" },
        { account_id: "", debit: "", credit: "", description: "", payee_id: "" },
    ]);

    useEffect(() => {
        if (journalEntry && journalEntry.lines) {
            setItems(journalEntry.lines.map(line => ({
                account_id: line.chart_of_acc_id,
                debit: line.debit || "",
                credit: line.credit || "",
                description: line.memo || "",
                payee_id: line.payee_id || ""
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
                setItems([...items, { account_id: "", debit: "", credit: "", description: "", payee_id: "" }]);
                setIsDirty(true);
            }}
            onClearRows={() => {
                setItems([
                    { account_id: "", debit: "", credit: "", description: "", payee_id: "" },
                    { account_id: "", debit: "", credit: "", description: "", payee_id: "" },
                ]);
                setIsDirty(true);
            }}
        >
            <Head title={journalEntry ? "Edit Journal Entry" : "New Journal Entry"} />

            <div className="flex items-end gap-6 py-6 border-b border-slate-100">
                <div className="w-[180px]">
                    <CommonInput 
                        type="date"
                        label="Journal date"
                        value={form.date}
                        onChange={(e) => {
                            setForm({ ...form, date: e.target.value });
                            setIsDirty(true);
                        }}
                        size="sm"
                    />
                </div>

                <div className="w-[180px]">
                    <CommonInput 
                        label="Journal no."
                        value={form.journalNo}
                        onChange={(e) => {
                            setForm({ ...form, journalNo: e.target.value });
                            setIsDirty(true);
                        }}
                        size="sm"
                        inputClass="font-mono"
                    />
                </div>
            </div>

            <LineItemsTable
                columns={JOURNAL_COLUMNS}
                items={items}
                handleItemChange={handleItemChange}
                addRow={() =>
                    setItems([...items, { account_id: "", debit: "", credit: "", description: "", payee_id: "" }])
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
                currencyPrefix={currencyPrefix}
                clearRows={() => setItems([
                    { account_id: "", debit: "", credit: "", description: "", payee_id: "" },
                    { account_id: "", debit: "", credit: "", description: "", payee_id: "" },
                ])}
                hideActions={true}
            />

            <div className="mt-8 w-[500px]">
                <CommonInput 
                    type="textarea"
                    label="Memo"
                    value={form.memo}
                    onChange={(e) => {
                        setForm({ ...form, memo: e.target.value });
                        setIsDirty(true);
                    }}
                    placeholder="Add a memo for this journal entry..."
                    size="sm"
                    className="h-24"
                />
            </div>
        </TransactionLayout>
    );
}
