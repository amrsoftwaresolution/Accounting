// resources/js/Pages/Settings/Index.jsx
import SettingsLayout from './Layout/SettingsLayout';
import CompanySettings from './Partials/CompanySettings';
import TimeSettings from './Partials/TimeSettings';


export default function Index({ auth, tab, settings, currencies }) {
    return (
        <SettingsLayout activeTab={tab}>
            {tab === 'company' && <CompanySettings settings={settings} currencies={currencies} />}
            {/* Fallback code remains same */}
        </SettingsLayout>
    );
}
