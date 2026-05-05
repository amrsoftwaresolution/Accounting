import { useState, useEffect } from "react";
import { useForm } from "@inertiajs/react";
import TransactionLayout from "@/TransactionLayout/TransactionLayout";
import LineItemsTable from "@/TransactionLayout/LineItemsTable";
import SearchableSelect from "@/Components/SearchableSelect";
import CommonInput from "@/Components/CommonInput";
import axios from "axios";

export default function ExpenseForm({ 
    auth,
    accounts = [], 
    paymentMethods = [],
    expense = null,
    lastPaymentDate = null 
}) {
    const company = auth.company;
    const currencyPrefix = company?.home_currency_prefix || company?.home_currency || '$';
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

    const accountOptions = accounts.map(acc => ({ value: acc.id, label: `${acc.account_code} - ${acc.name}`, balance: acc.balance }));
    const methodOptions = paymentMethods.map(m => ({ value: m.id, label: m.name }));

    // Define columns
    const EXPENSE_COLUMNS = [
        { 
            key: "category", 
            label: "Category", 
            placeholder: "Choose a category",
            options: accountOptions,
            type: "select",
            width: "280px"
        },
        { key: "description", label: "Description", placeholder: "What was this for?" },
        { 
            key: "amount", 
            label: "Amount", 
            type: "currency", 
            className: "text-right", 
            inputClass: "text-right",
            width: "120px"
        },
        { 
            key: "customer", 
            label: "Customer", 
            placeholder: "Select customer",
            options: payeeOptions.filter(p => p.type === 'Customer'),
            type: "select",
            width: "220px"
        },
    ];

    const [currentAction, setCurrentAction] = useState('save');

    // useForm
    const { data, setData, post, patch, processing, errors, reset, clearErrors, transform } = useForm({
        payee: expense?.payee || expense?.payee_id || "",
        account: expense?.account || expense?.account_id || "",
        date: expense?.date || expense?.payment_date || lastPaymentDate || new Date().toISOString().split('T')[0],
        method: expense?.method || expense?.payment_method_id || "",
        ref: expense?.ref || expense?.reference_number || "",
        memo: expense?.memo || "",
        items: expense?.items || [{ category: "", description: "", amount: "", customer: "" }],
        action: 'save' // default action
    });

    const totalAmount = data.items.reduce((sum, item) => sum + (parseFloat(String(item.amount).replace(/,/g, '')) || 0), 0).toFixed(2);
    const selectedAccountBalance = accounts.find(a => String(a.id) === String(data.account))?.balance || "0.00";

    useEffect(() => {
        transform((data) => ({
            ...data,
            action: currentAction,
        }));
    }, [currentAction]);

    const handleItemChange = (index, field, value) => {
        const updatedItems = [...data.items];
        updatedItems[index][field] = value;
        setData("items", updatedItems);
    };

    const duplicateRow = (index) => {
        const rowToDuplicate = { ...data.items[index] };
        const updatedItems = [...data.items];
        updatedItems.splice(index + 1, 0, rowToDuplicate);
        setData("items", updatedItems);
    };

    const submit = (action = 'save') => {
        setCurrentAction(action);
        
        // Use a slight timeout to ensure transform has applied or just call it after state update?
        // Actually, Inertia's transform is called at the moment of submission.
        // So as long as we update the state that transform uses, it should work.
        // But wait, transform is only called ONCE unless we call it again?
        // No, transform sets a transformation function that is applied to the data during submit.
        
        const url = expense?.id ? route('expense.update', expense.id) : route('expense.store');
        const method = expense?.id ? patch : post;

        method(url, {
            preserveScroll: true,
            onSuccess: () => {
                if (action === 'new') {
                    reset();
                    clearErrors();
                }
            }
        });
    };

    return (
        <TransactionLayout 
            title={expense?.id ? "Edit Expense" : "Expense"} 
            amount={totalAmount}
            onSave={() => submit('save')}
            onSaveAndClose={() => submit('close')}
            onSaveAndNew={() => submit('new')}
            onAddLine={() => setData("items", [...data.items, { category: "", description: "", amount: "", customer: "" }])}
            onClearRows={() => setData("items", [{ category: "", description: "", amount: "" }])}
            processing={processing}
            dirty={Object.keys(data).some(key => data[key] !== (expense?.[key] || ""))}
        >
            <div className="py-6 px-1 space-y-8">
                {/* ROW 1: Payee & Account & Balance */}
                <div className="flex items-start justify-between gap-8">
                    <div className="flex items-start gap-6 flex-1">
                        <div className="w-[380px]">
                            <SearchableSelect 
                                label="Payee"
                                placeholder="Who did you pay?"
                                value={data.payee}
                                onChange={(val) => setData("payee", val)}
                                options={payeeOptions}
                                onSearch={fetchPayees}
                                size="sm"
                                error={errors.payee}
                            />
                        </div>
                        <div className="w-[380px]">
                            <SearchableSelect 
                                label="Payment account"
                                placeholder="Select account"
                                value={data.account}
                                onChange={(val) => setData("account", val)}
                                options={accountOptions}
                                initialLimit={10}
                                size="sm"
                                error={errors.account}
                            />
                        </div>
                    </div>

                    {/* Balance Display */}
                    {data.account && (
                        <div className="text-right flex flex-col items-end">
                            <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Account Balance</p>
                            <p className="text-4xl font-black tracking-tighter text-slate-900 leading-none">
                                <span className="text-slate-400 text-sm font-medium mr-1">{currencyPrefix}</span>
                                {parseFloat(selectedAccountBalance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </p>
                        </div>
                    )}
                </div>

                {/* ROW 2: Date, Method, Ref */}
                <div className="flex items-end gap-6">
                    <div className="w-[200px]">
                        <CommonInput 
                            type="date"
                            label="Payment Date"
                            value={data.date}
                            onChange={(e) => setData("date", e.target.value)}
                            size="sm"
                            error={errors.date}
                        />
                    </div>
                    <div className="w-[220px]">
                        <SearchableSelect 
                            label="Payment Method"
                            placeholder="Select method"
                            value={data.method}
                            onChange={(val) => setData("method", val)}
                            options={methodOptions}
                            size="sm"
                            error={errors.method}
                        />
                    </div>
                    <div className="w-[180px]">
                        <CommonInput 
                            label="Ref no."
                            placeholder=""
                            value={data.ref}
                            onChange={(e) => setData("ref", e.target.value)}
                            size="sm"
                            error={errors.ref}
                        />
                    </div>
                </div>
            </div>

            <LineItemsTable
                columns={EXPENSE_COLUMNS}
                items={data.items}
                handleItemChange={handleItemChange}
                addRow={() => setData("items", [...data.items, { category: "", description: "", amount: "", customer: "" }])}
                removeRow={(index) => setData("items", data.items.filter((_, i) => i !== index))}
                duplicateRow={duplicateRow}
                clearRows={() => setData("items", [{ category: "", description: "", amount: "" }])}
                totals={{ "Total": totalAmount }}
                currencyPrefix={currencyPrefix}
                hideActions={true}
            />

            <div className="mt-8 grid grid-cols-12 gap-8">
                <div className="col-span-4">
                    <CommonInput 
                        type="textarea"
                        label="Memo"
                        placeholder="Add a memo..."
                        value={data.memo}
                        onChange={(e) => setData("memo", e.target.value)}
                        className="h-24"
                        size="sm"
                        error={errors.memo}
                    />
                </div>
                <div className="col-span-8 flex flex-col justify-end items-end pb-2">
                    <div className="text-right flex items-center gap-6">
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Grand Total</span>
                        <span className="text-3xl font-black tracking-tighter text-slate-900 leading-none">
                            <span className="text-slate-400 text-sm font-bold mr-2">{currencyPrefix}</span>
                            {parseFloat(totalAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                    </div>
                </div>
            </div>
        </TransactionLayout>
    );
}
