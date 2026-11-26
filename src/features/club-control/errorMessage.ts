import { extractErrorMessage } from '@/utils/apiError';

/** Mensagem que a API recusou (envelope `error.message`), com texto de reserva. */
export const getClubControlErrorMessage = (error: unknown, fallback: string): string =>
  extractErrorMessage(error, fallback);
