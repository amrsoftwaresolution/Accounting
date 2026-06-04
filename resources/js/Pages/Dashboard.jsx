import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function Dashboard({ auth }) {
    const homeCurrency = auth.company?.home_currency_prefix || '';
    const userName = auth.user?.name || 'User';

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-medium">Overview</span>
                    <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                    <span className="text-slate-800 font-bold">Business Dashboard</span>
                </div>
            }
        >
            <Head title="Dashboard" />

            <div className="p-4 sm:p-5 max-w-7xl mx-auto space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Welcome Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 tracking-tight">WellCome, {userName}!</h1>
                        <p className="text-slate-500 mt-0.5 text-xs font-semibold">Overview of your business today.</p>
                    </div>

                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard title="Revenue" value={`${homeCurrency} 0.00`} change="+0%" isPositive={true} icon="revenue" />
                    <StatCard title="Team" value="1" change="+0" isPositive={true} icon="team" />
                    <StatCard title="Expenses" value={`${homeCurrency} 0.00`} change="-0%" isPositive={false} icon="expenses" />
                    <StatCard title="Tasks" value="0" change="None" isNeutral={true} icon="tasks" />
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    {/* Activity Feed */}
                    <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-5 py-3 border-b border-slate-50 flex items-center justify-between">
                            <h3 className="font-bold text-xs text-slate-800 uppercase tracking-widest">Recent Activity</h3>
                            <button className="text-[10px] font-bold text-primary-600 hover:text-primary-700 uppercase tracking-wider">All</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50/50 text-slate-400 text-[8px] font-bold uppercase tracking-[.2em]">
                                    <tr>
                                        <th className="px-5 py-2.5">Entity</th>
                                        <th className="px-5 py-2.5">Status</th>
                                        <th className="px-5 py-2.5">Date</th>
                                        <th className="px-5 py-2.5 text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    <TransactionRow name="Initial Setup" category="Setup" status="Done" date="Today" amount={`-${homeCurrency} 0.00`} negative />
                                    <TransactionRow name="Welcome Credit" category="Promo" status="Done" date="Today" amount={`+${homeCurrency} 0.00`} />
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Quick Stats / Goal */}
                    <div className="space-y-4">
                        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
                            <h3 className="font-bold text-slate-800 mb-3 text-[9px] uppercase tracking-[.2em]">Health</h3>
                            <div className="space-y-2.5">
                                <HealthItem label="Database" status="OK" />
                                <HealthItem label="API" status="OK" />
                                <HealthItem label="Storage" status="92%" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function StatCard({ title, value, change, isPositive, isNeutral, icon }) {
    return (
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 group">
            <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-xl bg-slate-50 text-slate-400 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
                    <DashboardIcon name={icon} />
                </div>
                {!isNeutral && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-lg ${isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                        {change}
                    </span>
                )}
                {isNeutral && <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{change}</span>}
            </div>
            <h4 className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-0.5">{title}</h4>
            <div className="text-xl font-bold text-slate-900 tracking-tight">{value}</div>
        </div>
    );
}

function TransactionRow({ name, category, status, date, amount, negative }) {
    return (
        <tr className="group hover:bg-slate-50/50 transition-colors">
            <td className="px-5 py-3">
                <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-800">{name}</span>
                    <span className="text-[10px] text-slate-400 font-medium">{category}</span>
                </div>
            </td>
            <td className="px-5 py-3">
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-lg uppercase tracking-wider ${status === 'Done' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                    {status}
                </span>
            </td>
            <td className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-tight">{date}</td>
            <td className={`px-5 py-3 text-xs font-mono font-bold text-right ${negative ? 'text-slate-900' : 'text-primary-600'}`}>
                {amount}
            </td>
        </tr>
    );
}

function HealthItem({ label, status }) {
    return (
        <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500 font-medium">{label}</span>
            <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span className="font-bold text-slate-800 text-xs uppercase tracking-wider">{status}</span>
            </div>
        </div>
    );
}

function DashboardIcon({ name }) {
    switch (name) {
        case 'revenue': return <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
        case 'team': return <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
        case 'expenses': return <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
        case 'tasks': return <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>;
        default: return null;
    }
}
