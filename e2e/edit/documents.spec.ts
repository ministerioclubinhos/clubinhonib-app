import { expect, test } from '@playwright/test';

import { ApiClient, PNG_1X1, uniqueSuffix } from '../support/api';
import { cardOf, replaceText, searchListing } from '../support/ui';

type Document = { id: string; name: string; description: string | null; media: { url: string; isLocalFile: boolean } | null };

/** Edição de documento (`/adm/documentos`): texto mantendo o arquivo já enviado. */
test.describe('Documentos: edição', () => {
  let api: ApiClient;
  let doc: Document;
  const suffix = uniqueSuffix();

  test.beforeAll(async () => {
    api = await ApiClient.login();
    doc = await api.postMultipart<Document>(
      '/documents',
      { documentData: JSON.stringify({ name: `E2E Documento ${suffix}`, description: 'Descrição original', media: { title: 'Arquivo', description: 'png', uploadType: 'upload', mediaType: 'document', isLocalFile: true, fileField: 'docFile' } }) },
      { docFile: { name: 'e2e.png', mimeType: 'image/png', buffer: PNG_1X1 } },
    );
  });

  test.afterAll(async () => {
    await api.delete(`/documents/${doc.id}`);
    await api.dispose();
  });

  test('edita nome e descrição mantendo o arquivo', async ({ page }) => {
    await page.goto('/adm/documentos');
    await expect(page.getByTestId('documents-documents-manager')).toBeVisible();
    await searchListing(page, suffix);
    const card = cardOf(page, 'documents', 'document-list-card', doc.id);
    await expect(card).toBeVisible();
    await card.getByRole('button', { name: 'Editar' }).click();

    const dialog = page.getByTestId('documents-document-form-dialog');
    await expect(dialog).toBeVisible();
    await replaceText(dialog.getByLabel('Nome do documento'), `E2E Documento Editado ${suffix}`);
    await replaceText(dialog.getByLabel('Descrição'), 'Descrição editada pelo Playwright');
    // Regressão: um re-render do gerenciador com o diálogo aberto repunha os
    // valores do servidor por cima do que já havia sido digitado. Conferir
    // antes de salvar faz a falha apontar o campo, não o registro salvo.
    await expect(dialog.getByLabel('Nome do documento')).toHaveValue(
      `E2E Documento Editado ${suffix}`,
    );
    await dialog.getByRole('button', { name: 'Salvar alterações' }).click();
    await expect(dialog).toBeHidden();

    await expect.poll(async () => api.get<Document>(`/documents/${doc.id}`)).toMatchObject({
      name: `E2E Documento Editado ${suffix}`,
      description: 'Descrição editada pelo Playwright',
      media: expect.objectContaining({ url: doc.media?.url, isLocalFile: true }),
    });
  });
});
