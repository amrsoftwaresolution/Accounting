import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useForm, Head, Link, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import SlideOver from '@/Components/SlideOver';
import CommonInput from '@/Components/CommonInput';
import CommonButton from '@/Components/CommonButton';
import SearchableSelect from '@/Components/SearchableSelect';
import Dropdown from '@/Components/Dropdown';
import axios from 'axios';
import { getDetailTypeOptions } from '@/Utils/accountDetailTypeOptions';

const Toggle = ({ checked, onChange, label, description, disabled }) => (
    <label className={`flex items-start gap-3 select-none group ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
        <div className="relative mt-1">
            <input
                type="checkbox"
                checked={checked}
                onChange={e => onChange(e.target.checked)}
                disabled={disabled}
                className="sr-only peer"
            />
            <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-600"></div>
        </div>
        <div className="flex flex-col">
            <span className={`text-xs font-bold text-slate-700 leading-tight ${disabled ? '' : 'group-hover:text-slate-900 transition-colors'}`}>
                {label}
            </span>
            {description && (
                <span className="text-[10px] text-slate-400 mt-0.5 leading-normal">
                    {description}
                </span>
            )}
        </div>
    </label>
);

export default function ChartOfAccIndex({ auth, chartOfAccounts = [], lastOpeningBalanceDate, currencies = [] }) {
    const company = auth.company;
    const multicurrencyEnabled = !!company?.multicurrency;
    const defaultCurrency = company?.home_currency || 'LKR';
    const currencyOptions = currencies.length
        ? currencies
        : [
            { id: 'LKR', code: 'LKR', name: 'Sri Lankan Rupee' },
            { id: 'USD', code: 'USD', name: 'US Dollar' },
            { id: 'EUR', code: 'EUR', name: 'Euro' },
            { id: 'GBP', code: 'GBP', name: 'British Pound' },
            { id: 'INR', code: 'INR', name: 'Indian Rupee' },
        ];


    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [accountWasLockedInitially, setAccountWasLockedInitially] = useState(false);
    const [filterType, setFilterType] = useState('all');
    const [nameDuplicateError, setNameDuplicateError] = useState('');

    const initialDate = localStorage.getItem('last_opening_balance_date') || lastOpeningBalanceDate || new Date().toISOString().split('T')[0];

    const { data, setData, post, patch, processing, errors, reset, clearErrors, setError } = useForm({
        account_code: '',
        name: '',
        account_type: 'asset',
        sub_type: 'cash-and-cash-equivalents',
        opening_balance: '0.00',
        opening_balance_date: initialDate,
        description: '',
        is_active: true,
        currency: defaultCurrency,
        is_subaccount: false,
        parent_id: '',
        is_locked: false,
        is_system: false,
    });

    const validateAccountName = (value) => {
        const normalized = String(value || '').trim().toLowerCase();
        return chartOfAccounts.some(account => account.id !== selectedId && String(account.name || '').trim().toLowerCase() === normalized);
    };

    const handleOpenCreate = (parentAccount = null) => {
        const isActualAccount = parentAccount && typeof parentAccount === 'object' && 'id' in parentAccount;

        setIsEdit(false);
        setSelectedId(null);
        reset();
        clearErrors();
        setNameDuplicateError('');
        setAccountWasLockedInitially(false);

        const freshDate = localStorage.getItem('last_opening_balance_date') || lastOpeningBalanceDate || new Date().toISOString().split('T')[0];

        const isSub = !!isActualAccount;
        const parentId = isActualAccount ? parentAccount.id : '';
        const accType = isActualAccount ? parentAccount.account_type : 'asset';
        const detailOptions = getDetailTypeOptions(accType);
        const subType = isActualAccount ? parentAccount.sub_type : (detailOptions?.[0]?.value || '');

        setData(prev => ({
            ...prev,
            opening_balance: '0.00',
            opening_balance_date: freshDate,
            is_subaccount: isSub,
            parent_id: parentId,
            is_locked: false,
            account_type: accType,
            sub_type: subType,
            is_system: false,
        }));

        setIsPanelOpen(true);
    };

    const handleOpenEdit = (account) => {
        setIsEdit(true);
        setSelectedId(account.id);
        clearErrors();
        setNameDuplicateError('');
        setAccountWasLockedInitially(!!account.is_locked);

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
            currency: account.currency || defaultCurrency,
            is_subaccount: !!account.parent_id,
            parent_id: account.parent_id || '',
            is_locked: !!account.is_locked,
            is_system: !!account.is_system,
        });
        setIsPanelOpen(true);
    };

    const handleTypeChange = (value) => {
        const detailOptions = getDetailTypeOptions(value);

        setData(prev => ({
            ...prev,
            account_type: value,
            sub_type: detailOptions?.[0]?.value || '',
            parent_id: '', // reset parent when type changes — filtered list will differ
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

    const handleDelete = () => {
        if (confirm("Are you sure you want to delete this account? This action cannot be undone.")) {
            router.delete(route('chart-of-account.destroy', selectedId), {
                onSuccess: () => {
                    setIsPanelOpen(false);
                }
            });
        }
    };

    const handleToggleActive = (account) => {
        const actionText = account.is_active ? "inactive" : "active";
        if (confirm(`Are you sure you want to make this account ${actionText}?`)) {
            router.patch(route('chart-of-account.update', account.id), {
                is_active: !account.is_active
            }, {
                preserveScroll: true
            });
        }
    };

    const handleToggleLock = (account) => {
        const actionText = account.is_locked ? "unlock" : "lock";
        if (confirm(`Are you sure you want to ${actionText} this account?`)) {
            router.patch(route('chart-of-account.update', account.id), {
                is_locked: !account.is_locked
            }, {
                preserveScroll: true
            });
        }
    };

    useEffect(() => {
        const duplicate = validateAccountName(data.name);
        setNameDuplicateError(duplicate ? 'An account with this name already exists.' : '');
    }, [data.name, selectedId, chartOfAccounts]);

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

        if (validateAccountName(data.name)) {
            setError('name', 'An account with this name already exists.');
            setNameDuplicateError('An account with this name already exists.');
            return;
        }

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

    const submitAndNew = (e) => {
        e.preventDefault();

        if (validateAccountName(data.name)) {
            setError('name', 'An account with this name already exists.');
            setNameDuplicateError('An account with this name already exists.');
            return;
        }

        const options = {
            onSuccess: () => {
                reset();
                clearErrors();
                handleOpenCreate();
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
                                    className="pl-9 pr-4 py-1.5 border border-slate-300 rounded-md text-[11px] w-64 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all"
                                />
                            </div>

                            <select
                                value={filterType}
                                onChange={e => setFilterType(e.target.value)}
                                className="px-3 py-1.5 border border-slate-300 rounded-sm text-[11px] font-bold text-slate-600 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500"
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
                                    <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Description</th>
                                    <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Balance</th>
                                    <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredAccounts.map((account) => (
                                    <tr key={account.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-4 py-2.5" style={{ paddingLeft: account.parent_id ? '28px' : '16px' }}>
                                            <div className="flex flex-col">
                                                <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1">
                                                    {account.parent_id && (
                                                        <span className="text-slate-300 font-normal">↳</span>
                                                    )}
                                                    {account.name}
                                                    {account.is_locked ? (
                                                        <svg className="w-3 h-3 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" title="Locked Account">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                        </svg>
                                                    ) : null}
                                                </span>
                                                <span className="text-[10px] text-slate-400 flex items-center gap-1.5">
                                                    {account.account_code}
                                                    {!account.is_active && (
                                                        <span className="bg-slate-100 text-slate-500 px-1 py-0.5 rounded text-[8px] uppercase tracking-wider font-bold">Inactive</span>
                                                    )}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-2.5 text-[11px] text-slate-600 capitalize">{account.account_type}</td>
                                        <td className="px-4 py-2.5 text-[11px] text-slate-600 capitalize">{account.sub_type?.replace(/-/g, ' ') || 'Main Account'}</td>
                                        <td className="px-4 py-2.5 text-[11px] text-slate-500 max-w-[200px] truncate" title={account.description || ''}>
                                            {account.description || '-'}
                                        </td>
                                        <td className="px-4 py-2.5 text-[11px] font-bold text-slate-800 text-right">
                                            {['asset', 'equity', 'liability'].includes(account.account_type) ? (
                                                `${account.currency || company?.home_currency_prefix || company?.home_currency || ''} ${parseFloat(account.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`
                                            ) : (
                                                ''
                                            )}
                                        </td>
                                        <td className="px-4 py-2.5">
                                            <div className="flex items-center justify-center gap-1">
                                                {['asset', 'equity', 'liability'].includes(account.account_type) ? (
                                                    <CommonButton
                                                        variant="ghost"
                                                        size="xs"
                                                        href={route('chart-of-account.history', account.id)}
                                                    >
                                                        History
                                                    </CommonButton>
                                                ) : (
                                                    <CommonButton
                                                        variant="ghost"
                                                        size="xs"
                                                        href={route('reports.profit-loss')}
                                                    >
                                                        Run Report
                                                    </CommonButton>
                                                )}

                                                <Dropdown>
                                                    <Dropdown.Trigger>
                                                        <button className="p-1 hover:bg-slate-100 rounded text-slate-500 transition-colors focus:outline-none flex items-center">
                                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                                            </svg>
                                                        </button>
                                                    </Dropdown.Trigger>
                                                    <Dropdown.Content align="right" width="48" contentClasses="py-1 bg-white ring-1 ring-black ring-opacity-5 rounded-md shadow-lg overflow-hidden mt-2">
                                                        <button
                                                            onClick={() => handleOpenEdit(account)}
                                                            className="block w-full px-4 py-2 text-start text-xs leading-5 text-slate-700 transition duration-150 ease-in-out hover:bg-slate-100 focus:bg-slate-100 focus:outline-none font-bold"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleOpenCreate(account)}
                                                            className="block w-full px-4 py-2 text-start text-xs leading-5 text-slate-700 transition duration-150 ease-in-out hover:bg-slate-100 focus:bg-slate-100 focus:outline-none font-bold border-t border-slate-100"
                                                        >
                                                            Add Sub-account
                                                        </button>
                                                        {!account.is_locked && (
                                                            <button
                                                                onClick={() => handleToggleActive(account)}
                                                                className="block w-full px-4 py-2 text-start text-xs leading-5 text-slate-700 transition duration-150 ease-in-out hover:bg-slate-100 focus:bg-slate-100 focus:outline-none font-bold border-t border-slate-100"
                                                            >
                                                                {account.is_active ? "Make Inactive" : "Make Active"}
                                                            </button>
                                                        )}
                                                        {!account.is_system && (
                                                            <button
                                                                onClick={() => handleToggleLock(account)}
                                                                className="block w-full px-4 py-2 text-start text-xs leading-5 text-slate-700 transition duration-150 ease-in-out hover:bg-slate-100 focus:bg-slate-100 focus:outline-none font-bold border-t border-slate-100"
                                                            >
                                                                {account.is_locked ? "Unlock Account" : "Lock Account"}
                                                            </button>
                                                        )}
                                                    </Dropdown.Content>
                                                </Dropdown>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredAccounts.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-12 text-center text-[11px] text-slate-400 font-medium">
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
                    {(data.is_locked || data.is_system) && (
                        <div className="p-3 rounded-sm bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-medium flex items-center gap-2 animate-in fade-in duration-200">
                            <svg className="w-4.5 h-4.5 shrink-0 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <span>
                                {data.is_system
                                    ? "This is a system account. Its properties cannot be modified or deleted."
                                    : "This account is locked and cannot be edited or deleted."}
                            </span>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <CommonInput
                            type="select"
                            label="Account Type"
                            value={data.account_type}
                            onChange={e => handleTypeChange(e.target.value)}
                            error={errors.account_type}
                            required
                            disabled={data.is_locked || data.is_system}
                        >
                            <option value="asset">Asset</option>
                            <option value="liability">Liability</option>
                            <option value="equity">Equity</option>
                            <option value="income">Income</option>
                            <option value="expense">Expense</option>
                        </CommonInput>
                        <CommonInput
                            type="select"
                            label="Detail Type"
                            value={data.sub_type}
                            onChange={e => setData('sub_type', e.target.value)}
                            error={errors.sub_type}
                            required
                            options={getDetailTypeOptions(data.account_type)}
                            disabled={data.is_locked || data.is_system}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <CommonInput
                            label="Account Code"
                            value={data.account_code}
                            onChange={e => setData('account_code', e.target.value)}
                            error={errors.account_code}
                            required
                            disabled={data.is_locked || data.is_system}
                        />
                        <CommonInput
                            label="Account Name"
                            value={data.name}
                            onChange={e => setData('name', e.target.value)}
                            error={errors.name || nameDuplicateError}
                            required
                            disabled={data.is_locked || data.is_system}
                        />
                    </div>

                    <div className="pt-4 border-t border-slate-150">
                        <Toggle
                            checked={data.is_subaccount}
                            onChange={val => setData('is_subaccount', val)}
                            label="Make this a sub-account"
                            description="Sub-accounts nest under parent accounts in financial statements."
                            disabled={data.is_locked || data.is_system}
                        />
                    </div>

                    {data.is_subaccount && (
                        <div className="pt-4 border-t border-slate-150">
                            <SearchableSelect
                                label="Parent Account"
                                value={data.parent_id}
                                onChange={val => setData('parent_id', val)}
                                error={errors.parent_id}
                                required={data.is_subaccount}
                                placeholder="Search and select a parent account"
                                options={chartOfAccounts
                                    .filter(acc =>
                                        acc.account_type === data.account_type &&
                                        (!selectedId || acc.id !== selectedId)
                                    )
                                    .map(acc => ({
                                        value: acc.id,
                                        label: `${acc.account_code} - ${acc.name}`,
                                        type: acc.account_type,
                                    }))
                                }
                            />
                            {chartOfAccounts.filter(acc =>
                                acc.account_type === data.account_type &&
                                (!selectedId || acc.id !== selectedId)
                            ).length === 0 && (
                                <p className="mt-1.5 text-[10px] text-amber-500 font-medium italic">
                                    No {data.account_type} accounts available to use as parent.
                                </p>
                            )}
                        </div>
                    )}

                    <div className="pt-4 border-t border-slate-150">
                        <CommonInput
                            type="textarea"
                            label="Description"
                            value={data.description}
                            onChange={e => setData('description', e.target.value)}
                            error={errors.description}
                            rows="1"
                            className="resize-none"
                            disabled={data.is_locked || data.is_system}
                        />
                    </div>

                    {multicurrencyEnabled && (
                        <div className="pt-4 border-t border-slate-100">
                            <CommonInput
                                type="select"
                                label="Account Currency"
                                value={data.currency}
                                onChange={e => setData('currency', e.target.value)}
                                error={errors.currency}
                                disabled={data.is_locked || data.is_system}
                            >
                                <option value="">Select Currency</option>
                                {currencyOptions.map((currency) => (
                                    <option key={currency.id || currency.code} value={currency.code || currency.id}>
                                        {currency.code || currency.id} - {currency.name || currency.code}
                                    </option>
                                ))}
                            </CommonInput>
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
                                disabled={data.is_locked || data.is_system}
                            />
                            <CommonInput
                                type="date"
                                label="As of Date"
                                value={data.opening_balance_date}
                                onChange={handleDateChange}
                                error={errors.opening_balance_date}
                                disabled={data.is_locked || data.is_system}
                            />
                        </div>
                    )}

                    {!data.is_system && (
                        <div className="pt-4 border-t border-slate-150">
                            <Toggle
                                checked={data.is_locked}
                                onChange={val => setData('is_locked', val)}
                                label="Lock Account"
                                description="Locking prevents deletion or modification of the account details."
                            />
                        </div>
                    )}

                    <div className="sticky bottom-0 bg-white pt-6 flex items-center justify-between gap-3 border-t border-slate-100">
                        <div>
                            {isEdit && !data.is_locked && !data.is_system && (
                                <CommonButton
                                    type="button"
                                    variant="danger"
                                    onClick={handleDelete}
                                    processing={processing}
                                >
                                    Delete
                                </CommonButton>
                            )}
                        </div>
                        <div className="flex items-center gap-3">
                            <CommonButton variant="ghost" onClick={() => setIsPanelOpen(false)} size="sm">
                                {(data.is_locked || data.is_system) ? "Close" : "Cancel"}
                            </CommonButton>
                            {(!data.is_locked || !accountWasLockedInitially || !isEdit) && (
                                <>
                                    {!isEdit && (
                                        <CommonButton
                                            type="button"
                                            variant="secondary"
                                            processing={processing}
                                            size="sm"
                                            onClick={submitAndNew}
                                        >
                                            Save &amp; New
                                        </CommonButton>
                                    )}
                                    <CommonButton type="submit" variant="primary" processing={processing} size="sm">
                                        {isEdit ? "Update" : "Save"}
                                    </CommonButton>
                                </>
                            )}
                        </div>
                    </div>
                </form>
            </SlideOver>
        </AuthenticatedLayout>
    );
}
