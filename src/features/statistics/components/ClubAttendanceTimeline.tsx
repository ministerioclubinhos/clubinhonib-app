import React from 'react';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  useTheme,
  Grid,
  Chip,
  LinearProgress,
  Alert,
  AlertTitle,
  TextField,
  MenuItem,
  Button,
  TablePagination,
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  Warning,
  Info,
  CalendarToday,
  TrendingUp,
  TrendingDown,
} from '@mui/icons-material';
import { useClubAttendance, useClubs } from '../hooks';
import dayjs from 'dayjs';

export const ClubAttendanceTimeline: React.FC = () => {
  const theme = useTheme();
  const currentYear = new Date().getFullYear();
  const [selectedClubId, setSelectedClubId] = React.useState<string>('');
  const [year, setYear] = React.useState(currentYear);
  // ⭐ Paginação v2.5.0
  const [timelinePage, setTimelinePage] = React.useState(1);
  const [timelineLimit, setTimelineLimit] = React.useState(50);
  const [missingWeeksPage, setMissingWeeksPage] = React.useState(1);

  const { data: clubsData } = useClubs({ page: 1, limit: 100 });
  const { data, isLoading } = useClubAttendance(selectedClubId, { 
    year, 
    page: timelinePage, 
    limit: timelineLimit 
  });

  // Selecionar primeiro clube automaticamente
  React.useEffect(() => {
    if (!selectedClubId && clubsData?.clubs && clubsData.clubs.length > 0) {
      setSelectedClubId(clubsData.clubs[0].clubId);
    }
  }, [clubsData, selectedClubId]);

  // ⭐ Reset página ao mudar clube/ano v2.5.0
  React.useEffect(() => {
    setTimelinePage(1);
    setMissingWeeksPage(1);
  }, [selectedClubId, year]);

  const getSeverityColor = (severity: 'info' | 'warning' | 'critical') => {
    switch (severity) {
      case 'critical':
        return theme.palette.error.main;
      case 'warning':
        return theme.palette.warning.main;
      default:
        return theme.palette.info.main;
    }
  };

  const getSeverityIcon = (severity: 'info' | 'warning' | 'critical') => {
    switch (severity) {
      case 'critical':
        return <Cancel />;
      case 'warning':
        return <Warning />;
      default:
        return <Info />;
    }
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

  return (
    <Box>
      {/* Seleção de Clubinho */}
      <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              select
              label="Selecione um Clubinho"
              value={selectedClubId}
              onChange={(e) => setSelectedClubId(e.target.value)}
              size="small"
            >
              {clubsData?.clubs.map((club) => (
                <MenuItem key={club.clubId} value={club.clubId}>
                  Clubinho #{club.clubNumber} - {club.weekday} - {club.address.city}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              select
              label="Ano"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              size="small"
            >
              {[currentYear, currentYear - 1, currentYear - 2].map((y) => (
                <MenuItem key={y} value={y}>
                  {y}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {!selectedClubId ? (
        <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
          <Typography color="text.secondary">Selecione um clubinho para ver a frequência</Typography>
        </Paper>
      ) : !data ? (
        <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        </Paper>
      ) : (
        <>
          {/* Cards de Resumo */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  background: `linear-gradient(135deg, ${theme.palette.success.main}15 0%, ${theme.palette.success.main}05 100%)`,
                  border: `2px solid ${theme.palette.success.main}30`,
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  Taxa de Frequência
                </Typography>
                <Typography variant="h4" fontWeight="bold" color="success.main">
                  {data.attendance.attendanceRate.toFixed(1)}%
                </Typography>
                <Chip
                  icon={<CheckCircle />}
                  label={`${data.attendance.weeksWithPagela}/${data.attendance.weeksExpected} semanas`}
                  size="small"
                  color="success"
                  sx={{ mt: 1 }}
                />
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  background: `linear-gradient(135deg, ${theme.palette.warning.main}15 0%, ${theme.palette.warning.main}05 100%)`,
                  border: `2px solid ${theme.palette.warning.main}30`,
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  Semanas Faltantes
                </Typography>
                <Typography variant="h4" fontWeight="bold" color="warning.main">
                  {data.attendance.weeksMissing}
                </Typography>
                <Chip
                  icon={<Warning />}
                  label={data.attendance.weeksMissing === 0 ? 'Nenhuma' : 'Atenção!'}
                  size="small"
                  color={data.attendance.weeksMissing === 0 ? 'success' : 'warning'}
                  sx={{ mt: 1 }}
                />
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.primary.main}05 100%)`,
                  border: `2px solid ${theme.palette.primary.main}30`,
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  Sequência Atual
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="h4" fontWeight="bold" color="primary">
                    {data.attendance.consecutiveWeeksPresent}
                  </Typography>
                  <TrendingUp sx={{ color: theme.palette.success.main }} />
                </Box>
                <Typography variant="caption" color="text.secondary">
                  semanas consecutivas
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  background: `linear-gradient(135deg, ${theme.palette.info.main}15 0%, ${theme.palette.info.main}05 100%)`,
                  border: `2px solid ${theme.palette.info.main}30`,
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  Período
                </Typography>
                <Typography variant="h6" fontWeight="bold" color="info.main">
                  {data.period.activeWeeks} semanas
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  de {data.period.totalWeeks} do ano
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Alertas */}
          {data.alerts && data.alerts.length > 0 && (
            <Box sx={{ mb: 3 }}>
              {data.alerts.map((alert, index) => (
                <Alert
                  key={index}
                  severity={alert.severity}
                  icon={getSeverityIcon(alert.severity)}
                  sx={{ mb: 1 }}
                >
                  <AlertTitle sx={{ fontWeight: 'bold', textTransform: 'capitalize' }}>
                    {alert.type.replace(/_/g, ' ')}
                  </AlertTitle>
                  {alert.message}
                </Alert>
              ))}
            </Box>
          )}

          {/* Timeline Visual */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.primary.main}03 100%)`,
              border: `2px solid ${theme.palette.divider}`,
            }}
          >
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                📅 Timeline Semanal - {year}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {dayjs(data.period.startDate).format('DD/MM/YYYY')} até{' '}
                {dayjs(data.period.endDate).format('DD/MM/YYYY')}
              </Typography>
            </Box>

            {/* Grid de Semanas */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))',
                gap: 1,
              }}
            >
              {data.timeline.map((week) => (
                <Box
                  key={`${week.year}-${week.week}`}
                  sx={{
                    p: 1,
                    borderRadius: 1,
                    textAlign: 'center',
                    bgcolor: week.hasPagela
                      ? `${theme.palette.success.main}20`
                      : `${theme.palette.error.main}20`,
                    border: `2px solid ${
                      week.hasPagela ? theme.palette.success.main : theme.palette.error.main
                    }`,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'scale(1.05)',
                      boxShadow: 2,
                    },
                  }}
                >
                  <Typography variant="caption" fontWeight="bold" display="block">
                    S{week.week}
                  </Typography>
                  {week.hasPagela ? (
                    <CheckCircle sx={{ fontSize: 20, color: theme.palette.success.main }} />
                  ) : (
                    <Cancel sx={{ fontSize: 20, color: theme.palette.error.main }} />
                  )}
                  {week.hasPagela && week.totalPagelas && (
                    <Typography variant="caption" display="block" color="text.secondary">
                      {week.totalPagelas}
                    </Typography>
                  )}
                </Box>
              ))}
            </Box>

            {/* Legenda */}
            <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <CheckCircle sx={{ color: theme.palette.success.main }} />
                <Typography variant="caption">Com Pagela</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Cancel sx={{ color: theme.palette.error.main }} />
                <Typography variant="caption">Sem Pagela</Typography>
              </Box>
            </Box>

            {/* ⭐ Paginação Timeline v2.5.0 */}
            {data.timelinePagination && (
              <TablePagination
                component="div"
                count={data.timelinePagination.total}
                page={data.timelinePagination.page - 1}
                onPageChange={(event, newPage) => setTimelinePage(newPage + 1)}
                rowsPerPage={data.timelinePagination.limit}
                onRowsPerPageChange={(event) => {
                  setTimelineLimit(parseInt(event.target.value, 10));
                  setTimelinePage(1);
                }}
                rowsPerPageOptions={[25, 50, 100]}
                labelRowsPerPage="Semanas por página:"
                labelDisplayedRows={({ from, to, count }) => 
                  `${from}-${to} de ${count !== -1 ? count : `mais de ${to}`}`
                }
                sx={{ borderTop: 1, borderColor: 'divider', mt: 2 }}
              />
            )}
          </Paper>

          {data.missingWeeks && data.missingWeeks.length > 0 ? (
            <Paper
              elevation={0}
              sx={{
                p: 3,
                mt: 3,
                borderRadius: 3,
                background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.warning.main}03 100%)`,
                border: `2px solid ${theme.palette.divider}`,
              }}
            >
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                ⚠️ Semanas Faltantes ({data.missingWeeksPagination?.total || data.missingWeeks.length})
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {data.missingWeeks.map((week, index) => (
                  <Box
                    key={index}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: `${getSeverityColor(week.severity)}10`,
                      border: `1px solid ${getSeverityColor(week.severity)}40`,
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold">
                          Semana {week.week} - {dayjs(week.expectedDate).format('DD/MM/YYYY')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {dayjs(week.weekRange.start).format('DD/MM')} até{' '}
                          {dayjs(week.weekRange.end).format('DD/MM/YYYY')}
                        </Typography>
                      </Box>
                      <Chip
                        icon={getSeverityIcon(week.severity)}
                        label={week.severity}
                        size="small"
                        sx={{
                          bgcolor: `${getSeverityColor(week.severity)}20`,
                          color: getSeverityColor(week.severity),
                          fontWeight: 600,
                        }}
                      />
                    </Box>
                  </Box>
                ))}
              </Box>

              {/* ⭐ Paginação Missing Weeks v2.5.0 */}
              {data.missingWeeksPagination && data.missingWeeksPagination.totalPages > 1 && (
                <TablePagination
                  component="div"
                  count={data.missingWeeksPagination.total}
                  page={data.missingWeeksPagination.page - 1}
                  onPageChange={(event, newPage) => setMissingWeeksPage(newPage + 1)}
                  rowsPerPage={data.missingWeeksPagination.limit}
                  rowsPerPageOptions={[]}
                  labelDisplayedRows={({ from, to, count }) => 
                    `${from}-${to} de ${count !== -1 ? count : `mais de ${to}`}`
                  }
                  sx={{ borderTop: 1, borderColor: 'divider', mt: 2 }}
                />
              )}
            </Paper>
          ) : (
            <Paper
              elevation={0}
              sx={{
                p: 3,
                mt: 3,
                borderRadius: 3,
                border: `1px solid ${theme.palette.divider}`,
                bgcolor: theme.palette.success.main + '08',
              }}
            >
              <Typography variant="h6" fontWeight="bold" color="success.main" gutterBottom>
                ✅ Nenhuma Semana Faltante
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Este clubinho teve pagela em todas as semanas esperadas do período letivo.
              </Typography>
            </Paper>
          )}
        </>
      )}
    </Box>
  );
};

