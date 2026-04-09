import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useForm, usePage } from '@inertiajs/react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';

export default function Create({ managers }) {

    const { auth } = usePage().props;

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'staff',
        hire_date: '',
        manager_id: '',
        is_active: true,
    });

 function submit(e) {
    e.preventDefault();

    let payload = {
        ...data,
        manager_id:
            auth.user.role === 'manager'
                ? auth.user.id
                : data.manager_id,
    };

    post(route('team.store'), payload);
}

    return (
        <AuthenticatedLayout
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Add Employee
                </h2>
            }
        >
            <div className="py-12">
                <div className="max-w-3xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white p-6 shadow sm:rounded-lg">

                        <form onSubmit={submit} className="space-y-6">

                            {/* Name */}
                            <div>
                                <InputLabel value="Name" />
                                <TextInput
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="mt-1 block w-full"
                                />
                                <InputError message={errors.name} className="mt-2" />
                            </div>

                            {/* Email */}
                            <div>
                                <InputLabel value="Email" />
                                <TextInput
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className="mt-1 block w-full"
                                />
                                <InputError message={errors.email} className="mt-2" />
                            </div>

                            {/* Password */}
                            <div>
                                <InputLabel value="Password" />
                                <TextInput
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    className="mt-1 block w-full"
                                />
                                <InputError message={errors.password} className="mt-2" />
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <InputLabel value="Confirm Password" />
                                <TextInput
                                    type="password"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    className="mt-1 block w-full"
                                />
                                <InputError message={errors.password_confirmation} className="mt-2" />
                            </div>

                            {/* Hire Date */}
                            <div>
                                <InputLabel value="Hire Date" />
                                <input
                                    type="date"
                                    value={data.hire_date}
                                    onChange={(e) => setData('hire_date', e.target.value)}
                                    className="mt-1 w-full border-gray-300 rounded-md shadow-sm"
                                />
                                <InputError message={errors.hire_date} className="mt-2" />
                            </div>

                            {/* Manager (ONLY admin assigning staff) */}
                            {auth.user.role === 'admin' && data.role === 'staff' && (
                                <div>
                                    <InputLabel value="Assign Manager" />
                                    <select
                                        value={data.manager_id}
                                        onChange={(e) => setData('manager_id', e.target.value)}
                                        className="mt-1 w-full border-gray-300 rounded-md shadow-sm"
                                    >
                                        <option value="">No Manager</option>

                                        {managers.length === 0 ? (
                                            <option disabled>No managers available</option>
                                        ) : (
                                            managers.map((m) => (
                                                <option key={m.id} value={m.id}>
                                                    {m.name}
                                                </option>
                                            ))
                                        )}
                                    </select>
                                    <InputError message={errors.manager_id} className="mt-2" />
                                </div>
                            )}

                            {/* Active */}
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={data.is_active}
                                    onChange={(e) => setData('is_active', e.target.checked)}
                                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                                />
                                <span className="text-sm text-gray-700">Active</span>
                            </div>

                            {/* Submit */}
                            <div>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                                >
                                    {processing ? 'Saving...' : 'Create Employee'}
                                </button>
                            </div>

                        </form>

                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
