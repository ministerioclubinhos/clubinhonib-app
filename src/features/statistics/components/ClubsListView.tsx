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
  Block,
  Warning,
} from '@mui/icons-material';
import { useClubs } from '../hooks';
import type { ClubsStatsQueryDto } from '../types';
import { useStatistics } from '../context';
import { WEEKDAY_NAMES } from '../constants';
import ClubsListDesktop from './ClubsListDesktop';
import ClubsListMobile from './ClubsListMobile';

export const ClubsListView: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { state } = useStatistics();
  const [filters, setFilters] = React.useState<ClubsStatsQueryDto>({
    page: 1,
    limit: isMobile ? 5 : 20,
    sortBy: 'performanceScore',
    sortOrder: 'DESC',
  });

  React.useEffect(() => {
    const newLimit = isMobile ? 5 : 20;
    setFilters((previous) =>
      previous.limit === newLimit
        ? previous
        : { ...previous, limit: newLimit, page: 1 },
    );
  }, [isMobile]);
  const [filtersExpanded, setFiltersExpanded] = React.useState(false);

  const queryFilters = React.useMemo<ClubsStatsQueryDto>(
    () => ({
      ...filters,
      ...state.filters,
      page: filters.page,
      limit: filters.limit,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
    }),
    [filters, state.filters],
  );
  const { data, isLoading, isError, refetch } = useClubs(queryFilters);

  React.useEffect(() => {
    setFilters((previous) => ({ ...previous, page: 1 }));
  }, [state.filters]);

  const handleFilterChange = (
    field: keyof ClubsStatsQueryDto,
    value: ClubsStatsQueryDto[keyof ClubsStatsQueryDto],
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
    setFilters({ page: 1, limit: isMobile ? 5 : 20, sortBy: 'performanceScore', sortOrder: 'DESC' });
  };

  if (isError) {
    return (
      <Paper elevation={3} sx={{ p: { xs: 1.5, sm: 3 }, borderRadius: 3 }}>
        <Typography color="error" sx={{ mb: 1.5 }}>
          Não foi possível carregar os clubinhos.
        </Typography>
        <Button onClick={() => refetch()} variant="outlined">Tentar novamente</Button>
      </Paper>
    );
  }


  return (
    <Box sx={{ width: '100%', maxWidth: '100%', overflowX: 'hidden' }}>

      <Grid2 container spacing={{ xs: 1.5, sm: 2 }} sx={{ mb: 3, width: '100%', maxWidth: '100%', margin: 0, display: 'flex', flexWrap: 'wrap' }}>
        <Grid2 size={{ xs: 6, sm: 6, md: 2.4 }} sx={{ width: '100%', maxWidth: '100%' }}>
          <Paper elevation={0} sx={{
            p: { xs: 1.5, sm: 2 },
            borderRadius: 2,
            border: `2px solid ${theme.palette.divider}`,
            width: '100%',
            maxWidth: '100%',
            overflow: 'hidden',
          }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>Total Clubinhos</Typography>
            {isLoading || !data ? <Skeleton width="60%" height={32} /> : (
              <Typography variant="h5" fontWeight="bold" color="primary" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' }, wordBreak: 'break-word' }}>
                {data.summary.filteredClubs}
              </Typography>
            )}
            {isLoading || !data ? <Skeleton width="40%" height={16} /> : (
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' }, wordBreak: 'break-word' }}>
                de {data.summary.totalClubs}
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
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>Total Crianças</Typography>
            {isLoading || !data ? <Skeleton width="60%" height={32} /> : (
              <Typography variant="h5" fontWeight="bold" color="info.main" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' }, wordBreak: 'break-word' }}>
                {data.summary.totalChildren}
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
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>Performance Média</Typography>
            {isLoading || !data ? <Skeleton width="60%" height={32} /> : (
              <Typography variant="h5" fontWeight="bold" color="success.main" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' }, wordBreak: 'break-word' }}>
                {data.summary.avgPerformanceScore.toFixed(1)}%
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
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>Total Decisões</Typography>
            {isLoading || !data ? <Skeleton width="60%" height={32} /> : (
              <Typography variant="h5" fontWeight="bold" color="warning.main" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' }, wordBreak: 'break-word' }}>
                {data.summary.totalDecisions}
              </Typography>
            )}
          </Paper>
        </Grid2>
      </Grid2>

      {data && (data.inactiveClubs || data.inactiveChildren) && (
        <Grid2 container spacing={{ xs: 1, sm: 1.5 }} sx={{ mb: { xs: 2, sm: 3 } }}>
          {data.inactiveClubs && data.inactiveClubs.total > 0 && (
            <Grid2
              size={{
                xs: 12,
                sm: 6,
                md: data.inactiveChildren && data.inactiveChildren.total > 0 ? 6 : 12,
              }}
            >
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 1.5, sm: 2 },
                  borderRadius: 2,
                  border: `2px solid ${theme.palette.warning.main}40`,
                  bgcolor: `${theme.palette.warning.main}08`,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: { xs: 0.75, sm: 1 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.75, sm: 1 } }}>
                    <Block sx={{ color: theme.palette.warning.main, fontSize: { xs: 18, sm: 20 } }} />
                    <Typography variant="subtitle2" fontWeight="bold" color="warning.main" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                      Clubinhos Desativados
                    </Typography>
                  </Box>
                  <Typography variant="h6" fontWeight="bold" color="warning.main" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                    {data.inactiveClubs.total}
                  </Typography>
                </Box>
                {data.inactiveClubs.list && data.inactiveClubs.list.length > 0 && (
                  <Box sx={{ mt: { xs: 1, sm: 1.5 } }}>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 0.5, sm: 0.5 } }}>
                      {data.inactiveClubs.list.map((club) => (
                        <Chip
                          key={club.clubId}
                          label={`#${club.clubNumber} - ${WEEKDAY_NAMES[club.weekday] || club.weekday}`}
                          size="small"
                          sx={{
                            bgcolor: `${theme.palette.warning.main}20`,
                            color: theme.palette.warning.main,
                            fontWeight: 600,
                            fontSize: { xs: '0.7rem', sm: '0.75rem' },
                            height: { xs: 24, sm: 28 },
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                )}
              </Paper>
            </Grid2>
          )}
          {data.inactiveChildren && data.inactiveChildren.total > 0 && (
            <Grid2
              size={{
                xs: 12,
                sm: 6,
                md: data.inactiveClubs && data.inactiveClubs.total > 0 ? 6 : 12,
              }}
            >
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 1.5, sm: 2 },
                  borderRadius: 2,
                  border: `2px solid ${theme.palette.error.main}40`,
                  bgcolor: `${theme.palette.error.main}08`,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: { xs: 0.75, sm: 1 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.75, sm: 1 } }}>
                    <Warning sx={{ color: theme.palette.error.main, fontSize: { xs: 18, sm: 20 } }} />
                    <Typography variant="subtitle2" fontWeight="bold" color="error.main" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                      Crianças Desativadas
                    </Typography>
                  </Box>
                  <Typography variant="h6" fontWeight="bold" color="error.main" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                    {data.inactiveChildren.total}
                  </Typography>
                </Box>
                {data.inactiveChildren.fromInactiveClubs !== undefined && (
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                    {data.inactiveChildren.fromInactiveClubs} de clubinhos desativados
                  </Typography>
                )}
              </Paper>
            </Grid2>
          )}
        </Grid2>
      )}

      <Paper elevation={0} sx={{ p: 2, borderRadius: 2, mb: 2, border: `1px solid ${theme.palette.divider}` }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: filtersExpanded ? 2 : 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FilterList />
            <Typography variant="subtitle1" fontWeight="bold">Filtros</Typography>
          </Box>
          <Box>
            <Button size="small" startIcon={<Refresh />} onClick={handleReset}>Limpar</Button>
            <IconButton
              onClick={() => setFiltersExpanded(!filtersExpanded)}
              aria-label={filtersExpanded ? 'Recolher filtros' : 'Expandir filtros'}
              sx={{ minWidth: 44, minHeight: 44 }}
            >
              {filtersExpanded ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </Box>
        </Box>

        <Collapse in={filtersExpanded}>
          <Grid2 container spacing={2}>

            <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                label="Cidade"
                value={filters.city || ''}
                onChange={(e) => handleFilterChange('city', e.target.value)}
                size="small"
              />
            </Grid2>

            <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                select
                label="Dia da Semana"
                value={filters.weekday || ''}
                onChange={(e) => handleFilterChange('weekday', e.target.value)}
                size="small"
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="MONDAY">Segunda</MenuItem>
                <MenuItem value="TUESDAY">Terça</MenuItem>
                <MenuItem value="WEDNESDAY">Quarta</MenuItem>
                <MenuItem value="THURSDAY">Quinta</MenuItem>
                <MenuItem value="FRIDAY">Sexta</MenuItem>
                <MenuItem value="SATURDAY">Sábado</MenuItem>
                <MenuItem value="SUNDAY">Domingo</MenuItem>
              </TextField>
            </Grid2>

            <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                type="number"
                label="Mínimo de Crianças"
                value={filters.minChildren || ''}
                onChange={(e) => handleFilterChange('minChildren', e.target.value ? Number(e.target.value) : undefined)}
                size="small"
              />
            </Grid2>

            <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                type="number"
                label="Máximo de Crianças"
                value={filters.maxChildren || ''}
                onChange={(e) => handleFilterChange('maxChildren', e.target.value ? Number(e.target.value) : undefined)}
                size="small"
              />
            </Grid2>

            <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                type="number"
                label="Performance Mínima"
                value={filters.minPerformanceScore || ''}
                onChange={(e) => handleFilterChange('minPerformanceScore', e.target.value ? Number(e.target.value) : undefined)}
                size="small"
              />
            </Grid2>

            <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                type="number"
                label="Performance Máxima"
                value={filters.maxPerformanceScore || ''}
                onChange={(e) => handleFilterChange('maxPerformanceScore', e.target.value ? Number(e.target.value) : undefined)}
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
                type="number"
                label="Mínimo de Decisões"
                value={filters.minDecisions || ''}
                onChange={(e) => handleFilterChange('minDecisions', e.target.value ? Number(e.target.value) : undefined)}
                size="small"
              />
            </Grid2>

            <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                type="number"
                label="Mínimo de Professores"
                value={filters.minTeachers || ''}
                onChange={(e) => handleFilterChange('minTeachers', e.target.value ? Number(e.target.value) : undefined)}
                size="small"
              />
            </Grid2>

            <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                select
                label="Ordenar por"
                value={filters.sortBy || 'performanceScore'}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                size="small"
              >
                <MenuItem value="number">Número</MenuItem>
                <MenuItem value="performanceScore">Performance</MenuItem>
                <MenuItem value="totalChildren">Total Crianças</MenuItem>
              </TextField>
            </Grid2>

            <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                select
                label="Ordem"
                value={filters.sortOrder || 'DESC'}
                onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
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
            <ClubsListMobile data={data} />
          ) : (
            <ClubsListDesktop data={data} />
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
                labelRowsPerPage="Clubinhos por página:"
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
