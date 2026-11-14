import { PROMPT_MAX_LENGTH, PROMPT_MIN_LENGTH } from './constants';
import type { AdminPromptPreference, PromptLocalDrafts } from './types';

/**
 * Regras puras da tela de orientações de criação.
 *
 * As orientações são pessoais: cada administrador tem as próprias, por tipo de
 * material e por etapa. Aqui ficam as contas que a tela mostra sobre elas.
 */

/** Quantas etapas o administrador personalizou, e de quantas. */
export function promptCustomisationSummary(
  preferences: readonly AdminPromptPreference[] | undefined
): { customised: number; total: number } {
  const list = preferences ?? [];
  return {
    customised: list.filter((item) => Boolean(item.customPrompt?.trim())).length,
    total: list.length,
  };
}

/** "2 etapas personalizadas de 8", ou o aviso de que tudo está no padrão. */
export function promptSummaryLabel(summary: { customised: number; total: number }): string {
  if (summary.total === 0) return '';
  if (summary.customised === 0) return 'Todas as etapas no padrão oficial';
  const what = summary.customised === 1 ? 'etapa personalizada' : 'etapas personalizadas';
  return `${summary.customised} ${what} de ${summary.total}`;
}

/** Quantas etapas têm texto digitado e ainda não salvo. */
export function promptPendingCount(drafts: PromptLocalDrafts | undefined): number {
  return Object.keys(drafts ?? {}).length;
}

/**
 * O usuário apagou a orientação que estava salva?
 *
 * Campo vazio não é uma orientação válida (o mínimo é de alguns caracteres),
 * mas é exatamente o que alguém faz para deixar de personalizar. A tela trata
 * isso como "voltar ao padrão oficial", em vez de travar o botão de salvar.
 */
export function isClearingSavedPrompt(
  value: string,
  preference: Pick<AdminPromptPreference, 'customPrompt'> | undefined
): boolean {
  return value.trim() === '' && Boolean(preference?.customPrompt?.trim());
}

/** Por que o texto não pode ser salvo, ou `null` quando pode. */
export function promptValidationMessage(value: string): string | null {
  const length = value.trim().length;
  if (length === 0) return null;
  if (value.length > PROMPT_MAX_LENGTH) {
    return `O texto passou do limite de ${PROMPT_MAX_LENGTH} caracteres.`;
  }
  if (length < PROMPT_MIN_LENGTH) {
    return `Escreva pelo menos ${PROMPT_MIN_LENGTH} caracteres.`;
  }
  return null;
}

/** "salva em 11/11/2026 às 12:30", no fuso de quem está olhando. */
export function promptSavedLabel(iso: string | null | undefined): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const day = date.toLocaleDateString('pt-BR');
  const time = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  return `salva em ${day} às ${time}`;
}

/** Primeiro nome, para o aviso de que as orientações são pessoais. */
export function firstName(name: string | null | undefined): string {
  return (name ?? '').trim().split(/\s+/)[0] ?? '';
}
