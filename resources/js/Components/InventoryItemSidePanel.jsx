import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import SlideOver from './SlideOver';
import CommonInput from './CommonInput';
import CommonButton from './CommonButton';
import SearchableSelect from './SearchableSelect';
import ItemCategorySidePanel from './ItemCategorySidePanel';
import { useState } from 'react';
import axios from 'axios';
import { router } from '@inertiajs/react';

export default function InventoryItemSidePanel({ 
    isOpen, 
    onClose, 
    item = null, 
    categories = [],
    incomeAccounts = [],
    onSuccess = null 
}) {
    const isEdit = !!item;
    const [isCategoryPanelOpen, setIsCategoryPanelOpen] = useState(false);
    const [localCategories, setLocalCategories] = useState(categories);

    const { data, setData, post, patch, processing, errors, reset, clearErrors } = useForm({
        type: 'service',
        name: '',
        sku: '',
        image: '',
        description: '',
        price: 0,
        item_category_id: '',
        income_account_id: '',
    });

    const itemTypes = [
        { id: 'service', name: 'Service' },
        { id: 'inventory', name: 'Inventory Item' },
        { id: 'non-inventory', name: 'Non-inventory' },
        { id: 'bundle', name: 'Bundle' },
    ];

    useEffect(() => {
        if (isOpen) {
            setLocalCategories(categories);
            if (item) {
                setData({
                    type: item.type || 'service',
                    name: item.name || '',
                    sku: item.sku || '',
                    image: item.image || '',
                    description: item.description || '',
                    price: item.price || 0,
                    item_category_id: item.item_category_id || '',
                    income_account_id: item.income_account_id || '',
                });
            } else {
                reset();
                clearErrors();
            }
        }
    }, [isOpen, item, categories]);

    const handleCategorySuccess = () => {
        const oldIds = localCategories.map(c => c.id);
        router.reload({
            only: ['categories'],
            onSuccess: (page) => {
                const newCategories = page.props.categories;
                setLocalCategories(newCategories);
                
                // Find the one that's new
                const newlyCreated = newCategories.find(c => !oldIds.includes(c.id));
                if (newlyCreated) {
                    setData('item_category_id', newlyCreated.id);
                }
            }
        });
    };

    const submit = (e) => {
        e.preventDefault();
        const options = {
            onSuccess: (page) => {
                onClose();
                if (onSuccess) onSuccess(page);
            },
        };

        if (isEdit) {
            patch(route('items.update', item.id), options);
        } else {
            post(route('items.store'), options);
        }
    };

    return (
        <SlideOver 
            isOpen={isOpen} 
            onClose={onClose} 
            title={isEdit ? "Edit Product/Service" : "New Product/Service"}
        >
            <form onSubmit={submit} className="space-y-8">
                <section>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">Item Type</label>
                    <div className="grid grid-cols-2 gap-2">
                        {itemTypes.map((type) => (
                            <button
                                key={type.id}
                                type="button"
                                onClick={() => setData('type', type.id)}
                                className={`px-3 py-2.5 rounded-xl border text-[11px] font-bold transition-all ${
                                    data.type === type.id 
                                    ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm' 
                                    : 'bg-white border-slate-200 text-slate-500 hover:border-blue-200 hover:text-slate-700'
                                }`}
                            >
                                {type.name}
                            </button>
                        ))}
                    </div>
                    {errors.type && <p className="mt-1 text-xs text-red-600">{errors.type}</p>}
                </section>

                <CommonInput
                    label="Name"
                    value={data.name}
                    onChange={e => setData('name', e.target.value)}
                    error={errors.name}
                    required
                    placeholder="e.g. Professional Consulting"
                />

                <div className="grid grid-cols-2 gap-4">
                    <CommonInput
                        label="SKU"
                        value={data.sku}
                        onChange={e => setData('sku', e.target.value)}
                        error={errors.sku}
                        placeholder="Optional"
                    />
                    <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Category</label>
                        <SearchableSelect
                            options={localCategories.map(c => ({ value: c.id, label: c.name }))}
                            value={data.item_category_id}
                            onChange={val => setData('item_category_id', val)}
                            placeholder="Select category"
                            onAddNew={() => setIsCategoryPanelOpen(true)}
                        />
                        {errors.item_category_id && <p className="mt-1 text-xs text-red-600">{errors.item_category_id}</p>}
                    </div>
                </div>

                <div className="bg-slate-50/50 -mx-6 px-6 py-6 border-y border-slate-100 space-y-6">
                    <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Sales Price / Rate</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs">$</span>
                            <input
                                type="number"
                                step="0.01"
                                value={data.price}
                                onChange={e => setData('price', e.target.value)}
                                className="w-full pl-8 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono"
                            />
                        </div>
                        {errors.price && <p className="mt-1 text-xs text-red-600">{errors.price}</p>}
                    </div>

                    <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Income Account</label>
                        <SearchableSelect
                            options={incomeAccounts.map(acc => ({ value: acc.id, label: `${acc.account_code} - ${acc.name}` }))}
                            value={data.income_account_id}
                            onChange={val => setData('income_account_id', val)}
                            placeholder="Link to Income Account"
                        />
                        {errors.income_account_id && <p className="mt-1 text-xs text-red-600">{errors.income_account_id}</p>}
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">Description</label>
                    <textarea
                        value={data.description}
                        onChange={e => setData('description', e.target.value)}
                        rows="3"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                        placeholder="Brief description for invoices..."
                    />
                    {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description}</p>}
                </div>
                <div className="pt-6 flex items-center justify-end gap-3 border-t border-slate-100">
                    <CommonButton variant="ghost" onClick={onClose} type="button">Cancel</CommonButton>
                    <CommonButton variant="primary" type="submit" processing={processing}>
                        {isEdit ? "Update Item" : "Save Item"}
                    </CommonButton>
                </div>
            </form>

            <ItemCategorySidePanel
                isOpen={isCategoryPanelOpen}
                onClose={() => setIsCategoryPanelOpen(false)}
                parents={localCategories}
                onSuccess={(page) => {
                    // This is tricky because the backend might not return the created category object in the response
                    // Usually we reload and find the latest one
                    handleCategorySuccess();
                }}
            />
        </SlideOver>
    );
}
