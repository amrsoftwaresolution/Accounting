import React from 'react';

const AdvancedSection = ({ title, children, showEdit = true }) => (
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
        {showEdit && (
            <button className="absolute top-6 right-6 text-green-700 font-bold text-sm hover:underline">
                Edit
            </button>
        )}
    </div>
);

const Row = ({ label, value, subValue = null }) => (
    <div className="py-2">
        <div className="flex justify-between text-sm">
            <span className="text-gray-500">{label}</span>
            <span className="font-semibold text-gray-800 text-right">{value}</span>
        </div>
        {subValue && <div className="text-xs text-blue-600 hover:underline cursor-pointer">{subValue}</div>}
    </div>
);

export default function AdvancedSettings() {
    return (
        <div className="pb-20">
            {/* Accounting Method */}
            <AdvancedSection title="Accounting method">
                <p className="text-sm text-gray-800">Accrual</p>
            </AdvancedSection>

            {/* Communications */}
            <AdvancedSection title="Communications with Intuit" showEdit={false}>
                <a href="#" className="text-sm text-blue-600 hover:underline">Marketing preferences</a>
            </AdvancedSection>

            {/* Accounting */}
            <AdvancedSection title="Accounting">
                <Row label="First month of financial year" value="January" />
                <Row label="First month of tax year" value="Same as financial year" />
                <Row label="Accounting method" value="Accrual" />
                <Row label="Close the books" value="Off" />
            </AdvancedSection>

            {/* Company Type */}
            <AdvancedSection title="Company type">
                <Row label="Tax form" value="Partnership or limited liability company" />
            </AdvancedSection>

            {/* Chart of Accounts */}
            <AdvancedSection title="Chart of accounts">
                <Row label="Enable account numbers" value="On" />
                <Row label="Discount account" value="Discounts given" />
            </AdvancedSection>

            {/* Automation */}
            <AdvancedSection title="Automation">
                <Row label="Pre-fill forms with previously entered content" value="On" />
                <Row label="Automatically invoice unbilled activity" value="Off" />
                <Row label="Automatically apply bill payments" value="On" />
            </AdvancedSection>

            {/* Language */}
            <AdvancedSection title="Language">
                <Row label="Language" value="English" />
            </AdvancedSection>

            {/* Currency */}
            <AdvancedSection title="Currency">
                <Row label="Home Currency" value="Sri Lankan Rupee" />
                <Row label="Multicurrency" value="On" subValue="Manage Currencies" />
            </AdvancedSection>

            {/* Other Preferences */}
            <AdvancedSection title="Other preferences">
                <Row label="Date format" value="mm/dd/yyyy" />
                <Row label="Currency format" value="$123,456.00" />
                <Row label="Warn me if duplicate cheque number is used" value="On" />
                <Row label="Warn me if I enter a bill number that's already been used for that supplier" value="Off" />
                <Row label="Warn me if duplicate journal number is used" value="Off" />
                <Row label="Sign me out if inactive for" value="1 hour" />
            </AdvancedSection>

            {/* Personal Cloud Backup */}
            <div className="bg-white rounded shadow-sm border border-gray-200 p-6">
                <h3 className="text-sm text-gray-500 uppercase tracking-wider font-semibold mb-4">Personal cloud backup</h3>
                <p className="text-sm text-gray-600 mb-4">Back up company data to a personal online storage account.</p>
                <p className="text-sm text-gray-600">Back up data using the CSV format, and keep all original attachments.</p>
            </div>
        </div>
    );
}
