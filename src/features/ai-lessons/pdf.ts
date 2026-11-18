import { isAxiosError } from 'axios';
import { PDF_ERROR_FALLBACK, PDF_NETWORK_ERROR, PDF_TIMEOUT_ERROR } from './constants';
import { objectValue } from './utils';

export async function lessonPdfError(error: unknown): Promise<string> {
  if (!isAxiosError(error)) return PDF_ERROR_FALLBACK;
  if (!error.response) return error.code === 'ECONNABORTED' ? PDF_TIMEOUT_ERROR : PDF_NETWORK_ERROR;
  if (error.response.status >= 500) return PDF_ERROR_FALLBACK;
  let data: unknown = error.response.data;
  if (data instanceof Blob) {
    try {
      data = JSON.parse(await data.text()) as unknown;
    } catch {
      return PDF_ERROR_FALLBACK;
    }
  }
  const envelope = objectValue(data);
  const message = objectValue(envelope.error).message ?? envelope.message;
  // Only public client-error messages, never technical exceptions or raw responses.
  if (
    typeof message !== 'string' ||
    /stack|exception|\bat\s+\w+\s*\(|https?:|\/tmp\/|node_modules|sql|password|token|api.?key/i.test(
      message
    ) ||
    message.length > 500
  )
    return PDF_ERROR_FALLBACK;
  return message;
}

export function downloadLessonPdf(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
