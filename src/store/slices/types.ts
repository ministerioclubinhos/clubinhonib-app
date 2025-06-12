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

export enum MediaTargetType {
  WeekMaterialsPage = 'WeekMaterialsPage',
  VideosPage = 'VideosPage',
  ImagesPage = 'ImagesPage',
  Meditation = 'Meditation',
  IdeasSection = 'IdeasSection',
  IdeasPage = 'IdeasPage',
  Document = 'Document',
  Event = 'Event',
  Informative = 'Informative'
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

export enum FeedbackCategory {
  CONTENT = 'content',
  APPEARANCE = 'appearance',
  USABILITY = 'usability',
  BROKEN_FEATURE = 'broken_feature',
  MISSING_FEATURE = 'missing_feature',
  PERFORMANCE = 'performance',
  MOBILE_EXPERIENCE = 'mobile_experience',
  SUGGESTION = 'suggestion',
  COMPLAINT = 'complaint',
  OTHER = 'other',
}

export const FeedbackCategoryLabels: Record<FeedbackCategory, string> = {
  [FeedbackCategory.CONTENT]: 'Conteúdo do site (textos, informações, erros)',
  [FeedbackCategory.APPEARANCE]: 'Aparência e organização do site',
  [FeedbackCategory.USABILITY]: 'Facilidade de uso / navegação',
  [FeedbackCategory.BROKEN_FEATURE]: 'Algo não está funcionando como deveria',
  [FeedbackCategory.MISSING_FEATURE]: 'Falta alguma funcionalidade importante',
  [FeedbackCategory.PERFORMANCE]: 'Velocidade ou desempenho do site',
  [FeedbackCategory.MOBILE_EXPERIENCE]: 'Problemas no celular ou tablet',
  [FeedbackCategory.SUGGESTION]: 'Sugestão de melhoria ou ideia',
  [FeedbackCategory.COMPLAINT]: 'Reclamação ou insatisfação',
  [FeedbackCategory.OTHER]: 'Outro tipo de feedback',
};

