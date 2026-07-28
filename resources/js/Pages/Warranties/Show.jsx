import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import CommonButton from '@/Components/CommonButton';

export default function Show({ auth, warranty }) {
    return (
        <AuthenticatedLayout user={auth.user} header="Warranty Details">
            <Head title="Warranty Details" />

            <div className="py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-6 space-y-6">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                    <h1 className="text-2xl font-bold text-slate-900">Warranty #{warranty.id}</h1>
                                    <p className="text-sm text-slate-500 mt-1">{warranty.warranty_policy?.name || 'No policy assigned'}</p>
                                </div>
                                <Link href={route('warranties.index')}>
                                    <CommonButton variant="secondary">Back to list</CommonButton>
                                </Link>
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                    <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">Customer</h2>
                                    <p className="text-sm text-slate-800">{warranty.customer?.display_name || 'N/A'}</p>
                                    <p className="text-xs text-slate-500 mt-1">{warranty.customer?.email || ''}</p>
                                </div>
                                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                    <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">Vehicle</h2>
                                    <p className="text-sm text-slate-800">{warranty.vehicle?.vehicle_no || 'Unassigned'}</p>
                                    <p className="text-xs text-slate-500 mt-1">{warranty.vehicle?.brand || ''} {warranty.vehicle?.model || ''}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="rounded-xl border border-slate-200 p-4">
                                    <div className="text-xs uppercase tracking-widest text-slate-500 mb-2">Warranty Period</div>
                                    <div className="text-sm text-slate-800">{warranty.start_date} to {warranty.end_date || 'Ongoing'}</div>
                                    <div className="text-xs text-slate-500 mt-1">Odometer: {warranty.start_odometer || 'N/A'} to {warranty.end_odometer || 'N/A'}</div>
                                </div>
                                <div className="rounded-xl border border-slate-200 p-4">
                                    <div className="text-xs uppercase tracking-widest text-slate-500 mb-2">Status</div>
                                    <div className="text-sm font-bold text-slate-800 capitalize">{warranty.status}</div>
                                    <div className="text-xs text-slate-500 mt-1">Policy: {warranty.warranty_policy?.expiry_rule?.replace('_', ' ')}</div>
                                </div>
                            </div>

                            <div className="rounded-xl border border-slate-200 p-4">
                                <h2 className="text-xs uppercase tracking-widest text-slate-500 mb-3">Policy Terms</h2>
                                <p className="text-sm text-slate-700 whitespace-pre-line">{warranty.warranty_policy?.terms_text || 'No terms provided.'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
