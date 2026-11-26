import React, { useMemo, useState } from 'react';
import { Box, Chip, Container, InputAdornment, TextField, Typography } from '@mui/material';
import PermMediaOutlinedIcon from '@mui/icons-material/PermMediaOutlined';
import SearchIcon from '@mui/icons-material/Search';

import PublicMediaCard from './components/PublicMediaCard';
import {
  PUBLIC_MEDIA_ACCENT,
  PUBLIC_MEDIA_FILTERS,
  PUBLIC_MEDIA_GROUP_TITLE,
  PUBLIC_MEDIA_PAGE_WIDTH,
  PublicMediaFilter,
  PublicMediaKind,
} from './constants';
import { usePublicMediaItems } from './hooks';
import type { PublicMediaItem } from './types';
import { countByKind, filterPublicMediaItems } from './utils';

const HERO_CHIP_SX = { bgcolor: 'rgba(255,255,255,0.22)', color: '#fff', fontWeight: 700, height: 32, fontSize: '0.9rem' } as const;

const GRID_SX = {
  display: 'grid',
  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(3, minmax(0, 1fr))' },
  gap: { xs: 2, md: 3 },
} as const;

const Group: React.FC<{ kind: PublicMediaKind; items: PublicMediaItem[]; showTitle: boolean }> = ({ kind, items, showTitle }) => {
  if (items.length === 0) return null;
  return (
    <Box data-testid="public-media-gallery-group" component="section" sx={{ mb: { xs: 4, md: 6 } }}>
      {showTitle && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 2 }}>
          <Box sx={{ width: 6, height: 26, borderRadius: 3, bgcolor: PUBLIC_MEDIA_ACCENT[kind] }} />
          <Typography component="h2" sx={{ fontWeight: 800, color: '#0f172a', fontSize: { xs: '1.25rem', md: '1.5rem' } }}>
            {PUBLIC_MEDIA_GROUP_TITLE[kind]}
          </Typography>
          <Typography sx={{ color: '#64748b', fontWeight: 700 }}>{items.length}</Typography>
        </Box>
      )}
      <Box sx={GRID_SX}>
        {items.map((item) => (
          <PublicMediaCard key={item.route.id} item={item} />
        ))}
      </Box>
    </Box>
  );
};

