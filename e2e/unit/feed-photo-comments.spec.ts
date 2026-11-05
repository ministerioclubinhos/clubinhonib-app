import { expect, test } from '@playwright/test';
import {
  buildPhotoCommentModerationQuery,
  isPhotoCommentStatus,
  validatePhotoComment,
} from '../../src/features/feed-photo-comments/utils';
import { photoCommentKeys } from '../../src/features/feed-photo-comments/constants';
import { PhotoCommentStatus } from '../../src/features/feed-photo-comments/types';
import { getPhotoCommentPreviewUrl } from '../../src/features/feed-photo-comments/utils';
import { MediaPlatform, MediaUploadType } from '../../src/store/slices/types';

test('moderation previews cloud images instead of rendering their sharing page as an image', () => {
  expect(
    getPhotoCommentPreviewUrl({
      photoUrl: 'https://drive.google.com/file/d/photo123/view',
      photoTitle: 'Foto',
      photoUploadType: MediaUploadType.LINK,
      photoPlatformType: MediaPlatform.GOOGLE_DRIVE,
    })
  ).toBe('https://drive.google.com/thumbnail?id=photo123');
  expect(
    getPhotoCommentPreviewUrl({
      photoUrl: 'https://example.test/photo.png',
      photoTitle: 'Foto',
      photoUploadType: MediaUploadType.UPLOAD,
      photoPlatformType: null,
    })
  ).toBe('https://example.test/photo.png');
});

test('comments reject blank and oversized input, preserving plain text', () => {
  expect(validatePhotoComment(' \n ')).not.toBeNull();
  expect(validatePhotoComment('a'.repeat(1001))).not.toBeNull();
  expect(validatePhotoComment('a'.repeat(1000))).toBeNull();
  expect(validatePhotoComment('<script>plain text</script>')).toBeNull();
});

test('moderation query trims search and omits empty filters', () => {
  expect(buildPhotoCommentModerationQuery(2, 20, '  autor ', PhotoCommentStatus.PENDING)).toEqual({
    page: 2,
    limit: 20,
    searchString: 'autor',
    status: PhotoCommentStatus.PENDING,
  });
  expect(buildPhotoCommentModerationQuery(1, 10, ' ', '')).toEqual({ page: 1, limit: 10 });
  expect(isPhotoCommentStatus('unknown')).toBe(false);
  expect(isPhotoCommentStatus(PhotoCommentStatus.REJECTED)).toBe(true);
});

test('query keys isolate authors, photos and public history', () => {
  expect(photoCommentKeys.mine('photo1', 'author1')).not.toEqual(
    photoCommentKeys.mine('photo1', 'author2')
  );
  expect(photoCommentKeys.mine('photo1', 'author1')).not.toEqual(
    photoCommentKeys.mine('photo2', 'author1')
  );
  expect(photoCommentKeys.mine('photo1', 'author1')).not.toEqual(
    photoCommentKeys.published('photo1', 'author1')
  );
  expect(photoCommentKeys.published('photo1', null)).not.toEqual(
    photoCommentKeys.published('photo1', 'author1')
  );
});
