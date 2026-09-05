import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Grid2,
  useTheme,
  Button,
  TablePagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useMediaQuery,
} from '@mui/material';
import {
} from '@mui/icons-material';
import type { ClubCheckResult, WeekCheckResult } from '../types';
import ClubsListDesktopTable from './ClubsListDesktopTable';
import ClubsListMobileCards from './ClubsListMobileCards';
import {
  severityLabel,
  statusConfigOf,
  weekdayNames,
} from './clubsListShared';


interface ClubsListTableProps {
  clubs: ClubCheckResult[];
  data: WeekCheckResult;
  expandedClubs: Set<string>;
  onToggleExpanded: (clubId: string) => void;
  statusFilter: string;
  severityFilter: string;
  weekdayFilter: string;
  hasProblemsFilter: boolean | null;
  onStatusFilterChange: (value: string) => void;
  onSeverityFilterChange: (value: string) => void;
  onWeekdayFilterChange: (value: string) => void;
  onHasProblemsFilterChange: (value: boolean | null) => void;
  clubsPage: number;
  clubsLimit: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onExpandedClubsReset: () => void;
}


export const ClubsListTable: React.FC<ClubsListTableProps> = ({
  clubs,
  data,
  expandedClubs,
  onToggleExpanded,
  statusFilter,
  severityFilter,
  weekdayFilter,
  hasProblemsFilter,
  onStatusFilterChange,
  onSeverityFilterChange,
  onWeekdayFilterChange,
  onHasProblemsFilterChange,
  clubsPage,
  clubsLimit,
  onPageChange,
  onLimitChange,
  onExpandedClubsReset,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Rótulo e gravidade vêm de `utils.ts`; aqui ficam só as escolhas visuais.
  return (
    <Paper elevation={0} sx={{ borderRadius: 3, overflow: 'hidden', border: `1px solid ${theme.palette.divider}` }}>
      <Box
        sx={{
          p: { xs: 1.5, sm: 2 },
          bgcolor: theme.palette.primary.main,
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1,
        }}
      >
        <Typography variant="h6" fontWeight="bold" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
          📋 Status Detalhado dos Clubinhos
        </Typography>
        <Chip
          label={
            (statusFilter !== 'all' || severityFilter !== 'all' || weekdayFilter !== 'all' || hasProblemsFilter !== null)
              ? `${clubs.length} de ${data?.clubs?.length || 0} clubinhos (filtrados)`
              : `${data?.clubs?.length || 0} de ${data?.pagination?.total || 0} clubinhos`
          }
          sx={{
            bgcolor: 'white',
            color: theme.palette.primary.main,
            fontWeight: 'bold',
            fontSize: { xs: '0.75rem', sm: '0.875rem' }
          }}
        />
      </Box>

      <Box
        sx={{
          p: { xs: 1.5, sm: 2 },
          bgcolor: 'grey.50',
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Grid2 container spacing={{ xs: 1.5, sm: 2 }} alignItems="center">
          <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => onStatusFilterChange(e.target.value)}
              >
                <MenuItem value="all">Todos</MenuItem>
                <MenuItem value="ok">✅ OK</MenuItem>
                <MenuItem value="pending">⏳ Pendente</MenuItem>
                <MenuItem value="partial">⚠️ Parcial</MenuItem>
                <MenuItem value="missing">🔴 Faltando</MenuItem>
                <MenuItem value="exception">ℹ️ Exceção</MenuItem>
                <MenuItem value="inactive">💤 Inativo</MenuItem>
                <MenuItem value="out_of_period">🏖️ Fora do Período</MenuItem>
              </Select>
            </FormControl>
          </Grid2>
          <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Severidade</InputLabel>
              <Select
                value={severityFilter}
                label="Severidade"
                onChange={(e) => onSeverityFilterChange(e.target.value)}
              >
                <MenuItem value="all">Todas</MenuItem>
                <MenuItem value="critical">🔴 Crítico</MenuItem>
                <MenuItem value="warning">⚠️ Aviso</MenuItem>
                <MenuItem value="info">ℹ️ Info</MenuItem>
                <MenuItem value="success">✅ Sucesso</MenuItem>
              </Select>
            </FormControl>
          </Grid2>
          <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Dia da Semana</InputLabel>
              <Select
                value={weekdayFilter}
                label="Dia da Semana"
                onChange={(e) => onWeekdayFilterChange(e.target.value)}
              >
                <MenuItem value="all">Todos</MenuItem>
                <MenuItem value="monday">Segunda-feira</MenuItem>
                <MenuItem value="tuesday">Terça-feira</MenuItem>
                <MenuItem value="wednesday">Quarta-feira</MenuItem>
                <MenuItem value="thursday">Quinta-feira</MenuItem>
                <MenuItem value="friday">Sexta-feira</MenuItem>
                <MenuItem value="saturday">Sábado</MenuItem>
              </Select>
            </FormControl>
          </Grid2>
          <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Problemas</InputLabel>
              <Select
                value={hasProblemsFilter === null ? 'all' : hasProblemsFilter ? 'problems' : 'ok'}
                label="Problemas"
                onChange={(e) => {
                  const value = e.target.value;
                  onHasProblemsFilterChange(value === 'all' ? null : value === 'problems');
                }}
              >
                <MenuItem value="all">Todos</MenuItem>
                <MenuItem value="problems">⚠️ Com Problemas</MenuItem>
                <MenuItem value="ok">✅ Sem Problemas</MenuItem>
              </Select>
            </FormControl>
          </Grid2>
        </Grid2>

        {(statusFilter !== 'all' || severityFilter !== 'all' || weekdayFilter !== 'all' || hasProblemsFilter !== null) && (
          <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              Filtros ativos:
            </Typography>
            {statusFilter !== 'all' && (
              <Chip
                label={`Status: ${statusConfigOf(statusFilter, theme).label || statusFilter}`}
                size="small"
                onDelete={() => onStatusFilterChange('all')}
                color="primary"
                variant="outlined"
              />
            )}
            {severityFilter !== 'all' && (
              <Chip
                label={`Severidade: ${severityLabel(severityFilter)}`}
                size="small"
                onDelete={() => onSeverityFilterChange('all')}
                color="primary"
                variant="outlined"
              />
            )}
            {weekdayFilter !== 'all' && (
              <Chip
                label={`Dia: ${weekdayNames[weekdayFilter.toUpperCase()] || weekdayFilter}`}
                size="small"
                onDelete={() => onWeekdayFilterChange('all')}
                color="primary"
                variant="outlined"
              />
            )}
            {hasProblemsFilter !== null && (
              <Chip
                label={hasProblemsFilter ? 'Com Problemas' : 'Sem Problemas'}
                size="small"
                onDelete={() => onHasProblemsFilterChange(null)}
                color="primary"
                variant="outlined"
              />
            )}
            <Button
              size="small"
              variant="text"
              onClick={() => {
                onStatusFilterChange('all');
                onSeverityFilterChange('all');
                onWeekdayFilterChange('all');
                onHasProblemsFilterChange(null);
              }}
            >
              Limpar Todos
            </Button>
          </Box>
        )}
      </Box>

      {isMobile ? (
        <ClubsListMobileCards
          clubs={clubs}
          data={data}
          expandedClubs={expandedClubs}
          onToggleExpanded={onToggleExpanded}
        />
      ) : (
        <ClubsListDesktopTable
          clubs={clubs}
          data={data}
          expandedClubs={expandedClubs}
          onToggleExpanded={onToggleExpanded}
        />
      )}

      {(data?.pagination || (clubs.length > 0)) && (
        <Box sx={{ borderTop: 1, borderColor: 'divider', px: { xs: 1, sm: 0 } }}>
          <TablePagination
            component="div"
            count={data?.pagination?.total || data?.summary?.totalClubs || clubs.length || 0}
            page={(data?.pagination?.page || clubsPage) - 1}
            onPageChange={(event, newPage) => {
              onPageChange(newPage + 1);
              onExpandedClubsReset();
            }}
            rowsPerPage={data?.pagination?.limit || clubsLimit}
            onRowsPerPageChange={(event) => {
              onLimitChange(parseInt(event.target.value, 10));
              onPageChange(1);
              onExpandedClubsReset();
            }}
            rowsPerPageOptions={[20, 50, 100]}
            labelRowsPerPage="Clubinhos por página:"
            labelDisplayedRows={({ from, to, count }) =>
              `${from}-${to} de ${count !== -1 ? count : `mais de ${to}`}`
            }
            sx={{
              '& .MuiTablePagination-toolbar': {
                flexWrap: 'wrap',
                gap: 1,
                px: { xs: 0, sm: 2 },
              },
              '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
              },
            }}
          />
        </Box>
      )}
    </Paper>
  );
};

