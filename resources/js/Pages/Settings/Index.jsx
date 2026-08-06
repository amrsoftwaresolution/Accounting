import SettingsLayout from './Layout/SettingsLayout';
import CompanySettings from './Partials/CompanySettings';
import PrintSettings from './Partials/PrintSettings';

export default function Index({ auth, tab, settings, currencies }) {
    return (
        <SettingsLayout activeTab={tab}>
            {tab === 'company' && <CompanySettings settings={settings} currencies={currencies} />}
            {tab === 'print' && <PrintSettings settings={settings} />}
            {/* Fallback code remains same */}
        </SettingsLayout>
    );
}
