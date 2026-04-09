import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Link } from '@inertiajs/react';

export default function ChartOfAcc({ chartOfAccounts }) {
    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">Chart of Accounts</h2>
                </div>
            }
        >
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-medium">Chart of Accounts</h3>
                                <Link
                                    href={route('chart-of-account.create')}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                    Create Account
                                </Link>
                            </div>
                            <p className="text-gray-600">Manage your accounting chart structure here.</p>

                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                                            <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                            <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                            <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Sub-Type</th>
                                            <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                            <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Active</th>
                                            <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                                            <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {chartOfAccounts.length === 0 ? (
                                            <tr>
                                                <td colSpan={7} className="px-4 py-6 text-center text-sm text-gray-500">
                                                    No chart of accounts found. Create one to get started.
                                                </td>
                                            </tr>
                                        ) : (
                                            chartOfAccounts.map((account) => (
                                                <tr key={account.id}>
                                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{account.account_code}</td>
                                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{account.account_name}</td>
                                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 capitalize">{account.account_type}</td>
                                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{account.account_sub_type}</td>
                                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">{account.description || '-'}</td>
                                                    <td className="px-4 py-2 whitespace-nowrap text-sm">
                                                        {account.is_active ? (
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Active</span>
                                                        ) : (
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Inactive</span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{new Date(account.created_at).toLocaleDateString()}</td>
                                                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">
                                                        <Link
                                                            href={route('chart-of-account.edit', account.id)}
                                                            className="text-indigo-600 hover:text-indigo-900"
                                                        >
                                                            Edit
                                                        </Link>
                                                        <span className="mx-1 text-gray-300">|</span>
                                                        <Link
                                                            href={route('chart-of-account.destroy', account.id)}
                                                            method="delete"
                                                            as="button"
                                                            className="text-red-600 hover:text-red-900"
                                                        >
                                                            Delete
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
