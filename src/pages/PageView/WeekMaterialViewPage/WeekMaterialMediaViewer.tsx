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
      return <WeekVideoPlayerView video={item} />;
    case MediaType.DOCUMENT:
      return <WeekDocumentViewer document={item} />;
    case MediaType.IMAGE:
      return <WeekImageGalleryView image={item} />;
    case MediaType.AUDIO:
      return <WeekAudioPlayerView audio={item} />;
    default:
      return null;
  }
}
