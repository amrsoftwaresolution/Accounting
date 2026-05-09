import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import CommonButton from '@/Components/CommonButton';
import InventoryItemSidePanel from '@/Components/InventoryItemSidePanel';

export default function ItemList({ items: initialItems, categories, incomeAccounts }) {
    const { auth } = usePage().props;
    const currencyPrefix = auth.company?.home_currency_prefix || '$';
    const { delete: destroy } = useForm();
    const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    const sortedItems = useMemo(() => {
        let sortableItems = [...initialItems];
        if (sortConfig.key) {
            sortableItems.sort((a, b) => {
                const aValue = sortConfig.key.includes('.') 
                    ? sortConfig.key.split('.').reduce((obj, key) => obj?.[key], a)
                    : a[sortConfig.key];
                const bValue = sortConfig.key.includes('.') 
                    ? sortConfig.key.split('.').reduce((obj, key) => obj?.[key], b)
                    : b[sortConfig.key];

                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return sortableItems;
    }, [initialItems, sortConfig]);

    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const handleOpenCreate = () => {
        setSelectedItem(null);
        setIsPanelOpen(true);
    };

    const handleEdit = (item) => {
        setSelectedItem(item);
        setIsPanelOpen(true);
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this item?')) {
            destroy(route('items.destroy', id));
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'service': return 'bg-blue-100 text-blue-700';
            case 'inventory': return 'bg-green-100 text-green-700';
            case 'non-inventory': return 'bg-orange-100 text-orange-700';
            case 'bundle': return 'bg-purple-100 text-purple-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    const SortIcon = ({ columnKey }) => {
        if (sortConfig.key !== columnKey) return (
            <svg className="h-3 w-3 ml-1 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>
        );
        return sortConfig.direction === 'asc' 
            ? <svg className="h-3 w-3 ml-1 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" /></svg>
            : <svg className="h-3 w-3 ml-1 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>;
    };

    return (
        <AuthenticatedLayout
            header="Products & Services"
        >
            <Head title="Products & Services" />

            <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Inventory Items</h1>
                        <p className="text-sm text-slate-500 mt-1">Manage your products, services, and price rates.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link
                            href={route('item-categories.index')}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all shadow-sm uppercase tracking-widest"
                        >
                            Categories
                        </Link>
                        <CommonButton
                            variant="primary"
                            onClick={handleOpenCreate}
                        >
                            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
                            Add New
                        </CommonButton>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100">
                                    <th onClick={() => requestSort('name')} className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest cursor-pointer group hover:text-slate-600 transition-colors">
                                        <div className="flex items-center">Item Info <SortIcon columnKey="name" /></div>
                                    </th>
                                    <th onClick={() => requestSort('type')} className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest cursor-pointer group hover:text-slate-600 transition-colors">
                                        <div className="flex items-center">Type <SortIcon columnKey="type" /></div>
                                    </th>
                                    <th onClick={() => requestSort('sku')} className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest cursor-pointer group hover:text-slate-600 transition-colors">
                                        <div className="flex items-center">SKU <SortIcon columnKey="sku" /></div>
                                    </th>
                                    <th onClick={() => requestSort('category.name')} className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest cursor-pointer group hover:text-slate-600 transition-colors">
                                        <div className="flex items-center">Category <SortIcon columnKey="category.name" /></div>
                                    </th>
                                    <th onClick={() => requestSort('sale_price')} className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest cursor-pointer group hover:text-slate-600 transition-colors text-right">
                                        <div className="flex items-center justify-end">Sales Price <SortIcon columnKey="sale_price" /></div>
                                    </th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Income Account</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {sortedItems.map((item) => (
                                    <tr key={item.id} className="group hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-300 overflow-hidden border border-slate-200 group-hover:border-blue-200 transition-colors relative">
                                                    {item.image ? (
                                                        <img src={item.image} alt="" className="h-full w-full object-cover" />
                                                    ) : (
                                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                    )}
                                                    {/* Hover Plus Button - triggers same panel */}
                                                    <button 
                                                        onClick={handleOpenCreate} 
                                                        className="absolute inset-0 bg-blue-600/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                        title="Add New Similar Item"
                                                    >
                                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
                                                    </button>
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{item.name}</div>
                                                    <div className="text-xs text-slate-400 line-clamp-1">{item.description || 'No description'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${getTypeColor(item.type)}`}>
                                                {item.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-xs font-mono text-slate-500">{item.sku || '-'}</td>
                                        <td className="px-6 py-4 text-xs font-bold text-slate-600">{item.category?.name || '-'}</td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-bold text-slate-900">{currencyPrefix}{parseFloat(item.sale_price).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-xs font-bold text-slate-600 truncate max-w-[150px]">
                                                {item.income_account ? (
                                                    <span title={`${item.income_account.account_code} - ${item.income_account.name}`}>
                                                        {item.income_account.name}
                                                    </span>
                                                ) : '-'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleEdit(item)}
                                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                >
                                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                >
                                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {initialItems.length === 0 && (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
                                                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 01-2 2H6a2 2 0 01-2-2m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                                                </div>
                                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">No items found</span>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <InventoryItemSidePanel 
                isOpen={isPanelOpen}
                onClose={() => setIsPanelOpen(false)}
                item={selectedItem}
                categories={categories}
                incomeAccounts={incomeAccounts}
            />
        </AuthenticatedLayout>
    );
}
