import React from 'react';
import { Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function SettingsLayout({ children, activeTab }) {
    const navItems = [
        { name: 'Company', id: 'company' },
        { name: 'Advanced', id: 'advanced' },
        { name: 'Print', id: 'print' },

    ];

    return (
        <AuthenticatedLayout header="Company Settings">
            <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Settings</h1>
                        <p className="text-xs text-slate-500 mt-0.5">Manage your company preferences and configurations.</p>
                    </div>
                </div>

                <div className="flex flex-col gap-6">
                    {/* Navigation Tabs */}
                    <nav className="flex flex-wrap gap-2">
                        {navItems.map((item) => (
                            <Link
                                key={item.id}
                                href={route('settings.index', { tab: item.id })}
                                className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all uppercase tracking-widest ${activeTab === item.id
                                        ? 'bg-primary-50 text-primary-700 shadow-sm'
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                    }`}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </nav>

                    {/* Main Content Area */}
                    <main className="flex-1">
                        <div className="rounded-2xl min-h-[500px]">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
