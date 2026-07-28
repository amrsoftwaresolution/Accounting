import React, { useMemo } from 'react';

export default function POSCartItem({ item, warrantyPolicies = [], onRemove, onUpdateQty, onUpdateDiscount, onUpdateWarranty, currency = '{currency}' }) {
    const visiblePolicies = useMemo(() => {
        if (!warrantyPolicies.length) {
            return [];
        }

        if (!item?.itemType) {
            return warrantyPolicies;
        }

        const isService = item.itemType === 'service';
        return warrantyPolicies.filter(policy => isService ? policy.applies_to === 'service' : policy.applies_to === 'product');
    }, [item?.itemType, warrantyPolicies]);

    const warrantyEnabled = Boolean(item?.warranty);
    const currentWarranty = item?.warranty || { policy_id: visiblePolicies[0]?.id || '', start_date: new Date().toISOString().split('T')[0] };

    const handleToggleWarranty = () => {
        if (warrantyEnabled) {
            onUpdateWarranty(item.product, null);
            return;
        }

        onUpdateWarranty(item.product, {
            policy_id: visiblePolicies[0]?.id || '',
            start_date: new Date().toISOString().split('T')[0],
        });
    };

    const handlePolicyChange = (e) => {
        onUpdateWarranty(item.product, {
            ...(item.warranty || {}),
            policy_id: e.target.value,
        });
    };

    const handleStartDateChange = (e) => {
        onUpdateWarranty(item.product, {
            ...(item.warranty || {}),
            start_date: e.target.value,
        });
    };

    return (
        <div className="bg-white p-2 rounded border border-slate-200 shadow-sm">
            <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                    <h4 className="font-bold text-xs text-slate-800 leading-tight">{item.name}</h4>
                    <p className="text-[10px] text-slate-500">{currency} {Number(item.rate).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                </div>
                <button onClick={() => onRemove(item.product)} className="text-slate-300 hover:text-red-500 leading-none px-1">
                    &times;
                </button>
            </div>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 bg-slate-100 rounded p-0.5">
                    <button onClick={() => onUpdateQty(item.product, -1)} className="w-5 h-5 flex items-center justify-center bg-white rounded text-slate-600 text-xs shadow-sm">-</button>
                    <span className="text-xs font-bold w-5 text-center">{Number(item.qty).toString()}</span>
                    <button onClick={() => onUpdateQty(item.product, 1)} className="w-5 h-5 flex items-center justify-center bg-white rounded text-slate-600 text-xs shadow-sm">+</button>
                </div>

                <div className="flex items-center gap-1">
                    <span className="text-[9px] text-slate-400">Disc %:</span>
                    <input
                        type="number"
                        className="w-12 text-xs py-0.5 px-1 border-slate-300 rounded text-right"
                        value={item.discount}
                        onChange={(e) => onUpdateDiscount(item.product, e.target.value)}
                        min="0" max="100"
                    />
                </div>
                <div className="font-bold text-xs text-primary-600">
                    {currency} {Number(item.amount).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                </div>
            </div>

            <div className="mt-2 border-t border-slate-100 pt-2">
                <button
                    type="button"
                    onClick={handleToggleWarranty}
                    className="text-[10px] font-semibold text-primary-600 hover:underline"
                >
                    {warrantyEnabled ? '✓ Warranty Applied' : 'Apply Warranty'}
                </button>

                {warrantyEnabled && (
                    <div className="mt-2 space-y-1 rounded bg-slate-50 p-2">
                        <label className="text-[9px] font-bold uppercase tracking-wide text-slate-500">Policy</label>
                        <select
                            value={currentWarranty.policy_id || ''}
                            onChange={handlePolicyChange}
                            className="w-full rounded border-slate-300 text-xs py-1 px-2"
                        >
                            <option value="">Select policy</option>
                            {visiblePolicies.map(policy => (
                                <option key={policy.id} value={policy.id}>{policy.name}</option>
                            ))}
                        </select>

                        <label className="text-[9px] font-bold uppercase tracking-wide text-slate-500">Start Date</label>
                        <input
                            type="date"
                            value={currentWarranty.start_date || new Date().toISOString().split('T')[0]}
                            onChange={handleStartDateChange}
                            className="w-full rounded border-slate-300 text-xs py-1 px-2"
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
