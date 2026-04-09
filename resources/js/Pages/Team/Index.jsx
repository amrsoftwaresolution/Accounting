import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Link } from '@inertiajs/react';

export default function Index({ users }) {
    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Team
                    </h2>
                </div>
            }
        >
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">

                            {/* Header */}
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-medium">Employees</h3>

                                <Link
                                    href={route('team.create')}
                                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md shadow-sm hover:bg-indigo-700"
                                >
                                    Add Employee
                                </Link>
                            </div>

                            <p className="text-gray-600 mb-4">
                                Manage your team members and roles here.
                            </p>

                            {/* Table */}
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">

                                    {/* Table Head */}
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Name</th>
                                            <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Email</th>
                                            <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Role</th>
                                            <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                                            <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Hire Date</th>
                                            <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Manager</th>
                                            <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                                        </tr>
                                    </thead>

                                    {/* Table Body */}
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {users.length === 0 ? (
                                            <tr>
                                                <td colSpan={7} className="px-4 py-6 text-center text-sm text-gray-500">
                                                    No employees found. Add one to get started.
                                                </td>
                                            </tr>
                                        ) : (
                                            users.map((user) => (
                                                <tr key={user.id}>
                                                    <td className="px-4 py-2 text-center text-sm text-gray-900">
                                                        {user.name}
                                                    </td>

                                                    <td className="px-4 py-2 text-center text-sm text-gray-600">
                                                        {user.email}
                                                    </td>

                                                    <td className="px-4 py-2 text-center text-sm capitalize">
                                                        {user.role}
                                                    </td>

                                                    <td className="px-4 py-2 text-center text-sm">
                                                        {user.is_active ? (
                                                            <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-800">
                                                                Active
                                                            </span>
                                                        ) : (
                                                            <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-800">
                                                                Inactive
                                                            </span>
                                                        )}
                                                    </td>

                                                    <td className="px-4 py-2 text-center text-sm text-gray-500">
                                                        {user.hire_date ?? '-'}
                                                    </td>

                                                    <td className="px-4 py-2 text-center text-sm text-gray-500">
                                                        {user.manager ? user.manager.name : '-'}
                                                    </td>

                                                    <td className="px-4 py-2 text-center text-sm font-medium">
                                                        <Link
                                                            href={route('team.edit', user.id)}
                                                            className="text-indigo-600 hover:text-indigo-900"
                                                        >
                                                            Edit
                                                        </Link>

                                                        <span className="mx-1 text-gray-300">|</span>

                                                        <Link
                                                            href={route('team.destroy', user.id)}
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