/** Galeria pública (sem login) com todas as coleções de fotos e vídeos. */
const PublicMediaGalleryPage: React.FC = () => {
  const items = usePublicMediaItems();
  const [filter, setFilter] = useState<PublicMediaFilter>(PublicMediaFilter.All);
  const [search, setSearch] = useState('');

  const visible = useMemo(() => filterPublicMediaItems(items, filter, search), [items, filter, search]);
  const photos = visible.filter((item) => item.kind === PublicMediaKind.Photos);
  const videos = visible.filter((item) => item.kind === PublicMediaKind.Videos);
  const showGroupTitles = filter === PublicMediaFilter.All;
  const counts: Record<PublicMediaFilter, number> = {
    [PublicMediaFilter.All]: items.length,
    [PublicMediaFilter.Photos]: countByKind(items, PublicMediaKind.Photos),
    [PublicMediaFilter.Videos]: countByKind(items, PublicMediaKind.Videos),
  };

  return (
    <Box data-testid="public-media-gallery" sx={{ bgcolor: '#f4f7f2', minHeight: '70vh' }}>
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          color: '#fff',
          textAlign: 'center',
          py: { xs: 5, md: 9 },
          px: { xs: 2, sm: 3 },
          background: 'linear-gradient(135deg, #81d742 0%, #3f8f1b 100%)',
          '&::before': { content: '""', position: 'absolute', width: 340, height: 340, borderRadius: '50%', top: -160, right: -100, bgcolor: 'rgba(255,255,255,0.12)' },
          '&::after': { content: '""', position: 'absolute', width: 220, height: 220, borderRadius: '50%', bottom: -110, left: -70, bgcolor: 'rgba(255,255,255,0.1)' },
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ width: 64, height: 64, mx: 'auto', mb: 1.5, borderRadius: 3, display: 'grid', placeItems: 'center', bgcolor: 'rgba(255,255,255,0.22)' }}>
            <PermMediaOutlinedIcon sx={{ fontSize: 36 }} />
          </Box>
          <Typography component="h1" sx={{ fontWeight: 800, color: '#fff', lineHeight: 1.1, fontSize: { xs: '2rem', sm: '2.7rem', md: '3.4rem' } }}>
            Fotos e vídeos
            <Box component="span" sx={{ display: 'block', fontSize: { xs: '1.35rem', sm: '1.8rem', md: '2.2rem' }, fontWeight: 700, mt: 0.5, opacity: 0.95 }}>
              do Clubinhos NIB
            </Box>
          </Typography>
          {items.length > 0 && (
            <Box sx={{ mt: 2.5, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 1 }}>
              {counts[PublicMediaFilter.Photos] > 0 && (
                <Chip data-testid="public-media-hero-photos" label={`${counts[PublicMediaFilter.Photos]} ${counts[PublicMediaFilter.Photos] === 1 ? 'álbum de fotos' : 'álbuns de fotos'}`} sx={HERO_CHIP_SX} />
              )}
              {counts[PublicMediaFilter.Videos] > 0 && (
                <Chip data-testid="public-media-hero-videos" label={`${counts[PublicMediaFilter.Videos]} ${counts[PublicMediaFilter.Videos] === 1 ? 'galeria de vídeos' : 'galerias de vídeos'}`} sx={HERO_CHIP_SX} />
              )}
            </Box>
          )}
        </Box>
      </Box>

      {/* Filtros fixos sob a navbar: o visitante troca de tipo sem voltar ao topo. */}
      <Box sx={{ position: 'sticky', top: { xs: 56, sm: 64 }, zIndex: 5, bgcolor: 'rgba(244,247,242,0.96)', backdropFilter: 'blur(8px)', borderBottom: '1px solid #e2e8f0' }}>
        <Container maxWidth={false} disableGutters sx={{ width: PUBLIC_MEDIA_PAGE_WIDTH, px: 0, py: 1.25, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1.25, alignItems: { sm: 'center' }, justifyContent: 'space-between' }}>
          <Box role="group" aria-label="Filtrar por tipo" sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: { xs: 0.25, sm: 0 }, '&::-webkit-scrollbar': { display: 'none' } }}>
            {PUBLIC_MEDIA_FILTERS.map((option) => {
              const active = filter === option.value;
              return (
                <Chip
                  key={option.value}
                  data-testid={`public-media-filter-${option.value}`}
                  clickable
                  label={`${option.label} · ${counts[option.value]}`}
                  aria-pressed={active}
                  onClick={() => setFilter(option.value)}
                  sx={{
                    flexShrink: 0,
                    height: 40,
                    px: 0.75,
                    fontWeight: 800,
                    fontSize: '0.9rem',
                    bgcolor: active ? '#2f7d1a' : '#fff',
                    color: active ? '#fff' : '#334155',
                    border: '1px solid',
                    borderColor: active ? '#2f7d1a' : '#cbd5e1',
                    '&:hover': { bgcolor: active ? '#256615' : '#f1f5f9' },
                  }}
                />
              );
            })}
          </Box>
          <TextField
            size="small"
            placeholder="Buscar por título..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            inputProps={{ 'aria-label': 'Buscar fotos e vídeos' }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
              sx: { bgcolor: '#fff', borderRadius: 2.5, minHeight: 44 },
            }}
            sx={{ minWidth: { sm: 260 } }}
          />
        </Container>
      </Box>

      <Container maxWidth={false} disableGutters sx={{ width: PUBLIC_MEDIA_PAGE_WIDTH, py: { xs: 3, md: 5 } }}>
        {visible.length > 0 ? (
          <>
            <Group kind={PublicMediaKind.Photos} items={photos} showTitle={showGroupTitles} />
            <Group kind={PublicMediaKind.Videos} items={videos} showTitle={showGroupTitles} />
          </>
        ) : (
          <Typography color="text.secondary" textAlign="center" sx={{ py: 8 }}>
            {items.length === 0 ? 'Ainda não há fotos ou vídeos publicados.' : 'Nada encontrado com esse filtro.'}
          </Typography>
        )}
      </Container>
    </Box>
  );
};

export default PublicMediaGalleryPage;
