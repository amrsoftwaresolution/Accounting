const fs = require('fs');
let content = fs.readFileSync('resources/js/Pages/Settings/Partials/CompanySettings.jsx', 'utf8');

if (!content.includes('import CommonInput')) {
    content = content.replace(
        /import \{ useForm, router \} from '@inertiajs\/react';/,
        `import { useForm, router } from '@inertiajs/react';\nimport CommonInput from '@/Components/CommonInput';\nimport CommonButton from '@/Components/CommonButton';`
    );
}

// 1. Replace <input type="text" ... /> and <input type="email" ... /> patterns
const inputRegex = /<label className="[^"]+">(.*?)<\/label>\s*<input type="(text|email)" className="[^"]+" value=\{(.*?)\} onChange=\{(.*?)\} (placeholder="(.*?)")?\/>/g;
content = content.replace(inputRegex, (match, label, type, value, onChange, p5, placeholder) => {
    let props = `type="${type}" label="${label}" value={${value}} onChange={${onChange}}`;
    if (placeholder) {
        props += ` placeholder="${placeholder}"`;
    }
    return `<CommonInput ${props} />`;
});

// 1b. Fix Currency Prefix which lacks trailing slash in the original text (Wait, it DOES have trailing slash `/>`)
// Wait, looking at CompanySettings.jsx:
// <input type="text" className="w-full border-gray-300 rounded mt-1 focus:border-green-600 focus:ring-0 text-xs py-1.5" value={infoForm.data.home_currency_prefix} onChange={e => infoForm.setData('home_currency_prefix', e.target.value)} placeholder="e.g. $" />
// Yes, it has `/>`

// 2. Replace <textarea ...></textarea> patterns
const textareaRegex = /<label className="[^"]+">(.*?)<\/label>\s*<textarea className="[^"]+" rows="(\d+)" value=\{(.*?)\} onChange=\{(.*?)\}>.*?<\/textarea>/g;
content = content.replace(textareaRegex, (match, label, rows, value, onChange) => {
    return `<CommonInput type="textarea" label="${label}" rows="${rows}" value={${value}} onChange={${onChange}} />`;
});

// 3. Replace <select ...> patterns
// E.g.: <select className="w-full border-gray-300 rounded mt-1 focus:border-green-600 focus:ring-0 text-xs py-1.5 bg-white" value={legalForm.data.business_type} onChange={e => legalForm.setData('business_type', e.target.value)}>
const selectRegex = /<label className="[^"]+">(.*?)<\/label>\s*<select className="[^"]+" value=\{(.*?)\} onChange=\{(.*?)\}>([\s\S]*?)<\/select>/g;
content = content.replace(selectRegex, (match, label, value, onChange, optionsContent) => {
    return `<CommonInput type="select" label="${label}" value={${value}} onChange={${onChange}}>
        ${optionsContent.trim()}
    </CommonInput>`;
});

// 4. Replace action buttons with CommonButton
const cancelBtnRegex = /<button type="button" onClick=\{(.*?)\} className="px-4 py-1\.5 border border-gray-300 rounded-full font-bold text-xs hover:bg-gray-50 text-gray-700">Cancel<\/button>/g;
content = content.replace(cancelBtnRegex, `<CommonButton type="button" onClick={$1} variant="secondary">Cancel</CommonButton>`);

const saveBtnRegex = /<button type="submit" disabled=\{(.*?)\} className="px-5 py-1\.5 bg-green-700 text-white rounded-full font-bold text-xs hover:bg-green-800 disabled:opacity-50">Save<\/button>/g;
content = content.replace(saveBtnRegex, `<CommonButton type="submit" disabled={$1} variant="success">Save</CommonButton>`);

fs.writeFileSync('resources/js/Pages/Settings/Partials/CompanySettings.jsx', content);
