import React, { useState, useEffect, useMemo, useCallback } from "react";

// --- UTILS & CONSTANTS ---
const TOTAL_ROOMS = 10;
const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const formatDate = (d) => d.toISOString().split("T")[0];

const getHeatColor = (count) => {
  if (count === 0) return "#2A2A2A"; // Empty state
  const ratio = count / TOTAL_ROOMS;
  if (ratio <= 0.2) return "#D1FAE5"; // 1-2 rooms (Light Green)
  if (ratio <= 0.4) return "#A7F3D0"; // 3-4 rooms
  if (ratio <= 0.6) return "#FDE68A"; // 5-6 rooms (Yellow)
  if (ratio <= 0.8) return "#FDBA74"; // 7-8 rooms (Orange)
  return "#EF4444"; // 9-10 rooms (Red)
};

const getMonthDays = (year, month) => {
  const first = new Date(year, month, 1);
  const startDay = first.getDay();
  const days = [];
  // Padding previous month
  for (let i = startDay - 1; i >= 0; i--) {
    days.push({ date: new Date(year, month, -i), isCurrent: false });
  }
  // Current month
  const last = new Date(year, month + 1, 0).getDate();
  for (let i = 1; i <= last; i++) {
    days.push({ date: new Date(year, month, i), isCurrent: true });
  }
  // Padding next month
  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) {
    days.push({ date: new Date(year, month + 1, i), isCurrent: false });
  }
  return days;
};

