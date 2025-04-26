import { MediaPlatform } from 'store/slices/types';

export function validateMediaURL(url: string, platform?: MediaPlatform): boolean {
  if (!url || !platform) return false;

  switch (platform) {
    case MediaPlatform.YOUTUBE:
      return url.includes('youtube.com') || url.includes('youtu.be');

    case MediaPlatform.GOOGLE_DRIVE:
      return url.includes('drive.google.com');

    case MediaPlatform.ONEDRIVE:
      return url.includes('onedrive.live.com') || url.includes('1drv.ms');

    case MediaPlatform.DROPBOX:
      return url.includes('dropbox.com');

    case MediaPlatform.ANY:
      return true;

    default:
      return false;
  }
}
