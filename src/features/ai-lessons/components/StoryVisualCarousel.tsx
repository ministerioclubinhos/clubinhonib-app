import { useEffect, useState } from 'react';
import { ArrowBackIosNew, ArrowForwardIos } from '@mui/icons-material';
import { Box, Card, CardContent, Chip, IconButton, Stack, Typography } from '@mui/material';

import { LessonVisualOrientation, VisualAsset } from '../types';

interface StoryVisualCarouselProps {
  assets: VisualAsset[];
  orientation: LessonVisualOrientation | '';
}

export const StoryVisualCarousel = ({ assets, orientation }: StoryVisualCarouselProps) => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex((current) => Math.min(current, Math.max(assets.length - 1, 0)));
  }, [assets.length]);

  if (!assets.length) return null;

  const asset = assets[activeIndex];
  const previous = () =>
    setActiveIndex((current) => (current === 0 ? assets.length - 1 : current - 1));
  const next = () => setActiveIndex((current) => (current === assets.length - 1 ? 0 : current + 1));

  return (
    <Box
      data-testid="ai-story-visual-carousel"
      role="region"
      aria-roledescription="carrossel"
      aria-label="Visuais da história"
      sx={{ mt: 4 }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
        <Typography variant="h6" fontWeight={800}>
          Cenas visuais da história
        </Typography>
        <Typography aria-live="polite" variant="body2" color="text.secondary" fontWeight={700}>
          {activeIndex + 1} de {assets.length}
        </Typography>
      </Stack>

      <Stack direction="row" alignItems="center" spacing={{ xs: 0.5, sm: 1.5 }}>
        <IconButton
          data-testid="ai-story-visual-carousel-previous"
          aria-label="Visual anterior"
          onClick={previous}
          disabled={assets.length < 2}
          sx={{ minWidth: 44, minHeight: 44 }}
        >
          <ArrowBackIosNew />
        </IconButton>

        <Card
          data-testid={`ai-story-visual-slide-${asset.id ?? 'current'}`}
          elevation={0}
          sx={{
            flex: 1,
            minWidth: 0,
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Box
            component="img"
            src={asset.url}
            alt={asset.altText ?? asset.purpose ?? `Cena visual ${activeIndex + 1}`}
            sx={{
              display: 'block',
              width: '100%',
              maxHeight: { xs: 420, md: 680 },
              aspectRatio: orientation === LessonVisualOrientation.PORTRAIT ? '3 / 4' : '4 / 3',
              objectFit: 'contain',
              bgcolor: 'grey.50',
            }}
          />
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" useFlexGap>
              <Typography variant="overline" color="primary.main" fontWeight={800}>
                Visual {activeIndex + 1}
              </Typography>
              {asset.identityReference && (
                <Chip
                  size="small"
                  color="primary"
                  variant="outlined"
                  label="Referência visual da sequência"
                />
              )}
            </Stack>
            {asset.purpose && <Typography fontWeight={700}>{asset.purpose}</Typography>}
            {asset.sourceExcerpt && (
              <Typography
                variant="body2"
                sx={{ mt: 1, p: 1.5, borderRadius: 2, bgcolor: 'action.hover' }}
              >
                <strong>Trecho da lição:</strong> {asset.sourceExcerpt}
              </Typography>
            )}
            {asset.altText && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {asset.altText}
              </Typography>
            )}
          </CardContent>
        </Card>

        <IconButton
          data-testid="ai-story-visual-carousel-next"
          aria-label="Próximo visual"
          onClick={next}
          disabled={assets.length < 2}
          sx={{ minWidth: 44, minHeight: 44 }}
        >
          <ArrowForwardIos />
        </IconButton>
      </Stack>

      {assets.length > 1 && (
        <Stack direction="row" justifyContent="center" spacing={0.5} sx={{ mt: 1.5 }}>
          {assets.map((item, index) => (
            <IconButton
              key={item.id ?? index}
              data-testid={`ai-story-visual-carousel-dot-${item.id ?? index}`}
              aria-label={`Mostrar visual ${index + 1}`}
              aria-current={index === activeIndex ? 'true' : undefined}
              onClick={() => setActiveIndex(index)}
              sx={{ minWidth: 44, minHeight: 44, p: 1.75 }}
            >
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  bgcolor: index === activeIndex ? 'primary.main' : 'action.disabled',
                }}
              />
            </IconButton>
          ))}
        </Stack>
      )}
    </Box>
  );
};
