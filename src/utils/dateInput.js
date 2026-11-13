export function toIsoDate(dayText, monthText, yearText) {
  const day = Number(dayText);
  const month = Number(monthText);
  const year = Number(yearText);
  if (!/^\d{1,2}$/.test(dayText) || !/^\d{1,2}$/.test(monthText) || !/^\d{4}$/.test(yearText)) return null;
  if (year < 1 || month < 1 || month > 12) return null;
  const lastDay = new Date(0);
  lastDay.setFullYear(year, month, 0);
  const daysInMonth = lastDay.getDate();
  if (day < 1 || day > daysInMonth) return null;
  return `${yearText}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function fromIsoDate(value, fallback) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value || '');
  return match ? { day: match[3], month: match[2], year: match[1] } : {
    day: String(fallback.getDate()).padStart(2, '0'),
    month: String(fallback.getMonth() + 1).padStart(2, '0'),
    year: String(fallback.getFullYear()),
  };
}
