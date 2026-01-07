export const fmtDate = (date?: string | Date, tz = 'America/Manaus') => {
  if (!date) return '—';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleString('pt-BR', { timeZone: tz });
};
