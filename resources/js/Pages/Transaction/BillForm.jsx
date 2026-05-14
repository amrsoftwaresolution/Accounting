import { useState, useEffect } from "react";
import { useForm, usePage } from "@inertiajs/react";
import TransactionLayout from "@/TransactionLayout/TransactionLayout";
import LineItemsTable from "@/TransactionLayout/LineItemsTable";
import SearchableSelect from "@/Components/SearchableSelect";
import CommonInput from "@/Components/CommonInput";
import QuickAddAccount from "@/Components/QuickAddAccount";
import QuickAddPayee from "@/Components/QuickAddPayee";
import TermModal from "@/Components/TermModal";
import axios from "axios";

export default function BillForm({ 
    auth, 
    terms = [],
    bill = null,
    lastBillDate = null,
    lastSaveAction = 'save',
    nextBillNo = ""
}) {
    const { props } = usePage();
    const company = auth.company;
    const currencyPrefix = company?.home_currency_prefix || company?.home_currency || '$';
    
    // Modal States
    const [isPayeeModalOpen, setIsPayeeModalOpen] = useState(false);
    const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
    const [isTermModalOpen, setIsTermModalOpen] = useState(false);
    const [accountModalType, setAccountModalType] = useState('expense');

    const [payeeOptions, setPayeeOptions] = useState([]);
    const [accountOptions, setAccountOptions] = useState([]);
    
    const fetchPayees = async (search = '') => {
        try {
            const response = await axios.get(route('api.payees', { search }));
            setPayeeOptions(response.data);
        } catch (error) {
            console.error("Failed to fetch payees:", error);
        }
    };

    const fetchAccounts = async (search = '') => {
        try {
            const response = await axios.get(route('api.accounts', { search }));
            setAccountOptions(response.data);
        } catch (error) {
            console.error("Failed to fetch accounts:", error);
        }
    };

    useEffect(() => {
        fetchPayees();
        fetchAccounts();
    }, []);

    const [termOptions, setTermOptions] = useState(terms.map(t => ({ value: t.name, label: t.name })));

    const [currentAction, setCurrentAction] = useState(lastSaveAction);

    const { data, setData, post, patch, processing, errors, reset, clearErrors, transform } = useForm({
        supplier: bill?.supplier || bill?.payee_id || "",
        mailingAddress: bill?.mailingAddress || "",
        terms: bill?.terms || "Net 30",
        billDate: bill?.billDate || lastBillDate || new Date().toISOString().split('T')[0],
        dueDate: bill?.dueDate || "",
        billNo: bill?.billNo || "",
        memo: bill?.memo || "",
        items: bill?.items || [
            { category: "", description: "", amount: "0.00" },
            { category: "", description: "", amount: "0.00" },
        ],
        action: 'save'
    });

    useEffect(() => {
        transform((data) => ({
            ...data,
            action: currentAction,
            items: data.items
                .filter(item => item.category && (parseFloat(String(item.amount).replace(/,/g, '')) > 0))
                .map(item => ({
                    ...item,
                    amount: String(item.amount).replace(/,/g, '')
                }))
        }));
    }, [currentAction, transform]);

    const totalAmount = data.items.reduce(
        (sum, item) => sum + (parseFloat(String(item.amount).replace(/,/g, '')) || 0),
        0
    ).toFixed(2);

    const handleItemChange = (index, field, value) => {
        const updated = [...data.items];
        updated[index][field] = value;
        setData("items", updated);
    };

    const handleSave = (action = 'save') => {
        setCurrentAction(action);
        const url = bill?.id ? route('bill.update', bill.id) : route('bill.store');
        const method = bill?.id ? patch : post;

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

    const BILL_COLUMNS = [
        { 
            key: "category", 
            label: "Category", 
            options: accountOptions,
            onSearch: fetchAccounts,
            type: "select",
            width: "280px",
            onAddNew: () => {
                setAccountModalType('expense');
                setIsAccountModalOpen(true);
            }
        },
        { key: "description", label: "Description" },
        { 
            key: "amount", 
            label: "Amount", 
            type: "currency", 
            className: "text-right", 
            inputClass: "text-right",
            width: "120px"
        },
    ];

    return (
        <TransactionLayout
            title={bill?.id ? `Edit Bill no.${data.billNo}` : "New Bill"}
            amount={totalAmount}
            processing={processing}
            onSave={() => handleSave('save')}
            onSaveAndClose={() => handleSave('close')}
            onSaveAndNew={() => handleSave('new')}
            onAddLine={() => {
                setData("items", [...data.items, { category: "", description: "", amount: "0.00" }]);
            }}
            onClearRows={() => {
                setData("items", [{ category: "", description: "", amount: "0.00" }]);
            }}
            lastAction={lastSaveAction}
        >
            <div className="py-6 px-1 space-y-8">
                {/* ROW 1: Supplier & Address */}
                <div className="flex items-start justify-between gap-8">
                    <div className="flex items-start gap-6 flex-1">
                        <div className="w-[380px]">
                            <SearchableSelect
                                label="Supplier"
                                placeholder="Who are you paying?"
                                value={data.supplier}
                                onChange={(val) => {
                                    setData('supplier', val);
                                    const payee = payeeOptions.find(p => p.value === val);
                                    if (payee && payee.billing_address) {
                                        setData("mailingAddress", payee.billing_address);
                                    }
                                }}
                                options={payeeOptions}
                                onSearch={fetchPayees}
                                size="sm"
                                error={errors.supplier}
                                onAddNew={() => setIsPayeeModalOpen(true)}
                            />
                        </div>
                        <div className="w-[380px]">
                            <CommonInput
                                type="textarea"
                                label="Mailing address"
                                value={data.mailingAddress}
                                onChange={(e) => setData("mailingAddress", e.target.value)}
                                className="h-[74px]"
                                size="sm"
                            />
                        </div>
                    </div>
                </div>

                {/* ROW 2: Terms, Dates, No */}
                <div className="flex items-end gap-6">
                    <div className="w-[180px]">
                        <SearchableSelect
                            label="Terms"
                            value={data.terms}
                            onChange={(val) => setData('terms', val)}
                            onAddNew={() => setIsTermModalOpen(true)}
                            options={termOptions}
                            size="sm"
                        />
                    </div>
                    <div className="w-[160px]">
                        <CommonInput
                            type="date"
                            label="Bill date"
                            value={data.billDate}
                            onChange={(e) => setData('billDate', e.target.value)}
                            size="sm"
                        />
                    </div>
                    <div className="w-[160px]">
                        <CommonInput
                            type="date"
                            label="Due date"
                            value={data.dueDate}
                            onChange={(e) => setData('dueDate', e.target.value)}
                            size="sm"
                        />
                    </div>
                    <div className="flex-1"></div>
                    <div className="w-[160px]">
                        <CommonInput
                            label="Bill no."
                            value={data.billNo}
                            onChange={(e) => setData('billNo', e.target.value)}
                            size="sm"
                        />
                    </div>
                </div>
            </div>

            <LineItemsTable
                columns={BILL_COLUMNS}
                items={data.items}
                handleItemChange={handleItemChange}
                addRow={() => setData("items", [...data.items, { category: "", description: "", amount: "0.00" }])}
                removeRow={(index) => setData("items", data.items.filter((_, i) => i !== index))}
                clearRows={() => setData("items", [{ category: "", description: "", amount: "0.00" }])}
                totals={{ "Total": totalAmount }}
                currencyPrefix={currencyPrefix}
                hideActions={true}
            />

            <div className="grid grid-cols-2 gap-10 mt-8">
                <div className="w-[400px]">
                    <CommonInput
                        type="textarea"
                        label="Memo"
                        placeholder="Add a memo..."
                        value={data.memo}
                        onChange={(e) => setData('memo', e.target.value)}
                        size="sm"
                        className="h-24"
                    />
                </div>
            </div>

            <TermModal
                isOpen={isTermModalOpen}
                onClose={() => setIsTermModalOpen(false)}
                onSave={(newTerm) => {
                    setTermOptions([...termOptions, { value: newTerm.name, label: newTerm.name }]);
                    setData("terms", newTerm.name);
                }}
            />

            <QuickAddPayee 
                isOpen={isPayeeModalOpen} 
                onClose={() => setIsPayeeModalOpen(false)}
                onSuccess={(newPayee) => {
                    if (newPayee) {
                        fetchPayees();
                        setData("supplier", newPayee.value);
                    }
                }}
                initialType="supplier"
            />

            <QuickAddAccount 
                isOpen={isAccountModalOpen} 
                onClose={() => setIsAccountModalOpen(false)} 
                type={accountModalType}
                onSuccess={(newAcc) => {
                    if (newAcc) {
                        // Handled by Inertia reload/redirect
                    }
                }}
            />
        </TransactionLayout>
    );
}
