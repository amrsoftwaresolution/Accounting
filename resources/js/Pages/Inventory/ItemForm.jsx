import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import SearchableSelect from '@/Components/SearchableSelect';
import { useState } from 'react';

export default function ItemForm({ item, categories, incomeAccounts }) {
    const { data, setData, post, put, processing, errors } = useForm({
        type: item?.type || 'service',
        name: item?.name || '',
        sku: item?.sku || '',
        image: item?.image || '',
        description: item?.description || '',
        sale_price: item?.sale_price || 0,
        item_category_id: item?.item_category_id || '',
        income_account_id: item?.income_account_id || '',
    });

    const itemTypes = [
        { id: 'service', name: 'Service' },
        { id: 'inventory', name: 'Inventory Item' },
        { id: 'non-inventory', name: 'Non-inventory' },
        { id: 'bundle', name: 'Bundle' },
    ];

    const handleSubmit = (e) => {
        e.preventDefault();
        if (item) {
            put(route('items.update', item.id));
        } else {
            post(route('items.store'));
        }
    };

    return (
        <AuthenticatedLayout
            header={item ? 'Edit Product/Service' : 'Add Product/Service'}
        >
            <Head title={item ? 'Edit Product/Service' : 'Add Product/Service'} />

            <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
                <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Basic Info */}
                        <div className="space-y-6">
                            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest border-b pb-2">Basic Information</h3>

                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Item Type</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {itemTypes.map((type) => (
                                        <button
                                            key={type.id}
                                            type="button"
                                            onClick={() => setData('type', type.id)}
                                            className={`px-4 py-3 rounded-xl border text-xs font-bold transition-all ${
                                                data.type === type.id
                                                ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm'
                                                : 'bg-white border-slate-200 text-slate-600 hover:border-blue-200'
                                            }`}
                                        >
                                            {type.name}
                                        </button>
                                    ))}
                                </div>
                                {errors.type && <p className="mt-1 text-xs text-red-600">{errors.type}</p>}
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Name</label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                    placeholder="e.g. Consulting Service"
                                />
                                {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">SKU</label>
                                    <input
                                        type="text"
                                        value={data.sku}
                                        onChange={e => setData('sku', e.target.value)}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                        placeholder="Item SKU"
                                    />
                                    {errors.sku && <p className="mt-1 text-xs text-red-600">{errors.sku}</p>}
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Category</label>
                                    <SearchableSelect
                                        options={categories.map(c => ({ value: c.id, label: c.name }))}
                                        value={data.item_category_id}
                                        onChange={val => setData('item_category_id', val)}
                                        placeholder="Select category"
                                    />
                                    {errors.item_category_id && <p className="mt-1 text-xs text-red-600">{errors.item_category_id}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Financial Info */}
                        <div className="space-y-6">
                            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest border-b pb-2">Sales & Financial</h3>

                        <div>
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Price / Rate</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                                <input
                                    type="number"
                                    step="0.01"
                                    // CHANGE THIS: from data.price to data.sale_price
                                    value={data.sale_price}
                                    onChange={e => setData('sale_price', e.target.value)}
                                    className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono"
                                    placeholder="0.00"
                                />
                            </div>
                            {/* CHANGE THIS: from errors.price to errors.sale_price */}
                            {errors.sale_price && <p className="mt-1 text-xs text-red-600">{errors.sale_price}</p>}
                        </div>

                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Income Account</label>
                                <SearchableSelect
                                    options={incomeAccounts.map(acc => ({ value: acc.id, label: `${acc.account_code} - ${acc.name}` }))}
                                    value={data.income_account_id}
                                    onChange={val => setData('income_account_id', val)}
                                    placeholder="Link to Income Account"
                                />
                                <p className="mt-2 text-[10px] text-slate-400">This account will be credited when you sell this item.</p>
                                {errors.income_account_id && <p className="mt-1 text-xs text-red-600">{errors.income_account_id}</p>}
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Description</label>
                                <textarea
                                    value={data.description}
                                    onChange={e => setData('description', e.target.value)}
                                    rows="4"
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                                    placeholder="Sales description for invoices..."
                                />
                                {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description}</p>}
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                        <Link
                            href={route('items.index')}
                            className="px-6 py-2.5 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-8 py-3 bg-[#00713D] text-white rounded-xl text-xs font-bold hover:bg-[#005a30] transition-all shadow-md shadow-green-900/10 disabled:opacity-50 uppercase tracking-widest"
                        >
                            {processing ? 'Saving...' : item ? 'Update Item' : 'Create Item'}
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
