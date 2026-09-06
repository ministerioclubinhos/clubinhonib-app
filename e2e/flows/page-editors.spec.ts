import { expect, Locator, Page, test } from '@playwright/test';

import { selectMuiOption } from '../support/ui';

/**
 * Criador de páginas (`/adm/criar-pagina`) e os editores de conteúdo que ele
 * abre: `MediaEditor` (materiais da semana), `VideoEditor`, `MeditationDaysEditor`,
 * `ImageSectionEditor` e o formulário de página de ideias.
 *
 * Nada é salvo: os cenários cobrem o comportamento local dos editores, que
 * antes eram testes de componente. As gravações reais ficam em `e2e/edit`.
 */
const TEMPLATES = ['Materiais da Semana', 'Meditação da Semana', 'Galeria de Fotos', 'Galeria de Vídeos', 'Página de Ideias'];

async function openTemplate(page: Page, title: string): Promise<void> {
  await page.goto('/adm/criar-pagina');
  const picker = page.getByTestId('adm-page-creator-select-page-template-selec-page-template');
  await expect(picker).toBeVisible();
  await picker.getByRole('button', { name: `Criar ${title}` }).click();
}

async function confirmRemoval(page: Page): Promise<void> {
  const dialog = page.getByRole('dialog').last();
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: 'Remover', exact: true }).click();
  await expect(dialog).toBeHidden();
}

