import { MediaType, type MediaItem } from '@/store/slices/types';
import type { PlayVideo } from './types';

/** Adapta o vídeo do Play ao formato que os players antigos entendem. */
export const toMediaItem = (video: PlayVideo): MediaItem => ({
  id: video.id,
  title: video.title,
  description: video.description,
  mediaType: MediaType.VIDEO,
  uploadType: video.uploadType,
  platformType: video.platformType,
  url: video.url,
  isLocalFile: video.isLocalFile,
  originalName: video.originalName,
  size: video.size,
  createdAt: video.createdAt,
});

/** 75 → "1:15"; 3725 → "1:02:05". */
export function formatDuration(totalSeconds: number | null | undefined): string {
  if (!totalSeconds || totalSeconds < 0) return '';
  const seconds = Math.floor(totalSeconds % 60);
  const minutes = Math.floor((totalSeconds / 60) % 60);
  const hours = Math.floor(totalSeconds / 3600);
  const pad = (value: number) => String(value).padStart(2, '0');
  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(seconds)}` : `${minutes}:${pad(seconds)}`;
}

/** 1 → "1 visualização"; 1200 → "1,2 mil visualizações". */
export function formatViews(count: number): string {
  if (count === 1) return '1 visualização';
  if (count >= 1000) {
    return `${(count / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} mil visualizações`;
  }
  return `${count} visualizações`;
}

/** "há 3 dias", "há 2 meses"… a partir de uma data ISO. */
export function timeAgo(iso: string, now: Date = new Date()): string {
  const diffMs = now.getTime() - new Date(iso).getTime();
  if (Number.isNaN(diffMs) || diffMs < 0) return '';
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 60) return 'agora há pouco';
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `há ${hours} ${hours === 1 ? 'hora' : 'horas'}`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `há ${days} ${days === 1 ? 'dia' : 'dias'}`;
  const months = Math.floor(days / 30);
  if (months < 12) return `há ${months} ${months === 1 ? 'mês' : 'meses'}`;
  const years = Math.floor(months / 12);
  return `há ${years} ${years === 1 ? 'ano' : 'anos'}`;
}

/** Percentual assistido (0–100) para a barra do card; 0 quando não há dados. */
export function progressPercent(video: PlayVideo): number {
  const progress = video.progress;
  if (!progress) return 0;
  if (progress.completed) return 100;
  const duration = progress.durationSeconds ?? video.durationSeconds;
  if (!duration) return 0;
  return Math.min(100, Math.round((progress.positionSeconds / duration) * 100));
}

/** Segundo em que retomar: só vale se houver progresso útil e o vídeo não terminou. */
export function resumeAt(video: PlayVideo, margin: number): number {
  const progress = video.progress;
  if (!progress || progress.completed || progress.positionSeconds <= margin) return 0;
  const duration = progress.durationSeconds ?? video.durationSeconds;
  if (duration && progress.positionSeconds >= duration - margin) return 0;
  return progress.positionSeconds;
}
