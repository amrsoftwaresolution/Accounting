import { useForm, usePage } from '@inertiajs/react';
import SlideOver from './SlideOver';
import CommonInput from './CommonInput';
import CommonButton from './CommonButton';
import { useState, useEffect } from 'react';
import axios from 'axios';

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

export default function QuickAddAccount({ isOpen, onClose, onSuccess, defaultType = 'asset' }) {
    const { auth, currencies = [] } = usePage().props;
    const company = auth?.company;
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

    const subtypeOptions = {
        asset: [
            { value: 'cash-and-cash-equivalents', label: 'Cash and cash equivalents' },
            { value: 'accounts-receivable', label: 'Accounts receivable (A/R)' },
            { value: 'current-assets', label: 'Current assets' },
            { value: 'fixed-assets', label: 'Fixed assets' },
            { value: 'non-current-assets', label: 'Non-current assets' },
        ],
        subtype: [], // placeholder or fallback
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

    const [parentAccounts, setParentAccounts] = useState([]);
    const [nameDuplicateError, setNameDuplicateError] = useState('');

    const initialDate = localStorage.getItem('last_opening_balance_date') || new Date().toISOString().split('T')[0];

    const { data, setData, post, processing, errors, reset, setError } = useForm({
        account_code: '',
        name: '',
        account_type: defaultType,
        sub_type: subtypeOptions[defaultType]?.[0]?.value || '',
        opening_balance: '0.00',
        opening_balance_date: initialDate,
        description: '',
        is_active: true,
        currency: defaultCurrency,
        is_subaccount: false,
        parent_id: '',
        is_locked: false,
    });

    const validateAccountName = (value) => {
        const normalized = String(value || '').trim().toLowerCase();
        return parentAccounts.some(acc => String(acc.name || '').trim().toLowerCase() === normalized);
    };

    const handleTypeChange = (value) => {
        setData(prev => ({
            ...prev,
            account_type: value,
            sub_type: subtypeOptions[value]?.[0]?.value || ''
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
        if (isOpen) {
            axios.get(route('api.accounts'))
                .then(res => {
                    setParentAccounts(res.data || []);
                })
                .catch(err => console.error("Failed to load accounts for parent select:", err));
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen && data.account_type) {
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
    }, [isOpen, data.account_type]);

    useEffect(() => {
        setNameDuplicateError(validateAccountName(data.name) ? 'An account with this name already exists.' : '');
    }, [data.name, parentAccounts]);

    const submit = (e) => {
        e.preventDefault();

        if (validateAccountName(data.name)) {
            setError('name', 'An account with this name already exists.');
            setNameDuplicateError('An account with this name already exists.');
            return;
        }

        post(route('chart-of-account.store'), {
            onSuccess: (page) => {
                const newAccount = page.props.flash?.new_account;
                onSuccess && onSuccess(newAccount);
                onClose();
                reset();
            },
        });
    };

    return (
        <SlideOver
            isOpen={isOpen}
            onClose={onClose}
            title="Add New Account"
        >
            <form onSubmit={submit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <CommonInput
                        label="Account Code"
                        value={data.account_code}
                        onChange={e => setData('account_code', e.target.value)}
                        error={errors.account_code}
                        required
                        disabled={data.is_locked}
                    />
                    <CommonInput
                        label="Account Name"
                        value={data.name}
                        onChange={e => setData('name', e.target.value)}
                        error={errors.name || nameDuplicateError}
                        required
                        disabled={data.is_locked}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <CommonInput
                        type="select"
                        label="Account Type"
                        value={data.account_type}
                        onChange={e => handleTypeChange(e.target.value)}
                        error={errors.account_type}
                        required
                        disabled={data.is_locked}
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
                        options={subtypeOptions[data.account_type]}
                        disabled={data.is_locked}
                    />
                </div>

                <div className="pt-4 border-t border-slate-150">
                    <Toggle
                        checked={data.is_subaccount}
                        onChange={val => setData('is_subaccount', val)}
                        label="Make this a sub-account"
                        description="Sub-accounts nest under parent accounts in financial statements."
                        disabled={data.is_locked}
                    />
                </div>

                {data.is_subaccount && (
                    <div className="pt-4 border-t border-slate-150 space-y-4">
                        <CommonInput
                            type="select"
                            label="Parent Account"
                            value={data.parent_id}
                            onChange={e => setData('parent_id', e.target.value)}
                            error={errors.parent_id}
                            required={data.is_subaccount}
                            disabled={data.is_locked}
                        >
                            <option value="">Select a parent account</option>
                            {parentAccounts
                                .map(acc => (
                                    <option key={acc.value} value={acc.value}>
                                        {acc.label} {acc.account_type ? `(${acc.account_type})` : ''}
                                    </option>
                                ))}
                        </CommonInput>

                        <CommonInput
                            type="textarea"
                            label="Description"
                            value={data.description}
                            onChange={e => setData('description', e.target.value)}
                            error={errors.description}
                            rows="3"
                            className="resize-none"
                            disabled={data.is_locked}
                        />
                    </div>
                )}

                {multicurrencyEnabled && (
                    <div className="pt-4 border-t border-slate-100">
                        <CommonInput
                            type="select"
                            label="Account Currency"
                            value={data.currency}
                            onChange={e => setData('currency', e.target.value)}
                            error={errors.currency}
                            disabled={data.is_locked}
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

                {['asset', 'liability', 'equity'].includes(data.account_type) && (
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
                            disabled={data.is_locked}
                        />
                        <CommonInput
                            type="date"
                            label="As of Date"
                            value={data.opening_balance_date}
                            onChange={handleDateChange}
                            error={errors.opening_balance_date}
                            disabled={data.is_locked}
                        />
                    </div>
                )}

                <div className="pt-4 border-t border-slate-150">
                    <Toggle
                        checked={data.is_locked}
                        onChange={val => setData('is_locked', val)}
                        label="Lock Account"
                        description="Locking prevents deletion or modification of the account details."
                    />
                </div>

                <div className="sticky bottom-0 bg-white pt-6 flex items-center justify-end gap-3 border-t border-slate-100">
                    <CommonButton variant="ghost" onClick={onClose} size="sm">Cancel</CommonButton>
                    <CommonButton type="submit" variant="primary" processing={processing} size="sm">
                        Save Account
                    </CommonButton>
                </div>
            </form>
        </SlideOver>
    );
}
