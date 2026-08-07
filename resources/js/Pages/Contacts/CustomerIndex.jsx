import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import CustomerIndexContent from './CustomerIndexContent';

export default function CustomerIndex({ customers = [] }) {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="font-bold text-lg text-slate-800 tracking-tight">Customers</h2>
            }
        >
            <Head title="Customers" />

            <div className="p-6">
                <CustomerIndexContent customers={customers} />
            </div>
        </AuthenticatedLayout>
    );
}