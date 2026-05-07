import { useState } from "react";
import { useForm } from "@inertiajs/react";
import TransactionLayout from "@/TransactionLayout/TransactionLayout";
import LineItemsTable from "@/TransactionLayout/LineItemsTable";
import SearchableSelect from "@/Components/SearchableSelect";
import CommonInput from "@/Components/CommonInput";

export default function SupplierCreditForm({ auth, suppliers = [], items: products = [], nextCreditNo = "", credit = null }) {
    const currencyPrefix = auth.company?.home_currency_prefix || 'Rs.';

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
        { key: "rate", label: "Rate", type: "currency", width: "140px", className: "text-right" },
        { key: "amount", label: "Amount", type: "currency", width: "160px", className: "text-right" },
    ];

    const { data, setData, post, patch, processing, errors, reset } = useForm({
        supplier: credit?.supplier_id || "",
        creditDate: credit?.credit_date || new Date().toISOString().split('T')[0],
        creditNo: credit?.credit_no || nextCreditNo || "1001",
        memo: credit?.memo || "",
        items: credit?.items?.map(i => ({
            product: i.item_id,
            description: i.description,
            qty: i.quantity,
            rate: i.rate,
            amount: i.amount
        })) || [
            { product: "", description: "", qty: "1", rate: "0.00", amount: "0.00" },
        ],
    });

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
                updated[index].amount = (1 * product.cost_price).toFixed(2);
            }
        }

        if (field === "qty" || field === "rate") {
            const q = parseFloat(updated[index].qty) || 0;
            const r = parseFloat(updated[index].rate) || 0;
            updated[index].amount = (q * r).toFixed(2);
        }
        setData("items", updated);
    };

    const handleSave = (actionType) => {
        const url = credit?.id ? route('SupplierCredit.update', credit.id) : route('SupplierCredit.store');
        const method = credit?.id ? patch : post;

        method(url, {
            onSuccess: () => {
                if (actionType === 'new') reset();
            }
        });
    };

    return (
        <TransactionLayout
            title={credit?.id ? `Edit Supplier Credit` : `Supplier Credit`}
            amount={totalAmount}
            currencyPrefix={currencyPrefix}
            processing={processing}
            onSave={() => handleSave('save')}
            onSaveAndNew={() => handleSave('new')}
            onAddLine={() => setData("items", [...data.items, { product: "", description: "", qty: "1", rate: "0.00", amount: "0.00" }])}
            onClearRows={() => setData("items", [{ product: "", description: "", qty: "1", rate: "0.00", amount: "0.00" }])}
        >
            <div className="py-6 px-1 space-y-8">
                <div className="flex items-start gap-8">
                    <div className="w-[320px]">
                        <SearchableSelect
                            label="Supplier"
                            value={data.supplier}
                            onChange={(val) => setData('supplier', val)}
                            options={supplierOptions}
                            error={errors.supplier}
                        />
                    </div>
                    <div className="w-[180px]">
                        <CommonInput
                            type="date"
                            label="Payment date"
                            value={data.creditDate}
                            onChange={(e) => setData('creditDate', e.target.value)}
                            error={errors.creditDate}
                        />
                    </div>
                    <div className="w-[160px]">
                        <CommonInput
                            label="Credit no."
                            value={data.creditNo}
                            onChange={(e) => setData('creditNo', e.target.value)}
                            error={errors.creditNo}
                        />
                    </div>
                </div>

                <LineItemsTable
                    columns={COLUMNS}
                    items={data.items}
                    handleItemChange={handleItemChange}
                    removeRow={(index) => setData("items", data.items.filter((_, i) => i !== index))}
                    totals={{ "Total": totalAmount }}
                    currencyPrefix={currencyPrefix}
                />

                <div className="w-[400px] mt-8">
                    <CommonInput
                        type="textarea"
                        label="Memo"
                        value={data.memo}
                        onChange={(e) => setData('memo', e.target.value)}
                    />
                </div>
            </div>
        </TransactionLayout>
    );
}
