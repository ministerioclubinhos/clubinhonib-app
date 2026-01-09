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
  Chip,
  Grid,
  Alert,
  AlertTitle,
  IconButton,
  Collapse,
  useTheme,
  LinearProgress,
  Button,
  Divider,
  Stack,
  Tooltip,
  Badge,
  TablePagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  Card,
  CardContent,
  useMediaQuery,
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  Warning,
  Info,
  ExpandMore,
  ExpandLess,
  PersonOff,
  HourglassEmpty, // ⭐ v1.8.2: Para status 'pending'
} from '@mui/icons-material';
import dayjs from 'dayjs';
import { ClubCheckResult, WeekCheckResult } from '../api';

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

const weekdayNames: Record<string, string> = {
  MONDAY: 'SEG',
  TUESDAY: 'TER',
  WEDNESDAY: 'QUA',
  THURSDAY: 'QUI',
  FRIDAY: 'SEX',
  SATURDAY: 'SÁB',
  monday: 'SEG',
  tuesday: 'TER',
  wednesday: 'QUA',
  thursday: 'QUI',
  friday: 'SEX',
  saturday: 'SÁB',
};

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

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'ok':
        return {
          icon: <CheckCircle fontSize="small" />,
          color: theme.palette.success.main,
          label: 'Completo',
          bgcolor: theme.palette.success.main + '15',
          borderColor: theme.palette.success.main,
        };
      case 'pending':
        return {
          icon: <HourglassEmpty fontSize="small" />,
          color: theme.palette.info.main,
          label: 'Pendente',
          bgcolor: theme.palette.info.main + '15',
          borderColor: theme.palette.info.main,
        };
      case 'partial':
        return {
          icon: <Warning fontSize="small" />,
          color: theme.palette.warning.main,
          label: 'Parcial',
          bgcolor: theme.palette.warning.main + '15',
          borderColor: theme.palette.warning.main,
        };
      case 'missing':
        return {
          icon: <Cancel fontSize="small" />,
          color: theme.palette.error.main,
          label: 'Faltando',
          bgcolor: theme.palette.error.main + '15',
          borderColor: theme.palette.error.main,
        };
      case 'exception':
        return {
          icon: <Info fontSize="small" />,
          color: theme.palette.info.main,
          label: 'Exceção',
          bgcolor: theme.palette.info.main + '15',
          borderColor: theme.palette.info.main,
        };
      case 'inactive':
        return {
          icon: <Info fontSize="small" />,
          color: theme.palette.grey[600],
          label: 'Inativo',
          bgcolor: theme.palette.grey[100],
          borderColor: theme.palette.grey[400],
        };
      case 'out_of_period':
        return {
          icon: <Info fontSize="small" />,
          color: theme.palette.info.light,
          label: 'Fora do Período',
          bgcolor: theme.palette.info.light + '15',
          borderColor: theme.palette.info.light,
        };
      default:
        return {
          icon: <Info fontSize="small" />,
          color: theme.palette.grey[500],
          label: 'Desconhecido',
          bgcolor: theme.palette.grey[200],
          borderColor: theme.palette.grey[500],
        };
    }
  };

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case 'critical':
        return '🔴 Crítico';
      case 'warning':
        return '⚠️ Aviso';
      case 'info':
        return 'ℹ️ Info';
      case 'success':
        return '✅ Sucesso';
      default:
        return severity;
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{ borderRadius: 3, overflow: 'hidden', border: `1px solid ${theme.palette.divider}` }}
    >
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
          📋 Status Detalhado dos Clubes
        </Typography>
        <Chip
          label={
            statusFilter !== 'all' ||
            severityFilter !== 'all' ||
            weekdayFilter !== 'all' ||
            hasProblemsFilter !== null
              ? `${clubs.length} de ${data?.clubs?.length || 0} clubes (filtrados)`
              : `${data?.clubs?.length || 0} de ${data?.pagination?.total || 0} clubes`
          }
          sx={{
            bgcolor: 'white',
            color: theme.palette.primary.main,
            fontWeight: 'bold',
            fontSize: { xs: '0.75rem', sm: '0.875rem' },
          }}
        />
      </Box>

      {/* Filtros locais para a lista de clubes */}
      <Box
        sx={{
          p: { xs: 1.5, sm: 2 },
          bgcolor: 'grey.50',
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Grid container spacing={{ xs: 1.5, sm: 2 }} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
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
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
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
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
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
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
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
          </Grid>
        </Grid>

        {/* Chips de filtros ativos */}
        {(statusFilter !== 'all' ||
          severityFilter !== 'all' ||
          weekdayFilter !== 'all' ||
          hasProblemsFilter !== null) && (
          <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              Filtros ativos:
            </Typography>
            {statusFilter !== 'all' && (
              <Chip
                label={`Status: ${getStatusConfig(statusFilter).label || statusFilter}`}
                size="small"
                onDelete={() => onStatusFilterChange('all')}
                color="primary"
                variant="outlined"
              />
            )}
            {severityFilter !== 'all' && (
              <Chip
                label={`Severidade: ${getSeverityLabel(severityFilter)}`}
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

      {/* Versão Mobile: Cards */}
      {isMobile ? (
        <Box sx={{ p: { xs: 1, sm: 2 } }}>
          {clubs.map((club) => {
            const statusConfig = getStatusConfig(club.status);
            const isExpanded = expandedClubs.has(club.clubId);
            const completeness =
              club.children.total > 0 ? (club.children.withPagela / club.children.total) * 100 : 0;

            return (
              <Card
                key={club.clubId}
                elevation={2}
                sx={{
                  mb: 2,
                  border: `2px solid ${statusConfig.borderColor}40`,
                  bgcolor: statusConfig.bgcolor,
                  borderRadius: 2,
                  overflow: 'hidden',
                }}
              >
                <CardContent
                  sx={{ p: { xs: 1.5, sm: 2 }, cursor: 'pointer' }}
                  onClick={() => onToggleExpanded(club.clubId)}
                >
                  <Stack spacing={1.5}>
                    {/* Header do Card */}
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ flex: 1 }}>
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            bgcolor: statusConfig.color + '20',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 'bold',
                            color: statusConfig.color,
                            fontSize: '1rem',
                          }}
                        >
                          {club.clubNumber}
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography
                            variant="subtitle1"
                            fontWeight="bold"
                            sx={{ fontSize: { xs: '0.95rem', sm: '1rem' } }}
                          >
                            Clubinho #{club.clubNumber}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                          >
                            {club.week.expectedDate
                              ? dayjs(club.week.expectedDate).format('DD/MM/YYYY')
                              : 'Sem data'}
                          </Typography>
                        </Box>
                      </Stack>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleExpanded(club.clubId);
                        }}
                      >
                        {isExpanded ? <ExpandLess /> : <ExpandMore />}
                      </IconButton>
                    </Box>

                    {/* Informações Principais */}
                    <Grid container spacing={1.5}>
                      <Grid item xs={6}>
                        <Box>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                          >
                            Dia da Semana
                          </Typography>
                          <Box sx={{ mt: 0.5 }}>
                            {club.weekday ? (
                              <Chip
                                label={weekdayNames[club.weekday] || club.weekday}
                                size="small"
                                variant="outlined"
                                sx={{
                                  fontWeight: 'bold',
                                  fontSize: { xs: '0.7rem', sm: '0.75rem' },
                                }}
                              />
                            ) : (
                              <Chip
                                label="N/D"
                                size="small"
                                variant="outlined"
                                color="default"
                                sx={{
                                  fontWeight: 'bold',
                                  opacity: 0.5,
                                  fontSize: { xs: '0.7rem', sm: '0.75rem' },
                                }}
                              />
                            )}
                          </Box>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                          >
                            Crianças
                          </Typography>
                          <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.5 }}>
                            <Typography
                              variant="body2"
                              fontWeight="bold"
                              sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                            >
                              {club.children.withPagela}/{club.children.total}
                            </Typography>
                            {club.children.missing > 0 && (
                              <Badge
                                badgeContent={club.children.missing}
                                color={club.status === 'pending' ? 'info' : 'error'}
                              >
                                <PersonOff
                                  fontSize="small"
                                  sx={{
                                    color:
                                      club.status === 'pending'
                                        ? theme.palette.info.main
                                        : theme.palette.error.main,
                                  }}
                                />
                              </Badge>
                            )}
                          </Stack>
                        </Box>
                      </Grid>
                    </Grid>

                    {/* Completude */}
                    <Box>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          mb: 0.5,
                        }}
                      >
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                        >
                          Completude
                        </Typography>
                        <Typography
                          variant="caption"
                          fontWeight="bold"
                          sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                        >
                          {completeness.toFixed(0)}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={completeness}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          bgcolor: statusConfig.bgcolor,
                          '& .MuiLinearProgress-bar': {
                            bgcolor: statusConfig.color,
                            borderRadius: 3,
                          },
                        }}
                      />
                    </Box>

                    {/* Status */}
                    <Box>
                      <Chip
                        icon={statusConfig.icon}
                        label={statusConfig.label}
                        size="small"
                        sx={{
                          bgcolor: statusConfig.bgcolor,
                          color: statusConfig.color,
                          border: `2px solid ${statusConfig.borderColor}`,
                          fontWeight: 'bold',
                          fontSize: { xs: '0.7rem', sm: '0.75rem' },
                        }}
                      />
                    </Box>
                  </Stack>
                </CardContent>

                {/* Detalhes Expansíveis */}
                <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                  <Box
                    sx={{
                      p: { xs: 1.5, sm: 2 },
                      bgcolor: 'grey.50',
                      borderTop: `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    {/* Alertas */}
                    {club.alerts && club.alerts.length > 0 && (
                      <Box sx={{ mb: 2 }}>
                        {club.alerts.map((alert, index) => (
                          <Alert key={index} severity={alert.severity as any} sx={{ mb: 1 }}>
                            <Typography
                              variant="body2"
                              sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                            >
                              {alert.message}
                            </Typography>
                          </Alert>
                        ))}
                      </Box>
                    )}

                    {/* Indicators */}
                    {club.indicators && club.indicators.length > 0 && (
                      <Box sx={{ mb: 2 }}>
                        {club.indicators.map((indicator, index) => (
                          <Alert key={index} severity={indicator.severity as any} sx={{ mb: 1 }}>
                            <Typography
                              variant="body2"
                              fontWeight="bold"
                              sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                            >
                              {indicator.message}
                            </Typography>
                            {indicator.type === 'children_not_attending' &&
                              indicator.details?.childrenList &&
                              indicator.details.childrenList.length > 0 && (
                                <Box sx={{ mt: 1.5 }}>
                                  <Typography
                                    variant="caption"
                                    fontWeight="bold"
                                    display="block"
                                    gutterBottom
                                    sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                                  >
                                    Crianças que não frequentam mais:
                                  </Typography>
                                  <List dense sx={{ pl: 0 }}>
                                    {indicator.details.childrenList.map((child) => (
                                      <Box
                                        key={child.childId}
                                        sx={{
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: 1,
                                          py: 0.5,
                                          px: 1,
                                          borderRadius: 1,
                                          bgcolor: 'rgba(0,0,0,0.03)',
                                          mb: 0.5,
                                        }}
                                      >
                                        <PersonOff fontSize="small" color="disabled" />
                                        <Typography
                                          variant="caption"
                                          sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                                        >
                                          <strong>{child.childName}</strong>
                                          {child.reason && (
                                            <Typography
                                              component="span"
                                              variant="caption"
                                              color="text.secondary"
                                              sx={{
                                                ml: 1,
                                                fontSize: { xs: '0.65rem', sm: '0.7rem' },
                                              }}
                                            >
                                              ({child.reason})
                                            </Typography>
                                          )}
                                        </Typography>
                                      </Box>
                                    ))}
                                  </List>
                                </Box>
                              )}
                            {indicator.type === 'club_inactive' && indicator.details?.note && (
                              <Typography
                                variant="caption"
                                display="block"
                                sx={{ mt: 1, fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                              >
                                {indicator.details.note}
                              </Typography>
                            )}
                            {indicator.details?.note && indicator.type !== 'club_inactive' && (
                              <Typography
                                variant="caption"
                                display="block"
                                sx={{
                                  mt: 1,
                                  fontStyle: 'italic',
                                  fontSize: { xs: '0.7rem', sm: '0.75rem' },
                                }}
                              >
                                {indicator.details.note}
                              </Typography>
                            )}
                          </Alert>
                        ))}
                      </Box>
                    )}

                    {/* Informações sobre Crianças */}
                    {(club.children.activeCount !== undefined ||
                      club.children.inactiveCount !== undefined ||
                      club.children.note) && (
                      <Paper
                        elevation={0}
                        sx={{
                          p: 1.5,
                          mb: 2,
                          borderRadius: 2,
                          border: `2px solid ${theme.palette.info.main}30`,
                          bgcolor: theme.palette.info.main + '08',
                        }}
                      >
                        <Typography
                          variant="subtitle2"
                          fontWeight="bold"
                          color="info.main"
                          gutterBottom
                          sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                        >
                          ℹ️ Informações sobre Crianças
                        </Typography>
                        <Divider sx={{ my: 1 }} />
                        <Stack spacing={1}>
                          {club.children.activeCount !== undefined && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <CheckCircle fontSize="small" color="success" />
                              <Typography
                                variant="body2"
                                sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                              >
                                <strong>{club.children.activeCount}</strong> criança(s) ativa(s)
                              </Typography>
                            </Box>
                          )}
                          {club.children.inactiveCount !== undefined &&
                            club.children.inactiveCount > 0 && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <PersonOff fontSize="small" color="disabled" />
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                                >
                                  <strong>{club.children.inactiveCount}</strong> criança(s)
                                  inativa(s)
                                </Typography>
                              </Box>
                            )}
                          {club.children.note && (
                            <Alert severity="info" sx={{ mt: 1 }}>
                              <Typography
                                variant="caption"
                                sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                              >
                                {club.children.note}
                              </Typography>
                            </Alert>
                          )}
                        </Stack>
                      </Paper>
                    )}

                    {/* Lista de Crianças Faltantes */}
                    {club.children.missing > 0 && club.children.missingList && (
                      <Paper
                        elevation={0}
                        sx={{ p: 1.5, borderRadius: 2, border: '2px solid #ff980050' }}
                      >
                        <Typography
                          variant="subtitle2"
                          fontWeight="bold"
                          color="error"
                          gutterBottom
                          sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                        >
                          ⚠️ Crianças Sem Pagela ({club.children.missing}):
                        </Typography>
                        <Divider sx={{ my: 1 }} />
                        <Stack spacing={0.75}>
                          {club.children.missingList.map((child) => (
                            <Box
                              key={child.childId}
                              sx={{
                                p: 1,
                                bgcolor: 'white',
                                borderRadius: 1,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                              }}
                            >
                              <PersonOff fontSize="small" color="error" />
                              <Typography
                                variant="body2"
                                sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                              >
                                {child.childName}
                              </Typography>
                            </Box>
                          ))}
                        </Stack>
                      </Paper>
                    )}

                    {/* Exceção */}
                    {club.exception && (
                      <Alert severity="info" sx={{ mt: 2 }}>
                        <AlertTitle sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                          ℹ️ Exceção Cadastrada
                        </AlertTitle>
                        <Typography
                          variant="body2"
                          sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                        >
                          {club.exception.reason || 'Exceção registrada para esta data'}
                        </Typography>
                      </Alert>
                    )}
                  </Box>
                </Collapse>
              </Card>
            );
          })}
        </Box>
      ) : (
        /* Versão Desktop: Tabela */
        <TableContainer
          sx={{
            maxHeight: 800,
            overflowX: 'auto',
            '&::-webkit-scrollbar': {
              height: 8,
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: 'grey.100',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'grey.400',
              borderRadius: 4,
            },
          }}
        >
          <Table stickyHeader sx={{ minWidth: 600 }}>
            <TableHead>
              <TableRow>
                <TableCell
                  width={50}
                  sx={{ bgcolor: 'grey.50', fontWeight: 'bold', minWidth: 50 }}
                ></TableCell>
                <TableCell sx={{ bgcolor: 'grey.50', fontWeight: 'bold', minWidth: 150 }}>
                  Clube
                </TableCell>
                <TableCell sx={{ bgcolor: 'grey.50', fontWeight: 'bold', minWidth: 100 }}>
                  Dia
                </TableCell>
                <TableCell sx={{ bgcolor: 'grey.50', fontWeight: 'bold', minWidth: 100 }}>
                  Crianças
                </TableCell>
                <TableCell
                  sx={{ bgcolor: 'grey.50', fontWeight: 'bold', minWidth: 120 }}
                  align="center"
                >
                  Completude
                </TableCell>
                <TableCell
                  sx={{ bgcolor: 'grey.50', fontWeight: 'bold', minWidth: 100 }}
                  align="center"
                >
                  Status
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {clubs.map((club) => {
                const statusConfig = getStatusConfig(club.status);
                const isExpanded = expandedClubs.has(club.clubId);
                const completeness =
                  club.children.total > 0
                    ? (club.children.withPagela / club.children.total) * 100
                    : 0;

                return (
                  <React.Fragment key={club.clubId}>
                    <TableRow
                      hover
                      sx={{
                        cursor: 'pointer',
                        bgcolor: statusConfig.bgcolor,
                        '&:hover': { bgcolor: statusConfig.bgcolor + '!important' },
                      }}
                      onClick={() => onToggleExpanded(club.clubId)}
                    >
                      <TableCell>
                        <IconButton size="small">
                          {isExpanded ? <ExpandLess /> : <ExpandMore />}
                        </IconButton>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Box
                            sx={{
                              width: 32,
                              height: 32,
                              borderRadius: '50%',
                              bgcolor: statusConfig.color + '20',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 'bold',
                              color: statusConfig.color,
                            }}
                          >
                            {club.clubNumber}
                          </Box>
                          <Box>
                            <Typography variant="body2" fontWeight="bold">
                              Clubinho #{club.clubNumber}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {club.week.expectedDate
                                ? dayjs(club.week.expectedDate).format('DD/MM/YYYY')
                                : 'Sem data'}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        {club.weekday ? (
                          <Chip
                            label={weekdayNames[club.weekday] || club.weekday}
                            size="small"
                            variant="outlined"
                            sx={{ fontWeight: 'bold' }}
                          />
                        ) : (
                          <Chip
                            label="N/D"
                            size="small"
                            variant="outlined"
                            color="default"
                            sx={{ fontWeight: 'bold', opacity: 0.5 }}
                            title="Não disponível"
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography variant="body2" fontWeight="bold">
                            {club.children.withPagela}/{club.children.total}
                          </Typography>
                          {club.children.missing > 0 && (
                            <Badge
                              badgeContent={club.children.missing}
                              color={club.status === 'pending' ? 'info' : 'error'}
                            >
                              <PersonOff
                                fontSize="small"
                                sx={{
                                  color:
                                    club.status === 'pending'
                                      ? theme.palette.info.main
                                      : theme.palette.error.main,
                                }}
                              />
                            </Badge>
                          )}
                          {/* ⭐ Indicador de crianças inativas v1.4.0 */}
                          {club.children.inactiveCount !== undefined &&
                            club.children.inactiveCount > 0 && (
                              <Tooltip
                                title={`${club.children.inactiveCount} criança(s) inativa(s) não considerada(s)`}
                              >
                                <Chip
                                  label={`${club.children.inactiveCount} inativa(s)`}
                                  size="small"
                                  variant="outlined"
                                  sx={{
                                    fontSize: '0.65rem',
                                    height: 20,
                                    bgcolor: 'grey.100',
                                    color: 'text.secondary',
                                  }}
                                />
                              </Tooltip>
                            )}
                        </Stack>
                      </TableCell>
                      <TableCell align="center">
                        <Box>
                          <Typography variant="body2" fontWeight="bold" color={statusConfig.color}>
                            {completeness.toFixed(0)}%
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={completeness}
                            sx={{
                              mt: 0.5,
                              height: 6,
                              borderRadius: 3,
                              bgcolor: statusConfig.bgcolor,
                              '& .MuiLinearProgress-bar': {
                                bgcolor: statusConfig.color,
                                borderRadius: 3,
                              },
                            }}
                          />
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          icon={statusConfig.icon}
                          label={statusConfig.label}
                          size="small"
                          sx={{
                            bgcolor: statusConfig.bgcolor,
                            color: statusConfig.color,
                            border: `2px solid ${statusConfig.borderColor}`,
                            fontWeight: 'bold',
                          }}
                        />
                      </TableCell>
                    </TableRow>

                    {/* Detalhes Expansíveis */}
                    <TableRow>
                      <TableCell colSpan={6} sx={{ p: 0, border: 'none' }}>
                        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                          <Box sx={{ p: 3, bgcolor: 'grey.50' }}>
                            {/* Alertas */}
                            {club.alerts && club.alerts.length > 0 && (
                              <Box sx={{ mb: 2 }}>
                                {club.alerts.map((alert, index) => (
                                  <Alert
                                    key={index}
                                    severity={alert.severity as any}
                                    sx={{ mb: 1 }}
                                  >
                                    {alert.message}
                                  </Alert>
                                ))}
                              </Box>
                            )}

                            {/* Indicators v1.5.0: Só são gerados dentro do período letivo */}
                            {/* ⭐ v1.4.0: Suporte para club_inactive e children_not_attending */}
                            {club.indicators && club.indicators.length > 0 && (
                              <Box sx={{ mb: 2 }}>
                                {club.indicators.map((indicator, index) => (
                                  <Alert
                                    key={index}
                                    severity={indicator.severity as any}
                                    sx={{ mb: 1 }}
                                  >
                                    <Typography variant="body2" fontWeight="bold">
                                      {indicator.message}
                                    </Typography>
                                    {/* ⭐ v1.4.0: Exibir lista de crianças para children_not_attending */}
                                    {indicator.type === 'children_not_attending' &&
                                      indicator.details?.childrenList &&
                                      indicator.details.childrenList.length > 0 && (
                                        <Box sx={{ mt: 1.5 }}>
                                          <Typography
                                            variant="caption"
                                            fontWeight="bold"
                                            display="block"
                                            gutterBottom
                                          >
                                            Crianças que não frequentam mais:
                                          </Typography>
                                          <List dense sx={{ pl: 0 }}>
                                            {indicator.details.childrenList.map((child) => (
                                              <Box
                                                key={child.childId}
                                                sx={{
                                                  display: 'flex',
                                                  alignItems: 'center',
                                                  gap: 1,
                                                  py: 0.5,
                                                  px: 1,
                                                  borderRadius: 1,
                                                  bgcolor: 'rgba(0,0,0,0.03)',
                                                  mb: 0.5,
                                                }}
                                              >
                                                <PersonOff fontSize="small" color="disabled" />
                                                <Typography variant="caption">
                                                  <strong>{child.childName}</strong>
                                                  {child.reason && (
                                                    <Typography
                                                      component="span"
                                                      variant="caption"
                                                      color="text.secondary"
                                                      sx={{ ml: 1 }}
                                                    >
                                                      ({child.reason})
                                                    </Typography>
                                                  )}
                                                </Typography>
                                              </Box>
                                            ))}
                                          </List>
                                        </Box>
                                      )}
                                    {/* ⭐ v1.4.0: Exibir detalhes para club_inactive */}
                                    {indicator.type === 'club_inactive' &&
                                      indicator.details?.note && (
                                        <Typography
                                          variant="caption"
                                          display="block"
                                          sx={{ mt: 1 }}
                                        >
                                          {indicator.details.note}
                                        </Typography>
                                      )}
                                    {/* Exibir nota geral se presente */}
                                    {indicator.details?.note &&
                                      indicator.type !== 'club_inactive' && (
                                        <Typography
                                          variant="caption"
                                          display="block"
                                          sx={{ mt: 1, fontStyle: 'italic' }}
                                        >
                                          {indicator.details.note}
                                        </Typography>
                                      )}
                                  </Alert>
                                ))}
                              </Box>
                            )}

                            {/* ⭐ Informações sobre Crianças Ativas/Inativas v1.4.0 */}
                            {(club.children.activeCount !== undefined ||
                              club.children.inactiveCount !== undefined ||
                              club.children.note) && (
                              <Paper
                                elevation={0}
                                sx={{
                                  p: 2,
                                  mb: 2,
                                  borderRadius: 2,
                                  border: `2px solid ${theme.palette.info.main}30`,
                                  bgcolor: theme.palette.info.main + '08',
                                }}
                              >
                                <Typography
                                  variant="subtitle2"
                                  fontWeight="bold"
                                  color="info.main"
                                  gutterBottom
                                >
                                  ℹ️ Informações sobre Crianças
                                </Typography>
                                <Divider sx={{ my: 1 }} />
                                <Stack spacing={1}>
                                  {club.children.activeCount !== undefined && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <CheckCircle fontSize="small" color="success" />
                                      <Typography variant="body2">
                                        <strong>{club.children.activeCount}</strong> criança(s)
                                        ativa(s) considerada(s) nos cálculos
                                      </Typography>
                                    </Box>
                                  )}
                                  {club.children.inactiveCount !== undefined &&
                                    club.children.inactiveCount > 0 && (
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <PersonOff fontSize="small" color="disabled" />
                                        <Typography variant="body2" color="text.secondary">
                                          <strong>{club.children.inactiveCount}</strong> criança(s)
                                          inativa(s) (não consideradas)
                                        </Typography>
                                      </Box>
                                    )}
                                  {club.children.note && (
                                    <Alert severity="info" sx={{ mt: 1 }}>
                                      <Typography variant="caption">
                                        {club.children.note}
                                      </Typography>
                                    </Alert>
                                  )}
                                </Stack>
                              </Paper>
                            )}

                            {/* Lista de Crianças Faltantes */}
                            {club.children.missing > 0 && club.children.missingList && (
                              <Paper
                                elevation={0}
                                sx={{ p: 2, borderRadius: 2, border: '2px solid #ff980050' }}
                              >
                                <Typography
                                  variant="subtitle2"
                                  fontWeight="bold"
                                  color="error"
                                  gutterBottom
                                >
                                  ⚠️ Crianças Sem Pagela ({club.children.missing}):
                                </Typography>
                                <Divider sx={{ my: 1 }} />
                                <Grid container spacing={1}>
                                  {club.children.missingList.map((child) => (
                                    <Grid item xs={12} sm={6} md={4} key={child.childId}>
                                      <Box
                                        sx={{
                                          p: 1,
                                          bgcolor: 'white',
                                          borderRadius: 1,
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: 1,
                                        }}
                                      >
                                        <PersonOff fontSize="small" color="error" />
                                        <Typography variant="body2">{child.childName}</Typography>
                                      </Box>
                                    </Grid>
                                  ))}
                                </Grid>
                              </Paper>
                            )}

                            {/* Exceção */}
                            {club.exception && (
                              <Alert severity="info" sx={{ mt: 2 }}>
                                <AlertTitle>ℹ️ Exceção Cadastrada</AlertTitle>
                                {club.exception.reason || 'Exceção registrada para esta data'}
                              </Alert>
                            )}
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* ⭐ Paginação do Backend para lista de clubes - Funciona em ambos (mobile e desktop) */}
      {(data?.pagination || clubs.length > 0) && (
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
            labelRowsPerPage="Clubes por página:"
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
