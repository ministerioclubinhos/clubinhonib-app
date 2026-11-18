import type { MediaType } from '@/store/slices/types';

/** O mínimo que esta página precisa saber de uma mídia para agrupá-la. */
interface TypedMedia {
  mediaType: MediaType;
}

/** Uma seção da página, do ponto de vista da contagem. */
interface CountableSection {
  medias: readonly TypedMedia[];
}

/** As mídias de um tipo, na ordem em que a API as devolveu. */
export function mediasOfType<T extends TypedMedia>(
  medias: readonly T[],
  mediaType: MediaType,
): T[] {
  return medias.filter((media) => media.mediaType === mediaType);
}

/** Quantas mídias a página reúne, somando todas as seções. */
export function countMedias(sections: readonly CountableSection[]): number {
  return sections.reduce((total, section) => total + section.medias.length, 0);
}

/**
 * O resumo que aparece sob o título: "3 seções · 8 materiais".
 *
 * Fica aqui, e não no JSX, porque é onde o singular e o plural são decididos —
 * a versão anterior mostrava "(1)" ao lado do rótulo e repetia o número num
 * chip ao lado, sem nunca dizer de que se tratava.
 */
export function pageSummaryLabel(sectionCount: number, mediaCount: number): string {
  const sections = `${sectionCount} ${sectionCount === 1 ? 'seção' : 'seções'}`;
  const medias = `${mediaCount} ${mediaCount === 1 ? 'material' : 'materiais'}`;

  return `${sections} · ${medias}`;
}
