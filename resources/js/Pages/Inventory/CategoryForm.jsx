import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import SearchableSelect from '@/Components/SearchableSelect';
import SplitSaveButton from '@/Components/SplitSaveButton'; // 1. Import your custom button

export default function CategoryForm({ category, parents }) {
    // FIXED: Added "reset" helper destructured from Inertia's useForm hook
    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: category?.name || '',
        parent_id: category?.parent_id || '',
    });

    // 2. Main submit handler (Standard Save)
    const handleSubmit = (e) => {
        if (e) e.preventDefault();

        if (category) {
            put(route('item-categories.update', category.id));
        } else {
            post(route('item-categories.store'));
        }
    };

    // 3. Handle Save and New (FIXED: Submits, then clears input fields automatically)
    const handleSaveAndNew = () => {
        post(route('item-categories.store'), {
            onSuccess: () => {
                reset(); // This clears the input fields back to empty immediately after a successful save!
            }
        });
    };

    // 4. Handle Save and Close
    const handleSaveAndClose = () => {
        post(route('item-categories.store'));
    };

    return (
        <AuthenticatedLayout
            header={category ? 'Edit Category' : 'Add Category'}
        >
            <Head title={category ? 'Edit Category' : 'Add Category'} />

            <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto">
                <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                    <div className="space-y-6">
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest border-b pb-2">Category Details</h3>

                        <div>
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Category Name</label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={e => setData('name', e.target.value)}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                                placeholder="e.g. Services, Hardware, Software"
                            />
                            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Parent Category (Optional)</label>
                            <SearchableSelect
                                options={parents.map(p => ({ value: p.id, label: p.name }))}
                                value={data.parent_id}
                                onChange={val => setData('parent_id', val)}
                                placeholder="Select parent category"
                            />
                            <p className="mt-2 text-[10px] text-slate-400">Use this to create sub-categories (e.g. 'Web Design' under 'Services').</p>
                            {errors.parent_id && <p className="mt-1 text-xs text-red-600">{errors.parent_id}</p>}
                        </div>
                    </div>

                    <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                        <Link
                            href={route('item-categories.index')}
                            className="px-6 py-2.5 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest"
                        >
                            Cancel
                        </Link>

                        {/* 5. Kept your custom SplitSaveButton setup */}
                        <SplitSaveButton
                            onSave={handleSubmit}
                            onSaveAndNew={handleSaveAndNew}
                            onSaveAndClose={handleSaveAndClose}
                            processing={processing}
                        />
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}