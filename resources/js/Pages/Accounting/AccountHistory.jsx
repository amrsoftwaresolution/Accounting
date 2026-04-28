import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useMemo } from 'react';
import CommonButton from '@/Components/CommonButton';

export default function AccountHistory({ account, lines = [] }) {
    // Calculate running balance
    const transactions = useMemo(() => {
        let currentBalance = 0;
        // The lines are already ordered by date desc in the controller.
        // For running balance, we usually need them ordered by date asc.
        const sortedLines = [...lines].reverse();
        
        return sortedLines.map(line => {
            const debit = parseFloat(line.debit || 0);
            const credit = parseFloat(line.credit || 0);
            
            // Asset/Expense: Debit increases, Credit decreases
            // Liability/Equity/Income: Credit increases, Debit decreases
            const isNormalDebit = ['asset', 'expense'].includes(account.account_type);
            
            if (isNormalDebit) {
                currentBalance += (debit - credit);
            } else {
                currentBalance += (credit - debit);
            }
            
            return {
                ...line,
                running_balance: currentBalance
            };
        }).reverse(); // Reverse back to show newest first in the table
    }, [account, lines]);

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                        <h2 className="font-bold text-lg text-slate-800 tracking-tight">Account History: {account.name}</h2>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{account.account_code} • {account.account_type}</span>
                    </div>
                    <Link href={route('chart-of-account.index')}>
                        <CommonButton variant="ghost">Back to Chart of Accounts</CommonButton>
                    </Link>
                </div>
            }
        >
            <Head title={`History - ${account.name}`} />

            <div className="p-6">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Date</th>
                                    <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Reference</th>
                                    <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Description / Memo</th>
                                    <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Debit</th>
                                    <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Credit</th>
                                    <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Running Balance</th>
                                    <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {transactions.map((tx) => (
                                    <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-4 py-3 text-[11px] text-slate-600">
                                            {tx.journal_entry?.date}
                                        </td>
                                        <td className="px-4 py-3 text-[11px] font-bold text-slate-800">
                                            {tx.journal_entry?.reference || '-'}
                                        </td>
                                        <td className="px-4 py-3 text-[11px] text-slate-600">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-700">{tx.journal_entry?.description}</span>
                                                <span className="text-[10px] text-slate-400 italic">{tx.memo}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-[11px] font-bold text-slate-900 text-right">
                                            {parseFloat(tx.debit) > 0 ? parseFloat(tx.debit).toLocaleString(undefined, { minimumFractionDigits: 2 }) : '-'}
                                        </td>
                                        <td className="px-4 py-3 text-[11px] font-bold text-slate-900 text-right">
                                            {parseFloat(tx.credit) > 0 ? parseFloat(tx.credit).toLocaleString(undefined, { minimumFractionDigits: 2 }) : '-'}
                                        </td>
                                        <td className="px-4 py-3 text-[11px] font-bold text-blue-600 text-right">
                                            LKR {tx.running_balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <Link href={route('journal-entries.edit', tx.journal_entry_id)}>
                                                <CommonButton variant="ghost" size="xs">View/Edit</CommonButton>
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                                {transactions.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-12 text-center text-[11px] text-slate-400 font-medium">
                                            No transactions found for this account.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
