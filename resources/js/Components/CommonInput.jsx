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
        icon,
        size = 'md', // 'sm', 'md', 'lg'
        variant = 'boxed', // 'boxed', 'table', 'underlined'
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

    const sizeClasses = {
        sm: "px-2 py-1 text-2xs rounded",
        md: "px-3 py-2 text-sm rounded-md",
        lg: "px-4 py-3 text-base rounded-lg"
    };

    const variantClasses = {
        boxed: "border border-slate-300 bg-white focus:border-green-500 focus:ring-1 focus:ring-green-500/20 shadow-sm",
        table: "border-none bg-transparent focus:bg-green-50/30 focus:ring-0 rounded-none h-8 px-2 py-0 text-[9px]",
        underlined: "border-b border-slate-300 bg-transparent focus:border-green-500 focus:ring-0 rounded-none px-0"
    };

    const baseInputClasses = `w-full text-slate-900 transition-all placeholder:text-slate-400 ${variant !== 'table' ? sizeClasses[size] : ''} ${variantClasses[variant]}`;
    const errorClasses = error ? "border-red-300 focus:border-red-500 focus:ring-red-500/10" : "";

    const handleContainerClick = () => {
        if (type === 'date' && inputRef.current) {
            try {
                inputRef.current.showPicker();
            } catch (e) {
                inputRef.current.focus();
            }
        }
    };

    const renderIcon = () => {
        if (type === 'date') {
            return (
                <div className={`absolute ${size === 'sm' || variant === 'table' ? 'right-1.5' : 'right-3'} top-1/2 -translate-y-1/2 pointer-events-none text-slate-400`}>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                </div>
            );
        }
        if (icon) {
            return (
                <div className={`absolute ${size === 'sm' || variant === 'table' ? 'right-1.5' : 'right-3'} top-1/2 -translate-y-1/2 pointer-events-none text-slate-400`}>
                    {icon}
                </div>
            );
        }
        return null;
    };

    return (
        <div 
            className={`flex flex-col gap-0.5 ${containerClass} ${variant === 'table' ? 'h-full' : ''}`}
            onClick={handleContainerClick}
        >
            {label && (
                <label className={`font-bold text-slate-600 ml-0.5 ${size === 'sm' ? 'text-2xs mb-0' : 'text-sm mb-0.5'}`}>
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}

            <div className={`relative ${variant === 'table' ? 'h-full' : ''}`}>
                {type === 'textarea' ? (
                    <textarea
                        {...props}
                        ref={inputRef}
                        className={`${baseInputClasses} ${errorClasses} min-h-[80px] py-2 ${className}`}
                    />
                ) : (
                    <input
                        {...props}
                        type={type}
                        ref={inputRef}
                        className={`${baseInputClasses} ${errorClasses} ${className} ${(type === 'date' || icon) ? 'pr-8' : ''}`}
                    />
                )}
                {renderIcon()}
            </div>

            {error && (
                <p className="text-[8px] font-bold text-red-500 items-center flex gap-1 ml-1 mt-0.5">
                    {error}
                </p>
            )}
        </div>
    );
});
