import { expect, type Page } from '@playwright/test';

import type { IdeasSectionResponse } from '@/features/ideas-sections/types';

import { ApiClient, uniqueSuffix } from './api';
import { TEACHER_EMAIL, TEACHER_PASSWORD } from './env';
import { enableProductFlags } from './featureFlags';
import { selectMuiOption } from './ui';

export const IDEA_DESCRIPTION =
  'separe 3 bolas e  forme 2 equipes antes da brincadeira. leia João 3:16 com as crianças';

const VIDEO_LINK = {
  title: 'Vídeo de apoio',
  uploadType: 'link',
  mediaType: 'video',
  isLocalFile: false,
  url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  platformType: 'youtube',
};

export interface IdeaUpload {
  mediaType: 'image' | 'document';
  name: string;
  mimeType: string;
  buffer: Buffer;
}

export interface SubmittedIdea {
  id: string;
  title: string;
  description: string;
  marker: string;
}

/**
 * Cenário real de ideias com IA: professor, administrador, página de destino e
 * a limpeza de tudo o que o teste criou (inclusive arquivos enviados).
 */
export class IdeaAiScenarioFixture {
  admin!: ApiClient;
  teacher!: ApiClient;
  pageId = '';
  pageTitle = '';
  private restoreFlags?: () => Promise<void>;
  private readonly ideas: string[] = [];

  async setUp(): Promise<void> {
    this.admin = await ApiClient.login();
    this.teacher = await ApiClient.login(TEACHER_EMAIL, TEACHER_PASSWORD);
    this.restoreFlags = await enableProductFlags(this.admin);
    const flags = await this.admin.get<Record<string, boolean>>('/feature-flags/map');
    expect(flags.idea_ai_enhancement).toBe(true);
    this.pageTitle = `E2E Destino IA ${uniqueSuffix()}`;
    const page = await this.admin.postMultipart<{ id: string }>('/ideas-pages', {
      ideasMaterialsPageData: JSON.stringify({
        title: this.pageTitle,
        description: 'Destino das ideias do teste',
        public: true,
        sections: [{ title: 'Seção base', description: 'd', public: true, medias: [] }],
      }),
    });
    this.pageId = page.id;
  }

  async tearDown(): Promise<void> {
    if (this.pageId) await this.admin.delete(`/ideas-pages/${this.pageId}`);
    for (const id of this.ideas) await this.admin.delete(`/ideas-sections/${id}`);
    await this.restoreFlags?.();
    await Promise.all([this.admin?.dispose(), this.teacher?.dispose()]);
  }

  /** O professor envia uma ideia; o marcador escolhe como a IA simulada responde. */
  async submit(scenario = '', uploads: IdeaUpload[] = []): Promise<SubmittedIdea> {
    const id = uniqueSuffix();
    const marker = scenario ? `[[ai-fake:${scenario}#${id}]]` : `ref ${id}`;
    const title = `E2E Gincana ${id}`;
    const description = `${IDEA_DESCRIPTION} ${marker}`;
    const files = Object.fromEntries(
      uploads.map((upload, index) => [
        `file_${index}`,
        { name: upload.name, mimeType: upload.mimeType, buffer: upload.buffer },
      ])
    );
    const medias = uploads.map((upload, index) => ({
      title: upload.name,
      uploadType: 'upload',
      mediaType: upload.mediaType,
      isLocalFile: true,
      originalName: upload.name,
      fieldKey: `file_${index}`,
    }));
    const idea = await this.teacher.postMultipart<{ id: string }>(
      '/ideas-sections',
      // Toda ideia leva ao menos um material; o vídeo por link não vai para a IA.
      { sectionData: JSON.stringify({ title, description, medias: medias.length ? medias : [VIDEO_LINK] }) },
      files
    );
    this.ideas.push(idea.id);
    return { id: idea.id, title, description, marker };
  }

  stored(ideaId: string): Promise<IdeasSectionResponse> {
    return this.admin.get<IdeasSectionResponse>(`/ideas-sections/${ideaId}`);
  }

  async openReview(page: Page, ideaId: string): Promise<void> {
    await page.goto(`/adm/editar-ideias-compartilhadas/${ideaId}`);
    await expect(page.getByTestId('ideas-sections-ideas-section-review-page')).toBeVisible();
  }

  async chooseDestination(page: Page): Promise<void> {
    await selectMuiOption(page, page.getByRole('combobox', { name: 'Página de destino' }), this.pageTitle);
    await selectMuiOption(page, page.getByRole('combobox', { name: 'Visibilidade' }), 'Pública');
  }

  async publish(page: Page): Promise<void> {
    await this.chooseDestination(page);
    await page.getByRole('button', { name: 'Publicar ideia' }).click();
  }

  async waitPublished(ideaId: string): Promise<IdeasSectionResponse> {
    await expect.poll(async () => (await this.stored(ideaId)).pageId).toBe(this.pageId);
    return this.stored(ideaId);
  }
}

/** Foto de pouco contraste desenhada pelo próprio navegador. */
export async function photoUpload(page: Page): Promise<IdeaUpload> {
  const sheet = await page.context().newPage();
  await sheet.setViewportSize({ width: 800, height: 600 });
  await sheet.setContent(
    '<body style="margin:0;background:linear-gradient(135deg,#6b6b6b,#8a7f6a)">' +
      '<div style="margin:120px;width:300px;height:220px;background:#9a8f7a;border-radius:40px"></div>' +
      '<div style="margin:-60px 420px;width:220px;height:220px;background:#767c70;border-radius:50%"></div></body>'
  );
  const buffer = await sheet.screenshot({ type: 'png' });
  await sheet.close();
  return { mediaType: 'image', name: 'foto-da-atividade.png', mimeType: 'image/png', buffer };
}

/** PDF "escaneado": só a imagem da folha, sem camada de texto. */
export async function scannedPdfUpload(page: Page): Promise<IdeaUpload> {
  const photo = await photoUpload(page);
  const sheet = await page.context().newPage();
  await sheet.setContent(
    `<body style="margin:0"><img style="width:100%" src="data:image/png;base64,${photo.buffer.toString('base64')}"></body>`
  );
  const buffer = await sheet.pdf({ format: 'A4', printBackground: true });
  await sheet.close();
  return { mediaType: 'document', name: 'folha-digitalizada.pdf', mimeType: 'application/pdf', buffer };
}
