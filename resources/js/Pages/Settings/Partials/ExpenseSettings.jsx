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
            <div className={`p-5 border-b border-gray-100 flex justify-between items-center ${isEditing ? 'bg-gray-50' : ''}`}>
                <h2 className="text-xs text-gray-400 font-bold uppercase tracking-wider">Expenses</h2>
                {!isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="text-green-700 font-bold text-xs hover:underline"
                    >
                        Edit
                    </button>
                )}
            </div>

            <div className="p-5">
                {/* Bills and Expenses Section */}
                <div className="flex justify-between items-start mb-6">
                    <div className="text-xs font-bold text-gray-500 w-1/4 uppercase tracking-wider">Bills and expenses</div>
                    <div className="w-3/4 space-y-3">
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-gray-600">
                                Show Tags field on expense and purchase forms
                                <span className="ml-1.5 inline-block px-1 border border-gray-400 rounded-full text-[9px] text-gray-400 font-bold scale-75">i</span>
                            </span>

                            {isEditing ? (
                                <button
                                    onClick={() => setData('show_tags', !data.show_tags)}
                                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors scale-90 ${data.show_tags ? 'bg-green-600' : 'bg-gray-300'}`}
                                >
                                    <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${data.show_tags ? 'translate-x-4.5' : 'translate-x-1'}`} />
                                </button>
                            ) : (
                                <span className="font-bold text-gray-800">{data.show_tags ? 'On' : 'Off'}</span>
                            )}
                        </div>

                        <div className="flex justify-between items-center text-xs">
                            <span className="text-gray-600">Default bill payment terms</span>
                            {isEditing ? (
                                <select
                                    value={data.bill_payment_terms}
                                    onChange={(e) => setData('bill_payment_terms', e.target.value)}
                                    className="w-44 border border-gray-300 rounded text-xs focus:border-green-500 focus:ring-green-500 py-1 bg-white"
                                >
                                    <option value="Due on receipt">Due on receipt</option>
                                    <option value="Net 15">Net 15</option>
                                    <option value="Net 30">Net 30</option>
                                    <option value="Net 60">Net 60</option>
                                </select>
                            ) : (
                                <span className="font-bold text-gray-800">{data.bill_payment_terms}</span>
                            )}
                        </div>
                    </div>
                </div>

                <hr className="my-5 border-gray-100" />

                {/* Purchase Orders Section */}
                <div className="flex justify-between items-center">
                    <div className="text-xs font-bold text-gray-500 w-1/4 uppercase tracking-wider">Purchase orders</div>
                    <div className="w-3/4 flex justify-between items-center text-xs">
                        <p className="text-gray-400 max-w-xs italic text-[11px]">
                            Your current version of QuickBooks doesn't include purchase orders
                        </p>
                        <button className="bg-green-700 text-white px-5 py-1 rounded-full font-bold text-xs hover:bg-green-800 transition-colors">
                            Upgrade
                        </button>
                    </div>
                </div>
            </div>

            {/* Edit Mode Footer */}
            {isEditing && (
                <div className="p-4 border-t border-gray-100 flex justify-center space-x-3 bg-white">
                    <button
                        onClick={handleCancel}
                        className="px-5 py-1.5 text-green-700 font-bold border border-gray-300 rounded-full hover:bg-gray-50 text-xs"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={processing}
                        className="px-6 py-1.5 bg-green-700 text-white font-bold rounded-full hover:bg-green-800 disabled:opacity-50 text-xs"
                    >
                        {processing ? 'Saving...' : 'Save'}
                    </button>
                </div>
            )}
        </div>
    );
}
