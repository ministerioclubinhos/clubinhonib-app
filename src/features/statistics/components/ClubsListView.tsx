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
} from '@mui/icons-material';
import { useClubs } from '../hooks';
import { ClubsFilters } from '../api';

export const ClubsListView: React.FC = () => {
  const theme = useTheme();
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

      {/* Tabela */}
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
                    <Typography fontWeight="bold">#{club.rank}</Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Clubinho #{club.clubNumber}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2">{weekdayNames[club.weekday] || club.weekday}</Typography>
                    <Typography variant="caption" color="text.secondary">{club.time}</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{club.address.city}, {club.address.state}</Typography>
                  <Typography variant="caption" color="text.secondary">{club.address.district}</Typography>
                </TableCell>
                <TableCell>
                  {club.coordinator ? club.coordinator.name : '-'}
                </TableCell>
                <TableCell align="center">
                  <Chip
                    icon={<Groups />}
                    label={`${club.children.total} (${club.children.active} ativos)`}
                    size="small"
                    variant="outlined"
                  />
                  <Typography variant="caption" color="text.secondary" display="block">
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
                    <Typography variant="body2" fontWeight="bold">
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
            <Typography color="text.secondary">Nenhum clubinho encontrado</Typography>
          </Box>
        )}
      </TableContainer>

      {/* Paginação */}
      {data.pagination && (
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
        />
      )}
    </Box>
  );
};


