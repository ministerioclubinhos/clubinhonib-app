import { expect, test } from '@playwright/test';

import { ApiClient, PNG_1X1, uniqueSuffix } from '../support/api';
import { TEACHER_EMAIL, TEACHER_PASSWORD } from '../support/env';
import { waitForIdeaAi } from '../support/ideaAi';
import { replaceText, selectMuiOption } from '../support/ui';

type ImageSection = { id: string; caption: string; description: string; public: boolean; pageId: string | null };
type IdeasSection = { id: string; title: string; public: boolean; pageId: string | null };
type IdeasPage = { id: string; title: string };

/**
 * Filas de moderação: fotos do clubinho (`/adm/editar-imagens-clubinho/:id`)
 * e ideias compartilhadas (`/adm/editar-ideias-compartilhadas/:id`). O envio
 * é feito como professor pela API; a administração revisa pela tela.
 */
test.describe('Moderação: fotos e ideias', () => {
  let api: ApiClient;
  let teacher: ApiClient;
  const suffix = uniqueSuffix();
  let photos: ImageSection;
  let idea: IdeasSection;
  let ideasPage: IdeasPage;

  test.beforeAll(async () => {
    api = await ApiClient.login();
    teacher = await ApiClient.login(TEACHER_EMAIL, TEACHER_PASSWORD);
    photos = await teacher.postMultipart<ImageSection>(
      '/image-sections',
      { sectionData: JSON.stringify({ caption: `E2E Fotos ${suffix}`, description: 'Original', mediaItems: [{ title: 'Foto', uploadType: 'upload', mediaType: 'image', isLocalFile: true, originalName: 'foto.png', fieldKey: 'foto' }] }) },
      { foto: { name: 'foto.png', mimeType: 'image/png', buffer: PNG_1X1 } },
    );
    idea = await teacher.postMultipart<IdeasSection>('/ideas-sections', { sectionData: JSON.stringify({ title: `E2E Ideia ${suffix}`, description: 'Original', medias: [{ title: 'Link', uploadType: 'link', mediaType: 'video', isLocalFile: false, url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', platformType: 'youtube' }] }) });
    ideasPage = await api.postMultipart<IdeasPage>('/ideas-pages', { ideasMaterialsPageData: JSON.stringify({ title: `E2E Destino ${suffix}`, description: 'd', public: true, sections: [{ title: 'Seção base', description: 'd', public: true, medias: [] }] }) });
  });

  test.afterAll(async () => {
    // Se o preparo falhar no meio, a limpeza não pode esconder o erro original.
    if (photos) await api.delete(`/image-sections/${photos.id}`);
    if (ideasPage) await api.delete(`/ideas-pages/${ideasPage.id}`);
    if (idea) await api.delete(`/ideas-sections/${idea.id}`);
    await teacher.dispose();
    await api.dispose();
  });

  test('fotos do clubinho: revisa a legenda e aprova', async ({ page }) => {
    await page.goto(`/adm/editar-imagens-clubinho/${photos.id}`);
    const editor = page.getByTestId('teacher-area-image-section-image-section-editor');
    await expect(editor).toBeVisible();
    await replaceText(editor.getByLabel('Título da publicação'), `E2E Fotos Aprovadas ${suffix}`);
    await replaceText(editor.getByLabel('Descrição'), 'Descrição revisada');
    await page.getByRole('button', { name: 'Aprovar e publicar' }).click();

    await expect.poll(async () => api.get<ImageSection>(`/image-sections/${photos.id}`)).toMatchObject({ caption: `E2E Fotos Aprovadas ${suffix}`, description: 'Descrição revisada', public: true });
  });

  test('ideia compartilhada: publica numa página de ideias', async ({ page }) => {
    // Com a melhoria por IA ligada, o envio entra na fila (IA simulada). A tela
    // só é estável depois que a tentativa termina.
    const aiEnabled = (await api.get<Record<string, boolean>>('/feature-flags/map')).idea_ai_enhancement;
    if (aiEnabled) await waitForIdeaAi(api, idea.id);

    await page.goto(`/adm/editar-ideias-compartilhadas/${idea.id}`);
    await expect(page.getByTestId('ideas-sections-ideas-section-review-page')).toBeVisible();
    await selectMuiOption(page, page.getByRole('combobox', { name: 'Página de destino' }), `E2E Destino ${suffix}`);
    await selectMuiOption(page, page.getByRole('combobox', { name: 'Visibilidade' }), 'Pública');
    // Havendo resultado de IA, publicar exige confirmar as escolhas.
    if (aiEnabled) await page.getByRole('checkbox', { name: 'Confirmo as escolhas' }).check();
    await page.getByRole('button', { name: 'Publicar ideia' }).click();

    await expect.poll(async () => api.get<IdeasSection>(`/ideas-sections/${idea.id}`)).toMatchObject({ pageId: ideasPage.id, public: true });
  });
});
