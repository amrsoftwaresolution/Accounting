export function finalizeQuickAccessSave({
    action,
    markClean,
    resetForm,
    clearErrors,
    onNew,
}) {
    if (typeof markClean === 'function') {
        markClean();
    }

    if (action === 'new') {
        if (typeof onNew === 'function') {
            onNew();
            return;
        }

        if (typeof resetForm === 'function') {
            resetForm();
        }

        if (typeof clearErrors === 'function') {
            clearErrors();
        }

        return;
    }

    if (typeof clearErrors === 'function') {
        clearErrors();
    }
}
