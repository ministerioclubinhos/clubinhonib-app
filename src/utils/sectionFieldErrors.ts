import { SectionApiErrors } from '@/components/common/section-outline/types';
import { getApiErrorDetails } from '@/utils/apiError';

const isFieldError = (value: unknown): value is { field: string; message: string } =>
  typeof value === 'object' &&
  value !== null &&
  typeof (value as { field?: unknown }).field === 'string' &&
  typeof (value as { message?: unknown }).message === 'string';

/**
 * Agrupa por posição os `fieldErrors` da API de uma coleção (`sections`,
 * `videos`...), para o editor apontar onde está o problema. Erros fora de
 * `<coleção>.N.*` ficam só na mensagem geral.
 */
export const collectionApiErrorsFrom = (error: unknown, collection: string): SectionApiErrors => {
  const fieldErrors = getApiErrorDetails(error)?.fieldErrors;
  if (!Array.isArray(fieldErrors)) return {};
  const path = new RegExp(`^${collection}\\.(\\d+)\\.`);
  return fieldErrors.filter(isFieldError).reduce<SectionApiErrors>((grouped, item) => {
    const match = path.exec(item.field);
    if (!match) return grouped;
    const index = Number(match[1]);
    const messages = grouped[index] ?? [];
    return messages.includes(item.message)
      ? grouped
      : { ...grouped, [index]: [...messages, item.message] };
  }, {});
};

/** Erros da API agrupados pela seção afetada. */
export const sectionApiErrorsFrom = (error: unknown): SectionApiErrors =>
  collectionApiErrorsFrom(error, 'sections');
