import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  LinearProgress,
  CircularProgress,
  TextField,
  MenuItem,
  Grid,
  Button,
  Collapse,
  IconButton,
  useTheme,
  Avatar,
  Card,
  CardContent,
  useMediaQuery,
  Stack,
  Divider,
} from '@mui/material';
import {
  ExpandMore,
  ExpandLess,
  FilterList,
  Refresh,
  Groups,
  School,
  TrendingUp,
  EmojiEvents,
  Block,
  Warning,
} from '@mui/icons-material';
import { useClubs } from '../hooks';
import { ClubsFilters } from '../api';

export const ClubsListView: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [filters, setFilters] = React.useState<ClubsFilters>({
    page: 1,
    limit: 20,
    sortBy: 'performanceScore',
    sortOrder: 'DESC',
  });
  const [filtersExpanded, setFiltersExpanded] = React.useState(false);

  const { data, isLoading } = useClubs(filters);

  const handleFilterChange = (field: keyof ClubsFilters, value: any) => {
    setFilters({ ...filters, [field]: value || undefined, page: 1 });
  };

  const handlePageChange = (event: unknown, newPage: number) => {
    setFilters({ ...filters, page: newPage + 1 });
  };

  const handleLimitChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, limit: parseInt(event.target.value, 10), page: 1 });
  };

  const handleReset = () => {
    setFilters({ page: 1, limit: 20, sortBy: 'performanceScore', sortOrder: 'DESC' });
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 85) return 'success';
    if (score >= 70) return 'info';
    if (score >= 60) return 'warning';
    return 'default';
  };

  const getMedalColor = (rank: number) => {
    if (rank === 1) return '#FFD700';
    if (rank === 2) return '#C0C0C0';
    if (rank === 3) return '#CD7F32';
    return theme.palette.grey[400];
  };

  if (isLoading) {
    return (
      <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      </Paper>
    );
  }

  if (!data) {
    return (
      <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
        <Typography color="error">Erro ao carregar clubinhos</Typography>
      </Paper>
    );
  }

  const weekdayNames: Record<string, string> = {
    MONDAY: 'Segunda',
    TUESDAY: 'Terça',
    WEDNESDAY: 'Quarta',
    THURSDAY: 'Quinta',
    FRIDAY: 'Sexta',
    SATURDAY: 'Sábado',
    SUNDAY: 'Domingo',
  };

  return (
    <Box>
      {/* Cards de Resumo */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: `2px solid ${theme.palette.divider}` }}>
            <Typography variant="caption" color="text.secondary">Total Clubinhos</Typography>
            <Typography variant="h5" fontWeight="bold" color="primary">
              {data.summary.filteredClubs}
            </Typography>
            <Typography variant="caption" color="text.secondary">de {data.summary.totalClubs}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: `2px solid ${theme.palette.divider}` }}>
            <Typography variant="caption" color="text.secondary">Total Crianças</Typography>
            <Typography variant="h5" fontWeight="bold" color="info.main">
              {data.summary.totalChildren}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: `2px solid ${theme.palette.divider}` }}>
            <Typography variant="caption" color="text.secondary">Performance Média</Typography>
            <Typography variant="h5" fontWeight="bold" color="success.main">
              {data.summary.avgPerformanceScore.toFixed(1)}%
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: `2px solid ${theme.palette.divider}` }}>
            <Typography variant="caption" color="text.secondary">Presença Média</Typography>
            <Typography variant="h5" fontWeight="bold" color="secondary.main">
              {data.summary.avgPresenceRate.toFixed(1)}%
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: `2px solid ${theme.palette.divider}` }}>
            <Typography variant="caption" color="text.secondary">Total Decisões</Typography>
            <Typography variant="h5" fontWeight="bold" color="warning.main">
              {data.summary.totalDecisions}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* ⭐ v2.10.0: Informações sobre clubinhos e crianças desativadas - Compacto */}
      {(data.inactiveClubs || data.inactiveChildren) && (
        <Grid container spacing={{ xs: 1, sm: 1.5 }} sx={{ mb: { xs: 2, sm: 3 } }}>
          {data.inactiveClubs && data.inactiveClubs.total > 0 && (
            <Grid item xs={12} sm={6} md={data.inactiveChildren && data.inactiveChildren.total > 0 ? 6 : 12}>
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
                          label={`#${club.clubNumber} - ${weekdayNames[club.weekday] || club.weekday}`}
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
            </Grid>
          )}
          {data.inactiveChildren && data.inactiveChildren.total > 0 && (
            <Grid item xs={12} sm={6} md={data.inactiveClubs && data.inactiveClubs.total > 0 ? 6 : 12}>
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
            </Grid>
          )}
        </Grid>
      )}

      {/* Filtros */}
      <Paper elevation={0} sx={{ p: 2, borderRadius: 2, mb: 2, border: `1px solid ${theme.palette.divider}` }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: filtersExpanded ? 2 : 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FilterList />
            <Typography variant="subtitle1" fontWeight="bold">Filtros</Typography>
          </Box>
          <Box>
            <Button size="small" startIcon={<Refresh />} onClick={handleReset}>Limpar</Button>
            <IconButton size="small" onClick={() => setFiltersExpanded(!filtersExpanded)}>
              {filtersExpanded ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </Box>
        </Box>

        <Collapse in={filtersExpanded}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Cidade"
                value={filters.city || ''}
                onChange={(e) => handleFilterChange('city', e.target.value)}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
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
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
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
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
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
            </Grid>
          </Grid>
        </Collapse>
      </Paper>

      {/* Versão Mobile: Cards */}
      {isMobile ? (
        <Stack spacing={2}>
          {data.clubs.length === 0 ? (
            <Paper elevation={3} sx={{ p: 3, borderRadius: 2, textAlign: 'center' }}>
              <Typography color="text.secondary" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                Nenhum clubinho encontrado
              </Typography>
            </Paper>
          ) : (
            data.clubs.map((club) => (
              <Card 
                key={club.clubId} 
                elevation={3} 
                sx={{ 
                  borderRadius: 2,
                  border: club.rank <= 3 ? `2px solid ${getMedalColor(club.rank)}40` : undefined,
                  bgcolor: club.rank <= 3 ? `${getMedalColor(club.rank)}08` : undefined,
                }}
              >
                <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                  <Stack spacing={1.5}>
                    {/* Header */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        {club.rank <= 3 ? (
                          <EmojiEvents sx={{ color: getMedalColor(club.rank), fontSize: { xs: 24, sm: 28 } }} />
                        ) : (
                          <Typography fontWeight="bold" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                            #{club.rank}
                          </Typography>
                        )}
                        <Typography variant="subtitle1" fontWeight="bold" sx={{ fontSize: { xs: '0.95rem', sm: '1.125rem' } }}>
                          Clubinho #{club.clubNumber}
                        </Typography>
                      </Box>
                    </Box>

                    <Divider />

                    {/* Informações */}
                    <Grid container spacing={1.5}>
                      <Grid item xs={6}>
                        <Box>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                            Dia/Horário
                          </Typography>
                          <Typography variant="body2" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                            {weekdayNames[club.weekday] || club.weekday}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                            {club.time}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                            Local
                          </Typography>
                          <Typography variant="body2" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                            {club.address.city}, {club.address.state}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                            {club.address.district}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12}>
                        <Box>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                            Coordenador
                          </Typography>
                          <Typography variant="body2" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                            {club.coordinator ? club.coordinator.name : '-'}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>

                    {/* Crianças e Professores */}
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip
                        icon={<Groups />}
                        label={`${club.children.total} crianças (${club.children.active} ativos)`}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                      />
                      <Chip
                        icon={<School />}
                        label={`${club.teachers.total} professores`}
                        size="small"
                        color="info"
                        variant="outlined"
                        sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' }, alignSelf: 'center' }}>
                        M: {club.children.byGender.M} | F: {club.children.byGender.F}
                      </Typography>
                    </Box>

                    {/* Presença */}
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                          Presença
                        </Typography>
                        <Typography variant="body2" fontWeight="bold" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                          {club.performance.presenceRate.toFixed(1)}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={club.performance.presenceRate}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          '& .MuiLinearProgress-bar': {
                            bgcolor: theme.palette.success.main,
                            borderRadius: 3,
                          },
                        }}
                      />
                    </Box>

                    {/* Performance e Decisões */}
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                      <Chip
                        icon={<TrendingUp />}
                        label={`Performance: ${club.performance.performanceScore.toFixed(1)}`}
                        size="small"
                        color={getPerformanceColor(club.performance.performanceScore)}
                        sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                      />
                      <Chip
                        label={`${club.performance.totalDecisions} decisões`}
                        size="small"
                        color="success"
                        variant="outlined"
                        sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                      />
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            ))
          )}
        </Stack>
      ) : (
        /* Versão Desktop: Tabela */
        <TableContainer component={Paper} elevation={3} sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'primary.main' }}>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Rank</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Clubinho</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Dia/Horário</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Local</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Coordenador</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">Crianças</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">Professores</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">Presença</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">Performance</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">Decisões</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.clubs.map((club) => (
                <TableRow
                  key={club.clubId}
                  hover
                  sx={{ bgcolor: club.rank <= 3 ? `${getMedalColor(club.rank)}08` : 'transparent' }}
                >
                  <TableCell>
                    {club.rank <= 3 ? (
                      <EmojiEvents sx={{ color: getMedalColor(club.rank), fontSize: 28 }} />
                    ) : (
                      <Typography fontWeight="bold" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>#{club.rank}</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle1" fontWeight="bold" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                      Clubinho #{club.clubNumber}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>{weekdayNames[club.weekday] || club.weekday}</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>{club.time}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>{club.address.city}, {club.address.state}</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>{club.address.district}</Typography>
                  </TableCell>
                  <TableCell sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                    {club.coordinator ? club.coordinator.name : '-'}
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      icon={<Groups />}
                      label={`${club.children.total} (${club.children.active} ativos)`}
                      size="small"
                      variant="outlined"
                    />
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                      M: {club.children.byGender.M} | F: {club.children.byGender.F}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      icon={<School />}
                      label={club.teachers.total.toString()}
                      size="small"
                      color="info"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Box>
                      <Typography variant="body2" fontWeight="bold" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                        {club.performance.presenceRate.toFixed(1)}%
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={club.performance.presenceRate}
                        sx={{
                          mt: 0.5,
                          height: 4,
                          borderRadius: 2,
                          '& .MuiLinearProgress-bar': {
                            bgcolor: theme.palette.success.main,
                          },
                        }}
                      />
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      icon={<TrendingUp />}
                      label={club.performance.performanceScore.toFixed(1)}
                      size="small"
                      color={getPerformanceColor(club.performance.performanceScore)}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={club.performance.totalDecisions}
                      size="small"
                      color="success"
                      variant="outlined"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {data.clubs.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="text.secondary" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>Nenhum clubinho encontrado</Typography>
            </Box>
          )}
        </TableContainer>
      )}

      {/* Paginação - Funciona em ambos (mobile e desktop) */}
      {data.pagination && (
        <Box sx={{ px: { xs: 1, sm: 0 }, mt: 2 }}>
          <TablePagination
            component="div"
            count={data.pagination.total}
            page={data.pagination.page - 1}
            onPageChange={handlePageChange}
            rowsPerPage={data.pagination.limit}
            onRowsPerPageChange={handleLimitChange}
            rowsPerPageOptions={[10, 20, 50]}
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
    </Box>
  );
};


