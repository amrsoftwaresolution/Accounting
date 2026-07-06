import React, { useState, useEffect, useMemo } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useDateFormat, formatDate } from '@/Utils/dateFormat';

export default function SelectCompany({ companies }) {
    const { post, processing } = useForm();
    const user = usePage().props.auth.user;
    const dateFormat = useDateFormat();

    // State
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'admin', 'member', 'recent'
    const [pinnedCompanies, setPinnedCompanies] = useState([]);
    const [recentCompanies, setRecentCompanies] = useState({});
    const [showPinnedFirst, setShowPinnedFirst] = useState(true);
    const [selectingId, setSelectingId] = useState(null);

    // Initialize local storage state
    useEffect(() => {
        const storedPinned = JSON.parse(localStorage.getItem('pinnedCompanies') || '[]');
        setPinnedCompanies(storedPinned);

        const storedRecent = JSON.parse(localStorage.getItem('recentCompanies') || '{}');
        setRecentCompanies(storedRecent);
    }, []);

    // Toggle Pin
    const togglePin = (e, companyId) => {
        e.stopPropagation();
        let newPinned;
        if (pinnedCompanies.includes(companyId)) {
            newPinned = pinnedCompanies.filter(id => id !== companyId);
        } else {
            newPinned = [...pinnedCompanies, companyId];
        }
        setPinnedCompanies(newPinned);
        localStorage.setItem('pinnedCompanies', JSON.stringify(newPinned));
    };

    // Handle Select
    const handleSelect = (company) => {
        setSelectingId(company.id);

        // Update recently active
        const newRecent = { ...recentCompanies, [company.id]: new Date().toISOString() };
        localStorage.setItem('recentCompanies', JSON.stringify(newRecent));
        setRecentCompanies(newRecent);

        post(route('companies.switch', company.id));
    };

    // Derived Code/Status/LastActive (since they aren't on backend yet)
    const enrichedCompanies = useMemo(() => {
        return companies.map(c => {
            const lastActive = recentCompanies[c.id];

            // Generate a 1 or 2 letter code from name
            const words = c.company_name.split(' ');
            const code = words.length > 1
                ? (words[0][0] + words[1][0]).toUpperCase()
                : c.company_name.substring(0, 2).toUpperCase();

            return {
                ...c,
                code: code,
                status: 'Active',
                last_active_at: lastActive || null,
                is_pinned: pinnedCompanies.includes(c.id),
                displayRole: c.pivot?.role || 'member'
            };
        });
    }, [companies, pinnedCompanies, recentCompanies]);

    // Filter and Sort
    const filteredAndSortedCompanies = useMemo(() => {
        let result = [...enrichedCompanies];

        // 1. Search Filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(c =>
                c.company_name.toLowerCase().includes(query) ||
                (c.industry && c.industry.toLowerCase().includes(query)) ||
                c.displayRole.toLowerCase().includes(query)
            );
        }

        // 2. Tab Filter
        if (activeFilter === 'admin') {
            result = result.filter(c => c.displayRole.toLowerCase() === 'admin');
        } else if (activeFilter === 'member') {
            result = result.filter(c => c.displayRole.toLowerCase() !== 'admin');
        } else if (activeFilter === 'recent') {
            result = result.filter(c => c.last_active_at !== null);
        }

        // 3. Sorting
        result.sort((a, b) => {
            // Pinning first
            if (showPinnedFirst) {
                if (a.is_pinned && !b.is_pinned) return -1;
                if (!a.is_pinned && b.is_pinned) return 1;
            }

            // If active filter is recent, sort by last active date
            if (activeFilter === 'recent' || (!showPinnedFirst)) {
                const dateA = a.last_active_at ? new Date(a.last_active_at).getTime() : 0;
                const dateB = b.last_active_at ? new Date(b.last_active_at).getTime() : 0;
                if (dateA !== dateB) {
                    return dateB - dateA;
                }
            }

            // Default alphabetical sort
            return a.company_name.localeCompare(b.company_name);
        });

        return result;
    }, [enrichedCompanies, searchQuery, activeFilter, showPinnedFirst]);


    // Formatting Date
    const formatDisplayDate = (isoString) => {
        if (!isoString) return 'Never';
        return formatDate(isoString, dateFormat);
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
            <Head title="Select Company" />

            {/* Top Navigation */}
            <nav className="w-full px-6 py-1.5 flex items-center justify-between border-b border-slate-200/60 bg-white sticky top-0 z-10">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-[#00713D] rounded-md flex items-center justify-center">
                        <span className="text-white font-bold text-sm">F</span>
                    </div>
                    <span className="font-semibold text-slate-800 text-sm tracking-tight">FinGrow</span>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowPinnedFirst(!showPinnedFirst)}
                        className={`text-xs font-medium px-3 py-1 rounded-full border transition-all ${
                            showPinnedFirst
                            ? 'bg-emerald-50 border-emerald-200 text-[#00713D]'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                    >
                        {showPinnedFirst ? 'Pinned First: On' : 'Pinned First: Off'}
                    </button>
                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors px-2 py-1"
                    >
                        Sign out
                    </Link>
                </div>
            </nav>

            <main className="flex-1 w-full max-w-7xl mx-auto px-6 lg:px-12 py-10 lg:py-16">

                {/* Header Section */}
                <header className="flex items-center justify-between border-b border-slate-200/60 px-2 py-1.5 mb-6">
                    <div>
                        <h1 className="text-lg font-semibold text-gray-800">
                            Welcome back, {user.name}
                        </h1>
                        <p className="text-xs text-slate-500">
                            Select a company to continue
                        </p>
                    </div>

                    {user.role === 'admin' && (
                        <Link
                            href={route('companies.create')}
                            className="inline-flex items-center gap-1.5 bg-[#00713D] text-white font-medium text-sm px-3.5 py-1.5 rounded-lg hover:bg-[#005a30] transition-all"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                            </svg>
                            Create Company
                        </Link>
                    )}
                </header>

                {companies.length > 0 ? (
                    <>
                        {/* Search & Filters */}
                        <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-200/60 mb-8 flex flex-col lg:flex-row gap-2">
                            <div className="relative flex-1">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search companies, industries or roles..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="block w-full pl-11 pr-4 py-3 bg-transparent border-none text-slate-800 placeholder-slate-400 focus:ring-0 sm:text-sm font-medium outline-none"
                                />
                            </div>
                            <div className="h-px lg:h-12 w-full lg:w-px bg-slate-100 hidden lg:block mx-2" />
                            <div className="flex gap-1 overflow-x-auto p-1 lg:p-0 no-scrollbar items-center">
                                {['all', 'recent'].map((filterOption) => (
                                    <button
                                        key={filterOption}
                                        onClick={() => setActiveFilter(filterOption)}
                                        className={`px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                                            activeFilter === filterOption
                                                ? 'bg-[#00713D] text-white shadow-md shadow-emerald-100'
                                                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                                        }`}
                                    >
                                        {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Company List (Rows) */}
                        {filteredAndSortedCompanies.length > 0 ? (
                            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm divide-y divide-slate-100 overflow-hidden">
                                {filteredAndSortedCompanies.map((company) => (
                                    <div
                                        key={company.id}
                                        onClick={() => handleSelect(company)}
                                        className={`group px-6 py-4 flex items-center justify-between hover:bg-slate-50/80 transition-all cursor-pointer ${
                                            selectingId === company.id ? 'bg-emerald-50/40' : ''
                                        }`}
                                    >
                                        <div className="flex items-center gap-4 min-w-0 flex-1">
                                            {/* Logo/Code */}
                                            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-center shrink-0 group-hover:bg-emerald-50 group-hover:border-emerald-100/50 transition-colors">
                                                {company.logo_url ? (
                                                    <img src={company.logo_url} alt="" className="w-7 h-7 object-contain rounded-lg" />
                                                ) : (
                                                    <span className="text-sm font-bold text-slate-600 group-hover:text-[#00713D] transition-colors">
                                                        {company.code}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Company Details */}
                                            <div className="min-w-0">
                                                <h3 className="font-bold text-slate-800 text-base group-hover:text-[#00713D] transition-colors truncate">
                                                    {company.company_name}
                                                </h3>
                                                <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-500">
                                                    <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">
                                                        {company.displayRole}
                                                    </span>
                                                    <span>•</span>
                                                    {company.industry && (
                                                        <>
                                                            <span className="truncate">{company.industry}</span>
                                                            <span>•</span>
                                                        </>
                                                    )}
                                                    <span className="flex items-center gap-1">
                                                        Active {formatDisplayDate(company.last_active_at)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 shrink-0">
                                            {/* Status Badge */}
                                            {company.status === 'Active' && (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                                    Active
                                                </span>
                                            )}

                                            {/* Pin Button */}
                                            <button
                                                onClick={(e) => togglePin(e, company.id)}
                                                className={`p-2 rounded-full transition-colors ${
                                                    company.is_pinned
                                                        ? 'text-yellow-500 hover:text-yellow-600'
                                                        : 'text-slate-300 hover:text-slate-500 opacity-0 group-hover:opacity-100'
                                                }`}
                                            >
                                                <svg className="w-4 h-4" fill={company.is_pinned ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={company.is_pinned ? "0" : "2"}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                                </svg>
                                            </button>

                                            {/* Action/Loading Indicator */}
                                            <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 group-hover:bg-emerald-50 group-hover:text-[#00713D] flex items-center justify-center transition-all">
                                                {selectingId === company.id ? (
                                                    <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                ) : (
                                                    <svg className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                                                    </svg>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}

                            </div>
                        ) : (
                            <div className="bg-white rounded-3xl border border-slate-200/60 p-16 text-center max-w-2xl mx-auto mt-12 shadow-sm">
                                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <svg className="w-12 h-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 mb-2">No matches found</h3>
                                <p className="text-slate-500 mb-6">
                                    We couldn't find any companies matching your search criteria. Try adjusting your filters or search term.
                                </p>
                                <button
                                    onClick={() => { setSearchQuery(''); setActiveFilter('all'); }}
                                    className="text-[#00713D] font-semibold hover:text-[#005a30] hover:underline"
                                >
                                    Clear all filters
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="bg-white rounded-[2.5rem] border border-slate-200/60 shadow-xl shadow-slate-200/20 p-12 md:p-20 text-center max-w-2xl mx-auto mt-12">
                        <div className="w-32 h-32 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-8 relative">
                            <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-20"></div>
                            <svg className="w-16 h-16 text-blue-600 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                        <h2 className="text-3xl font-extrabold text-slate-900 mb-4 tracking-tight">You don't have any companies yet</h2>
                        <p className="text-lg text-slate-500 mb-10 leading-relaxed max-w-lg mx-auto">
                            {user.role === 'admin'
                                ? 'Set up your first company to start tracking finances, creating invoices, and managing your business.'
                                : 'It looks like you haven\'t been invited to any companies yet. Please contact your administrator.'}
                        </p>

                        {user.role === 'admin' && (
                            <Link
                                href={route('companies.create')}
                                className="inline-flex items-center justify-center gap-3 bg-[#00713D] text-white font-bold px-8 py-4 rounded-2xl hover:bg-[#005a30] hover:shadow-xl hover:shadow-emerald-600/30 transition-all transform hover:-translate-y-1 text-lg"
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                                </svg>
                                Create Your First Company
                            </Link>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
