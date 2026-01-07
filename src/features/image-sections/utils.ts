export const truncate = (text: string = '', max = 100) =>
  text.length > max ? text.slice(0, max) + '...' : text;

export const formatDatePtBr = (date?: string | Date) => {
  if (!date) return 'Não disponível';
  return new Date(date).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};
