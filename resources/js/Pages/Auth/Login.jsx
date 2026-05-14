import CommonInput from '@/Components/CommonInput';
import PrimaryButton from '@/Components/PrimaryButton';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
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
                <p className="text-slate-500 mt-1.5 text-sm">Welcome back to {usePage().props.appName}.</p>
            </div>

            {status && (
                <div className="mb-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-600 border border-emerald-100">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-4">
                <CommonInput
                    label="Email"
                    type="email"
                    name="email"
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                    placeholder="james@example.com"
                    error={errors.email}
                    isFocused={true}
                    autoComplete="username"
                />

                <div className="relative">
                    <CommonInput
                        label="Password"
                        type="password"
                        name="password"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        placeholder="••••••••"
                        error={errors.password}
                        autoComplete="current-password"
                    />
                    {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            className="absolute right-0 top-0 text-[10px] font-bold uppercase tracking-wider text-green-600 hover:text-green-700 transition-colors"
                        >
                            Forgot?
                        </Link>
                    )}
                </div>

                <div className="pt-2">
                    <PrimaryButton 
                        className="w-full justify-center py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded shadow-lg shadow-green-600/20 uppercase tracking-widest text-xs transition-all duration-200" 
                        disabled={processing}
                    >
                        Sign In
                    </PrimaryButton>
                </div>

                <div className="text-center pt-4 border-t border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Don't have an account?{' '}
                        <Link
                            href={route('register')}
                            className="text-green-600 hover:text-green-700 transition-colors ml-1"
                        >
                            Sign Up
                        </Link>
                    </p>
                </div>
            </form>
        </GuestLayout>
    );
}
