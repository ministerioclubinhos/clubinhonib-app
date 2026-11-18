import React from 'react';
import { Box, Button, Container, Typography } from '@mui/material';
import PhotoLibraryOutlinedIcon from '@mui/icons-material/PhotoLibraryOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Link } from 'react-router-dom';

import { PUBLIC_MEDIA_BASE_PATH, PublicMediaKind, SHOWCASE_PREVIEW_COUNT } from '../constants';
import { usePublicMediaItems } from '../hooks';
import { countByKind } from '../utils';

/**
 * Apresentação da galeria pública na home. Só existe quando há ao menos uma
 * coleção pública de fotos ou vídeos; o clique leva à galeria completa.
 */
const MediaShowcaseSection: React.FC = () => {
  const items = usePublicMediaItems();
  if (items.length === 0) return null;

  const covers = items.filter((item) => item.route.image).slice(0, SHOWCASE_PREVIEW_COUNT);
  const photos = countByKind(items, PublicMediaKind.Photos);
  const videos = countByKind(items, PublicMediaKind.Videos);
  const summary = [
    photos > 0 ? `${photos} ${photos === 1 ? 'álbum de fotos' : 'álbuns de fotos'}` : null,
    videos > 0 ? `${videos} ${videos === 1 ? 'galeria de vídeos' : 'galerias de vídeos'}` : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <Box data-testid="home-media-showcase" component="section" sx={{ py: { xs: 5, md: 9 }, bgcolor: '#f6faf2' }}>
      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            gap: { xs: 3, md: 6 },
            alignItems: 'center',
          }}
        >
          <Box sx={{ order: { xs: 2, md: 1 } }}>
            <Typography sx={{ color: '#4d9f1f', fontWeight: 800, fontSize: '0.8rem', letterSpacing: 1, textTransform: 'uppercase' }}>
              Galeria do Clubinho
            </Typography>
            <Typography
              variant="h2"
              component="h2"
              sx={{ fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.6rem' }, fontWeight: 800, color: '#1f2d3d', lineHeight: 1.15, mt: 0.5 }}
            >
              Momentos que fazem a diferença
            </Typography>
            <Typography sx={{ mt: 1.5, color: '#475569', fontSize: { xs: '1rem', md: '1.1rem' }, lineHeight: 1.6 }}>
              Veja fotos e vídeos dos nossos clubinhos, encontros e eventos.
            </Typography>
            <Typography sx={{ mt: 1, color: '#64748b', fontWeight: 600, fontSize: '0.9rem' }}>{summary}</Typography>
            <Button
              component={Link}
              to={PUBLIC_MEDIA_BASE_PATH}
              data-testid="home-media-showcase-cta"
              variant="contained"
              endIcon={<ArrowForwardIcon />}
              sx={{
                mt: 2.5,
                width: { xs: '100%', sm: 'auto' },
                minHeight: 48,
                px: 3.5,
                borderRadius: 3,
                textTransform: 'none',
                fontWeight: 800,
                fontSize: '1rem',
                bgcolor: '#81d742',
                color: '#17300a',
                boxShadow: '0 8px 20px rgba(129,215,66,0.4)',
                '&:hover': { bgcolor: '#6bb83a' },
              }}
            >
              Ver fotos e vídeos
            </Button>
          </Box>

          <Box
            component={Link}
            to={PUBLIC_MEDIA_BASE_PATH}
            aria-label="Abrir galeria de fotos e vídeos"
            sx={{
              order: { xs: 1, md: 2 },
              display: 'grid',
              gridTemplateColumns: covers.length > 1 ? '2fr 1fr' : '1fr',
              gridTemplateRows: covers.length > 2 ? '1fr 1fr' : '1fr',
              gap: 1.25,
              aspectRatio: { xs: '16 / 10', md: '4 / 3' },
              textDecoration: 'none',
            }}
          >
            {covers.length === 0 ? (
              <Box sx={{ display: 'grid', placeItems: 'center', borderRadius: 3, bgcolor: '#e4f3d8', color: '#4d9f1f' }}>
                <PhotoLibraryOutlinedIcon sx={{ fontSize: 72 }} />
              </Box>
            ) : (
              covers.map((item, index) => (
                <Box
                  key={item.route.id}
                  component="img"
                  src={item.route.image ?? ''}
                  alt={item.route.title}
                  loading="lazy"
                  onError={(event) => {
                    event.currentTarget.style.visibility = 'hidden';
                  }}
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: 3,
                    bgcolor: '#e4f3d8',
                    boxShadow: '0 8px 22px rgba(15,23,42,0.12)',
                    gridRow: index === 0 && covers.length > 2 ? 'span 2' : 'auto',
                  }}
                />
              ))
            )}
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default MediaShowcaseSection;
