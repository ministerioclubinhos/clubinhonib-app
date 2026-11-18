import { MAX_RENDERABLE_BYTES } from './constants';

export class DocumentLoadError extends Error {
  constructor(
    message: string,
    readonly reason: 'network' | 'too-large' | 'invalid',
  ) {
    super(message);
    this.name = 'DocumentLoadError';
  }
}

/** Baixa o arquivo em memória. Falha de rede/CORS vira `DocumentLoadError`. */
export async function loadDocumentBytes(url: string, signal: AbortSignal): Promise<ArrayBuffer> {
  let response: Response;
  try {
    response = await fetch(url, { signal });
  } catch (error: unknown) {
    if (signal.aborted) throw error;
    throw new DocumentLoadError('Não foi possível baixar o arquivo.', 'network');
  }
  if (!response.ok) {
    throw new DocumentLoadError(`O servidor respondeu ${response.status}.`, 'network');
  }

  const declared = Number(response.headers.get('content-length') ?? 0);
  if (declared > MAX_RENDERABLE_BYTES) {
    throw new DocumentLoadError('Arquivo grande demais para visualizar aqui.', 'too-large');
  }

  const bytes = await response.arrayBuffer();
  if (bytes.byteLength > MAX_RENDERABLE_BYTES) {
    throw new DocumentLoadError('Arquivo grande demais para visualizar aqui.', 'too-large');
  }
  return bytes;
}
