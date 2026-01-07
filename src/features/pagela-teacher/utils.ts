export const BRAND_GREEN = '#81d742';

export function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
export function clampWeek(w: number) {
  return Math.max(1, Math.min(53, w));
}
export function toLabelWeek(year: number, week: number) {
  return `Ano: ${year} Semana: ${String(week).padStart(2, '0')}`;
}
export function getISOWeekYear(date: Date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const year = d.getUTCFullYear();
  const yearStart = new Date(Date.UTC(year, 0, 1));
  const week = Math.ceil(((+d - +yearStart) / 86400000 + 1) / 7);
  return { year, week };
}
