import React, { useState, useEffect, useRef } from 'react';

const countries = [
    { name: 'Sri Lanka', code: '+94', flag: '🇱🇰', pattern: /^\d{9}$/ },
    { name: 'India', code: '+91', flag: '🇮🇳', pattern: /^\d{10}$/ },
    { name: 'United Arab Emirates', code: '+971', flag: '🇦🇪', pattern: /^\d{9}$/ },
    { name: 'Qatar', code: '+974', flag: '🇶🇦', pattern: /^\d{8}$/ },
    { name: 'Saudi Arabia', code: '+966', flag: '🇸🇦', pattern: /^\d{9}$/ },
    { name: 'United Kingdom', code: '+44', flag: '🇬🇧', pattern: /^\d{10}$/ },
    { name: 'United States', code: '+1', flag: '🇺🇸', pattern: /^\d{10}$/ },
    { name: 'Australia', code: '+61', flag: '🇦🇺', pattern: /^\d{9}$/ },
];

export default function PhoneInput({ value, onChange, error, className = '' }) {
    const [selectedCountry, setSelectedCountry] = useState(countries[0]);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Parse initial value if exists
    useEffect(() => {
        if (value && typeof value === 'string') {
            const country = countries.find(c => value.startsWith(c.code));
            if (country) {
                setSelectedCountry(country);
                setPhoneNumber(value.replace(country.code, ''));
            }
        }
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handlePhoneChange = (e) => {
        const val = e.target.value.replace(/\D/g, '');
        setPhoneNumber(val);
        onChange(`${selectedCountry.code}${val}`);
    };

    const selectCountry = (country) => {
        setSelectedCountry(country);
        setIsOpen(false);
        onChange(`${country.code}${phoneNumber}`);
    };

    const isValid = selectedCountry.pattern.test(phoneNumber);

    return (
        <div className={`relative ${className}`}>
            <div className={`flex items-center rounded-xl border transition-all duration-200 bg-white ${
                error ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-200 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500'
            }`}>
                {/* Country Selector */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        type="button"
                        onClick={() => setIsOpen(!isOpen)}
                        className="flex items-center gap-2 px-4 py-3.5 border-r border-slate-100 hover:bg-slate-50 transition-colors rounded-l-xl min-w-[100px]"
                    >
                        <span className="text-xl leading-none">{selectedCountry.flag}</span>
                        <span className="text-base font-medium text-slate-700">{selectedCountry.code}</span>
                        <svg className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    {isOpen && (
                        <div className="absolute z-50 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 max-h-64 overflow-y-auto animate-in fade-in zoom-in duration-200">
                            {countries.map((country) => (
                                <button
                                    key={country.code + country.name}
                                    type="button"
                                    onClick={() => selectCountry(country)}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors text-left"
                                >
                                    <span className="text-xl">{country.flag}</span>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-semibold text-slate-700">{country.name}</span>
                                        <span className="text-xs text-slate-400">{country.code}</span>
                                    </div>
                                    {selectedCountry.code === country.code && (
                                        <svg className="ml-auto w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Number Input */}
                <input
                    type="tel"
                    value={phoneNumber}
                    onChange={handlePhoneChange}
                    placeholder={`Enter number (e.g. ${selectedCountry.name === 'Sri Lanka' ? '771234567' : '000000000'})`}
                    className="flex-1 px-4 py-3.5 border-none bg-transparent focus:ring-0 text-slate-800 placeholder:text-slate-300 text-base"
                />

                {/* Validation Indicator */}
                {phoneNumber && (
                    <div className="px-4">
                        {isValid ? (
                            <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                                <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        ) : (
                            <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center">
                                <span className="text-red-600 font-bold text-[10px]">!</span>
                            </div>
                        )}
                    </div>
                )}
            </div>
            {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
        </div>
    );
}
