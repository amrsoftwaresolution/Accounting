export default function LineItemsTable({
    columns,
    items,
    handleItemChange,
    addRow,
    removeRow,
    clearRows,
    totals
}) {
    return (
        <div className="border-b pb-4 mt-4">
            <table className="w-full text-sm">
                <thead>
                    <tr className="text-xs text-gray-500 border-b uppercase">
                        <th className="p-2 w-8 text-left">#</th>
                        {columns.map((col) => (
                            <th key={col.key} className={`p-2 text-left ${col.className || ''}`}>
                                {col.label}
                            </th>
                        ))}
                        <th className="w-10"></th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item, index) => (
                        <tr key={index} className="border-b group hover:bg-gray-50">
                            <td className="p-2 text-gray-400">{index + 1}</td>
                            {columns.map((col) => (
                                <td key={col.key} className="p-2">
                                    <input
                                        type={col.type || "text"}
                                        className={`w-full border-b border-transparent focus:border-gray-400 bg-transparent py-1 ${col.inputClass || ''}`}
                                        value={item[col.key] || ""}
                                        onChange={(e) => handleItemChange(index, col.key, e.target.value)}
                                        placeholder={col.placeholder || ""}
                                    />
                                </td>
                            ))}
                            <td className="p-2 text-center">
                                <button
                                    onClick={() => removeRow(index)}
                                    className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                >✕</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="mt-4 flex gap-4">
                <button onClick={addRow} className="text-blue-600 text-sm font-medium hover:underline">+ Add line</button>
                <button onClick={clearRows} className="text-gray-500 text-sm font-medium hover:underline">Clear all lines</button>
            </div>

            {/* Total Section - Dynamic based on what totals the page sends */}
            <div className="flex flex-col items-end mt-4 space-y-1">
                {totals && Object.entries(totals).map(([label, value]) => (
                    <div key={label} className="text-sm font-semibold text-gray-800">
                        {label}: LKR {value}
                    </div>
                ))}
            </div>
        </div>
    );
}
