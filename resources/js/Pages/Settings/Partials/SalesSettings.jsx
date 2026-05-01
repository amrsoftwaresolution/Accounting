import React, { useState } from 'react';
import { useForm, usePage } from '@inertiajs/react';

const SalesSection = ({ title, children, isEditing, onEditClick }) => (
    <div className="bg-white rounded shadow-sm border border-gray-200 mb-4 group relative">
        <div className="p-6">
            <div className="flex justify-between items-start">
                <div className="w-1/3">
                    <h3 className="text-sm text-gray-500 uppercase tracking-wider font-semibold">{title}</h3>
                </div>
                <div className="w-2/3 pr-12">
                    {children}
                </div>
            </div>
        </div>
        {!isEditing && (
            <button
                onClick={onEditClick}
                className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity"
            >
                <span className="material-icons text-blue-600 text-base">edit</span>
            </button>
        )}
    </div>
);

const Row = ({ label, value, isBoldValue = true }) => (
    <div className="flex justify-between py-1 text-sm">
        <span className="text-gray-600">{label}</span>
        <span className={`${isBoldValue ? 'font-semibold' : ''} text-gray-800`}>{value}</span>
    </div>
);

export default function SalesSettings() {
    const { settings } = usePage().props;

    // Initialize Inertia Form
    const { data, setData, post, processing } = useForm({
        preferred_invoice_terms: settings.preferred_invoice_terms || 'Net 30',
        preferred_delivery_method: settings.preferred_delivery_method || 'None',
        shipping_enabled: !!settings.shipping_enabled,
        custom_transaction_numbers_enabled: !!settings.custom_transaction_numbers_enabled,
        service_date_enabled: !!settings.service_date_enabled,
        discount_enabled: !!settings.discount_enabled,
        deposit_enabled: !!settings.deposit_enabled,
        tags_enabled: !!settings.tags_enabled,
        show_product_service_column: !!settings.show_product_service_column,
        show_sku_column: !!settings.show_sku_column,
        track_quantity_price_rate: !!settings.track_quantity_price_rate,
        progress_invoicing_enabled: !!settings.progress_invoicing_enabled,
        reminders_enabled: !!settings.reminders_enabled,
        online_delivery_enabled: !!settings.online_delivery_enabled,
        online_delivery_email_format: settings.online_delivery_email_format || 'Show short summary in email',
        online_delivery_pdf_attached: !!settings.online_delivery_pdf_attached,
        online_delivery_additional_option: settings.online_delivery_additional_option || 'Online invoice',
        statements_show_ageing_table: !!settings.statements_show_ageing_table,
        statements_line_detail: settings.statements_line_detail || 'List each transaction as a single line',
    });

    const [editingSection, setEditingSection] = useState(null);

    const submit = (e) => {
        e.preventDefault();
        post(route('sales.settings.update'), {
            preserveScroll: true,
            onSuccess: () => setEditingSection(null),
        });
    };

    const Toggle = ({ label, field }) => (
        <div className="flex justify-between items-center py-2">
            <span className="text-sm text-gray-600">{label}</span>
            <label className="relative inline-flex items-center cursor-pointer">
                <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={data[field]}
                    onChange={e => setData(field, e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
            </label>
        </div>
    );

    const ActionButtons = () => (
        <div className="flex justify-start gap-3 pt-6 border-t mt-4">
            <button
                type="button"
                onClick={() => setEditingSection(null)}
                className="px-6 py-2 border rounded-full text-sm font-bold hover:bg-gray-50"
            >
                Cancel
            </button>
            <button
                type="submit"
                disabled={processing}
                className="px-8 py-2 bg-green-700 text-white rounded-full text-sm font-bold disabled:opacity-50"
            >
                Save
            </button>
        </div>
    );

    return (
        <form onSubmit={submit} className="space-y-1">
            {/* 1. Sales form content */}
            <SalesSection
                title="Sales form content"
                isEditing={editingSection === 'content'}
                onEditClick={() => setEditingSection('content')}
            >
                {editingSection !== 'content' ? (
                    <>
                        <Row label="Preferred invoice terms" value={data.preferred_invoice_terms} />
                        <Row label="Preferred delivery method" value={data.preferred_delivery_method} />
                        <Row label="Shipping" value={data.shipping_enabled ? "On" : "Off"} />
                        <div className="mt-4 font-bold text-xs uppercase text-gray-400">Custom fields</div>
                        <Row label="Custom transaction numbers" value={data.custom_transaction_numbers_enabled ? "On" : "Off"} />
                        <Row label="Service date" value={data.service_date_enabled ? "On" : "Off"} />
                        <Row label="Discount" value={data.discount_enabled ? "On" : "Off"} />
                        <Row label="Deposit" value={data.deposit_enabled ? "On" : "Off"} />
                        <Row label="Tags" value={data.tags_enabled ? "On" : "Off"} />
                    </>
                ) : (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Preferred invoice terms</span>
                            <select
                                value={data.preferred_invoice_terms}
                                onChange={e => setData('preferred_invoice_terms', e.target.value)}
                                className="border border-gray-300 rounded p-2 text-sm w-48"
                            >
                                <option>Net 30</option>
                                <option>Net 15</option>
                                <option>Due on receipt</option>
                            </select>
                        </div>
                        <Toggle label="Shipping" field="shipping_enabled" />
                        <div className="pt-4">
                            <div className="font-bold text-sm mb-2">Custom fields</div>
                            <Toggle label="Custom transaction numbers" field="custom_transaction_numbers_enabled" />
                            <Toggle label="Service date" field="service_date_enabled" />
                            <Toggle label="Discount" field="discount_enabled" />
                            <Toggle label="Deposit" field="deposit_enabled" />
                            <Toggle label="Tags" field="tags_enabled" />
                        </div>
                        <ActionButtons />
                    </div>
                )}
            </SalesSection>

            {/* 2. Products and services */}
            <SalesSection
                title="Products and services"
                isEditing={editingSection === 'products'}
                onEditClick={() => setEditingSection('products')}
            >
                {editingSection !== 'products' ? (
                    <>
                        <Row label="Show Product/Service column" value={data.show_product_service_column ? "On" : "Off"} />
                        <Row label="Show SKU column" value={data.show_sku_column ? "On" : "Off"} />
                        <Row label="Track quantity and price/rate" value={data.track_quantity_price_rate ? "On" : "Off"} />
                    </>
                ) : (
                    <div className="space-y-4">
                        <Toggle label="Show Product/Service column" field="show_product_service_column" />
                        <Toggle label="Show SKU column" field="show_sku_column" />
                        <Toggle label="Track quantity and price/rate" field="track_quantity_price_rate" />
                        <ActionButtons />
                    </div>
                )}
            </SalesSection>

            {/* 6. Online Delivery */}
            <SalesSection
                title="Online delivery"
                isEditing={editingSection === 'delivery'}
                onEditClick={() => setEditingSection('delivery')}
            >
                {editingSection !== 'delivery' ? (
                    <>
                        <Row label="Email format" value={data.online_delivery_email_format} />
                        <Row label="PDF Attached" value={data.online_delivery_pdf_attached ? "On" : "Off"} />
                    </>
                ) : (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="block text-sm text-gray-600">Statement email format</label>
                            <select
                                value={data.online_delivery_email_format}
                                onChange={e => setData('online_delivery_email_format', e.target.value)}
                                className="w-full border border-gray-300 rounded p-2 text-sm"
                            >
                                <option>Show short summary in email</option>
                                <option>Show full details in email</option>
                            </select>
                        </div>
                        <Toggle label="PDF Attached" field="online_delivery_pdf_attached" />
                        <ActionButtons />
                    </div>
                )}
            </SalesSection>
        </form>
    );
}
