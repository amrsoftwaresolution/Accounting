import React, { useState } from 'react';
import { useForm, usePage } from '@inertiajs/react';

const AdvancedSection = ({ title, children, isEditing, onEditClick, showEdit = true }) => (
    <div className="bg-white rounded shadow-sm border border-gray-200 mb-3 group relative">
        <div className="p-5">
            <div className="flex justify-between items-start">
                <div className="w-1/3">
                    <h3 className="text-xs text-gray-400 font-bold uppercase tracking-wider">{title}</h3>
                </div>
                <div className="w-2/3 pr-12">
                    {children}
                </div>
            </div>
        </div>
        {showEdit && !isEditing && (
            <button
                type="button"
                onClick={onEditClick}
                className="absolute top-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity"
            >
                <span className="material-icons text-primary-600 text-sm">edit</span>
            </button>
        )}
    </div>
);

const Row = ({ label, value, subValue = null }) => (
    <div className="py-1.5 border-b border-gray-50 last:border-0">
        <div className="flex justify-between text-xs">
            <span className="text-gray-500">{label}</span>
            <span className="font-semibold text-gray-800 text-right">{value}</span>
        </div>
        {subValue && <div className="text-[10px] text-primary-600 hover:underline cursor-pointer">{subValue}</div>}
    </div>
);

