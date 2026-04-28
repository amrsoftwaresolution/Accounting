import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

export default function SearchableSelect({ 
    options = [], 
    value, 
    onChange, 
    placeholder = "Select an option",
    className = "",
    label = "",
    onAddNew = null,
    initialLimit = null
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });
    const containerRef = useRef(null);

    const filteredOptions = options.filter(opt => 
        (opt.label || "").toLowerCase().includes(search.toLowerCase())
    );

    const displayOptions = (search === "" && initialLimit) 
        ? filteredOptions.slice(0, initialLimit) 
        : filteredOptions;

    const dropdownRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            setSearch(""); // Ensure search is clear when opening
        }
    }, [isOpen]);

    useEffect(() => {
        const updatePosition = () => {
            if (isOpen && containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                setDropdownPos({
                    top: rect.bottom + window.scrollY,
                    left: rect.left + window.scrollX,
                    width: rect.width
                });
            }
        };

        updatePosition();
        window.addEventListener('scroll', updatePosition);
        window.addEventListener('resize', updatePosition);
        
        return () => {
            window.removeEventListener('scroll', updatePosition);
            window.removeEventListener('resize', updatePosition);
        };
    }, [isOpen]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            // Check if click is outside BOTH the container and the portal dropdown
            const isOutsideContainer = containerRef.current && !containerRef.current.contains(event.target);
            const isOutsideDropdown = dropdownRef.current && !dropdownRef.current.contains(event.target);
            
            if (isOutsideContainer && isOutsideDropdown) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Use loose equality for value comparison to handle potential string/number mismatches
    const selectedOption = options.find(opt => String(opt.value) === String(value));

    const isBoxed = className.includes('border');
    const baseClasses = isBoxed 
        ? className 
        : `w-full border-b border-gray-300 py-1 ${className}`;

    return (
        <div className="relative w-full" ref={containerRef}>
            {label && <label className="text-xs text-gray-500 block mb-1">{label}</label>}
            <div 
                onClick={() => setIsOpen(!isOpen)}
                className={`${baseClasses} text-sm bg-transparent outline-none cursor-pointer flex justify-between items-center group transition-all`}
            >
                <span className={`truncate ${selectedOption ? "text-slate-800" : "text-gray-400 italic"}`}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <svg className={`h-4 w-4 text-gray-400 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
            </div>

            {isOpen && dropdownPos.width > 0 && createPortal(
                <div 
                    ref={dropdownRef}
                    style={{ 
                        position: 'fixed', // Use fixed for portal to body
                        top: dropdownPos.top - window.scrollY, 
                        left: dropdownPos.left - window.scrollX, 
                        width: dropdownPos.width,
                        zIndex: 9999 
                    }}
                    className="mt-1 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
                >
                    <div className="p-2 border-b border-slate-100 bg-slate-50">
                        <input
                            type="text"
                            autoFocus
                            placeholder="Search..."
                            className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                        {onAddNew && (
                            <div 
                                onClick={() => {
                                    onAddNew();
                                    setIsOpen(false);
                                }}
                                className="px-4 py-2 text-sm text-primary font-bold border-b border-slate-100 hover:bg-primary/5 cursor-pointer flex items-center gap-2"
                            >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                                Add New
                            </div>
                        )}
                        {displayOptions.length > 0 ? (
                            displayOptions.map((opt) => (
                                <div
                                    key={opt.value}
                                    onClick={() => {
                                        onChange(opt.value);
                                        setIsOpen(false);
                                        setSearch("");
                                    }}
                                    className={`px-4 py-2 text-sm cursor-pointer hover:bg-primary/5 transition-colors flex justify-between items-center ${
                                        opt.value === value ? 'bg-primary/10 text-primary font-bold' : 'text-slate-700'
                                    }`}
                                >
                                    <span>{opt.label}</span>
                                    {opt.balance !== undefined && (
                                        <span className="text-[10px] text-slate-400 font-mono">
                                            LKR {parseFloat(opt.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </span>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="px-4 py-3 text-xs text-slate-400 text-center italic">
                                No results found
                            </div>
                        )}
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}
