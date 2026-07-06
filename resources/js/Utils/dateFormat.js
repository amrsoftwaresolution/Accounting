import { usePage } from '@inertiajs/react';

const DEFAULT_DATE_FORMAT = 'MM/DD/YYYY';

export function useDateFormat() {
    const { settings } = usePage().props;
    return settings?.date_format || DEFAULT_DATE_FORMAT;
}

export function formatDate(value, format = null) {
    if (!value) return '';

    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) {
        return '';
    }

    const resolvedFormat = format || DEFAULT_DATE_FORMAT;
    const normalizedFormat = String(resolvedFormat).toLowerCase();

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    if (normalizedFormat.includes('yyyy')) {
        return `${year}-${month}-${day}`;
    }

    if (normalizedFormat.includes('dd/mm')) {
        return `${day}/${month}/${year}`;
    }

    if (normalizedFormat.includes('dd-mm')) {
        return `${day}-${month}-${year}`;
    }

    if (normalizedFormat.includes('mm/dd')) {
        return `${month}/${day}/${year}`;
    }

    if (normalizedFormat.includes('mm-dd')) {
        return `${month}-${day}-${year}`;
    }

    return `${month}/${day}/${year}`;
}
