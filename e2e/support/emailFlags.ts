import fs from 'node:fs';
import path from 'node:path';

import { API_URL } from './env';
import type { ApiClient } from './api';

/**
 * As flags de envio de e-mail, desligadas enquanto a suíte roda.
 *
 * Os testes criam usuário, publicam informativo, material e evento — e cada
 * uma dessas ações dispara um aviso para toda a base ativa. Com as flags
 * ligadas, uma rodada completa estoura a cota diária do provedor; e como elas
 * ficam ligadas por padrão, isso acontecia em **toda** rodada.
 *
 * Desligar é o estado seguro: um envio a menos não invalida nenhum teste da
 * suíte (nenhum deles afirma que um e-mail saiu), enquanto um envio a mais
 * custa cota real.
 */

/** Prefixo que identifica uma flag de envio, como no `FeatureFlagKeys` da API. */
export const EMAIL_FLAG_PREFIX = 'email_';

/** Onde fica registrado o que esta rodada desligou. */
export const EMAIL_FLAGS_STATE = 'e2e/.auth/email-flags.json';

/** Maior página que `/feature-flags` aceita; acima disso responde `VAL_4001`. */
const FLAGS_PAGE_LIMIT = 100;

/** O recorte da flag que este passo precisa. */
export interface FeatureFlag {
  key: string;
  name: string;
  enabled: boolean;
}

interface FlagsPage {
  data: FeatureFlag[];
  total: number;
  pageCount: number;
}

/**
 * Recusa mexer em qualquer ambiente que não seja o local.
 *
 * Desligar uma flag é mudança de configuração: ela sobrevive à rodada. Num
 * ambiente compartilhado isso silenciaria avisos de verdade — inclusive a
 * recuperação de senha — sem ninguém perceber.
 */
export function assertLocalApi(): void {
  const isLocal = /^https?:\/\/(localhost|127\.0\.0\.1)(:|\/|$)/.test(API_URL);
  if (isLocal || process.env.E2E_ALLOW_REMOTE_FLAGS === '1') return;

  throw new Error(
    `Recusando desligar as flags de e-mail em ${API_URL}: a mudança sobrevive à rodada. ` +
      'Aponte a suíte para a API local, ou passe E2E_ALLOW_REMOTE_FLAGS=1 se for mesmo o que você quer.',
  );
}

/**
 * Todas as flags cadastradas, percorrendo as páginas.
 *
 * A listagem tem teto de 100 por página. Hoje o acervo cabe numa só, mas
 * assumir isso faria uma flag nova de e-mail passar despercebida — e é
 * exatamente a que estaria gastando cota.
 */
async function listAllFlags(api: ApiClient): Promise<FeatureFlag[]> {
  const flags: FeatureFlag[] = [];

  for (let page = 1; ; page += 1) {
    const resposta = await api.get<FlagsPage>('/feature-flags', {
      page,
      limit: FLAGS_PAGE_LIMIT,
    });
    flags.push(...(resposta.data ?? []));

    if (resposta.data.length === 0 || page >= (resposta.pageCount || 1)) break;
  }

  return flags;
}

/**
 * As chaves que precisam ser desligadas: as `email_*` ainda ligadas.
 *
 * As que já estavam desligadas ficam de fora de propósito — assim a
 * restauração no fim da rodada não liga o que alguém havia desligado por
 * decisão própria.
 */
export function selectEmailFlagsToDisable(
  flags: readonly FeatureFlag[],
): string[] {
  return flags
    .filter((flag) => flag.key.startsWith(EMAIL_FLAG_PREFIX) && flag.enabled)
    .map((flag) => flag.key);
}

/** Desliga todas as flags `email_*` ligadas e devolve o que desligou. */
export async function disableEmailFlags(api: ApiClient): Promise<string[]> {
  assertLocalApi();

  const chaves = selectEmailFlagsToDisable(await listAllFlags(api));

  for (const key of chaves) {
    await api.patch(`/feature-flags/${key}`, { enabled: false });
  }

  return chaves;
}

/** Liga de volta as chaves informadas. */
export async function enableFlags(api: ApiClient, keys: readonly string[]): Promise<void> {
  for (const key of keys) {
    await api.patch(`/feature-flags/${key}`, { enabled: true });
  }
}

/** Registra em disco o que foi desligado, para a restauração opcional. */
export function saveDisabledFlags(keys: readonly string[]): void {
  fs.mkdirSync(path.dirname(EMAIL_FLAGS_STATE), { recursive: true });
  fs.writeFileSync(EMAIL_FLAGS_STATE, JSON.stringify(keys, null, 2));
}

/** Lê o que a última rodada desligou; lista vazia quando não há registro. */
export function readDisabledFlags(): string[] {
  if (!fs.existsSync(EMAIL_FLAGS_STATE)) return [];

  const parsed: unknown = JSON.parse(fs.readFileSync(EMAIL_FLAGS_STATE, 'utf8'));
  return Array.isArray(parsed) ? parsed.filter((key): key is string => typeof key === 'string') : [];
}

/** Apaga o registro depois de restaurar. */
export function clearDisabledFlags(): void {
  if (fs.existsSync(EMAIL_FLAGS_STATE)) fs.rmSync(EMAIL_FLAGS_STATE);
}

/**
 * Se a rodada deve religar as flags ao terminar.
 *
 * Desligado por padrão, e de propósito: a restauração só acontece quando a
 * rodada termina limpa. Um `Ctrl+C` no meio pularia o passo — e a falha, aí,
 * é para o lado seguro (as flags continuam desligadas). O contrário deixaria a
 * cota exposta justamente quando algo deu errado.
 */
export function shouldRestoreEmailFlags(): boolean {
  return process.env.E2E_RESTORE_EMAIL_FLAGS === '1';
}
