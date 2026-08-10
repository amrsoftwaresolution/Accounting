import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useState } from 'react';
import { useForm, Head } from '@inertiajs/react';
import CustomerIndexContent from './CustomerIndexContent';

import SlideOver from '@/Components/SlideOver';
import CommonInput from '@/Components/CommonInput';
import CommonButton from '@/Components/CommonButton';
import ContactsTabs from '@/Components/ContactsTabs';

export default function CustomerIndex({ customers = [] }) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const { data, setData, post, patch, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        display_name: '',
        first_name: '',
        last_name: '',
        company_name: '',
        email: '',
        phone_number: '',
        nic: '',
        passport: '',
        address: '',
        opening_balance: ''
    });

    const handleOpenCreate = () => {
        setIsEdit(false);
        setSelectedId(null);
        reset();
        clearErrors();
        setIsCreateOpen(true);
    };

    const handleEdit = (customer) => {
        setIsEdit(true);
        setSelectedId(customer.id);
        clearErrors();

        setData({
            display_name: customer.display_name || '',
            first_name: customer.first_name || '',
            last_name: customer.last_name || '',
            company_name: customer.company_name || '',
            email: customer.email || '',
            phone_number: customer.phone_number || '',
            nic: customer.nic || '',
            passport: customer.passport || '',
            address: customer.address || '',
            opening_balance: ''
        });
        setIsCreateOpen(true);
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this customer? This action cannot be undone.')) {
            destroy(route('customers.destroy', id));
        }
    };

    const submit = (e) => {
        e.preventDefault();
        if (isEdit) {
            patch(route('customers.update', selectedId), {
                onSuccess: () => {
                    setIsCreateOpen(false);
                    reset();
                },
            });
        } else {
            post(route('customers.store'), {
                onSuccess: () => {
                    setIsCreateOpen(false);
                    reset();
                },
            });
        }
    };

    const filteredCustomers = customers.filter(c =>
        c.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.company_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AuthenticatedLayout
            header={
                <h2 className="font-bold text-lg text-slate-800 tracking-tight">Contacts</h2>
            }
        >
            <Head title="Contacts - Customers" />

            <ContactsTabs />

            <div className="p-6 pt-0">
                <CustomerIndexContent
                    customers={filteredCustomers}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onOpenCreate={handleOpenCreate}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                />
            </div>

            <SlideOver
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                title={isEdit ? "Edit Customer" : "New Customer"}
            >
                <form onSubmit={submit} className="space-y-8">
                    <div className="space-y-6">
                        <section>
                            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-50 pb-2">Primary Info</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <CommonInput
                                    label="First Name"
                                    value={data.first_name}
                                    onChange={e => setData('first_name', e.target.value)}
                                />
                                <CommonInput
                                    label="Last Name"
                                    value={data.last_name}
                                    onChange={e => setData('last_name', e.target.value)}
                                />
                            </div>
                            <div className="mt-4">
                                <CommonInput
                                    label="Display Name (REQUIRED)"
                                    value={data.display_name}
                                    onChange={e => setData('display_name', e.target.value)}
                                    required
                                    error={errors.display_name}
                                />
                            </div>
                        </section>

                        {!isEdit && (
                            <section>
                                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-50 pb-2">Opening Balance</h3>
                                <CommonInput
                                    label="Opening Balance"
                                    type="number"
                                    step="0.01"
                                    value={data.opening_balance}
                                    onChange={e => setData('opening_balance', e.target.value)}
                                    error={errors.opening_balance}
                                />
                            </section>
                        )}

                        <section>
                            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-50 pb-2">Business Details</h3>
                            <CommonInput
                                label="Company Name"
                                value={data.company_name}
                                onChange={e => setData('company_name', e.target.value)}
                            />
                            <div className="grid grid-cols-2 gap-4 mt-4">
                                <CommonInput
                                    label="Email Address"
                                    type="email"
                                    value={data.email}
                                    onChange={e => setData('email', e.target.value)}
                                />
                                <CommonInput
                                    label="Phone Number"
                                    value={data.phone_number}
                                    onChange={e => setData('phone_number', e.target.value)}
                                />
                            </div>
                        </section>

                        <section>
                            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-50 pb-2">Legal / Identification</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <CommonInput
                                    label="NIC"
                                    value={data.nic}
                                    onChange={e => setData('nic', e.target.value)}
                                    error={errors.nic}
                                />
                                <CommonInput
                                    label="Passport"
                                    value={data.passport}
                                    onChange={e => setData('passport', e.target.value)}
                                    error={errors.passport}
                                />
                            </div>
                        </section>

                        <section>
                            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-50 pb-2">Address</h3>
                            <div className="mt-4">
                                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-2">Address</label>
                                <textarea
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-1 focus:ring-[#00713D] focus:border-[#00713D] outline-none transition-all font-sans text-sm"
                                    rows="3"
                                    value={data.address}
                                    onChange={(e) => setData("address", e.target.value)}
                                ></textarea>
                                {errors.address && <p className="text-red-500 text-xs mt-1 font-bold">{errors.address}</p>}
                            </div>
                        </section>

                    </div>

                    <div className="sticky bottom-0 bg-white pt-6 flex items-center justify-end gap-3 border-t border-slate-100">
                        <CommonButton variant="ghost" onClick={() => setIsCreateOpen(false)}>Cancel</CommonButton>
                        <CommonButton variant="primary" type="submit" processing={processing}>
                            {isEdit ? "Update Customer" : "Save Customer"}
                        </CommonButton>
                    </div>
                </form>
            </SlideOver>
        </AuthenticatedLayout>
    );
}