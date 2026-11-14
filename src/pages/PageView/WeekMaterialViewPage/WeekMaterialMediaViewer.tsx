import { MediaItem, MediaType } from '@/store/slices/types';

import WeekAudioPlayerView from './WeekAudioPlayerView';
import WeekDocumentViewer from './WeekDocumentViewer';
import WeekImageGalleryView from './WeekImageGalleryView';
import WeekVideoPlayerView from './WeekVideoPlayerView';

interface WeekMaterialMediaViewerProps {
  item: MediaItem;
  mediaType: MediaType;
}

/**
 * Renders a media item with the viewer of its type. Each viewer declares its own
 * prop name, so the mapping stays here instead of being resolved dynamically.
 */
export default function WeekMaterialMediaViewer({
  item,
  mediaType,
}: WeekMaterialMediaViewerProps) {
  switch (mediaType) {
    case MediaType.VIDEO:
      return <WeekVideoPlayerView data-testid="page-view-week-material-view-page-week-material-media-viewer" video={item} />;
    case MediaType.DOCUMENT:
      return <WeekDocumentViewer data-testid="page-view-week-material-view-page-week-material-media-viewer" document={item} />;
    case MediaType.IMAGE:
      return <WeekImageGalleryView data-testid="page-view-week-material-view-page-week-material-media-viewer" image={item} />;
    case MediaType.AUDIO:
      return <WeekAudioPlayerView data-testid="page-view-week-material-view-page-week-material-media-viewer" audio={item} />;
    default:
      return null;
  }
}
