import { useState, useEffect } from "react";
import axios from "axios";
import TransactionLayout from "@/TransactionLayout/TransactionLayout";
import LineItemsTable from "@/TransactionLayout/LineItemsTable";
import CommonInput from "@/Components/CommonInput";
import SearchableSelect from "@/Components/SearchableSelect";
import QuickAddPayee from "@/Components/QuickAddPayee";
import QuickAddAccount from "@/Components/QuickAddAccount";
import { Head, usePage } from "@inertiajs/react";

export default function JournalEntryForm({ journalEntry = null, nextJournalNo = "" }) {
    const { auth } = usePage().props;
    const currencyPrefix = auth.company?.home_currency_prefix || "Rs.";
    
    const [payeeOptions, setPayeeOptions] = useState([]);
    const [accountOptions, setAccountOptions] = useState([]);

    // Modal States
    const [isPayeeModalOpen, setIsPayeeModalOpen] = useState(false);
    const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);

    const fetchPayees = (search = "") => {
        axios.get(route('api.payees', { search })).then(res => setPayeeOptions(res.data));
    };

    const fetchAccounts = (search = "") => {
        axios.get(route('api.accounts', { search })).then(res => setAccountOptions(res.data));
    };

    useEffect(() => {
        fetchPayees();
        fetchAccounts();
    }, []);

    const JOURNAL_COLUMNS = [
        {
            key: "account_id",
            label: "Account",
            type: "select",
            options: accountOptions,
            onSearch: fetchAccounts,
            onAddNew: () => setIsAccountModalOpen(true),
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
            onSearch: fetchPayees,
            onAddNew: () => setIsPayeeModalOpen(true),
            placeholder: "Select name",
            className: "w-[25%]" 
        },
    ];

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
                debit: line.debit ? line.debit.toLocaleString('en-US', { minimumFractionDigits: 2 }) : "",
                credit: line.credit ? line.credit.toLocaleString('en-US', { minimumFractionDigits: 2 }) : "",
                description: line.memo || "",
                payee_id: line.payee_id || ""
            })));
        }
    }, [journalEntry]);

    const [isDirty, setIsDirty] = useState(false);

    // Helper to strip commas and parse
    const parseCurrency = (val) => parseFloat(String(val || 0).replace(/,/g, '')) || 0;

    const totals = items.reduce(
        (acc, item) => {
            acc.debit += parseCurrency(item.debit);
            acc.credit += parseCurrency(item.credit);
            return acc;
        },
        { debit: 0, credit: 0 }
    );

    const handleItemChange = (index, field, value) => {
        const updated = [...items];
        updated[index][field] = value;

        const numVal = parseCurrency(value);
        if (field === "debit" && numVal > 0) updated[index].credit = "";
        if (field === "credit" && numVal > 0) updated[index].debit = "";

        setItems(updated);
        setIsDirty(true);
    };

    const handleSave = async (type = 'save') => {
        try {
            const payload = {
                date: form.date,
                reference_no: form.journalNo,
                description: form.memo,
                lines: items
                    .filter(i => i.account_id && (parseCurrency(i.debit) > 0 || parseCurrency(i.credit) > 0))
                    .map(i => ({
                        ...i,
                        debit: parseCurrency(i.debit),
                        credit: parseCurrency(i.credit)
                    }))
            };

            if (journalEntry) {
                await axios.patch(`/journal-entries/${journalEntry.id}`, payload);
            } else {
                await axios.post("/journal-entries", payload);
            }

            setIsDirty(false);
            if (type === 'close') window.history.back();
            else window.location.reload();

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
                totals={{
                    Debits: totals.debit.toLocaleString('en-US', { minimumFractionDigits: 2 }),
                    Credits: totals.credit.toLocaleString('en-US', { minimumFractionDigits: 2 }),
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

            <QuickAddPayee
                isOpen={isPayeeModalOpen}
                onClose={() => setIsPayeeModalOpen(false)}
                onSuccess={(newPayee) => fetchPayees()}
            />

            <QuickAddAccount
                isOpen={isAccountModalOpen}
                onClose={() => setIsAccountModalOpen(false)}
                onSuccess={(newAcc) => fetchAccounts()}
            />
        </TransactionLayout>
    );
}
