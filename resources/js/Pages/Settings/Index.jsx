// resources/js/Pages/Settings/Index.jsx
import SettingsLayout from './Layout/SettingsLayout';
import CompanySettings from './Partials/CompanySettings';
import SalesSettings from './Partials/SalesSettings';
import ExpenseSettings from './Partials/ExpenseSettings';
import AdvancedSettings from './Partials/AdvancedSettings';
import TimeSettings from './Partials/TimeSettings';

export default function Index({ auth, tab, settings, currencies }) {
    return (
        <SettingsLayout activeTab={tab}>
            {tab === 'company' && <CompanySettings settings={settings} currencies={currencies} />}
            {tab === 'sales' && <SalesSettings settings={settings?.settings_metadata?.sales} />}
            {tab === 'expenses' && <ExpenseSettings settings={settings?.settings_metadata?.expenses} />}
            {tab === 'advanced' && <AdvancedSettings settings={settings?.settings_metadata?.advanced} />}
            {tab === 'time' && <TimeSettings settings={settings?.settings_metadata?.time} />}

            {/* Fallback code remains same */}
        </SettingsLayout>
    );
}
