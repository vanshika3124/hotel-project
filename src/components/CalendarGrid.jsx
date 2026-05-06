// src/components/CalendarGrid.jsx
import React from 'react';
import { getHeatColor, formatDate, TOTAL_ROOMS } from '../utils/dateUtils';

const CalendarGrid = ({ days, occupancyMap, dragRange, onMouseDown, onMouseEnter }) => {
  const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  return (
    <div className="flex-1 max-w-4xl">
      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-2 text-gray-500 mb-4 text-center text-sm font-medium">
        {WEEKDAYS.map(d => <div key={d}>{d}</div>)}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-2 select-none">
        {days.map((day, i) => {
          const dStr = formatDate(day.date);
          const count = occupancyMap[dStr] || 0;
          
          // Drag selection logic (forward or backward)
          const isSelected = dragRange.start && (
            (dStr >= dragRange.start && dStr <= dragRange.end) || 
            (dStr >= dragRange.end && dStr <= dragRange.start)
          );

          const bgColor = day.isCurrent ? getHeatColor(count) : '#1A1A1A';
          const isFull = count >= 8;

          return (
            <div
              key={i}
              onMouseDown={() => onMouseDown(dStr)}
              onMouseEnter={() => onMouseEnter(dStr)}
              style={{ backgroundColor: bgColor }}
              className={`h-24 p-3 rounded-lg flex flex-col justify-between transition-all cursor-pointer 
                ${!day.isCurrent ? 'opacity-20 pointer-events-none' : 'hover:brightness-110'}
                ${isSelected ? 'ring-2 ring-blue-500 scale-[1.02] z-10' : ''}`}
            >
              <span className={`text-sm font-bold ${isFull ? 'text-white' : 'text-gray-800'}`}>
                {day.date.getDate()}
              </span>
              
              {day.isCurrent && (
                <div className={`text-[10px] font-bold ${isFull ? 'text-white/80' : 'text-gray-600'}`}>
                  {count}/{TOTAL_ROOMS}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarGrid;