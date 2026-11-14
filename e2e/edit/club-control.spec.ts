import { expect, test } from '@playwright/test';

import { ApiClient } from '../support/api';
import { replaceText } from '../support/ui';

type Period = { id: string; year: number; startDate: string; endDate: string; description: string };

/**
 * Período letivo: a edição acontece na aba "Períodos Letivos" do controle de
 * clubinhos (`/adm/controle-clubinhos`). Usa um ano distante e descartável.
 */
test.describe('Controle de clubinhos: edição de período', () => {
  let api: ApiClient;
  let period: Period;
  const year = 2096;

  test.beforeAll(async () => {
    api = await ApiClient.login();
    const existing = await api.get<Period | null>(`/club-control/periods/${year}`);
    period = existing?.id
      ? existing
      : await api.post<Period>('/club-control/periods', { year, startDate: `${year}-02-01`, endDate: `${year}-12-10`, description: 'E2E período' });
  });

  test.afterAll(async () => {
    await api.delete(`/club-control/periods/${period.id}`);
    await api.dispose();
  });

  test('edita a descrição pelo diálogo', async ({ page }) => {
    await page.goto('/adm/controle-clubinhos');
    await expect(page.getByTestId('club-control-club-control-page-club-control-page-content')).toBeVisible();
    await page.getByRole('tab', { name: /Períodos/ }).click();
    await expect(page.getByTestId('club-control-period-management')).toBeVisible();

    const row = page.getByText(String(year), { exact: false }).locator('xpath=ancestor::*[self::tr or contains(@class,"MuiCard-root") or contains(@class,"MuiPaper-root")][1]').first();
    await row.getByRole('button', { name: 'Editar' }).click();

    const dialog = page.getByTestId('club-control-period-edit-dialog');
    await expect(dialog).toBeVisible();
    // As datas usam o DatePicker do MUI (campo por seções); a edição de datas
    // é coberta pela automação da API. Aqui muda a descrição e as datas ficam.
    await replaceText(dialog.getByLabel('Descrição'), 'E2E período editado');
    await dialog.getByRole('button', { name: /Salvar Alterações/ }).click();
    await expect(dialog).toBeHidden();

    await expect.poll(async () => api.get<Period>(`/club-control/periods/${year}`)).toMatchObject({
      startDate: period.startDate,
      endDate: period.endDate,
      description: 'E2E período editado',
    });
  });
});
