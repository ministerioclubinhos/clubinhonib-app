import React from 'react';
import { Navigate, useParams } from 'react-router-dom';

import PageRenderer from '@/components/PageRenderer/PageRenderer';
import { MediaTargetType } from '@/store/slices/types';

import { PUBLIC_MEDIA_BASE_PATH, PublicMediaKind } from './constants';

interface Props {
  kind: PublicMediaKind;
}

const ENTITY_BY_KIND: Record<PublicMediaKind, MediaTargetType> = {
  [PublicMediaKind.Photos]: MediaTargetType.ImagesPage,
  [PublicMediaKind.Videos]: MediaTargetType.VideosPage,
};

/** Página pública de uma coleção, por id, fora da Área do Professor. */
const PublicMediaDetailPage: React.FC<Props> = ({ kind }) => {
  const { id } = useParams<{ id: string }>();
  if (!id) return <Navigate data-testid="public-media-detail-redirect" to={PUBLIC_MEDIA_BASE_PATH} replace />;
  return <PageRenderer data-testid="public-media-detail" key={`${kind}-${id}`} entityType={ENTITY_BY_KIND[kind]} idToFetch={id} variant="public" />;
};

export default PublicMediaDetailPage;
