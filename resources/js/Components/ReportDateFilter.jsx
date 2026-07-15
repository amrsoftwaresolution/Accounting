import React, { useState, useEffect } from 'react';
import CommonInput from './CommonInput';

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
            if (currentFilter.start_date !== undefined) setStartDate(currentFilter.start_date);
            if (currentFilter.end_date !== undefined) setEndDate(currentFilter.end_date);
        }
    }, [currentFilter]);

    return (
        <div className="flex flex-col sm:flex-row items-end gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6">
            <div className="w-full sm:w-64">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Date Range</label>
                <select
                    value={filterType}
                    onChange={(e) => {
                        setFilterType(e.target.value);
                        if (e.target.value !== 'custom') {
                            handleApply(e.target.value);
                        }
                    }}
                    className="w-full h-11 border-slate-200 rounded-lg text-sm focus:ring-primary focus:border-primary transition-colors bg-slate-50 hover:bg-white cursor-pointer"
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
                    <div className="w-full sm:w-48">
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
                    <div className="w-full sm:w-48">
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
                        className="w-full sm:w-auto h-11 px-6 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-600 focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors"
                    >
                        Apply
                    </button>
                </div>
            )}
        </div>
    );
}
