import { test as teardown } from '@playwright/test';

import { ApiClient } from './api';
import {
  clearDisabledFlags,
  enableFlags,
  readDisabledFlags,
  shouldRestoreEmailFlags,
} from './emailFlags';

/**
 * Religa, ao fim da rodada, apenas o que esta rodada desligou.
 *
 * Só roda com `E2E_RESTORE_EMAIL_FLAGS=1`. Sem isso as flags ficam
 * desligadas — que é o pedido: elas ficavam ligadas e a cota diária ia embora
 * a cada rodada.
 */
teardown('religa os envios de e-mail', async () => {
  if (!shouldRestoreEmailFlags()) {
    teardown.skip(true, 'defina E2E_RESTORE_EMAIL_FLAGS=1 para religar os envios');
    return;
  }

  const keys = readDisabledFlags();
  if (keys.length === 0) return;

  const api = await ApiClient.login();

  try {
    await enableFlags(api, keys);
    clearDisabledFlags();
    console.log(`[e2e] ${keys.length} flag(s) de e-mail religada(s).`);
  } finally {
    await api.dispose();
  }
});
