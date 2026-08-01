import React from 'react';
import { Link } from '@inertiajs/react';

export default function WarrantyTabs() {
    return (
        <div className="border-b border-slate-200 mb-6">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                <Link 
                    href={route('warranties.index')} 
                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${route().current('warranties.*') ? 'border-primary-500 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
                >
                    Warranties
                </Link>
                <Link 
                    href={route('warranty-policies.index')} 
                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${route().current('warranty-policies.*') ? 'border-primary-500 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
                >
                    Warranty Policies
                </Link>
                <Link 
                    href={route('warranty-claims.index')} 
                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${route().current('warranty-claims.*') ? 'border-primary-500 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
                >
                    Warranty Claims
                </Link>
            </nav>
        </div>
    );
}
