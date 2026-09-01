import { isAxiosError } from 'axios';

export const getClubControlErrorMessage = (
  error: unknown,
  fallback: string,
): string => {
  if (isAxiosError<{ message?: string | string[] }>(error)) {
    const message = error.response?.data?.message;
    if (Array.isArray(message)) return message.join('. ');
    if (message) return message;
  }
  return error instanceof Error && error.message ? error.message : fallback;
};
