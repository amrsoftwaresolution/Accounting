import React, { useState, useRef } from 'react';
import { useForm, router } from '@inertiajs/react';

export default function CompanySettings({ settings, currencies = [] }) {
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
        currency_id: settings?.currency_id || '',
        multicurrency: settings?.multicurrency || false,
    });

    const currentCurrency = currencies.find(c => c.id == currencyForm.data.currency_id) || settings?.currency;

    const handleCurrencyChange = (e) => {
        currencyForm.setData('currency_id', e.target.value);
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
        <div className="space-y-4">
            {/* Logo Section */}
            <div className="flex justify-center mb-6">
                <input
                    type="file"
                    ref={fileInput}
                    className="hidden"
                    onChange={handleLogoUpload}
                    accept="image/*"
                />

                <div onClick={selectFile} className="relative group cursor-pointer">
                    <div className="w-20 h-20 bg-gray-100 rounded-lg border border-dashed border-gray-300 flex items-center justify-center overflow-hidden hover:border-green-600 transition-colors">
                        {settings?.logo_url ? (
                            <img
                                src={settings.logo_url}
                                className="w-full h-full object-contain"
                                alt="Company Logo"
                            />
                        ) : (
                            <span className="material-icons text-gray-400 text-3xl">store</span>
                        )}

                        <div className={`absolute inset-0 bg-black flex items-center justify-center transition-all ${isUploading ? 'bg-opacity-40' : 'bg-opacity-0 group-hover:bg-opacity-10'}`}>
                            {isUploading ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <span className="material-icons text-white opacity-0 group-hover:opacity-100 text-lg">add_a_photo</span>
                            )}
                        </div>
                    </div>
                    <div
                        onClick={(e) => {
                            e.stopPropagation();
                            selectFile();
                        }}
                        className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-md border border-gray-200"
                    >
                        <span className="material-icons text-xs text-gray-600">edit</span>
                    </div>
                </div>
            </div>

            {/* Company Info Card */}
            <div className="bg-white rounded shadow-sm border border-gray-200">
                {!isEditing ? (
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-3">
                            <div>
                                <h2 className="text-sm font-bold text-gray-800">Company info</h2>
                                <p className="text-gray-400 text-[10px]">This info may be used for billing purposes.</p>
                            </div>
                            <button onClick={() => setIsEditing(true)} className="text-primary-600 hover:underline text-xs font-semibold">Edit</button>
                        </div>
                        <div className="space-y-3">
                            <div className="grid grid-cols-12 border-b border-gray-100 pb-2">
                                <div className="col-span-4 text-gray-500 text-xs font-bold">Name</div>
                                <div className="col-span-8 text-xs text-gray-800">{infoForm.data.company_name}</div>
                            </div>
                            <div className="grid grid-cols-12 border-b border-gray-100 pb-2">
                                <div className="col-span-4 text-gray-500 text-xs font-bold">Email</div>
                                <div className="col-span-8 text-xs text-gray-800">{infoForm.data.company_email}</div>
                            </div>
                            <div className="grid grid-cols-12 border-b border-gray-100 pb-2">
                                <div className="col-span-4 text-gray-500 text-xs font-bold">Phone</div>
                                <div className="col-span-8 text-xs text-gray-800">{infoForm.data.phone}</div>
                            </div>
                            <div className="grid grid-cols-12 border-b border-gray-100 pb-2">
                                <div className="col-span-4 text-gray-500 text-xs font-bold">Industry</div>
                                <div className="col-span-8 text-xs text-gray-800">{infoForm.data.industry}</div>
                            </div>
                            <div className="grid grid-cols-12 border-b border-gray-100 pb-2">
                                <div className="col-span-4 text-gray-500 text-xs font-bold">Address</div>
                                <div className="col-span-8 text-xs text-gray-800">{infoForm.data.address || <span className="text-gray-300 italic">None listed</span>}</div>
                            </div>
                            <div className="grid grid-cols-12 pb-2">
                                <div className="col-span-4 text-gray-500 text-xs font-bold">Website</div>
                                <div className="col-span-8 text-xs text-gray-800">{infoForm.data.website || <span className="text-gray-300 italic">None listed</span>}</div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleInfoSubmit} className="p-6">
                        <h2 className="text-sm font-bold text-gray-800 mb-4">Edit Company info</h2>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Company Name</label>
                                <input type="text" className="w-full border-gray-300 rounded mt-1 focus:border-green-600 focus:ring-0 text-xs py-1.5" value={infoForm.data.company_name} onChange={e => infoForm.setData('company_name', e.target.value)} />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Company Email</label>
                                    <input type="email" className="w-full border-gray-300 rounded mt-1 focus:border-green-600 focus:ring-0 text-xs py-1.5" value={infoForm.data.company_email} onChange={e => infoForm.setData('company_email', e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Phone</label>
                                    <input type="text" className="w-full border-gray-300 rounded mt-1 focus:border-green-600 focus:ring-0 text-xs py-1.5" value={infoForm.data.phone} onChange={e => infoForm.setData('phone', e.target.value)} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Address</label>
                                <textarea className="w-full border-gray-300 rounded mt-1 focus:border-green-600 focus:ring-0 text-xs py-1.5" rows="2" value={infoForm.data.address} onChange={e => infoForm.setData('address', e.target.value)}></textarea>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Website</label>
                                <input type="text" className="w-full border-gray-300 rounded mt-1 focus:border-green-600 focus:ring-0 text-xs py-1.5" value={infoForm.data.website} onChange={e => infoForm.setData('website', e.target.value)} />
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-2 border-t border-gray-100 pt-4">
                            <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-1.5 border border-gray-300 rounded-full font-bold text-xs hover:bg-gray-50 text-gray-700">Cancel</button>
                            <button type="submit" disabled={infoForm.processing} className="px-5 py-1.5 bg-green-700 text-white rounded-full font-bold text-xs hover:bg-green-800 disabled:opacity-50">Save</button>
                        </div>
                    </form>
                )}
            </div>

            {/* Legal Info Card */}
            <div className="bg-white rounded shadow-sm border border-gray-200">
                {!isEditingLegal ? (
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-3">
                            <div>
                                <h2 className="text-sm font-bold text-gray-800">Legal info</h2>
                                <p className="text-gray-400 text-[10px]">This is the info your business uses for tax purposes.</p>
                            </div>
                            <button onClick={() => setIsEditingLegal(true)} className="text-primary-600 hover:underline text-xs font-semibold">Edit</button>
                        </div>
                        <div className="space-y-3">
                            <div className="grid grid-cols-12 border-b border-gray-100 pb-2">
                                <div className="col-span-4 text-gray-500 text-xs font-bold">Legal business name</div>
                                <div className="col-span-8 text-xs text-gray-800">{legalForm.data.legal_name || infoForm.data.company_name}</div>
                            </div>
                            <div className="grid grid-cols-12 border-b border-gray-100 pb-2">
                                <div className="col-span-4 text-gray-500 text-xs font-bold">VAT/GST/TAX ID number</div>
                                <div className="col-span-8 text-xs text-gray-800">{legalForm.data.tax_id || <span className="text-gray-300 italic">None listed</span>}</div>
                            </div>
                            <div className="grid grid-cols-12 border-b border-gray-100 pb-2">
                                <div className="col-span-4 text-gray-500 text-xs font-bold">Business type</div>
                                <div className="col-span-8 text-xs text-gray-800">{legalForm.data.business_type || <span className="text-gray-300 italic">None listed</span>}</div>
                            </div>
                            <div className="grid grid-cols-12 pb-2">
                                <div className="col-span-4 text-gray-500 text-xs font-bold">Legal address</div>
                                <div className="col-span-8 text-xs text-gray-800">{legalForm.data.legal_address || <span className="text-gray-300 italic">None listed</span>}</div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleLegalSubmit} className="p-6">
                        <h2 className="text-sm font-bold text-gray-800 mb-4">Edit Legal info</h2>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Legal Business Name</label>
                                <input type="text" className="w-full border-gray-300 rounded mt-1 focus:border-green-600 focus:ring-0 text-xs py-1.5" value={legalForm.data.legal_name} onChange={e => legalForm.setData('legal_name', e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">VAT/GST/TAX ID number</label>
                                <input type="text" className="w-full border-gray-300 rounded mt-1 focus:border-green-600 focus:ring-0 text-xs py-1.5" value={legalForm.data.tax_id} onChange={e => legalForm.setData('tax_id', e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Business type</label>
                                <select className="w-full border-gray-300 rounded mt-1 focus:border-green-600 focus:ring-0 text-xs py-1.5 bg-white" value={legalForm.data.business_type} onChange={e => legalForm.setData('business_type', e.target.value)}>
                                    <option value="">Select type</option>
                                    <option value="Sole trader">Sole trader</option>
                                    <option value="Partnership or limited liability company">Partnership or limited liability company</option>
                                    <option value="Small business Corporation">Small business Corporation</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Legal address</label>
                                <textarea className="w-full border-gray-300 rounded mt-1 focus:border-green-600 focus:ring-0 text-xs py-1.5" rows="2" value={legalForm.data.legal_address} onChange={e => legalForm.setData('legal_address', e.target.value)}></textarea>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-2 border-t border-gray-100 pt-4">
                            <button type="button" onClick={() => setIsEditingLegal(false)} className="px-4 py-1.5 border border-gray-300 rounded-full font-bold text-xs hover:bg-gray-50 text-gray-700">Cancel</button>
                            <button type="submit" disabled={legalForm.processing} className="px-5 py-1.5 bg-green-700 text-white rounded-full font-bold text-xs hover:bg-green-800 disabled:opacity-50">Save</button>
                        </div>
                    </form>
                )}
            </div>

            {/* Currency Card */}
            <div className="bg-white rounded shadow-sm border border-gray-200">
                {!isEditingCurrency ? (
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-3">
                            <h2 className="text-sm font-bold text-gray-800">Currency</h2>
                            <button onClick={() => setIsEditingCurrency(true)} className="text-primary-600 hover:underline text-xs font-semibold">Edit</button>
                        </div>
                        <div className="space-y-3">
                            <div className="grid grid-cols-12 border-b border-gray-100 pb-2">
                                <div className="col-span-4 text-gray-500 text-xs font-bold">Home Currency</div>
                                <div className="col-span-8 text-xs text-gray-800">{currentCurrency ? `${currentCurrency.code} (${currentCurrency.symbol})` : 'Not set'}</div>
                            </div>
                            <div className="grid grid-cols-12 pb-2">
                                <div className="col-span-4 text-gray-500 text-xs font-bold">Multicurrency</div>
                                <div className="col-span-8 text-xs text-gray-800 flex items-center gap-2">
                                    {currencyForm.data.multicurrency ? 'On' : 'Off'}
                                    <button type="button" className="text-primary-600 hover:underline text-[10px]">Manage Currencies</button>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleCurrencySubmit} className="p-6">
                        <h2 className="text-sm font-bold text-gray-800 mb-4">Edit Currency info</h2>
                        <div className="space-y-3">
                            <div className="grid grid-cols-1 gap-3">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Home Currency</label>
                                    <select className="w-full border-gray-300 rounded mt-1 focus:border-green-600 focus:ring-0 text-xs py-1.5 bg-white" value={currencyForm.data.currency_id} onChange={handleCurrencyChange}>
                                        <option value="">Select a currency</option>
                                        {currencies.map(c => (
                                            <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="flex items-center gap-2.5 pt-1">
                                <input
                                    type="checkbox"
                                    id="multicurrency"
                                    className="rounded border-gray-300 text-green-600 focus:ring-0 h-3.5 w-3.5"
                                    checked={currencyForm.data.multicurrency}
                                    onChange={e => currencyForm.setData('multicurrency', e.target.checked)}
                                />
                                <label htmlFor="multicurrency" className="text-xs text-gray-700">Multicurrency</label>
                            </div>
                            <p className="text-[10px] text-gray-400 italic">Once you turn on multicurrency, you can't turn it off.</p>
                        </div>
                        <div className="mt-6 flex justify-end gap-2 border-t border-gray-100 pt-4">
                            <button type="button" onClick={() => setIsEditingCurrency(false)} className="px-4 py-1.5 border border-gray-300 rounded-full font-bold text-xs hover:bg-gray-50 text-gray-700">Cancel</button>
                            <button type="submit" disabled={currencyForm.processing} className="px-5 py-1.5 bg-green-700 text-white rounded-full font-bold text-xs hover:bg-green-800 disabled:opacity-50">Save</button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
