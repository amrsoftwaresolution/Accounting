import { useState } from "react";
import TransactionLayout from "@/TransactionLayout/TransactionLayout";
import TopFormSection from "@/TransactionLayout/TopFormSection"; // You can customize this for Journal later
import LineItemsTable from "@/TransactionLayout/LineItemsTable";
import BottomSection from "@/TransactionLayout/BottomSection";

export default function JournalEntryForm() {
    // 1. Define columns based on your Demo Image
    const JOURNAL_COLUMNS = [
        { key: "account", label: "Account", placeholder: "Select account" },
        { key: "debit", label: "Debits", type: "number", className: "text-right", inputClass: "text-right" },
        { key: "credit", label: "Credits", type: "number", className: "text-right", inputClass: "text-right" },
        { key: "description", label: "Description", placeholder: "Enter description" },
        { key: "name", label: "Name", placeholder: "Select name" },
    ];

    // 2. Initial States
    const [form, setForm] = useState({
        date: "2026-04-06",
        journalNo: "5",
        isAdjusting: false,
        memo: "",
    });

    // Journal usually starts with a few empty rows
    const [items, setItems] = useState([
        { account: "", debit: "", credit: "", description: "", name: "" },
        { account: "", debit: "", credit: "", description: "", name: "" },
    ]);

    // 3. Logic to calculate totals for both columns
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

        // Logical accounting rule: If a user enters a Debit, clear the Credit (and vice versa)
        if (field === "debit" && value > 0) updated[index].credit = "";
        if (field === "credit" && value > 0) updated[index].debit = "";

        setItems(updated);
    };

    return (
        <TransactionLayout
            title={`Journal Entry #${form.journalNo}`}
            amount={totals.debit.toFixed(2)} // Header usually shows the balanced total
        >
            {/* Top Section */}
            <div className="grid grid-cols-3 gap-8 py-4 border-b">
                <div>
                    <label className="text-xs text-gray-500 block">Journal date</label>
                    <input
                        type="date"
                        className="w-full border-b border-gray-300 py-1 text-sm"
                        value={form.date}
                        onChange={(e) => setForm({...form, date: e.target.value})}
                    />
                </div>
                <div>
                    <label className="text-xs text-gray-500 block">Journal no.</label>
                    <input
                        type="text"
                        className="w-full border-b border-gray-300 py-1 text-sm"
                        value={form.journalNo}
                        onChange={(e) => setForm({...form, journalNo: e.target.value})}
                    />
                </div>
                <div className="flex items-center gap-2 pt-4">
                    <input
                        type="checkbox"
                        id="adjusting"
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                        checked={form.isAdjusting}
                        onChange={(e) => setForm({...form, isAdjusting: e.target.checked})}
                    />
                    <label htmlFor="adjusting" className="text-xs text-gray-500">Is Adjusting Journal Entry?</label>
                </div>
            </div>

            {/* Universal Table - Reused! */}
            <LineItemsTable
                columns={JOURNAL_COLUMNS}
                items={items}
                handleItemChange={handleItemChange}
                addRow={() => setItems([...items, { account: "", debit: "", credit: "", description: "", name: "" }])}
                removeRow={(index) => setItems(items.filter((_, i) => i !== index))}
                clearRows={() => setItems([{ account: "", debit: "", credit: "", description: "", name: "" }])}
                totals={{
                    "Debits": totals.debit.toFixed(2),
                    "Credits": totals.credit.toFixed(2)
                }}
            />

            {/* Universal Bottom - Reused! */}
            <BottomSection form={form} setForm={setForm} />

        </TransactionLayout>
    );
}
