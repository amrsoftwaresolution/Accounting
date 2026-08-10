import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import CommonButton from '@/Components/CommonButton';

const TimeSection = ({ title, isEditing, onEdit, onCancel, onSave, children }) => (
    <div className={`py-4 border-b border-gray-100 last:border-0 relative group ${isEditing ? 'bg-gray-55 -mx-6 px-6' : ''}`}>
        <div className="flex justify-between items-start">
            {/* Section Title */}
            <div className="w-1/4">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{title}</h3>
            </div>

            {/* Section Content */}
            <div className="w-3/4 pr-12">
                {children}

                {isEditing && (
                    <div className="mt-4 flex space-x-2">
                        <CommonButton
                            onClick={onCancel}
                            variant="secondary"
                        >
                            Cancel
                        </CommonButton>
                        <CommonButton
                            onClick={onSave}
                            variant="primary"
                        >
                            Save
                        </CommonButton>
                    </div>
                )}
            </div>
        </div>

        {/* Edit Icon - Only visible when not editing */}
        {!isEditing && (
            <button
                onClick={onEdit}
                className="absolute top-4 right-2 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
            >
                <span className="material-icons text-lg">edit</span>
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
        <div className="bg-white p-5 min-h-[400px] rounded shadow-sm border border-gray-200">
            {/* General Section */}
            <TimeSection
                title="General"
                isEditing={activeSection === 'general'}
                onEdit={() => setActiveSection('general')}
                onCancel={handleCancel}
                onSave={() => handleSave('general')}
            >
                <div className="flex justify-between items-center py-1.5 text-xs">
                    <span className="text-gray-600">First day of work week</span>
                    {activeSection === 'general' ? (
                        <select
                            value={data.work_week_start}
                            onChange={e => setData('work_week_start', e.target.value)}
                            className="w-44 border-gray-300 rounded text-xs focus:ring-green-500 focus:border-green-500 py-1 bg-white"
                        >
                            <option>Sunday</option>
                            <option>Monday</option>
                            <option>Tuesday</option>
                        </select>
                    ) : (
                        <span className="font-semibold text-gray-800">{data.work_week_start}</span>
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
                <div className="space-y-3 text-xs">
                    {/* Show Service Field */}
                    <div className="flex justify-between items-center py-1">
                        <div className="flex items-center space-x-1">
                            <span className="text-gray-600">Show service field</span>
                            <span className="material-icons text-[10px] text-gray-400 border border-gray-400 rounded-full p-0.5 scale-75">help_outline</span>
                        </div>
                        {activeSection === 'timesheet' ? (
                            <button
                                onClick={() => setData('show_service_field', !data.show_service_field)}
                                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors scale-90 ${data.show_service_field ? 'bg-green-600' : 'bg-gray-300'}`}
                            >
                                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${data.show_service_field ? 'translate-x-4.5' : 'translate-x-1'}`} />
                            </button>
                        ) : (
                            <span className="font-semibold text-gray-800">{data.show_service_field ? 'On' : 'Off'}</span>
                        )}
                    </div>

                    {/* Allow billable time */}
                    <div className="flex justify-between items-center py-1">
                        <div className="flex items-center space-x-1">
                            <span className="text-gray-600">Allow time to be billable</span>
                            <span className="material-icons text-[10px] text-gray-400 border border-gray-400 rounded-full p-0.5 scale-75">help_outline</span>
                        </div>
                        {activeSection === 'timesheet' ? (
                            <button
                                onClick={() => setData('allow_billable_time', !data.allow_billable_time)}
                                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors scale-90 ${data.allow_billable_time ? 'bg-green-600' : 'bg-gray-300'}`}
                            >
                                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${data.allow_billable_time ? 'translate-x-4.5' : 'translate-x-1'}`} />
                            </button>
                        ) : (
                            <span className="font-semibold text-gray-800">{data.allow_billable_time ? 'On' : 'Off'}</span>
                        )}
                    </div>

                    {/* Show billing rate to users */}
                    {activeSection === 'timesheet' && (
                        <div className="flex items-center space-x-2 pt-1 ml-3">
                            <input
                                type="checkbox"
                                checked={data.show_billing_rate}
                                onChange={e => setData('show_billing_rate', e.target.checked)}
                                className="rounded text-green-700 focus:ring-green-500 h-3.5 w-3.5 border-gray-300"
                            />
                            <div className="flex items-center space-x-1">
                                <span className="text-gray-600">Show billing rate to users entering time</span>
                                <span className="material-icons text-[10px] text-gray-400 border border-gray-400 rounded-full p-0.5 scale-75">help_outline</span>
                            </div>
                        </div>
                    )}
                </div>
            </TimeSection>
        </div>
    );
}
