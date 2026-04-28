import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import PhoneInput from '@/Components/PhoneInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

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
                <p className="text-slate-500 mt-1.5 text-sm">Join JobAlign Book today.</p>
            </div>

            <form onSubmit={submit} className="space-y-4">
                <div>
                    <InputLabel htmlFor="name" value="Full Name" className="text-slate-700 font-medium mb-1.5" />

                    <TextInput
                        id="name"
                        name="name"
                        value={data.name}
                        className="mt-1 block w-full rounded-xl border-slate-200 focus:border-[#00713D] focus:ring-[#00713D] transition-all duration-200"
                        autoComplete="name"
                        isFocused={true}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                        placeholder="e.g. John Doe"
                    />

                    <InputError message={errors.name} className="mt-2" />
                </div>


                <div>
                    <InputLabel htmlFor="phone" value="Phone Number" className="text-slate-700 font-medium mb-1" />
                    <PhoneInput
                        value={data.phone}
                        onChange={(val) => setData('phone', val)}
                        error={errors.phone}
                        className="mt-0.5"
                    />
                </div>

                <div>
                    <InputLabel htmlFor="email" value="Email Address" className="text-slate-700 font-medium mb-1" />

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-0.5 block w-full rounded-xl border-slate-200 focus:border-[#00713D] focus:ring-[#00713D] transition-all duration-200"
                        autoComplete="username"
                        onChange={(e) => setData('email', e.target.value)}
                        required
                        placeholder="john@example.com"
                    />

                    <InputError message={errors.email} className="mt-1" />
                </div>

                <div className="flex gap-4">
                    <div className="flex-1">
                        <InputLabel htmlFor="password" value="Password" className="text-slate-700 font-medium mb-1" />
                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            className="mt-0.5 block w-full rounded-xl border-slate-200 focus:border-[#00713D] focus:ring-[#00713D] transition-all duration-200"
                            autoComplete="new-password"
                            onChange={(e) => setData('password', e.target.value)}
                            required
                            placeholder="••••••••"
                        />
                        <InputError message={errors.password} className="mt-1" />
                    </div>

                    <div className="flex-1">
                        <InputLabel
                            htmlFor="password_confirmation"
                            value="Confirm"
                            className="text-slate-700 font-medium mb-1"
                        />
                        <TextInput
                            id="password_confirmation"
                            type="password"
                            name="password_confirmation"
                            value={data.password_confirmation}
                            className="mt-0.5 block w-full rounded-xl border-slate-200 focus:border-[#00713D] focus:ring-[#00713D] transition-all duration-200"
                            autoComplete="new-password"
                            onChange={(e) =>
                                setData('password_confirmation', e.target.value)
                            }
                            required
                            placeholder="••••••••"
                        />
                    </div>
                </div>

                <div className="pt-2">
                    <PrimaryButton 
                        className="w-full justify-center py-3 bg-[#00713D] hover:bg-[#005a30] text-white font-semibold rounded-xl transition-all duration-200 shadow-md shadow-[#00713D]/20" 
                        disabled={processing}
                    >
                        Create Account
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
