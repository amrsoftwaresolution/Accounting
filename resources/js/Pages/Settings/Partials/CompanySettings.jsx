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
        home_currency_prefix: settings?.home_currency_prefix || '',
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

    const [isEditingAlerts, setIsEditingAlerts] = useState(false);
    const alertsForm = useForm({
        low_stock_to_emails: settings?.low_stock_to_emails || '',
        low_stock_cc_emails: settings?.low_stock_cc_emails || '',
        low_stock_bcc_emails: settings?.low_stock_bcc_emails || '',
    });

    const handleAlertsSubmit = (e) => {
        e.preventDefault();
        alertsForm.post(route('alerts.update'), {
            onSuccess: () => setIsEditingAlerts(false),
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

    const [isEditingAccounting, setIsEditingAccounting] = useState(false);
const accountingForm = useForm({
    acct_method: settings?.acct_method || 'Accrual',
    fin_year_start: settings?.fin_year_start || 'January',
    tax_year_start: settings?.tax_year_start || 'Same as financial year',
    close_books: !!settings?.close_books,
    tax_form: settings?.tax_form || 'Partnership or limited liability company',
});

const handleAccountingSubmit = (e) => {
    e.preventDefault();
    accountingForm.post(route('accounting.update'), {
        onSuccess: () => setIsEditingAccounting(false),
    });
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
                            <div className="grid grid-cols-12 border-b border-gray-100 pb-2">
                                <div className="col-span-4 text-gray-500 text-xs font-bold">Website</div>
                                <div className="col-span-8 text-xs text-gray-800">{infoForm.data.website || <span className="text-gray-300 italic">None listed</span>}</div>
                            </div>
                            <div className="grid grid-cols-12 pb-2">
                                <div className="col-span-4 text-gray-500 text-xs font-bold">Currency Prefix</div>
                                <div className="col-span-8 text-xs text-gray-800">{infoForm.data.home_currency_prefix}</div>
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
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Currency Prefix</label>
                                <input type="text" className="w-full border-gray-300 rounded mt-1 focus:border-green-600 focus:ring-0 text-xs py-1.5" value={infoForm.data.home_currency_prefix} onChange={e => infoForm.setData('home_currency_prefix', e.target.value)} placeholder="e.g. $" />
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-2 border-t border-gray-100 pt-4">
                            <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-1.5 border border-gray-300 rounded-full font-bold text-xs hover:bg-gray-50 text-gray-700">Cancel</button>
                            <button type="submit" disabled={infoForm.processing} className="px-5 py-1.5 bg-green-700 text-white rounded-full font-bold text-xs hover:bg-green-800 disabled:opacity-50">Save</button>
                        </div>
                    </form>
                )}
            </div>

            {/* Accounting Section */}
           {/* Accounting Card */}
<div className="bg-white rounded shadow-sm border border-gray-200">
    {!isEditingAccounting ? (
        <div className="p-6">
            <div className="flex justify-between items-center mb-3">
                <div>
                    <h2 className="text-sm font-bold text-gray-800">Accounting</h2>
                    <p className="text-gray-400 text-[10px]">These settings affect how your books are kept.</p>
                </div>
                <button onClick={() => setIsEditingAccounting(true)} className="text-primary-600 hover:underline text-xs font-semibold">Edit</button>
            </div>
            <div className="space-y-3">
                <div className="grid grid-cols-12 border-b border-gray-100 pb-2">
                    <div className="col-span-4 text-gray-500 text-xs font-bold">First month of financial year</div>
                    <div className="col-span-8 text-xs text-gray-800">{accountingForm.data.fin_year_start}</div>
                </div>
                <div className="grid grid-cols-12 border-b border-gray-100 pb-2">
                    <div className="col-span-4 text-gray-500 text-xs font-bold">First month of tax year</div>
                    <div className="col-span-8 text-xs text-gray-800">{accountingForm.data.tax_year_start}</div>
                </div>
                <div className="grid grid-cols-12 border-b border-gray-100 pb-2">
                    <div className="col-span-4 text-gray-500 text-xs font-bold">Accounting method</div>
                    <div className="col-span-8 text-xs text-gray-800">{accountingForm.data.acct_method}</div>
                </div>
                <div className="grid grid-cols-12 pb-2">
                    <div className="col-span-4 text-gray-500 text-xs font-bold">Close the books</div>
                    <div className="col-span-8 text-xs text-gray-800">{accountingForm.data.close_books ? 'On' : 'Off'}</div>
                </div>
            </div>
        </div>
    ) : (
        <form onSubmit={handleAccountingSubmit} className="p-6">
            <h2 className="text-sm font-bold text-gray-800 mb-4">Edit Accounting</h2>
            <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                    <span>First month of financial year</span>
                    <select value={accountingForm.data.fin_year_start} onChange={e => accountingForm.setData('fin_year_start', e.target.value)} className="border border-gray-300 rounded p-1.5 w-44 text-xs text-gray-700 outline-none focus:border-green-600 bg-white">
                        <option>January</option><option>February</option><option>March</option>
                        <option>April</option><option>May</option><option>June</option>
                        <option>July</option><option>August</option><option>September</option>
                        <option>October</option><option>November</option><option>December</option>
                    </select>
                </div>
                <div className="flex justify-between items-center text-xs">
                    <span>First month of tax year</span>
                    <select value={accountingForm.data.tax_year_start} onChange={e => accountingForm.setData('tax_year_start', e.target.value)} className="border border-gray-300 rounded p-1.5 w-44 text-xs text-gray-700 outline-none focus:border-green-600 bg-white">
                        <option>Same as financial year</option><option>January</option>
                    </select>
                </div>
                <div className="flex justify-between items-center text-xs">
                    <span>Accounting method</span>
                    <select value={accountingForm.data.acct_method} onChange={e => accountingForm.setData('acct_method', e.target.value)} className="border border-gray-300 rounded p-1.5 w-44 text-xs text-gray-700 outline-none focus:border-green-600 bg-white">
                        <option>Accrual</option><option>Cash</option>
                    </select>
                </div>
                <div className="flex justify-between items-center text-xs">
                    <span>Close the books</span>
                    <label className="relative inline-flex items-center cursor-pointer scale-90">
                        <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={accountingForm.data.close_books}
                            onChange={e => accountingForm.setData('close_books', e.target.checked)}
                        />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                </div>
            </div>
            <div className="mt-6 flex justify-end gap-2 border-t border-gray-100 pt-4">
                <button type="button" onClick={() => setIsEditingAccounting(false)} className="px-4 py-1.5 border border-gray-300 rounded-full font-bold text-xs hover:bg-gray-50 text-gray-700">Cancel</button>
                <button type="submit" disabled={accountingForm.processing} className="px-5 py-1.5 bg-green-700 text-white rounded-full font-bold text-xs hover:bg-green-800 disabled:opacity-50">Save</button>
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

            {/* Alerts Card */}
            <div className="bg-white rounded shadow-sm border border-gray-200">
                {!isEditingAlerts ? (
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-3">
                            <h2 className="text-sm font-bold text-gray-800">Alerts & Notifications</h2>
                            <button onClick={() => setIsEditingAlerts(true)} className="text-primary-600 hover:underline text-xs font-semibold">Edit</button>
                        </div>
                        <div className="space-y-3">
                            <div className="grid grid-cols-12 border-b border-gray-100 pb-2">
                                <div className="col-span-4 text-gray-500 text-xs font-bold">Low Stock Alert (To)</div>
                                <div className="col-span-8 text-xs text-gray-800">{settings?.low_stock_to_emails || 'Not set'}</div>
                            </div>
                            <div className="grid grid-cols-12 border-b border-gray-100 pb-2">
                                <div className="col-span-4 text-gray-500 text-xs font-bold">Low Stock Alert (CC)</div>
                                <div className="col-span-8 text-xs text-gray-800">{settings?.low_stock_cc_emails || 'Not set'}</div>
                            </div>
                            <div className="grid grid-cols-12 pb-2">
                                <div className="col-span-4 text-gray-500 text-xs font-bold">Low Stock Alert (BCC)</div>
                                <div className="col-span-8 text-xs text-gray-800">{settings?.low_stock_bcc_emails || 'Not set'}</div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleAlertsSubmit} className="p-6">
                        <h2 className="text-sm font-bold text-gray-800 mb-4">Edit Alerts Configuration</h2>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Low Stock Alert To Emails</label>
                                <input type="text" className="w-full border-gray-300 rounded mt-1 focus:border-green-600 focus:ring-0 text-xs py-1.5" value={alertsForm.data.low_stock_to_emails} onChange={e => alertsForm.setData('low_stock_to_emails', e.target.value)} placeholder="email1@example.com, email2@example.com" />
                                <p className="text-[10px] text-gray-500 mt-1">Separate multiple emails with commas</p>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Low Stock Alert CC Emails</label>
                                <input type="text" className="w-full border-gray-300 rounded mt-1 focus:border-green-600 focus:ring-0 text-xs py-1.5" value={alertsForm.data.low_stock_cc_emails} onChange={e => alertsForm.setData('low_stock_cc_emails', e.target.value)} placeholder="email1@example.com, email2@example.com" />
                                <p className="text-[10px] text-gray-500 mt-1">Separate multiple emails with commas</p>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Low Stock Alert BCC Emails</label>
                                <input type="text" className="w-full border-gray-300 rounded mt-1 focus:border-green-600 focus:ring-0 text-xs py-1.5" value={alertsForm.data.low_stock_bcc_emails} onChange={e => alertsForm.setData('low_stock_bcc_emails', e.target.value)} placeholder="email1@example.com, email2@example.com" />
                                <p className="text-[10px] text-gray-500 mt-1">Separate multiple emails with commas</p>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-2 border-t border-gray-100 pt-4">
                            <button type="button" onClick={() => setIsEditingAlerts(false)} className="px-4 py-1.5 border border-gray-300 rounded-full font-bold text-xs hover:bg-gray-50 text-gray-700">Cancel</button>
                            <button type="submit" disabled={alertsForm.processing} className="px-5 py-1.5 bg-green-700 text-white rounded-full font-bold text-xs hover:bg-green-800 disabled:opacity-50">Save</button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
