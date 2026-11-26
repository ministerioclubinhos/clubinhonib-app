import React, { useEffect, useMemo, useState } from 'react';
import { Paper, Box, Typography, IconButton, Chip, Stack, useMediaQuery, useTheme } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CompassCalibrationOutlinedIcon from '@mui/icons-material/CompassCalibrationOutlined';
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

const AUTOPLAY_MS = 6500;

interface Props {
  showSteps?: boolean;
}

const TeacherGuideCarousel: React.FC<Props> = ({ showSteps = true }) => {
  const slides = useMemo<Slide[]>(() => {
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
    const guide: Slide[] = SECTION_DATA.map((s) => ({
      group: 'Guia',
      emoji: SECTION_EMOJI[s.icon] ?? '📌',
      title: s.title,
      color: s.color,
      items: s.items,
      verse: s.verse,
    }));
    return [...steps, ...guide];
  }, [showSteps]);

  const theme = useTheme();
  const isSm = useMediaQuery(theme.breakpoints.up('sm'));
  const isMd = useMediaQuery(theme.breakpoints.up('md'));
  const isLg = useMediaQuery(theme.breakpoints.up('lg'));
  const perView = Math.min(slides.length, isLg ? 4 : isMd ? 3 : isSm ? 2 : 1);

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
  const activeGroup = slides[Math.min(index, slides.length - 1)]?.group;
  const cardWidth = 100 / slides.length;

  return (
    <Paper
      data-testid="teacher-area-sections-guide-carousel"
      elevation={0}
      sx={{
        p: { xs: 2, sm: 2.5, md: 3 },
        borderRadius: 3.5,
        bgcolor: '#ffffff',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 18px rgba(15, 23, 42, 0.04)',
      }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          gap: 1.5,
          mb: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: 2,
              bgcolor: '#eff6ff',
              color: '#1d4ed8',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <CompassCalibrationOutlinedIcon sx={{ fontSize: 22 }} />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={800} sx={{ fontSize: { xs: '1rem', md: '1.15rem' }, color: '#0f172a', lineHeight: 1.2 }}>
              Roteiro Pedagógico & Guia do Professor
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b' }}>
              Os 5 passos da aula no Clubinho e orientações práticas para o seu ministério
            </Typography>
          </Box>
        </Box>

        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
          {groups.map((g) => {
            const active = activeGroup === g;
            return (
              <Chip
                key={g}
                size="small"
                label={g === 'Guia' ? 'Orientações & Dicas' : 'Passo a Passo da Aula'}
                color={active ? 'primary' : 'default'}
                variant={active ? 'filled' : 'outlined'}
                onClick={() => go(slides.findIndex((s) => s.group === g))}
                sx={{ fontWeight: 700 }}
              />
            );
          })}
          <Stack direction="row" spacing={0.5}>
            <IconButton
              size="small"
              aria-label="Anterior"
              onClick={() => go(index - 1)}
              disabled={index === 0}
              sx={{ border: '1px solid #e2e8f0' }}
            >
              <ChevronLeftIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              aria-label="Próximo"
              onClick={() => go(index + 1)}
              disabled={index >= maxStart}
              sx={{ border: '1px solid #e2e8f0' }}
            >
              <ChevronRightIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Stack>
      </Box>

      <Box sx={{ overflow: 'hidden', minWidth: 0 }}>
        <Box
          sx={{
            display: 'flex',
            width: `${(slides.length / perView) * 100}%`,
            transform: `translateX(-${index * cardWidth}%)`,
            transition: 'transform 0.45s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {slides.map((slide) => (
            <Box key={slide.title} sx={{ width: `${cardWidth}%`, px: 0.75, boxSizing: 'border-box', display: 'flex' }}>
              <Box
                sx={{
                  flex: 1,
                  p: 2,
                  borderRadius: 2.5,
                  border: '1px solid #e2e8f0',
                  borderTop: `4px solid ${slide.color}`,
                  bgcolor: '#f8fafc',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <Box>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                    <Typography variant="subtitle2" fontWeight={800} sx={{ color: slide.color, fontSize: '0.95rem' }}>
                      {slide.emoji} {slide.title}
                    </Typography>
                    <Chip
                      label={slide.group}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        bgcolor: `${slide.color}15`,
                        color: slide.color,
                      }}
                    />
                  </Stack>

                  {slide.description && (
                    <Typography variant="body2" sx={{ color: '#334155', fontSize: '0.86rem', lineHeight: 1.55 }}>
                      {slide.description}
                    </Typography>
                  )}

                  {slide.items && (
                    <Box component="ul" sx={{ m: 0, p: 0, listStyle: 'none' }}>
                      {slide.items.map((item) => (
                        <Typography
                          key={item}
                          component="li"
                          variant="body2"
                          sx={{ py: 0.3, color: '#334155', fontSize: '0.84rem', lineHeight: 1.45 }}
                        >
                          {item}
                        </Typography>
                      ))}
                    </Box>
                  )}
                </Box>

                {slide.verse && (
                  <Box
                    sx={{
                      mt: 1.5,
                      pt: 1,
                      borderTop: '1px dashed #cbd5e1',
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{ display: 'block', fontStyle: 'italic', color: '#475569', lineHeight: 1.4 }}
                    >
                      “{slide.verse.text}”{' '}
                      <Box component="span" sx={{ color: slide.color, fontStyle: 'normal', fontWeight: 700 }}>
                        — {slide.verse.reference}
                      </Box>
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          ))}
        </Box>
      </Box>

      {maxStart > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.75, mt: 2 }}>
          {Array.from({ length: maxStart + 1 }, (_, i) => (
            <Box
              key={i}
              role="button"
              aria-label={`Ir para a posição ${i + 1}`}
              onClick={() => go(i)}
              sx={{
                width: i === index ? 20 : 8,
                height: 8,
                borderRadius: 4,
                cursor: 'pointer',
                bgcolor: i === index ? 'primary.main' : '#cbd5e1',
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
