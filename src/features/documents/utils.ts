import { MediaPlatform, MediaUploadType, MediaType } from './types';

export const platformLabel = (p?: MediaPlatform) => {
  switch (p) {
    case MediaPlatform.GOOGLE_DRIVE:
      return 'Google Drive';
    case MediaPlatform.ONEDRIVE:
      return 'OneDrive';
    case MediaPlatform.DROPBOX:
      return 'Dropbox';
    case MediaPlatform.ANY:
      return 'Outro';
    default:
      return '—';
  }
};

export const uploadTypeLabel = (t?: MediaUploadType) => {
  switch (t) {
    case MediaUploadType.LINK:
      return 'Link';
    case MediaUploadType.UPLOAD:
      return 'Upload';
    default:
      return '—';
  }
};

export const mediaTypeLabel = (t?: MediaType) => {
  switch (t) {
    case MediaType.DOCUMENT:
      return 'Documento';
    default:
      return t ?? '—';
  }
};
