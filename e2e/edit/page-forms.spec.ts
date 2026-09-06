import { expect, test } from '@playwright/test';

import { ApiClient, PNG_1X1, uniqueSuffix } from '../support/api';
import { replaceText, selectMuiOption } from '../support/ui';

type Page = { id: string; title: string; description: string; public: boolean };
type VideoPage = Page & { videos: { title: string }[] };
type WeekPage = { id: string; title: string; subtitle: string; description: string };
type Meditation = { id: string; topic: string };
type IdeasPage = Page & { sections: { id: string; title: string }[] };

const video = { title: 'Link', description: 'yt', uploadType: 'link', mediaType: 'video', isLocalFile: false, url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', platformType: 'youtube' };

/**
 * Formulários de página do painel (rotas `/adm/editar-…/:id`): galeria de imagens,
 * galeria de vídeos, materiais da semana, página de ideias e meditação. Cada
 * página é criada pela API, editada pela tela e relida pela API.
 */
test.describe('Formulários de página: edição', () => {
  let api: ApiClient;
  const suffix = uniqueSuffix();
  const created: { path: string; id: string }[] = [];

  test.beforeAll(async () => {
    api = await ApiClient.login();
  });

  test.afterAll(async () => {
    for (const { path, id } of created.reverse()) await api.delete(`${path}/${id}`);
    await api.dispose();
  });

  test('galeria de imagens: título, descrição e visibilidade', async ({ page }) => {
    const gallery = await api.postMultipart<Page>(
      '/image-pages',
      { imageData: JSON.stringify({ title: `E2E Galeria ${suffix}`, description: 'Original', public: false, sections: [{ caption: 'Seção', description: 'd', public: true, mediaItems: [{ title: 'Foto', description: 'png', uploadType: 'upload', mediaType: 'image', isLocalFile: true, fieldKey: 'img' }] }] }) },
      { img: { name: 'foto.png', mimeType: 'image/png', buffer: PNG_1X1 } },
    );
    created.push({ path: '/image-pages', id: gallery.id });

    await page.goto(`/adm/editar-pagina-imagens/${gallery.id}`);
    const form = page.getByTestId('image-pages-image-page-form');
    await expect(form).toBeVisible();
    await expect(form.getByLabel('Título da galeria')).toHaveValue(`E2E Galeria ${suffix}`);
    await replaceText(form.getByLabel('Título da galeria'), `E2E Galeria Editada ${suffix}`);
    await replaceText(form.getByRole('textbox', { name: /^Descrição( \*)?$/ }), 'Descrição editada');
    await form.getByRole('checkbox').first().check();
    await form.getByRole('button', { name: 'Salvar Galeria' }).click();

    await expect.poll(async () => api.get<Page>(`/image-pages/${gallery.id}`)).toMatchObject({ title: `E2E Galeria Editada ${suffix}`, description: 'Descrição editada', public: true });
  });

  test('galeria de vídeos: título, descrição e um vídeo novo por link', async ({ page }) => {
    const videos = await api.postMultipart<VideoPage>('/video-pages', { videosPageData: JSON.stringify({ title: `E2E Vídeos ${suffix}`, description: 'Original', public: true, videos: [video] }) });
    created.push({ path: '/video-pages', id: videos.id });

    await page.goto(`/adm/editar-pagina-videos/${videos.id}`);
    const form = page.getByTestId('video-pages-video-page-form');
    await expect(form).toBeVisible();
    await replaceText(form.getByLabel('Título da galeria'), `E2E Vídeos Editados ${suffix}`);

    const editor = page.getByTestId('video-pages-video-editor');
    await editor.getByLabel('Título do vídeo').fill('Vídeo novo E2E');
    await editor.getByLabel('Descrição do vídeo').fill('Adicionado pelo Playwright');
    await selectMuiOption(page, editor.getByRole('combobox', { name: 'Tipo' }), 'Link');
    await selectMuiOption(page, editor.getByRole('combobox', { name: 'Plataforma' }), /youtube/i);
    await editor.getByLabel('URL do vídeo').fill('https://www.youtube.com/watch?v=9bZkp7q19f0');
    await editor.getByRole('button', { name: 'Adicionar vídeo' }).click();
    await form.getByRole('button', { name: 'Salvar Galeria' }).click();

    await expect.poll(async () => (await api.get<VideoPage>(`/video-pages/${videos.id}`)).videos.map((v) => v.title)).toContain('Vídeo novo E2E');
    expect((await api.get<VideoPage>(`/video-pages/${videos.id}`)).title).toBe(`E2E Vídeos Editados ${suffix}`);
  });

  test('materiais da semana: título, subtítulo e descrição', async ({ page }) => {
    const week = await api.postMultipart<WeekPage>('/week-material-pages', { weekMaterialsPageData: JSON.stringify({ pageTitle: `E2E Semana ${suffix}`, pageSubtitle: 'Sub', pageDescription: 'Original', videos: [video] }) });
    created.push({ path: '/week-material-pages', id: week.id });

    await page.goto(`/adm/editar-pagina-semana/${week.id}`);
    const form = page.getByTestId('week-materials-week-material-page-form');
    await expect(form).toBeVisible();
    await replaceText(form.getByRole('textbox', { name: /^Semana( \*)?$/ }), `E2E Semana Editada ${suffix}`);
    await replaceText(form.getByRole('textbox', { name: /^Tema da Semana( \*)?$/ }), 'Tema editado');
    await replaceText(form.getByLabel('Descrição do Tema da Semana'), 'Descrição editada');
    await form.getByRole('button', { name: 'Salvar Página' }).click();

    await expect.poll(async () => api.get<WeekPage>(`/week-material-pages/${week.id}`)).toMatchObject({ title: `E2E Semana Editada ${suffix}`, subtitle: 'Tema editado', description: 'Descrição editada' });
  });

  test('página de ideias: título e descrição mantendo as seções', async ({ page }) => {
    const ideas = await api.postMultipart<IdeasPage>('/ideas-pages', { ideasMaterialsPageData: JSON.stringify({ title: `E2E Ideias ${suffix}`, description: 'Original', public: true, sections: [{ title: 'Seção 1', description: 'd', public: true, medias: [video] }] }) });
    created.push({ path: '/ideas-pages', id: ideas.id });

    await page.goto(`/adm/editar-pagina-ideias/${ideas.id}`);
    const form = page.getByTestId('ideas-pages-ideas-page-form');
    await expect(form).toBeVisible();
    await replaceText(form.getByLabel('Título da página'), `E2E Ideias Editadas ${suffix}`);
    await replaceText(form.getByRole('textbox', { name: /^Descrição( \*)?$/ }).first(), 'Descrição editada');
    await form.getByRole('button', { name: 'Salvar Página' }).click();

    await expect.poll(async () => api.get<IdeasPage>(`/ideas-pages/${ideas.id}`)).toMatchObject({ title: `E2E Ideias Editadas ${suffix}`, description: 'Descrição editada' });
    expect((await api.get<IdeasPage>(`/ideas-pages/${ideas.id}`)).sections).toHaveLength(1);
  });

  test('meditação: tema', async ({ page }) => {
    // Uma semana livre bem no futuro, de segunda a sexta.
    const monday = new Date(2097, 0, 7, 12);
    while (monday.getDay() !== 1) monday.setDate(monday.getDate() + 1);
    const friday = new Date(monday);
    friday.setDate(monday.getDate() + 4);
    const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day, i) => ({ day, verse: `Salmos 1:${i + 1}`, topic: `Dia ${i + 1}` }));
    const meditation = await api.postMultipart<Meditation>('/meditations', { meditationData: JSON.stringify({ topic: `E2E Meditação ${suffix}`, startDate: iso(monday), endDate: iso(friday), media: { title: 'Áudio', description: 'link', uploadType: 'link', mediaType: 'audio', isLocalFile: false, url: 'https://drive.google.com/file/d/e2e/view', platformType: 'googledrive' }, days }) });
    created.push({ path: '/meditations', id: meditation.id });

    await page.goto(`/adm/editar-meditacao/${meditation.id}`);
    const form = page.getByTestId('meditations-meditation-page-form');
    await expect(form).toBeVisible();
    await replaceText(form.getByLabel('Tema da Meditação'), `E2E Meditação Editada ${suffix}`);
    await form.getByRole('button', { name: 'Salvar Meditação' }).click();

    await expect.poll(async () => (await api.get<Meditation>(`/meditations/${meditation.id}`)).topic).toBe(`E2E Meditação Editada ${suffix}`);
  });
});
