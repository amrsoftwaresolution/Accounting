import { Head, Link, usePage } from '@inertiajs/react';
import LandingLayout from '@/Layouts/LandingLayout';

export default function Welcome({ auth, laravelVersion, phpVersion }) {
    return (
        <LandingLayout>
            <Head title="Modern Business Growth Platform" />

            {/* Hero Section */}
            <section className="relative overflow-hidden pt-20 pb-32 lg:pt-32 lg:pb-48">
                {/* Decorative Background Elements */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 overflow-hidden">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-100/50 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-100/50 rounded-full blur-[120px]" />
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <span className="px-4 py-1.5 bg-[#00713D]/10 text-[#00713D] text-xs font-bold rounded-full uppercase tracking-widest mb-6 inline-block">
                        New: Enterprise Support Active</span>

                    <h1 className="text-5xl lg:text-7xl font-black text-slate-900 tracking-tight leading-[1.1] mb-8 animate-fade-in-up transition-delay-100">
                        Grow Your Business <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00713D] to-indigo-600">With Absolute Precision.</span>
                    </h1>

                    <p className="max-w-2xl mx-auto text-lg lg:text-xl text-slate-600 leading-relaxed mb-12 animate-fade-in-up transition-delay-200">
                        {usePage().props.appName} simplifies your complex business operations. From high-speed accounting to seamless inventory management, everything you need is in one place.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up transition-delay-300">
                        <Link
                            href={route('register')}
                            className="w-full sm:w-auto px-8 py-4 bg-[#00713D] text-white font-bold rounded-2xl hover:bg-[#005a30] transition-all hover:-translate-y-1 shadow-lg shadow-[#00713D]/25"
                        >
                            Start Growing Now
                        </Link>
                        <a
                            href={route('welcome') + '#features'}
                            className="w-full sm:w-auto px-8 py-4 bg-white text-slate-900 font-bold rounded-2xl border border-slate-200 hover:bg-slate-50 transition-all hover:-translate-y-1"
                        >
                            See Features
                        </a>
                    </div>

                    {/* Dashboard Preview Mockup */}
                    <div className="mt-20 relative animate-fade-in-up transition-delay-400">
                        <div className="relative mx-auto max-w-5xl rounded-2xl border border-slate-200 bg-white/50 backdrop-blur-sm p-2 shadow-[0_0_100px_rgba(0,113,61,0.1)]">
                            <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50 aspect-[16/9] flex items-center justify-center">
                                {/* Simplified UI Representation */}
                                <div className="w-full h-full p-8 grid grid-cols-12 gap-6 opacity-40">
                                    <div className="col-span-3 space-y-4">
                                        <div className="h-8 bg-slate-200 rounded-lg w-3/4" />
                                        <div className="h-4 bg-slate-200 rounded-lg w-full" />
                                        <div className="h-4 bg-slate-200 rounded-lg w-5/6" />
                                        <div className="pt-8 space-y-4">
                                            <div className="h-10 bg-[#00713D]/20 rounded-lg w-full" />
                                            <div className="h-10 bg-slate-200 rounded-lg w-full" />
                                            <div className="h-10 bg-slate-200 rounded-lg w-full" />
                                        </div>
                                    </div>
                                    <div className="col-span-9 space-y-6">
                                        <div className="grid grid-cols-3 gap-6">
                                            <div className="h-32 bg-white rounded-xl shadow-sm" />
                                            <div className="h-32 bg-white rounded-xl shadow-sm" />
                                            <div className="h-32 bg-white rounded-xl shadow-sm" />
                                        </div>
                                        <div className="h-64 bg-white rounded-xl shadow-sm w-full" />
                                    </div>
                                </div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="px-6 py-3 rounded-full bg-white shadow-xl border border-slate-100 flex items-center gap-3 animate-bounce">
                                        <div className="p-1.5 rounded-lg bg-[#00713D]">
                                            <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                                        </div>
                                        <span className="text-sm font-bold text-slate-800">Smart Automation Enabled</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-32 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-20">
                        <h2 className="text-sm font-black text-[#00713D] uppercase tracking-[0.3em] mb-4">Core Modules</h2>
                        <h3 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">Everything You Need to Scale</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <FeatureCard
                            icon="accounting"
                            title="Finance & Books"
                            description="Real-time ledger tracking, journals, and automated invoicing with multi-currency support."
                            color="green"
                        />
                        <FeatureCard
                            icon="inventory"
                            title="Inventory Control"
                            description="Monitor warehouses, track suppliers, and manage stock levels with precision alerts."
                            color="green"
                        />
                        <FeatureCard
                            icon="team"
                            title="Team Management"
                            description="Organize your workforce, assign roles, and track performance across departments."
                            color="green"
                        />
                        <FeatureCard
                            icon="analytics"
                            title="Business Insights"
                            description="Comprehensive dashboards and reports that give you a bird's eye view of your growth."
                            color="green"
                        />
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-24 bg-slate-50 border-y border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
                        <StatItem value="10k+" label="Active Users" />
                        <div className="hidden md:block w-px h-12 bg-slate-200 self-center" />
                        <StatItem value="$500M+" label="Transaction Volume" />
                        <div className="hidden md:block w-px h-12 bg-slate-200 self-center" />
                        <StatItem value="99.9%" label="Server Uptime" />
                        <div className="hidden md:block w-px h-12 bg-slate-200 self-center" />
                        <StatItem value="24/7" label="Global Support" />
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-32 overflow-hidden relative">
                <div className="absolute inset-0 bg-[#00713D] -z-10" />
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[600px] h-[600px] bg-green-500 rounded-full blur-[120px] opacity-50" />

                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
                    <h2 className="text-4xl lg:text-6xl font-black mb-8 leading-tight">Ready to take your business to the next level?</h2>
                    <p className="text-xl text-green-100 mb-12">Join thousands of businesses that trust {usePage().props.appName} for their daily operations.</p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                        <Link
                            href={route('register')}
                            className="w-full sm:w-auto px-10 py-5 bg-white text-[#00713D] font-bold rounded-2xl hover:bg-slate-50 transition-all shadow-2xl shadow-[#00713D]/20 hover:-translate-y-1"
                        >
                            Create Free Account
                        </Link>
                        <Link
                            href={route('login')}
                            className="w-full sm:w-auto px-10 py-5 bg-[#005a30] text-white font-bold rounded-2xl border border-green-500/50 hover:bg-[#004a27] transition-all hover:-translate-y-1"
                        >
                            Schedule a Demo
                        </Link>
                    </div>
                </div>
            </section>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                .transition-delay-100 { animation-delay: 0.1s; opacity: 0; }
                .transition-delay-200 { animation-delay: 0.2s; opacity: 0; }
                .transition-delay-300 { animation-delay: 0.3s; opacity: 0; }
                .transition-delay-400 { animation-delay: 0.4s; opacity: 0; }
            ` }} />
        </LandingLayout>
    );
}

function FeatureCard({ icon, title, description, color }) {
    return (
        <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:border-[#00713D]/20 hover:bg-white transition-all duration-500 group hover:-translate-y-2 hover:shadow-2xl hover:shadow-[#00713D]/5">
            <div className="w-12 h-12 bg-[#00713D]/10 rounded-2xl flex items-center justify-center text-[#00713D] mb-6 group-hover:scale-110 transition-transform duration-500">
                <FeatureIcon name={icon} />
            </div>
            <h4 className="text-xl font-bold text-slate-900 mb-4">{title}</h4>
            <p className="text-slate-600 leading-relaxed text-sm">{description}</p>
        </div>
    );
}

function FeatureIcon({ name }) {
    switch (name) {
        case 'accounting':
            return <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
        case 'inventory':
            return <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>;
        case 'team':
            return <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
        case 'analytics':
            return <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>;
        default:
            return null;
    }
}

function StatItem({ value, label }) {
    return (
        <div className="text-center group">
            <div className="text-3xl lg:text-5xl font-black text-slate-900 mb-2 group-hover:text-primary-600 transition-colors">{value}</div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">{label}</div>
        </div>
    );
}
