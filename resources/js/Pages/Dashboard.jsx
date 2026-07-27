import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Dashboard({ auth, metrics, lowStockItems, recentJobs }) {
    return (
        <AuthenticatedLayout user={auth.user} header="Dashboard">
            <Head title="Dashboard" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        {/* Service Metrics */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">Today's Jobs</p>
                                <p className="text-2xl font-black text-slate-900">{metrics.todays_jobs}</p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                                <span className="material-symbols-outlined">build</span>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">Pending Jobs</p>
                                <p className="text-2xl font-black text-slate-900">{metrics.pending_jobs}</p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-orange-50 flex items-center justify-center text-orange-500">
                                <span className="material-symbols-outlined">pending_actions</span>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">Today's Revenue</p>
                                <p className="text-2xl font-black text-slate-900">LKR {parseFloat(metrics.todays_revenue || 0).toFixed(2)}</p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-green-50 flex items-center justify-center text-green-500">
                                <span className="material-symbols-outlined">payments</span>
                            </div>
                        </div>

                        {/* Financial Metrics */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">Monthly Revenue</p>
                                <p className="text-2xl font-black text-slate-900">LKR {parseFloat(metrics.monthly_revenue || 0).toFixed(2)}</p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500">
                                <span className="material-symbols-outlined">trending_up</span>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">Monthly Expenses</p>
                                <p className="text-2xl font-black text-slate-900">LKR {parseFloat(metrics.monthly_expenses || 0).toFixed(2)}</p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-red-50 flex items-center justify-center text-red-500">
                                <span className="material-symbols-outlined">trending_down</span>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">Monthly Profit</p>
                                <p className={`text-2xl font-black ${metrics.monthly_profit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                    LKR {parseFloat(metrics.monthly_profit || 0).toFixed(2)}
                                </p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500">
                                <span className="material-symbols-outlined">account_balance_wallet</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Recent Jobs */}
                        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                                <h3 className="font-bold text-slate-800">Recent Job Registrations</h3>
                                <Link href={route('job-cards.index')} className="text-sm text-blue-600 hover:text-blue-800">View All</Link>
                            </div>
                            <div className="divide-y divide-slate-100">
                                {recentJobs.length > 0 ? recentJobs.map(job => (
                                    <div key={job.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                                        <div>
                                            <Link href={route('job-cards.show', job.id)} className="font-bold text-slate-900 hover:text-blue-600">#{job.job_card_number}</Link>
                                            <p className="text-sm text-slate-500">{job.customer?.display_name} - {job.device?.model}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-800">{job.status}</span>
                                            <p className="text-xs text-slate-400 mt-1">{new Date(job.service_date).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="p-8 text-center text-slate-500">No recent jobs found.</div>
                                )}
                            </div>
                        </div>

                        {/* Low Stock Alerts */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="p-4 border-b border-slate-200 bg-slate-50">
                                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-orange-500 text-sm">warning</span>
                                    Low Stock Alerts
                                </h3>
                            </div>
                            <div className="divide-y divide-slate-100">
                                {lowStockItems.length > 0 ? lowStockItems.map(item => (
                                    <div key={item.id} className="p-4 flex items-center justify-between">
                                        <span className="text-sm font-medium text-slate-800">{item.name}</span>
                                        <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-md">{item.quantity_on_hand} left</span>
                                    </div>
                                )) : (
                                    <div className="p-8 text-center text-slate-500 text-sm">Stock levels are good.</div>
                                )}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
