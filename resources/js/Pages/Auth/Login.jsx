import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { router } from '@inertiajs/react';


export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();

        router.post(route('login'), data, {
            onFinish: () => reset('password'),
        });
    };
    return (
        <GuestLayout>
            <Head title="Log in" />

            <div className="mb-6 text-center">
                <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Sign In</h1>
                <p className="text-slate-500 mt-1.5 text-sm">Welcome back to JobAlign Book.</p>
            </div>

            {status && (
                <div className="mb-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-600 border border-emerald-100">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-5">
                <div>
                    <InputLabel htmlFor="email" value="Email" className="text-slate-700 font-medium mb-1.5" />

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full rounded-xl border-slate-200 focus:border-[#00713D] focus:ring-[#00713D] py-3.5 px-4 transition-all duration-200"
                        autoComplete="username"
                        isFocused={true}
                        onChange={(e) => setData('email', e.target.value)}
                        placeholder="james@example.com"
                    />

                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div>
                    <div className="flex items-center justify-between mb-1.5">
                        <InputLabel htmlFor="password" value="Password" className="text-slate-700 font-medium" />
                        {canResetPassword && (
                            <Link
                                href={route('password.request')}
                                className="text-xs font-semibold text-[#00713D] hover:text-[#005a30] transition-colors"
                            >
                                Forgot?
                            </Link>
                        )}
                    </div>

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full rounded-xl border-slate-200 focus:border-[#00713D] focus:ring-[#00713D] py-3.5 px-4 transition-all duration-200"
                        autoComplete="current-password"
                        onChange={(e) => setData('password', e.target.value)}
                        placeholder="••••••••"
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="pt-2">
                    <PrimaryButton 
                        className="w-full justify-center py-3.5 bg-[#00713D] hover:bg-[#005a30] text-white font-semibold rounded-xl transition-all duration-200 shadow-md shadow-[#00713D]/20" 
                        disabled={processing}
                    >
                        Sign In
                    </PrimaryButton>
                </div>

                <div className="text-center pt-4 border-t border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        Don't have an account?{' '}
                        <Link
                            href={route('register')}
                            className="text-[#00713D] hover:text-[#005a30] transition-colors"
                        >
                            Sign Up
                        </Link>
                    </p>
                </div>
            </form>
        </GuestLayout>
    );
}
