import { MediaItem, MediaUploadType } from 'store/slices/types';

export const buildFileItem = (
  item: MediaItem,
  index: number,
  prefix: string,
  formData: FormData
): MediaItem => {
  const fileField = `${prefix}-${index}`;

  const shouldAttachFile =
    item.uploadType === MediaUploadType.UPLOAD && item.isLocalFile && !!item.file;

  if (shouldAttachFile) {
    formData.append(fileField, item.file as Blob);
  }

  return {
    ...item,
    fileField: shouldAttachFile ? fileField : undefined,
  };
};
