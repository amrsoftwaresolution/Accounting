import { useState } from "react";
import axios from "axios";

import TransactionLayout from "@/TransactionLayout/TransactionLayout";
import LineItemsTable from "@/TransactionLayout/LineItemsTable";
import BottomSection from "@/TransactionLayout/BottomSection";

export default function JournalEntryForm() {

    // ✅ 1. Columns (FIXED: no space)
    const JOURNAL_COLUMNS = [
        { key: "account_id", label: "Account", placeholder: "Select account" },
        { key: "debit", label: "Debits", type: "number", className: "text-right", inputClass: "text-right" },
        { key: "credit", label: "Credits", type: "number", className: "text-right", inputClass: "text-right" },
        { key: "description", label: "Description", placeholder: "Enter description" },
        { key: "name", label: "Name", placeholder: "Select name" },
    ];

    // ✅ 2. Form state
    const [form, setForm] = useState({
        date: "2026-04-06",
        journalNo: "5",
        isAdjusting: false,
        memo: "",
    });

    // ✅ 3. Line items
    const [items, setItems] = useState([
        { account_id: "", debit: "", credit: "", description: "", name: "" },
        { account_id: "", debit: "", credit: "", description: "", name: "" },
    ]);

    // ✅ 4. Totals
    const totals = items.reduce(
        (acc, item) => {
            acc.debit += parseFloat(item.debit) || 0;
            acc.credit += parseFloat(item.credit) || 0;
            return acc;
        },
        { debit: 0, credit: 0 }
    );

    // ✅ 5. Handle change
    const handleItemChange = (index, field, value) => {
        const updated = [...items];
        updated[index][field] = value;

        // Accounting rule
        if (field === "debit" && value > 0) updated[index].credit = "";
        if (field === "credit" && value > 0) updated[index].debit = "";

        setItems(updated);
    };

    // ✅ 6. SAVE FUNCTION (CONNECT BACKEND)
    const handleSave = async () => {
        try {

            const payload = {
                date: form.date,
                reference_no: form.journalNo,
                description: form.memo,
                lines: items.map(item => ({
                    account_id: item.account_id,
                    debit: parseFloat(item.debit) || 0,
                    credit: parseFloat(item.credit) || 0,
                    description: item.description
                }))
            };

            console.log("Sending:", payload); // 🔍 debug

            const res = await axios.post("/journal-entries", payload);

            alert("Saved Successfully ✅");
            console.log(res.data);

        } catch (error) {
            console.error(error.response?.data || error);
            alert(error.response?.data?.message || "Error saving entry ❌");
        }
    };

    return (
        <TransactionLayout
            title={`Journal Entry #${form.journalNo}`}
            amount={totals.debit.toFixed(2)}
            onSave={handleSave}
        >
            {/* Top Section */}
            <div className="grid grid-cols-3 gap-8 py-4 border-b">
                <div>
                    <label className="text-xs text-gray-500 block">Journal date</label>
                    <input
                        type="date"
                        className="w-full border-b border-gray-300 py-1 text-sm"
                        value={form.date}
                        onChange={(e) => setForm({ ...form, date: e.target.value })}
                    />
                </div>

                <div>
                    <label className="text-xs text-gray-500 block">Journal no.</label>
                    <input
                        type="text"
                        className="w-full border-b border-gray-300 py-1 text-sm"
                        value={form.journalNo}
                        onChange={(e) => setForm({ ...form, journalNo: e.target.value })}
                    />
                </div>

                <div className="flex items-center gap-2 pt-4">
                    <input
                        type="checkbox"
                        checked={form.isAdjusting}
                        onChange={(e) => setForm({ ...form, isAdjusting: e.target.checked })}
                    />
                    <label className="text-xs text-gray-500">
                        Is Adjusting Journal Entry?
                    </label>
                </div>
            </div>

            {/* Table */}
            <LineItemsTable
                columns={JOURNAL_COLUMNS}
                items={items}
                handleItemChange={handleItemChange}
                addRow={() =>
                    setItems([
                        ...items,
                        { account_id: "", debit: "", credit: "", description: "", name: "" }
                    ])
                }
                removeRow={(index) =>
                    setItems(items.filter((_, i) => i !== index))
                }
                clearRows={() =>
                    setItems([
                        { account_id: "", debit: "", credit: "", description: "", name: "" }
                    ])
                }
                totals={{
                    Debits: totals.debit.toFixed(2),
                    Credits: totals.credit.toFixed(2),
                }}
            />

            {/* Bottom Section (CONNECTED) */}
            <BottomSection
                form={form}
                setForm={setForm}
                onSave={handleSave} // 🔥 THIS IS IMPORTANT
            />
        </TransactionLayout>
    );
}
