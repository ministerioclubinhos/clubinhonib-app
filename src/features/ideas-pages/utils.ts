export const formatPtBrDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleString('pt-BR') : 'Não disponível';

export const truncate = (text: string, max = 100) =>
  text.length > max ? text.slice(0, max) + '...' : text;
