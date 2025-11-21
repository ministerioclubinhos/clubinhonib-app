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
} from '@mui/material';
import {
  ExpandMore,
  ExpandLess,
  FilterList,
  Refresh,
  Star,
  CheckCircle,
  TrendingUp,
} from '@mui/icons-material';
import { useChildren } from '../hooks';
import { ChildrenFilters } from '../api';

export const ChildrenListView: React.FC = () => {
  const theme = useTheme();
  const [filters, setFilters] = React.useState<ChildrenFilters>({
    page: 1,
    limit: 20,
    sortBy: 'engagementScore',
    sortOrder: 'DESC',
  });
  const [filtersExpanded, setFiltersExpanded] = React.useState(false);

  const { data, isLoading } = useChildren(filters);

  const handleFilterChange = (field: keyof ChildrenFilters, value: any) => {
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

  const getEngagementColor = (score: number) => {
    if (score >= 90) return 'success';
    if (score >= 75) return 'info';
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
        <Typography color="error">Erro ao carregar crianças</Typography>
      </Paper>
    );
  }

  return (
    <Box>
      {/* Cards de Resumo */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: `2px solid ${theme.palette.divider}` }}>
            <Typography variant="caption" color="text.secondary">Total Filtrado</Typography>
            <Typography variant="h5" fontWeight="bold" color="primary">
              {data.summary.filteredChildren}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              de {data.summary.totalChildren}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: `2px solid ${theme.palette.divider}` }}>
            <Typography variant="caption" color="text.secondary">Idade Média</Typography>
            <Typography variant="h5" fontWeight="bold" color="info.main">
              {data.summary.avgAge.toFixed(1)} anos
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: `2px solid ${theme.palette.divider}` }}>
            <Typography variant="caption" color="text.secondary">Engajamento Médio</Typography>
            <Typography variant="h5" fontWeight="bold" color="success.main">
              {data.summary.avgEngagementScore.toFixed(1)}%
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
            <Typography variant="caption" color="text.secondary">Com Decisão</Typography>
            <Typography variant="h5" fontWeight="bold" color="warning.main">
              {data.summary.childrenWithDecisions}
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
            {data.filters.summary && (
              <Chip label={data.filters.summary} size="small" variant="outlined" />
            )}
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
                select
                label="Gênero"
                value={filters.gender || ''}
                onChange={(e) => handleFilterChange('gender', e.target.value)}
                size="small"
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="M">Masculino</MenuItem>
                <MenuItem value="F">Feminino</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                type="number"
                label="Idade Mínima"
                value={filters.minAge || ''}
                onChange={(e) => handleFilterChange('minAge', e.target.value ? Number(e.target.value) : undefined)}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                select
                label="Ordenar por"
                value={filters.sortBy || 'engagementScore'}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                size="small"
              >
                <MenuItem value="name">Nome</MenuItem>
                <MenuItem value="age">Idade</MenuItem>
                <MenuItem value="engagementScore">Engajamento</MenuItem>
                <MenuItem value="totalPagelas">Total Pagelas</MenuItem>
                <MenuItem value="presenceRate">Taxa Presença</MenuItem>
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
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Ranking</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Criança</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Idade</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Clubinho</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Cidade</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">Tempo</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">Pagelas</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">Presença</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">Engajamento</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.children.map((child) => (
              <TableRow key={child.childId} hover>
                <TableCell>
                  <Typography fontWeight="bold" color="primary">#{child.rank}</Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar
                      sx={{
                        width: 36,
                        height: 36,
                        bgcolor: child.gender === 'F' ? theme.palette.secondary.main : theme.palette.info.main,
                        fontSize: 14,
                      }}
                    >
                      {getInitials(child.name)}
                    </Avatar>
                    <Box>
                      <Typography fontWeight="medium">{child.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {child.gender === 'M' ? 'Masculino' : 'Feminino'}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>{child.age} anos</TableCell>
                <TableCell>
                  {child.club ? `#${child.club.number}` : '-'}
                </TableCell>
                <TableCell>
                  {child.address ? `${child.address.city}, ${child.address.state}` : '-'}
                </TableCell>
                <TableCell align="center">
                  <Chip
                    label={`${child.monthsParticipating}m`}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell align="right">{child.stats.totalPagelas}</TableCell>
                <TableCell align="right">
                  <Box>
                    <Typography variant="body2" fontWeight="bold">
                      {child.stats.presenceRate.toFixed(1)}%
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={child.stats.presenceRate}
                      sx={{
                        mt: 0.5,
                        height: 4,
                        borderRadius: 2,
                        bgcolor: `${theme.palette.success.main}15`,
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
                    label={child.stats.engagementScore.toFixed(0)}
                    size="small"
                    color={getEngagementColor(child.stats.engagementScore)}
                  />
                </TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    {child.isActive && (
                      <Chip label="Ativo" size="small" color="success" variant="outlined" />
                    )}
                    {child.decisions.hasDecision && (
                      <Chip
                        icon={<CheckCircle />}
                        label={child.decisions.decisionType}
                        size="small"
                        color="success"
                      />
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {data.children.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="text.secondary">Nenhuma criança encontrada com os filtros selecionados</Typography>
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
          rowsPerPageOptions={[10, 20, 50, 100]}
          labelRowsPerPage="Itens por página:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
        />
      )}
    </Box>
  );
};


