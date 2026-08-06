import React, { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import CommonInput from '@/Components/CommonInput';
import CommonButton from '@/Components/CommonButton';

export default function PrintSettings({ settings }) {
    const printSettings = settings?.print_settings || [];
    const [selectedDocType, setSelectedDocType] = useState('invoice');

    const documentTypes = [
        { id: 'invoice', label: 'Invoice' },
        { id: 'bill', label: 'Bill' },
        { id: 'invoice_return', label: 'Invoice Return' },
        { id: 'bill_return', label: 'Bill Return' },
        { id: 'payment_receipt', label: 'Receive Payment' },
    ];

    const currentSetting = printSettings.find(s => s.document_type === selectedDocType) || {};
    const defaultPageSetup = currentSetting.page_setup || {
        size: 'A4', margin_top: 0, margin_bottom: 0, margin_left: 0, margin_right: 0
    };

    const { data, setData, post, processing, recentlySuccessful } = useForm({
        document_type: selectedDocType,
        page_setup: defaultPageSetup,
        static_footer_content: currentSetting.static_footer_content || '',
    });

    useEffect(() => {
        const setting = printSettings.find(s => s.document_type === selectedDocType) || {};
        setData({
            document_type: selectedDocType,
            page_setup: setting.page_setup || { size: 'A4', margin_top: 0, margin_bottom: 0, margin_left: 0, margin_right: 0 },
            static_footer_content: setting.static_footer_content || '',
        });
    }, [selectedDocType, settings]);

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('print.settings.update'), {
            preserveScroll: true,
        });
    };

    const handlePageSetupChange = (field, value) => {
        setData('page_setup', {
            ...data.page_setup,
            [field]: value
        });
    };

    return (
        <section className="bg-white shadow sm:rounded-lg p-6 max-w-4xl border border-gray-200">
            <header className="mb-6">
                <h2 className="text-sm font-bold text-gray-800">Print Settings</h2>
                <p className="mt-1 text-[10px] text-gray-400">Configure page layouts and footer text for your documents.</p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="w-1/2">
                    <CommonInput
                        type="select"
                        label="Document Type"
                        value={selectedDocType}
                        onChange={(e) => setSelectedDocType(e.target.value)}
                        options={documentTypes.map(doc => ({ value: doc.id, label: doc.label }))}
                    />
                </div>

                <div className="border-t border-gray-100 pt-6">
                    <h3 className="text-xs font-bold text-gray-800 mb-4">{documentTypes.find(d => d.id === selectedDocType)?.label} Settings</h3>
                    
                    <div className="w-1/2">
                        <CommonInput
                            type="select"
                            label="Page Size"
                            value={data.page_setup?.size || 'A4'}
                            onChange={(e) => handlePageSetupChange('size', e.target.value)}
                            options={[
                                { value: 'A4', label: 'A4' },
                                { value: 'A5', label: 'A5' },
                                { value: 'Letter', label: 'Letter' },
                                { value: 'Letterhead', label: 'Letterhead (Custom Margins)' },
                            ]}
                        />
                    </div>

                    {data.page_setup?.size === 'Letterhead' && (
                        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-md border border-slate-200">
                            <div className="col-span-2 md:col-span-4 mb-2">
                                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Letterhead PDF Margins (mm)</h4>
                            </div>
                            <CommonInput
                                type="number"
                                label="Top"
                                min="0"
                                value={data.page_setup?.margin_top || 0}
                                onChange={(e) => handlePageSetupChange('margin_top', e.target.value)}
                            />
                            <CommonInput
                                type="number"
                                label="Bottom"
                                min="0"
                                value={data.page_setup?.margin_bottom || 0}
                                onChange={(e) => handlePageSetupChange('margin_bottom', e.target.value)}
                            />
                            <CommonInput
                                type="number"
                                label="Left"
                                min="0"
                                value={data.page_setup?.margin_left || 0}
                                onChange={(e) => handlePageSetupChange('margin_left', e.target.value)}
                            />
                            <CommonInput
                                type="number"
                                label="Right"
                                min="0"
                                value={data.page_setup?.margin_right || 0}
                                onChange={(e) => handlePageSetupChange('margin_right', e.target.value)}
                            />
                        </div>
                    )}

                    <div className="mt-6">
                        <CommonInput
                            type="textarea"
                            label="Bottom Text (Tax/Footer)"
                            rows={4}
                            value={data.static_footer_content || ''}
                            onChange={(e) => setData('static_footer_content', e.target.value)}
                            placeholder="Enter any tax information or custom message to display at the bottom of the document..."
                        />
                        <p className="mt-2 text-[10px] text-gray-500">This text will appear at the very bottom of the {documentTypes.find(d => d.id === selectedDocType)?.label} printout.</p>
                    </div>
                </div>

                <div className="mt-6 flex justify-end items-center gap-4 border-t border-gray-100 pt-4">
                    {recentlySuccessful && (
                        <span className="text-[10px] text-green-600 font-bold uppercase tracking-wider">Saved.</span>
                    )}
                    <CommonButton
                        type="submit"
                        disabled={processing}
                        variant="success"
                    >
                        Save Print Settings
                    </CommonButton>
                </div>
            </form>
        </section>
    );
}
