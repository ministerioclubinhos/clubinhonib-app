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
  Star,
  CheckCircle,
  TrendingUp,
} from '@mui/icons-material';
import { useChildren } from '../hooks';
import { ChildrenFilters } from '../api';
import { PeriodFilter } from './PeriodFilter';
import { getPeriodDates } from '../utils/periodHelpers';

export const ChildrenListView: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [filters, setFilters] = React.useState<ChildrenFilters>({
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
    <Box sx={{ width: '100%', maxWidth: '100%', overflowX: 'hidden' }}>
      
      <Grid container spacing={{ xs: 1.5, sm: 2 }} sx={{ mb: 3, width: '100%', maxWidth: '100%', margin: 0 }}>
        <Grid item xs={6} sm={6} md={2.4} sx={{ width: '100%', maxWidth: '100%' }}>
          <Paper elevation={0} sx={{ 
            p: { xs: 1.5, sm: 2 }, 
            borderRadius: 2, 
            border: `2px solid ${theme.palette.divider}`,
            width: '100%',
            maxWidth: '100%',
            overflow: 'hidden',
          }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>Total Filtrado</Typography>
            <Typography variant="h5" fontWeight="bold" color="primary" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' }, wordBreak: 'break-word' }}>
              {data.summary.filteredChildren}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' }, wordBreak: 'break-word' }}>
              de {data.summary.totalChildren}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={6} md={2.4} sx={{ width: '100%', maxWidth: '100%' }}>
          <Paper elevation={0} sx={{ 
            p: { xs: 1.5, sm: 2 }, 
            borderRadius: 2, 
            border: `2px solid ${theme.palette.divider}`,
            width: '100%',
            maxWidth: '100%',
            overflow: 'hidden',
          }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>Idade Média</Typography>
            <Typography variant="h5" fontWeight="bold" color="info.main" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' }, wordBreak: 'break-word' }}>
              {data.summary.avgAge.toFixed(1)} anos
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={6} md={2.4} sx={{ width: '100%', maxWidth: '100%' }}>
          <Paper elevation={0} sx={{ 
            p: { xs: 1.5, sm: 2 }, 
            borderRadius: 2, 
            border: `2px solid ${theme.palette.divider}`,
            width: '100%',
            maxWidth: '100%',
            overflow: 'hidden',
          }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>Engajamento Médio</Typography>
            <Typography variant="h5" fontWeight="bold" color="success.main" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' }, wordBreak: 'break-word' }}>
              {data.summary.avgEngagementScore.toFixed(1)}%
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={6} md={2.4} sx={{ width: '100%', maxWidth: '100%' }}>
          <Paper elevation={0} sx={{ 
            p: { xs: 1.5, sm: 2 }, 
            borderRadius: 2, 
            border: `2px solid ${theme.palette.divider}`,
            width: '100%',
            maxWidth: '100%',
            overflow: 'hidden',
          }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>Presença Média</Typography>
            <Typography variant="h5" fontWeight="bold" color="secondary.main" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' }, wordBreak: 'break-word' }}>
              {data.summary.avgPresenceRate.toFixed(1)}%
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={6} md={2.4} sx={{ width: '100%', maxWidth: '100%' }}>
          <Paper elevation={0} sx={{ 
            p: { xs: 1.5, sm: 2 }, 
            borderRadius: 2, 
            border: `2px solid ${theme.palette.divider}`,
            width: '100%',
            maxWidth: '100%',
            overflow: 'hidden',
          }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>Com Decisão</Typography>
            <Typography variant="h5" fontWeight="bold" color="warning.main" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' }, wordBreak: 'break-word' }}>
              {data.summary.childrenWithDecisions}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

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
            
            <Grid item xs={12}>
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
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Buscar por nome"
                placeholder="Digite o nome da criança..."
                value={filters.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                size="small"
              />
            </Grid>

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

            <Grid item xs={12} sm={6} md={2}>
              <TextField
                fullWidth
                type="number"
                label="Idade Máxima"
                value={filters.maxAge || ''}
                onChange={(e) => handleFilterChange('maxAge', e.target.value ? Number(e.target.value) : undefined)}
                size="small"
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
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
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                type="number"
                label="Engajamento Mínimo"
                value={filters.minEngagementScore || ''}
                onChange={(e) => handleFilterChange('minEngagementScore', e.target.value ? Number(e.target.value) : undefined)}
                size="small"
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                type="number"
                label="Engajamento Máximo"
                value={filters.maxEngagementScore || ''}
                onChange={(e) => handleFilterChange('maxEngagementScore', e.target.value ? Number(e.target.value) : undefined)}
                size="small"
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                type="number"
                label="Presença Mínima (%)"
                value={filters.minPresenceRate || ''}
                onChange={(e) => handleFilterChange('minPresenceRate', e.target.value ? Number(e.target.value) : undefined)}
                size="small"
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                type="number"
                label="Presença Máxima (%)"
                value={filters.maxPresenceRate || ''}
                onChange={(e) => handleFilterChange('maxPresenceRate', e.target.value ? Number(e.target.value) : undefined)}
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

            <Grid item xs={12} sm={6} md={2}>
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

      {isMobile ? (
        <Stack spacing={1.5} sx={{ width: '100%', maxWidth: '100%' }}>
          {data.children.length === 0 ? (
            <Paper elevation={3} sx={{ p: 3, borderRadius: 2, textAlign: 'center' }}>
              <Typography color="text.secondary" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                Nenhuma criança encontrada com os filtros selecionados
              </Typography>
            </Paper>
          ) : (
            data.children.map((child) => (
              <Card key={child.childId} elevation={1} sx={{ 
                borderRadius: 1.5,
                width: '100%',
                maxWidth: '100%',
                overflow: 'hidden',
                borderLeft: `4px solid ${child.gender === 'F' ? theme.palette.secondary.main : theme.palette.info.main}`,
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '3px',
                  background: `linear-gradient(90deg, ${child.gender === 'F' ? theme.palette.secondary.main : theme.palette.info.main} 0%, ${child.gender === 'F' ? theme.palette.secondary.light : theme.palette.info.light} 100%)`,
                },
              }}>
                <CardContent sx={{ 
                  p: { xs: 1, sm: 2 }, 
                  '&:last-child': { pb: { xs: 1, sm: 2 } },
                  width: '100%',
                  maxWidth: '100%',
                }}>
                  <Stack spacing={1}>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                        <Typography fontWeight="bold" color="primary" sx={{ fontSize: { xs: '0.75rem', sm: '1rem' } }}>
                          #{child.rank}
                        </Typography>
                        <Avatar
                          sx={{
                            width: { xs: 28, sm: 36 },
                            height: { xs: 28, sm: 36 },
                            bgcolor: child.gender === 'F' ? theme.palette.secondary.main : theme.palette.info.main,
                            fontSize: { xs: 11, sm: 14 },
                          }}
                        >
                          {getInitials(child.name)}
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography fontWeight="medium" sx={{ fontSize: { xs: '0.8rem', sm: '1rem' }, wordBreak: 'break-word' }}>
                            {child.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' }, wordBreak: 'break-word' }}>
                            {child.gender === 'M' ? 'Masculino' : 'Feminino'} • {child.age} anos
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    <Divider sx={{ my: 0.5 }} />

                    <Grid container spacing={1}>
                      <Grid item xs={6}>
                        <Box>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
                            Clubinho
                          </Typography>
                          <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', sm: '1rem' }, wordBreak: 'break-word' }}>
                            {child.club ? `#${child.club.number}` : '-'}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
                            Cidade
                          </Typography>
                          <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', sm: '1rem' }, wordBreak: 'break-word' }}>
                            {child.address ? `${child.address.city}, ${child.address.state}` : '-'}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
                            Tempo
                          </Typography>
                          <Chip
                            label={`${child.monthsParticipating}m`}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' }, height: { xs: 20, sm: 24 } }}
                          />
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
                            Pagelas
                          </Typography>
                          <Typography variant="body2" fontWeight="bold" sx={{ fontSize: { xs: '0.8rem', sm: '1rem' } }}>
                            {child.stats.totalPagelas}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>

                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
                          Presença
                        </Typography>
                        <Typography variant="body2" fontWeight="bold" sx={{ fontSize: { xs: '0.8rem', sm: '1rem' } }}>
                          {child.stats.presenceRate.toFixed(1)}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={child.stats.presenceRate}
                        sx={{
                          height: { xs: 4, sm: 6 },
                          borderRadius: 2,
                          bgcolor: `${theme.palette.success.main}15`,
                          '& .MuiLinearProgress-bar': {
                            bgcolor: theme.palette.success.main,
                            borderRadius: 2,
                          },
                        }}
                      />
                    </Box>

                    <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', alignItems: 'center' }}>
                      <Chip
                        icon={<Star sx={{ fontSize: { xs: 12, sm: 16 } }} />}
                        label={`${child.stats.engagementScore.toFixed(0)}`}
                        size="small"
                        color={getEngagementColor(child.stats.engagementScore)}
                        sx={{ 
                          fontSize: { xs: '0.65rem', sm: '0.75rem' },
                          height: { xs: 20, sm: 24 },
                          '& .MuiChip-label': { px: { xs: 0.5, sm: 1 } }
                        }}
                      />
                      {child.isActive && (
                        <Chip label="Ativo" size="small" color="success" variant="outlined" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' }, height: { xs: 20, sm: 24 } }} />
                      )}
                      {child.decisions.hasDecision && (
                        <Chip
                          icon={<CheckCircle sx={{ fontSize: { xs: 12, sm: 16 } }} />}
                          label={child.decisions.decisionType}
                          size="small"
                          color="success"
                          sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' }, height: { xs: 20, sm: 24 } }}
                        />
                      )}
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            ))
          )}
        </Stack>
      ) : (
        
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
                    <Typography fontWeight="bold" color="primary" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>#{child.rank}</Typography>
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
                        <Typography fontWeight="medium" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>{child.name}</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                          {child.gender === 'M' ? 'Masculino' : 'Feminino'}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>{child.age} anos</TableCell>
                  <TableCell sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                    {child.club ? `#${child.club.number}` : '-'}
                  </TableCell>
                  <TableCell sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                    {child.address ? `${child.address.city}, ${child.address.state}` : '-'}
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={`${child.monthsParticipating}m`}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="right" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>{child.stats.totalPagelas}</TableCell>
                  <TableCell align="right">
                    <Box>
                      <Typography variant="body2" fontWeight="bold" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
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
              <Typography color="text.secondary" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                Nenhuma criança encontrada com os filtros selecionados
              </Typography>
            </Box>
          )}
        </TableContainer>
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
    </Box>
  );
};

