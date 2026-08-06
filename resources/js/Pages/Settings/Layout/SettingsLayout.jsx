import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Link } from '@inertiajs/react';

export default function SettingsLayout({ children, activeTab }) {
    const tabs = [
        { name: 'Company', key: 'company' },
        { name: 'Print', key: 'print' },
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

                <div className="mb-6 border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                        {tabs.map((tab) => (
                            <Link
                                key={tab.key}
                                href={route('settings.index', { tab: tab.key })}
                                className={`${
                                    activeTab === tab.key
                                        ? 'border-indigo-500 text-indigo-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                            >
                                {tab.name}
                            </Link>
                        ))}
                    </nav>
                </div>

                <div className="flex flex-col gap-6">
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
