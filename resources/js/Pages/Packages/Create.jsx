import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        description: '',
        price: '',
        billing_period: 'monthly',
        max_companies: 1,
        max_chart_of_accounts: '',
        max_products: '',
        max_users: '',
        max_invoices_per_month: '',
        is_active: true,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('packages.store'));
    };

    return (
        <AuthenticatedLayout header="Create Package">
            <Head title="Create Package" />

            <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
                <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                    <div className="space-y-6">
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest border-b pb-2">Package Details</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Name</label>
                                <input 
                                    type="text" 
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" 
                                    value={data.name} 
                                    onChange={e => setData('name', e.target.value)} 
                                    required 
                                />
                                {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Price</label>
                                <input 
                                    type="number" 
                                    step="0.01" 
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" 
                                    value={data.price} 
                                    onChange={e => setData('price', e.target.value)} 
                                    required 
                                />
                                {errors.price && <p className="mt-1 text-xs text-red-600">{errors.price}</p>}
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Billing Period</label>
                                <select 
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" 
                                    value={data.billing_period} 
                                    onChange={e => setData('billing_period', e.target.value)} 
                                    required
                                >
                                    <option value="weekly">Weekly</option>
                                    <option value="monthly">Monthly</option>
                                    <option value="yearly">Yearly</option>
                                </select>
                                {errors.billing_period && <p className="mt-1 text-xs text-red-600">{errors.billing_period}</p>}
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Description</label>
                                <textarea 
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" 
                                    rows="3" 
                                    value={data.description} 
                                    onChange={e => setData('description', e.target.value)}
                                ></textarea>
                                {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description}</p>}
                            </div>

                            <div className="md:col-span-2 mt-4">
                                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest border-b pb-2 mb-4">Package Limits</h3>
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Max Companies</label>
                                <input 
                                    type="number" 
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" 
                                    value={data.max_companies} 
                                    onChange={e => setData('max_companies', e.target.value)} 
                                    required 
                                    min="1" 
                                />
                                {errors.max_companies && <p className="mt-1 text-xs text-red-600">{errors.max_companies}</p>}
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Max Chart of Accounts</label>
                                <input 
                                    type="number" 
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" 
                                    value={data.max_chart_of_accounts} 
                                    onChange={e => setData('max_chart_of_accounts', e.target.value)} 
                                    placeholder="Unlimited if empty"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Max Products</label>
                                <input 
                                    type="number" 
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" 
                                    value={data.max_products} 
                                    onChange={e => setData('max_products', e.target.value)} 
                                    placeholder="Unlimited if empty"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Max Users</label>
                                <input 
                                    type="number" 
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" 
                                    value={data.max_users} 
                                    onChange={e => setData('max_users', e.target.value)} 
                                    placeholder="Unlimited if empty"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Max Invoices per Month</label>
                                <input 
                                    type="number" 
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" 
                                    value={data.max_invoices_per_month} 
                                    onChange={e => setData('max_invoices_per_month', e.target.value)} 
                                    placeholder="Unlimited if empty"
                                />
                            </div>

                            <div className="flex items-center md:col-span-2 pt-4">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        className="sr-only peer" 
                                        checked={data.is_active} 
                                        onChange={e => setData('is_active', e.target.checked)} 
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                                    <span className="ml-3 text-sm font-medium text-gray-900">Package is Active</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                        <Link
                            href={route('packages.index')}
                            className="px-6 py-2.5 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-8 py-3 bg-[#00713D] text-white rounded-xl text-xs font-bold hover:bg-[#005a30] transition-all shadow-md shadow-green-900/10 disabled:opacity-50 uppercase tracking-widest"
                        >
                            {processing ? 'Saving...' : 'Create Package'}
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
