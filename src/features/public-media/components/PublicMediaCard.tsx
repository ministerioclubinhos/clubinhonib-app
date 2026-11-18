import React, { useState } from 'react';
import { Box, Card, CardActionArea, Typography } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PhotoLibraryOutlinedIcon from '@mui/icons-material/PhotoLibraryOutlined';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import { Link } from 'react-router-dom';

import {
  PUBLIC_MEDIA_ACCENT,
  PUBLIC_MEDIA_COVER_GRADIENT,
  PUBLIC_MEDIA_CTA_LABEL,
  PUBLIC_MEDIA_KIND_LABEL,
  PublicMediaKind,
} from '../constants';
import type { PublicMediaItem } from '../types';

interface Props {
  item: PublicMediaItem;
}

/** Cartão de uma coleção: capa (ou arte do tipo), título, descrição e chamada. */
const PublicMediaCard: React.FC<Props> = ({ item }) => {
  const { route, kind, path } = item;
  const accent = PUBLIC_MEDIA_ACCENT[kind];
  const isPhotos = kind === PublicMediaKind.Photos;
  const Icon = isPhotos ? PhotoLibraryOutlinedIcon : PlayCircleOutlineIcon;
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = Boolean(route.image) && !imageFailed;

  return (
    <Card
      data-testid={`public-media-card-${route.idToFetch}`}
      elevation={0}
      sx={{
        height: '100%',
        borderRadius: 3.5,
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
        bgcolor: '#fff',
        transition: 'transform .25s ease, box-shadow .25s ease',
        '&:hover': { transform: 'translateY(-4px)', boxShadow: `0 16px 32px ${accent}33` },
        '&:hover .cover-img': { transform: 'scale(1.06)' },
        '&:hover .cta-arrow': { transform: 'translateX(4px)' },
      }}
    >
      <CardActionArea
        component={Link}
        to={path}
        sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch', justifyContent: 'flex-start' }}
      >
        <Box sx={{ position: 'relative', aspectRatio: '16 / 10', overflow: 'hidden', background: PUBLIC_MEDIA_COVER_GRADIENT[kind] }}>
          {showImage ? (
            <>
              <Box
                className="cover-img"
                component="img"
                src={route.image ?? ''}
                alt={route.title}
                loading="lazy"
                onError={() => setImageFailed(true)}
                sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform .45s ease' }}
              />
              <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0) 50%, rgba(0,0,0,0.5) 100%)' }} />
            </>
          ) : (
            <Box sx={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', color: 'rgba(255,255,255,0.92)' }}>
              <Icon sx={{ fontSize: { xs: 64, md: 72 } }} />
            </Box>
          )}
          <Box
            sx={{
              position: 'absolute',
              top: 12,
              left: 12,
              px: 1.25,
              height: 26,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.5,
              borderRadius: 999,
              bgcolor: 'rgba(255,255,255,0.95)',
              color: accent,
              fontWeight: 800,
              fontSize: '0.72rem',
              letterSpacing: 0.3,
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            }}
          >
            <Icon sx={{ fontSize: 15 }} />
            {PUBLIC_MEDIA_KIND_LABEL[kind].singular}
          </Box>
        </Box>

        <Box sx={{ p: { xs: 2, md: 2.5 }, flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Typography
            component="h3"
            sx={{
              fontWeight: 800,
              color: '#0f172a',
              fontSize: { xs: '1.05rem', md: '1.15rem' },
              lineHeight: 1.3,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {route.title || 'Sem título'}
          </Typography>
          {route.description && (
            <Typography
              variant="body2"
              sx={{ mt: 0.75, color: '#475569', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
            >
              {route.description}
            </Typography>
          )}
          <Box sx={{ mt: 'auto', pt: 1.75, display: 'flex', alignItems: 'center', gap: 0.5, color: accent, fontWeight: 800, fontSize: '0.9rem' }}>
            {PUBLIC_MEDIA_CTA_LABEL[kind]}
            <ArrowForwardIcon className="cta-arrow" sx={{ fontSize: 18, transition: 'transform .2s ease' }} />
          </Box>
        </Box>
      </CardActionArea>
    </Card>
  );
};

export default PublicMediaCard;
