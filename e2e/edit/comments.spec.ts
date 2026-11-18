import { expect, test } from '@playwright/test';

import { ApiClient, uniqueSuffix } from '../support/api';
import { cardOf, replaceText, searchListing } from '../support/ui';

type Comment = { id: string; name: string; comment: string; clubinho: string; neighborhood: string; published: boolean };

/** Edição e publicação de comentários (`/adm/comentarios`). */
test.describe('Comentários: edição e publicação', () => {
  let api: ApiClient;
  let comment: Comment;
  const suffix = uniqueSuffix();

  test.beforeAll(async () => {
    api = await ApiClient.login();
    comment = await api.post<Comment>('/comments', { name: `E2E Autor ${suffix}`, comment: 'Comentário original', clubinho: 'Clubinho 1', neighborhood: 'Centro' });
  });

  test.afterAll(async () => {
    await api.delete(`/comments/${comment.id}`);
    await api.dispose();
  });

  test('edita os quatro campos pelo diálogo', async ({ page }) => {
    await page.goto('/adm/comentarios');
    await expect(page.getByTestId('comments-comments-manager')).toBeVisible();
    await searchListing(page, suffix);
    const card = cardOf(page, 'comments', 'comment-card', comment.id);
    await expect(card).toBeVisible();
    await card.getByRole('button', { name: 'Editar' }).click();

    const dialog = page.getByTestId('comments-edit-comment-dialog');
    await expect(dialog).toBeVisible();
    await replaceText(dialog.getByLabel('Nome'), `E2E Editado ${suffix}`);
    await replaceText(dialog.getByLabel('Clubinho'), 'Clubinho 7');
    await replaceText(dialog.getByLabel('Bairro'), 'Vila Nova');
    await replaceText(dialog.getByRole('textbox', { name: 'Comentário' }), 'Comentário editado pelo Playwright');
    await dialog.getByRole('button', { name: 'Salvar' }).click();
    await expect(dialog).toBeHidden();

    await expect.poll(async () => api.get<Comment>(`/comments/${comment.id}`)).toMatchObject({
      name: `E2E Editado ${suffix}`,
      clubinho: 'Clubinho 7',
      neighborhood: 'Vila Nova',
      comment: 'Comentário editado pelo Playwright',
    });
  });

  test('publica e despublica pelo botão do card', async ({ page }) => {
    await page.goto('/adm/comentarios');
    await searchListing(page, suffix);
    const card = cardOf(page, 'comments', 'comment-card', comment.id);
    await card.getByRole('button', { name: 'Publicar' }).click();
    await expect.poll(async () => (await api.get<Comment>(`/comments/${comment.id}`)).published).toBe(true);

    await expect(card.getByRole('button', { name: 'Despublicar' })).toBeVisible();
    await card.getByRole('button', { name: 'Despublicar' }).click();
    await expect.poll(async () => (await api.get<Comment>(`/comments/${comment.id}`)).published).toBe(false);
  });
});
