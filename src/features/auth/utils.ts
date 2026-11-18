import { LINK_CLUB_MESSAGES, MIN_CLUB_NUMBER } from './constants';
import type { ClubNumberValidation } from './types';

/**
 * Confere o número de clubinho digitado.
 *
 * A regra estava dentro do `handleSubmit` do modal, o que impedia testá-la sem
 * montar o diálogo. `parseInt` sozinho aceitava `"12abc"` como 12 e `"0"` como
 * falsy — este último caía no mesmo ramo de "não informado".
 */
export function validateClubNumber(input: string): ClubNumberValidation {
  const texto = input.trim();

  if (!/^\d+$/.test(texto)) {
    return { valid: false, message: LINK_CLUB_MESSAGES.invalidNumber };
  }

  const clubNumber = Number.parseInt(texto, 10);

  if (clubNumber < MIN_CLUB_NUMBER) {
    return { valid: false, message: LINK_CLUB_MESSAGES.invalidNumber };
  }

  return { valid: true, clubNumber };
}

/** Mensagem de erro do vínculo, venha ela como texto ou como `Error`. */
export function linkClubErrorMessage(error: unknown): string {
  if (typeof error === 'string' && error.trim()) return error;
  if (error instanceof Error && error.message) return error.message;

  return LINK_CLUB_MESSAGES.failed;
}
