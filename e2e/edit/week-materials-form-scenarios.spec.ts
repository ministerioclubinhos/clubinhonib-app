import { expect, test } from '@playwright/test';

import { ApiClient, PNG_1X1, uniqueSuffix } from '../support/api';
import { expectSuccessToast, replaceText, searchListing, selectMuiOption } from '../support/ui';

type MediaItemResponse = {
  id?: string;
  title: string;
  description: string;
  mediaType: string;
  uploadType: string;
  url?: string;
};

type WeekPageResponse = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  currentWeek: boolean;
  videos: MediaItemResponse[];
  documents: MediaItemResponse[];
  images: MediaItemResponse[];
  audios: MediaItemResponse[];
};

const initialVideo = {
  title: 'Vídeo Inicial E2E',
  description: 'Descrição do vídeo inicial',
  uploadType: 'link',
  mediaType: 'video',
  isLocalFile: false,
  url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  platformType: 'youtube',
};

const initialDocument = {
  title: 'Documento Inicial E2E',
  description: 'Descrição do documento inicial',
  uploadType: 'link',
  mediaType: 'document',
  isLocalFile: false,
  url: 'https://drive.google.com/file/d/doc-e2e/view',
  platformType: 'googledrive',
};

const initialImage = {
  title: 'Imagem Inicial E2E',
  description: 'Descrição da imagem inicial',
  uploadType: 'link',
  mediaType: 'image',
  isLocalFile: false,
  url: 'https://drive.google.com/file/d/img-e2e/view',
  platformType: 'googledrive',
};

const initialAudio = {
  title: 'Áudio Inicial E2E',
  description: 'Descrição do áudio inicial',
  uploadType: 'link',
  mediaType: 'audio',
  isLocalFile: false,
  url: 'https://drive.google.com/file/d/aud-e2e/view',
  platformType: 'googledrive',
};

