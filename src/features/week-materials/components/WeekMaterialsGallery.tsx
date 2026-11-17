import {
  AutoStoriesOutlined,
  Clear,
  GridViewOutlined,
  Search,
  SearchOff,
} from '@mui/icons-material';
import {
  Alert,
  alpha,
  Box,
  Button,
  Container,
  IconButton,
  InputAdornment,
  MenuItem,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import { FEATURE } from '@/features/feature-flags';
import { useFeatureEnabled } from '@/hooks';

import {
  MATERIAL_GALLERY_CATEGORIES,
  MATERIAL_GALLERY_CONTENT_WIDTH,
  MATERIAL_GALLERY_GRID,
  MATERIAL_GALLERY_SKELETONS,
  MATERIAL_GALLERY_SORT_OPTIONS,
} from '../gallery.constants';
import { getMaterialGalleryPath } from '../gallery.utils';
import { MaterialGallerySort } from '../types';
import { useWeekMaterialsGallery } from '../useWeekMaterialsGallery';
import { WeekMaterialGalleryCard } from './WeekMaterialGalleryCard';

export function WeekMaterialsGallery() {
  const gallery = useWeekMaterialsGallery();
  const showSpecialFamilyDay = useFeatureEnabled(FEATURE.SPECIAL_FAMILY_DAY);

  return (
    <Box
      data-testid="week-materials-gallery"
      sx={{ minHeight: '80vh', bgcolor: 'grey.50', pb: { xs: 5, md: 8 } }}
    >
      <Box sx={{ bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}>
        <Container
          maxWidth={false}
          disableGutters
          sx={{ width: MATERIAL_GALLERY_CONTENT_WIDTH, pt: 2, pb: { xs: 3, md: 4 } }}
        >
          <Stack direction="row" spacing={3} alignItems="center" justifyContent="space-between">
            <Box>
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{ color: 'primary.main', mb: 1 }}
              >
                <AutoStoriesOutlined fontSize="small" />
                <Typography variant="overline" sx={{ fontWeight: 700, letterSpacing: 2 }}>
                  Biblioteca do professor
                </Typography>
              </Stack>
              <Typography
                component="h1"
                variant="h3"
                sx={{
                  fontSize: { xs: '2rem', md: '2.75rem' },
                  fontWeight: 800,
                  color: 'text.primary',
                  letterSpacing: '-0.035em',
                  mb: 1.5,
                }}
              >
                Galeria de materiais
              </Typography>
              <Typography color="text.secondary" sx={{ maxWidth: 620, lineHeight: 1.7 }}>
                Lições e recursos para preparar o próximo encontro do seu Clubinho.
              </Typography>
            </Box>
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              sx={{
                display: { xs: 'none', md: 'flex' },
                flexShrink: 0,
                p: 2.5,
                borderRadius: 3,
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.05),
              }}
            >
              <GridViewOutlined sx={{ fontSize: 36, color: 'primary.main' }} />
              <Box>
                <Typography component="p" variant="h5" fontWeight={800}>
                  {gallery.loading || gallery.error ? '—' : gallery.materials.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  materiais no acervo
                </Typography>
              </Box>
            </Stack>
          </Stack>
        </Container>
      </Box>

      <Container
        data-testid="week-material-gallery-content"
        maxWidth={false}
        disableGutters
        sx={{ width: MATERIAL_GALLERY_CONTENT_WIDTH, pt: { xs: 3, md: 4 } }}
      >
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2.5 }}>
          <TextField
            label="Buscar materiais"
            placeholder="Busque por título, tema ou referência bíblica"
            value={gallery.search}
            onChange={(event) => gallery.setSearch(event.target.value)}
            fullWidth
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Search color="action" />
                  </InputAdornment>
                ),
                endAdornment: gallery.search && (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="Limpar busca"
                      onClick={() => gallery.setSearch('')}
                      sx={{ minWidth: 44, minHeight: 44 }}
                    >
                      <Clear fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
            sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'background.paper', borderRadius: 2.5 } }}
          />
          <TextField
            select
            label="Ordenar por"
            value={gallery.sort}
            onChange={(event) => gallery.setSort(event.target.value as MaterialGallerySort)}
            sx={{
              minWidth: { sm: 200 },
              '& .MuiOutlinedInput-root': { bgcolor: 'background.paper', borderRadius: 2.5 },
            }}
          >
            {MATERIAL_GALLERY_SORT_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Stack>

        <Stack
          direction="row"
          flexWrap="wrap"
          gap={1}
          role="group"
          aria-label="Categoria dos materiais"
          sx={{ mb: 3 }}
        >
          {MATERIAL_GALLERY_CATEGORIES.map((option) => (
            <Button
              key={option.value}
              data-testid={`week-material-gallery-filter-${option.value}`}
              variant={gallery.category === option.value ? 'contained' : 'outlined'}
              aria-pressed={gallery.category === option.value}
              aria-label={option.label}
              disableElevation
              onClick={() => gallery.setCategory(option.value)}
              sx={{
                borderRadius: 8,
                minHeight: 44,
                px: { xs: 2, sm: 2.5 },
                textTransform: 'none',
                fontWeight: 600,
                ...(gallery.category !== option.value && {
                  bgcolor: 'background.paper',
                  borderColor: 'divider',
                  color: 'text.secondary',
                }),
              }}
            >
              <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                {option.label}
              </Box>
              <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>
                {option.shortLabel}
              </Box>
            </Button>
          ))}
        </Stack>

        {gallery.loading ? (
          <Box
            data-testid="week-material-gallery-loading"
            role="status"
            aria-label="Carregando materiais"
            sx={MATERIAL_GALLERY_GRID}
          >
            {MATERIAL_GALLERY_SKELETONS.map((key) => (
              <Box
                key={key}
                sx={{
                  p: 1,
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 4,
                  bgcolor: 'background.paper',
                }}
              >
                <Skeleton
                  variant="rounded"
                  sx={{ height: 'auto', aspectRatio: '3 / 2', borderRadius: 3 }}
                />
                <Box sx={{ p: 2 }}>
                  <Skeleton width="35%" />
                  <Skeleton height={36} />
                  <Skeleton />
                  <Skeleton width="70%" />
                </Box>
              </Box>
            ))}
          </Box>
        ) : gallery.error ? (
          <Alert
            severity="error"
            data-testid="week-material-gallery-error"
            action={
              <Button color="inherit" onClick={gallery.retry} sx={{ minHeight: 44 }}>
                Tentar novamente
              </Button>
            }
          >
            Não foi possível carregar os materiais. Tente novamente.
          </Alert>
        ) : (
          <>
            <Typography
              component="p"
              role="status"
              data-testid="week-material-gallery-results"
              variant="body2"
              color="text.secondary"
              sx={{ mb: 2 }}
            >
              {gallery.filteredMaterials.length}{' '}
              {gallery.filteredMaterials.length === 1
                ? 'material encontrado'
                : 'materiais encontrados'}
            </Typography>
            {gallery.filteredMaterials.length ? (
              <Box data-testid="week-material-gallery-grid" sx={MATERIAL_GALLERY_GRID}>
                {gallery.filteredMaterials.map((material) => (
                  <WeekMaterialGalleryCard
                    key={material.id}
                    material={material}
                    href={getMaterialGalleryPath(
                      material,
                      showSpecialFamilyDay,
                      import.meta.env.VITE_SPECIAL_FAMILY_DAY_ID || ''
                    )}
                  />
                ))}
              </Box>
            ) : (
              <Stack
                data-testid="week-material-gallery-empty"
                alignItems="center"
                spacing={1.5}
                sx={{
                  textAlign: 'center',
                  py: 8,
                  px: 2,
                  bgcolor: 'background.paper',
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 4,
                }}
              >
                <SearchOff sx={{ fontSize: 48, color: 'text.secondary' }} />
                <Typography component="h2" variant="h6" fontWeight={700}>
                  {gallery.hasFilters ? 'Nenhum material encontrado' : 'Novos materiais em breve'}
                </Typography>
                <Typography color="text.secondary">
                  {gallery.hasFilters
                    ? 'Experimente outro termo ou explore todos os materiais.'
                    : 'Os materiais publicados aparecerão aqui para você preparar o próximo encontro.'}
                </Typography>
                {gallery.hasFilters && (
                  <Button
                    onClick={gallery.resetFilters}
                    sx={{ minHeight: 44, textTransform: 'none' }}
                  >
                    Limpar filtros
                  </Button>
                )}
              </Stack>
            )}
          </>
        )}
      </Container>
    </Box>
  );
}
