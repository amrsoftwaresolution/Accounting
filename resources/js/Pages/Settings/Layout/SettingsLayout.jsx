import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function SettingsLayout({ children, activeTab }) {
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
