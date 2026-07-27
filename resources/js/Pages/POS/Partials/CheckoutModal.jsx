import React from 'react';
import CommonButton from '@/Components/CommonButton';
import SearchableSelect from '@/Components/SearchableSelect';

export default function CheckoutModal({ 
    isOpen, 
    onClose, 
    onConfirm, 
    totalAmount, 
    data, 
    setData, 
    paymentMethods, 
    processing,
    isEditMode,
    currency = '{currency}'
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm flex flex-col">
                <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 rounded-t-xl">
                    <h3 className="font-bold text-slate-800">
                        {isEditMode ? 'Update Sale' : 'Complete Sale'}
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none">&times;</button>
                </div>
                <form onSubmit={onConfirm} className="p-4 space-y-4">
                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Total Amount</label>
                        <div className="text-2xl font-black text-primary-600">{currency} {Number(totalAmount).toFixed(2)}</div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Pay Method</label>
                        <select
                            className="w-full text-sm py-2 border-slate-300 rounded shadow-sm focus:border-primary-500 focus:ring-primary-500"
                            value={data.paymentMethod}
                            onChange={e => setData('paymentMethod', e.target.value)}
                            required
                        >
                            <option value="">Select Method</option>
                            {paymentMethods.map(pm => <option key={pm.id} value={pm.id}>{pm.name}</option>)}
                        </select>
                    </div>

                    <div className="mb-4">
                        <SearchableSelect
                            label="Deposit To"
                            placeholder="Select Account"
                            value={data.depositTo}
                            onChange={val => setData('depositTo', val)}
                            fetchUrl={route('api.accounts', { account_type: 'bank,asset' })}
                            required
                        />
                    </div>

                    <div className="pt-2 flex gap-2">
                        <CommonButton variant="ghost" type="button" onClick={onClose} className="w-1/3 justify-center">Cancel</CommonButton>
                        <CommonButton variant="primary" type="submit" className="w-2/3 justify-center" processing={processing}>
                            {isEditMode ? 'Confirm Update' : 'Confirm & Print'}
                        </CommonButton>
                    </div>
                </form>
            </div>
        </div>
    );
}
