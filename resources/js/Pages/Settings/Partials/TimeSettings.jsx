import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';

const TimeSection = ({ title, isEditing, onEdit, onCancel, onSave, children }) => (
    <div className={`py-6 border-b border-gray-100 last:border-0 relative group ${isEditing ? 'bg-gray-50 -mx-6 px-6' : ''}`}>
        <div className="flex justify-between items-start">
            {/* Section Title */}
            <div className="w-1/4">
                <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
            </div>

            {/* Section Content */}
            <div className="w-3/4 pr-12">
                {children}

                {isEditing && (
                    <div className="mt-6 flex space-x-3">
                        <button
                            onClick={onCancel}
                            className="px-6 py-1.5 border border-green-700 text-green-700 font-bold rounded-sm text-sm hover:bg-green-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onSave}
                            className="px-8 py-1.5 bg-green-700 text-white font-bold rounded-sm text-sm hover:bg-green-800 transition-colors"
                        >
                            Save
                        </button>
                    </div>
                )}
            </div>
        </div>

        {/* Edit Icon - Only visible when not editing */}
        {!isEditing && (
            <button
                onClick={onEdit}
                className="absolute top-6 right-2 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
            >
                <span className="material-icons text-xl">edit</span>
            </button>
        )}
    </div>
);

export default function TimeSettings({ settings }) {
    const [activeSection, setActiveSection] = useState(null);

    const { data, setData, post, reset } = useForm({
        work_week_start: settings?.work_week_start ?? 'Monday',
        show_service_field: settings?.show_service_field ?? true,
        allow_billable_time: settings?.allow_billable_time ?? true,
        show_billing_rate: settings?.show_billing_rate ?? false,
    });

    const handleSave = (sectionName) => {
        post(route('time.settings.update'), {
            preserveScroll: true,
            onSuccess: () => setActiveSection(null),
        });
    };

    const handleCancel = () => {
        reset();
        setActiveSection(null);
    };

    return (
        <div className="bg-white p-6 min-h-[400px]">
            {/* General Section */}
            <TimeSection
                title="General"
                isEditing={activeSection === 'general'}
                onEdit={() => setActiveSection('general')}
                onCancel={handleCancel}
                onSave={() => handleSave('general')}
            >
                <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-gray-600">First day of work week</span>
                    {activeSection === 'general' ? (
                        <select
                            value={data.work_week_start}
                            onChange={e => setData('work_week_start', e.target.value)}
                            className="w-48 border-gray-300 rounded text-sm focus:ring-green-500 focus:border-green-500"
                        >
                            <option>Sunday</option>
                            <option>Monday</option>
                            <option>Tuesday</option>
                        </select>
                    ) : (
                        <span className="text-sm text-gray-800">{data.work_week_start}</span>
                    )}
                </div>
            </TimeSection>

            {/* Timesheet Section */}
            <TimeSection
                title="Timesheet"
                isEditing={activeSection === 'timesheet'}
                onEdit={() => setActiveSection('timesheet')}
                onCancel={handleCancel}
                onSave={() => handleSave('timesheet')}
            >
                <div className="space-y-4">
                    {/* Show Service Field */}
                    <div className="flex justify-between items-center py-1">
                        <div className="flex items-center space-x-1">
                            <span className="text-sm text-gray-600">Show service field</span>
                            <span className="material-icons text-xs text-gray-400 border border-gray-400 rounded-full p-0.5 scale-75">help_outline</span>
                        </div>
                        {activeSection === 'timesheet' ? (
                            <button
                                onClick={() => setData('show_service_field', !data.show_service_field)}
                                className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${data.show_service_field ? 'bg-green-600' : 'bg-gray-300'}`}
                            >
                                <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${data.show_service_field ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        ) : (
                            <span className="text-sm font-semibold text-gray-800">{data.show_service_field ? 'On' : 'Off'}</span>
                        )}
                    </div>

                    {/* Allow billable time */}
                    <div className="flex justify-between items-center py-1">
                        <div className="flex items-center space-x-1">
                            <span className="text-sm text-gray-600">Allow time to be billable</span>
                            <span className="material-icons text-xs text-gray-400 border border-gray-400 rounded-full p-0.5 scale-75">help_outline</span>
                        </div>
                        {activeSection === 'timesheet' ? (
                            <button
                                onClick={() => setData('allow_billable_time', !data.allow_billable_time)}
                                className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${data.allow_billable_time ? 'bg-green-600' : 'bg-gray-300'}`}
                            >
                                <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${data.allow_billable_time ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        ) : (
                            <span className="text-sm font-semibold text-gray-800">{data.allow_billable_time ? 'On' : 'Off'}</span>
                        )}
                    </div>

                    {/* Show billing rate to users (Visible only in edit mode as per image 2) */}
                    {activeSection === 'timesheet' && (
                        <div className="flex items-center space-x-3 pt-2 ml-4">
                            <input
                                type="checkbox"
                                checked={data.show_billing_rate}
                                onChange={e => setData('show_billing_rate', e.target.checked)}
                                className="rounded text-green-700 focus:ring-green-500 h-4 w-4 border-gray-300"
                            />
                            <div className="flex items-center space-x-1">
                                <span className="text-sm text-gray-600">Show billing rate to users entering time</span>
                                <span className="material-icons text-xs text-gray-400 border border-gray-400 rounded-full p-0.5 scale-75">help_outline</span>
                            </div>
                        </div>
                    )}
                </div>
            </TimeSection>

            {/* Bottom Links from Image */}
            <div className="mt-12 flex justify-center space-x-4 text-xs text-blue-600">
                <a href="#" className="hover:underline">Privacy</a>
                <span className="text-gray-300">|</span>
                <a href="#" className="hover:underline">Security</a>
                <span className="text-gray-300">|</span>
                <a href="#" className="hover:underline">Terms of Service</a>
            </div>
        </div>
    );
}
