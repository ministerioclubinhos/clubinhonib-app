import type {
  InformativeFormErrors,
  InformativeFormValues,
  InformativeRequest,
  InformativeResponse,
  InformativeSortField,
  InformativeSortOrder,
} from './types';

/**
 * Formata a data que a API devolve em ISO.
 *
 * Uma data inválida vira travessão em vez de "Invalid Date" no card.
 */
export function formatDate(value?: string | null): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('pt-BR');
}

/** Duas letras do título, para o avatar do card. */
export function informativeInitials(title: string): string {
  const parts = title.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

/** Estado inicial do formulário, para criação ou a partir do informativo. */
export function toFormValues(
  informative: InformativeResponse | null,
): InformativeFormValues {
  return {
    title: informative?.title ?? '',
    description: informative?.description ?? '',
    // Um informativo novo nasce publicado, que é o caso comum do painel.
    public: informative?.public ?? true,
  };
}

/** Quais campos obrigatórios ainda estão pendentes. */
export function validateForm(
  values: InformativeFormValues,
): InformativeFormErrors {
  return {
    title: !values.title.trim(),
    description: !values.description.trim(),
  };
}

/** True quando algum campo obrigatório está pendente. */
export function hasErrors(errors: InformativeFormErrors): boolean {
  return errors.title || errors.description;
}

/**
 * Corpo enviado à API.
 *
 * Só os três campos que o DTO aceita: a validação global recusa a requisição
 * inteira quando chega qualquer chave a mais.
 */
export function toRequest(values: InformativeFormValues): InformativeRequest {
  return {
    title: values.title.trim(),
    description: values.description.trim(),
    public: values.public,
  };
}

/** Divide o valor do seletor de ordenação em campo e direção. */
export function parseSortOption(value: string): {
  sort: InformativeSortField;
  order: InformativeSortOrder;
} {
  const [sort, order] = value.split(':');
  return {
    sort: sort === 'title' ? 'title' : 'createdAt',
    order: order === 'ASC' ? 'ASC' : 'DESC',
  };
}
