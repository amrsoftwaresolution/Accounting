import React, { useState, useMemo } from 'react';
import ReportLayout from '@/Layouts/ReportLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import CommonInput from '@/Components/CommonInput';
import { useDateFormat, formatDate } from '@/Utils/dateFormat';
import ReportDateFilter from '@/Components/ReportDateFilter';

export default function ContactBalanceDetail({ contact, contactType, lines = [], filters = {} }) {
    const { auth } = usePage().props;
    const currencyPrefix = auth.company?.home_currency_prefix || auth.company?.home_currency || '';

    const handleFilterChange = (newFilters) => {
        const routeName = contactType === 'Customer' ? 'reports.customer-detail' : 'reports.supplier-detail';
        router.get(route(routeName, contact.id), {
            start_date: newFilters.start_date,
            end_date: newFilters.end_date,
            type: newFilters.type
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const transactions = useMemo(() => {
        let currentBalance = parseFloat(contact.opening_balance || 0); // Start with opening balance if available

        return lines.map(line => {
            const debit = parseFloat(line.debit || 0);
            const credit = parseFloat(line.credit || 0);

            let amount = 0;
            if (contactType === 'Customer') {
                amount = debit - credit;
            } else {
                amount = credit - debit;
            }

            currentBalance += amount;

            return {
                ...line,
                amount: amount,
                running_balance: currentBalance
            };
        }).reverse();
    }, [lines, contactType, contact.opening_balance]);

    const filterElements = (
        <ReportDateFilter
            currentFilter={{ start_date: filters.start_date, end_date: filters.end_date, type: filters.type }}
            onFilterChange={handleFilterChange}
        />
    );

    const displayName = contact.display_name || contact.company_name;

    return (
        <ReportLayout
            title={`${contactType} Balance Detail`}
            filters={filterElements}
        >
            <Head title={`${contactType} Balance Detail - ${displayName}`} />

            <div className="text-center mb-8 font-serif relative">
                <h2 className="text-xl font-bold text-gray-900">{auth.company?.company_name || 'Company'}</h2>
                <h3 className="text-lg text-gray-800 mt-1">{contactType} Balance Detail</h3>
                {filters.start_date && filters.end_date ? (
                    <p className="text-[13px] text-gray-500 mt-1">
                        {formatDate(filters.start_date, dateFormat)} - {formatDate(filters.end_date, dateFormat)}
                    </p>
                ) : (
                    <p className="text-[13px] text-gray-500 mt-1">
                        All Dates
                    </p>
                )}
            </div>

            <div className="w-full overflow-x-auto pb-10">
                <table className="w-full text-[13px] text-left border-collapse table-fixed">
                    <thead>
                        <tr className="border-y-2 border-gray-300">
                            <th className="py-2.5 px-3 font-semibold text-gray-900 w-[15%]">Date</th>
                            <th className="py-2.5 px-3 font-semibold text-gray-900 w-[20%]">Transaction type</th>
                            <th className="py-2.5 px-3 font-semibold text-gray-900 w-[15%]">Number</th>
                            <th className="py-2.5 px-3 font-semibold text-gray-900 w-[15%]">Due date</th>
                            <th className="py-2.5 px-3 font-semibold text-gray-900 text-right w-[15%]">Amount</th>
                            <th className="py-2.5 px-3 font-semibold text-gray-900 text-right w-[20%]">Balance</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {/* Group Header Row like in QuickBooks */}
                        <tr className="bg-slate-50/50">
                            <td colSpan="6" className="py-2 px-3 font-bold text-gray-800">
                                {displayName}
                            </td>
                        </tr>
                        {transactions.map((tx) => (
                            <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                                <td className="py-2 px-3 text-gray-600">
                                    {tx.date}
                                </td>
                                <td className="py-2 px-3 text-gray-600 capitalize">
                                    {tx.transaction_type ? tx.transaction_type.replace('_', ' ') : 'Journal Entry'}
                                </td>
                                <td className="py-2 px-3 text-gray-600">
                                    {tx.reference || '-'}
                                </td>
                                <td className="py-2 px-3 text-gray-600">
                                    {tx.due_date || '-'}
                                </td>
                                <td className="py-2 px-3 text-right tabular-nums text-gray-900">
                                    {tx.amount < 0 ? (
                                        <span className="text-red-600">{currencyPrefix ? `${currencyPrefix} -` : '-'}{Math.abs(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                    ) : (
                                        <span>{currencyPrefix ? `${currencyPrefix} ` : ''}{tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                    )}
                                </td>
                                <td className="py-2 px-3 text-right tabular-nums font-medium text-gray-900">
                                    {tx.running_balance < 0 ? (
                                        <span className="text-red-600">{currencyPrefix ? `${currencyPrefix} -` : '-'}{Math.abs(tx.running_balance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                    ) : (
                                        <span>{currencyPrefix ? `${currencyPrefix} ` : ''}{tx.running_balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {transactions.length === 0 && (
                            <tr>
                                <td colSpan="6" className="py-8 text-center text-gray-500">
                                    No transactions found for this period.
                                </td>
                            </tr>
                        )}
                        {/* Group Footer Row */}
                        {transactions.length > 0 && (
                            <tr className="border-t-2 border-gray-200">
                                <td colSpan="4" className="py-3 px-3 font-bold text-gray-900">
                                    Total for {displayName}
                                </td>
                                <td className="py-3 px-3 text-right font-bold text-gray-900 tabular-nums">
                                    {/* Empty or sum amount if requested, we'll leave empty since Balance tracks total */}
                                </td>
                                <td className="py-3 px-3 text-right font-bold text-gray-900 tabular-nums">
                                    {transactions[0].running_balance < 0 ? (
                                        <span className="text-red-600">{currencyPrefix ? `${currencyPrefix} -` : '-'}{Math.abs(transactions[0].running_balance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                    ) : (
                                        <span>{currencyPrefix ? `${currencyPrefix} ` : ''}{transactions[0].running_balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                    )}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </ReportLayout>
    );
}
