import { test as setup } from '@playwright/test';

import { ApiClient } from './api';
import { disableEmailFlags, saveDisabledFlags } from './emailFlags';

/**
 * Desliga os envios de e-mail antes de qualquer teste de navegador.
 *
 * A suíte cria usuário, publica informativo, material e evento; cada uma
 * dessas ações dispara um aviso para toda a base ativa, e uma rodada completa
 * estourava a cota diária do provedor. Como as flags nascem ligadas, isso
 * acontecia em toda rodada.
 *
 * O passo falha alto se não conseguir desligar: passar batido aqui significa
 * gastar cota de verdade nos próximos sessenta testes.
 */
setup('desliga os envios de e-mail', async () => {
  const api = await ApiClient.login();

  try {
    const desligadas = await disableEmailFlags(api);
    saveDisabledFlags(desligadas);

    console.log(
      desligadas.length > 0
        ? `[e2e] ${desligadas.length} flag(s) de e-mail desligada(s): ${desligadas.join(', ')}`
        : '[e2e] nenhuma flag de e-mail estava ligada.',
    );
  } finally {
    await api.dispose();
  }
});
