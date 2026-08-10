import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import CustomerIndexContent from './CustomerIndexContent';

import ContactsTabs from '@/Components/ContactsTabs';

export default function CustomerIndex({ customers = [] }) {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="font-bold text-lg text-slate-800 tracking-tight">Contacts</h2>
            }
        >
            <Head title="Contacts - Customers" />

            <ContactsTabs />

            <div className="p-6 pt-0">
                <CustomerIndexContent customers={customers} />
            </div>
        </AuthenticatedLayout>
    );
}