import { expect, test } from '@playwright/test';
import { IdeaMaterialKind } from '@/features/ideas-sections/types';
import {
  classifyIdeaFile,
  isValidYoutubeUrl,
  parseYoutubeVideoId,
  toIdeaUploadMedia,
  validateIdeaShareFile,
} from '@/features/ideas-sections/share-utils';

test.describe('shared idea submission helpers', () => {
  test('classifies supported document and image formats from file extensions', () => {
    const docx = new File(['x'], 'plan.DOCX', { type: '' });
    expect(classifyIdeaFile(docx)).toBe(IdeaMaterialKind.DOCUMENT);
    expect(toIdeaUploadMedia(docx, IdeaMaterialKind.DOCUMENT)?.kind).toBe(
      IdeaMaterialKind.DOCUMENT
    );
    expect(toIdeaUploadMedia(docx, IdeaMaterialKind.DOCUMENT)?.file?.type).toBe(
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    );
    expect(validateIdeaShareFile(docx, 0, IdeaMaterialKind.IMAGE)).toContain(
      'não é um arquivo de imagem'
    );
    expect(toIdeaUploadMedia(docx, IdeaMaterialKind.IMAGE)).toBeNull();
    expect(classifyIdeaFile(new File(['x'], 'photo.webp', { type: 'image/webp' }))).toBe(
      IdeaMaterialKind.IMAGE
    );
    expect(classifyIdeaFile(new File(['x'], 'clip.mp4', { type: 'video/mp4' }))).toBe(
      IdeaMaterialKind.VIDEO
    );
    expect(classifyIdeaFile(new File(['x'], 'archive.zip'))).toBeNull();
  });

  test('enforces file sizes and the media count', () => {
    expect(validateIdeaShareFile(new File(['small'], 'guide.pdf'), 0)).toBeNull();
    const tooLarge = new File([new Uint8Array(20 * 1024 * 1024 + 1)], 'guide.pdf');
    expect(validateIdeaShareFile(tooLarge, 0)).toContain('20 MB');
    expect(validateIdeaShareFile(new File(['x'], 'guide.pdf'), 20)).toContain('até 20');
  });

  test('accepts YouTube formats and rejects forged hosts', () => {
    expect(parseYoutubeVideoId('https://youtu.be/abcdefghijk')).toBe('abcdefghijk');
    expect(isValidYoutubeUrl('https://www.youtube.com/shorts/abcdefghijk')).toBe(true);
    expect(isValidYoutubeUrl('https://youtube.com.evil.test/watch?v=abcdefghijk')).toBe(false);
    expect(isValidYoutubeUrl('javascript:alert(1)')).toBe(false);
  });
});

test('uses natural plurals and validates the complete RHF draft', async () => {
  const { summarizeIdeaMaterials, toIdeaYoutubeMedia } =
    await import('@/features/ideas-sections/share-utils');
  const { ideaShareSchema } = await import('@/features/ideas-sections/schemas');
  expect(summarizeIdeaMaterials([toIdeaYoutubeMedia('https://youtu.be/abcdefghijk')!])).toBe(
    '0 documentos · 0 imagens · 1 vídeo'
  );
  await expect(
    ideaShareSchema.validate({ title: 'Ideia', description: 'Descrição', materials: [] })
  ).rejects.toThrow('Adicione pelo menos');
  await expect(
    ideaShareSchema.validate({
      title: 'x'.repeat(121),
      description: 'Descrição',
      materials: [toIdeaYoutubeMedia('https://youtu.be/abcdefghijk')],
    })
  ).rejects.toThrow('120');
});