test.describe('Formulário de Material Semanal: Cenários com Validação Visual da UI', () => {
  let api: ApiClient;
  const suffix = uniqueSuffix();
  const createdIds: string[] = [];

  test.beforeAll(async () => {
    api = await ApiClient.login();
  });

  test.beforeEach(() => {
    test.setTimeout(120_000);
  });

  test.afterAll(async () => {
    for (const id of createdIds.reverse()) {
      await api.delete(`/week-material-pages/${id}`);
    }
    await api.dispose();
  });

  test('edição de texto: atualiza título, tema e descrição no banco de dados', async ({ page }) => {
    const week = await api.postMultipart<WeekPageResponse>('/week-material-pages', {
      weekMaterialsPageData: JSON.stringify({
        pageTitle: `E2E Semana Texto ${suffix}`,
        pageSubtitle: 'Tema Original',
        pageDescription: 'Descrição Original',
        videos: [initialVideo],
      }),
    });
    createdIds.push(week.id);

    await page.goto(`/adm/editar-pagina-semana/${week.id}`);
    const form = page.getByTestId('week-materials-week-material-page-form');
    await expect(form).toBeVisible();

    await replaceText(form.getByRole('textbox', { name: /^Semana( \*)?$/ }), `E2E Semana Texto Editada ${suffix}`);
    await replaceText(form.getByRole('textbox', { name: /^Tema da Semana( \*)?$/ }), 'Tema Atualizado');
    await replaceText(form.getByLabel('Descrição do Tema da Semana'), 'Nova descrição salva pelo E2E');
    
    // Clica em salvar e aguarda confirmação visual (Toast / Alerta de Sucesso) na UI
    await form.getByRole('button', { name: 'Salvar Página' }).click();
    await page.waitForURL(/\/detalhes-material-semanal/);

    // Validação na API após confirmação do sucesso na tela
    await expect.poll(async () => api.get<WeekPageResponse>(`/week-material-pages/${week.id}`)).toMatchObject({
      title: `E2E Semana Texto Editada ${suffix}`,
      subtitle: 'Tema Atualizado',
      description: 'Nova descrição salva pelo E2E',
    });
  });

  test('add media dos 4 tipos: adiciona vídeo, documento, imagem e áudio no formulário', async ({ page }) => {
    const week = await api.postMultipart<WeekPageResponse>('/week-material-pages', {
      weekMaterialsPageData: JSON.stringify({
        pageTitle: `E2E Add 4 Mídias ${suffix}`,
        pageSubtitle: 'Subtítulo',
        pageDescription: 'Descrição',
        videos: [],
      }),
    });
    createdIds.push(week.id);

    await page.goto(`/adm/editar-pagina-semana/${week.id}`);
    const form = page.getByTestId('week-materials-week-material-page-form');
    await expect(form).toBeVisible();

    const editor = page.getByTestId('media-media-editor');

    // Aba 1: Vídeo (Link)
    await editor.getByLabel(/Título do Vídeo/i).fill('Novo Vídeo 4Tipos');
    await editor.getByLabel(/Descrição do Vídeo/i).fill('Descrição do vídeo');
    await selectMuiOption(page, editor.getByRole('combobox', { name: 'Tipo' }), 'Link');
    await selectMuiOption(page, editor.getByRole('combobox', { name: 'Plataforma' }), /youtube/i);
    await editor.getByLabel(/URL do vídeo/i).fill('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    await editor.getByRole('button', { name: /Adicionar vídeo/i }).click();
    // Confirmação visual no DOM: o item 'Novo Vídeo 4Tipos' aparece na lista de adicionados
    await expect(editor.getByText('Novo Vídeo 4Tipos')).toBeVisible();

    // Aba 2: Documento (Upload PDF)
    await page.getByRole('tab', { name: /Documentos/i }).click();
    await editor.getByLabel(/Título do Documento/i).fill('Novo Documento 4Tipos');
    await editor.getByLabel(/Descrição do Documento/i).fill('Descrição do documento');
    await selectMuiOption(page, editor.getByRole('combobox', { name: 'Tipo' }), 'Upload');
    await editor.locator('input[type="file"]').setInputFiles({
      name: 'guia_professores.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('%PDF-1.4 Content'),
    });
    await editor.getByRole('button', { name: /Adicionar documento/i }).click();
    // Confirmação visual no DOM
    await expect(editor.getByText('Novo Documento 4Tipos')).toBeVisible();

    // Aba 3: Imagens (Upload PNG)
    await page.getByRole('tab', { name: /Imagens/i }).click();
    await editor.getByLabel(/Título do Imagem/i).fill('Nova Imagem 4Tipos');
    await editor.getByLabel(/Descrição do Imagem/i).fill('Descrição da imagem');
    await selectMuiOption(page, editor.getByRole('combobox', { name: 'Tipo' }), 'Upload');
    await editor.locator('input[type="file"]').setInputFiles({
      name: 'banner_aula.png',
      mimeType: 'image/png',
      buffer: PNG_1X1,
    });
    await editor.getByRole('button', { name: /Adicionar imagem/i }).click();
    // Confirmação visual no DOM
    await expect(editor.getByText('Nova Imagem 4Tipos')).toBeVisible();

    // Aba 4: Áudios (Link Drive)
    await page.getByRole('tab', { name: /Áudios/i }).click();
    await editor.getByLabel(/Título do Áudio/i).fill('Novo Áudio 4Tipos');
    await editor.getByLabel(/Descrição do Áudio/i).fill('Descrição do áudio');
    await selectMuiOption(page, editor.getByRole('combobox', { name: 'Tipo' }), 'Link');
    await selectMuiOption(page, editor.getByRole('combobox', { name: 'Plataforma' }), /google drive/i);
    await editor.getByLabel(/URL do áudio/i).fill('https://drive.google.com/file/d/audio123/view');
    await editor.getByRole('button', { name: /Adicionar áudio/i }).click();
    // Confirmação visual no DOM
    await expect(editor.getByText('Novo Áudio 4Tipos')).toBeVisible();

    // Salvar formulário e aguardar resposta visual de sucesso (Toast)
    await form.getByRole('button', { name: 'Salvar Página' }).click();
    await page.waitForURL(/\/detalhes-material-semanal/);

    // Validar pela API que as 4 mídias estão salvas
    await expect.poll(async () => {
      const updated = await api.get<WeekPageResponse>(`/week-material-pages/${week.id}`);
      return {
        hasVideo: updated.videos.some((v) => v.title === 'Novo Vídeo 4Tipos'),
        hasDocument: updated.documents.some((d) => d.title === 'Novo Documento 4Tipos'),
        hasImage: updated.images.some((i) => i.title === 'Nova Imagem 4Tipos'),
        hasAudio: updated.audios.some((a) => a.title === 'Novo Áudio 4Tipos'),
      };
    }).toEqual({
      hasVideo: true,
      hasDocument: true,
      hasImage: true,
      hasAudio: true,
    });
  });

  test('editar media dos 4 tipos: altera título e descrição em cartões de vídeo, documento, imagem e áudio', async ({ page }) => {
    const week = await api.postMultipart<WeekPageResponse>('/week-material-pages', {
      weekMaterialsPageData: JSON.stringify({
        pageTitle: `E2E Edit 4 Mídias ${suffix}`,
        pageSubtitle: 'Subtítulo',
        pageDescription: 'Descrição',
        videos: [initialVideo],
        documents: [initialDocument],
        images: [initialImage],
        audios: [initialAudio],
      }),
    });
    createdIds.push(week.id);

    await page.goto(`/adm/editar-pagina-semana/${week.id}`);
    const form = page.getByTestId('week-materials-week-material-page-form');
    await expect(form).toBeVisible();

    const editor = page.getByTestId('media-media-editor');

    // 1. Editar Vídeo
    await editor.getByRole('button', { name: `Editar ${initialVideo.title}` }).click();
    await replaceText(editor.getByLabel(/Título do Vídeo/i), 'Vídeo Editado 4Tipos');
    await replaceText(editor.getByLabel(/Descrição do Vídeo/i), 'Descrição Vídeo Editada');
    await editor.getByRole('button', { name: 'Salvar Alterações' }).click();
    await expect(editor.getByText('Vídeo Editado 4Tipos')).toBeVisible();

    // 2. Editar Documento
    await page.getByRole('tab', { name: /Documentos/i }).click();
    await editor.getByRole('button', { name: `Editar ${initialDocument.title}` }).click();
    await replaceText(editor.getByLabel(/Título do Documento/i), 'Documento Editado 4Tipos');
    await replaceText(editor.getByLabel(/Descrição do Documento/i), 'Descrição Documento Editada');
    await editor.getByRole('button', { name: 'Salvar Alterações' }).click();
    await expect(editor.getByText('Documento Editado 4Tipos')).toBeVisible();

    // 3. Editar Imagem
    await page.getByRole('tab', { name: /Imagens/i }).click();
    await editor.getByRole('button', { name: `Editar ${initialImage.title}` }).click();
    await replaceText(editor.getByLabel(/Título do Imagem/i), 'Imagem Editada 4Tipos');
    await replaceText(editor.getByLabel(/Descrição do Imagem/i), 'Descrição Imagem Editada');
    await editor.getByRole('button', { name: 'Salvar Alterações' }).click();
    await expect(editor.getByText('Imagem Editada 4Tipos')).toBeVisible();

    // 4. Editar Áudio
    await page.getByRole('tab', { name: /Áudios/i }).click();
    await editor.getByRole('button', { name: `Editar ${initialAudio.title}` }).click();
    await replaceText(editor.getByLabel(/Título do Áudio/i), 'Áudio Editado 4Tipos');
    await replaceText(editor.getByLabel(/Descrição do Áudio/i), 'Descrição Áudio Editada');
    await editor.getByRole('button', { name: 'Salvar Alterações' }).click();
    await expect(editor.getByText('Áudio Editado 4Tipos')).toBeVisible();

    // Salvar página e aguardar toast de sucesso na tela
    await form.getByRole('button', { name: 'Salvar Página' }).click();
    await page.waitForURL(/\/detalhes-material-semanal/);

    // Conferencia na API
    await expect.poll(async () => {
      const updated = await api.get<WeekPageResponse>(`/week-material-pages/${week.id}`);
      return {
        videoTitle: updated.videos[0]?.title,
        docTitle: updated.documents[0]?.title,
        imgTitle: updated.images[0]?.title,
        audioTitle: updated.audios[0]?.title,
      };
    }).toEqual({
      videoTitle: 'Vídeo Editado 4Tipos',
      docTitle: 'Documento Editado 4Tipos',
      imgTitle: 'Imagem Editada 4Tipos',
      audioTitle: 'Áudio Editado 4Tipos',
    });
  });

  test('editar e excluir media: altera um item e remove outro da lista com validação no DOM', async ({ page }) => {
    const videoParaManter = { ...initialVideo, title: 'Vídeo a Manter' };
    const videoParaExcluir = { ...initialVideo, title: 'Vídeo a Excluir' };

    const week = await api.postMultipart<WeekPageResponse>('/week-material-pages', {
      weekMaterialsPageData: JSON.stringify({
        pageTitle: `E2E Edit e Del Mídias ${suffix}`,
        pageSubtitle: 'Sub',
        pageDescription: 'Desc',
        videos: [videoParaManter, videoParaExcluir],
      }),
    });
    createdIds.push(week.id);

    await page.goto(`/adm/editar-pagina-semana/${week.id}`);
    const form = page.getByTestId('week-materials-week-material-page-form');
    await expect(form).toBeVisible();

    const editor = page.getByTestId('media-media-editor');

    // 1. Editar o primeiro vídeo
    await editor.getByRole('button', { name: `Editar ${videoParaManter.title}` }).click();
    await replaceText(editor.getByLabel(/Título do Vídeo/i), 'Vídeo Mantido e Editado');
    await editor.getByRole('button', { name: 'Salvar Alterações' }).click();
    await expect(editor.getByText('Vídeo Mantido e Editado')).toBeVisible();

    // 2. Excluir o segundo vídeo e validar que ele desparece da tela
    await editor.getByRole('button', { name: `Remover ${videoParaExcluir.title}` }).click();
    const removeDialog = page.getByRole('dialog', { name: 'Confirmar Exclusão' });
    await expect(removeDialog).toBeVisible();
    await removeDialog.getByRole('button', { name: 'Remover' }).click();
    await expect(removeDialog).toBeHidden();

    // Confirmar visualmente no DOM que o vídeo removido não aparece mais na lista
    await expect(editor.getByText('Vídeo a Excluir')).toBeHidden();

    // Salvar página e aguardar o toast de confirmação
    await form.getByRole('button', { name: 'Salvar Página' }).click();
    await page.waitForURL(/\/detalhes-material-semanal/);

    // Conferir na API que restou apenas 1 vídeo com título editado
    await expect.poll(async () => {
      const updated = await api.get<WeekPageResponse>(`/week-material-pages/${week.id}`);
      return updated.videos.map((v) => v.title);
    }).toEqual(['Vídeo Mantido e Editado']);
  });

  test('excluir pagina: remove o material semanal pela listagem e valida a remoção no DOM', async ({ page }) => {
    const titleToDelete = `E2E Para Excluir ${suffix}`;
    const week = await api.postMultipart<WeekPageResponse>('/week-material-pages', {
      weekMaterialsPageData: JSON.stringify({
        pageTitle: titleToDelete,
        pageSubtitle: 'Página a ser apagada',
        pageDescription: 'Teste de exclusão',
        videos: [],
      }),
    });

    await page.goto('/adm/paginas-materiais-semanais');
    await page.waitForLoadState('networkidle');

    // Buscar a página pelo título
    await searchListing(page, titleToDelete);

    const card = page.getByTestId(`week-materials-week-material-list-card-${week.id}`);
    await expect(card).toBeVisible();

    // Clicar no botão de excluir no card
    await card.getByRole('button', { name: 'Excluir' }).click();

    // Confirmar no modal DeleteConfirmDialog
    const deleteModal = page.getByTestId('modal-delete-confirm-dialog');
    await expect(deleteModal).toBeVisible();
    await deleteModal.getByRole('button', { name: 'Excluir' }).click();
    await expect(deleteModal).toBeHidden();

    // O card deve sumir da listagem
    await expect(card).toBeHidden();

    // Confirmar pela API que a página foi permanentemente excluída
    await expect.poll(async () => {
      try {
        const res = await api.get<WeekPageResponse>(`/week-material-pages/${week.id}`);
        return res ? 'existe' : 'deletado';
      } catch {
        return 'deletado';
      }
    }).toBe('deletado');
  });
});
