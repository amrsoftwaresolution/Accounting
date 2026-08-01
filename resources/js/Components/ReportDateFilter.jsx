import React, { useState, useEffect } from 'react';
import CommonInput from './CommonInput';
import { Link } from '@inertiajs/react';

export default function ReportDateFilter({ currentFilter, onFilterChange }) {
    const [filterType, setFilterType] = useState('custom');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Date formatting helper YYYY-MM-DD
    const formatDate = (date) => {
        if (!date) return '';
        const d = new Date(date);
        let month = '' + (d.getMonth() + 1);
        let day = '' + d.getDate();
        const year = d.getFullYear();

        if (month.length < 2) month = '0' + month;
        if (day.length < 2) day = '0' + day;

        return [year, month, day].join('-');
    };

    const getCurrentMonthRange = () => {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        return {
            start: formatDate(start),
            end: formatDate(end),
        };
    };

    const handleApply = (type, customStart, customEnd) => {
        let start = '';
        let end = '';
        const today = new Date();
        const y = today.getFullYear();
        const m = today.getMonth();

        switch (type) {
            case 'all_dates':
                start = '';
                end = '';
                break;
            case 'today':
                start = formatDate(today);
                end = formatDate(today);
                break;
            case 'this_week':
                const firstDayOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
                const lastDayOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 6));
                start = formatDate(firstDayOfWeek);
                end = formatDate(lastDayOfWeek);
                break;
            case 'last_week':
                const lastWeekToday = new Date(new Date().setDate(new Date().getDate() - 7));
                const firstDayOfLastWeek = new Date(lastWeekToday.setDate(lastWeekToday.getDate() - lastWeekToday.getDay()));
                const lastDayOfLastWeek = new Date(lastWeekToday.setDate(lastWeekToday.getDate() - lastWeekToday.getDay() + 6));
                start = formatDate(firstDayOfLastWeek);
                end = formatDate(lastDayOfLastWeek);
                break;
            case 'this_month':
                start = formatDate(new Date(y, m, 1));
                end = formatDate(new Date(y, m + 1, 0));
                break;
            case 'last_month':
                start = formatDate(new Date(y, m - 1, 1));
                end = formatDate(new Date(y, m, 0));
                break;
            case 'this_quarter':
                const q = Math.floor(m / 3);
                start = formatDate(new Date(y, q * 3, 1));
                end = formatDate(new Date(y, q * 3 + 3, 0));
                break;
            case 'last_quarter':
                const lq = Math.floor(m / 3) - 1;
                const lqy = lq < 0 ? y - 1 : y;
                const lqm = lq < 0 ? 3 : lq;
                start = formatDate(new Date(lqy, lqm * 3, 1));
                end = formatDate(new Date(lqy, lqm * 3 + 3, 0));
                break;
            case 'this_half_year':
                const hy = Math.floor(m / 6);
                start = formatDate(new Date(y, hy * 6, 1));
                end = formatDate(new Date(y, hy * 6 + 6, 0));
                break;
            case 'last_half_year':
                const lhy = Math.floor(m / 6) - 1;
                const lhyy = lhy < 0 ? y - 1 : y;
                const lhym = lhy < 0 ? 1 : lhy;
                start = formatDate(new Date(lhyy, lhym * 6, 1));
                end = formatDate(new Date(lhyy, lhym * 6 + 6, 0));
                break;
            case 'this_year':
                start = formatDate(new Date(y, 0, 1));
                end = formatDate(new Date(y, 11, 31));
                break;
            case 'last_year':
                start = formatDate(new Date(y - 1, 0, 1));
                end = formatDate(new Date(y - 1, 11, 31));
                break;
            case 'custom':
                start = customStart || startDate;
                end = customEnd || endDate;
                break;
        }

        setFilterType(type);
        setStartDate(start);
        setEndDate(end);

        if (onFilterChange) {
            onFilterChange({ start_date: start, end_date: end, type: type });
        }
    };

    // Determine default filter type based on props
    useEffect(() => {
        if (currentFilter) {
            if (currentFilter.type) {
                setFilterType(currentFilter.type);
            }

            const defaultRange = getCurrentMonthRange();
            const incomingStart = currentFilter.start_date ?? defaultRange.start;
            const incomingEnd = currentFilter.end_date ?? defaultRange.end;

            setStartDate(incomingStart);
            setEndDate(incomingEnd);
        }
    }, [currentFilter]);

    return (
        <div className="flex flex-col sm:flex-row items-end gap-3">
            <Link
                href={route('reports.index')}
                className="flex items-center justify-center w-[30px] h-[30px] border border-slate-300 rounded-sm text-slate-500 hover:text-gray-900 bg-white shadow-sm hover:bg-slate-50 transition-colors shrink-0 mb-[1px]"
                title="Back to Reports"
            >
                <svg className="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </Link>
            <div className="w-full sm:w-48">
                <label className="font-bold text-slate-600 ml-0.5 text-xs mb-1 block">Date Range</label>
                <select
                    value={filterType}
                    onChange={(e) => {
                        setFilterType(e.target.value);
                        if (e.target.value !== 'custom') {
                            handleApply(e.target.value);
                        }
                    }}
                    className="w-full h-[30px] py-0 border border-slate-300 rounded-sm text-xs focus:ring-green-500/20 focus:border-green-500 transition-colors bg-white cursor-pointer shadow-sm text-slate-900"
                >
                    <option value="all_dates">All Dates</option>
                    <option value="custom">Custom Date</option>
                    <option value="today">Today</option>
                    <option value="this_week">This week</option>
                    <option value="last_week">Last week</option>
                    <option value="this_month">This Month</option>
                    <option value="last_month">Last month</option>
                    <option value="this_quarter">This Quarter</option>
                    <option value="last_quarter">Last Quarter</option>
                    <option value="this_half_year">This Half Year</option>
                    <option value="last_half_year">Last Half Year</option>
                    <option value="this_year">This Year</option>
                    <option value="last_year">Last Year</option>
                </select>
            </div>

            {filterType === 'custom' && (
                <>
                    <div className="w-full sm:w-36">
                        <CommonInput
                            label="Start Date"
                            type="date"
                            value={startDate}
                            onChange={(e) => {
                                setStartDate(e.target.value);
                            }}
                            onBlur={() => handleApply('custom', startDate, endDate)}
                        />
                    </div>
                    <div className="w-full sm:w-36">
                        <CommonInput
                            label="End Date"
                            type="date"
                            value={endDate}
                            onChange={(e) => {
                                setEndDate(e.target.value);
                            }}
                            onBlur={() => handleApply('custom', startDate, endDate)}
                        />
                    </div>
                </>
            )}

            {filterType === 'custom' && (
                <div className="w-full sm:w-auto">
                    <button
                        type="button"
                        onClick={() => handleApply('custom', startDate, endDate)}
                        className="w-full sm:w-auto h-[30px] px-4 bg-primary text-white text-xs font-semibold rounded-sm hover:bg-primary-600 focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors"
                    >
                        Apply
                    </button>
                </div>
            )}
        </div>
    );
}
