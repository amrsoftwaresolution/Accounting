import axios from 'axios';
import { router } from '@inertiajs/react';

export default function useModalSession(modalName) {
    const open = async () => {
        try {
            await axios.post(route('api.session.modal_last_url'), {
                modalName,
                url: window.location.pathname + window.location.search
            });
        } catch (e) {
            // ignore
        }
    };

    const close = async (onCloseCallback) => {
        try {
            // Call parent onClose if provided
            if (typeof onCloseCallback === 'function') {
                onCloseCallback();
            }
        } finally {
            // Refresh underlying data so lists update
            router.reload({ preserveScroll: true });
        }
    };

    return { open, close };
}
