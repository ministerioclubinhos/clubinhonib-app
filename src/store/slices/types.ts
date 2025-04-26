export enum MediaType {
  VIDEO = 'video',
  DOCUMENT = 'document',
  IMAGE = 'image',
  AUDIO = 'audio',
}

export enum MediaUploadType {
  LINK = 'link',
  UPLOAD = 'upload',
}

export enum MediaPlatform {
  YOUTUBE = 'youtube',
  GOOGLE_DRIVE = 'googledrive',
  ONEDRIVE = 'onedrive',
  DROPBOX = 'dropbox',
  ANY = 'ANY',
}

export interface MediaItem {
  id?: string;
  file?: File;
  size?: number;
  createdAt?: string;
  updatedAt?: string;
  isLocalFile?: boolean;
  originalName?: string;
  title: string;
  description: string;
  mediaType: MediaType;
  uploadType: MediaUploadType;
  platformType?: MediaPlatform;
  url: string;
  fieldKey?: string;
  fileField?: string;
}
