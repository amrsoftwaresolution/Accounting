import React, { useState, useRef } from 'react';
import { useForm, router } from '@inertiajs/react';

export default function CompanySettings({ settings }) {
    // 1. Logic for Company Info Text (Edit Mode)
    const [isEditing, setIsEditing] = useState(false);
    const infoForm = useForm({
        company_name: settings?.company_name || '',
        company_email: settings?.company_email || '',
        phone: settings?.phone || '',
        industry: settings?.industry || '',
        address: settings?.address || '',
        website: settings?.website || '',
    });

    const handleInfoSubmit = (e) => {
        e.preventDefault();
        infoForm.post(route('company.update'), {
            onSuccess: () => setIsEditing(false),
        });
    };

    // 2. Logic for Legal Info
    const [isEditingLegal, setIsEditingLegal] = useState(false);
    const legalForm = useForm({
        legal_name: settings?.legal_name || '',
        tax_id: settings?.tax_id || '',
        business_type: settings?.business_type || '',
        legal_address: settings?.legal_address || '',
    });

    const handleLegalSubmit = (e) => {
        e.preventDefault();
        legalForm.post(route('legal.update'), {
            onSuccess: () => setIsEditingLegal(false),
        });
    };

    const [isEditingCurrency, setIsEditingCurrency] = useState(false);
    const currencyForm = useForm({
        home_currency: settings?.home_currency || 'LKR',
        home_currency_prefix: settings?.home_currency_prefix || 'Rs.',
        multicurrency: settings?.multicurrency || false,
    });

    const handleCurrencyChange = (e) => {
        const value = e.target.value;
        const prefixes = {
            'LKR': 'Rs.',
            'USD': '$',
            'EUR': '€',
            'GBP': '£',
            'AUD': 'A$',
        };
        currencyForm.setData({
            ...currencyForm.data,
            home_currency: value,
            home_currency_prefix: prefixes[value] || value
        });
    };
    const handleCurrencySubmit = (e) => {
        e.preventDefault();
        currencyForm.post(route('currency.update'), {
            onSuccess: () => setIsEditingCurrency(false),
        });
    };
    // ------------------------------------

    const [isUploading, setIsUploading] = useState(false);
    const fileInput = useRef();

    const selectFile = () => {
        fileInput.current.click();
    };

    const handleLogoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setIsUploading(true);
            router.post(route('logo.upload'), {
                logo: file,
            }, {
                forceFormData: true,
                preserveScroll: true,
                onFinish: () => setIsUploading(false),
            });
        }
    };

    return (
        <div className="space-y-6">
            {/* Logo Section */}
            <div className="flex justify-center mb-8">
                <input
                    type="file"
                    ref={fileInput}
                    className="hidden"
                    onChange={handleLogoUpload}
                    accept="image/*"
                />

                <div onClick={selectFile} className="relative group cursor-pointer">
                    <div className="w-24 h-24 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden hover:border-green-600 transition-colors">
                        {settings?.logo_path ? (
                            <img
                                src={`/storage/${settings.logo_path}`}
                                className="w-full h-full object-cover"
                                alt="Company Logo"
                            />
                        ) : (
                            <span className="material-icons text-gray-400 text-4xl">store</span>
                        )}

                        <div className={`absolute inset-0 bg-black flex items-center justify-center transition-all ${isUploading ? 'bg-opacity-40' : 'bg-opacity-0 group-hover:bg-opacity-10'}`}>
                            {isUploading ? (
                                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <span className="material-icons text-white opacity-0 group-hover:opacity-100">add_a_photo</span>
                            )}
                        </div>
                    </div>
                    <div 
                        onClick={(e) => {
                            e.stopPropagation();
                            selectFile();
                        }}
                        className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow-md border border-gray-200"
                    >
                        <span className="material-icons text-sm text-gray-600">edit</span>
                    </div>
                </div>
            </div>

            {/* Company Info Card */}
            <div className="bg-white rounded shadow-sm border border-gray-200">
                {!isEditing ? (
                    <div className="p-8">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h2 className="text-lg font-bold text-gray-800">Company info</h2>
                                <p className="text-gray-500 text-xs">This info may be used for billing purposes.</p>
                            </div>
                            <button onClick={() => setIsEditing(true)} className="text-blue-600 hover:underline text-sm font-semibold">Edit</button>
                        </div>
                        <div className="space-y-4">
                            <div className="grid grid-cols-12 border-b pb-4">
                                <div className="col-span-4 text-gray-500 text-sm font-bold">Name</div>
                                <div className="col-span-8 text-sm">{infoForm.data.company_name}</div>
                            </div>
                            <div className="grid grid-cols-12 border-b pb-4">
                                <div className="col-span-4 text-gray-500 text-sm font-bold">Email</div>
                                <div className="col-span-8 text-sm">{infoForm.data.company_email}</div>
                            </div>
                            <div className="grid grid-cols-12 border-b pb-4">
                                <div className="col-span-4 text-gray-500 text-sm font-bold">Phone</div>
                                <div className="col-span-8 text-sm">{infoForm.data.phone}</div>
                            </div>
                            <div className="grid grid-cols-12 border-b pb-4">
                                <div className="col-span-4 text-gray-500 text-sm font-bold">Industry</div>
                                <div className="col-span-8 text-sm">{infoForm.data.industry}</div>
                            </div>
                            <div className="grid grid-cols-12 border-b pb-4">
                                <div className="col-span-4 text-gray-500 text-sm font-bold">Address</div>
                                <div className="col-span-8 text-sm">{infoForm.data.address || <span className="text-gray-300 italic">None listed</span>}</div>
                            </div>
                            <div className="grid grid-cols-12 pb-4">
                                <div className="col-span-4 text-gray-500 text-sm font-bold">Website</div>
                                <div className="col-span-8 text-sm">{infoForm.data.website || <span className="text-gray-300 italic">None listed</span>}</div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleInfoSubmit} className="p-8">
                        <h2 className="text-lg font-bold text-gray-800 mb-6">Edit Company info</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase">Company Name</label>
                                <input type="text" className="w-full border-gray-300 rounded mt-1 focus:border-green-600 focus:ring-0" value={infoForm.data.company_name} onChange={e => infoForm.setData('company_name', e.target.value)} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase">Company Email</label>
                                    <input type="email" className="w-full border-gray-300 rounded mt-1 focus:border-green-600 focus:ring-0" value={infoForm.data.company_email} onChange={e => infoForm.setData('company_email', e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase">Phone</label>
                                    <input type="text" className="w-full border-gray-300 rounded mt-1 focus:border-green-600 focus:ring-0" value={infoForm.data.phone} onChange={e => infoForm.setData('phone', e.target.value)} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase">Address</label>
                                <textarea className="w-full border-gray-300 rounded mt-1 focus:border-green-600 focus:ring-0" rows="2" value={infoForm.data.address} onChange={e => infoForm.setData('address', e.target.value)}></textarea>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase">Website</label>
                                <input type="text" className="w-full border-gray-300 rounded mt-1 focus:border-green-600 focus:ring-0" value={infoForm.data.website} onChange={e => infoForm.setData('website', e.target.value)} />
                            </div>
                        </div>
                        <div className="mt-8 flex justify-end gap-3 border-t pt-6">
                            <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 border rounded-full font-bold text-sm hover:bg-gray-50">Cancel</button>
                            <button type="submit" disabled={infoForm.processing} className="px-6 py-2 bg-green-700 text-white rounded-full font-bold text-sm hover:bg-green-800 disabled:opacity-50">Save</button>
                        </div>
                    </form>
                )}
            </div>

            {/* Legal Info Card */}
            <div className="bg-white rounded shadow-sm border border-gray-200">
                {!isEditingLegal ? (
                    <div className="p-8">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h2 className="text-lg font-bold text-gray-800">Legal info</h2>
                                <p className="text-gray-500 text-xs">This is the info your business uses for tax purposes.</p>
                            </div>
                            <button onClick={() => setIsEditingLegal(true)} className="text-blue-600 hover:underline text-sm font-semibold">Edit</button>
                        </div>
                        <div className="space-y-4">
                            <div className="grid grid-cols-12 border-b pb-4">
                                <div className="col-span-4 text-gray-500 text-sm font-bold">Legal business name</div>
                                <div className="col-span-8 text-sm">{legalForm.data.legal_name || infoForm.data.company_name}</div>
                            </div>
                            <div className="grid grid-cols-12 border-b pb-4">
                                <div className="col-span-4 text-gray-500 text-sm font-bold">VAT/GST/TAX ID number</div>
                                <div className="col-span-8 text-sm">{legalForm.data.tax_id || <span className="text-gray-300 italic">None listed</span>}</div>
                            </div>
                            <div className="grid grid-cols-12 border-b pb-4">
                                <div className="col-span-4 text-gray-500 text-sm font-bold">Business type</div>
                                <div className="col-span-8 text-sm">{legalForm.data.business_type || <span className="text-gray-300 italic">None listed</span>}</div>
                            </div>
                            <div className="grid grid-cols-12 pb-4">
                                <div className="col-span-4 text-gray-500 text-sm font-bold">Legal address</div>
                                <div className="col-span-8 text-sm">{legalForm.data.legal_address || <span className="text-gray-300 italic">None listed</span>}</div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleLegalSubmit} className="p-8">
                        <h2 className="text-lg font-bold text-gray-800 mb-6">Edit Legal info</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase">Legal Business Name</label>
                                <input type="text" className="w-full border-gray-300 rounded mt-1 focus:border-green-600 focus:ring-0" value={legalForm.data.legal_name} onChange={e => legalForm.setData('legal_name', e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase">VAT/GST/TAX ID number</label>
                                <input type="text" className="w-full border-gray-300 rounded mt-1 focus:border-green-600 focus:ring-0" value={legalForm.data.tax_id} onChange={e => legalForm.setData('tax_id', e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase">Business type</label>
                                <select className="w-full border-gray-300 rounded mt-1 focus:border-green-600 focus:ring-0" value={legalForm.data.business_type} onChange={e => legalForm.setData('business_type', e.target.value)}>
                                    <option value="">Select type</option>
                                    <option value="Sole trader">Sole trader</option>
                                    <option value="Partnership or limited liability company">Partnership or limited liability company</option>
                                    <option value="Small business Corporation">Small business Corporation</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase">Legal address</label>
                                <textarea className="w-full border-gray-300 rounded mt-1 focus:border-green-600 focus:ring-0" rows="2" value={legalForm.data.legal_address} onChange={e => legalForm.setData('legal_address', e.target.value)}></textarea>
                            </div>
                        </div>
                        <div className="mt-8 flex justify-end gap-3 border-t pt-6">
                            <button type="button" onClick={() => setIsEditingLegal(false)} className="px-4 py-2 border rounded-full font-bold text-sm hover:bg-gray-50">Cancel</button>
                            <button type="submit" disabled={legalForm.processing} className="px-6 py-2 bg-green-700 text-white rounded-full font-bold text-sm hover:bg-green-800 disabled:opacity-50">Save</button>
                        </div>
                    </form>
                )}
            </div>

            {/* --- NEW: Currency Card --- */}
            <div className="bg-white rounded shadow-sm border border-gray-200">
                {!isEditingCurrency ? (
                    <div className="p-8">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold text-gray-800">Currency</h2>
                            <button onClick={() => setIsEditingCurrency(true)} className="text-blue-600 hover:underline text-sm font-semibold">Edit</button>
                        </div>
                        <div className="space-y-4">
                            <div className="grid grid-cols-12 border-b pb-4">
                                <div className="col-span-4 text-gray-500 text-sm font-bold">Home Currency</div>
                                <div className="col-span-8 text-sm">{currencyForm.data.home_currency} ({currencyForm.data.home_currency_prefix})</div>
                            </div>
                            <div className="grid grid-cols-12 pb-4">
                                <div className="col-span-4 text-gray-500 text-sm font-bold">Multicurrency</div>
                                <div className="col-span-8 text-sm flex items-center gap-2">
                                    {currencyForm.data.multicurrency ? 'On' : 'Off'}
                                    <button type="button" className="text-blue-600 hover:underline text-xs">Manage Currencies</button>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleCurrencySubmit} className="p-8">
                        <h2 className="text-lg font-bold text-gray-800 mb-6">Edit Currency info</h2>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase">Home Currency</label>
                                    <select className="w-full border-gray-300 rounded mt-1 focus:border-green-600 focus:ring-0" value={currencyForm.data.home_currency} onChange={handleCurrencyChange}>
                                        <option value="LKR">Sri Lankan Rupee (LKR)</option>
                                        <option value="USD">United States Dollar (USD)</option>
                                        <option value="EUR">Euro (EUR)</option>
                                        <option value="GBP">British Pound (GBP)</option>
                                        <option value="AUD">Australian Dollar (AUD)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase">Currency Prefix</label>
                                    <input type="text" className="w-full border-gray-300 rounded mt-1 focus:border-green-600 focus:ring-0" value={currencyForm.data.home_currency_prefix} onChange={e => currencyForm.setData('home_currency_prefix', e.target.value)} placeholder="e.g. Rs." />
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="multicurrency"
                                    className="rounded border-gray-300 text-green-600 focus:ring-0"
                                    checked={currencyForm.data.multicurrency}
                                    onChange={e => currencyForm.setData('multicurrency', e.target.checked)}
                                />
                                <label htmlFor="multicurrency" className="text-sm text-gray-700">Multicurrency</label>
                            </div>
                            <p className="text-xs text-gray-400 italic">Once you turn on multicurrency, you can't turn it off.</p>
                        </div>
                        <div className="mt-8 flex justify-end gap-3 border-t pt-6">
                            <button type="button" onClick={() => setIsEditingCurrency(false)} className="px-4 py-2 border rounded-full font-bold text-sm hover:bg-gray-50">Cancel</button>
                            <button type="submit" disabled={currencyForm.processing} className="px-6 py-2 bg-green-700 text-white rounded-full font-bold text-sm hover:bg-green-800 disabled:opacity-50">Save</button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
