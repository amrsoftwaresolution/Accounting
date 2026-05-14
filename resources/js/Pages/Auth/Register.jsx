import CommonInput from '@/Components/CommonInput';
import PhoneInput from '@/Components/PhoneInput';
import PrimaryButton from '@/Components/PrimaryButton';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        phone: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Register" />

            <div className="mb-6 text-center">
                <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Create Account</h1>
                <p className="text-slate-500 mt-1.5 text-sm">Join {usePage().props.appName} today.</p>
            </div>

            <form onSubmit={submit} className="space-y-4">
                <CommonInput
                    label="Full Name"
                    name="name"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    placeholder="e.g. John Doe"
                    error={errors.name}
                    isFocused={true}
                    required
                />

                <div className="flex flex-col gap-1">
                    <label className="font-bold text-slate-600 ml-0.5 text-xs">
                        Phone Number
                    </label>
                    <PhoneInput
                        value={data.phone}
                        onChange={(val) => setData('phone', val)}
                        error={errors.phone}
                    />
                </div>

                <CommonInput
                    label="Email Address"
                    type="email"
                    name="email"
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                    placeholder="john@example.com"
                    error={errors.email}
                    required
                />

                <div className="flex gap-4">
                    <div className="flex-1">
                        <CommonInput
                            label="Password"
                            type="password"
                            name="password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="••••••••"
                            error={errors.password}
                            required
                        />
                    </div>

                    <div className="flex-1">
                        <CommonInput
                            label="Confirm"
                            type="password"
                            name="password_confirmation"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                    </div>
                </div>

                <div className="pt-2">
                    <PrimaryButton 
                        className="w-full justify-center py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded shadow-lg shadow-green-600/20 uppercase tracking-widest text-xs transition-all duration-200" 
                        disabled={processing}
                    >
                        Create Account
                    </PrimaryButton>
                </div>

                <div className="text-center pt-4 border-t border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Already have an account?{' '}
                        <Link
                            href={route('login')}
                            className="text-green-600 hover:text-green-700 transition-colors ml-1"
                        >
                            Log In
                        </Link>
                    </p>
                </div>
            </form>
        </GuestLayout>
    );
}
