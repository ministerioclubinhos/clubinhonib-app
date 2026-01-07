import { MediaPlatform, MediaUploadType, MediaItem, MediaType } from 'store/slices/types';

export const getGoogleDriveThumbnailUrl = (url: string): string | null => {
  const match = url.match(/\/d\/(.*?)\
  return match ? `https://drive.google.com/thumbnail?id=${match[1]}` : null;
};

export const getGoogleDrivePreviewUrl = (url: string): string | null => {
  const match = url.match(/\/d\/(.*?)\
  return match ? `https://drive.google.com/file/d/${match[1]}/preview` : null;
};

export const getMediaPreviewUrl = (media: MediaItem): string => {
  if (media.uploadType === MediaUploadType.UPLOAD || media.isLocalFile) {
    return media.url;
  }

  if (media.uploadType === MediaUploadType.LINK) {
    switch (media.platformType) {
      case MediaPlatform.GOOGLE_DRIVE:
        if (media.mediaType === MediaType.IMAGE) {
          const thumbnailUrl = getGoogleDriveThumbnailUrl(media.url);
          return thumbnailUrl || media.url;
        }
        const previewUrl = getGoogleDrivePreviewUrl(media.url);
        return previewUrl || media.url;

      case MediaPlatform.DROPBOX:
        return media.url.replace('www.dropbox.com', 'dl.dropboxusercontent.com');

      case MediaPlatform.ONEDRIVE:
        return media.url.replace('redir?', 'embed?');

      case MediaPlatform.ANY:
      default:
        return media.url;
    }
  }

  return media.url;
};
