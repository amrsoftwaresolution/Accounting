import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useForm } from '@inertiajs/react';

export default function ChartOfAccCreate() {
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
        account_name: '',
        account_type: 'asset',
        account_sub_type: 'cash-and-cash-equivalents',
        description: '',
        is_active: true,
    });

    function submit(e) {
        e.preventDefault();
        post(route('chart-of-account.store'), {
            onSuccess: () => reset('account_code', 'account_name', 'description'),
        });
    }

    return (
        <AuthenticatedLayout
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Create Chart of Account
                </h2>
            }
        >
            <div className="py-12">
                <div className="max-w-3xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white p-6 shadow sm:rounded-lg">
                        <form onSubmit={submit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700" htmlFor="account_code">
                                    Account Code
                                </label>
                                <input
                                    id="account_code"
                                    name="account_code"
                                    type="text"
                                    value={data.account_code}
                                    onChange={(e) => setData('account_code', e.target.value)}
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                />
                                {errors.account_code && <p className="text-red-500 text-sm mt-1">{errors.account_code}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700" htmlFor="account_name">
                                    Account Name
                                </label>
                                <input
                                    id="account_name"
                                    name="account_name"
                                    type="text"
                                    value={data.account_name}
                                    onChange={(e) => setData('account_name', e.target.value)}
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                />
                                {errors.account_name && <p className="text-red-500 text-sm mt-1">{errors.account_name}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700" htmlFor="account_type">
                                    Account Type (Parent Group)
                                </label>
                                <select
                                    id="account_type"
                                    name="account_type"
                                    value={data.account_type}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setData('account_type', value);

                                        const defaults = {
                                            asset: 'cash-and-cash-equivalents',
                                            liability: 'credit-card',
                                            equity: 'owners-equity',
                                            income: 'income',
                                            expense: 'expense',
                                        };

                                        setData('account_sub_type', defaults[value] ?? '');
                                    }}
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                >
                                    <option value="asset">Asset</option>
                                    <option value="liability">Liability</option>
                                    <option value="equity">Equity</option>
                                    <option value="income">Income</option>
                                    <option value="expense">Expense</option>
                                </select>
                                {errors.account_type && <p className="text-red-500 text-sm mt-1">{errors.account_type}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700" htmlFor="account_sub_type">
                                    Account Sub-Type (Child Category)
                                </label>
                                <select
                                    id="account_sub_type"
                                    name="account_sub_type"
                                    value={data.account_sub_type}
                                    onChange={(e) => setData('account_sub_type', e.target.value)}
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                >
                                    <option value="">Select sub-type</option>
                                    {(subtypeOptions[data.account_type] || []).map((sub) => (
                                        <option key={sub.value} value={sub.value}>
                                            {sub.label}
                                        </option>
                                    ))}
                                </select>
                                {errors.account_sub_type && <p className="text-red-500 text-sm mt-1">{errors.account_sub_type}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700" htmlFor="description">
                                    Description
                                </label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                />
                                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                            </div>
                            
                            <div className="flex items-center space-x-2">
                                <input
                                    id="is_active"
                                    name="is_active"
                                    type="checkbox"
                                    checked={data.is_active}
                                    onChange={(e) => setData('is_active', e.target.checked)}
                                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                                />
                                <label htmlFor="is_active" className="text-sm text-gray-700">
                                    Active
                                </label>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
                                >
                                    {processing ? 'Saving...' : 'Create Chart of Account'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