export default function AdvancedSettings() {
    const { settings } = usePage().props;

    const { data, setData, post, processing } = useForm({
        acct_method: settings?.acct_method || 'Accrual',
        fin_year_start: settings?.fin_year_start || 'January',
        tax_year_start: settings?.tax_year_start || 'Same as financial year',
        close_books: !!settings?.close_books,
        tax_form: settings?.tax_form || 'Partnership or limited liability company',
        enable_acct_nums: !!settings?.enable_acct_nums,
        discount_acct: settings?.discount_acct || 'Discounts given',
        auto_prefill: !!settings?.auto_prefill,
        auto_invoice_groups: !!settings?.auto_invoice_groups,
        auto_apply_bills: !!settings?.auto_apply_bills,
        language: settings?.language || 'English',
        date_format: settings?.date_format || 'mm/dd/yyyy',
        currency_format: settings?.currency_format || '$123,456.00',
        warn_dup_cheque: !!settings?.warn_dup_cheque,
        warn_dup_bill: !!settings?.warn_dup_bill,
        warn_dup_journal: !!settings?.warn_dup_journal,
        sign_out_inactive: settings?.sign_out_inactive || '1 hour',
    });

    const [editingSection, setEditingSection] = useState(null);

    const submit = (e) => {
        e.preventDefault();
        post(route('advanced.settings.update'), {
            preserveScroll: true,
            onSuccess: () => setEditingSection(null),
        });
    };

    const Toggle = ({ label, field }) => (
        <div className="flex justify-between items-center py-1.5">
            <span className="text-xs text-gray-600">{label}</span>
            <label className="relative inline-flex items-center cursor-pointer scale-90">
                <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={data[field]}
                    onChange={e => setData(field, e.target.checked)}
                />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-600"></div>
            </label>
        </div>
    );

    const ActionButtons = () => (
        <div className="flex justify-start gap-2 pt-4 border-t border-gray-100 mt-4">
            <button type="button" onClick={() => setEditingSection(null)} className="px-5 py-1.5 border border-gray-300 rounded-full text-xs font-bold hover:bg-gray-50 text-gray-700">Cancel</button>
            <button type="submit" disabled={processing} className="px-6 py-1.5 bg-green-700 text-white rounded-full text-xs font-bold disabled:opacity-50">Save</button>
        </div>
    );

    return (
        <form onSubmit={submit} className="pb-20 space-y-1">

            {/* Accounting Method (Standalone Section) */}
            <AdvancedSection
                title="Accounting method"
                isEditing={editingSection === 'acc_method_standalone'}
                onEditClick={() => setEditingSection('acc_method_standalone')}
            >
                {editingSection !== 'acc_method_standalone' ? (
                    <p className="text-xs text-gray-800">{data.acct_method}</p>
                ) : (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <select
                                value={data.acct_method}
                                onChange={e => setData('acct_method', e.target.value)}
                                className="border border-gray-300 rounded p-1.5 w-44 text-xs text-gray-700 outline-none focus:border-green-600 bg-white"
                            >
                                <option value="Accrual">Accrual</option>
                                <option value="Cash">Cash</option>
                            </select>
                            <span className="material-icons text-gray-400 text-sm">info_outline</span>
                        </div>
                        <ActionButtons />
                    </div>
                )}
            </AdvancedSection>

            {/* Accounting Section */}
            <AdvancedSection
                title="Accounting"
                isEditing={editingSection === 'accounting'}
                onEditClick={() => setEditingSection('accounting')}
            >
                {editingSection !== 'accounting' ? (
                    <>
                        <Row label="First month of financial year" value={data.fin_year_start} />
                        <Row label="First month of tax year" value={data.tax_year_start} />
                        <Row label="Accounting method" value={data.acct_method} />
                        <Row label="Close the books" value={data.close_books ? "On" : "Off"} />
                    </>
                ) : (
                    <div className="space-y-3">
                        {/* Financial Year Start */}
                        <div className="flex justify-between items-center text-xs">
                            <div className="flex items-center gap-1">
                                <span>First month of financial year</span>
                                <span className="material-icons text-gray-400 text-xs">info_outline</span>
                            </div>
                            <select
                                value={data.fin_year_start}
                                onChange={e => setData('fin_year_start', e.target.value)}
                                className="border border-gray-300 rounded p-1.5 w-44 text-xs text-gray-700 outline-none focus:border-green-600 bg-white"
                            >
                                <option>January</option>
                                <option>February</option>
                                <option>March</option>
                                <option>April</option>
                                <option>May</option>
                                <option>June</option>
                                <option>July</option>
                                <option>August</option>
                                <option>September</option>
                                <option>October</option>
                                <option>November</option>
                                <option>December</option>
                            </select>
                        </div>

                        {/* Tax Year Start */}
                        <div className="flex justify-between items-center text-xs">
                            <span>First month of tax year</span>
                            <select
                                value={data.tax_year_start}
                                onChange={e => setData('tax_year_start', e.target.value)}
                                className="border border-gray-300 rounded p-1.5 w-44 text-xs text-gray-700 outline-none focus:border-green-600 bg-white"
                            >
                                <option>Same as financial year</option>
                                <option>January</option>
                            </select>
                        </div>

                        {/* Accounting Method */}
                        <div className="flex justify-between items-center text-xs">
                            <div className="flex items-center gap-1">
                                <span>Accounting method</span>
                                <span className="material-icons text-gray-400 text-xs">info_outline</span>
                            </div>
                            <select
                                value={data.acct_method}
                                onChange={e => setData('acct_method', e.target.value)}
                                className="border border-gray-300 rounded p-1.5 w-44 text-xs text-gray-700 outline-none focus:border-green-600 bg-white"
                            >
                                <option>Accrual</option>
                                <option>Cash</option>
                            </select>
                        </div>

                        {/* Close the Books */}
                        <div className="flex justify-between items-center text-xs">
                            <div className="flex items-center gap-1">
                                <span>Close the books</span>
                                <span className="material-icons text-gray-400 text-xs">info_outline</span>
                            </div>
                            <Toggle label="" field="close_books" />
                        </div>

                        <ActionButtons />
                    </div>
                )}
            </AdvancedSection>

            {/* Communications (No Edit) */}
            <AdvancedSection title="Communications with Intuit" showEdit={false}>
                <a href="#" className="text-xs text-primary-600 hover:underline">Marketing preferences</a>
            </AdvancedSection>

            {/* Company Type */}
            <AdvancedSection title="Company type" isEditing={editingSection === 'type'} onEditClick={() => setEditingSection('type')}>
                {editingSection !== 'type' ? (
                    <Row label="Tax form" value={data.tax_form} />
                ) : (
                    <div className="space-y-3">
                        <select value={data.tax_form} onChange={e => setData('tax_form', e.target.value)} className="w-full border border-gray-300 rounded p-1.5 text-xs bg-white">
                            <option>Partnership or limited liability company</option>
                            <option>Sole trader</option>
                        </select>
                        <ActionButtons />
                    </div>
                )}
            </AdvancedSection>

            {/* Chart of Accounts */}
            <AdvancedSection title="Chart of accounts" isEditing={editingSection === 'coa'} onEditClick={() => setEditingSection('coa')}>
                {editingSection !== 'coa' ? (
                    <>
                        <Row label="Enable account numbers" value={data.enable_acct_nums ? "On" : "Off"} />
                        <Row label="Discount account" value={data.discount_acct} />
                    </>
                ) : (
                    <div className="space-y-3">
                        <Toggle label="Enable account numbers" field="enable_acct_nums" />
                        <ActionButtons />
                    </div>
                )}
            </AdvancedSection>

            {/* Automation */}
            <AdvancedSection title="Automation" isEditing={editingSection === 'automation'} onEditClick={() => setEditingSection('automation')}>
                {editingSection !== 'automation' ? (
                    <>
                        <Row label="Pre-fill forms with previously entered content" value={data.auto_prefill ? "On" : "Off"} />
                        <Row label="Automatically apply bill payments" value={data.auto_apply_bills ? "On" : "Off"} />
                        <Row label="Automatically invoice unbilled activity" value={data.auto_invoice_groups ? "On" : "Off"} />
                    </>
                ) : (
                    <div className="space-y-3">
                        <Toggle label="Pre-fill forms with previously entered content" field="auto_prefill" />
                        <Toggle label="Automatically apply bill payments" field="auto_apply_bills" />
                        <Toggle label="Automatically invoice unbilled activity" field="auto_invoice_groups" />
                        <ActionButtons />
                    </div>
                )}
            </AdvancedSection>

            {/* Language Section */}
            <AdvancedSection
                title="Language"
                isEditing={editingSection === 'language'}
                onEditClick={() => setEditingSection('language')}
            >
                {editingSection !== 'language' ? (
                    <Row label="Language" value={data.language} />
                ) : (
                    <div className="space-y-3">
                        <div className="flex justify-between items-center text-xs">
                            <span>Language</span>
                            <select
                                value={data.language}
                                onChange={e => setData('language', e.target.value)}
                                className="border border-gray-300 rounded p-1.5 w-44 text-xs text-gray-700 outline-none focus:border-green-600 bg-white"
                            >
                                <option>English</option>
                                <option>Spanish</option>
                                <option>French</option>
                                <option>Italian</option>
                                <option>Chinese</option>
                            </select>
                        </div>
                        <ActionButtons />
                    </div>
                )}
            </AdvancedSection>

            {/* Other Preferences */}
            <AdvancedSection
                title="Other preferences"
                isEditing={editingSection === 'other'}
                onEditClick={() => setEditingSection('other')}
            >
                {editingSection !== 'other' ? (
                    <>
                        <Row label="Date format" value={data.date_format} />
                        <Row label="Currency format" value={data.currency_format} />
                        <Row label="Warn me if duplicate cheque number is used" value={data.warn_dup_cheque ? "On" : "Off"} />
                        <Row label="Warn me if I enter a bill number that's already been used" value={data.warn_dup_bill ? "On" : "Off"} />
                        <Row label="Warn me if duplicate journal number is used" value={data.warn_dup_journal ? "On" : "Off"} />
                        <Row label="Notify me if inactive for" value={data.sign_out_inactive} />
                    </>
                ) : (
                    <div className="space-y-3">
                        {/* Date Format */}
                        <div className="flex justify-between items-center text-xs">
                            <span>Date format</span>
                            <select
                                value={data.date_format}
                                onChange={e => setData('date_format', e.target.value)}
                                className="border border-gray-300 rounded p-1.5 w-44 text-xs text-gray-700 outline-none focus:border-green-600 bg-white"
                            >
                                <option>dd/mm/yyyy</option>
                                <option>mm/dd/yyyy</option>
                                <option>yyyy/mm/dd</option>
                            </select>
                        </div>

                        {/* Currency Format */}
                        <div className="flex justify-between items-center text-xs">
                            <span>Currency format</span>
                            <select
                                value={data.currency_format}
                                onChange={e => setData('currency_format', e.target.value)}
                                className="border border-gray-300 rounded p-1.5 w-44 text-xs text-gray-700 outline-none focus:border-green-600 bg-white"
                            >
                                <option>$123,456.00</option>
                                <option>123.456,00</option>
                            </select>
                        </div>

                        {/* Warning Toggles */}
                        <Toggle label="Warn me if duplicate cheque number is used" field="warn_dup_cheque" />
                        <Toggle label="Warn me if I enter a bill number that's already been used for that supplier" field="warn_dup_bill" />
                        <Toggle label="Warn me if duplicate journal number is used" field="warn_dup_journal" />

                        {/* Inactive Timeout */}
                        <div className="flex justify-between items-center text-xs">
                            <span>Notify me if inactive for</span>
                            <select
                                value={data.sign_out_inactive}
                                onChange={e => setData('sign_out_inactive', e.target.value)}
                                className="border border-gray-300 rounded p-1.5 w-44 text-xs text-gray-700 outline-none focus:border-green-600 bg-white"
                            >
                                <option>1 hour</option>
                                <option>2 hours</option>
                                <option>3 hours</option>
                            </select>
                        </div>

                        <ActionButtons />
                    </div>
                )}
            </AdvancedSection>

        </form>
    );
}
