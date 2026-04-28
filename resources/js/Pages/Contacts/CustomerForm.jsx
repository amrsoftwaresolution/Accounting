import { useState } from "react";
import { useForm } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

export default function CustomerForm() {
    const { data, setData, post, processing, errors } = useForm({
        display_name: "",
        first_name: "",
        last_name: "",
        company_name: "",
        email: "",
        phone_number: "",
    });

    const submit = (e) => {
        e.preventDefault();
        post(route("customers.store"));
    };

    return (
        <AuthenticatedLayout header="New Customer">
            <div className="max-w-2xl mx-auto py-10 px-6">
                <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                    <div className="p-8 border-b border-slate-100">
                        <h2 className="text-xl font-bold text-slate-800">Customer Details</h2>
                        <p className="text-sm text-slate-500 mt-1">Add a new customer to your contact list.</p>
                    </div>
                    
                    <form onSubmit={submit} className="p-8 space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="col-span-2">
                                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-2">Display Name *</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-1 focus:ring-[#00713D] focus:border-[#00713D] outline-none transition-all"
                                    value={data.display_name}
                                    onChange={(e) => setData("display_name", e.target.value)}
                                    placeholder="e.g. John Doe"
                                />
                                {errors.display_name && <p className="text-red-500 text-xs mt-1 font-bold">{errors.display_name}</p>}
                            </div>
                            
                            <div>
                                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-2">First Name</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-1 focus:ring-[#00713D] focus:border-[#00713D] outline-none transition-all"
                                    value={data.first_name}
                                    onChange={(e) => setData("first_name", e.target.value)}
                                />
                            </div>
                            
                            <div>
                                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-2">Last Name</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-1 focus:ring-[#00713D] focus:border-[#00713D] outline-none transition-all"
                                    value={data.last_name}
                                    onChange={(e) => setData("last_name", e.target.value)}
                                />
                            </div>

                            <div className="col-span-2">
                                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-2">Company Name</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-1 focus:ring-[#00713D] focus:border-[#00713D] outline-none transition-all"
                                    value={data.company_name}
                                    onChange={(e) => setData("company_name", e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-2">Email</label>
                                <input
                                    type="email"
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-1 focus:ring-[#00713D] focus:border-[#00713D] outline-none transition-all"
                                    value={data.email}
                                    onChange={(e) => setData("email", e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-2">Phone</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-1 focus:ring-[#00713D] focus:border-[#00713D] outline-none transition-all"
                                    value={data.phone_number}
                                    onChange={(e) => setData("phone_number", e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="pt-6 border-t border-slate-100 flex justify-end gap-4">
                            <button
                                type="button"
                                onClick={() => window.history.back()}
                                className="px-6 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-800 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-8 py-2.5 bg-[#00713D] text-white font-bold rounded-xl hover:bg-[#005a30] transition-all shadow-lg shadow-[#00713D]/20 disabled:opacity-50"
                            >
                                {processing ? "Saving..." : "Create Customer"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
