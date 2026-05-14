import { useForm, Head } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import CommonInput from "@/Components/CommonInput";
import CommonButton from "@/Components/CommonButton";

export default function EmployeeForm() {
    const { data, setData, post, processing, errors } = useForm({
        name: "",
        email: "",
        designation: "",
        salary: "",
        join_date: "",
    });

    const submit = (e) => {
        e.preventDefault();
        post(route("employees.store"));
    };

    return (
        <AuthenticatedLayout>
            <Head title="New Employee" />
            <div className="max-w-2xl mx-auto py-10 px-6">
                <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
                    <div className="p-8 border-b border-slate-100 bg-slate-50/50">
                        <h2 className="text-xl font-black text-slate-900 tracking-tight">New Employee</h2>
                        <p className="text-sm text-slate-500 mt-1 font-medium">Register a new employee and create their system account.</p>
                    </div>
                    
                    <form onSubmit={submit} className="p-8 space-y-6">
                        <CommonInput 
                            label="Full Name" 
                            value={data.name} 
                            onChange={e => setData('name', e.target.value)} 
                            required
                            error={errors.name}
                            placeholder="e.g. John Doe"
                        />
                        <CommonInput 
                            label="Email Address" 
                            type="email"
                            value={data.email} 
                            onChange={e => setData('email', e.target.value)} 
                            required
                            error={errors.email}
                            placeholder="john@example.com"
                        />
                        <CommonInput 
                            label="Designation" 
                            value={data.designation} 
                            onChange={e => setData('designation', e.target.value)} 
                            required
                            error={errors.designation}
                            placeholder="e.g. Software Engineer"
                        />
                        <div className="grid grid-cols-2 gap-6">
                            <CommonInput 
                                label="Salary" 
                                type="number"
                                value={data.salary} 
                                onChange={e => setData('salary', e.target.value)} 
                                error={errors.salary}
                                placeholder="0.00"
                            />
                            <CommonInput 
                                label="Join Date" 
                                type="date"
                                value={data.join_date} 
                                onChange={e => setData('join_date', e.target.value)} 
                                error={errors.join_date}
                            />
                        </div>
                        

                        <div className="pt-6 border-t border-slate-100 flex justify-end gap-4">
                            <button
                                type="button"
                                onClick={() => window.history.back()}
                                className="px-6 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-800 transition-colors"
                            >
                                Cancel
                            </button>
                            <CommonButton
                                variant="primary"
                                type="submit"
                                processing={processing}
                            >
                                {processing ? "Saving..." : "Save Employee"}
                            </CommonButton>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
