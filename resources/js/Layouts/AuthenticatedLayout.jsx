import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import { usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isSidebarVisible, setIsSidebarVisible] = useState(true);

    const navigation = [
        { name: 'Dashboard', href: route('dashboard') },
        { name: 'Team', href: route('team.index') },
        { name: 'Chart of Accounts', href: route('chart-of-account.index') },

        {
            name: 'Transactions',
            children: [
                { name: 'Expenses', href: route('expense') },
                { name: 'Journal', href: route('journal') },
                { name: 'Transfer', href: route('transfer') },
                { name: 'Invoice', href: route('invoice') },
                { name: 'Payment', href: route('payment') },
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-gray-100">

            {/* Mobile Sidebar */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-40 lg:hidden">
                    <div
                        className="fixed inset-0 bg-gray-600 bg-opacity-75"
                        onClick={() => setSidebarOpen(false)}
                    />
                    <div className="fixed inset-y-0 left-0 w-64 bg-white">
                        <SidebarContent navigation={navigation} user={user} />
                    </div>
                </div>
            )}

            {/* Desktop Sidebar */}
            {isSidebarVisible && (
                <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64">
                    <SidebarContent navigation={navigation} user={user} />
                </div>
            )}

            {/* Main Content */}
            <div className={isSidebarVisible ? 'lg:pl-64' : ''}>

                {/* Top Bar */}
                <div className="sticky top-0 z-10 flex h-16 border-b bg-white">
                    <button
                        className="px-4 lg:hidden"
                        onClick={() => setSidebarOpen(true)}
                    >
                        ☰
                    </button>

                    <div className="flex flex-1 justify-between px-4">
                        <div className="flex items-center gap-2">
                            <button
                                className="border px-3 py-1 text-xs rounded"
                                onClick={() => setIsSidebarVisible(v => !v)}
                            >
                                Toggle Sidebar
                            </button>

                            {header && (
                                <h1 className="text-xl font-semibold">{header}</h1>
                            )}
                        </div>

                        {/* User Dropdown */}
                        <Dropdown>
                            <Dropdown.Trigger>
                                <button className="text-sm">{user.name}</button>
                            </Dropdown.Trigger>

                            <Dropdown.Content>
                                <Dropdown.Link href={route('profile.edit')}>
                                    Profile
                                </Dropdown.Link>
                                <Dropdown.Link
                                    href={route('logout')}
                                    method="post"
                                    as="button"
                                >
                                    Log Out
                                </Dropdown.Link>
                            </Dropdown.Content>
                        </Dropdown>
                    </div>
                </div>

                {/* Page Content */}
                <main className="p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}

function SidebarContent({ navigation, user }) {
    const [openMenu, setOpenMenu] = useState(null);

    return (
        <div className="flex flex-col h-full bg-white border-r">

            {/* Logo */}
            <div className="flex items-center px-4 py-4">
                <ApplicationLogo className="h-8" />
                <span className="ml-2 font-bold">FinGrow</span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-2 space-y-1">

                {navigation.map((item, index) => (
                    <div key={index}>

                        {/* Normal Item */}
                        {!item.children && (
                            <NavLink
                                href={item.href}
                                className="block px-2 py-2 rounded hover:bg-gray-100"
                            >
                                {item.name}
                            </NavLink>
                        )}

                        {/* Parent Item */}
                        {item.children && (
                            <>
                                <button
                                    onClick={() =>
                                        setOpenMenu(openMenu === index ? null : index)
                                    }
                                    className="w-full flex justify-between px-2 py-2 rounded hover:bg-gray-100"
                                >
                                    {item.name}
                                    <span>{openMenu === index ? '▲' : '▼'}</span>
                                </button>

                                {/* Children */}
                                {openMenu === index && (
                                    <div className="ml-4 space-y-1">
                                        {item.children.map((child, i) => (
                                            <NavLink
                                                key={i}
                                                href={child.href}
                                                className="block px-2 py-1 text-sm text-gray-600 hover:text-black"
                                            >
                                                {child.name}
                                            </NavLink>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}

                    </div>
                ))}
            </nav>

            {/* User Info */}
            <div className="border-t p-4 flex items-center">
                <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                    {user.name[0]}
                </div>
                <div className="ml-2">
                    <div className="text-sm">{user.name}</div>
                    <div className="text-xs text-gray-500">{user.email}</div>
                </div>
            </div>
        </div>
    );
}
