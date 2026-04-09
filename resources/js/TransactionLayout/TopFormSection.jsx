export default function TopFormSection({ form, setForm }) {
    return (
        <div className="grid grid-cols-3 gap-x-8 gap-y-4 border-b pb-4">

            <div>
                <label className="text-xs text-gray-500">Payee</label>
                <select
                    className="w-full border-b border-gray-300 text-sm py-1 bg-transparent"
                    value={form.payee}
                    onChange={(e) => setForm({ ...form, payee: e.target.value })}
                >
                    <option>Who did you pay?</option>
                </select>
            </div>

            <div>
                <label className="text-xs text-gray-500">Payment account</label>
                <select
                    className="w-full border-b border-gray-300 text-sm py-1 bg-transparent"
                    value={form.account}
                    onChange={(e) => setForm({ ...form, account: e.target.value })}
                >
                    <option>Cash</option>
                </select>
            </div>

            <div className="flex items-end text-sm text-gray-500">
                Balance LKR 666,500.00
            </div>

            <div>
                <label className="text-xs text-gray-500">Payment date</label>
                <input
                    type="date"
                    className="w-full border-b border-gray-300 text-sm py-1 bg-transparent"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
            </div>

            <div>
                <label className="text-xs text-gray-500">Payment method</label>
                <select
                    className="w-full border-b border-gray-300 text-sm py-1 bg-transparent"
                    value={form.method}
                    onChange={(e) => setForm({ ...form, method: e.target.value })}
                >
                    <option>Select method</option>
                </select>
            </div>

            <div>
                <label className="text-xs text-gray-500">Ref no.</label>
                <input
                    className="w-full border-b border-gray-300 text-sm py-1 bg-transparent"
                    value={form.ref}
                    onChange={(e) => setForm({ ...form, ref: e.target.value })}
                />
            </div>

        </div>
    );
}
