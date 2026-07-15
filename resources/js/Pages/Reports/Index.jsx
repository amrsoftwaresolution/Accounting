import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import CommonInput from '@/Components/CommonInput';

export default function ReportsIndex() {
    const [searchTerm, setSearchTerm] = useState('');

    const reports = [
        {
            name: 'Profit and Loss',
            href: route('reports.profit-loss'),
        },
        {
            name: 'Balance Sheet',
            href: route('reports.balance-sheet'),
        },
        {
            name: 'Customer Balance Summary',
            href: route('reports.customer-balance'),
        },
        {
            name: 'Supplier Balance Summary',
            href: route('reports.supplier-balance'),
        },
        {
            name: 'Inventory Summary',
            href: route('reports.inventory-summary'),
        }
    ];

    const filteredReports = reports.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <AuthenticatedLayout header="Reports Center">
            <Head title="Reports Center" />

            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 font-serif tracking-tight">Reports Center</h1>
                    <p className="mt-2 text-sm text-gray-600 max-w-2xl">
                        Find, filter, and run reports to gain insights into your business's financial health, inventory, and customer balances.
                    </p>
                </div>

                <div className="mb-8 max-w-md">
                    <CommonInput 
                        type="text"
                        placeholder="Find report by name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        icon={
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        }
                    />
                </div>

                <div className="space-y-12">
                    {filteredReports.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <h3 className="mt-2 text-sm font-semibold text-gray-900">No reports found</h3>
                            <p className="mt-1 text-sm text-gray-500">Try adjusting your search term.</p>
                            <div className="mt-6">
                                <button onClick={() => setSearchTerm('')} type="button" className="text-sm font-medium text-primary hover:text-primary-600">
                                    Clear search
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {filteredReports.map((item, iIdx) => (
                                    <Link 
                                        key={iIdx} 
                                        href={item.href}
                                        className="group relative flex flex-col justify-center items-center p-5 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-primary-500/30 transition-all duration-200"
                                    >
                                        <h3 className="text-sm font-bold text-gray-900 group-hover:text-primary transition-colors text-center">
                                            {item.name}
                                        </h3>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
