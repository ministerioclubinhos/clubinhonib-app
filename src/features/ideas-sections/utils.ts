export const truncate = (text: string = '', max = 100) =>
  text.length > max ? text.slice(0, max) + '...' : text;

export const formatDatePtBr = (date?: string | Date) => {
  if (!date) return 'Não disponível';
  return new Date(date).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

export const getMediaTypeIcon = (mediaType: string) => {
  switch (mediaType) {
    case 'image':
      return '🖼️';
    case 'video':
      return '🎥';
    case 'audio':
      return '🎵';
    case 'document':
      return '📄';
    default:
      return '📁';
  }
};

export const getMediaTypeLabel = (mediaType: string) => {
  switch (mediaType) {
    case 'image':
      return 'Imagem';
    case 'video':
      return 'Vídeo';
    case 'audio':
      return 'Áudio';
    case 'document':
      return 'Documento';
    default:
      return 'Arquivo';
  }
};

export const formatFileSize = (bytes: number | null) => {
  if (!bytes) return 'Tamanho desconhecido';
  
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};

