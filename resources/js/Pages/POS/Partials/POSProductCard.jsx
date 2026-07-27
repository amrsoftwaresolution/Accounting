import React from 'react';

export default function POSProductCard({ item, onClick, currency = '{currency}' }) {
    return (
        <div
            className="bg-white rounded-lg shadow-sm border border-slate-200 cursor-pointer hover:border-primary-500 hover:shadow-md transition-all flex flex-col h-full active:scale-95 overflow-hidden group"
            onClick={onClick}
        >
            <div className="h-24 bg-slate-100 flex items-center justify-center overflow-hidden border-b border-slate-100">
                {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                    <span className="material-symbols-outlined text-slate-300 text-3xl">inventory_2</span>
                )}
            </div>
            <div className="flex-1 flex flex-col p-2.5">
                <div className="flex-1 mb-2">
                    <h3 className="font-bold text-[13px] text-slate-800 line-clamp-2 leading-snug">{item.name}</h3>
                    {item.sku && <p className="text-[10px] text-slate-400 mt-0.5">{item.sku}</p>}
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between mt-auto">
                    <span className="font-black text-primary-600 text-sm">{currency} {Number(item.sale_price).toFixed(2)}</span>
                    <span className="text-xl font-bold text-slate-300 group-hover:text-primary-500 leading-none">+</span>
                </div>
            </div>
        </div>
    );
}
