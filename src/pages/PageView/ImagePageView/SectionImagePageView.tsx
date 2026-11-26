import React, { useState } from 'react';
import { Box, Dialog, IconButton, Paper, Skeleton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import BrokenImageOutlinedIcon from '@mui/icons-material/BrokenImageOutlined';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Keyboard, Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import { MediaItem } from 'store/slices/types';
import { getMediaPreviewUrl } from 'utils/getMediaPreviewUrl';

import { PHOTO_FEATURE_MIN, PHOTO_PREVIEW_COUNT } from './photoSection.constants';
import { formatPhotoDate, photoCountLabel } from './photoSection.utils';

/**
 * As props declaram o que o componente consome, em vez de derivarem do tipo da
 * seção: aqui as datas chegam já convertidas e as mídias vêm do estado local.
 */
export interface SectionItemProps {
  caption: string;
  description: string;
  mediaItems: MediaItem[];
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

interface TileProps {
  src: string;
  alt: string;
  featured: boolean;
  overlayCount?: number;
  onOpen: () => void;
}

/** Um bloco do mosaico: carrega com esqueleto e cai num ícone se a imagem falhar. */
const PhotoTile: React.FC<TileProps> = ({ src, alt, featured, overlayCount, onOpen }) => {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  return (
    <Box data-testid="page-view-image-photo-tile"
      component="button"
      type="button"
      onClick={onOpen}
      aria-label={overlayCount ? `Ver todas as fotos (+${overlayCount})` : `Abrir foto: ${alt}`}
      sx={{
        position: 'relative',
        p: 0,
        border: 0,
        cursor: 'pointer',
        overflow: 'hidden',
        borderRadius: { xs: 2, md: 2.5 },
        bgcolor: '#e2e8f0',
        aspectRatio: '1 / 1',
        gridColumn: featured ? 'span 2' : 'auto',
        gridRow: featured ? 'span 2' : 'auto',
        '&:focus-visible': { outline: '3px solid #81d742', outlineOffset: 2 },
        '&:hover img': { transform: 'scale(1.06)' },
      }}
    >
      {!loaded && !failed && <Skeleton variant="rectangular" sx={{ position: 'absolute', inset: 0, height: '100%' }} />}
      {failed ? (
        <Box sx={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', color: '#94a3b8' }}>
          <BrokenImageOutlinedIcon />
        </Box>
      ) : (
        <Box
          component="img"
          src={src}
          alt={alt}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
            transition: 'transform .35s ease',
            visibility: loaded ? 'visible' : 'hidden',
          }}
        />
      )}
      {overlayCount ? (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'grid',
            placeItems: 'center',
            bgcolor: 'rgba(15,23,42,0.6)',
            color: '#fff',
            fontWeight: 800,
            fontSize: { xs: '1.4rem', md: '1.8rem' },
          }}
        >
          +{overlayCount}
        </Box>
      ) : null}
    </Box>
  );
};

const SectionImagePageView: React.FC<SectionItemProps> = ({
  caption,
  description,
  mediaItems,
  createdAt,
}) => {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (!mediaItems || mediaItems.length === 0) return null;

  const total = mediaItems.length;
  const date = formatPhotoDate(createdAt);
  const collapsed = total > PHOTO_PREVIEW_COUNT;
  const visible = collapsed ? mediaItems.slice(0, PHOTO_PREVIEW_COUNT) : mediaItems;
  const hiddenCount = total - visible.length;
  const hasFeature = total >= PHOTO_FEATURE_MIN;

  return (
    <Paper
      data-testid="page-view-image-page-view-section-image-page-view"
      elevation={0}
      component="section"
      sx={{ borderRadius: 3, border: '1px solid #e2e8f0', p: { xs: 1.5, sm: 2.5, md: 3 }, bgcolor: '#fff' }}
    >
      <Box sx={{ mb: { xs: 1.5, md: 2 } }}>
        <Typography component="h2" sx={{ fontWeight: 800, color: '#0f172a', fontSize: { xs: '1.1rem', md: '1.35rem' }, lineHeight: 1.25 }}>
          {caption}
        </Typography>
        {description && (
          <Typography sx={{ mt: 0.5, color: '#475569', fontSize: { xs: '0.9rem', md: '1rem' }, lineHeight: 1.55 }}>
            {description}
          </Typography>
        )}
        <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', alignItems: 'center', columnGap: 2, rowGap: 0.5, color: '#64748b', fontSize: '0.8rem', fontWeight: 600 }}>
          <span>{photoCountLabel(total)}</span>
          {date && (
            <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
              <CalendarTodayOutlinedIcon sx={{ fontSize: 14 }} />
              {date}
            </Box>
          )}
        </Box>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', sm: 'repeat(3, minmax(0, 1fr))', lg: 'repeat(4, minmax(0, 1fr))' },
          gap: { xs: 0.75, md: 1.25 },
        }}
      >
        {visible.map((item, index) => {
          const isLast = collapsed && index === visible.length - 1;
          return (
            <PhotoTile
              key={item.id ?? index}
              src={getMediaPreviewUrl(item)}
              alt={`${caption} - foto ${index + 1}`}
              featured={hasFeature && index === 0}
              overlayCount={isLast ? hiddenCount + 1 : undefined}
              onOpen={() => setLightboxIndex(index)}
            />
          );
        })}
      </Box>

      <Dialog
        open={lightboxIndex !== null}
        onClose={() => setLightboxIndex(null)}
        fullScreen
        PaperProps={{ sx: { bgcolor: 'rgba(2,6,23,0.97)', color: '#fff' } }}
      >
        <IconButton
          onClick={() => setLightboxIndex(null)}
          aria-label="Fechar"
          sx={{ position: 'absolute', top: 12, right: 12, zIndex: 10, width: 48, height: 48, color: '#fff', bgcolor: 'rgba(255,255,255,0.14)', '&:hover': { bgcolor: 'rgba(255,255,255,0.24)' } }}
        >
          <CloseIcon />
        </IconButton>
        <Typography sx={{ position: 'absolute', top: 22, left: 16, zIndex: 10, fontWeight: 700, fontSize: '0.9rem', maxWidth: 'calc(100% - 90px)' }} noWrap>
          {caption}
        </Typography>
        {lightboxIndex !== null && (
          <Swiper
            modules={[Navigation, Pagination, Keyboard]}
            navigation
            keyboard
            pagination={{ type: 'fraction' }}
            initialSlide={lightboxIndex}
            style={{ width: '100%', height: '100%' }}
          >
            {mediaItems.map((item, index) => (
              <SwiperSlide key={item.id ?? index}>
                <Box sx={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center', p: { xs: 1, md: 6 } }}>
                  <Box
                    component="img"
                    src={getMediaPreviewUrl(item)}
                    alt={`${caption} - foto ${index + 1}`}
                    sx={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: 1 }}
                  />
                </Box>
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </Dialog>
    </Paper>
  );
};

export default SectionImagePageView;
