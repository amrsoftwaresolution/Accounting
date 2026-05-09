import { useForm, Head } from "@inertiajs/react";
import TransactionLayout from "@/TransactionLayout/TransactionLayout";
import SearchableSelect from "@/Components/SearchableSelect";
import CommonInput from "@/Components/CommonInput";

export default function TransferForm({ accounts = [] }) {
    // FIX: Using Inertia useForm for better error handling and consistency
    const { data, setData, post, processing, errors, reset } = useForm({
        transfer_from: "",
        transfer_to: "",
        amount: "",
        date: new Date().toISOString().split('T')[0],
        memo: "",
    });

    const accountOptions = accounts.map(acc => ({
        value: acc.id,
        label: `${acc.account_code} - ${acc.name}`,
        balance: acc.balance
    }));

    const selectedFrom = accountOptions.find(opt => opt.value === data.transfer_from);
    const selectedTo = accountOptions.find(opt => opt.value === data.transfer_to);

    const handleSave = (type = 'save') => {
        post(route('transfer.store'), {
            onSuccess: () => {
                alert("Transfer Successful ✅");
                if (type === 'close') window.history.back();
                if (type === 'new') reset();
            },
            onError: () => {
                alert("Please check the form for errors.");
            }
        });
    };

    return (
        <TransactionLayout
            title="Transfer Funds"
            amount={parseFloat(data.amount || 0).toFixed(2)}
            onSave={() => handleSave('save')}
            onSaveAndClose={() => handleSave('close')}
            onSaveAndNew={() => handleSave('new')}
            processing={processing}
        >
            <Head title="Transfer Funds" />

            <div className="py-6 px-1 space-y-8">
                <div className="flex items-start justify-between gap-8">
                    <div className="flex items-start gap-6 flex-1">
                        {/* FROM ACCOUNT */}
                        <div className="w-[380px]">
                            <SearchableSelect
                                label="Transfer Funds From"
                                options={accountOptions}
                                value={data.transfer_from}
                                onChange={(val) => setData('transfer_from', val)}
                                placeholder="Select Source Account"
                                size="sm"
                                error={errors.transfer_from}
                            />
                            {selectedFrom && (
                                <div className="mt-1 flex items-baseline gap-2">
                                    <span className="text-[8px] text-slate-400 font-black uppercase tracking-widest">Balance</span>
                                    <span className="text-[10px] font-bold text-slate-700">LKR {parseFloat(selectedFrom.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                </div>
                            )}
                        </div>

                        {/* TO ACCOUNT */}
                        <div className="w-[380px]">
                            <SearchableSelect
                                label="Transfer Funds To"
                                options={accountOptions}
                                value={data.transfer_to}
                                onChange={(val) => setData('transfer_to', val)}
                                placeholder="Select Destination Account"
                                size="sm"
                                error={errors.transfer_to}
                            />
                            {selectedTo && (
                                <div className="mt-1 flex items-baseline gap-2">
                                    <span className="text-[8px] text-slate-400 font-black uppercase tracking-widest">Balance</span>
                                    <span className="text-[10px] font-bold text-slate-700">LKR {parseFloat(selectedTo.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="text-right flex flex-col items-end">
                        <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-1">Transfer Amount</p>
                        <p className="text-4xl font-black tracking-tighter text-slate-900 leading-none">
                            <span className="text-slate-400 text-[10px] font-medium mr-1">LKR</span>
                            {parseFloat(data.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </p>
                    </div>
                </div>

                <div className="flex items-end gap-6">
                    <div className="w-[180px]">
                        <CommonInput
                            type="date"
                            label="Date"
                            value={data.date}
                            onChange={(e) => setData('date', e.target.value)}
                            size="sm"
                            error={errors.date}
                        />
                    </div>
                    <div className="w-[180px]">
                        <CommonInput
                            type="number"
                            label="Transfer Amount"
                            placeholder="0.00"
                            value={data.amount}
                            onChange={(e) => setData('amount', e.target.value)}
                            size="sm"
                            error={errors.amount}
                        />
                    </div>
                </div>

                <div className="w-[500px] mt-8 pt-4 border-t border-slate-100">
                    <CommonInput
                        type="textarea"
                        label="Memo"
                        placeholder="Why are you transferring these funds?"
                        value={data.memo}
                        onChange={(e) => setData('memo', e.target.value)}
                        size="sm"
                        className="h-24"
                        error={errors.memo}
                    />
                </div>
            </div>
        </TransactionLayout>
    );
}
