import { useState } from "react";
import SearchableSelect from "@/Components/SearchableSelect";

export default function LineItemsTable({
    columns,
    items,
    handleItemChange,
    addRow,
    removeRow,
    moveRow,
    clearRows,
    totals,
    hideActions = false,
    setItems
}) {
    const [draggedIndex, setDraggedIndex] = useState(null);

    const onDragStart = (e, index) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = "move";
        // Set a ghost image or just let it be
    };

    const onDragOver = (e, index) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === index) return;

        // Simple reordering logic
        moveRow(draggedIndex, index > draggedIndex ? 'down' : 'up');
        setDraggedIndex(index);
    };

    const onDragEnd = () => {
        setDraggedIndex(null);
    };

    return (
        <div className="mt-8">
            <div className="overflow-x-auto border border-slate-200 rounded-lg shadow-sm bg-white">
                <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="w-8 px-2 py-2"></th>
                            <th className="w-8 px-2 py-2"></th>
                            {columns.map((col) => (
                                <th key={col.key} className={`px-3 py-2 text-[10px] font-bold text-slate-500 uppercase ${col.className || ''}`}>{col.label}</th>
                            ))}
                            <th className="w-12 px-3 py-2"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, index) => (
                            <tr
                                key={index}
                                draggable
                                onDragStart={(e) => onDragStart(e, index)}
                                onDragOver={(e) => onDragOver(e, index)}
                                onDragEnd={onDragEnd}
                                className={`border-b border-slate-100 group hover:bg-slate-50/50 transition-all ${draggedIndex === index ? 'opacity-40 bg-blue-50' : ''}`}
                            >
                                <td className="px-1 py-2 align-middle w-8">
                                    <div className="flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="cursor-grab active:cursor-grabbing p-1 hover:bg-slate-100 rounded text-slate-300 hover:text-slate-600 transition-colors">
                                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M7 2a2 2 0 100 4 2 2 0 000-4zm3 0a2 2 0 100 4 2 2 0 000-4zm3 0a2 2 0 100 4 2 2 0 000-4zM7 9a2 2 0 100 4 2 2 0 000-4zm3 0a2 2 0 100 4 2 2 0 000-4zm3 0a2 2 0 100 4 2 2 0 000-4zm-6 7a2 2 0 100 4 2 2 0 000-4zm3 0a2 2 0 100 4 2 2 0 000-4zm3 0a2 2 0 100 4 2 2 0 000-4z" />
                                            </svg>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-1 py-2 align-middle w-8">
                                    <button
                                        type="button"
                                        onClick={addRow}
                                        className="text-primary opacity-40 hover:opacity-100 transition-opacity hover:scale-110 p-1"
                                    >
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" />
                                        </svg>
                                    </button>
                                </td>
                                {columns.map((col) => (
                                    <td key={col.key} className="px-2 py-2">
                                        {col.options ? (
                                            <div className="relative group/select">
                                                <SearchableSelect
                                                    value={item[col.key] || ""}
                                                    onChange={(val) => handleItemChange(index, col.key, val)}
                                                    options={col.options}
                                                    placeholder={col.placeholder}
                                                    initialLimit={10}
                                                    className="border border-slate-200 rounded px-2 py-1.5 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20 bg-white"
                                                />
                                            </div>
                                        ) : (
                                            <div className="relative">
                                                <input
                                                    type={col.type || "text"}
                                                    className={`w-full border border-slate-200 rounded px-3 py-1.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none transition-all ${col.inputClass || ''}`}
                                                    value={item[col.key] || ""}
                                                    onChange={(e) => handleItemChange(index, col.key, e.target.value)}
                                                    placeholder={col.placeholder || ""}
                                                />
                                                {col.type === 'date' && (
                                                    <svg className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                )}
                                            </div>
                                        )}
                                    </td>
                                ))}
                                <td className="px-3 py-2 text-right w-12">
                                    <button
                                        type="button"
                                        onClick={() => removeRow(index)}
                                        className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded transition-all"
                                    >
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    {totals && (
                        <tfoot className="bg-slate-50/50 border-t-2 border-slate-200">
                            <tr>
                                <td colSpan="2"></td>
                                {columns.map((col) => (
                                    <td key={col.key} className={`px-3 py-4 text-sm font-black text-slate-900 ${col.className || ''}`}>{totals[col.label] ? `LKR ${totals[col.label]}` : ''}</td>
                                ))}
                                <td></td>
                            </tr>
                        </tfoot>
                    )}
                </table>
            </div>

            {!hideActions && (
                <div className="mt-6 flex flex-wrap items-start justify-between gap-6">
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={addRow}
                            className="px-4 py-1.5 border border-slate-300 rounded text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
                        >
                            Add lines
                        </button>
                        <button
                            type="button"
                            onClick={clearRows}
                            className="px-4 py-1.5 border border-slate-300 rounded text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
                        >
                            Clear all lines
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
