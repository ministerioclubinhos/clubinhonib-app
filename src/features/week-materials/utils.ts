export const truncate = (text: string, max = 100) =>
  text.length > max ? `${text.slice(0, max)}...` : text;

export const formatDate = (date?: string) =>
  date ? new Date(date).toLocaleString('pt-BR') : 'Não disponível';
