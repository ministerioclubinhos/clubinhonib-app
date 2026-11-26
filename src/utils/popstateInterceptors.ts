/**
 * Interceptadores do "voltar/avançar" do navegador que rodam ANTES do roteador.
 *
 * No `window`, os ouvintes de `popstate` rodam na ordem de registro, mesmo os de
 * captura. O ouvinte de uma tela é sempre posterior ao do `BrowserRouter`: o
 * roteador trocava de página, a tela desmontava e o aviso de edição não salva
 * nunca aparecia. Este módulo registra o único ouvinte quando é importado (no
 * `main.tsx`, antes de o roteador montar) e as telas se inscrevem nele.
 */
export type PopStateInterceptor = (event: PopStateEvent) => void;

const interceptors = new Set<PopStateInterceptor>();

function dispatch(event: PopStateEvent): void {
  // A tela inscrita por último decide primeiro; quem interrompe a propagação
  // impede o roteador (e os demais) de tratar o evento.
  for (const interceptor of [...interceptors].reverse()) {
    interceptor(event);
    if (event.cancelBubble) return;
  }
}

if (typeof window !== 'undefined') window.addEventListener('popstate', dispatch, true);

export function addPopStateInterceptor(interceptor: PopStateInterceptor): () => void {
  interceptors.add(interceptor);
  return () => {
    interceptors.delete(interceptor);
  };
}
