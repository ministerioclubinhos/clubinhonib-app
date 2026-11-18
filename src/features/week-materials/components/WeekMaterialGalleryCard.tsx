import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AutoStoriesOutlined, East, PushPinOutlined } from '@mui/icons-material';
import { alpha, Box, Card, CardActionArea, Chip, Stack, Typography } from '@mui/material';

import type { WeekMaterialGalleryCardProps } from '../types';
import { cleanMaterialDescription, isSpecialMaterialDescription } from '../utils';

export function WeekMaterialGalleryCard({ material, href }: WeekMaterialGalleryCardProps) {
  const [failedImage, setFailedImage] = useState<string | null>(null);
  const special = isSpecialMaterialDescription(material.description);
  const description = cleanMaterialDescription(material.description);

  return (
    <Card
      component="article"
      data-testid={`week-material-gallery-card-${material.id}`}
      variant="outlined"
      sx={{
        height: '100%',
        minWidth: 0,
        borderRadius: 4,
        borderColor: material.current ? 'primary.main' : 'divider',
        transition: 'box-shadow 180ms ease, border-color 180ms ease',
        '&:hover, &:focus-within': { borderColor: 'primary.main', boxShadow: 3 },
        '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
      }}
    >
      <CardActionArea
        component={Link}
        to={href}
        aria-label={`Ver material: ${material.title}`}
        data-testid="week-material-gallery-open"
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          p: 1,
          '&.Mui-focusVisible': {
            outline: '3px solid',
            outlineColor: 'primary.main',
            outlineOffset: -3,
          },
        }}
      >
        <Box
          sx={{
            position: 'relative',
            overflow: 'hidden',
            borderRadius: 3,
            aspectRatio: '3 / 2',
            bgcolor: 'grey.100',
          }}
        >
          {material.image && failedImage !== material.image ? (
            <Box
              component="img"
              src={material.image}
              alt={`Capa de ${material.title}`}
              loading="lazy"
              onError={() => setFailedImage(material.image)}
              sx={{ display: 'block', width: '100%', height: '100%', objectFit: 'contain' }}
            />
          ) : (
            <Stack
              data-testid="week-material-gallery-cover-fallback"
              alignItems="center"
              justifyContent="center"
              spacing={1.5}
              sx={{
                height: '100%',
                color: 'primary.main',
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.06),
              }}
            >
              <AutoStoriesOutlined sx={{ fontSize: 64 }} />
              <Typography variant="overline" fontWeight={700} letterSpacing={2}>
                Material do Clubinho
              </Typography>
            </Stack>
          )}
          {material.current && (
            <Chip
              icon={<PushPinOutlined />}
              label="Material da semana"
              data-testid="week-material-gallery-current"
              size="small"
              sx={{
                position: 'absolute',
                top: 12,
                left: 12,
                bgcolor: 'background.paper',
                color: 'primary.dark',
                fontWeight: 700,
                boxShadow: 1,
                '& .MuiChip-icon': { color: 'primary.main' },
              }}
            />
          )}
        </Box>
        <Stack spacing={1.5} sx={{ flex: 1, p: { xs: 1.5, md: 2 } }}>
          <Typography
            variant="overline"
            sx={{
              color: special ? 'secondary.dark' : 'primary.dark',
              fontWeight: 700,
              lineHeight: 1.5,
              letterSpacing: 1.3,
            }}
          >
            {special ? 'Material especial' : 'Material semanal'}
          </Typography>
          <Typography
            component="h2"
            variant="h6"
            color="text.primary"
            sx={{
              fontWeight: 700,
              fontSize: '1.15rem',
              lineHeight: 1.45,
              overflowWrap: 'anywhere',
            }}
          >
            {material.title}
          </Typography>
          {material.subtitle && (
            <Stack
              direction="row"
              spacing={1}
              alignItems="flex-start"
              sx={{ color: 'text.secondary' }}
            >
              <AutoStoriesOutlined sx={{ fontSize: 18, mt: 0.25 }} />
              <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
                {material.subtitle}
              </Typography>
            </Stack>
          )}
          {description && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                lineHeight: 1.7,
                overflowWrap: 'anywhere',
              }}
            >
              {description}
            </Typography>
          )}
          <Box sx={{ flex: 1 }} />
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{
              pt: 1.5,
              borderTop: 1,
              borderColor: 'divider',
              color: 'primary.main',
              minHeight: 44,
            }}
          >
            <Typography variant="body2" fontWeight={700}>
              Explorar material
            </Typography>
            <East fontSize="small" />
          </Stack>
        </Stack>
      </CardActionArea>
    </Card>
  );
}
