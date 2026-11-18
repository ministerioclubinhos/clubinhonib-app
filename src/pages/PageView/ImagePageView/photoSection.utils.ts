const MONTHS = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
];

/** "5 de setembro de 2026", ou `null` se a data for inválida/ausente. */
export function formatPhotoDate(value?: string | Date): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return `${date.getDate()} de ${MONTHS[date.getMonth()]} de ${date.getFullYear()}`;
}

export function photoCountLabel(total: number): string {
  return `${total} ${total === 1 ? 'foto' : 'fotos'}`;
}
