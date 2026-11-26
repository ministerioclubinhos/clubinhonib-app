import { expect, type APIRequestContext } from '@playwright/test';
import { MediaPlatform, MediaType, MediaUploadType } from '../../src/store/slices/types';
import type { ClubinhoFeedMediaItemDto } from '../../src/features/clubinho-feed/types';
import { APP_URL } from './env';

export interface FeedCommentTestSection {
  id: string;
  caption: string;
  description: string;
  public: boolean;
  pageId: string;
  mediaItems: (ClubinhoFeedMediaItemDto & { id: string })[];
}

export interface FeedCommentTestUser {
  id: string;
  email: string;
}

export const FEED_COMMENT_TEST_PASSWORD = 'Senha123@';
export const FEED_COMMENT_TEST_MEDIA: ClubinhoFeedMediaItemDto[] = [
  {
    title: 'Foto um',
    description: '',
    url: `${APP_URL}/banner.jpg`,
    uploadType: MediaUploadType.LINK,
    mediaType: MediaType.IMAGE,
    platformType: MediaPlatform.ANY,
    isLocalFile: false,
  },
  {
    title: 'Foto dois',
    description: '',
    url: `${APP_URL}/logo512.png`,
    uploadType: MediaUploadType.LINK,
    mediaType: MediaType.IMAGE,
    platformType: MediaPlatform.ANY,
    isLocalFile: false,
  },
];

export async function publishTestSection(
  request: APIRequestContext,
  token: string,
  section: FeedCommentTestSection
): Promise<void> {
  const response = await request.patch(`/image-sections/${section.id}`, {
    headers: { Authorization: `Bearer ${token}` },
    multipart: {
      sectionData: JSON.stringify({
        caption: section.caption,
        description: section.description,
        public: true,
        mediaItems: section.mediaItems,
      }),
    },
  });
  expect(response.ok(), await response.text()).toBe(true);
}
