export const TOTAL_ROOMS = 10;

export const formatDate = (d) => d.toISOString().split('T')[0];

export const getMonthDays = (year, month) => {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const startDay = first.getDay(); // 0 for Sun
  const days = [];

  // Padding: Previous month
  for (let i = startDay - 1; i >= 0; i--) {
    days.push({ date: new Date(year, month, -i), isCurrent: false });
  }
  // Current month
  for (let i = 1; i <= last.getDate(); i++) {
    days.push({ date: new Date(year, month, i), isCurrent: true });
  }
  // Padding: Next month
  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) {
    days.push({ date: new Date(year, month + 1, i), isCurrent: false });
  }
  return days;
};

export const getHeatColor = (count) => {
  if (count === 0) return '#2A2A2A'; // Dark empty state
  const ratio = count / TOTAL_ROOMS;
  if (ratio <= 0.2) return '#D1FAE5'; // Very Light Green
  if (ratio <= 0.4) return '#A7F3D0'; // Light Green
  if (ratio <= 0.6) return '#FDE68A'; // Yellowish
  if (ratio <= 0.8) return '#FDBA74'; // Orange
  return '#EF4444'; // Red (Full)
};