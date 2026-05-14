import CommonInput from '@/Components/CommonInput';
import PrimaryButton from '@/Components/PrimaryButton';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.email'));
    };

    return (
        <GuestLayout>
            <Head title="Forgot Password" />

            <div className="mb-6 text-center">
                <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Reset Password</h1>
                <p className="text-slate-500 mt-1.5 text-sm">Enter your email to receive a recovery link.</p>
            </div>

            <div className="mb-6 text-xs text-slate-500 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 italic">
                Forgot your password? No problem. Just let us know your email address and we will email you a password reset link that will allow you to choose a new one.
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

                <div className="pt-2">
                    <PrimaryButton 
                        className="w-full justify-center py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded shadow-lg shadow-green-600/20 uppercase tracking-widest text-xs transition-all duration-200" 
                        disabled={processing}
                    >
                        Send Reset Link
                    </PrimaryButton>
                </div>

                <div className="text-center pt-4 border-t border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Remember your password?{' '}
                        <Link
                            href={route('login')}
                            className="text-green-600 hover:text-green-700 transition-colors ml-1"
                        >
                            Back to Login
                        </Link>
                    </p>
                </div>
            </form>
        </GuestLayout>
    );
}