// --- MAIN COMPONENT ---
export default function App() {
  const [viewDate, setViewDate] = useState(new Date(2026, 1, 1)); // Feb 2026
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Drag Selection State
  const [dragStart, setDragStart] = useState(null);
  const [dragEnd, setDragEnd] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [finalSelection, setFinalSelection] = useState({ start: null, end: null });

  // Load Data
  useEffect(() => {
    fetch("/bookings.json")
      .then((res) => res.json())
      .then((data) => {
        setBookings(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Calculate Occupancy Map
  const occupancyMap = useMemo(() => {
    const map = {};
    bookings.forEach((b) => {
      if (b.status === "cancelled") return;
      let curr = new Date(b.checkIn);
      const end = new Date(b.checkOut);
      while (curr < end) {
        const dStr = formatDate(curr);
        map[dStr] = (map[dStr] || 0) + 1;
        curr.setDate(curr.getDate() + 1);
      }
    });
    return map;
  }, [bookings]);

  const days = useMemo(() => 
    getMonthDays(viewDate.getFullYear(), viewDate.getMonth()), 
  [viewDate]);

  // Drag Handlers
  const onMouseDown = (dStr) => {
    setIsDragging(true);
    setDragStart(dStr);
    setDragEnd(dStr);
    setFinalSelection({ start: null, end: null });
  };

  const onMouseEnter = (dStr) => {
    if (isDragging) setDragEnd(dStr);
  };

  useEffect(() => {
    const onMouseUp = () => {
      if (isDragging) {
        const range = [dragStart, dragEnd].sort();
        setFinalSelection({ start: range[0], end: range[1] });
        setIsDragging(false);
      }
    };
    window.addEventListener("mouseup", onMouseUp);
    return () => window.removeEventListener("mouseup", onMouseUp);
  }, [isDragging, dragStart, dragEnd]);

  // Filter Bookings for Panel
  const activeRange = isDragging ? [dragStart, dragEnd].sort() : [finalSelection.start, finalSelection.end].sort();
  const selectedBookings = useMemo(() => {
    if (!activeRange[0]) return [];
    return bookings.filter(b => b.checkIn <= activeRange[1] && b.checkOut > activeRange[0]);
  }, [activeRange, bookings]);

  if (loading) return <div className="h-screen bg-[#121212] flex items-center justify-center text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#121212] text-white p-8 font-sans flex gap-8">
      
      {/* --- CALENDAR SECTION --- */}
      <div className="flex-1 max-w-4xl">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">
            {viewDate.toLocaleString("default", { month: "long" })} {viewDate.getFullYear()}
          </h1>
          <div className="flex gap-2 bg-[#1E1E1E] p-1 rounded-lg border border-[#333]">
            <button className="px-3 py-1 hover:bg-[#333] rounded" onClick={() => setViewDate(new Date(viewDate.setMonth(viewDate.getMonth() - 1)))}>←</button>
            <button className="px-4 py-1 font-semibold hover:bg-[#333] rounded" onClick={() => setViewDate(new Date(2026, 1, 1))}>Today</button>
            <button className="px-3 py-1 hover:bg-[#333] rounded" onClick={() => setViewDate(new Date(viewDate.setMonth(viewDate.getMonth() + 1)))}>→</button>
          </div>
        </header>

        <div className="grid grid-cols-7 gap-2 text-gray-500 mb-4 text-center text-sm font-medium">
          {WEEKDAYS.map((d) => <div key={d}>{d}</div>)}
        </div>

        <div className="grid grid-cols-7 gap-2 select-none">
          {days.map((day, i) => {
            const dStr = formatDate(day.date);
            const count = occupancyMap[dStr] || 0;
            const isSelected = activeRange[0] && dStr >= activeRange[0] && dStr <= activeRange[1];
            const isFull = count >= 8;

            return (
              <div
                key={i}
                onMouseDown={() => onMouseDown(dStr)}
                onMouseEnter={() => onMouseEnter(dStr)}
                style={{ backgroundColor: day.isCurrent ? getHeatColor(count) : "#1A1A1A" }}
                className={`h-24 p-3 rounded-lg flex flex-col justify-between transition-all cursor-pointer 
                  ${!day.isCurrent ? "opacity-20 pointer-events-none" : "hover:brightness-110"}
                  ${isSelected ? "ring-2 ring-blue-500 scale-[1.02] z-10" : ""}`}
              >
                <span className={`text-sm font-bold ${isFull ? "text-white" : "text-gray-800"}`}>
                  {day.date.getDate()}
                </span>
                {day.isCurrent && (
                  <div className={`text-[10px] font-bold ${isFull ? "text-white/80" : "text-gray-600"}`}>
                    {count}/{TOTAL_ROOMS}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="mt-6 flex items-center gap-2 text-xs text-gray-500">
          <span>Low</span>
          {[0, 2, 5, 8, 10].map(c => <div key={c} style={{backgroundColor: getHeatColor(c)}} className="w-4 h-4 rounded-sm" />)}
          <span>Full</span>
        </div>
      </div>

      {/* --- STATS & PANEL SECTION --- */}
      <div className="w-96 flex flex-col gap-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#1E1E1E] p-4 rounded-xl border border-[#333]">
            <div className="text-2xl font-bold">73%</div>
            <div className="text-xs text-gray-500 uppercase mt-1">Avg occupancy</div>
          </div>
          <div className="bg-[#1E1E1E] p-4 rounded-xl border border-[#333]">
            <div className="text-2xl font-bold">₹2.4L</div>
            <div className="text-xs text-gray-500 uppercase mt-1">Month revenue</div>
          </div>
          <div className="bg-[#1E1E1E] p-4 rounded-xl border border-[#333]">
            <div className="text-2xl font-bold">{bookings.length}</div>
            <div className="text-xs text-gray-500 uppercase mt-1">Total bookings</div>
          </div>
          <div className="bg-[#1E1E1E] p-4 rounded-xl border border-[#333]">
            <div className="text-2xl font-bold">4.2</div>
            <div className="text-xs text-gray-500 uppercase mt-1">Avg nights</div>
          </div>
        </div>

        <div className="bg-[#1E1E1E] flex-1 rounded-2xl p-6 border border-[#333] overflow-y-auto max-h-[650px] custom-scrollbar">
          <h3 className="uppercase text-xs text-gray-500 font-bold tracking-widest mb-6">
            {activeRange[0] ? `${activeRange[0]} — ${activeRange[1]} · ${selectedBookings.length} Bookings` : 'Select dates to view bookings'}
          </h3>
          <div className="flex flex-col gap-4">
            {selectedBookings.map((b) => (
              <div key={b.id} className="bg-[#262626] p-4 rounded-xl border border-[#333] hover:border-gray-500 transition-all">
                <div className="flex justify-between items-start mb-2">
                  <div className="font-bold">{b.guestName}</div>
                  <div className="text-[10px] text-gray-500 uppercase font-mono">{b.id}</div>
                </div>
                <div className="text-xs text-gray-400 space-y-1">
                  <div>Room {b.roomNumber} · {b.roomType}</div>
                  <div className="text-[11px] text-gray-500 mt-1 italic">Stay: {b.checkIn} to {b.checkOut}</div>
                </div>
                <div className="mt-4 flex justify-between items-center">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border 
                    ${b.status === 'confirmed' ? 'border-green-900/50 bg-green-900/20 text-green-400' : 'border-yellow-900/50 bg-yellow-900/20 text-yellow-400'}`}>
                    {b.status.replace('_', ' ')}
                  </span>
                  <div className="text-sm font-bold">₹{b.totalAmount.toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}