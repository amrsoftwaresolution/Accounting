import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import SlideOver from './SlideOver';
import CommonInput from './CommonInput';
import CommonButton from './CommonButton';
import SearchableSelect from './SearchableSelect';

export default function ItemCategorySidePanel({
    isOpen,
    onClose,
    category = null,
    parents = [],
    onSuccess = null
}) {
    const isEdit = !!category;

    const { data, setData, post, patch, processing, errors, reset, clearErrors } = useForm({
        name: '',
        parent_id: '',
    });

    const handleClose = () => {
        reset();
        clearErrors();
        onClose();
    };

    useEffect(() => {
        if (isOpen) {
            if (category) {
                setData({
                    name: category.name || '',
                    parent_id: category.parent_id || '',
                });
            } else {
                reset();
                clearErrors();
            }
        }
    }, [isOpen, category]);

    const submit = (e) => {
        e.preventDefault();
        const options = {
            onSuccess: (page) => {
                handleClose();
                if (onSuccess) onSuccess(page);
            },
        };

        if (isEdit) {
            patch(route('item-categories.update', category.id), options);
        } else {
            post(route('item-categories.store'), options);
        }
    };

    return (
        <SlideOver
            isOpen={isOpen}
            onClose={handleClose}
            title={isEdit ? "Edit Category" : "New Category"}
        >
            <form onSubmit={submit} className="space-y-6">
                <CommonInput
                    label="Category Name"
                    value={data.name}
                    onChange={e => setData('name', e.target.value)}
                    error={errors.name}
                    required
                />

                <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Parent Category</label>
                    <SearchableSelect
                        options={parents.map(p => ({ value: p.id, label: p.name }))}
                        value={data.parent_id}
                        onChange={val => setData('parent_id', val)}
                        placeholder="None (Top Level)"
                    />
                    {errors.parent_id && <p className="mt-1 text-xs text-red-600">{errors.parent_id}</p>}
                </div>

                <div className="pt-6 flex items-center justify-end gap-3 border-t border-slate-100">
                    <CommonButton variant="ghost" onClick={handleClose} type="button">Cancel</CommonButton>
                    <CommonButton variant="primary" type="submit" processing={processing}>
                        {isEdit ? "Update Category" : "Save Category"}
                    </CommonButton>
                </div>
            </form>
        </SlideOver>
    );
}
