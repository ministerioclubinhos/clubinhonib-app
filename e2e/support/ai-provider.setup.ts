import { expect, request, test as setup } from '@playwright/test';

import { API_URL } from './env';

/** Valor de `aiProviderMode` no `/health` da API que não gasta tokens. */
const SAFE_AI_MODE = 'fake';

/**
 * Trava de custo: nenhum teste de navegador roda contra uma API que chama a
 * OpenAI/Gemini de verdade.
 *
 * As funcionalidades com IA (Estúdio, ideias, provedores) disparam chamadas
 * pagas em segundo plano — fila, worker, regeneração —, e um teste novo ou um
 * clique a mais bastaria para gastar tokens. Com `AI_PROVIDER_MODE=fake` a API
 * percorre o fluxo inteiro com respostas simuladas e nunca sai para a internet.
 *
 * Suba a API assim antes do E2E:
 *   AI_PROVIDER_MODE=fake ./run.sh local
 *
 * `E2E_ALLOW_LIVE_AI=1` libera explicitamente uma rodada com IA real.
 */
setup('a API está com a IA simulada (sem gastar tokens)', async () => {
  if (process.env.E2E_ALLOW_LIVE_AI === '1') {
    console.warn('[e2e] E2E_ALLOW_LIVE_AI=1: a suíte pode chamar a IA de verdade.');
    return;
  }
  const ctx = await request.newContext({ baseURL: API_URL });
  try {
    const response = await ctx.get('/health');
    expect(response.ok(), `GET ${API_URL}/health -> ${response.status()}`).toBeTruthy();
    const { aiProviderMode } = (await response.json()) as { aiProviderMode?: string };
    expect(
      aiProviderMode,
      `A API em ${API_URL} está com a IA REAL (aiProviderMode=${String(aiProviderMode)}). ` +
        'Os E2E não podem gastar tokens: reinicie a API com AI_PROVIDER_MODE=fake ' +
        '(ex.: AI_PROVIDER_MODE=fake ./run.sh local) ou, só se for intencional, use E2E_ALLOW_LIVE_AI=1.'
    ).toBe(SAFE_AI_MODE);
  } finally {
    await ctx.dispose();
  }
});
