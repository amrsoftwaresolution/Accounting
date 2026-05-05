import { useState, useEffect } from "react";
import { useForm } from "@inertiajs/react";
import TransactionLayout from "@/TransactionLayout/TransactionLayout";
import LineItemsTable from "@/TransactionLayout/LineItemsTable";
import SearchableSelect from "@/Components/SearchableSelect";
import CommonInput from "@/Components/CommonInput";

export default function SupplierCreditForm({ auth, suppliers = [], items: products = [], nextCreditNo = "", credit = null }) {
    const company = auth.company;
    const currencyPrefix = company?.home_currency_prefix || company?.home_currency || '$';
    const supplierOptions = suppliers.map(s => ({ value: s.id, label: s.display_name || s.name }));
    const productOptions = products.map(p => ({ value: p.id, label: p.name, rate: p.cost_price }));

    const COLUMNS = [
        {
            key: "product",
            label: "Product/Service",
            placeholder: "Select product",
            options: productOptions,
            type: "select",
            width: "320px"
        },
        { key: "description", label: "Description", placeholder: "Enter description" },
        { key: "qty", label: "Qty", type: "number", width: "100px", className: "text-right" },
        { key: "rate", label: "Rate", type: "currency", width: "140px", className: "text-right", inputClass: "text-right" },
        { key: "amount", label: "Amount", type: "currency", width: "160px", className: "text-right", inputClass: "text-right" },
    ];

    const [currentAction, setCurrentAction] = useState('save');

    const { data, setData, post, patch, processing, errors, reset, clearErrors, transform } = useForm({
        supplier: credit?.supplier || "",
        creditDate: credit?.creditDate || new Date().toISOString().split('T')[0],
        creditNo: credit?.creditNo || nextCreditNo || "1001",
        memo: credit?.memo || "",
        items: credit?.items || [
            { product: "", description: "", qty: "1", rate: "0.00", amount: "0.00" },
            { product: "", description: "", qty: "1", rate: "0.00", amount: "0.00" },
        ],
        action: 'save'
    });

    useEffect(() => {
        transform((data) => ({
            ...data,
            action: currentAction,
        }));
    }, [currentAction]);

    const totalAmount = data.items.reduce(
        (sum, item) => sum + (parseFloat(String(item.amount).replace(/,/g, '')) || 0),
        0
    ).toFixed(2);

    const handleItemChange = (index, field, value) => {
        const updated = [...data.items];
        updated[index][field] = value;

        if (field === "product") {
            const product = products.find(p => p.id === value);
            if (product) {
                updated[index].rate = product.cost_price;
                const q = parseFloat(updated[index].qty) || 0;
                updated[index].amount = (q * product.cost_price).toFixed(2);
            }
        }

        if (field === "qty" || field === "rate") {
            const q = parseFloat(updated[index].qty) || 0;
            const r = parseFloat(updated[index].rate) || 0;
            updated[index].amount = (q * r).toFixed(2);
        }
        setData("items", updated);
    };

    const handleSave = (action = 'save') => {
        setCurrentAction(action);
        const url = credit?.id ? route('SupplierCredit.update', credit.id) : route('SupplierCredit.store');
        const method = credit?.id ? patch : post;

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
            title={credit?.id ? `Edit Supplier Credit no.${data.creditNo}` : `Supplier Credit no.${data.creditNo}`}
            amount={null} // USER_REQUEST: remove amount in topbar
            processing={processing}
            onSave={() => handleSave('save')}
            onSaveAndClose={() => handleSave('close')}
            onSaveAndNew={() => handleSave('new')}
            onAddLine={() => {
                setData("items", [...data.items, { product: "", description: "", qty: "1", rate: "0.00", amount: "0.00" }]);
            }}
            onClearRows={() => {
                setData("items", [{ product: "", description: "", qty: "1", rate: "0.00", amount: "0.00" }]);
            }}
        >
            <div className="py-6 px-1 space-y-8">
                <div className="flex items-start gap-8">
                    <div className="w-[320px]">
                        <SearchableSelect
                            label="Supplier"
                            placeholder="Select a supplier"
                            value={data.supplier}
                            onChange={(val) => setData('supplier', val)}
                            options={supplierOptions}
                            size="sm"
                            error={errors.supplier}
                        />
                    </div>
                    <div className="w-[180px]">
                        <CommonInput
                            type="date"
                            label="Payment date"
                            value={data.creditDate}
                            onChange={(e) => setData('creditDate', e.target.value)}
                            size="sm"
                        />
                    </div>
                    <div className="w-[160px]">
                        <CommonInput
                            label="Credit no."
                            value={data.creditNo}
                            onChange={(e) => setData('creditNo', e.target.value)}
                            size="sm"
                            inputClass="font-mono text-right"
                        />
                    </div>
                </div>
            </div>

            <LineItemsTable
                columns={COLUMNS}
                items={data.items}
                handleItemChange={handleItemChange}
                addRow={() => setData("items", [...data.items, { product: "", description: "", qty: "1", rate: "0.00", amount: "0.00" }])}
                removeRow={(index) => setData("items", data.items.filter((_, i) => i !== index))}
                clearRows={() => setData("items", [{ product: "", description: "", qty: "1", rate: "0.00", amount: "0.00" }])}
                totals={{ "Total": totalAmount }}
                currencyPrefix={currencyPrefix}
                hideActions={true}
            />

            <div className="grid grid-cols-2 gap-10 mt-8">
                <div className="w-[400px]">
                    <CommonInput
                        type="textarea"
                        label="Memo"
                        placeholder="Enter memo"
                        value={data.memo}
                        onChange={(e) => setData('memo', e.target.value)}
                        size="sm"
                        className="h-24"
                    />
                </div>
            </div>
        </TransactionLayout>
    );
}
