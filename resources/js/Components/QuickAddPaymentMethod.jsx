import { useForm } from '@inertiajs/react';
import SlideOver from './SlideOver';
import CommonInput from './CommonInput';
import CommonButton from './CommonButton';

export default function QuickAddPaymentMethod({ isOpen, onClose, onSuccess }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: "",
        is_active: true
    });

    const submit = (e) => {
        e.preventDefault();
        post(route("payment-methods.store"), {
            onSuccess: (page) => {
                const newMethod = page.props.flash?.new_payment_method;
                onSuccess && onSuccess(newMethod);
                onClose();
                reset();
            },
        });
    };

    return (
        <SlideOver
            isOpen={isOpen}
            onClose={onClose}
            title="Add ReceivePayment Method"
        >
            <form onSubmit={submit} className="space-y-6">
                <CommonInput
                    label="ReceivePayment Method Name"
                    placeholder="e.g. Cash, Credit Card, Bank Transfer"
                    value={data.name}
                    onChange={(e) => setData("name", e.target.value)}
                    error={errors.name}
                    required
                />

                <div className="sticky bottom-0 bg-white pt-6 flex items-center justify-end gap-3 border-t border-slate-100">
                    <CommonButton variant="ghost" onClick={onClose} size="sm">Cancel</CommonButton>
                    <CommonButton type="submit" variant="primary" processing={processing} size="sm">
                        Save Method
                    </CommonButton>
                </div>
            </form>
        </SlideOver>
    );
}
