import React from 'react';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  useTheme,
  Grid,
  Chip,
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  IconButton,
  TablePagination,
  Card,
  CardContent,
  useMediaQuery,
  Stack,
  Divider,
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  BeachAccess,
  Block,
  NavigateBefore,
  NavigateNext,
  CalendarToday,
} from '@mui/icons-material';
import { useWeeklyAttendance, useCurrentWeek } from '../hooks';
import dayjs from 'dayjs';

export const WeeklyAttendanceGrid: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { data: currentWeekInfo } = useCurrentWeek();

  const [academicYear, setAcademicYear] = React.useState<number | null>(
    currentWeekInfo?.academicYear || null
  );
  const [academicWeek, setAcademicWeek] = React.useState<number | null>(
    currentWeekInfo?.academicWeek || null
  );
  const [page, setPage] = React.useState(1);
  
  const mobileLimit = 5;
  const desktopLimit = 20;
  const [limit, setLimit] = React.useState(isMobile ? mobileLimit : desktopLimit);

  React.useEffect(() => {
    const newLimit = isMobile ? mobileLimit : desktopLimit;
    if (limit !== newLimit) {
      setLimit(newLimit);
      setPage(1); 
    }
  }, [isMobile, limit]);

  const { data, isLoading } = useWeeklyAttendance({ 
    year: academicYear || new Date().getFullYear(), 
    week: academicWeek || 1, 
    page, 
    limit 
  });

  React.useEffect(() => {
    if (currentWeekInfo?.academicYear && currentWeekInfo?.academicWeek) {
      if (academicYear === null || academicWeek === null) {
        setAcademicYear(currentWeekInfo.academicYear);
        setAcademicWeek(currentWeekInfo.academicWeek);
      }
    }
  }, [currentWeekInfo, academicYear, academicWeek]);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'ok':
        return {
          icon: <CheckCircle />,
          color: theme.palette.success.main,
          label: 'OK',
          bgcolor: `${theme.palette.success.main}20`,
        };
      case 'missing':
        return {
          icon: <Cancel />,
          color: theme.palette.error.main,
          label: 'Faltou',
          bgcolor: `${theme.palette.error.main}20`,
        };
      case 'vacation':
        return {
          icon: <BeachAccess />,
          color: theme.palette.warning.main,
          label: 'Férias',
          bgcolor: `${theme.palette.warning.main}20`,
        };
      case 'inactive':
        return {
          icon: <Block />,
          color: theme.palette.grey[500],
          label: 'Inativo',
          bgcolor: theme.palette.grey[200],
        };
      default:
        return {
          icon: <Cancel />,
          color: theme.palette.grey[500],
          label: 'Desconhecido',
          bgcolor: theme.palette.grey[200],
        };
    }
  };

  const weekdayNames: Record<string, string> = {
    MONDAY: 'Segunda',
    TUESDAY: 'Terça',
    WEDNESDAY: 'Quarta',
    THURSDAY: 'Quinta',
    FRIDAY: 'Sexta',
    SATURDAY: 'Sábado',
    SUNDAY: 'Domingo',
    monday: 'Segunda',
    tuesday: 'Terça',
    wednesday: 'Quarta',
    thursday: 'Quinta',
    friday: 'Sexta',
    saturday: 'Sábado',
    sunday: 'Domingo',
  };

  const handlePrevWeek = () => {
    if (academicWeek !== null && academicWeek > 1) {
      setAcademicWeek(academicWeek - 1);
    } else if (academicWeek === 1 && academicYear !== null) {
      setAcademicYear(academicYear - 1);
      setAcademicWeek(50);
    }
    setPage(1);
  };

  const handleNextWeek = () => {
    if (academicWeek !== null) {
      setAcademicWeek(academicWeek + 1);
    }
    setPage(1);
  };

  React.useEffect(() => {
    setPage(1);
  }, [academicYear, academicWeek]);

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
        <Typography color="error">Erro ao carregar dados semanais</Typography>
      </Paper>
    );
  }

  const hasClubs = data.clubs && data.clubs.length > 0;
  const isCurrentWeek = academicYear === currentWeekInfo?.academicYear && 
                        academicWeek === currentWeekInfo?.academicWeek;

  return (
    <Box>
      <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <CalendarToday sx={{ color: theme.palette.primary.main }} />
            <Box>
              <Typography variant="h6" fontWeight="bold">
                Semana {academicWeek || data.week} do Ano Letivo {academicYear || data.year}
                {isCurrentWeek && (
                  <Chip label="ATUAL" size="small" color="primary" sx={{ ml: 1, fontWeight: 'bold' }} />
                )}
              </Typography>
              {data.weekRange.start && data.weekRange.end && (
                <Typography variant="caption" color="text.secondary">
                  {dayjs(data.weekRange.start).format('DD/MM')} - {dayjs(data.weekRange.end).format('DD/MM/YYYY')}
                </Typography>
              )}
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton size="small" onClick={handlePrevWeek} disabled={academicWeek === null || academicWeek <= 1}>
              <NavigateBefore />
            </IconButton>
            <TextField
              select
              value={academicWeek || 1}
              onChange={(e) => setAcademicWeek(Number(e.target.value))}
              size="small"
              sx={{ width: 120 }}
              label="Semana"
            >
              {Array.from({ length: 50 }, (_, i) => i + 1).map((w) => (
                <MenuItem key={w} value={w}>
                  Semana {w}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              value={academicYear || new Date().getFullYear()}
              onChange={(e) => setAcademicYear(Number(e.target.value))}
              size="small"
              sx={{ width: 100 }}
              label="Ano"
            >
              {[new Date().getFullYear(), new Date().getFullYear() - 1, new Date().getFullYear() - 2].map((y) => (
                <MenuItem key={y} value={y}>
                  {y}
                </MenuItem>
              ))}
            </TextField>
            <IconButton size="small" onClick={handleNextWeek}>
              <NavigateNext />
            </IconButton>
          </Box>
        </Box>
      </Paper>

      {!hasClubs && data.note && (
        <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2, border: `2px solid ${theme.palette.warning.main}`, bgcolor: theme.palette.warning.main + '08' }}>
          <Typography variant="h6" fontWeight="bold" color="warning.main" gutterBottom>
            ⚠️ {data.note}
          </Typography>
          {data.period && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Período letivo: {dayjs(data.period.startDate).format('DD/MM/YYYY')} até {dayjs(data.period.endDate).format('DD/MM/YYYY')}
            </Typography>
          )}
        </Paper>
      )}

      {!hasClubs && !data.note && (
        <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
          <Typography color="text.secondary">Nenhum clubinho encontrado para esta semana.</Typography>
        </Paper>
      )}

      {hasClubs && (
        <>
      
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: `2px solid ${theme.palette.divider}` }}>
            <Typography variant="caption" color="text.secondary">
              Total de Clubinhos
            </Typography>
            <Typography variant="h5" fontWeight="bold" color="primary">
              {data.summary.totalClubs}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: `2px solid ${theme.palette.divider}` }}>
            <Typography variant="caption" color="text.secondary">
              Com Pagela
            </Typography>
            <Typography variant="h5" fontWeight="bold" color="success.main">
              {data.summary.clubsWithPagela}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: `2px solid ${theme.palette.divider}` }}>
            <Typography variant="caption" color="text.secondary">
              Faltaram
            </Typography>
            <Typography variant="h5" fontWeight="bold" color="error.main">
              {data.summary.clubsMissing}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: `2px solid ${theme.palette.divider}` }}>
            <Typography variant="caption" color="text.secondary">
              Taxa de Frequência
            </Typography>
            <Typography variant="h5" fontWeight="bold" color={data.summary.attendanceRate >= 80 ? 'success.main' : 'warning.main'}>
              {data.summary.attendanceRate.toFixed(1)}%
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: `2px solid ${theme.palette.divider}` }}>
            <Typography variant="caption" color="text.secondary">
              Clubinhos Ativos
            </Typography>
            <Typography variant="h5" fontWeight="bold" color="info.main">
              {data.summary.clubsActive}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 2,
          background: `linear-gradient(135deg, ${theme.palette.primary.main}08 0%, ${theme.palette.success.main}08 100%)`,
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2" fontWeight={600}>
            Frequência Geral da Semana
          </Typography>
          <Typography variant="body2" fontWeight="bold" color="primary">
            {data.summary.clubsWithPagela} de {data.summary.clubsActive} clubinhos
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={data.summary.attendanceRate}
          sx={{
            height: 12,
            borderRadius: 6,
            bgcolor: `${theme.palette.error.main}20`,
            '& .MuiLinearProgress-bar': {
              borderRadius: 6,
              background: `linear-gradient(90deg, ${theme.palette.success.main} 0%, ${theme.palette.primary.main} 100%)`,
            },
          }}
        />
      </Paper>

      {isMobile ? (
        <Stack spacing={1.5}>
          {data.clubs.map((club) => {
            const statusConfig = getStatusConfig(club.status);
            return (
              <Card
                key={club.clubId}
                elevation={1}
                sx={{
                  borderRadius: 1.5,
                  border: `1.5px solid ${statusConfig.color}40`,
                  bgcolor: statusConfig.bgcolor,
                }}
              >
                <CardContent sx={{ p: { xs: 1, sm: 2 }, '&:last-child': { pb: { xs: 1, sm: 2 } } }}>
                  <Stack spacing={1}>
                    
                    <Box>
                      <Typography fontWeight="bold" sx={{ fontSize: { xs: '0.85rem', sm: '1.125rem' } }}>
                        Clubinho #{club.clubNumber}
                      </Typography>
                    </Box>

                    <Divider sx={{ my: 0.5 }} />

                    <Grid container spacing={1}>
                      <Grid item xs={6}>
                        <Box>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
                            Dia da Semana
                          </Typography>
                          <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', sm: '1rem' } }}>
                            {weekdayNames[club.weekday] || club.weekday}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
                            Data Esperada
                          </Typography>
                          <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', sm: '1rem' } }}>
                            {dayjs(club.expectedDate).format('DD/MM/YYYY')}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>

                    <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', mt: 0.5 }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
                          Pagelas
                        </Typography>
                        <Box sx={{ mt: 0.25 }}>
                          {club.hasPagela ? (
                            <Chip 
                              label={club.totalPagelas || 0} 
                              size="small" 
                              color="success" 
                              sx={{ 
                                fontSize: { xs: '0.65rem', sm: '0.75rem' },
                                height: { xs: 20, sm: 24 },
                                '& .MuiChip-label': { px: { xs: 0.75, sm: 1 } }
                              }} 
                            />
                          ) : (
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.8rem', sm: '1rem' } }}>
                              -
                            </Typography>
                          )}
                        </Box>
                      </Box>
                      <Box>
                        <Chip
                          icon={statusConfig.icon}
                          label={statusConfig.label}
                          size="small"
                          sx={{
                            bgcolor: statusConfig.bgcolor,
                            color: statusConfig.color,
                            border: `1px solid ${statusConfig.color}`,
                            fontWeight: 600,
                            fontSize: { xs: '0.65rem', sm: '0.75rem' },
                            height: { xs: 20, sm: 24 },
                            '& .MuiChip-icon': { fontSize: { xs: 14, sm: 16 } },
                            '& .MuiChip-label': { px: { xs: 0.75, sm: 1 } }
                          }}
                        />
                      </Box>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            );
          })}
        </Stack>
      ) : (
        
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{ borderRadius: 2, border: `2px solid ${theme.palette.divider}` }}
        >
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'primary.main' }}>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Clubinho</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Dia da Semana</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Data Esperada</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">
                  Pagelas
                </TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">
                  Status
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.clubs.map((club) => {
                const statusConfig = getStatusConfig(club.status);
                return (
                  <TableRow
                    key={club.clubId}
                    hover
                    sx={{
                      bgcolor: statusConfig.bgcolor,
                    }}
                  >
                    <TableCell>
                      <Typography fontWeight="bold" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>Clubinho #{club.clubNumber}</Typography>
                    </TableCell>
                    <TableCell sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>{weekdayNames[club.weekday] || club.weekday}</TableCell>
                    <TableCell sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>{dayjs(club.expectedDate).format('DD/MM/YYYY')}</TableCell>
                    <TableCell align="center">
                      {club.hasPagela ? (
                        <Chip label={club.totalPagelas || 0} size="small" color="success" />
                      ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                          -
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        icon={statusConfig.icon}
                        label={statusConfig.label}
                        size="small"
                        sx={{
                          bgcolor: statusConfig.bgcolor,
                          color: statusConfig.color,
                          border: `1px solid ${statusConfig.color}`,
                          fontWeight: 600,
                        }}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {data.pagination && (
        <Box sx={{ px: { xs: 1, sm: 0 }, mt: 2 }}>
          <TablePagination
            component="div"
            count={data.pagination.total}
            page={data.pagination.page - 1}
            onPageChange={(event, newPage) => setPage(newPage + 1)}
            rowsPerPage={data.pagination.limit}
            onRowsPerPageChange={(event) => {
              setLimit(parseInt(event.target.value, 10));
              setPage(1);
            }}
            rowsPerPageOptions={isMobile ? [5, 10, 20] : [10, 20, 50, 100]}
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
        </>
      )}
    </Box>
  );
};