async function addLinkVideo(editor: Locator, page: Page, title: string, description: string, labelPrefix: string): Promise<void> {
  await editor.getByRole('textbox', { name: new RegExp(`^Título do ${labelPrefix}`) }).fill(title);
  await editor.getByRole('textbox', { name: new RegExp(`^Descrição do ${labelPrefix}`) }).fill(description);
  await selectMuiOption(page, editor.getByRole('combobox', { name: 'Tipo' }), 'Link');
  await selectMuiOption(page, editor.getByRole('combobox', { name: 'Plataforma' }), /youtube/i);
  await editor.getByRole('textbox', { name: new RegExp(`^URL do ${labelPrefix}`) }).fill('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
}

test.describe('Criador de páginas', () => {
  test('lista todos os modelos e troca entre grade e formulário', async ({ page }) => {
    await page.goto('/adm/criar-pagina');
    const picker = page.getByTestId('adm-page-creator-select-page-template-selec-page-template');
    for (const title of TEMPLATES) {
      await expect(picker.getByRole('button', { name: `Criar ${title}` })).toBeVisible();
    }

    await picker.getByRole('button', { name: 'Criar Materiais da Semana' }).click();
    await expect(page.getByTestId('week-materials-week-material-page-form')).toBeVisible();
    await expect(picker.getByRole('button', { name: 'Criar Página de Ideias' })).toHaveCount(0);

    await picker.getByRole('button', { name: /trocar modelo/i }).click();
    await expect(page.getByTestId('week-materials-week-material-page-form')).toHaveCount(0);
    await expect(picker.getByRole('button', { name: 'Criar Materiais da Semana' })).toBeVisible();
  });
});

test.describe('Materiais da semana: editor de mídias', () => {
  test('adiciona um link, conta na aba e no resumo, edita mantendo o item e remove após confirmar', async ({ page }) => {
    await openTemplate(page, 'Materiais da Semana');
    const form = page.getByTestId('week-materials-week-material-page-form');
    const editor = form.getByTestId('media-media-editor');
    await expect(form.getByText('Nenhum material adicionado')).toBeVisible();
    await expect(editor.getByText('Nenhum item deste tipo foi adicionado ainda.')).toBeVisible();
    await expect(form.getByRole('tab', { name: 'Vídeos' })).toBeVisible();

    await addLinkVideo(editor, page, 'Aula 1', 'Abertura', 'Vídeo');
    await editor.getByRole('button', { name: 'Adicionar Vídeo' }).click();

    await expect(editor.getByRole('button', { name: 'Editar Aula 1' })).toBeVisible();
    await expect(form.getByRole('tab', { name: 'Vídeos: 1' })).toBeVisible();
    await expect(form.getByText('1 material nesta página')).toBeVisible();

    await addLinkVideo(editor, page, 'Aula 2', 'Encerramento', 'Vídeo');
    await editor.getByRole('button', { name: 'Adicionar Vídeo' }).click();
    await expect(form.getByRole('tab', { name: 'Vídeos: 2' })).toBeVisible();
    await expect(form.getByText('2 materiais nesta página')).toBeVisible();

    // Editar o segundo, remover o primeiro e salvar: o certo continua em edição.
    await editor.getByRole('button', { name: 'Editar Aula 2' }).click();
    await expect(editor.getByText('Editando vídeo')).toBeVisible();
    await editor.getByRole('button', { name: 'Remover Aula 1' }).click();
    await confirmRemoval(page);
    const titleInput = editor.getByRole('textbox', { name: /^Título do Vídeo/ });
    await titleInput.fill('Aula 2 editada');
    await editor.getByRole('button', { name: 'Salvar Alterações' }).click();
    await expect(editor.getByRole('button', { name: 'Editar Aula 2 editada' })).toBeVisible();
    await expect(editor.getByRole('button', { name: 'Editar Aula 1' })).toHaveCount(0);
    await expect(form.getByRole('tab', { name: 'Vídeos: 1' })).toBeVisible();

    // Cancelar a edição limpa o formulário sem mexer na lista.
    await editor.getByRole('button', { name: 'Editar Aula 2 editada' }).click();
    await editor.getByRole('button', { name: 'Cancelar edição' }).click();
    await expect(editor.getByRole('heading', { name: 'Adicionar vídeo' })).toBeVisible();
    await expect(titleInput).toHaveValue('');
    await expect(editor.getByRole('button', { name: 'Editar Aula 2 editada' })).toBeVisible();
  });

  test('recusa item sem os campos e esconde a plataforma no upload', async ({ page }) => {
    await openTemplate(page, 'Materiais da Semana');
    const editor = page.getByTestId('media-media-editor');

    await editor.getByRole('button', { name: 'Adicionar Vídeo' }).click();
    await expect(editor.getByText('Este campo é obrigatório.')).toHaveCount(2);

    await expect(editor.getByRole('combobox', { name: 'Plataforma' })).toBeVisible();
    await selectMuiOption(page, editor.getByRole('combobox', { name: 'Tipo' }), 'Upload');
    await expect(editor.getByRole('combobox', { name: 'Plataforma' })).toHaveCount(0);
    await expect(editor.getByText('Upload de Vídeo')).toBeVisible();
  });

  test('troca de aba: direto sem rascunho, com confirmação quando há item começado', async ({ page }) => {
    await openTemplate(page, 'Materiais da Semana');
    const form = page.getByTestId('week-materials-week-material-page-form');
    const editor = form.getByTestId('media-media-editor');

    await form.getByRole('tab', { name: /Documentos/ }).click();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(editor.getByRole('button', { name: 'Adicionar Documento' })).toBeVisible();
    await form.getByRole('tab', { name: /Vídeos/ }).click();

    await editor.getByRole('textbox', { name: /^Título do Vídeo/ }).fill('Rascunho');
    await form.getByRole('tab', { name: /Documentos/ }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await dialog.getByRole('button', { name: 'Continuar preenchendo' }).click();
    await expect(dialog).toBeHidden();
    await expect(editor.getByRole('button', { name: 'Adicionar Vídeo' })).toBeVisible();
    await expect(editor.getByRole('textbox', { name: /^Título do Vídeo/ })).toHaveValue('Rascunho');

    await form.getByRole('tab', { name: /Documentos/ }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Descartar' }).click();
    await expect(editor.getByRole('button', { name: 'Adicionar Documento' })).toBeVisible();
  });

  test('avisa sobre campos obrigatórios e mostra o título só na edição', async ({ page }) => {
    await openTemplate(page, 'Materiais da Semana');
    const form = page.getByTestId('week-materials-week-material-page-form');
    await expect(form.getByText('Editar Semana')).toHaveCount(0);
    await form.getByRole('button', { name: /salvar página/i }).click();
    await expect(form.getByText('Preencha todos os campos obrigatórios.').first()).toBeVisible();

    await page.goto('/adm/editar-pagina-semana/00000000-0000-4000-8000-000000000000');
    const missing = page.getByTestId('week-materials-week-material-page-form');
    await expect(missing.getByText('Página não encontrada')).toBeVisible();
    await expect(missing.getByRole('button', { name: /salvar página/i })).toHaveCount(0);
  });
});

test.describe('Galeria de vídeos: editor', () => {
  test('adiciona, recusa vazio, edita, cancela e mantém o certo em edição após remover outro', async ({ page }) => {
    await openTemplate(page, 'Galeria de Vídeos');
    const editor = page.getByTestId('video-pages-video-editor');
    await expect(editor.getByText('Nenhum vídeo adicionado ainda.')).toBeVisible();

    await editor.getByRole('button', { name: 'Adicionar vídeo' }).click();
    await expect(editor.getByText('Este campo é obrigatório.')).toHaveCount(2);

    await addLinkVideo(editor, page, 'Primeiro', 'Abertura', 'vídeo');
    await editor.getByRole('button', { name: 'Adicionar vídeo' }).click();
    await addLinkVideo(editor, page, 'Segundo', 'Encerramento', 'vídeo');
    await editor.getByRole('button', { name: 'Adicionar vídeo' }).click();
    await expect(editor.getByRole('button', { name: 'Editar Primeiro' })).toBeVisible();
    await expect(editor.getByRole('button', { name: 'Editar Segundo' })).toBeVisible();

    await editor.getByRole('button', { name: 'Editar Segundo' }).click();
    await expect(editor.getByText('Editando vídeo')).toBeVisible();
    await editor.getByRole('button', { name: 'Cancelar edição' }).click();
    await expect(editor.getByText('Editando vídeo')).toHaveCount(0);
    await expect(editor.getByRole('textbox', { name: /^Título do vídeo/ })).toHaveValue('');

    await editor.getByRole('button', { name: 'Editar Segundo' }).click();
    await editor.getByRole('button', { name: 'Remover Primeiro' }).click();
    await confirmRemoval(page);
    await editor.getByRole('textbox', { name: /^Título do vídeo/ }).fill('Segundo editado');
    await editor.getByRole('button', { name: 'Salvar alterações' }).click();
    await expect(editor.getByRole('button', { name: 'Editar Segundo editado' })).toBeVisible();
    await expect(editor.getByRole('button', { name: 'Editar Primeiro' })).toHaveCount(0);
  });
});

test.describe('Meditação: editor de dias', () => {
  test('conta a semana, recusa dia incompleto, edita e remove após confirmar', async ({ page }) => {
    await openTemplate(page, 'Meditação da Semana');
    const editor = page.getByTestId('meditations-meditation-days-editor');
    await expect(editor.getByText(/Nenhum dia adicionado ainda/)).toBeVisible();
    await expect(editor.getByText('0 de 5')).toBeVisible();

    await editor.getByRole('button', { name: 'Adicionar dia' }).click();
    await expect(editor.getByText('Preencha o tema e o versículo do dia.')).toBeVisible();

    const topic = editor.getByRole('textbox', { name: /^Tema do dia/ });
    const verse = editor.getByRole('textbox', { name: /^Versículo/ });
    await topic.fill('Gratidão');
    await verse.fill('Sl 100');
    await editor.getByRole('button', { name: 'Adicionar dia' }).click();
    await expect(editor.getByText('1 de 5')).toBeVisible();
    await expect(editor.getByRole('button', { name: 'Editar Segunda-feira' })).toBeVisible();

    await editor.getByRole('button', { name: 'Editar Segunda-feira' }).click();
    await topic.fill('Novo tema');
    await editor.getByRole('button', { name: 'Salvar dia' }).click();
    await expect(editor.getByText('Novo tema')).toBeVisible();
    await expect(editor.getByText('1 de 5')).toBeVisible();

    await editor.getByRole('button', { name: 'Remover Segunda-feira' }).click();
    await expect(editor.getByText('1 de 5')).toBeVisible();
    await confirmRemoval(page);
    await expect(editor.getByText('0 de 5')).toBeVisible();
  });

  test('esconde o formulário quando a semana está completa', async ({ page }) => {
    await openTemplate(page, 'Meditação da Semana');
    const editor = page.getByTestId('meditations-meditation-days-editor');
    for (let i = 1; i <= 5; i += 1) {
      await editor.getByRole('textbox', { name: /^Tema do dia/ }).fill(`Tema ${i}`);
      await editor.getByRole('textbox', { name: /^Versículo/ }).fill(`Sl ${i}`);
      await editor.getByRole('button', { name: 'Adicionar dia' }).click();
      await expect(editor.getByText(`${i} de 5`)).toBeVisible();
    }
    await expect(editor.getByRole('button', { name: 'Adicionar dia' })).toHaveCount(0);
  });
});

test.describe('Galeria de fotos: editor de seção', () => {
  test('edita legenda e visibilidade, pede as imagens e remove a seção após confirmar', async ({ page }) => {
    await openTemplate(page, 'Galeria de Fotos');
    const form = page.getByTestId('image-pages-image-page-form');
    await form.getByRole('button', { name: 'Nova seção' }).click();

    const section = form.getByTestId('image-pages-image-section-editor').first();
    await expect(section.getByText('Nenhuma imagem nesta seção ainda.')).toBeVisible();

    await section.getByRole('textbox', { name: /^Legenda da seção/ }).fill('Abertura');
    await expect(section.getByRole('textbox', { name: /^Legenda da seção/ })).toHaveValue('Abertura');

    const visibility = section.getByRole('checkbox');
    const before = await visibility.isChecked();
    await visibility.click();
    await expect(visibility).toBeChecked({ checked: !before });
    await expect(section.getByText(before ? 'Seção restrita' : 'Seção pública')).toBeVisible();

    await section.getByRole('button', { name: 'Adicionar imagens' }).click();
    const addImages = page.getByTestId('image-pages-add-images-dialog');
    await expect(addImages).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(addImages).toBeHidden();

    await section.getByRole('button', { name: 'Remover seção 1' }).click();
    await expect(form.getByTestId('image-pages-image-section-editor')).toHaveCount(1);
    await confirmRemoval(page);
    await expect(form.getByTestId('image-pages-image-section-editor')).toHaveCount(0);
  });
});

test.describe('Página de ideias: formulário', () => {
  test('anuncia o vazio, cobra uma seção ao salvar, adiciona e remove seções', async ({ page }) => {
    await openTemplate(page, 'Página de Ideias');
    const form = page.getByTestId('ideas-pages-ideas-page-form');
    await expect(form.getByText('Editar Página de Ideias')).toHaveCount(0);
    await expect(form.getByRole('textbox', { name: /^Título da página/ })).toBeVisible();
    await expect(form.getByText(/Nenhuma seção criada ainda/)).toBeVisible();

    await form.getByRole('button', { name: /Salvar Página/ }).click();
    await expect(form.getByText('Adicione ao menos uma seção antes de salvar.')).toBeVisible();

    await form.getByRole('button', { name: 'Nova seção' }).click();
    await form.getByRole('button', { name: 'Nova seção' }).click();
    await expect(form.getByTestId('ideas-pages-ideas-section-editor')).toHaveCount(2);
    await expect(form.getByText('2 seções · 0 mídias')).toBeVisible();

    await form.getByRole('button', { name: 'Remover seção 1' }).click();
    await expect(form.getByTestId('ideas-pages-ideas-section-editor')).toHaveCount(2);
    await confirmRemoval(page);
    await expect(form.getByTestId('ideas-pages-ideas-section-editor')).toHaveCount(1);
    await expect(form.getByText('1 seção · 0 mídias')).toBeVisible();
  });

  test('avisa quando a edição é aberta sem a página, e mostra o título na edição', async ({ page }) => {
    await page.goto('/adm/editar-pagina-ideias/00000000-0000-4000-8000-000000000000');
    const form = page.getByTestId('ideas-pages-ideas-page-form');
    await expect(form.getByText('Página não encontrada')).toBeVisible();
    await expect(form.getByRole('textbox', { name: /^Título da página/ })).toHaveCount(0);
  });
});
