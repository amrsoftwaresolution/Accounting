import CommonInput from './CommonInput';

/**
 * Reusable Address section for Customer and Supplier forms.
 */
export default function AddressForm({ data, setData, errors = {} }) {
    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-primary-600/10 text-primary-600">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </div>
                    <h3 className="text-[11px] font-bold text-slate-700 uppercase tracking-widest">Address Details</h3>
                </div>
                <button type="button" className="text-[10px] font-bold text-primary-600 hover:text-primary-700 uppercase tracking-widest transition-colors">
                    Preview Address
                </button>
            </div>

            <div className="p-6 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <CommonInput
                        label="Street Address 1"
                        value={data.address_line_1 || ''}
                        onChange={e => setData('address_line_1', e.target.value)}
                        error={errors.address_line_1}
                        placeholder="House no, Building name"
                    />
                    <CommonInput
                        label="Street Address 2"
                        value={data.address_line_2 || ''}
                        onChange={e => setData('address_line_2', e.target.value)}
                        error={errors.address_line_2}
                        placeholder="Area, Landmark"
                    />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                    <CommonInput
                        label="City"
                        containerClass="md:col-span-2"
                        value={data.city || ''}
                        onChange={e => setData('city', e.target.value)}
                        error={errors.city}
                        placeholder="Enter City"
                    />
                    <CommonInput
                        label="Province"
                        containerClass="md:col-span-2"
                        value={data.province || ''}
                        onChange={e => setData('province', e.target.value)}
                        error={errors.province}
                        placeholder="Enter State/Province"
                    />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                    <CommonInput
                        label="Postal Code"
                        containerClass="md:col-span-2"
                        value={data.postal_code || ''}
                        onChange={e => setData('postal_code', e.target.value)}
                        error={errors.postal_code}
                        placeholder="e.g. 10001"
                    />
                    <CommonInput
                        label="Country"
                        containerClass="md:col-span-2"
                        value={data.country || ''}
                        onChange={e => setData('country', e.target.value)}
                        error={errors.country}
                        placeholder="e.g. United Kingdom"
                    />
                </div>
            </div>
        </div>
    );
}
