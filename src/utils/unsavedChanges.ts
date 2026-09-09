/**
 * Registro das telas abertas com alterações ainda não salvas.
 *
 * O `beforeunload` do navegador cobre recarregar e fechar a aba, mas não a
 * navegação interna: clicar no menu do painel troca de tela sem passar pelo
 * navegador, e o rascunho some sem aviso. O `useBlocker` do React Router
 * resolveria isso, só que existe apenas em *data router* — o app monta as
 * rotas com `BrowserRouter`, e migrar a montagem inteira para interceptar uma
 * saída é grande demais para o que resolve.
 *
 * Então o formulário anuncia aqui que está sujo, e quem navega pergunta antes
 * de sair. É um `Set` de identificadores, e não um booleano, porque duas telas
 * podem estar montadas ao mesmo tempo (uma seção dentro de um formulário, por
 * exemplo) e a que sai primeiro não pode zerar o aviso da outra.
 */
const dirtyForms = new Set<string>();

/** Anuncia que o formulário tem alterações a perder. */
export function markFormDirty(formId: string): void {
  dirtyForms.add(formId);
}

/** Retira o formulário do registro: salvou, desfez ou saiu da tela. */
export function clearFormDirty(formId: string): void {
  dirtyForms.delete(formId);
}

/** Se alguma tela aberta tem alteração não salva. */
export function hasUnsavedChanges(): boolean {
  return dirtyForms.size > 0;
}

/** Esvazia o registro. Existe para os testes começarem do zero. */
export function resetUnsavedChanges(): void {
  dirtyForms.clear();
}
