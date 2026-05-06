// src/components/BookingPanel.jsx
import React from 'react';

const BookingPanel = ({ selection, bookings }) => {
  const hasSelection = selection.start && selection.end;

  return (
    <div className="bg-[#1E1E1E] flex-1 rounded-2xl p-6 border border-[#333] overflow-y-auto max-h-[700px] custom-scrollbar">
      <h3 className="uppercase text-xs text-gray-500 font-bold tracking-widest mb-6">
        {hasSelection ? `Selection · ${bookings.length} Bookings` : 'No Selection'}
      </h3>

      <div className="flex flex-col gap-4">
        {!hasSelection ? (
          <div className="text-gray-600 text-sm italic text-center mt-10">
            Click or drag on the calendar to view booking details.
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-gray-500 text-sm text-center mt-10">
            No bookings found for the selected dates.
          </div>
        ) : (
          bookings.map(b => (
            <div key={b.id} className="bg-[#262626] p-4 rounded-xl border border-[#333] hover:border-gray-500 transition-all group">
              <div className="flex justify-between items-start mb-2">
                <div className="font-bold text-gray-200 group-hover:text-white">{b.guestName}</div>
                <div className="text-[10px] text-gray-500 font-mono uppercase">{b.id}</div>
              </div>

              <div className="text-xs text-gray-400 space-y-1">
                <div className="flex justify-between">
                  <span>Room {b.roomNumber}</span>
                  <span className="text-gray-500">{b.roomType}</span>
                </div>
                <div className="text-[11px] bg-[#1a1a1a] p-1.5 rounded mt-2">
                   📅 {b.checkIn} — {b.checkOut}
                </div>
              </div>

              <div className="mt-4 flex justify-between items-center">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border
                  ${b.status === 'confirmed' ? 'border-green-900/50 bg-green-900/20 text-green-400' : 
                    b.status === 'checked_in' ? 'border-blue-900/50 bg-blue-900/20 text-blue-400' :
                    'border-gray-700 bg-gray-800 text-gray-400'}`}>
                  {b.status.replace('_', ' ')}
                </span>
                <div className="text-sm font-bold text-gray-200">₹{b.totalAmount.toLocaleString('en-IN')}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default BookingPanel;