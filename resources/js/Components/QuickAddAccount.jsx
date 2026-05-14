import { useForm } from '@inertiajs/react';
import SlideOver from './SlideOver';
import CommonInput from './CommonInput';
import CommonButton from './CommonButton';
import { useState } from 'react';

export default function QuickAddAccount({ isOpen, onClose, onSuccess, defaultType = 'asset' }) {
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

    const { data, setData, post, processing, errors, reset } = useForm({
        account_code: '',
        name: '',
        account_type: defaultType,
        sub_type: subtypeOptions[defaultType][0].value,
        opening_balance: 0,
        opening_balance_date: new Date().toISOString().split('T')[0],
        description: '',
        is_active: true,
    });

    const handleTypeChange = (value) => {
        setData(prev => ({
            ...prev,
            account_type: value,
            sub_type: subtypeOptions[value][0].value
        }));
    };

    const submit = (e) => {
        e.preventDefault();
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
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#00713D]/20 focus:border-[#00713D] transition-all"
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
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#00713D]/20 focus:border-[#00713D] transition-all"
                        >
                            {subtypeOptions[data.account_type].map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Description</label>
                        <textarea
                            value={data.description}
                            onChange={e => setData('description', e.target.value)}
                            rows="3"
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#00713D]/20 focus:border-[#00713D] transition-all resize-none"
                        />
                    </div>
                </div>

                <div className="sticky bottom-0 bg-white pt-6 flex items-center justify-end gap-3 border-t border-slate-100">
                    <CommonButton variant="ghost" onClick={onClose}>Cancel</CommonButton>
                    <CommonButton type="submit" variant="primary" processing={processing}>
                        Save Account
                    </CommonButton>
                </div>
            </form>
        </SlideOver>
    );
}
