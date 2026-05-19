import React from 'react';
import { Link } from '@inertiajs/react';

export default function SettingsLayout({ children, activeTab }) {
    const navItems = [
        { name: 'Company', id: 'company' },
        { name: 'Sales', id: 'sales' },
        { name: 'Expenses', id: 'expenses' },
        { name: 'Time', id: 'time' },
        { name: 'Advanced', id: 'advanced' },

    ];

    return (
        /* Change 1: Use h-screen and overflow-hidden to lock the layout */
        <div className="h-screen bg-[#f4f5f8] flex flex-col overflow-hidden">

            {/* Top Header */}
            <header className="bg-white border-b border-gray-300 px-6 py-2.5 flex justify-between items-center shrink-0">
                <h1 className="text-xl font-light text-gray-800">Settings</h1>
                <div className="flex items-center gap-4 text-gray-600">
                    {/* Link to dashboard using the close icon */}
                    <Link
                        href={route('dashboard')}
                        className="material-icons cursor-pointer text-gray-500 hover:text-black transition-colors text-xl"
                    >
                        close
                    </Link>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar: shrink-0 ensures it keeps its width */}
                <aside className="w-56 bg-white border-r border-gray-300 shrink-0">
                    <nav className="mt-2">
                        {navItems.map((item) => (
                            <Link
                                key={item.id}
                                href={route('settings.index', { tab: item.id })}
                                className={`block px-6 py-2.5 text-xs transition-colors ${
                                    activeTab === item.id
                                        ? 'bg-[#e0e0e0] font-semibold text-gray-900 border-l-4 border-green-700'
                                        : 'text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </nav>
                </aside>

                {/* Main Content Area: The only part that scrolls */}
                <main className="flex-1 overflow-y-auto p-8 scroll-smooth">
                    <div className="max-w-5xl mx-auto">
                        {children}

                        <div className="flex justify-center gap-4 mt-12 text-sm text-[#0077c5]">
                            <a href="#" className="hover:underline">Privacy</a>
                            <span className="text-gray-300">|</span>
                            <a href="#" className="hover:underline">Security</a>
                            <span className="text-gray-300">|</span>
                            <a href="#" className="hover:underline">Terms of Service</a>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
