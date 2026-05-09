import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Search, Download, ChevronLeft, ChevronRight } from "lucide-react";

const TOTAL_ROOMS = 10;
const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// --- UTILS ---
const formatDate = (d) => d.toISOString().split("T")[0];

const getHeatColor = (count) => {
  if (count === 0) return "#1E1E1E";
  const ratio = count / TOTAL_ROOMS;
  if (ratio <= 0.2) return "#D1FAE5";
  if (ratio <= 0.4) return "#A7F3D0";
  if (ratio <= 0.6) return "#FDE68A";
  if (ratio <= 0.8) return "#FDBA74";
  return "#F87171";
};

const getMonthDays = (year, month) => {
  const first = new Date(year, month, 1);
  const startDay = first.getDay();
  const days = [];
  
  // Previous month padding
  for (let i = startDay - 1; i >= 0; i--) {
    days.push({ date: new Date(year, month, -i), isCurrent: false });
  }
  // Current month
  const last = new Date(year, month + 1, 0).getDate();
  for (let i = 1; i <= last; i++) {
    days.push({ date: new Date(year, month, i), isCurrent: true });
  }
  // Next month padding
  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) {
    days.push({ date: new Date(year, month + 1, i), isCurrent: false });
  }
  return days;
};

export default function App() {
  const [viewDate, setViewDate] = useState(new Date());
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [dragStart, setDragStart] = useState(null);
  const [dragEnd, setDragEnd] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selection, setSelection] = useState({ start: null, end: null });

  // --- DATA FETCHING ---
  useEffect(() => {
    fetch("/bookings.json")
      .then((res) => res.json())
      .then((data) => {
        setBookings(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // --- GLOBAL MOUSE UP HANDLER ---
   
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        const [s, e] = [dragStart, dragEnd].sort();
        setSelection({ start: s, end: e });
      }
    };
    window.addEventListener("mouseup", handleGlobalMouseUp);
    return () => window.removeEventListener("mouseup", handleGlobalMouseUp);
  }, [isDragging, dragStart, dragEnd]);

  // --- MEMOIZED LOGIC ---
  const days = useMemo(() => 
    getMonthDays(viewDate.getFullYear(), viewDate.getMonth()), 
  [viewDate]);

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

  const activeRange = useMemo(() => {
    return isDragging 
      ? [dragStart, dragEnd].sort() 
      : [selection.start, selection.end].sort();
  }, [isDragging, dragStart, dragEnd, selection]);

  const selectedBookings = useMemo(() => {
    let filtered = bookings;
    const [start, end] = activeRange;

    if (start && end) {
      filtered = filtered.filter(b => b.checkIn <= end && b.checkOut > start);
    }
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(b =>
        b.guestName.toLowerCase().includes(lowerSearch) ||
        b.roomNumber.toString().includes(searchTerm)
      );
    }
    return filtered;
  }, [activeRange, bookings, searchTerm]);

  const stats = useMemo(() => {
    const month = viewDate.getMonth();
    const year = viewDate.getFullYear();
    
    const monthBookings = bookings.filter(b => {
      const d = new Date(b.checkIn);
      return d.getMonth() === month && d.getFullYear() === year;
    });

    const totalRev = monthBookings.reduce((s, b) => s + (b.totalAmount || 0), 0);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Calculate actual occupied nights in current month
    let occupiedNightsCount = 0;
    for (let i = 1; i <= daysInMonth; i++) {
      const dStr = formatDate(new Date(year, month, i));
      occupiedNightsCount += (occupancyMap[dStr] || 0);
    }

    const totalCapacity = daysInMonth * TOTAL_ROOMS;
    const occupancyPercent = totalCapacity > 0 ? Math.round((occupiedNightsCount / totalCapacity) * 100) : 0;

    return {
      occupancy: occupancyPercent + "%",
      revenue: (totalRev / 100000).toFixed(2) + "L",
      count: monthBookings.length,
      avgNights: monthBookings.length ? (occupiedNightsCount / monthBookings.length).toFixed(1) : 0
    };
  }, [bookings, viewDate, occupancyMap]);

  // --- HANDLERS ---
  const handleMonthNav = (offset) => {
    const newDate = new Date(viewDate);
    newDate.setMonth(viewDate.getMonth() + offset);
    setViewDate(newDate);
  };

  const exportCSV = () => {
    const headers = "ID,Guest,Room,CheckIn,CheckOut,Amount\n";
    const data = selectedBookings.map(b => 
      `${b.id},"${b.guestName}",${b.roomNumber},${b.checkIn},${b.checkOut},${b.totalAmount}`
    ).join("\n");
    const blob = new Blob([headers + data], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Guestara_Report_${formatDate(new Date())}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return (
    <div className="h-screen bg-[#0F0F0F] flex items-center justify-center">
      <div className="text-blue-500 font-black text-4xl animate-pulse">GUESTARA</div>
    </div>
  );

  return (
    <div className="h-screen bg-[#0F0F0F] text-[#E0E0E0] p-8 font-sans flex gap-10 overflow-hidden">
      
      {/* LEFT: CALENDAR */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto pr-4 custom-scrollbar">
        <header className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-4xl font-black tracking-tighter">
              {viewDate.toLocaleString("default", { month: "long" })} <span className="text-blue-500">{viewDate.getFullYear()}</span>
            </h1>
            <div className="mt-4 flex items-center gap-3 bg-[#1A1A1A] w-fit px-4 py-2 rounded-xl border border-[#2A2A2A]">
              <span className="text-[10px] uppercase font-bold text-gray-500">Occupancy Heat</span>
              <div className="flex gap-1.5">
                {[0, 2, 5, 8, 10].map(c => (
                  <div key={c} style={{backgroundColor: getHeatColor(c)}} className="w-3 h-3 rounded-sm" />
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-2 bg-[#1A1A1A] p-1.5 rounded-xl border border-[#2A2A2A]">
            <button className="px-3 py-2 hover:bg-[#2A2A2A] rounded-lg transition-colors" onClick={() => handleMonthNav(-1)}><ChevronLeft size={18}/></button>
            <button className="px-5 py-2 font-bold bg-[#2A2A2A] rounded-lg text-blue-400 text-sm hover:text-blue-300" onClick={() => setViewDate(new Date())}>Today</button>
            <button className="px-3 py-2 hover:bg-[#2A2A2A] rounded-lg transition-colors" onClick={() => handleMonthNav(1)}><ChevronRight size={18}/></button>
          </div>
        </header>

        <div className="grid grid-cols-7 gap-3 mb-4 text-center text-[10px] font-black uppercase tracking-[0.2em] text-gray-600">
          {WEEKDAYS.map(d => <div key={d}>{d.slice(0, 3)}</div>)}
        </div>

        <div className="grid grid-cols-7 gap-3 select-none pb-10">
          {days.map((day, i) => {
            const dStr = formatDate(day.date);
            const count = occupancyMap[dStr] || 0;
            const isSelected = activeRange[0] && dStr >= activeRange[0] && dStr <= activeRange[1];

            return (
              <div
                key={i}
                onMouseDown={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                  setDragStart(dStr);
                  setDragEnd(dStr);
                }}
                onMouseEnter={() => isDragging && setDragEnd(dStr)}
                style={{ backgroundColor: day.isCurrent ? getHeatColor(count) : "#141414" }}
                className={`h-28 p-4 rounded-2xl flex flex-col justify-between transition-all relative border 
                  ${!day.isCurrent ? "opacity-20 cursor-default border-transparent" : "hover:brightness-110 cursor-pointer border-[#222]"}
                  ${isSelected ? "ring-2 ring-blue-500 border-blue-400 z-10 shadow-[0_0_20px_rgba(59,130,246,0.3)]" : ""}`}
              >
                <span className={`text-xl font-black ${count > 6 && day.isCurrent ? 'text-black' : 'text-gray-300'}`}>
                  {day.date.getDate()}
                </span>
                {day.isCurrent && (
                  <div className={`text-[10px] font-black px-2 py-0.5 rounded-md self-start ${count > 6 ? 'bg-black/20 text-black' : 'bg-white/5 text-gray-500'}`}>
                    {count}/{TOTAL_ROOMS}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT: DASHBOARD */}
      <div className="w-[420px] flex flex-col gap-6 h-full">
        <div className="grid grid-cols-2 gap-4 flex-shrink-0">
          <StatCard label="Avg occupancy" value={stats.occupancy} />
          <StatCard label="Month revenue" value={`₹${stats.revenue}`} highlight />
          <StatCard label="Monthly Bookings" value={stats.count} />
          <StatCard label="Avg Stay length" value={`${stats.avgNights} nights`} />
        </div>

        <div className="bg-[#161616] flex-1 rounded-[32px] p-8 border border-[#222] overflow-hidden flex flex-col shadow-2xl">
          <div className="flex justify-between items-start mb-6 flex-shrink-0">
            <div>
              <h3 className="text-xl font-black uppercase tracking-tighter text-white">RESERVATIONS</h3>
              <p className="text-[10px] text-gray-600 font-bold mt-1 uppercase tracking-widest">
                {activeRange[0] ? `${activeRange[0]} — ${activeRange[1]}` : 'Showing All Bookings'}
              </p>
            </div>
            {selectedBookings.length > 0 && (
              <button onClick={exportCSV} title="Export CSV" className="p-3 bg-blue-600 hover:bg-blue-500 text-white rounded-full transition-all">
                <Download size={18} />
              </button>
            )}
          </div>

          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input 
              type="text"
              placeholder="Search guest or room..."
              className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded-2xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
            {selectedBookings.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center opacity-30 italic text-sm">
                No matching reservations.
              </div>
            ) : (
              selectedBookings.map((b) => (
                <div key={b.id} className="bg-[#1F1F1F] p-5 rounded-2xl border border-[#2A2A2A] hover:border-blue-500/30 transition-all group">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-bold text-sm text-white group-hover:text-blue-400 transition-colors">{b.guestName}</h4>
                    <span className="text-[9px] font-mono text-gray-600">ID: {b.id.toString().slice(-5)}</span>
                  </div>
                  <div className="text-[11px] text-gray-400 space-y-1">
                    <div className="flex justify-between">
                      <span>Room <span className="text-white">{b.roomNumber}</span></span> 
                      <span className="font-bold text-gray-600">{b.roomType}</span>
                    </div>
                    <div className="bg-black/30 p-2 rounded-lg mt-2 text-blue-200/60 border border-white/5 font-mono">
                      {b.checkIn} → {b.checkOut}
                    </div>
                  </div>
                  <div className="mt-4 flex justify-between items-center">
                    <span className={`px-2.5 py-0.5 rounded-md text-[9px] font-black uppercase
                      ${b.status === 'confirmed' ? 'bg-green-500/10 text-green-500' : 
                        b.status === 'checked_in' ? 'bg-blue-500/10 text-blue-500' : 'bg-gray-500/10 text-gray-500'}`}>
                      {b.status.replace('_', ' ')}
                    </span>
                    <span className="text-sm font-black text-white">₹{b.totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const StatCard = ({ label, value, highlight }) => (
  <div className="bg-[#161616] p-6 rounded-[24px] border border-[#222] hover:border-blue-500/20 transition-all">
    <div className={`text-2xl font-black tracking-tight ${highlight ? 'text-blue-500' : 'text-white'}`}>{value}</div>
    <div className="text-[10px] text-gray-600 uppercase font-bold mt-2 tracking-widest">{label}</div>
  </div>
);