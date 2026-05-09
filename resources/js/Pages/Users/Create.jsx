import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useForm, Head, Link } from '@inertiajs/react';
import CommonInput from '@/Components/CommonInput';
import CommonButton from '@/Components/CommonButton';

export default function Create({ managers }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'user',
        phone: '',
    });

    function submit(e) {
        e.preventDefault();
        post(route('users.store'));
    }

    return (
        <AuthenticatedLayout>
            <Head title="Create System User" />
            
            <div className="py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-2xl mx-auto">
                    <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] overflow-hidden">
                        <div className="px-10 pt-10 pb-6 border-b border-slate-100 bg-slate-50/30 text-center">
                            <div className="w-16 h-16 bg-slate-900 rounded-3xl flex items-center justify-center text-white mx-auto mb-4">
                                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight italic uppercase">Create System User</h1>
                            <p className="text-sm text-slate-500 font-medium mt-1 font-medium tracking-tight">Add a new user with global administrative or standard access.</p>
                        </div>

                        <form onSubmit={submit} className="p-10 space-y-8">
                            <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                                <div className="col-span-2">
                                    <CommonInput
                                        label="Full Name"
                                        placeholder="Enter full name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        error={errors.name}
                                    />
                                </div>

                                <div className="col-span-2">
                                    <CommonInput
                                        type="email"
                                        label="Email Address"
                                        placeholder="email@example.com"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        error={errors.email}
                                    />
                                </div>

                                <CommonInput
                                    type="password"
                                    label="Password"
                                    placeholder="••••••••"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    error={errors.password}
                                />

                                <CommonInput
                                    type="password"
                                    label="Confirm Password"
                                    placeholder="••••••••"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    error={errors.password_confirmation}
                                />

                                <CommonInput
                                    label="Phone Number"
                                    placeholder="+1 (555) 000-0000"
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    error={errors.phone}
                                />

                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block ml-1">Access Level</label>
                                    <select
                                        value={data.role}
                                        onChange={(e) => setData('role', e.target.value)}
                                        className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all outline-none appearance-none"
                                    >
                                        <option value="user">Standard User</option>
                                        <option value="admin">Global Administrator</option>
                                    </select>
                                    {errors.role && <p className="text-red-500 text-[10px] mt-1 font-bold italic ml-1">{errors.role}</p>}
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                                <Link href={route('users.index')}>
                                    <button type="button" className="text-sm font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors">
                                        Cancel
                                    </button>
                                </Link>
                                <CommonButton
                                    type="submit"
                                    variant="primary"
                                    className="px-10 bg-slate-900 hover:bg-slate-800"
                                    disabled={processing}
                                >
                                    {processing ? 'Processing...' : 'Create User Account'}
                                </CommonButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
