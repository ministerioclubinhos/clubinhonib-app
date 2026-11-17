import React, { useEffect, useMemo, useState } from 'react';
import { Paper, Box, Typography, IconButton, Chip, useMediaQuery, useTheme } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { SECTION_DATA, TEACHING_STEPS } from '../../constants';

interface Slide {
  group: string;
  emoji: string;
  title: string;
  color: string;
  description?: string;
  items?: string[];
  verse?: { text: string; reference: string };
}

const SECTION_EMOJI: Record<string, string> = { CheckCircle: '🎯', Info: '📌', Lightbulb: '💡' };

const AUTOPLAY_MS = 3000;

interface Props {
  showSteps?: boolean;
}

/**
 * Carrossel único que reúne Objetivos, Orientações, Dicas de Ouro e o
 * Passo a Passo da aula, no lugar de vários blocos empilhados.
 */
const TeacherGuideCarousel: React.FC<Props> = ({ showSteps = true }) => {
  const slides = useMemo<Slide[]>(() => {
    const guide: Slide[] = SECTION_DATA.map((s) => ({
      group: 'Guia',
      emoji: SECTION_EMOJI[s.icon] ?? '📌',
      title: s.title,
      color: s.color,
      items: s.items,
      verse: s.verse,
    }));
    const steps: Slide[] = showSteps
      ? TEACHING_STEPS.map((s) => ({
          group: 'Passo a passo',
          emoji: s.emoji,
          title: s.title,
          color: s.color,
          description: s.description,
          verse: s.verse,
        }))
      : [];
    return [...guide, ...steps];
  }, [showSteps]);

  const theme = useTheme();
  const isSm = useMediaQuery(theme.breakpoints.up('sm'));
  const isMd = useMediaQuery(theme.breakpoints.up('md'));
  const isLg = useMediaQuery(theme.breakpoints.up('lg'));
  const isXl = useMediaQuery(theme.breakpoints.up('xl'));
  // Quanto mais larga a tela, mais cards visíveis ao mesmo tempo.
  const perView = Math.min(slides.length, isXl ? 5 : isLg ? 4 : isMd ? 3 : isSm ? 2 : 1);

  const [start, setStart] = useState(0);
  const maxStart = Math.max(0, slides.length - perView);
  const index = Math.min(start, maxStart);
  const go = (next: number) => setStart(Math.min(Math.max(next, 0), maxStart));

  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused || maxStart === 0) return undefined;
    const id = window.setInterval(() => {
      setStart((cur) => (Math.min(cur, maxStart) >= maxStart ? 0 : Math.min(cur, maxStart) + 1));
    }, AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [paused, maxStart]);

  const groups = Array.from(new Set(slides.map((s) => s.group)));
  const activeGroup = slides[Math.min(index, slides.length - 1)].group;
  const cardWidth = 100 / slides.length;

  return (
    <Paper
      data-testid="teacher-area-sections-guide-carousel"
      elevation={2}
      sx={{ p: { xs: 1.5, md: 2.5 }, borderRadius: 3 }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
    >
      <Box sx={{ display: 'flex', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
        {groups.map((g) => {
          const active = activeGroup === g;
          return (
            <Chip
              key={g}
              size="small"
              label={g === 'Guia' ? 'Guia do Professor' : 'Passo a Passo da Aula'}
              color={active ? 'primary' : 'default'}
              variant={active ? 'filled' : 'outlined'}
              onClick={() => go(slides.findIndex((s) => s.group === g))}
            />
          );
        })}
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'stretch', gap: { xs: 0.5, md: 1 } }}>
        <IconButton aria-label="Anterior" onClick={() => go(index - 1)} disabled={index === 0} sx={{ alignSelf: 'center' }}>
          <ChevronLeftIcon />
        </IconButton>

        <Box sx={{ flex: 1, overflow: 'hidden', minWidth: 0 }}>
          <Box
            sx={{
              display: 'flex',
              width: `${(slides.length / perView) * 100}%`,
              transform: `translateX(-${index * cardWidth}%)`,
              transition: 'transform 0.5s ease',
            }}
          >
            {slides.map((slide) => (
              <Box key={slide.title} sx={{ width: `${cardWidth}%`, px: 0.75, boxSizing: 'border-box', display: 'flex' }}>
                <Box
                  sx={{
                    flex: 1,
                    p: 1.5,
                    borderRadius: 2,
                    border: `1px solid ${slide.color}40`,
                    borderTop: `4px solid ${slide.color}`,
                    bgcolor: `${slide.color}0d`,
                  }}
                >
                  <Typography variant="subtitle2" fontWeight="bold" sx={{ color: slide.color }}>
                    {slide.emoji} {slide.title}
                  </Typography>

                  {slide.description && (
                    <Typography variant="body2" sx={{ mt: 0.5, fontSize: '0.85rem' }}>
                      {slide.description}
                    </Typography>
                  )}

                  {slide.items && (
                    <Box component="ul" sx={{ m: 0, mt: 0.5, p: 0, listStyle: 'none' }}>
                      {slide.items.map((item) => (
                        <Typography key={item} component="li" variant="body2" sx={{ py: 0.25, fontSize: '0.85rem' }}>
                          {item}
                        </Typography>
                      ))}
                    </Box>
                  )}

                  {slide.verse && (
                    <Typography
                      variant="caption"
                      sx={{ display: 'block', mt: 1, fontStyle: 'italic', color: 'text.secondary' }}
                    >
                      “{slide.verse.text}”{' '}
                      <b style={{ color: slide.color, fontStyle: 'normal' }}>— {slide.verse.reference}</b>
                    </Typography>
                  )}
                </Box>
              </Box>
            ))}
          </Box>
        </Box>

        <IconButton aria-label="Próximo" onClick={() => go(index + 1)} disabled={index >= maxStart} sx={{ alignSelf: 'center' }}>
          <ChevronRightIcon />
        </IconButton>
      </Box>

      {maxStart > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.75, mt: 1.5 }}>
          {Array.from({ length: maxStart + 1 }, (_, i) => (
            <Box
              key={i}
              role="button"
              aria-label={`Ir para a posição ${i + 1}`}
              onClick={() => go(i)}
              sx={{
                width: i === index ? 18 : 8,
                height: 8,
                borderRadius: 4,
                cursor: 'pointer',
                bgcolor: i === index ? 'primary.main' : '#d0d0d0',
                transition: 'all 0.2s',
              }}
            />
          ))}
        </Box>
      )}
    </Paper>
  );
};

export default TeacherGuideCarousel;
