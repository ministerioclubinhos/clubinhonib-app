import {
  IDEA_SHARE_ALLOWED_EXTENSIONS,
  IDEA_SHARE_MIME_BY_EXTENSION,
  IDEA_SHARE_MAX_DOCUMENT_BYTES,
  IDEA_SHARE_MAX_IMAGE_BYTES,
  IDEA_SHARE_MAX_MEDIAS,
  IDEA_SHARE_MAX_VIDEO_BYTES,
} from './constants';
import { MediaPlatform, MediaType, MediaUploadType } from '@/store/slices/types';
import { IdeaMaterialKind, type IdeaShareMaterial, type IdeaShareFormValues } from './types';

export function classifyIdeaFile(file: File): IdeaMaterialKind | null {
  const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
  if ((IDEA_SHARE_ALLOWED_EXTENSIONS.document as readonly string[]).includes(extension))
    return IdeaMaterialKind.DOCUMENT;
  if ((IDEA_SHARE_ALLOWED_EXTENSIONS.image as readonly string[]).includes(extension))
    return IdeaMaterialKind.IMAGE;
  if ((IDEA_SHARE_ALLOWED_EXTENSIONS.video as readonly string[]).includes(extension))
    return IdeaMaterialKind.VIDEO;
  return null;
}

export function validateIdeaShareFile(
  file: File,
  currentTotal: number,
  selectedKind?: IdeaMaterialKind
): string | null {
  if (currentTotal >= IDEA_SHARE_MAX_MEDIAS)
    return `Você pode enviar até ${IDEA_SHARE_MAX_MEDIAS} materiais.`;
  const detectedKind = classifyIdeaFile(file);
  const kind = selectedKind ?? detectedKind;
  if (!detectedKind) return `O formato de “${file.name}” não é aceito.`;
  if (selectedKind && detectedKind !== selectedKind) {
    const expected =
      selectedKind === IdeaMaterialKind.DOCUMENT
        ? 'documento'
        : selectedKind === IdeaMaterialKind.IMAGE
          ? 'imagem'
          : 'vídeo';
    return `“${file.name}” não é um arquivo de ${expected}. Escolha o tipo correto ou outro arquivo.`;
  }
  const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
  const expectedMime = IDEA_SHARE_MIME_BY_EXTENSION[extension];
  if (file.type && file.type !== 'application/octet-stream' && file.type !== expectedMime)
    return `O tipo de arquivo de “${file.name}” não corresponde à extensão.`;
  const limit =
    kind === IdeaMaterialKind.DOCUMENT
      ? IDEA_SHARE_MAX_DOCUMENT_BYTES
      : kind === IdeaMaterialKind.IMAGE
        ? IDEA_SHARE_MAX_IMAGE_BYTES
        : IDEA_SHARE_MAX_VIDEO_BYTES;
  if (!file.size || file.size > limit)
    return `“${file.name}” está vazio ou excede o limite de ${Math.round(limit / 1024 / 1024)} MB.`;
  return null;
}

export function toIdeaUploadFieldKey(material: IdeaShareMaterial, index: number): string {
  const extension = material.name.split('.').pop()?.toLowerCase() ?? 'file';
  return `idea_media_${index + 1}.${extension}`;
}

export function parseYoutubeVideoId(value: string): string | null {
  try {
    const url = new URL(value.trim());
    const host = url.hostname.toLowerCase();
    if (
      !['http:', 'https:'].includes(url.protocol) ||
      !['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be'].includes(host)
    )
      return null;
    const id =
      host === 'youtu.be'
        ? url.pathname.split('/').filter(Boolean)[0]
        : url.pathname === '/watch'
          ? url.searchParams.get('v')
          : url.pathname.match(/^\/(?:shorts|embed)\/([^/]+)$/)?.[1];
    return id && /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null;
  } catch {
    return null;
  }
}

export function isValidYoutubeUrl(value: string): boolean {
  return parseYoutubeVideoId(value) !== null;
}

export function toIdeaUploadMedia(
  file: File,
  selectedKind?: IdeaMaterialKind
): IdeaShareMaterial | null {
  const detectedKind = classifyIdeaFile(file);
  const kind = selectedKind ?? detectedKind;
  if (!kind || detectedKind !== kind) return null;
  const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
  const mimeType = IDEA_SHARE_MIME_BY_EXTENSION[extension];
  const uploadFile =
    file.type && file.type !== 'application/octet-stream'
      ? file
      : new File([file], file.name, { type: mimeType });
  return {
    id: crypto.randomUUID(),
    file: uploadFile,
    kind,
    name: file.name,
    previewUrl:
      kind === IdeaMaterialKind.IMAGE || kind === IdeaMaterialKind.VIDEO
        ? URL.createObjectURL(uploadFile)
        : undefined,
  };
}

export function toIdeaYoutubeMedia(value: string): IdeaShareMaterial | null {
  const id = parseYoutubeVideoId(value);
  if (!id) return null;
  return {
    id: crypto.randomUUID(),
    kind: IdeaMaterialKind.VIDEO,
    name: `Vídeo do YouTube (${id})`,
    url: `https://www.youtube.com/watch?v=${id}`,
  };
}

export function mediaTypeForIdeaMaterial(kind: IdeaMaterialKind): MediaType {
  switch (kind) {
    case IdeaMaterialKind.DOCUMENT:
      return MediaType.DOCUMENT;
    case IdeaMaterialKind.IMAGE:
      return MediaType.IMAGE;
    case IdeaMaterialKind.VIDEO:
      return MediaType.VIDEO;
  }
}

export function mediaUploadTypeForIdeaMaterial(material: IdeaShareMaterial): MediaUploadType {
  return material.url ? MediaUploadType.LINK : MediaUploadType.UPLOAD;
}

export function youtubePlatformForIdeaMaterial(
  material: IdeaShareMaterial
): MediaPlatform | undefined {
  return material.url ? MediaPlatform.YOUTUBE : undefined;
}

export function summarizeIdeaMaterials(materials: IdeaShareMaterial[]): string {
  return [
    [IdeaMaterialKind.DOCUMENT, 'documento', 'documentos'],
    [IdeaMaterialKind.IMAGE, 'imagem', 'imagens'],
    [IdeaMaterialKind.VIDEO, 'vídeo', 'vídeos'],
  ]
    .map(([kind, one, many]) => {
      const count = materials.filter((m) => m.kind === kind).length;
      return `${count} ${count === 1 ? one : many}`;
    })
    .join(' · ');
}

export function buildIdeaShareSubmission(
  values: IdeaShareFormValues,
  materials: IdeaShareMaterial[]
): FormData {
  const formData = new FormData();
  const medias = materials.map((material, index) => {
    const common = {
      mediaType: mediaTypeForIdeaMaterial(material.kind),
      uploadType: mediaUploadTypeForIdeaMaterial(material),
      isLocalFile: !material.url,
    };
    if (material.url)
      return {
        ...common,
        url: material.url,
        platformType: youtubePlatformForIdeaMaterial(material),
      };
    const fieldKey = toIdeaUploadFieldKey(material, index);
    if (material.file) formData.append(fieldKey, material.file);
    return { ...common, fieldKey, originalName: material.name, size: material.file?.size };
  });
  formData.append(
    'sectionData',
    JSON.stringify({ title: values.title, description: values.description, medias })
  );
  return formData;
}
