import React from 'react';
import {
  Box,
  Paper,
  Typography,
  TablePagination,
  Chip,
  CircularProgress,
  TextField,
  MenuItem,
  Grid2,
  Button,
  Collapse,
  IconButton,
  useTheme,
  useMediaQuery,
  Skeleton,
} from '@mui/material';
import {
  ExpandMore,
  ExpandLess,
  FilterList,
  Refresh,
} from '@mui/icons-material';
import { useChildren } from '../hooks';
import type { ChildrenStatsQueryDto } from '../types';
import { PeriodFilter } from './PeriodFilter';
import { getPeriodDates } from '../utils/periodHelpers';
import ChildrenListDesktop from './ChildrenListDesktop';
import ChildrenListMobile from './ChildrenListMobile';

export const ChildrenListView: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [filters, setFilters] = React.useState<ChildrenStatsQueryDto>({
    page: 1,
    limit: isMobile ? 5 : 20,
    sortBy: 'engagementScore',
    sortOrder: 'DESC',
  });

  React.useEffect(() => {
    const newLimit = isMobile ? 5 : 20;
    if (filters.limit !== newLimit) {
      setFilters({ ...filters, limit: newLimit, page: 1 });
    }
  }, [isMobile]);
  const [filtersExpanded, setFiltersExpanded] = React.useState(false);

  const { data, isLoading } = useChildren(filters);

  const handleFilterChange = <K extends keyof ChildrenStatsQueryDto>(
    field: K,
    value: ChildrenStatsQueryDto[K],
  ) => {
    setFilters({ ...filters, [field]: value || undefined, page: 1 });
  };

  const handlePageChange = (event: unknown, newPage: number) => {
    setFilters({ ...filters, page: newPage + 1 });
  };

  const handleLimitChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, limit: parseInt(event.target.value, 10), page: 1 });
  };

  const handleReset = () => {
    setFilters({ page: 1, limit: 20, sortBy: 'engagementScore', sortOrder: 'DESC' });
  };

  if (!data && !isLoading) {
    return (
      <Paper elevation={3} sx={{ p: { xs: 1.5, sm: 3 }, borderRadius: 3 }}>
        <Typography color="error">Erro ao carregar crianças</Typography>
      </Paper>
    );
  }

  return (
    <Box sx={{ width: '100%', maxWidth: '100%', overflowX: 'hidden' }}>

      <Grid2 container spacing={{ xs: 1.5, sm: 2 }} sx={{ mb: 3, width: '100%', maxWidth: '100%', margin: 0 }}>
        <Grid2 size={{ xs: 6, sm: 6, md: 2.4 }} sx={{ width: '100%', maxWidth: '100%' }}>
          <Paper elevation={0} sx={{
            p: { xs: 1.5, sm: 2 },
            borderRadius: 2,
            border: `2px solid ${theme.palette.divider}`,
            width: '100%',
            maxWidth: '100%',
            overflow: 'hidden',
          }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>Total Filtrado</Typography>
            {isLoading || !data ? <Skeleton width="60%" height={32} /> : (
              <Typography variant="h5" fontWeight="bold" color="primary" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' }, wordBreak: 'break-word' }}>
                {data.summary.filteredChildren}
              </Typography>
            )}
            {isLoading || !data ? <Skeleton width="40%" height={16} /> : (
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' }, wordBreak: 'break-word' }}>
                de {data.summary.totalChildren}
              </Typography>
            )}
          </Paper>
        </Grid2>
        <Grid2 size={{ xs: 6, sm: 6, md: 2.4 }} sx={{ width: '100%', maxWidth: '100%' }}>
          <Paper elevation={0} sx={{
            p: { xs: 1.5, sm: 2 },
            borderRadius: 2,
            border: `2px solid ${theme.palette.divider}`,
            width: '100%',
            maxWidth: '100%',
            overflow: 'hidden',
          }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>Idade Média</Typography>
            {isLoading || !data ? <Skeleton width="60%" height={32} /> : (
              <Typography variant="h5" fontWeight="bold" color="info.main" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' }, wordBreak: 'break-word' }}>
                {data.summary.avgAge.toFixed(1)} anos
              </Typography>
            )}
          </Paper>
        </Grid2>
        <Grid2 size={{ xs: 6, sm: 6, md: 2.4 }} sx={{ width: '100%', maxWidth: '100%' }}>
          <Paper elevation={0} sx={{
            p: { xs: 1.5, sm: 2 },
            borderRadius: 2,
            border: `2px solid ${theme.palette.divider}`,
            width: '100%',
            maxWidth: '100%',
            overflow: 'hidden',
          }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>Engajamento Médio</Typography>
            {isLoading || !data ? <Skeleton width="60%" height={32} /> : (
              <Typography variant="h5" fontWeight="bold" color="success.main" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' }, wordBreak: 'break-word' }}>
                {data.summary.avgEngagementScore.toFixed(1)}%
              </Typography>
            )}
          </Paper>
        </Grid2>
        <Grid2 size={{ xs: 6, sm: 6, md: 2.4 }} sx={{ width: '100%', maxWidth: '100%' }}>
          <Paper elevation={0} sx={{
            p: { xs: 1.5, sm: 2 },
            borderRadius: 2,
            border: `2px solid ${theme.palette.divider}`,
            width: '100%',
            maxWidth: '100%',
            overflow: 'hidden',
          }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>Presença Média</Typography>
            {isLoading || !data ? <Skeleton width="60%" height={32} /> : (
              <Typography variant="h5" fontWeight="bold" color="secondary.main" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' }, wordBreak: 'break-word' }}>
                {data.summary.avgPresenceRate.toFixed(1)}%
              </Typography>
            )}
          </Paper>
        </Grid2>
        <Grid2 size={{ xs: 6, sm: 6, md: 2.4 }} sx={{ width: '100%', maxWidth: '100%' }}>
          <Paper elevation={0} sx={{
            p: { xs: 1.5, sm: 2 },
            borderRadius: 2,
            border: `2px solid ${theme.palette.divider}`,
            width: '100%',
            maxWidth: '100%',
            overflow: 'hidden',
          }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>Com Decisão</Typography>
            {isLoading || !data ? <Skeleton width="60%" height={32} /> : (
              <Typography variant="h5" fontWeight="bold" color="warning.main" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' }, wordBreak: 'break-word' }}>
                {data.summary.childrenWithDecisions}
              </Typography>
            )}
          </Paper>
        </Grid2>
      </Grid2>

      <Paper elevation={0} sx={{ p: 2, borderRadius: 2, mb: 2, border: `1px solid ${theme.palette.divider}` }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: filtersExpanded ? 2 : 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FilterList />
            <Typography variant="subtitle1" fontWeight="bold">Filtros</Typography>
            {data?.filters?.summary && (
              <Chip label={data.filters.summary} size="small" variant="outlined" />
            )}
          </Box>
          <Box>
            <Button size="small" startIcon={<Refresh />} onClick={handleReset}>Limpar</Button>
            <IconButton size="small" onClick={() => setFiltersExpanded(!filtersExpanded)} aria-label="Mostrar ou esconder os filtros">
              {filtersExpanded ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </Box>
        </Box>

        <Collapse in={filtersExpanded}>
          <Grid2 container spacing={2}>

            <Grid2 size={12}>
              <PeriodFilter
                period={filters.period}
                startDate={filters.startDate}
                endDate={filters.endDate}
                onPeriodChange={(period) => {
                  const dates = getPeriodDates(period);
                  setFilters({
                    ...filters,
                    period,
                    startDate: dates?.startDate,
                    endDate: dates?.endDate,
                    page: 1,
                  });
                }}
                onStartDateChange={(startDate) => handleFilterChange('startDate', startDate)}
                onEndDateChange={(endDate) => handleFilterChange('endDate', endDate)}
              />
            </Grid2>

            <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
              <TextField
                fullWidth
                label="Buscar por nome"
                placeholder="Digite o nome da criança..."
                value={filters.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                size="small"
              />
            </Grid2>

            <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                select
                label="Gênero"
                value={filters.gender || ''}
                onChange={(e) => handleFilterChange(
                    'gender',
                    e.target.value as ChildrenStatsQueryDto['gender'],
                  )}
                size="small"
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="M">Masculino</MenuItem>
                <MenuItem value="F">Feminino</MenuItem>
              </TextField>
            </Grid2>

            <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                type="number"
                label="Idade Mínima"
                value={filters.minAge || ''}
                onChange={(e) => handleFilterChange('minAge', e.target.value ? Number(e.target.value) : undefined)}
                size="small"
              />
            </Grid2>

            <Grid2 size={{ xs: 12, sm: 6, md: 2 }}>
              <TextField
                fullWidth
                type="number"
                label="Idade Máxima"
                value={filters.maxAge || ''}
                onChange={(e) => handleFilterChange('maxAge', e.target.value ? Number(e.target.value) : undefined)}
                size="small"
              />
            </Grid2>

            <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                select
                label="Categoria"
                value={
                  filters.isNewcomer ? 'newcomer' :
                    filters.isVeteran ? 'veteran' :
                      filters.hasLowEngagement ? 'low_engagement' :
                        ''
                }
                onChange={(e) => {
                  setFilters({
                    ...filters,
                    isNewcomer: e.target.value === 'newcomer' ? true : undefined,
                    isVeteran: e.target.value === 'veteran' ? true : undefined,
                    hasLowEngagement: e.target.value === 'low_engagement' ? true : undefined,
                    page: 1,
                  });
                }}
                size="small"
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="newcomer">🆕 Newcomers (últimos 3 meses)</MenuItem>
                <MenuItem value="veteran">🏆 Veteranos (1+ ano)</MenuItem>
                <MenuItem value="low_engagement">⚠️ Baixo Engajamento (&lt;50%)</MenuItem>
              </TextField>
            </Grid2>

            <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                type="number"
                label="Engajamento Mínimo"
                value={filters.minEngagementScore || ''}
                onChange={(e) => handleFilterChange('minEngagementScore', e.target.value ? Number(e.target.value) : undefined)}
                size="small"
              />
            </Grid2>

            <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                type="number"
                label="Engajamento Máximo"
                value={filters.maxEngagementScore || ''}
                onChange={(e) => handleFilterChange('maxEngagementScore', e.target.value ? Number(e.target.value) : undefined)}
                size="small"
              />
            </Grid2>

            <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                type="number"
                label="Presença Mínima (%)"
                value={filters.minPresenceRate || ''}
                onChange={(e) => handleFilterChange('minPresenceRate', e.target.value ? Number(e.target.value) : undefined)}
                size="small"
              />
            </Grid2>

            <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                type="number"
                label="Presença Máxima (%)"
                value={filters.maxPresenceRate || ''}
                onChange={(e) => handleFilterChange('maxPresenceRate', e.target.value ? Number(e.target.value) : undefined)}
                size="small"
              />
            </Grid2>

            <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                select
                label="Ordenar por"
                value={filters.sortBy || 'engagementScore'}
                onChange={(e) =>
                  handleFilterChange(
                    'sortBy',
                    e.target.value as ChildrenStatsQueryDto['sortBy'],
                  )
                }
                size="small"
              >
                <MenuItem value="name">Nome</MenuItem>
                <MenuItem value="age">Idade</MenuItem>
                <MenuItem value="engagementScore">Engajamento</MenuItem>
                <MenuItem value="totalPagelas">Total Pagelas</MenuItem>
                <MenuItem value="presenceRate">Taxa Presença</MenuItem>
              </TextField>
            </Grid2>

            <Grid2 size={{ xs: 12, sm: 6, md: 2 }}>
              <TextField
                fullWidth
                select
                label="Ordem"
                value={filters.sortOrder || 'DESC'}
                onChange={(e) =>
                  handleFilterChange(
                    'sortOrder',
                    e.target.value as ChildrenStatsQueryDto['sortOrder'],
                  )
                }
                size="small"
              >
                <MenuItem value="ASC">Crescente</MenuItem>
                <MenuItem value="DESC">Decrescente</MenuItem>
              </TextField>
            </Grid2>
          </Grid2>
        </Collapse>
      </Paper>

      {isLoading || !data ? (
        <Paper elevation={3} sx={{ p: 3, borderRadius: 3, my: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        </Paper>
      ) : (
        <>
          {isMobile ? (
            <ChildrenListMobile data={data} />
          ) : (
            <ChildrenListDesktop data={data} />
          )}

          {data.pagination && (
            <Box sx={{ px: { xs: 1, sm: 0 }, mt: 2 }}>
              <TablePagination
                component="div"
                count={data.pagination.total}
                page={data.pagination.page - 1}
                onPageChange={handlePageChange}
                rowsPerPage={data.pagination.limit}
                onRowsPerPageChange={handleLimitChange}
                rowsPerPageOptions={isMobile ? [5, 10, 20] : [10, 20, 50, 100]}
                labelRowsPerPage="Itens por página:"
                labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
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
        </>
      )}
    </Box>
  );
};

