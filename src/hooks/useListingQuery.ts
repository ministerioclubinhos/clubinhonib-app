import { useCallback, useEffect, useRef, useState } from "react";

/** Espera padrão entre a última tecla e a busca no servidor. */
export const LISTING_SEARCH_DEBOUNCE_MS = 400;

/**
 * Segura o valor por um tempo antes de deixá-lo passar.
 *
 * A busca é digitada e vai ao servidor; sem a espera, cada tecla vira uma
 * requisição.
 */
export function useDebouncedValue<T>(
  value: T,
  delay = LISTING_SEARCH_DEBOUNCE_MS,
): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

/**
 * Cancela a busca anterior quando outra começa.
 *
 * Devolve só a função, estável entre renderizações: um objeto novo a cada
 * render viraria uma dependência sempre diferente no efeito de busca — foi
 * assim que uma listagem entrou em laço infinito de renderização.
 */
export function useAbortController(): () => AbortController {
  const ref = useRef<AbortController | null>(null);

  useEffect(() => () => ref.current?.abort(), []);

  return useCallback(() => {
    ref.current?.abort();
    const controller = new AbortController();
    ref.current = controller;
    return controller;
  }, []);
}
