import type { ReactNode } from 'react';
import { useState } from 'react';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import FilterListIcon from '@mui/icons-material/FilterList';
import RefreshIcon from '@mui/icons-material/Refresh';
import {
  Badge,
  Button,
  CircularProgress,
  Collapse,
  FormHelperText,
  Grid2,
  Paper,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';

import DeleteConfirmDialog from '@/components/common/modal/DeleteConfirmDialog';

import { OBSERVABILITY_AUDIT_MESSAGES } from '../constants';
import type { PeriodValidation, RecordsBaseFilters } from '../types';
import { formatDateTime } from '../utils';

/** Altura mínima de toque de todo controle da toolbar. */
export const TOOLBAR_FIELD_SX = { '& .MuiInputBase-root': { minHeight: 44 } } as const;

interface RecordsToolbarProps {
  /** Prefixo dos ids de campo, para os rótulos não colidirem entre as abas. */
  idPrefix: string;
  testIds: { toolbar: string; refresh: string; periodError: string; deleteRange: string };
  base: RecordsBaseFilters;
  period: PeriodValidation;
  timeZone: string;
  refreshing: boolean;
  /** Quantos filtros opcionais estão ativos; aparece no badge de "Mais filtros". */
  activeFilters: number;
  onBaseChange: (next: RecordsBaseFilters) => void;
  onRefresh: () => void;
  onClear: () => void;
  /** Apaga tudo desta aba no período atual; resolve quando a API respondeu. */
  onDeleteRange: () => Promise<void>;
  deleting: boolean;
  /** Sem storage consultável, excluir também não existe. */
  canDelete: boolean;
  /** Filtros próprios da aba, renderizados na área recolhível. */
  children: ReactNode;
}

/**
 * Toolbar de filtros de uma aba.
 *
 * Mobile first: o período e o botão de atualizar ficam sempre à mão; o
 * `requestId` e os filtros próprios da aba ficam numa área recolhida no
 * celular (abertos a partir de `md`), com um badge dizendo quantos estão
 * ativos. Cada aba tem a sua: trocar filtros de uma não mexe na outra.
 */
export default function RecordsToolbar({
  idPrefix,
  testIds,
  base,
  period,
  timeZone,
  refreshing,
  activeFilters,
  onBaseChange,
  onRefresh,
  onClear,
  onDeleteRange,
  deleting,
  canDelete,
  children,
}: RecordsToolbarProps) {
  const theme = useTheme();
  const wide = useMediaQuery(theme.breakpoints.up('md'));
  const [expanded, setExpanded] = useState(false);
  const [confirmingRange, setConfirmingRange] = useState(false);
  const showAdvanced = wide || expanded;
  const periodError = period.ok ? '' : period.message;

  const confirmDeleteRange = async () => {
    await onDeleteRange();
    setConfirmingRange(false);
  };

  return (
    <Paper
      data-testid={testIds.toolbar}
      component="form"
      role="search"
      aria-label="Filtros"
      variant="outlined"
      onSubmit={(event) => {
        event.preventDefault();
        onRefresh();
      }}
      sx={{ p: { xs: 1.5, sm: 2 }, borderRadius: 2, mb: 2 }}
    >
      <Grid2 container spacing={1.5} alignItems="flex-start">
        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
          <TextField
            id={`${idPrefix}-from`}
            label="Início"
            type="datetime-local"
            value={base.from}
            onChange={(event) => onBaseChange({ ...base, from: event.target.value })}
            error={Boolean(periodError)}
            fullWidth
            size="small"
            slotProps={{ inputLabel: { shrink: true }, htmlInput: { 'aria-label': 'Início do período' } }}
            sx={TOOLBAR_FIELD_SX}
          />
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
          <TextField
            id={`${idPrefix}-to`}
            label="Fim"
            type="datetime-local"
            value={base.to}
            onChange={(event) => onBaseChange({ ...base, to: event.target.value })}
            error={Boolean(periodError)}
            fullWidth
            size="small"
            slotProps={{ inputLabel: { shrink: true }, htmlInput: { 'aria-label': 'Fim do período' } }}
            sx={TOOLBAR_FIELD_SX}
          />
        </Grid2>
        <Grid2 size={{ xs: 12, md: 6 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} justifyContent={{ md: 'flex-end' }}>
            {!wide && (
              <Badge badgeContent={activeFilters} color="primary" sx={{ display: 'flex' }}>
                <Button
                  variant="outlined"
                  startIcon={<FilterListIcon />}
                  onClick={() => setExpanded((value) => !value)}
                  aria-expanded={expanded}
                  aria-controls={`${idPrefix}-advanced`}
                  fullWidth
                  sx={{ minHeight: 44 }}
                >
                  {expanded ? OBSERVABILITY_AUDIT_MESSAGES.lessFilters : OBSERVABILITY_AUDIT_MESSAGES.moreFilters}
                </Button>
              </Badge>
            )}
            <Button
              variant="text"
              onClick={onClear}
              disabled={activeFilters === 0}
              sx={{ minHeight: 44 }}
            >
              {OBSERVABILITY_AUDIT_MESSAGES.clearFilters}
            </Button>
            <Button
              data-testid={testIds.refresh}
              type="submit"
              variant="contained"
              startIcon={refreshing ? <CircularProgress size={16} color="inherit" /> : <RefreshIcon />}
              disabled={refreshing || !period.ok}
              sx={{ minHeight: 44 }}
            >
              {OBSERVABILITY_AUDIT_MESSAGES.refresh}
            </Button>
          </Stack>
        </Grid2>
        <Grid2 size={12}>
          {periodError ? (
            <FormHelperText data-testid={testIds.periodError} error role="alert" sx={{ mx: 0 }}>
              {periodError}
            </FormHelperText>
          ) : (
            <Typography variant="caption" color="text.secondary">
              {OBSERVABILITY_AUDIT_MESSAGES.timezoneNote} ({timeZone}).
            </Typography>
          )}
        </Grid2>
      </Grid2>

      <Collapse in={showAdvanced} id={`${idPrefix}-advanced`} unmountOnExit={false}>
        <Grid2 container spacing={1.5} sx={{ mt: 1 }}>
          <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
            <TextField
              id={`${idPrefix}-request-id`}
              label="ID da requisição"
              value={base.requestId}
              onChange={(event) => onBaseChange({ ...base, requestId: event.target.value })}
              placeholder="UUID do cabeçalho X-Request-Id"
              fullWidth
              size="small"
              slotProps={{ htmlInput: { 'aria-label': 'ID da requisição', spellCheck: false } }}
              sx={TOOLBAR_FIELD_SX}
            />
          </Grid2>
          <Grid2 size={{ xs: 12, md: 8 }}>{children}</Grid2>
          {canDelete && (
            <Grid2 size={12} sx={{ display: 'flex', justifyContent: { xs: 'stretch', sm: 'flex-end' } }}>
              <Button
                data-testid={testIds.deleteRange}
                color="error"
                variant="outlined"
                startIcon={<DeleteSweepIcon />}
                onClick={() => setConfirmingRange(true)}
                disabled={!period.ok || deleting}
                fullWidth={!wide}
                sx={{ minHeight: 44 }}
              >
                {OBSERVABILITY_AUDIT_MESSAGES.deleteRange}
              </Button>
            </Grid2>
          )}
        </Grid2>
      </Collapse>

      <DeleteConfirmDialog
        open={confirmingRange}
        title={
          period.ok
            ? OBSERVABILITY_AUDIT_MESSAGES.deleteRangeTitle(formatDateTime(period.from), formatDateTime(period.to))
            : OBSERVABILITY_AUDIT_MESSAGES.deleteRange
        }
        loading={deleting}
        onClose={() => setConfirmingRange(false)}
        onConfirm={confirmDeleteRange}
      />
    </Paper>
  );
}
