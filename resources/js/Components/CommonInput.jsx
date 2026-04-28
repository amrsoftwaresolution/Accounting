import { forwardRef, useEffect, useRef } from 'react';

/**
 * A highly reusable, premium input component for JobAlign Book.
 * Supports different input types, selects, and textareas with a consistent design.
 */
export default forwardRef(function CommonInput(
    { 
        type = 'text', 
        label, 
        error, 
        className = '', 
        isFocused = false, 
        containerClass = '',
        options = [], // for select type
        required = false,
        ...props 
    },
    ref
) {
    const inputRef = useRef(null);

    useEffect(() => {
        if (isFocused) {
            inputRef.current?.focus();
        }
    }, [isFocused]);

    const baseInputClasses = "w-full rounded-xl border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 placeholder:text-slate-400";
    const errorClasses = error ? "border-red-300 focus:border-red-500 focus:ring-red-500/10" : "";

    return (
        <div className={`flex flex-col gap-1.5 ${containerClass}`}>
            {label && (
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}

            {type === 'select' ? (
                <select
                    {...props}
                    ref={inputRef}
                    className={`${baseInputClasses} ${errorClasses} ${className} appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%2364748b%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_0.5rem_center] bg-no-repeat pr-10`}
                >
                    <option value="">Select an option</option>
                    {options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
            ) : type === 'textarea' ? (
                <textarea
                    {...props}
                    ref={inputRef}
                    className={`${baseInputClasses} ${errorClasses} min-h-[100px] py-3 ${className}`}
                />
            ) : (
                <input
                    {...props}
                    type={type}
                    ref={inputRef}
                    className={`${baseInputClasses} ${errorClasses} ${className}`}
                />
            )}

            {error && (
                <p className="text-[10px] font-bold text-red-500 items-center flex gap-1 ml-1 mt-0.5">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {error}
                </p>
            )}
        </div>
    );
});
