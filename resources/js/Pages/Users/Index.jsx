import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import CommonButton from '@/Components/CommonButton';

export default function Index({ users }) {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="font-bold text-lg text-slate-800 tracking-tight">System Users</h2>
            }
        >
            <Head title="System Users" />

            <div className="p-6">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    {/* Toolbar */}
                    <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between gap-4">
                        <div className="relative flex-1 max-w-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            </div>
                            <input
                                type="text"
                                placeholder="Find a user"
                                className="pl-9 pr-4 py-1.5 border border-slate-300 rounded-md text-[11px] w-full focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all"
                            />
                        </div>

                        <Link href={route('users.create')}>
                            <CommonButton variant="primary">
                                Add New User
                            </CommonButton>
                        </Link>
                    </div>

                    <div className="overflow-x-auto">
                    <table className="w-full min-w-max text-left border-collapse text-xs">
                        <thead>
                            <tr className="bg-slate-50/80 border-b border-slate-200">
                                <th className="px-4 py-2.5 text-[9px] font-bold text-slate-400 uppercase tracking-widest w-1/3">User Profile</th>
                                <th className="px-4 py-2.5 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Access Level</th>
                                <th className="px-4 py-2.5 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                        <th className="px-4 py-2.5 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Invitation</th>
                        <th className="px-4 py-2.5 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Phone</th>
                                <th className="px-4 py-2.5 text-[9px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {users.map((user) => (
                                <tr key={user.id} className="group hover:bg-slate-50/50 transition-colors">
                                    <td className="px-4 py-2">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white font-black text-xs shrink-0">
                                                {user.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-900 leading-tight group-hover:text-primary-600 transition-colors">{user.name}</div>
                                                <div className="text-[10px] text-slate-400">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-2">
                                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                                            user.role === 'admin' ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-600'
                                        }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2">
                                        {user.is_active ? (
                                            <div className="flex items-center gap-1.5 text-emerald-600">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                                                <span className="text-[9px] font-bold uppercase tracking-widest">Authorized</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1.5 text-slate-400">
                                                <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                                                <span className="text-[9px] font-bold uppercase tracking-widest">Revoked</span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-4 py-2">
                                        {user.is_invited ? (
                                            new Date(user.invite_expires_at) < new Date() ? (
                                                <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-600 text-[9px] font-bold uppercase tracking-wider">Expired</span>
                                            ) : (
                                                <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-600 text-[9px] font-bold uppercase tracking-wider">Pending</span>
                                            )
                                        ) : (
                                            <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 text-[9px] font-bold uppercase tracking-wider">Completed</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-2 text-[11px] font-medium text-slate-500 font-mono">
                                        {user.phone || 'N/A'}
                                    </td>
                                    <td className="px-4 py-2 text-right whitespace-nowrap">
                                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Link href="#" className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded transition-all">
                                                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                </svg>
                                            </Link>
                                            {user.is_invited && (
                                                <button
                                                    onClick={() => {
                                                        if (confirm('Resend the invitation email to this user?')) {
                                                            router.post(route('users.resend-invite', user.id));
                                                        }
                                                    }}
                                                    className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded transition-all"
                                                    title="Resend invitation"
                                                >
                                                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v6h6M20 20v-6h-6m6-2a8 8 0 10-11.31 7.9" />
                                                    </svg>
                                                </button>
                                            )}
                                            <button
                                                onClick={() => {
                                                    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
                                                        router.delete(route('users.destroy', user.id));
                                                    }
                                                }}
                                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-all"
                                            >
                                                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
