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
  Avatar,
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
  School,
  Group,
  Star,
  CheckCircle,
} from '@mui/icons-material';
import { useTeachers } from '../hooks';
import { TeachersFilters } from '../api';

export const TeachersListView: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [filters, setFilters] = React.useState<TeachersFilters>({
    page: 1,
    limit: 20,
    sortBy: 'effectivenessScore',
    sortOrder: 'DESC',
  });
  const [filtersExpanded, setFiltersExpanded] = React.useState(false);

  const { data, isLoading } = useTeachers(filters);

  const handleFilterChange = (field: keyof TeachersFilters, value: any) => {
    setFilters({ ...filters, [field]: value || undefined, page: 1 });
  };

  const handlePageChange = (event: unknown, newPage: number) => {
    setFilters({ ...filters, page: newPage + 1 });
  };

  const handleLimitChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, limit: parseInt(event.target.value, 10), page: 1 });
  };

  const handleReset = () => {
    setFilters({ page: 1, limit: 20, sortBy: 'effectivenessScore', sortOrder: 'DESC' });
  };

  const getEffectivenessColor = (score: number) => {
    if (score >= 85) return 'success';
    if (score >= 70) return 'info';
    if (score >= 60) return 'warning';
    return 'default';
  };

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
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
        <Typography color="error">Erro ao carregar professores</Typography>
      </Paper>
    );
  }

  return (
    <Box>
      {/* Cards de Resumo */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: `2px solid ${theme.palette.divider}` }}>
            <Typography variant="caption" color="text.secondary">Total Professores</Typography>
            <Typography variant="h5" fontWeight="bold" color="primary">
              {data.summary.filteredTeachers}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              ({data.summary.activeTeachers} ativos)
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: `2px solid ${theme.palette.divider}` }}>
            <Typography variant="caption" color="text.secondary">Total Crianças</Typography>
            <Typography variant="h5" fontWeight="bold" color="info.main">
              {data.summary.totalChildren}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: `2px solid ${theme.palette.divider}` }}>
            <Typography variant="caption" color="text.secondary">Efetividade Média</Typography>
            <Typography variant="h5" fontWeight="bold" color="success.main">
              {data.summary.avgEffectivenessScore.toFixed(1)}%
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: `2px solid ${theme.palette.divider}` }}>
            <Typography variant="caption" color="text.secondary">Presença Média</Typography>
            <Typography variant="h5" fontWeight="bold" color="secondary.main">
              {data.summary.avgPresenceRate.toFixed(1)}%
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
                label="Ordenar por"
                value={filters.sortBy || 'effectivenessScore'}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                size="small"
              >
                <MenuItem value="name">Nome</MenuItem>
                <MenuItem value="effectivenessScore">Efetividade</MenuItem>
                <MenuItem value="totalPagelas">Total Pagelas</MenuItem>
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
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                select
                label="Status"
                value={filters.isActive !== undefined ? filters.isActive.toString() : ''}
                onChange={(e) =>
                  handleFilterChange('isActive', e.target.value === '' ? undefined : e.target.value === 'true')
                }
                size="small"
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="true">Apenas Ativos</MenuItem>
                <MenuItem value="false">Inativos</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </Collapse>
      </Paper>

      {/* Versão Mobile: Cards */}
      {isMobile ? (
        <Stack spacing={2}>
          {data.teachers.length === 0 ? (
            <Paper elevation={3} sx={{ p: 3, borderRadius: 2, textAlign: 'center' }}>
              <Typography color="text.secondary" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                Nenhum professor encontrado
              </Typography>
            </Paper>
          ) : (
            data.teachers.map((teacher) => (
              <Card key={teacher.teacherId} elevation={3} sx={{ borderRadius: 2 }}>
                <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                  <Stack spacing={1.5}>
                    {/* Header */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
                        <Typography fontWeight="bold" color="primary" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                          #{teacher.rank}
                        </Typography>
                        <Avatar sx={{ width: { xs: 32, sm: 36 }, height: { xs: 32, sm: 36 }, bgcolor: theme.palette.success.main }}>
                          {getInitials(teacher.name)}
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography fontWeight="medium" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                            {teacher.name}
                          </Typography>
                        </Box>
                      </Box>
                      {teacher.isActive ? (
                        <Chip label="Ativo" size="small" color="success" variant="outlined" icon={<CheckCircle />} sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }} />
                      ) : (
                        <Chip label="Inativo" size="small" variant="outlined" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }} />
                      )}
                    </Box>

                    <Divider />

                    {/* Informações */}
                    <Grid container spacing={1.5}>
                      <Grid item xs={6}>
                        <Box>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                            Clubinho
                          </Typography>
                          <Typography variant="body2" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                            {teacher.club ? `#${teacher.club.number}` : '-'}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                            Local
                          </Typography>
                          <Typography variant="body2" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                            {teacher.club ? `${teacher.club.city}, ${teacher.club.state}` : '-'}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>

                    {/* Crianças e Pagelas */}
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                      <Chip
                        icon={<Group />}
                        label={`${teacher.children.unique} crianças (${teacher.children.active} ativos)`}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                      />
                      {teacher.children.withDecisions > 0 && (
                        <Chip
                          label={`${teacher.children.withDecisions} decisões`}
                          size="small"
                          color="success"
                          sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                        />
                      )}
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                        {teacher.performance.totalPagelas} pagelas
                      </Typography>
                    </Box>

                    {/* Presença */}
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                          Presença
                        </Typography>
                        <Typography variant="body2" fontWeight="bold" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                          {teacher.performance.avgPresenceRate.toFixed(1)}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={teacher.performance.avgPresenceRate}
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

                    {/* Efetividade */}
                    <Box>
                      <Chip
                        icon={<Star />}
                        label={`Efetividade: ${teacher.performance.effectivenessScore.toFixed(0)}`}
                        size="small"
                        color={getEffectivenessColor(teacher.performance.effectivenessScore)}
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
        <TableContainer
          component={Paper}
          elevation={3}
          sx={{
            borderRadius: 2,
            maxHeight: { xs: 420, md: 560 },
            overflow: 'auto',
          }}
        >
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: 'primary.main' }}>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Rank</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Professor</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Clubinho</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Local</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">Crianças</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">Pagelas</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">Presença</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">Efetividade</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.teachers.map((teacher) => (
                <TableRow key={teacher.teacherId} hover>
                  <TableCell>
                    <Typography fontWeight="bold" color="primary" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>#{teacher.rank}</Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: theme.palette.success.main }}>
                        {getInitials(teacher.name)}
                      </Avatar>
                      <Typography fontWeight="medium" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>{teacher.name}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                    {teacher.club ? `#${teacher.club.number}` : '-'}
                  </TableCell>
                  <TableCell sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                    {teacher.club ? `${teacher.club.city}, ${teacher.club.state}` : '-'}
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      icon={<Group />}
                      label={`${teacher.children.unique} (${teacher.children.active} ativos)`}
                      size="small"
                      variant="outlined"
                    />
                    {teacher.children.withDecisions > 0 && (
                      <Typography variant="caption" color="success.main" display="block" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                        {teacher.children.withDecisions} decisões
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="right" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>{teacher.performance.totalPagelas}</TableCell>
                  <TableCell align="right">
                    <Box>
                      <Typography variant="body2" fontWeight="bold" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                        {teacher.performance.avgPresenceRate.toFixed(1)}%
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={teacher.performance.avgPresenceRate}
                        sx={{
                          mt: 0.5,
                          height: 3,
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
                      icon={<Star />}
                      label={teacher.performance.effectivenessScore.toFixed(0)}
                      size="small"
                      color={getEffectivenessColor(teacher.performance.effectivenessScore)}
                    />
                  </TableCell>
                  <TableCell align="center">
                    {teacher.isActive ? (
                      <Chip label="Ativo" size="small" color="success" variant="outlined" icon={<CheckCircle />} />
                    ) : (
                      <Chip label="Inativo" size="small" variant="outlined" />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {data.teachers.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="text.secondary" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>Nenhum professor encontrado</Typography>
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
            labelRowsPerPage="Professores por página:"
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


