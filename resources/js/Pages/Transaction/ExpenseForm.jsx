import { useState } from "react";
import TransactionLayout from "@/TransactionLayout/TransactionLayout";
import TopFormSection from "@/TransactionLayout/TopFormSection";
import LineItemsTable from "@/TransactionLayout/LineItemsTable";
import BottomSection from "@/TransactionLayout/BottomSection";

export default function ExpenseForm() {
    // 1. Define the columns for this specific page
    const EXPENSE_COLUMNS = [
        { key: "category", label: "Category", placeholder: "Choose a category" },
        { key: "description", label: "Description", placeholder: "What was this for?" },
        { key: "amount", label: "Amount", type: "number", className: "text-right", inputClass: "text-right" },
    ];

    const [form, setForm] = useState({ payee: "", account: "Cash", date: "", method: "", ref: "", memo: "" });
    const [items, setItems] = useState([{ category: "", description: "", amount: "" }]);

    const totalAmount = items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0).toFixed(2);

    const handleItemChange = (index, field, value) => {
        const updated = [...items];
        updated[index][field] = value;
        setItems(updated);
    };

    return (
        <TransactionLayout title="Expense" amount={totalAmount}>
            <TopFormSection form={form} setForm={setForm} />

            <LineItemsTable
                columns={EXPENSE_COLUMNS} // <-- PASSING THE CONFIG HERE
                items={items}
                handleItemChange={handleItemChange}
                addRow={() => setItems([...items, { category: "", description: "", amount: "" }])}
                removeRow={(index) => setItems(items.filter((_, i) => i !== index))}
                clearRows={() => setItems([{ category: "", description: "", amount: "" }])}
                totals={{ "Total": totalAmount }} // <-- PASSING TOTALS HERE
            />

            <BottomSection form={form} setForm={setForm} />
        </TransactionLayout>
    );
}
