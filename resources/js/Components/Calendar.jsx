import React, { useState } from 'react';
import { Popover, PopoverButton, PopoverPanel, Transition } from '@headlessui/react';

const Calendar = ({ value, onChange, label }) => {
    const [viewDate, setViewDate] = useState(value ? new Date(value) : new Date());
    const selectedDate = value ? new Date(value) : null;

    const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const prevMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
    };

    const selectDate = (day) => {
        const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
        const yyyy = newDate.getFullYear();
        const mm = String(newDate.getMonth() + 1).padStart(2, '0');
        const dd = String(newDate.getDate()).padStart(2, '0');
        onChange(`${yyyy}-${mm}-${dd}`);
    };

    const renderDays = () => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const days = [];
        const totalDays = daysInMonth(year, month);
        const offset = firstDayOfMonth(year, month);

        // Padding
        for (let i = 0; i < offset; i++) {
            days.push(<div key={`pad-${i}`} className="h-8 w-8" />);
        }

        for (let d = 1; d <= totalDays; d++) {
            const isSelected = selectedDate && 
                             selectedDate.getDate() === d && 
                             selectedDate.getMonth() === month && 
                             selectedDate.getFullYear() === year;
            const isToday = new Date().getDate() === d && 
                          new Date().getMonth() === month && 
                          new Date().getFullYear() === year;

            days.push(
                <button
                    key={d}
                    type="button"
                    onClick={() => selectDate(d)}
                    className={`h-8 w-8 text-[10px] font-medium rounded-full flex items-center justify-center transition-all
                        ${isSelected ? 'bg-green-600 text-white shadow-md' : 
                          isToday ? 'text-green-600 font-bold bg-green-50' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                    {d}
                </button>
            );
        }
        return days;
    };

    return (
        <div className="p-3 w-64 bg-white select-none">
            <div className="flex items-center justify-between mb-4 px-1">
                <button type="button" onClick={prevMonth} className="p-1 hover:bg-slate-100 rounded-full transition-colors">
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                </button>
                <div className="text-[11px] font-black uppercase tracking-widest text-slate-900">
                    {months[viewDate.getMonth()]} {viewDate.getFullYear()}
                </div>
                <button type="button" onClick={nextMonth} className="p-1 hover:bg-slate-100 rounded-full transition-colors">
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                    <div key={d} className="h-8 w-8 flex items-center justify-center text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                        {d}
                    </div>
                ))}
                {renderDays()}
            </div>
            
            <div className="mt-3 pt-3 border-t border-slate-50 flex justify-between px-1">
                <button 
                    type="button" 
                    onClick={() => {
                        const today = new Date();
                        const yyyy = today.getFullYear();
                        const mm = String(today.getMonth() + 1).padStart(2, '0');
                        const dd = String(today.getDate()).padStart(2, '0');
                        onChange(`${yyyy}-${mm}-${dd}`);
                    }}
                    className="text-[9px] font-black uppercase tracking-widest text-green-600 hover:text-green-700"
                >
                    Today
                </button>
            </div>
        </div>
    );
};

export default Calendar;
