import React from 'react';

export default function POSCartItem({ item, onRemove, onUpdateQty, onUpdateDiscount, currency = '{currency}' }) {
    return (
        <div className="bg-white p-2 rounded border border-slate-200 shadow-sm">
            <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                    <h4 className="font-bold text-xs text-slate-800 leading-tight">{item.name}</h4>
                    <p className="text-[10px] text-slate-500">{currency} {Number(item.rate).toFixed(2)}</p>
                </div>
                <button onClick={() => onRemove(item.product)} className="text-slate-300 hover:text-red-500 leading-none px-1">
                    &times;
                </button>
            </div>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 bg-slate-100 rounded p-0.5">
                    <button onClick={() => onUpdateQty(item.product, -1)} className="w-5 h-5 flex items-center justify-center bg-white rounded text-slate-600 text-xs shadow-sm">-</button>
                    <span className="text-xs font-bold w-5 text-center">{item.qty}</span>
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
                    {currency} {Number(item.amount).toFixed(2)}
                </div>
            </div>
        </div>
    );
}
