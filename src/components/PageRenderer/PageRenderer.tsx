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
      return <PageGalleryView data-testid="page-renderer" idToFetch={idToFetch} />;
    case MediaTargetType.VideosPage:
      return <PageVideoView data-testid="page-renderer" idToFetch={idToFetch} />;
    case MediaTargetType.WeekMaterialsPage:
      return <WeekMaterialsPageView data-testid="page-renderer" idToFetch={idToFetch} />;
    case MediaTargetType.IdeasPage:
      return <IdeasPageView data-testid="page-renderer" idToFetch={idToFetch} />;
    default:
      return <div data-testid="page-renderer">Tipo de página desconhecido: {entityType}</div>;
  }
};

export default PageRenderer;
