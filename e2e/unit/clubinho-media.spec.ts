import { expect, test } from '@playwright/test';
import {
  validateClubinhoSelection,
  validateClubinhoPublication,
  toClubinhoUploadMedia,
} from '@/features/image-sections/media-utils';
import { buildSectionUpload } from '@/features/image-sections/utils';
import { CLUBINHO_MAX_VIDEO_BYTES } from '@/features/image-sections/constants';
import { MediaType, MediaUploadType } from '@/store/slices/types';
import {
  toFeedSectionViewModel,
  flattenFeedPhotos,
  filterFeedSections,
} from '@/features/clubinho-feed/utils';
import type { ClubinhoFeedSectionDto } from '@/features/clubinho-feed/types';

const videoFile = new File(['video'], 'video.mp4', { type: 'video/mp4' });

test('validates exclusive mode, count, format, and size', () => {
  const video = { files: [videoFile], mediaType: MediaType.VIDEO, currentCount: 0 };
  expect(validateClubinhoSelection(video)).toBeNull();
  expect(validateClubinhoSelection({ ...video, currentCount: 1 })).toContain('apenas um vídeo');
  expect(validateClubinhoSelection({ ...video, files: [videoFile, videoFile] })).not.toBeNull();
  expect(validateClubinhoSelection({ ...video, mediaType: MediaType.IMAGE })).toContain('fotos');
  expect(
    validateClubinhoSelection({
      files: [new File(['x'], 'image.png', { type: 'image/png' })],
      currentCount: 20,
      mediaType: MediaType.IMAGE,
    })
  ).toContain('20');
  expect(
    validateClubinhoSelection({
      ...video,
      files: [new File([], 'video.mp4', { type: 'video/mp4' })],
    })
  ).not.toBeNull();
  const large = new File(['x'], 'video.mp4', { type: 'video/mp4' });
  Object.defineProperty(large, 'size', { value: CLUBINHO_MAX_VIDEO_BYTES + 1 });
  expect(validateClubinhoSelection({ ...video, files: [large] })).toContain('100 MB');
  expect(
    validateClubinhoPublication([{ mediaType: MediaType.IMAGE }, { mediaType: MediaType.VIDEO }])
  ).not.toBeNull();
  expect(validateClubinhoPublication([{ mediaType: MediaType.VIDEO }])).toBeNull();
});

test('builds a video upload without trusting a client author or public state', () => {
  const { payload, uploads } = buildSectionUpload({
    caption: 'Registro',
    description: 'Encontro',
    mediaItems: [toClubinhoUploadMedia(videoFile, MediaType.VIDEO)],
  });
  expect(payload).not.toHaveProperty('public');
  expect(payload).not.toHaveProperty('author');
  expect(payload.mediaItems[0]).toMatchObject({
    mediaType: MediaType.VIDEO,
    uploadType: MediaUploadType.UPLOAD,
    fieldKey: 'file_0',
  });
  expect(uploads[0].file).toBe(videoFile);
});

test('feed keeps video type and author across views and author search', () => {
  const dto: ClubinhoFeedSectionDto = {
    id: 'post',
    caption: 'Clubinho 90',
    description: 'Encontro',
    public: true,
    createdAt: '2026-11-04T12:00:00Z',
    updatedAt: '2026-11-04T12:00:00Z',
    author: { name: 'Márcia' },
    mediaItems: [
      {
        id: 'video',
        mediaType: MediaType.VIDEO,
        uploadType: MediaUploadType.UPLOAD,
        isLocalFile: true,
        url: 'https://example.com/video.mp4',
      },
    ],
  };
  const section = toFeedSectionViewModel(dto);
  expect(section.isVideo).toBe(true);
  expect(section.authorName).toBe('Márcia');
  expect(section.mediaItems[0].mediaType).toBe(MediaType.VIDEO);
  expect(flattenFeedPhotos([section])[0]).toMatchObject({
    mediaType: MediaType.VIDEO,
    authorName: 'Márcia',
  });
  expect(filterFeedSections([section], 'marcia')).toHaveLength(1);
  expect(toFeedSectionViewModel({ ...dto, author: null }).authorName).toBe('Autor não informado');
});

test('legacy photo albums remain viewable and editable without an author', () => {
  const images = Array.from({ length: 25 }, () => ({ mediaType: MediaType.IMAGE }));
  expect(validateClubinhoPublication(images, true)).toBeNull();
  expect(validateClubinhoPublication(images)).not.toBeNull();
  const section = toFeedSectionViewModel({
    id: 'old',
    caption: 'Álbum antigo',
    description: 'Histórico',
    public: true,
    createdAt: '2020-01-01',
    updatedAt: '2020-01-01',
    mediaItems: images.map((image, index) => ({
      ...image,
      id: `old-${index}`,
      uploadType: MediaUploadType.UPLOAD,
      isLocalFile: true,
      url: `https://example.com/old-${index}.jpg`,
    })),
  });
  expect(section.authorName).toBe('Autor não informado');
  expect(section.mediaCount).toBe(25);
  expect(section.mediaItems[0].originalUrl).toBe('https://example.com/old-0.jpg');
});
