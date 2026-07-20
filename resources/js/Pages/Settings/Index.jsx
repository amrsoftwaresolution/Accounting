// resources/js/Pages/Settings/Index.jsx
import SettingsLayout from './Layout/SettingsLayout';
import CompanySettings from './Partials/CompanySettings';
import AdvancedSettings from './Partials/AdvancedSettings';
import TimeSettings from './Partials/TimeSettings';

import PrintSettings from './Partials/PrintSettings';

export default function Index({ auth, tab, settings, currencies }) {
    return (
        <SettingsLayout activeTab={tab}>
            {tab === 'company' && <CompanySettings settings={settings} currencies={currencies} />}
            {tab === 'advanced' && <AdvancedSettings settings={settings} />}
            {tab === 'print' && <PrintSettings printSettings={settings?.settings_metadata?.print_settings || []} companySettings={settings} />}

            {/* Fallback code remains same */}
        </SettingsLayout>
    );
}
