import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import SearchableSelect from '@/Components/SearchableSelect';

export default function CategoryForm({ category, parents }) {
    const { data, setData, post, put, processing, errors } = useForm({
        name: category?.name || '',
        parent_id: category?.parent_id || '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (category) {
            put(route('item-categories.update', category.id));
        } else {
            post(route('item-categories.store'));
        }
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
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
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
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-8 py-3 bg-[#00713D] text-white rounded-xl text-xs font-bold hover:bg-[#005a30] transition-all shadow-md shadow-green-900/10 disabled:opacity-50 uppercase tracking-widest"
                        >
                            {processing ? 'Saving...' : category ? 'Update Category' : 'Create Category'}
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
