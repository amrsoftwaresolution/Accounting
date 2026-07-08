import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';

const COLORS = ['#00713D', '#10B981', '#34D399', '#6EE7B7', '#A7F3D0'];

export default function Dashboard({ auth, bankAccounts = [], monthlyPnL = [], expensesBreakdown = [] }) {
    const homeCurrency = auth.company?.home_currency_prefix || '';
    const userName = auth.user?.name || 'User';

    const formatCurrency = (value) => {
        return `${homeCurrency} ${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="font-bold text-lg text-slate-800 tracking-tight">Dashboard</h2>
            }
        >
            <Head title="Dashboard" />

            <div className="p-4 sm:p-5 max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Welcome Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Welcome, {userName}!</h1>
                        <p className="text-slate-500 mt-0.5 text-xs font-semibold">Overview of your business today.</p>
                    </div>
                </div>

                {/* Business at a Glance */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Profit & Loss Chart */}
                    <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                        <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                            <h3 className="font-bold text-xs text-slate-800 uppercase tracking-widest">Profit & Loss (YTD)</h3>
                        </div>
                        <div className="p-5 flex-1 min-h-[300px]">
                            {monthlyPnL.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={monthlyPnL} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(value) => `${value >= 1000 ? (value / 1000) + 'k' : value}`} />
                                        <RechartsTooltip 
                                            formatter={(value) => formatCurrency(value)}
                                            cursor={{ fill: '#f8fafc' }}
                                            contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        />
                                        <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '20px' }} iconType="circle" />
                                        <Bar dataKey="Income" fill="#00713D" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="Expenses" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-slate-400 text-sm font-medium">No data available</div>
                            )}
                        </div>
                    </div>

                    {/* Expenses & Bank Accounts Column */}
                    <div className="space-y-6">
                        {/* Expenses Breakdown */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                            <div className="px-5 py-4 border-b border-slate-50 bg-slate-50/30">
                                <h3 className="font-bold text-xs text-slate-800 uppercase tracking-widest">Top Expenses (This Month)</h3>
                            </div>
                            <div className="p-5 flex-1 flex flex-col items-center justify-center min-h-[220px]">
                                {expensesBreakdown.length > 0 ? (
                                    <>
                                        <ResponsiveContainer width="100%" height={150}>
                                            <PieChart>
                                                <Pie
                                                    data={expensesBreakdown}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={45}
                                                    outerRadius={70}
                                                    paddingAngle={3}
                                                    dataKey="value"
                                                    stroke="none"
                                                >
                                                    {expensesBreakdown.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <RechartsTooltip formatter={(value) => formatCurrency(value)} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                        <div className="w-full mt-4 space-y-2">
                                            {expensesBreakdown.map((item, idx) => (
                                                <div key={idx} className="flex items-center justify-between text-xs">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                                                        <span className="text-slate-600 font-medium truncate max-w-[100px]">{item.name}</span>
                                                    </div>
                                                    <span className="font-bold text-slate-800">{formatCurrency(item.value)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-slate-400 text-sm font-medium">No expenses this month</div>
                                )}
                            </div>
                        </div>

                        {/* Bank Accounts */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                                <h3 className="font-bold text-xs text-slate-800 uppercase tracking-widest">Bank & Credit Cards</h3>
                                <Link href={route('chart-of-account.index')} className="text-[10px] font-bold text-primary-600 hover:text-primary-700 uppercase tracking-wider">Manage</Link>
                            </div>
                            <div className="divide-y divide-slate-50">
                                {bankAccounts.length > 0 ? (
                                    bankAccounts.map((account) => (
                                        <div key={account.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${account.type === 'bank' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        {account.type === 'bank' ? (
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                                        ) : (
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                                        )}
                                                    </svg>
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-900 text-sm leading-tight">{account.name}</div>
                                                    <div className="text-[10px] text-slate-400 uppercase tracking-widest">{account.type.replace('_', ' ')}</div>
                                                </div>
                                            </div>
                                            <div className={`font-mono font-bold text-sm ${account.balance < 0 ? 'text-red-600' : 'text-slate-900'}`}>
                                                {formatCurrency(account.balance)}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-8 text-center text-slate-400 text-sm font-medium">No bank accounts setup</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </AuthenticatedLayout>
    );
}
