import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useForm } from '@inertiajs/react';

export default function Edit({ user, managers }) {

    const { data, setData, patch, processing, errors } = useForm({
        name: user.name ?? '',
        email: user.email ?? '',
        role: user.role ?? 'staff',
        hire_date: user.hire_date ?? '',
        manager_id: user.manager_id ?? '',
        is_active: user.is_active ?? true,
    });

    function submit(e) {
        e.preventDefault();

        patch(route('team.update', user.id));
    }

    return (
        <AuthenticatedLayout
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Edit Employee
                </h2>
            }
        >
            <div className="py-12">
                <div className="max-w-3xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white p-6 shadow sm:rounded-lg">

                        <form onSubmit={submit} className="space-y-6">

                            {/* Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="mt-1 w-full border-gray-300 rounded-md shadow-sm"
                                />
                                {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className="mt-1 w-full border-gray-300 rounded-md shadow-sm"
                                />
                                {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                            </div>

                            {/* Role */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Role
                                </label>
                                <select
                                    value={data.role}
                                    onChange={(e) => setData('role', e.target.value)}
                                    className="mt-1 w-full border-gray-300 rounded-md shadow-sm"
                                >
                                    <option value="admin">Admin</option>
                                    <option value="manager">Manager</option>
                                    <option value="staff">Staff</option>
                                </select>
                                {errors.role && <p className="text-red-500 text-sm">{errors.role}</p>}
                            </div>

                            {/* Hire Date */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Hire Date
                                </label>
                                <input
                                    type="date"
                                    value={data.hire_date}
                                    onChange={(e) => setData('hire_date', e.target.value)}
                                    className="mt-1 w-full border-gray-300 rounded-md shadow-sm"
                                />
                                {errors.hire_date && <p className="text-red-500 text-sm">{errors.hire_date}</p>}
                            </div>

                            {/* Manager */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Manager
                                </label>
                                <select
                                    value={data.manager_id || ''}
                                    onChange={(e) => setData('manager_id', e.target.value)}
                                    className="mt-1 w-full border-gray-300 rounded-md shadow-sm"
                                >
                                    <option value="">No Manager</option>

                                    {managers.map((m) => (
                                        <option key={m.id} value={m.id}>
                                            {m.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.manager_id && <p className="text-red-500 text-sm">{errors.manager_id}</p>}
                            </div>

                            {/* Active */}
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={data.is_active}
                                    onChange={(e) => setData('is_active', e.target.checked)}
                                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                                />
                                <label className="text-sm text-gray-700">Active</label>
                            </div>

                            {/* Submit */}
                            <div>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                                >
                                    {processing ? 'Updating...' : 'Update Employee'}
                                </button>
                            </div>

                        </form>

                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
