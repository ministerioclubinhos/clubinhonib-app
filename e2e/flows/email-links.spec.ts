import { expect, test } from '@playwright/test';

import { ApiClient } from '../support/api';
import { enableProductFlags } from '../support/featureFlags';

/**
 * Todo endereço que a API coloca num e-mail precisa abrir uma tela de verdade.
 * Os caminhos espelham as constantes `*_PATH(S)` da API; os de documento,
 * informativo e meditação são o `route.path` publicado.
 */
const FIXED_PATHS = [
  '/login',
  '/contato',
  '/eventos',
  '/feed-clubinho',
  '/adm/pagelas',
  '/adm/controle-clubinhos',
  '/adm/resumo-semanal',
  '/adm/feedbacks',
  '/adm/comentarios',
  '/adm/contatos',
  '/descadastrar',
  `/recuperar-senha/${'a'.repeat(64)}`,
  `/confirmar-email/${'a'.repeat(64)}`,
];

const CONTENT_DESTINATIONS = {
  Document: '/area-do-professor/documentos',
  Informative: '/area-do-professor',
  Meditation: '/area-do-professor',
} as const;

interface PublishedRoute {
  path: string;
  entityType: string;
}

test.describe('Links dos e-mails', () => {
  let api: ApiClient;
  let restoreFlags: () => Promise<void>;

  test.beforeAll(async () => {
    api = await ApiClient.login();
    restoreFlags = await enableProductFlags(api);
  });

  test.afterAll(async () => {
    await restoreFlags?.();
    await api?.dispose();
  });

  async function expectRealScreen(page: import('@playwright/test').Page): Promise<void> {
    const main = page.locator('main');
    await expect(main).toBeVisible();
    await page.waitForLoadState('networkidle');
    await expect(main).not.toContainText('Caminho errado');
    await expect(main).not.toContainText('Tipo de página desconhecido');
  }

  for (const path of FIXED_PATHS) {
    test(`abre ${path.slice(0, 40)}`, async ({ page }) => {
      await page.goto(path);
      await expectRealScreen(page);
    });
  }

  test('o aviso de decisão leva à ficha da criança', async ({ page }) => {
    const children = await api.get<{ data: { id: string; name: string }[] }>('/children', { page: 1, limit: 1 });
    const child = children.data[0];
    expect(child, 'o ambiente local precisa de uma criança').toBeTruthy();
    await page.goto(`/area-das-criancas/${child.id}`);
    await expectRealScreen(page);
    await expect(page.locator('main')).toContainText(child.name);
  });

  for (const [entityType, destination] of Object.entries(CONTENT_DESTINATIONS)) {
    test(`o link de ${entityType} leva à tela que exibe o conteúdo`, async ({ page }) => {
      const routes = await api.get<PublishedRoute[]>('/routes');
      const route = routes.find((item) => item.entityType === entityType);
      expect(route, `o ambiente local precisa de uma rota de ${entityType}`).toBeTruthy();

      await page.goto(`/${route!.path.replace(/^\/+/, '')}`);
      await expect(page).toHaveURL(new RegExp(`${destination}$`));
      await expectRealScreen(page);
    });
  }
});
