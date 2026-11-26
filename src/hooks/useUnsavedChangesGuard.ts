import { useEffect, useId } from 'react';

import { clearFormDirty, markFormDirty } from '@/utils/unsavedChanges';

/**
 * Avisa antes de descartar a página com alterações pendentes.
 *
 * Cobre dois caminhos: o navegador (recarregar, fechar a aba, sair para uma
 * URL externa) pelo `beforeunload`, e a navegação interna do painel pelo
 * registro em `@/utils/unsavedChanges`, que o menu consulta antes de trocar de
 * tela. O identificador vem do `useId` para duas telas montadas ao mesmo tempo
 * não apagarem o aviso uma da outra.
 */
export function useUnsavedChangesGuard(isDirty: boolean): void {
  const formId = useId();

  useEffect(() => {
    if (!isDirty) {
      clearFormDirty(formId);
      return;
    }

    markFormDirty(formId);

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // Sair da tela com o rascunho por salvar também limpa o registro: quem
      // saiu já foi avisado, e o aviso não pode sobreviver à tela.
      clearFormDirty(formId);
    };
  }, [isDirty, formId]);
}
