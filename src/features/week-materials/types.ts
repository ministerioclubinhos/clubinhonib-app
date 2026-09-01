import type {
  MediaItem,
  MediaPlatform,
  MediaType,
  MediaUploadType,
} from '@/store/slices/types';
/**
 * Espelha `RouteType` da API. O enum `Type` do store cobre apenas `page` e
 * `doc`, então usá-lo aqui declararia menos valores do que a API pode devolver.
 */
export type WeekMaterialRouteType = 'page' | 'doc' | 'image' | 'other';

/** Media item exactly as the API returns it for a week material page. */
export interface WeekMaterialMediaResponse {
  id: string;
  title: string;
  description: string;
  uploadType: MediaUploadType;
  mediaType: MediaType;
  platformType?: MediaPlatform;
  url: string;
  isLocalFile?: boolean;
  size?: number;
  originalName?: string;
}

/** Route fields exposed by `/week-material-pages`. */
export interface WeekMaterialRouteResponse {
  id: string;
  path: string;
  title: string;
  subtitle: string;
  description: string;
  type: WeekMaterialRouteType;
  public: boolean;
}

/** Response contract of every `/week-material-pages` read endpoint. */
export interface WeekMaterialResponse {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  currentWeek: boolean;
  route: WeekMaterialRouteResponse;
  videos: WeekMaterialMediaResponse[];
  documents: WeekMaterialMediaResponse[];
  images: WeekMaterialMediaResponse[];
  audios: WeekMaterialMediaResponse[];
  createdAt: string;
  updatedAt: string;
}

/** Media item as sent to the API inside `weekMaterialsPageData`. */
export interface WeekMaterialMediaRequest {
  id?: string;
  title: string;
  description: string;
  mediaType: MediaType;
  uploadType: MediaUploadType;
  isLocalFile: boolean;
  url?: string;
  platformType: MediaPlatform | null;
  fieldKey?: string;
  size?: number;
}

/** JSON payload sent in the `weekMaterialsPageData` multipart field. */
export interface WeekMaterialPageRequest {
  id?: string;
  pageTitle: string;
  pageSubtitle: string;
  pageDescription: string;
  currentWeek: boolean;
  videos: WeekMaterialMediaRequest[];
  documents: WeekMaterialMediaRequest[];
  images: WeekMaterialMediaRequest[];
  audios: WeekMaterialMediaRequest[];
}

/** Page fields edited in the admin form. */
export interface WeekMaterialFormValues {
  pageTitle: string;
  pageSubtitle: string;
  pageDescription: string;
  currentWeek: boolean;
}

/** Which page fields failed the local required-field check. */
export interface WeekMaterialFormErrors {
  title: boolean;
  subtitle: boolean;
  description: boolean;
}

/** Media lists edited in the admin form, keyed by media type. */
export interface WeekMaterialMediaDraft {
  videos: MediaItem[];
  documents: MediaItem[];
  images: MediaItem[];
  audios: MediaItem[];
}

/** Per-media-type configuration of the shared media editor. */
export type {
  MediaEditorConfig as WeekMediaEditorConfig,
  MediaEditorErrors as WeekMediaEditorErrors,
} from '@/components/common/media';
