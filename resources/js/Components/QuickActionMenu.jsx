import { Link } from '@inertiajs/react';
import { useEffect, useRef } from 'react';

/**
 * A QuickBooks-style categorized mega-menu for quick global actions.
 */
export default function QuickActionMenu({ isOpen, onClose }) {
    const menuRef = useRef(null);

    // Close when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                onClose();
            }
        }
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const categories = [
        {
            title: "Customers",
            links: [
                { name: "Credit Sale", href: "/invoice" },
                { name: "Receive payment", href: "/payment" },
                { name: "Cash Sale", href: "/receipt" },
                { name: "Sales Return", href: "/credit-note" },
                { name: "Add Customer", href: route('customers.create'), isSolid: true },
            ]
        },
        {
            title: "Suppliers",
            links: [
                { name: "Payment", href: "/expense" },
                { name: "Bill", href: "/bill" },
                // { name: "Pay bills", href: "#" },
                // { name: "Purchase order", href: "#" },
                { name: "Supplier Return", href: "/SupplierCredit" },
                { name: "Add Supplier", href: route('suppliers.create'), isSolid: true },
            ]
        },
        {
            title: "Other",
            links: [
                { name: "Bank Deposit", href: "/deposit" },
                { name: "Transfer", href: "/transfer" },
                { name: "Journal entry", href: "/journal" },
                { name: "Add Account", href: route('chart-of-account.create'), isSolid: true },
            ]
        }
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-start pl-4 pt-4 lg:pl-6 bg-slate-900/40 backdrop-blur-[2px] animate-in fade-in duration-300">
            <div
                ref={menuRef}
                className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-[600px] overflow-hidden animate-in zoom-in-95 duration-200"
            >
                {/* Header */}
                <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-primary-500 flex items-center justify-center text-white shadow-md">
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                            </svg>
                        </div>
                        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Create New Action</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
                    >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content Grid */}
                <div className="p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-8">
                    {categories.map((cat, idx) => (
                        <div key={idx} className="flex flex-col space-y-4">
                            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[.25em] pb-1 border-b border-slate-50">
                                {cat.title}
                            </h3>
                            <div className="flex flex-col space-y-1">
                                {cat.links.map((link, lIdx) => (
                                    <Link
                                        key={lIdx}
                                        href={link.href}
                                        onClick={onClose}
                                        className={`px-2 py-1.5 rounded-lg text-xs font-bold transition-all group ${link.isSolid
                                            ? 'text-primary hover:bg-primary/5 mt-2'
                                            : 'text-slate-600 hover:text-primary hover:bg-primary/5'
                                            }`}
                                    >
                                        {link.isSolid && <span className="mr-1.5">+</span>}
                                        {link.name}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                    <button
                        onClick={onClose}
                        className="text-[10px] font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-colors"
                    >
                        Show less
                    </button>
                </div>
            </div>
        </div>
    );
}
