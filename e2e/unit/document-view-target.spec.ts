import { expect, test } from '@playwright/test';
import { detectDocumentFormat, getDocumentViewTarget } from '@/core/document-viewer/utils';
import { DocumentFormat } from '@/core/document-viewer/types';
import { MediaPlatform, MediaType, MediaUploadType } from '@/store/slices/types';
import type { MediaItem } from '@/store/slices/types';

const link = (url: string, platformType = MediaPlatform.ANY): MediaItem => ({
  title: 't',
  description: '',
  mediaType: MediaType.DOCUMENT,
  uploadType: MediaUploadType.LINK,
  platformType,
  url,
});

test.describe('getDocumentViewTarget', () => {
  const upload = (url: string, originalName?: string): MediaItem => ({
    ...link(url),
    uploadType: MediaUploadType.UPLOAD,
    isLocalFile: true,
    originalName,
  });

  test('PDF, DOCX e PPTX enviados vão para o visualizador próprio', () => {
    expect(getDocumentViewTarget(upload('https://b.s3.amazonaws.com/x1', 'Aula 1.PDF'))).toEqual({
      mode: 'viewer', format: DocumentFormat.PDF, url: 'https://b.s3.amazonaws.com/x1', fileName: 'Aula 1.PDF',
    });
    expect(getDocumentViewTarget(upload('https://b.s3.amazonaws.com/a.docx'))).toMatchObject({ mode: 'viewer', format: DocumentFormat.DOCX });
    expect(getDocumentViewTarget(upload('https://b.s3.amazonaws.com/uploads/a%20b.pptx?X-Amz=1'))).toMatchObject({ mode: 'viewer', format: DocumentFormat.PPTX });
  });

  test('formato legado enviado (ex.: .doc) mantém o comportamento anterior (iframe)', () => {
    const media = upload('https://b.s3.amazonaws.com/velho.doc', 'velho.doc');
    expect(getDocumentViewTarget(media)).toEqual({ mode: 'embed', url: media.url });
  });

  test('detectDocumentFormat usa o primeiro candidato reconhecido', () => {
    expect(detectDocumentFormat(undefined, 'https://x.com/a.pptx', 'a.pdf')).toBe(DocumentFormat.PPTX);
    expect(detectDocumentFormat('sem-extensao', null)).toBeNull();
  });

  test('link direto para .pdf em site qualquer continua abrindo em nova aba (CORS)', () => {
    expect(getDocumentViewTarget(link('https://exemplo.com/x.pdf'))).toEqual({ mode: 'newTab', url: 'https://exemplo.com/x.pdf' });
  });

  test('Google Drive vira /preview', () => {
    expect(getDocumentViewTarget(link('https://drive.google.com/file/d/ABC_123-x/view?usp=sharing', MediaPlatform.GOOGLE_DRIVE)))
      .toEqual({ mode: 'embed', url: 'https://drive.google.com/file/d/ABC_123-x/preview' });
  });

  test('Google Docs vira /preview no próprio docs.google.com', () => {
    expect(getDocumentViewTarget(link('https://docs.google.com/document/d/DOC1/edit?tab=t.0')))
      .toEqual({ mode: 'embed', url: 'https://docs.google.com/document/d/DOC1/preview' });
  });

  test('pasta do Drive, Dropbox, OneDrive e sites quaisquer abrem em nova aba', () => {
    for (const url of [
      'https://drive.google.com/drive/folders/XYZ',
      'https://www.dropbox.com/s/abc/arquivo.pdf?dl=0',
      'https://1drv.ms/b/s!abc',
      'https://exemplo.com/doc.pdf',
    ]) {
      expect(getDocumentViewTarget(link(url))).toEqual({ mode: 'newTab', url });
    }
  });

  test('esquemas não http(s) e URL vazia são recusados', () => {
    expect(getDocumentViewTarget(link('javascript:alert(1)'))).toBeNull();
    expect(getDocumentViewTarget(link('   '))).toBeNull();
  });
});
