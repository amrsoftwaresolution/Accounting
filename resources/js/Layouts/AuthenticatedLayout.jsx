import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import { usePage, Link } from '@inertiajs/react';
import { useState } from 'react';
import QuickActionMenu from '@/Components/QuickActionMenu';

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isSidebarVisible, setIsSidebarVisible] = useState(true);
    const [isQuickMenuOpen, setIsQuickMenuOpen] = useState(false);

    const navigation = [
        { name: 'Dashboard', href: route('dashboard'), icon: 'dashboard' },
        { name: 'Chart of Accounts', href: route('chart-of-account.index'), icon: 'accounting' },
        { name: 'Customers', href: route('customers.index'), icon: 'users' },
        { name: 'Suppliers', href: route('suppliers.index'), icon: 'supplier' },
        { name: 'Products & Services', href: route('items.index'), icon: 'inventory' },
        { name: 'Finance Overview', href: route('chart-of-account.index'), icon: 'finance' },
        { name: 'Settings', href: route('settings.index'), icon: 'users', adminOnly: true },
    ];

    const teamLinks = [
        { name: 'Employees', href: route('employees.index') },
        { name: 'User Management', href: route('users.index'), adminOnly: true },
    ];

    const transactions = [
        { name: 'Expenses', href: "/expense" },
        { name: 'Journal Entries', href: "/journal" },
        { name: 'Transfers', href: "/transfer" },
        { name: 'Invoices', href: "/invoice" },
        { name: 'Payments', href: "/payment" },
    ];

    return (
        <div className="min-h-screen bg-[#f8fafc]">
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-40 lg:hidden px-4 py-6 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setSidebarOpen(false)}>
                    <div className="fixed inset-y-0 left-0 w-64 bg-slate-900 shadow-2xl" onClick={e => e.stopPropagation()}>
                        <SidebarContent
                            navigation={navigation}
                            teamLinks={teamLinks}
                            transactions={transactions}
                            user={user}
                            onQuickMenuOpen={() => {
                                setSidebarOpen(false);
                                setIsQuickMenuOpen(true);
                            }}
                        />
                    </div>
                </div>
            )}

            {/* Desktop Sidebar */}
            {isSidebarVisible && (
                <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64">
                    <div className="flex flex-col w-full bg-slate-900 border-r border-slate-800 shadow-2xl">
                        <SidebarContent
                            navigation={navigation}
                            teamLinks={teamLinks}
                            transactions={transactions}
                            user={user}
                            onQuickMenuOpen={() => setIsQuickMenuOpen(true)}
                        />
                    </div>
                </div>
            )}

            <div className={`transition-all duration-300 ease-in-out ${isSidebarVisible ? 'lg:pl-64' : ''}`}>
                {/* Header / Top Bar */}
                <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-slate-200 bg-white/80 backdrop-blur-md px-4 sm:px-6">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => isSidebarVisible ? setSidebarOpen(true) : setIsSidebarVisible(true)}
                            className="p-1.5 text-slate-500 hover:bg-slate-50 rounded-lg lg:hidden"
                        >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
                        </button>

                        <button
                            onClick={() => setIsSidebarVisible(!isSidebarVisible)}
                            className="hidden lg:flex p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                        >
                            <svg className={`h-4 w-4 transition-transform duration-300 ${isSidebarVisible ? '' : 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                            </svg>
                        </button>

                        <div className="h-5 w-px bg-slate-200 hidden sm:block mx-1" />

                        {header && (
                            <div className="font-bold text-slate-800 tracking-tight text-sm">{header}</div>
                        )}
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Notifications (Mock) */}
                        <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors relative">
                            <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-blue-500 border-2 border-white" />
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                        </button>

                        {/* User Profile Dropdown */}
                        <Dropdown>
                            <Dropdown.Trigger>
                                <button className="flex items-center gap-3 p-1 rounded-full hover:bg-slate-50 transition-colors">
                                    <div className="h-8 w-8 rounded-full bg-[#00713D] flex items-center justify-center text-white text-xs font-bold ring-2 ring-green-50 shadow-sm">
                                        {user.name[0]}
                                    </div>
                                    <span className="hidden sm:block text-sm font-medium text-slate-700">{user.name}</span>
                                    <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                </button>
                            </Dropdown.Trigger>

                            <Dropdown.Content align="right" width="48" contentClasses="py-1 bg-white ring-1 ring-black ring-opacity-5 rounded-xl shadow-xl overflow-hidden mt-2">
                                <div className="px-4 py-2 border-b border-slate-50">
                                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Signed in as</p>
                                    <p className="text-sm font-medium text-slate-900 truncate">{user.email}</p>
                                </div>
                                <Dropdown.Link href={route('profile.edit')} className="text-slate-600 hover:text-slate-900 hover:bg-slate-50 px-4 py-2.5 text-sm transition-colors">My Profile</Dropdown.Link>
                                <Dropdown.Link href={route('logout')} method="post" as="button" className="w-full text-left text-red-600 hover:bg-red-50 px-4 py-2.5 text-sm transition-colors border-t border-slate-50">Log Out</Dropdown.Link>
                            </Dropdown.Content>
                        </Dropdown>
                    </div>
                </header>

                {/* Page Content */}
                <main className="relative z-0 min-h-[calc(100vh-64px)]">
                    {children}
                </main>
            </div>

            <QuickActionMenu
                isOpen={isQuickMenuOpen}
                onClose={() => setIsQuickMenuOpen(false)}
            />
        </div>
    );
}

function SidebarContent({ navigation, teamLinks, transactions, user, onQuickMenuOpen }) {
    const [openMenu, setOpenMenu] = useState('transactions');

    return (
        <div className="flex flex-col h-full">
            {/* Sidebar Branding */}
            <div className="px-6 pt-6 pb-4 border-b border-slate-800/50">
                <Link href="/" className="flex items-center gap-2.5 group">
                    <div className="p-2 rounded-xl bg-white/5 border border-white/10 group-hover:bg-white/10 transition-colors">
                        <ApplicationLogo className="h-6 w-auto filter invert brightness-200" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-white text-sm font-bold tracking-tight">JobAlign Book</span>
                    </div>
                </Link>
            </div>

            {/* Quick Action Button (QuickBooks Style) */}
            <div className="px-6 py-2">
                <button
                    onClick={onQuickMenuOpen}
                    className="w-full flex items-center justify-center gap-2 px-3 py-1.5 bg-[#00713D] text-white font-bold text-[11px] rounded-lg hover:bg-[#005a30] transition-all shadow-sm group uppercase tracking-wider"
                >
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" />
                    </svg>
                    Create New
                </button>
            </div>

            {/* Navigation Groups */}
            <div className="flex-1 overflow-y-auto px-3 py-6 space-y-6 scrollbar-hide custom-scrollbar">
                {/* Main Links */}
                <div>
                    <h3 className="px-3 mb-3 text-[9px] font-bold text-slate-600 uppercase tracking-[.2em]">Menu</h3>
                    <div className="space-y-0.5">
                        {navigation.map((item) => (
                            (!item.adminOnly || user.role === 'admin') && (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group ${
                                        route().current(item.href.split('/').pop()) || (item.name === 'Dashboard' && route().current('dashboard'))
                                            ? 'bg-[#00713D] text-white shadow-md shadow-[#00713D]/20'
                                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                                    }`}
                                >
                                    <span className={`transition-colors ${route().current() === item.href ? 'text-white' : 'group-hover:text-white'}`}>
                                        <SidebarIcon name={item.icon} />
                                    </span>
                                    <span className="text-xs font-bold">{item.name}</span>
                                </Link>
                            )
                        ))}
                    </div>
                </div>

                {/* Team Group */}
                {teamLinks.length > 0 && (
                    <div>
                        <h3 className="px-3 mb-3 text-[9px] font-bold text-slate-600 uppercase tracking-[.2em]">Team</h3>
                        <button
                            onClick={() => setOpenMenu(openMenu === 'team' ? null : 'team')}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all ${
                                openMenu === 'team' ? 'bg-white/5 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <SidebarIcon name="team" />
                                <span className="text-xs font-bold text-left">Staff</span>
                            </div>
                            <svg className={`h-3 w-3 transition-transform duration-300 ${openMenu === 'team' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                        </button>

                        {openMenu === 'team' && (
                            <div className="mt-1 ml-3 space-y-0.5 border-l border-slate-800/50">
                                {teamLinks.map((child) => (
                                    (!child.adminOnly || user.role === 'admin') && (
                                        <Link
                                            key={child.href}
                                            href={child.href}
                                            className="block px-6 py-1.5 text-[11px] font-bold text-slate-500 hover:text-white transition-colors relative group"
                                        >
                                            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-[1px] bg-slate-800 transition-all group-hover:w-2 group-hover:bg-blue-500" />
                                            {child.name}
                                        </Link>
                                    )
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Dropdown Group (Transactions) */}
                <div>
                    <h3 className="px-3 mb-3 text-[9px] font-bold text-slate-600 uppercase tracking-[.2em]">Finance</h3>
                    <button
                        onClick={() => setOpenMenu(openMenu === 'transactions' ? null : 'transactions')}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all ${
                            openMenu === 'transactions' ? 'bg-white/5 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            <SidebarIcon name="transactions" />
                            <span className="text-xs font-bold text-left">Activity</span>
                        </div>
                        <svg className={`h-3 w-3 transition-transform duration-300 ${openMenu === 'transactions' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                    </button>

                    {openMenu === 'transactions' && (
                        <div className="mt-1 ml-3 space-y-0.5 border-l border-slate-800/50">
                            {transactions.map((child) => (
                                <Link
                                    key={child.href}
                                    href={child.href}
                                    className="block px-6 py-1.5 text-[11px] font-bold text-slate-500 hover:text-white transition-colors relative group"
                                >
                                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-[1px] bg-slate-800 transition-all group-hover:w-2 group-hover:bg-blue-500" />
                                    {child.name}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Footer Section */}
            <div className="p-3">
                <div className="bg-slate-800/10 rounded-xl p-2.5 border border-slate-800 transition-all group">
                    <div className="relative z-10 flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-lg bg-[#00713D]/10 flex items-center justify-center text-[#00713D] ring-1 ring-[#00713D]/10">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[9px] font-bold text-white uppercase tracking-wider">Enterprise</span>
                            <span className="text-[8px] text-slate-500 font-bold uppercase tracking-tight">Support Active</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SidebarIcon({ name }) {
    switch (name) {
        case 'dashboard':
            return <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
        case 'team':
            return <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
        case 'inventory':
            return <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>;
        case 'finance':
            return <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>;
        case 'users':
            return <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09a10.116 10.116 0 001.283-3.562L7 14.839V11a5 5 0 0110 0v1.161l-.083.504a10.117 10.117 0 001.283 3.562l.054.09M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
        case 'transactions':
            return <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>;
        case 'supplier':
            return <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>;
        default:
            return <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>;
    }
}
