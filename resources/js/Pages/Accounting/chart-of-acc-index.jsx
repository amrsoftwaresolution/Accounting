import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useForm, Head, Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import SlideOver from '@/Components/SlideOver';
import CommonInput from '@/Components/CommonInput';
import CommonButton from '@/Components/CommonButton';
import axios from 'axios';

export default function ChartOfAccIndex({ auth, chartOfAccounts = [], lastOpeningBalanceDate }) {
    const company = auth.company;
    const multicurrencyEnabled = !!company?.multicurrency;

    // ... (rest of subtypeOptions remains same)
    const subtypeOptions = {
        asset: [
            { value: 'cash-and-cash-equivalents', label: 'Cash and cash equivalents' },
            { value: 'accounts-receivable', label: 'Accounts receivable (A/R)' },
            { value: 'current-assets', label: 'Current assets' },
            { value: 'fixed-assets', label: 'Fixed assets' },
            { value: 'non-current-assets', label: 'Non-current assets' },
        ],
        liability: [
            { value: 'credit-card', label: 'Credit card' },
            { value: 'accounts-payable', label: 'Accounts payable (A/P)' },
            { value: 'current-liabilities', label: 'Current liabilities' },
            { value: 'non-current-liabilities', label: 'Non-current liabilities' },
        ],
        equity: [{ value: 'owners-equity', label: "Owner's equity" }],
        income: [
            { value: 'income', label: 'Income' },
            { value: 'other-income', label: 'Other income' },
        ],
        expense: [{ value: 'expense', label: 'Expense' }],
    };

    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');

    const initialDate = localStorage.getItem('last_opening_balance_date') || lastOpeningBalanceDate || new Date().toISOString().split('T')[0];

    const { data, setData, post, patch, processing, errors, reset, clearErrors, transform } = useForm({
        account_code: '',
        name: '',
        account_type: 'asset',
        sub_type: 'cash-and-cash-equivalents',
        opening_balance: '0.00',
        opening_balance_date: initialDate,
        description: '',
        is_active: true,
        currency: company?.home_currency || 'LKR',
    });

    const handleOpenCreate = () => {
        setIsEdit(false);
        setSelectedId(null);
        reset();
        clearErrors();
        
        const freshDate = localStorage.getItem('last_opening_balance_date') || lastOpeningBalanceDate || new Date().toISOString().split('T')[0];
        setData(prev => ({
            ...prev,
            opening_balance: '0.00',
            opening_balance_date: freshDate
        }));

        setIsPanelOpen(true);
    };

    const handleOpenEdit = (account) => {
        setIsEdit(true);
        setSelectedId(account.id);
        clearErrors();
        
        const formattedBalance = parseFloat(account.opening_balance || 0).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });

        setData({
            account_code: account.account_code || '',
            name: account.name || '',
            account_type: account.account_type || 'asset',
            sub_type: account.sub_type || '',
            opening_balance: formattedBalance,
            opening_balance_date: account.opening_balance_date || new Date().toISOString().split('T')[0],
            description: account.description || '',
            is_active: !!account.is_active,
            currency: account.currency || company?.home_currency || 'LKR',
        });
        setIsPanelOpen(true);
    };

    const handleTypeChange = (value) => {
        setData(prev => ({
            ...prev,
            account_type: value,
            sub_type: subtypeOptions[value][0].value
        }));
    };

    const handleBalanceChange = (e) => {
        const rawValue = e.target.value;
        const cleanValue = rawValue.replace(/[^\d.,-]/g, ''); // Allow digits, commas, decimals, and minus sign
        setData('opening_balance', cleanValue);
    };

    const handleBalanceBlur = () => {
        const numericValue = parseFloat(String(data.opening_balance || '').replace(/,/g, ''));
        if (!isNaN(numericValue)) {
            setData('opening_balance', numericValue.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }));
        } else {
            setData('opening_balance', '0.00');
        }
    };

    const handleDateChange = (e) => {
        const dateVal = e.target.value;
        setData('opening_balance_date', dateVal);
        
        axios.post(route('api.accounts.save-date'), { date: dateVal })
            .catch(err => console.error("Failed to save date to session:", err));
            
        localStorage.setItem('last_opening_balance_date', dateVal);
    };

    useEffect(() => {
        if (isPanelOpen && !isEdit && data.account_type) {
            axios.get(route('api.accounts.next-code'), {
                params: { type: data.account_type }
            })
            .then(res => {
                if (res.data && res.data.next_code) {
                    setData('account_code', res.data.next_code);
                }
            })
            .catch(err => {
                console.error("Failed to fetch next account code:", err);
            });
        }
    }, [isPanelOpen, isEdit, data.account_type]);

    const submit = (e) => {
        e.preventDefault();
        
        transform((data) => ({
            ...data,
            opening_balance: String(data.opening_balance || '').replace(/,/g, '')
        }));

        const options = {
            onSuccess: () => {
                setIsPanelOpen(false);
                reset();
            },
        };

        if (isEdit) {
            patch(route('chart-of-account.update', selectedId), options);
        } else {
            post(route('chart-of-account.store'), options);
        }
    };

    const filteredAccounts = chartOfAccounts.filter(acc => {
        const matchesSearch = (acc.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (acc.account_code?.toLowerCase() || '').includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'all' || acc.account_type === filterType;
        return matchesSearch && matchesType;
    });

    return (
        <AuthenticatedLayout
            header={
                <h2 className="font-bold text-lg text-slate-800 tracking-tight">Chart of Accounts</h2>
            }
        >
            <Head title="Chart of Accounts" />

            <div className="p-6">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    {/* Toolbar */}
                    <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-3.5 w-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Filter by name or number"
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="pl-9 pr-4 py-1.5 border border-slate-300 rounded-md text-[11px] w-64 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                                />
                            </div>

                            <select
                                value={filterType}
                                onChange={e => setFilterType(e.target.value)}
                                className="px-3 py-1.5 border border-slate-300 rounded-md text-[11px] font-bold text-slate-600 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500"
                            >
                                <option value="all">All Types</option>
                                <option value="asset">Assets</option>
                                <option value="liability">Liabilities</option>
                                <option value="equity">Equity</option>
                                <option value="income">Income</option>
                                <option value="expense">Expenses</option>
                            </select>
                        </div>

                        <CommonButton
                            variant="primary"
                            onClick={handleOpenCreate}
                        >
                            New account
                        </CommonButton>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Name / Code</th>
                                    <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Type</th>
                                    <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Detail Type</th>
                                    <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Balance</th>
                                    <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredAccounts.map((account) => (
                                    <tr key={account.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-4 py-2.5">
                                            <div className="flex flex-col">
                                                <span className="text-[11px] font-bold text-slate-800">{account.name}</span>
                                                <span className="text-[10px] text-slate-400">{account.account_code}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-2.5 text-[11px] text-slate-600 capitalize">{account.account_type}</td>
                                        <td className="px-4 py-2.5 text-[11px] text-slate-600 capitalize">{account.sub_type?.replace(/-/g, ' ') || 'Main Account'}</td>
                                        <td className="px-4 py-2.5 text-[11px] font-bold text-slate-800 text-right">
                                            {account.currency || company?.home_currency} {parseFloat(account.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-4 py-2.5">
                                            <div className="flex items-center justify-center gap-2">
                                                <CommonButton 
                                                    variant="ghost" 
                                                    size="xs"
                                                    onClick={() => handleOpenEdit(account)}
                                                >
                                                    Edit
                                                </CommonButton>
                                                <div className="h-3 w-px bg-slate-200" />
                                                <Link href={route('chart-of-account.history', account.id)}>
                                                    <CommonButton variant="ghost" size="xs">History</CommonButton>
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredAccounts.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-12 text-center text-[11px] text-slate-400 font-medium">
                                            No accounts found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <SlideOver
                isOpen={isPanelOpen}
                onClose={() => setIsPanelOpen(false)}
                title={isEdit ? "Edit Account" : "New Account"}
            >
                <form onSubmit={submit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <CommonInput
                            label="Account Code"
                            value={data.account_code}
                            onChange={e => setData('account_code', e.target.value)}
                            error={errors.account_code}
                            required
                        />
                        <CommonInput
                            label="Account Name"
                            value={data.name}
                            onChange={e => setData('name', e.target.value)}
                            error={errors.name}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Account Type</label>
                            <select
                                value={data.account_type}
                                onChange={e => handleTypeChange(e.target.value)}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            >
                                <option value="asset">Asset</option>
                                <option value="liability">Liability</option>
                                <option value="equity">Equity</option>
                                <option value="income">Income</option>
                                <option value="expense">Expense</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Detail Type</label>
                            <select
                                value={data.sub_type}
                                onChange={e => setData('sub_type', e.target.value)}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            >
                                {subtypeOptions[data.account_type].map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {multicurrencyEnabled && (
                        <div className="pt-4 border-t border-slate-100">
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Account Currency</label>
                            <select
                                value={data.currency}
                                onChange={e => setData('currency', e.target.value)}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            >
                                <option value="LKR">Sri Lankan Rupee (LKR)</option>
                                <option value="USD">United States Dollar (USD)</option>
                                <option value="EUR">Euro (EUR)</option>
                                <option value="GBP">British Pound (GBP)</option>
                                <option value="AUD">Australian Dollar (AUD)</option>
                            </select>
                            <p className="mt-1.5 text-[10px] text-slate-400 font-medium italic">All transactions for this account will be recorded in this currency.</p>
                        </div>
                    )}

                    {!isEdit && ['asset', 'liability', 'equity'].includes(data.account_type) && (
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                            <CommonInput
                                type="text"
                                label="Opening Balance"
                                value={data.opening_balance}
                                onChange={handleBalanceChange}
                                onFocus={e => e.target.select()}
                                onBlur={handleBalanceBlur}
                                error={errors.opening_balance}
                                icon={<span className="text-[10px] font-bold text-slate-400">{data.currency || company?.home_currency || 'LKR'}</span>}
                            />
                            <CommonInput
                                type="date"
                                label="As of Date"
                                value={data.opening_balance_date}
                                onChange={handleDateChange}
                                error={errors.opening_balance_date}
                            />
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Description</label>
                            <textarea
                                value={data.description}
                                onChange={e => setData('description', e.target.value)}
                                rows="3"
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={data.is_active}
                                onChange={e => setData('is_active', e.target.checked)}
                                className="rounded text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">Active Account</span>
                        </div>
                    </div>

                    <div className="sticky bottom-0 bg-white pt-6 flex items-center justify-end gap-3 border-t border-slate-100">
                        <CommonButton variant="ghost" onClick={() => setIsPanelOpen(false)}>Cancel</CommonButton>
                        <CommonButton type="submit" variant="primary" processing={processing}>
                            {isEdit ? "Update Account" : "Save Account"}
                        </CommonButton>
                    </div>
                </form>
            </SlideOver>
        </AuthenticatedLayout>
    );
}
