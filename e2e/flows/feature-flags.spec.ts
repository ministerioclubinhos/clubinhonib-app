import { expect, test } from '@playwright/test';

import { ApiClient } from '../support/api';

type Flag = { id: string; key: string; name: string; enabled: boolean };
type Stats = { total: number; enabled: number; disabled: number };
type Paged = { data: Flag[]; total: number };

/**
 * Feature flags: o painel (`/adm/feature-flags`) e o efeito das flags no app
 * (`FeatureFlagsProvider`, `FeatureRoute`, menu do `AdminLayout`).
 */
test.describe('Feature flags', () => {
  let api: ApiClient;

  test.beforeAll(async () => {
    api = await ApiClient.login();
  });

  test.afterAll(async () => {
    await api.dispose();
  });

  test('no celular mantém a ação principal, a listagem, o interruptor e a conferência do catálogo', async ({ page }) => {
    const stats = await api.get<Stats>('/feature-flags/stats');
    const first = (await api.get<Paged>('/feature-flags', { page: 1, limit: 1 })).data[0];

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/adm/feature-flags');
    const manager = page.getByTestId('feature-flags-feature-flags-manager');
    await expect(manager).toBeVisible();

    await expect(manager.getByRole('button', { name: /nova flag/i })).toBeVisible();
    await expect(manager.getByText('Conferir catálogo')).toBeVisible();
    await expect(manager.getByText(`${stats.total} no total`)).toBeVisible();
    await expect(manager.getByText(`${stats.enabled} ligadas`)).toBeVisible();
    await expect(manager.getByText(`${stats.disabled} desligadas`)).toBeVisible();
    await expect(manager.getByText(first.name, { exact: true }).first()).toBeVisible();
    await expect(page.getByLabel(`Alternar ${first.name}`).first()).toBeVisible();
  });

  test('no desktop mostra busca e filtros de situação e público', async ({ page }) => {
    await page.goto('/adm/feature-flags');
    const manager = page.getByTestId('feature-flags-feature-flags-manager');
    await expect(manager.getByRole('combobox', { name: 'Situação' })).toBeVisible();
    await expect(manager.getByRole('combobox', { name: 'Público' })).toBeVisible();
  });

  test('busca o mapa de flags uma vez ao abrir o painel', async ({ page }) => {
    const mapRequests: string[] = [];
    page.on('request', (request) => {
      if (request.url().includes('/feature-flags/map')) mapRequests.push(request.url());
    });
    await page.goto('/adm');
    await expect(page.getByTestId('adm-admin-layout')).toBeVisible();
    await page.waitForLoadState('networkidle');
    expect(mapRequests).toHaveLength(1);
  });

  test('flag desligada esconde o item do menu e redireciona a rota; ligada de novo, tudo volta', async ({ page }) => {
    const flag = await api.get<Flag>('/feature-flags/club_control');
    test.skip(!flag.enabled, 'a flag club_control já está desligada neste ambiente');

    try {
      await api.patch(`/feature-flags/${flag.key}`, { enabled: false });

      await page.goto('/adm/controle-clubinhos');
      await expect(page).toHaveURL(/\/adm\/?$/);
      const sidebar = page.getByTestId('adm-admin-layout');
      await expect(sidebar.getByText('Estatísticas', { exact: true })).toBeVisible();
      await expect(sidebar.getByText('Controle de Clubinhos', { exact: true })).toHaveCount(0);
    } finally {
      await api.patch(`/feature-flags/${flag.key}`, { enabled: true });
    }

    await page.goto('/adm/controle-clubinhos');
    await expect(page).toHaveURL(/\/adm\/controle-clubinhos$/);
    await expect(page.getByTestId('adm-admin-layout').getByText('Controle de Clubinhos', { exact: true })).toBeVisible();
  });
});
