
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarProps {
  onDateClick: (date: string) => void;
  selectedDate: string;
  sessions: { date: string }[];
}

const Calendar: React.FC<CalendarProps> = ({ onDateClick, selectedDate, sessions }) => {
  const [viewDate, setViewDate] = useState(new Date());

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  
  // Adjusted to start from Monday: 0 is Mon, 6 is Sun
  const firstDayOfMonthMondayStart = (year: number, month: number) => {
    const day = new Date(year, month, 1).getDay();
    // getDay returns 0 for Sunday. We want Monday (1) to be index 0, so Sunday (0) becomes 6.
    return day === 0 ? 6 : day - 1;
  };

  const handlePrev = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  const handleNext = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));

  const renderDays = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const days: React.ReactNode[] = [];
    const totalDays = daysInMonth(year, month);
    const startDay = firstDayOfMonthMondayStart(year, month);

    // Padding for first week (Monday start)
    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-14 md:h-20 border-b border-r border-neutral-100"></div>);
    }

    for (let d = 1; d <= totalDays; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const isSelected = dateStr === selectedDate;
      const isToday = new Date().toDateString() === new Date(year, month, d).toDateString();
      const hasSessions = sessions.some(s => s.date === dateStr);

      days.push(
        <button
          key={d}
          onClick={() => onDateClick(dateStr)}
          className={`h-14 md:h-20 border-b border-r border-neutral-100 flex flex-col items-center justify-center relative transition-all
            ${isSelected ? 'bg-black text-white' : 'hover:bg-yellow-50'}
            ${isToday && !isSelected ? 'text-yellow-600 font-black underline underline-offset-4 decoration-2' : ''}
          `}
        >
          <span className="text-sm font-medium">{d}</span>
          {hasSessions && (
            <div className={`absolute bottom-2 w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-yellow-400' : 'bg-black'}`}></div>
          )}
        </button>
      );
    }

    return days;
  };

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  return (
    <div className="border-2 border-black bg-white overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <div className="flex items-center justify-between p-4 bg-black text-white">
        <h2 className="text-lg font-black uppercase tracking-tighter">
          {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}
        </h2>
        <div className="flex gap-2">
          <button onClick={handlePrev} className="p-1 hover:text-yellow-400 transition-colors"><ChevronLeft size={20} /></button>
          <button onClick={handleNext} className="p-1 hover:text-yellow-400 transition-colors"><ChevronRight size={20} /></button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 text-center border-b border-black bg-neutral-50">
        {['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'].map(day => (
          <div key={day} className="py-2 text-[10px] font-black text-neutral-600 border-r border-neutral-200 last:border-r-0">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {renderDays()}
      </div>
    </div>
  );
};

export default Calendar;
