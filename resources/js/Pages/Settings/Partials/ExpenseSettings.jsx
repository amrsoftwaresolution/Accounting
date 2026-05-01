import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';

export default function ExpenseSettings({ settings }) {
    const [isEditing, setIsEditing] = useState(false);

    // Initialize form with existing settings
    const { data, setData, post, processing, reset } = useForm({
        show_tags: settings?.show_tags ?? true,
        bill_payment_terms: settings?.bill_payment_terms ?? 'Net 30',
    });

    const handleSave = () => {
        post(route('expense.settings.update'), {
            onSuccess: () => setIsEditing(false),
        });
    };

    const handleCancel = () => {
        reset();
        setIsEditing(false);
    };

    return (
        <div className="bg-white rounded shadow-sm border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className={`p-6 border-b border-gray-100 flex justify-between items-center ${isEditing ? 'bg-gray-50' : ''}`}>
                <h2 className="text-xl text-gray-700">Expenses</h2>
                {!isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="text-green-700 font-bold text-sm hover:underline"
                    >
                        Edit
                    </button>
                )}
            </div>

            <div className="p-6">
                {/* Bills and Expenses Section */}
                <div className="flex justify-between items-start mb-8">
                    <div className="text-sm font-bold text-gray-700 w-1/4">Bills and expenses</div>
                    <div className="w-3/4 space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">
                                Show Tags field on expense and purchase forms
                                <span className="ml-2 inline-block px-1.5 py-0.5 border border-gray-400 rounded-full text-[10px] text-gray-500 font-bold">i</span>
                            </span>

                            {isEditing ? (
                                <button
                                    onClick={() => setData('show_tags', !data.show_tags)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${data.show_tags ? 'bg-green-600' : 'bg-gray-300'}`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${data.show_tags ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            ) : (
                                <span className="text-sm font-bold">{data.show_tags ? 'On' : 'Off'}</span>
                            )}
                        </div>

                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Default bill payment terms</span>
                            {isEditing ? (
                                <select
                                    value={data.bill_payment_terms}
                                    onChange={(e) => setData('bill_payment_terms', e.target.value)}
                                    className="w-48 border-gray-300 rounded shadow-sm text-sm focus:border-green-500 focus:ring-green-500"
                                >
                                    <option value="Due on receipt">Due on receipt</option>
                                    <option value="Net 15">Net 15</option>
                                    <option value="Net 30">Net 30</option>
                                    <option value="Net 60">Net 60</option>
                                </select>
                            ) : (
                                <span className="text-sm font-bold text-gray-400 italic">{data.bill_payment_terms}</span>
                            )}
                        </div>
                    </div>
                </div>

                <hr className="my-6 border-gray-100" />

                {/* Purchase Orders Section */}
                <div className="flex justify-between items-center">
                    <div className="text-sm font-bold text-gray-700 w-1/4">Purchase orders</div>
                    <div className="w-3/4 flex justify-between items-center">
                        <p className="text-sm text-gray-500 max-w-xs">
                            Your current version of QuickBooks doesn't include purchase orders
                        </p>
                        <button className="bg-green-700 text-white px-6 py-2 rounded-full font-bold text-sm hover:bg-green-800 transition-colors">
                            Upgrade
                        </button>
                    </div>
                </div>
            </div>

            {/* Edit Mode Footer */}
            {isEditing && (
                <div className="p-6 border-t border-gray-100 flex justify-center space-x-4 bg-white">
                    <button
                        onClick={handleCancel}
                        className="px-6 py-2 text-green-700 font-bold border border-gray-300 rounded-full hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={processing}
                        className="px-8 py-2 bg-green-700 text-white font-bold rounded-full hover:bg-green-800 disabled:opacity-50"
                    >
                        {processing ? 'Saving...' : 'Save'}
                    </button>
                </div>
            )}
        </div>
    );
}
