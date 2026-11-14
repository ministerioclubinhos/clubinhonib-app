import { lazy, type ComponentType, type LazyExoticComponent } from 'react';

/** Marca em `sessionStorage` de que a página já recarregou por um chunk perdido. */
export const CHUNK_RELOAD_KEY = 'clubinho:chunk-reload';

/**
 * Erro de carregamento de um pedaço do bundle. Depois de um deploy os arquivos
 * antigos deixam de existir, e quem estava com o site aberto recebe este erro
 * ao navegar para uma tela ainda não carregada.
 */
export function isChunkLoadError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  return /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module|ChunkLoadError|Loading chunk [\w-]+ failed/i.test(
    `${error.name} ${error.message}`
  );
}

/** Decide se recarrega: só uma vez por sessão, para não entrar em laço. */
export function shouldReloadForChunk(error: unknown, alreadyReloaded: boolean): boolean {
  return isChunkLoadError(error) && !alreadyReloaded;
}

function readFlag(): boolean {
  try {
    return window.sessionStorage.getItem(CHUNK_RELOAD_KEY) === '1';
  } catch {
    return true;
  }
}

function writeFlag(value: boolean): void {
  try {
    if (value) window.sessionStorage.setItem(CHUNK_RELOAD_KEY, '1');
    else window.sessionStorage.removeItem(CHUNK_RELOAD_KEY);
  } catch {
    /* Sem storage, não recarrega (evita laço). */
  }
}

/**
 * `React.lazy` que, ao encontrar um chunk perdido depois de um deploy,
 * recarrega a página uma única vez para buscar a versão nova. Outros erros
 * seguem para o error boundary normalmente.
 */
export function lazyWithRetry<P extends object>(
  factory: () => Promise<{ default: ComponentType<P> }>
): LazyExoticComponent<ComponentType<P>> {
  return lazy(async () => {
    try {
      const module = await factory();
      writeFlag(false);
      return module;
    } catch (error: unknown) {
      if (shouldReloadForChunk(error, readFlag())) {
        writeFlag(true);
        window.location.reload();
        // Mantém o Suspense até o reload acontecer.
        return new Promise<{ default: ComponentType<P> }>(() => undefined);
      }
      throw error;
    }
  });
}

/** `lazyWithRetry` para componentes exportados pelo nome (arquivos índice). */
export function lazyNamedWithRetry<M, P extends object>(
  load: () => Promise<M>,
  pick: (module: M) => ComponentType<P>
): LazyExoticComponent<ComponentType<P>> {
  return lazyWithRetry(() => load().then((module) => ({ default: pick(module) })));
}
