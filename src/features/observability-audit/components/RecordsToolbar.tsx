import type { ReactNode } from 'react';
import { useState } from 'react';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import FilterListIcon from '@mui/icons-material/FilterList';
import RefreshIcon from '@mui/icons-material/Refresh';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import TuneIcon from '@mui/icons-material/Tune';
import {
  Badge,
  Box,
  Button,
  CircularProgress,
  Collapse,
  FormHelperText,
  Grid2,
  Paper,
  Stack,
  TextField,
  Typography,
  alpha,
  useMediaQuery,
  useTheme,
} from '@mui/material';

import DeleteConfirmDialog from '@/components/common/modal/DeleteConfirmDialog';

import { OBSERVABILITY_AUDIT_MESSAGES } from '../constants';
import type { PeriodValidation, RecordsBaseFilters } from '../types';
import { formatDateTime } from '../utils';

/** Altura mínima de toque (44px) e estilização mobile-first dos controles. */
export const TOOLBAR_FIELD_SX = {
  '& .MuiInputBase-root': {
    minHeight: 44,
    borderRadius: 2,
    bgcolor: 'background.paper',
  },
} as const;

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
 * Mobile first: período e botão de atualizar ficam visíveis e com alvos de
 * toque de 44px no celular; filtros avançados ficam recolhidos em telas pequenas.
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
      sx={{
        p: { xs: 1.5, sm: 2, md: 2.5 },
        borderRadius: { xs: 2.5, sm: 3 },
        mb: { xs: 2, md: 3 },
        borderColor: alpha(theme.palette.divider, 0.8),
        background: `linear-gradient(180deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.action.hover, 0.2)} 100%)`,
        boxShadow: `0 2px 12px ${alpha(theme.palette.common.black, 0.03)}`,
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        spacing={1}
        sx={{ mb: 1.5, pb: 1, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}` }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1.75,
              display: 'grid',
              placeItems: 'center',
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: 'primary.main',
              flexShrink: 0,
            }}
          >
            <TuneIcon sx={{ fontSize: 18 }} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.primary', lineHeight: 1.2 }}>
              Filtros e Período
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
              {OBSERVABILITY_AUDIT_MESSAGES.timezoneNote} ({timeZone})
            </Typography>
          </Box>
        </Stack>

        {canDelete && wide && (
          <Button
            data-testid={testIds.deleteRange}
            color="error"
            variant="outlined"
            size="small"
            startIcon={<DeleteSweepIcon />}
            onClick={() => setConfirmingRange(true)}
            disabled={!period.ok || deleting}
            sx={{
              minHeight: 36,
              borderRadius: 2,
              px: 2,
              fontWeight: 700,
              textTransform: 'none',
              bgcolor: alpha(theme.palette.error.main, 0.04),
              borderColor: alpha(theme.palette.error.main, 0.3),
              '&:hover': {
                bgcolor: alpha(theme.palette.error.main, 0.1),
                borderColor: 'error.main',
              },
            }}
          >
            {OBSERVABILITY_AUDIT_MESSAGES.deleteRange}
          </Button>
        )}
      </Stack>

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
            slotProps={{
              inputLabel: { shrink: true },
              htmlInput: { 'aria-label': 'Início do período' },
            }}
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
            slotProps={{
              inputLabel: { shrink: true },
              htmlInput: { 'aria-label': 'Fim do período' },
            }}
            sx={TOOLBAR_FIELD_SX}
          />
        </Grid2>

        <Grid2 size={{ xs: 12, md: 6 }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            justifyContent={{ md: 'flex-end' }}
            sx={{ width: '100%' }}
          >
            {!wide && (
              <Badge badgeContent={activeFilters} color="primary" sx={{ display: 'flex', width: '100%' }}>
                <Button
                  variant="outlined"
                  startIcon={<FilterListIcon />}
                  onClick={() => setExpanded((value) => !value)}
                  aria-expanded={expanded}
                  aria-controls={`${idPrefix}-advanced`}
                  fullWidth
                  sx={{
                    minHeight: 44,
                    borderRadius: 2.25,
                    fontWeight: 700,
                    textTransform: 'none',
                  }}
                >
                  {expanded ? OBSERVABILITY_AUDIT_MESSAGES.lessFilters : OBSERVABILITY_AUDIT_MESSAGES.moreFilters}
                </Button>
              </Badge>
            )}

            <Button
              variant="outlined"
              startIcon={<RestartAltIcon />}
              onClick={onClear}
              disabled={activeFilters === 0}
              sx={{
                minHeight: 44,
                borderRadius: 2.25,
                fontWeight: 600,
                textTransform: 'none',
                px: 2,
                width: { xs: '100%', sm: 'auto' },
                borderColor: alpha(theme.palette.divider, 0.8),
                color: 'text.secondary',
                '&:hover': {
                  borderColor: 'text.primary',
                  bgcolor: 'action.hover',
                },
              }}
            >
              {OBSERVABILITY_AUDIT_MESSAGES.clearFilters}
            </Button>

            <Button
              data-testid={testIds.refresh}
              type="submit"
              variant="contained"
              startIcon={refreshing ? <CircularProgress size={18} color="inherit" /> : <RefreshIcon />}
              disabled={refreshing || !period.ok}
              sx={{
                minHeight: 44,
                borderRadius: 2.25,
                px: 3,
                fontWeight: 800,
                textTransform: 'none',
                width: { xs: '100%', sm: 'auto' },
                background: 'linear-gradient(135deg, #009933 0%, #007a29 100%)',
                boxShadow: '0 4px 14px rgba(0, 153, 51, 0.25)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #007a29 0%, #005c1f 100%)',
                  boxShadow: '0 6px 18px rgba(0, 153, 51, 0.35)',
                },
                transition: 'all 0.2s ease',
              }}
            >
              {OBSERVABILITY_AUDIT_MESSAGES.refresh}
            </Button>
          </Stack>
        </Grid2>

        {periodError ? (
          <Grid2 size={12}>
            <FormHelperText data-testid={testIds.periodError} error role="alert" sx={{ mx: 0, fontWeight: 600 }}>
              {periodError}
            </FormHelperText>
          </Grid2>
        ) : null}
      </Grid2>

      <Collapse in={showAdvanced} id={`${idPrefix}-advanced`} unmountOnExit={false}>
        <Box
          sx={{
            mt: 1.5,
            pt: 1.5,
            borderTop: `1px dashed ${alpha(theme.palette.divider, 0.6)}`,
          }}
        >
          <Grid2 container spacing={1.5}>
            <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
              <TextField
                id={`${idPrefix}-request-id`}
                label="ID da requisição"
                value={base.requestId}
                onChange={(event) => onBaseChange({ ...base, requestId: event.target.value })}
                placeholder="UUID do cabeçalho X-Request-Id"
                fullWidth
                size="small"
                slotProps={{
                  htmlInput: { 'aria-label': 'ID da requisição', spellCheck: false },
                }}
                sx={TOOLBAR_FIELD_SX}
              />
            </Grid2>

            <Grid2 size={{ xs: 12, md: 8 }}>{children}</Grid2>

            {canDelete && !wide && (
              <Grid2 size={12}>
                <Button
                  data-testid={testIds.deleteRange}
                  color="error"
                  variant="outlined"
                  startIcon={<DeleteSweepIcon />}
                  onClick={() => setConfirmingRange(true)}
                  disabled={!period.ok || deleting}
                  fullWidth
                  sx={{
                    minHeight: 44,
                    borderRadius: 2.25,
                    fontWeight: 700,
                    textTransform: 'none',
                    bgcolor: alpha(theme.palette.error.main, 0.04),
                  }}
                >
                  {OBSERVABILITY_AUDIT_MESSAGES.deleteRange}
                </Button>
              </Grid2>
            )}
          </Grid2>
        </Box>
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
