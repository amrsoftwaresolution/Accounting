import { forwardRef, useState, useRef, useEffect, useImperativeHandle } from "react";
import { createPortal } from "react-dom";

const SearchableSelect = forwardRef(function SearchableSelect({
    options = [],
    value,
    onChange,
    placeholder = "Select an option",
    className = "",
    label = "",
    onAddNew = null,
    onSearch = null, // Callback for API-based searching
    initialLimit = null,
    variant = "boxed", // "boxed", "table", "underlined"
    error = null,
    required = false,
    size = "md",
    hideChevron = false,
    tabIndex = 0,
    onKeyDown: externalOnKeyDown,
}, ref) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });
    const [activeIndex, setActiveIndex] = useState(-1);
    const [selectedLabel, setSelectedLabel] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const containerRef = useRef(null);

    useImperativeHandle(ref, () => ({
        focus: () => containerRef.current?.focus(),
        open: () => setIsOpen(true),
    }));
    const dropdownRef = useRef(null);
    const inputRef = useRef(null);

    const filteredOptions = onSearch
    ? searchResults.filter(opt => (opt.label || "").toLowerCase().includes(search.toLowerCase()))
    : options.filter(opt => (opt.label || "").toLowerCase().includes(search.toLowerCase()));

    const displayOptions = (search === "" && initialLimit && !onSearch)
        ? filteredOptions.slice(0, initialLimit)
        : filteredOptions;

    useEffect(() => {
        const selected = options.find(opt => String(opt.value) === String(value));
        if (selected) {
            setSelectedLabel(selected.label);
        } else if (!value) {
            setSelectedLabel("");
        }
    }, [options, value]);

    useEffect(() => {
        if (isOpen) {
            setSearch("");
            setActiveIndex(-1);
            setSearchResults([]);
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [isOpen]);

useEffect(() => {
    if (!onSearch || !isOpen) return;
    const result = onSearch(search);
    if (result && typeof result.then === 'function') {
        result.then(data => setSearchResults(data || []));
    }
}, [search, isOpen]);

    useEffect(() => {
        const updatePosition = () => {
            if (isOpen && containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                setDropdownPos({
                    top: rect.bottom,
                    left: rect.left,
                    width: rect.width
                });
            }
        };

        const handleScroll = () => {
            if (isOpen) {
                requestAnimationFrame(updatePosition);
            }
        };

        updatePosition();
        window.addEventListener('scroll', handleScroll, { passive: true, capture: true });
        window.addEventListener('resize', updatePosition);

        return () => {
            window.removeEventListener('scroll', handleScroll, { passive: true, capture: true });
            window.removeEventListener('resize', updatePosition);
        };
    }, [isOpen]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            const isOutsideContainer = containerRef.current && !containerRef.current.contains(event.target);
            const isOutsideDropdown = dropdownRef.current && !dropdownRef.current.contains(event.target);

            if (isOutsideContainer && isOutsideDropdown) {
                setIsOpen(false);
                setSearch("");
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const restoreFocus = () => {
        requestAnimationFrame(() => containerRef.current?.focus());
    };

    const handleKeyDown = (e) => {
        if (!isOpen) {
            if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
                e.preventDefault();
                e.stopPropagation();
                setIsOpen(true);
            }
            return;
        }

        if (e.key === 'Escape') {
            setIsOpen(false);
            setSearch("");
            restoreFocus();
        } else if (e.key === 'Tab') {
            setIsOpen(false);
            setSearch("");
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            e.stopPropagation();
            setActiveIndex(prev => (prev < displayOptions.length - 1 ? prev + 1 : prev));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            e.stopPropagation();
            setActiveIndex(prev => (prev > 0 ? prev - 1 : prev));
        } else if (e.key === 'Enter' && activeIndex >= 0) {
            e.preventDefault();
            e.stopPropagation();
            const selected = displayOptions[activeIndex];
            onChange(selected.value);
            setIsOpen(false);
            restoreFocus();
        }
    };

    const selectedOption = options.find(opt => String(opt.value) === String(value));
    const displayLabel = selectedOption ? selectedOption.label : (selectedLabel || placeholder);

    const sizeClasses = {
        sm: "h-[30px] text-xs rounded-sm",
        md: "h-[30px] text-xs rounded-sm", // Changed md to match sm as per request for consistency
        lg: "h-[30px] text-xs rounded-sm"  // Changed lg to match sm as per request for consistency
    };

    const getBaseClasses = () => {
        if (variant === "table") {
            return `w-full h-8 bg-transparent border-none focus-within:bg-green-50/30 rounded-none ring-0 text-xs flex items-center`;
        }
        if (variant === "boxed") {
            return `w-full border border-slate-300 bg-white text-slate-900 transition-all focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-500/20 h-[30px] text-xs rounded-sm cursor-pointer flex items-center group overflow-hidden ${error ? 'border-red-300' : ''}`;
        }
        return `w-full border-b border-slate-300 py-1 text-sm bg-transparent outline-none transition-all ${error ? 'border-red-300' : ''}`;
    };

    return (
        <div
            className={`relative w-full outline-none ${variant === 'table' ? 'h-full' : ''}`}
            ref={containerRef}
            tabIndex={tabIndex}
            onKeyDown={(e) => {
                handleKeyDown(e);
                externalOnKeyDown?.(e);
            }}
        >
            {label && (
                <label className="font-bold text-slate-600 ml-0.5 block text-xs mb-1">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}

            <div
                onClick={() => setIsOpen(!isOpen)}
                className={`${getBaseClasses()} ${className}`}
            >
                <div className="flex-1 px-2 truncate flex items-center h-full">
                    <span className={`${selectedOption ? "text-slate-800" : "text-slate-400"}`}>
                        {displayLabel}
                    </span>
                </div>
                {!hideChevron && (
                    <div className={`h-full w-6 flex items-center justify-center transition-colors ${variant === 'table' ? '' : 'border-l border-slate-300 bg-slate-50 group-hover:bg-slate-100'}`}>
                        <svg className={`h-3 w-3 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                )}
            </div>

            {error && (
                <p className="text-xs font-bold text-red-500 items-center flex gap-1 ml-1 mt-1">
                    {error}
                </p>
            )}

            {isOpen && dropdownPos.width > 0 && createPortal(
                <div
                    ref={dropdownRef}
                    style={{
                        position: 'fixed',
                        top: dropdownPos.top,
                        left: dropdownPos.left,
                        width: dropdownPos.width,
                        zIndex: 9999
                    }}
                    className="mt-1 bg-white border border-slate-300 rounded-sm shadow-xl overflow-hidden"
                >
                    <div className="p-1.5 border-b border-slate-100 bg-slate-50">
                        <input
                            type="text"
                            ref={inputRef}
                            placeholder="Search..."
                            className="w-full px-2 py-1 text-xs border border-slate-300 rounded-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all h-7"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => {
                            e.stopPropagation(); // stop it bubbling to the container
                            handleKeyDown(e);
                            }}
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                    <div className="max-h-48 overflow-y-auto custom-scrollbar">
                        {onAddNew && (
                            <div
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => {
                                    onAddNew();
                                    setIsOpen(false);
                                    restoreFocus();
                                }}
                                className="px-3 py-1.5 text-xs text-primary-600 font-bold border-b border-slate-100 hover:bg-primary-50 cursor-pointer flex items-center gap-2"
                            >
                                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                                Add New
                            </div>
                        )}
                        {displayOptions.length > 0 ? (
                            displayOptions.map((opt, idx) => (
                                <div
                                    key={opt.value}
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => {
                                        onChange(opt.value);
                                        setIsOpen(false);
                                        setSearch("");
                                        restoreFocus();
                                    }}
                                    className={`px-3 py-1.5 text-xs cursor-pointer  flex justify-between items-center ${idx === activeIndex ? 'bg-slate-100' : ''
                                        } ${String(opt.value) === String(value) ? 'bg-green-50 text-green-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
                                        }`}
                                >
                                    <span>{opt.label}</span>
                                    {opt.type && (
                                        <span className="text-2xs text-slate-400 italic font-medium ml-4">
                                            {opt.type}
                                        </span>
                                    )}
                                    {opt.balance !== undefined && (
                                        <span className="text-2xs text-slate-400 font-mono">
                                            LKR {parseFloat(opt.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </span>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="px-3 py-3 text-xs text-slate-400 text-center italic">
                                No results found
                            </div>
                        )}
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
});

export default SearchableSelect;
