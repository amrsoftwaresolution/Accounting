import { useState } from "react";
import { useForm } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

export default function EmployeeForm() {
    const { data, setData, post, processing, errors } = useForm({
        name: "",
        email: "",
        designation: "",
        salary: "",
        join_date: "",
        role: "user",
    });

    const submit = (e) => {
        e.preventDefault();
        post(route("employees.store"));
    };

    return (
        <AuthenticatedLayout header="New Employee">
            <div className="max-w-2xl mx-auto py-10 px-6">
                <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                    <div className="p-8 border-b border-slate-100">
                        <h2 className="text-xl font-bold text-slate-800">Employee Details</h2>
                        <p className="text-sm text-slate-500 mt-1">Register a new staff member and create their login account.</p>
                    </div>
                    
                    <form onSubmit={submit} className="p-8 space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="col-span-2">
                                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-2">Full Name *</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-1 focus:ring-[#00713D] focus:border-[#00713D] outline-none transition-all"
                                    value={data.name}
                                    onChange={(e) => setData("name", e.target.value)}
                                />
                                {errors.name && <p className="text-red-500 text-xs mt-1 font-bold">{errors.name}</p>}
                            </div>

                            <div className="col-span-2">
                                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-2">Email Address *</label>
                                <input
                                    type="email"
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-1 focus:ring-[#00713D] focus:border-[#00713D] outline-none transition-all"
                                    value={data.email}
                                    onChange={(e) => setData("email", e.target.value)}
                                />
                                {errors.email && <p className="text-red-500 text-xs mt-1 font-bold">{errors.email}</p>}
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-2">Designation *</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-1 focus:ring-[#00713D] focus:border-[#00713D] outline-none transition-all"
                                    value={data.designation}
                                    onChange={(e) => setData("designation", e.target.value)}
                                />
                                {errors.designation && <p className="text-red-500 text-xs mt-1 font-bold">{errors.designation}</p>}
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-2">Monthly Salary</label>
                                <input
                                    type="number"
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-1 focus:ring-[#00713D] focus:border-[#00713D] outline-none transition-all"
                                    value={data.salary}
                                    onChange={(e) => setData("salary", e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-2">Join Date</label>
                                <input
                                    type="date"
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-1 focus:ring-[#00713D] focus:border-[#00713D] outline-none transition-all"
                                    value={data.join_date}
                                    onChange={(e) => setData("join_date", e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-2">System Role</label>
                                <select
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-1 focus:ring-[#00713D] focus:border-[#00713D] outline-none transition-all bg-white"
                                    value={data.role}
                                    onChange={(e) => setData("role", e.target.value)}
                                >
                                    <option value="user">Standard User</option>
                                    <option value="manager">Manager</option>
                                    <option value="admin">Administrator</option>
                                </select>
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
                                {processing ? "Saving..." : "Create Employee"}
                            </button>
                        </div>
                        
                        <p className="text-center text-[10px] text-slate-400 font-medium">
                            Note: A user account will be automatically created with the default password "password123".
                        </p>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
