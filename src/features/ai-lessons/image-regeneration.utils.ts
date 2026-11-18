import {
  IMAGE_BRIEF_FIELD,
  IMAGE_REGENERATION_TEXTS,
  IMAGE_SET_STAGES,
} from './image-regeneration.constants';
import {
  LessonStageStatus,
  LessonStageType,
  type ImageBriefView,
  type LessonStage,
  type RegenerableImage,
  type VisualAsset,
} from './types';
import { objectValue, visualAssets } from './utils';

const assetCaption = (asset: VisualAsset): string =>
  [asset.title, asset.displayText, asset.instruction, asset.purpose]
    .map((text) => (typeof text === 'string' ? text.trim() : ''))
    .find(Boolean) ?? '';

/** The images of the version in use, as the selection dialog lists them. */
export function regenerableImages(
  stage: LessonStageType,
  structuredData: Record<string, unknown> | null | undefined
): RegenerableImage[] {
  return visualAssets(structuredData, stage).map((asset, index) => {
    const caption = assetCaption(asset);
    return {
      id: String(asset.id ?? ''),
      url: asset.url?.trim() ?? '',
      label: caption ? `Imagem ${index + 1} — ${caption}` : `Imagem ${index + 1}`,
      first: index === 0,
    };
  });
}

export function mustRegenerateAllImages(stage: LessonStageType): boolean {
  return IMAGE_SET_STAGES.includes(stage);
}

/**
 * Why the images of this item cannot be regenerated right now; `null` when they
 * can. Mirrors the API, so the button never offers what would be refused.
 */
export function imageRegenerationBlockedReason(input: {
  stage: Pick<LessonStage, 'status'>;
  images: readonly RegenerableImage[];
  edited: boolean;
}): string | null {
  if (input.images.some((image) => !image.id || !image.url))
    return IMAGE_REGENERATION_TEXTS.blocked.missing;
  if (input.stage.status === LessonStageStatus.STALE) return IMAGE_REGENERATION_TEXTS.blocked.stale;
  if (input.edited) return IMAGE_REGENERATION_TEXTS.blocked.unsaved;
  return null;
}

/** Marks or unmarks one image; a set item is always all or nothing. */
export function toggleImageSelection(
  selected: readonly string[],
  id: string,
  all: readonly string[],
  setOnly: boolean
): string[] {
  if (setOnly) return selected.length === all.length ? [] : [...all];
  const next = selected.includes(id) ? selected.filter((item) => item !== id) : [...selected, id];
  // Kept in the order of the item, whatever the order of the clicks.
  return all.filter((item) => next.includes(item));
}

/** "2 de 5 imagens serão refeitas; 3 ficam como estão." */
export function imageSelectionSummary(selected: number, total: number): string {
  if (selected === 0) return `Nenhuma imagem marcada (${total} no item).`;
  if (selected >= total)
    return total === 1
      ? 'A imagem do item será refeita.'
      : `Todas as ${total} imagens serão refeitas.`;
  const kept = total - selected;
  return `${selected} de ${total} ${selected === 1 ? 'imagem será refeita' : 'imagens serão refeitas'}; ${
    kept === 1 ? '1 fica como está' : `${kept} ficam como estão`
  }.`;
}

/** The note about the identity image only matters when it is redone without the others. */
export function showsFirstImageNote(
  images: readonly RegenerableImage[],
  selected: readonly string[]
): boolean {
  const first = images.find((image) => image.first);
  return Boolean(
    first && selected.includes(first.id) && selected.length > 0 && selected.length < images.length
  );
}

/**
 * The master image prompt stored with the version; `null` for versions made
 * before it existed (the API writes one on the next regeneration).
 */
export function imageBriefView(
  structuredData: Record<string, unknown> | null | undefined
): ImageBriefView | null {
  const brief = objectValue(structuredData?.[IMAGE_BRIEF_FIELD]);
  const artDirection = typeof brief.artDirection === 'string' ? brief.artDirection.trim() : '';
  if (!artDirection || !Array.isArray(brief.parts)) return null;
  const parts: Record<string, string> = {};
  for (const item of brief.parts) {
    const part = objectValue(item);
    if (typeof part.prompt === 'string' && part.prompt.trim())
      parts[String(part.assetId)] = part.prompt.trim();
  }
  return {
    artDirection,
    parts,
    createdAt: typeof brief.createdAt === 'string' ? brief.createdAt : null,
  };
}

/** What happens to the master prompt with the current selection. */
export function imageBriefOutcome(
  brief: ImageBriefView | null,
  selected: number,
  total: number
): string {
  if (selected > 0 && selected >= total) return IMAGE_REGENERATION_TEXTS.brief.rewritten;
  return brief ? IMAGE_REGENERATION_TEXTS.brief.reused : IMAGE_REGENERATION_TEXTS.brief.created;
}
