import IdeasPageView from 'pages/PageView/IdeasMaterialViewpage/IdeasPageView';
import PageGalleryView from 'pages/PageView/ImagePageView/ImagePageView';
import PageVideoView from 'pages/PageView/VideoViewPage/PageVideoView';
import WeekMaterialsPageView from 'pages/PageView/WeekMaterialViewPage/WeekMaterialsPageView';
import React from 'react';
import { MediaTargetType } from 'store/slices/types';

interface PageRendererProps {
  entityType: string;
  idToFetch: string;
}

const PageRenderer: React.FC<PageRendererProps> = ({ entityType, idToFetch }) => {
  switch (entityType) {
    case MediaTargetType.ImagesPage:
      return <PageGalleryView idToFetch={idToFetch} />;
    case MediaTargetType.VideosPage:
      return <PageVideoView idToFetch={idToFetch} />;
    case MediaTargetType.WeekMaterialsPage:
      return <WeekMaterialsPageView idToFetch={idToFetch} />;
    case MediaTargetType.IdeasPage:
      return <IdeasPageView idToFetch={idToFetch} />;
    default:
      return <div>Tipo de página desconhecido: {entityType}</div>;
  }
};

export default PageRenderer;
