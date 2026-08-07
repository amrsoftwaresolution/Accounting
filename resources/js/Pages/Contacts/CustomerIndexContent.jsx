import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import CommonButton from '@/Components/CommonButton';

export default function CustomerIndexContent({ customers = [] }) {
    const [searchTerm, setSearchTerm] = useState('');

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this customer? This action cannot be undone.')) {
            router.delete(route('customers.destroy', id));
        }
    };

    const filteredCustomers = customers.filter(c =>
        c.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.company_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Toolbar */}
            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between gap-4">
                <div className="relative flex-1 max-w-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>
                    <input
                        type="text"
                        placeholder="Find a customer"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="pl-9 pr-4 py-1.5 border border-slate-300 rounded-md text-[11px] w-full focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all"
                    />
                </div>

                <Link href={route('customers.create')}>
                    <CommonButton variant="primary">New customer</CommonButton>
                </Link>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Customer / Company</th>
                            <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Contact Details</th>
                            <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredCustomers.map((customer) => (
                            <tr key={customer.id} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="px-4 py-3">
                                    <div className="flex flex-col">
                                        <span className="text-[11px] font-bold text-slate-800">{customer.display_name}</span>
                                        <span className="text-[10px] text-slate-400">{customer.company_name}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex flex-col text-[10px] text-slate-600">
                                        <span>{customer.email}</span>
                                        <span>{customer.phone_number}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <Link href={route('customers.edit', customer.id)}>
                                            <CommonButton variant="ghost" size="xs">
                                                Edit
                                            </CommonButton>
                                        </Link>
                                        <div className="h-3 w-px bg-slate-200" />
                                        <CommonButton
                                            variant="ghost"
                                            size="xs"
                                            className="text-red-500 hover:text-red-600"
                                            onClick={() => handleDelete(customer.id)}
                                        >
                                            Delete
                                        </CommonButton>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filteredCustomers.length === 0 && (
                            <tr>
                                <td colSpan={3} className="px-4 py-12 text-center text-[11px] text-slate-400 font-medium">
                                    No customers found. Click "New customer" to get started.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
