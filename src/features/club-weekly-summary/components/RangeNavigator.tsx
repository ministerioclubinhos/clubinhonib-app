import {
  Box,
  Button,
  IconButton,
  Paper,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useTheme,
} from '@mui/material';
import { ChevronLeft, ChevronRight, MyLocation } from '@mui/icons-material';

import {
  RANGE_CURRENT_LABELS,
  RANGE_GRANULARITIES,
  RANGE_GRANULARITY_LABELS,
} from '../constants';
import { RangeGranularity, type WeekRange } from '../types';

interface RangeNavigatorProps {
  granularity: RangeGranularity;
  onGranularityChange: (granularity: RangeGranularity) => void;
  range: WeekRange | null;
  /** Posição do recorte atual e quantos existem, para os limites da navegação. */
  index: number;
  total: number;
  onIndexChange: (index: number) => void;
  /** Índice do recorte que contém hoje; habilita o atalho de voltar. */
  currentIndex: number;
}

/**
 * A visão escolhida e por onde ela está passando.
 *
 * Semana, mês, trimestre ou ano — e dentro da visão, um passo de cada vez. A
 * tela abre no recorte de hoje; as setas andam para trás e para a frente, e o
 * atalho traz de volta. Uma lista com quarenta semanas de uma vez não é
 * navegação, é rolagem.
 */
export function RangeNavigator({
  granularity,
  onGranularityChange,
  range,
  index,
  total,
  onIndexChange,
  currentIndex,
}: RangeNavigatorProps) {
  const theme = useTheme();

  return (
    <Paper
      data-testid="club-weekly-summary-range-navigator"
      elevation={0}
      sx={{
        p: { xs: 1.25, sm: 1.5 },
        borderRadius: 3,
        border: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={{ xs: 1, md: 1.5 }}
        alignItems={{ xs: 'stretch', md: 'center' }}
      >
        <ToggleButtonGroup
          exclusive
          size="small"
          value={granularity}
          onChange={(_event, value: RangeGranularity | null) => {
            if (value) onGranularityChange(value);
          }}
          aria-label="Período mostrado"
          sx={{
            '& .MuiToggleButton-root': {
              minHeight: 44,
              // No celular os quatro botões dividem a largura em partes iguais;
              // no desktop cada um ocupa só o texto.
              flex: { xs: 1, md: 'none' },
              px: { xs: 0.5, sm: 2 },
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              textTransform: 'none',
            },
          }}
        >
          {RANGE_GRANULARITIES.map((option) => (
            <ToggleButton
              key={option}
              value={option}
              data-testid={`club-weekly-summary-granularity-${option}`}
            >
              {RANGE_GRANULARITY_LABELS[option]}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>

        <Stack
          direction="row"
          alignItems="center"
          spacing={0.5}
          sx={{ flex: 1, justifyContent: { md: 'flex-end' } }}
        >
          <IconButton
            aria-label="Período anterior"
            data-testid="club-weekly-summary-range-previous"
            disabled={index <= 0}
            onClick={() => onIndexChange(index - 1)}
            sx={{ width: 44, height: 44, flexShrink: 0 }}
          >
            <ChevronLeft />
          </IconButton>

          <Box sx={{ flex: 1, textAlign: 'center', minWidth: 0 }}>
            <Typography
              data-testid="club-weekly-summary-range-label"
              variant="subtitle1"
              fontWeight={700}
              noWrap
            >
              {range?.label ?? '—'}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              noWrap
              sx={{ display: 'block' }}
            >
              {range?.caption ?? 'Nenhum período a mostrar'}
            </Typography>
          </Box>

          <IconButton
            aria-label="Próximo período"
            data-testid="club-weekly-summary-range-next"
            disabled={index >= total - 1}
            onClick={() => onIndexChange(index + 1)}
            sx={{ width: 44, height: 44, flexShrink: 0 }}
          >
            <ChevronRight />
          </IconButton>

          {/*
            No desktop o atalho fica ao lado das setas. No celular ele desce
            para a própria linha, largo o bastante para o polegar — espremido
            entre as setas, o rótulo do período não caberia.
          */}
          <Button
            type="button"
            size="small"
            startIcon={<MyLocation />}
            onClick={() => onIndexChange(currentIndex)}
            disabled={index === currentIndex}
            data-testid="club-weekly-summary-range-current"
            sx={{
              display: { xs: 'none', md: 'inline-flex' },
              minHeight: 44,
              whiteSpace: 'nowrap',
            }}
          >
            {RANGE_CURRENT_LABELS[granularity]}
          </Button>
        </Stack>

        <Button
          type="button"
          fullWidth
          size="small"
          variant="outlined"
          startIcon={<MyLocation />}
          onClick={() => onIndexChange(currentIndex)}
          disabled={index === currentIndex}
          data-testid="club-weekly-summary-range-current-mobile"
          sx={{ display: { xs: 'inline-flex', md: 'none' }, minHeight: 44 }}
        >
          {RANGE_CURRENT_LABELS[granularity]}
        </Button>
      </Stack>
    </Paper>
  );
}
