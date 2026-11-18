import { GENERATION_PHASE_LABELS, GENERATION_TEXTS } from './generation.constants';
import { LessonGenerationPhase, type LessonGenerationProgress } from './types';

type ProgressCounts = Pick<LessonGenerationProgress, 'phase' | 'totalImages' | 'completedImages'>;

/** "Gerando as imagens — 2 de 5 prontas", "Escrevendo o conteúdo (depois, 5 imagens)". */
export function generationStepText(progress: ProgressCounts | null | undefined): string {
  if (!progress) return GENERATION_TEXTS.unknown;
  const label = GENERATION_PHASE_LABELS[progress.phase];
  const { totalImages: total, completedImages: done } = progress;
  if (total <= 0) return label;
  if (progress.phase === LessonGenerationPhase.WRITING)
    return `${label} (depois, ${total} ${total === 1 ? 'imagem' : 'imagens'})`;
  if (progress.phase === LessonGenerationPhase.IMAGES) {
    const remaining = Math.max(0, total - done);
    return `${label} — ${done} de ${total} ${done === 1 ? 'pronta' : 'prontas'}, ${
      remaining === 1 ? 'falta 1' : `faltam ${remaining}`
    }`;
  }
  return `${label} — ${total} de ${total} imagens prontas`;
}

/** Seconds since the server started the generation; survives a page reload. */
export function generationElapsedSeconds(
  startedAt: string | null | undefined,
  now: number = Date.now()
): number | null {
  if (!startedAt) return null;
  const started = new Date(startedAt).getTime();
  if (!Number.isFinite(started)) return null;
  return Math.max(0, Math.floor((now - started) / 1000));
}

/** Part of the snapshot signature: a new image must repaint the screen. */
export function generationSignature(progress: LessonGenerationProgress | null | undefined): string {
  return progress
    ? `${progress.stage}:${progress.phase}:${progress.completedImages}/${progress.totalImages}`
    : '';
}
