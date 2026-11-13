const DAY_MS = 24 * 60 * 60 * 1000;
const BOGOTA_OFFSET_MS = 5 * 60 * 60 * 1000;

function bogotaMidnight(value) {
  if (value.length !== 10 || value[4] !== '-' || value[7] !== '-') return null;
  for (let index = 0; index < value.length; index += 1) {
    if (index === 4 || index === 7) continue;
    if (value[index] < '0' || value[index] > '9') return null;
  }
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(0);
  date.setUTCFullYear(year, month - 1, day);
  date.setUTCHours(0, 0, 0, 0);
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1
    || date.getUTCDate() !== day) return null;
  return date.getTime() + BOGOTA_OFFSET_MS;
}

export function parseHistoryDateRange(from, to) {
  const startMs = bogotaMidnight(from.trim());
  const lastDayMs = bogotaMidnight(to.trim());
  if (startMs === null || lastDayMs === null || lastDayMs < startMs) return null;
  return { startMs, endMs: lastDayMs + DAY_MS };
}
