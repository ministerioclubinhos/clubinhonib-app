import {
  Button,
  FormControlLabel,
  Grid2,
  MenuItem,
  Stack,
  Switch,
  TextField,
} from '@mui/material';
import { Refresh } from '@mui/icons-material';

import { weekdayLabel } from '@/utils/dateUtils';

import { ALL_CLUBS_OPTION } from '../constants';
import type { ClubWeeklySummaryClub } from '../types';

interface SummaryFiltersProps {
  years: number[];
  year: number | null;
  onYearChange: (year: number) => void;
  clubs: ClubWeeklySummaryClub[];
  clubId: string;
  onClubChange: (clubId: string) => void;
  showFutureWeeks: boolean;
  onShowFutureWeeksChange: (show: boolean) => void;
  /** Quantos clubinhos desativados existem no recorte; 0 esconde o controle. */
  inactiveClubCount: number;
  showInactiveClubs: boolean;
  onShowInactiveClubsChange: (show: boolean) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

/**
 * Ano letivo, clubinho e o que aparece além do que já aconteceu.
 *
 * No celular os dois seletores dividem a primeira linha — empilhados, eles
 * sozinhos ocupavam meia tela antes de qualquer número aparecer. Os
 * interruptores e o botão vêm abaixo, quebrando linha conforme couberem.
 */
export function SummaryFilters({
  years,
  year,
  onYearChange,
  clubs,
  clubId,
  onClubChange,
  showFutureWeeks,
  onShowFutureWeeksChange,
  inactiveClubCount,
  showInactiveClubs,
  onShowInactiveClubsChange,
  onRefresh,
  isRefreshing,
}: SummaryFiltersProps) {
  return (
    <Grid2
      data-testid="club-weekly-summary-filters"
      container
      spacing={1}
      alignItems="center"
    >
      <Grid2 size={{ xs: 5, sm: 3, md: 2 }}>
        <TextField
          select
          fullWidth
          size="small"
          label="Ano"
          value={year ?? ''}
          onChange={(event) => onYearChange(Number(event.target.value))}
          disabled={years.length === 0}
          slotProps={{ htmlInput: { 'data-testid': 'club-weekly-summary-year-input' } }}
        >
          {years.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </TextField>
      </Grid2>

      <Grid2 size={{ xs: 7, sm: 6, md: 4 }}>
        <TextField
          select
          fullWidth
          size="small"
          label="Clubinho"
          value={clubId}
          onChange={(event) => onClubChange(event.target.value)}
          slotProps={{ htmlInput: { 'data-testid': 'club-weekly-summary-club-input' } }}
        >
          <MenuItem value={ALL_CLUBS_OPTION}>Todos os meus clubinhos</MenuItem>
          {clubs.map((club) => (
            <MenuItem key={club.clubId} value={club.clubId}>
              Clubinho {club.clubNumber} · {weekdayLabel(club.weekday)}
              {club.isActive ? '' : ' (desativado)'}
            </MenuItem>
          ))}
        </TextField>
      </Grid2>

      <Grid2 size={{ xs: 12, md: 6 }}>
        <Stack
          direction="row"
          alignItems="center"
          flexWrap="wrap"
          useFlexGap
          spacing={1}
          sx={{ rowGap: 0.5, justifyContent: { md: 'flex-end' } }}
        >
          <FormControlLabel
            control={
              <Switch
                checked={showFutureWeeks}
                onChange={(event) => onShowFutureWeeksChange(event.target.checked)}
                inputProps={
                  { 'data-testid': 'club-weekly-summary-future-switch' } as React.InputHTMLAttributes<HTMLInputElement>
                }
              />
            }
            label="Semanas futuras"
            slotProps={{ typography: { variant: 'body2' } }}
            sx={{ mr: 0 }}
          />

          {inactiveClubCount > 0 && (
            <FormControlLabel
              control={
                <Switch
                  checked={showInactiveClubs}
                  onChange={(event) => onShowInactiveClubsChange(event.target.checked)}
                  inputProps={
                    { 'data-testid': 'club-weekly-summary-inactive-switch' } as React.InputHTMLAttributes<HTMLInputElement>
                  }
                />
              }
              label={`${inactiveClubCount} desativado(s)`}
              slotProps={{ typography: { variant: 'body2' } }}
              sx={{ mr: 0 }}
            />
          )}

          <Button
            type="button"
            variant="outlined"
            size="small"
            startIcon={<Refresh />}
            onClick={onRefresh}
            disabled={isRefreshing}
            data-testid="club-weekly-summary-refresh"
            sx={{ minHeight: 44, ml: { xs: 'auto', md: 0 } }}
          >
            {isRefreshing ? 'Atualizando…' : 'Atualizar'}
          </Button>
        </Stack>
      </Grid2>
    </Grid2>
  );
}
