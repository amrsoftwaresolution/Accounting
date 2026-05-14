import { useState, useEffect } from "react";
import { useForm, Head } from "@inertiajs/react";
import axios from "axios";
import TransactionLayout from "@/TransactionLayout/TransactionLayout";
import LineItemsTable from "@/TransactionLayout/LineItemsTable";
import SearchableSelect from "@/Components/SearchableSelect";
import CommonInput from "@/Components/CommonInput";
import QuickAddPayee from "@/Components/QuickAddPayee";
import QuickAddItem from "@/Components/QuickAddItem";

export default function SupplierCreditForm({ auth, nextCreditNo = "", credit = null }) {
    const currencyPrefix = auth.company?.home_currency_prefix || 'Rs.';

    const [supplierOptions, setSupplierOptions] = useState([]);
    const [productOptions, setProductOptions] = useState([]);

    // Modal States
    const [isPayeeModalOpen, setIsPayeeModalOpen] = useState(false);
    const [isItemModalOpen, setIsItemModalOpen] = useState(false);

    const fetchSuppliers = (search = "") => {
        axios.get(route('api.payees', { search, type: 'Supplier' })).then(res => setSupplierOptions(res.data));
    };

    const fetchProducts = (search = "") => {
        axios.get(route('api.items', { search })).then(res => setProductOptions(res.data));
    };

    useEffect(() => {
        fetchSuppliers();
        fetchProducts();
    }, []);

    const COLUMNS = [
        {
            key: "product",
            label: "Product/Service",
            placeholder: "Select product",
            options: productOptions,
            onSearch: fetchProducts,
            onAddNew: () => setIsItemModalOpen(true),
            type: "select",
            width: "320px"
        },
        { key: "description", label: "Description", placeholder: "Enter description" },
        { key: "qty", label: "Qty", type: "number", width: "100px", className: "text-right" },
        { key: "rate", label: "Rate", type: "currency", width: "140px", className: "text-right", inputClass: "text-right" },
        { key: "amount", label: "Amount", type: "currency", width: "160px", className: "text-right", inputClass: "text-right" },
    ];

    const { data, setData, post, patch, processing, errors, reset, transform } = useForm({
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
            { product: "", description: "", qty: "1", rate: "0.00", amount: "0.00" },
        ],
    });

    const totalAmount = data.items.reduce(
        (sum, item) => sum + (parseFloat(String(item.amount).replace(/,/g, '')) || 0),
        0
    ).toFixed(2);

    const parseCurrency = (val) => parseFloat(String(val).replace(/,/g, "")) || 0;
    const formatCurrencyValue = (val) => val.toLocaleString('en-US', { minimumFractionDigits: 2 });

    const handleItemChange = (index, field, value) => {
        const updated = [...data.items];
        updated[index][field] = value;

        if (field === "product") {
            const product = productOptions.find(p => p.value === value);
            if (product) {
                const costPrice = parseFloat(product.cost_price || 0);
                updated[index].rate = formatCurrencyValue(costPrice);
                const q = parseFloat(updated[index].qty) || 0;
                updated[index].amount = formatCurrencyValue(q * costPrice);
            }
        }

        if (field === "qty" || field === "rate") {
            const q = parseFloat(updated[index].qty) || 0;
            const r = parseCurrency(updated[index].rate);
            updated[index].amount = formatCurrencyValue(q * r);
        }
        setData("items", updated);
    };

    const handleSave = (actionType) => {
        transform((data) => ({
            ...data,
            items: data.items
                .filter(item => item.product)
                .map(item => ({
                    ...item,
                    rate: parseCurrency(item.rate),
                    amount: parseCurrency(item.amount)
                }))
        }));

        const url = credit?.id ? route('SupplierCredit.update', credit.id) : route('SupplierCredit.store');
        const method = credit?.id ? patch : post;

        method(url, {
            preserveScroll: true,
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
            <Head title="Supplier Credit" />
            <div className="py-6 px-1 space-y-8">
                <div className="flex items-start gap-8">
                    <div className="w-[320px]">
                        <SearchableSelect
                            label="Supplier"
                            placeholder="Select a supplier"
                            value={data.supplier}
                            onSearch={fetchSuppliers}
                            onAddNew={() => setIsPayeeModalOpen(true)}
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
                            size="sm"
                        />
                    </div>
                    <div className="w-[160px]">
                        <CommonInput
                            label="Credit no."
                            value={data.creditNo}
                            onChange={(e) => setData('creditNo', e.target.value)}
                            error={errors.creditNo}
                            size="sm"
                            inputClass="font-mono text-right"
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
                    hideActions={true}
                    errors={errors}
                />

                <div className="w-[400px] mt-8">
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

            <QuickAddPayee
                isOpen={isPayeeModalOpen}
                onClose={() => setIsPayeeModalOpen(false)}
                onSuccess={(newPayee) => {
                    fetchSuppliers();
                    if (newPayee) setData("supplier", newPayee.value);
                }}
                initialType="supplier"
            />

            <QuickAddItem
                isOpen={isItemModalOpen}
                onClose={() => setIsItemModalOpen(false)}
                onSuccess={() => fetchProducts()}
            />
        </TransactionLayout>
    );
}
