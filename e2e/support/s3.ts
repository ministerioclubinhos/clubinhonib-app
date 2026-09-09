import { expect } from '@playwright/test';

/**
 * Conferência do arquivo no bucket, do lado de fora da aplicação.
 *
 * Excluir uma página e apagar o objeto no S3 são dois passos diferentes: o
 * banco pode ficar limpo e o arquivo continuar lá, ocupando espaço para sempre
 * — e nenhuma resposta da API conta isso. Os objetos do bucket são de leitura
 * pública (é assim que o site mostra as fotos), então um GET anônimo responde
 * a pergunta: `200` é arquivo no ar, `403`/`404` é arquivo removido.
 *
 * A consulta usa o `fetch` do Node, e não o cliente do Playwright, por dois
 * motivos: nada da sessão do administrador vai junto (senão o teste mediria a
 * API, e não o bucket) e nenhum contexto novo é aberto no meio do teste — o
 * que atropela os arquivos de trace da rodada.
 */

/** Status que significam "o objeto não está mais no bucket". */
const GONE_STATUSES = [403, 404];

/** Tempo de espera das verificações: a remoção no S3 vem depois da resposta. */
const CHECK_TIMEOUT = 20_000;

/** True quando a URL aponta para um objeto do S3, e não para um link externo. */
export function isS3Url(url: string): boolean {
  return /^https:\/\/[^/]+\.amazonaws\.com\/.+/.test(url);
}

/** Status de um GET anônimo na URL do arquivo. */
async function objectStatus(url: string): Promise<number> {
  const response = await fetch(url, { method: 'GET' });
  // O corpo precisa ser consumido para a conexão não ficar pendurada.
  await response.arrayBuffer();
  return response.status;
}

/**
 * Exige que a URL seja mesmo de um arquivo no bucket.
 *
 * Sem isso, um cenário que deixasse de enviar o arquivo (e gravasse um link)
 * passaria verde sem ter provado nada.
 */
export function expectUploadedToS3(url: string, hint: string): void {
  expect(isS3Url(url), `${hint}: a mídia não é um arquivo no S3 — ${url}`).toBe(true);
}

/** O arquivo saiu do bucket. */
export async function expectS3ObjectGone(url: string, hint: string): Promise<void> {
  expectUploadedToS3(url, hint);

  await expect
    .poll(
      async () => {
        const status = await objectStatus(url);
        return GONE_STATUSES.includes(status) ? 'removido' : `no ar (HTTP ${status})`;
      },
      { message: `${hint}: o arquivo continua no S3 — ${url}`, timeout: CHECK_TIMEOUT },
    )
    .toBe('removido');
}

/** O arquivo continua no bucket — nada foi apagado por engano. */
export async function expectS3ObjectPresent(url: string, hint: string): Promise<void> {
  expectUploadedToS3(url, hint);

  await expect
    .poll(
      async () => {
        const status = await objectStatus(url);
        return status === 200 ? 'no ar' : `removido (HTTP ${status})`;
      },
      { message: `${hint}: o arquivo sumiu do S3 — ${url}`, timeout: CHECK_TIMEOUT },
    )
    .toBe('no ar');
}
