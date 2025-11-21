import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Alert,
  AlertTitle,
  CircularProgress,
  Button,
  useTheme,
} from '@mui/material';
import { Refresh } from '@mui/icons-material';
import { useWeekCheck, useCurrentWeek } from '../hooks';
import { ClubsListTable } from './ClubsListTable';
import { NoClubsMessage } from './NoClubsMessage';
import { WeekNavigationHeader } from './WeekNavigationHeader';
import { SummaryCards } from './SummaryCards';
import { ChildrenStatisticsCard } from './ChildrenStatisticsCard';
import { CriticalAlerts } from './CriticalAlerts';
import dayjs from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import 'dayjs/locale/pt-br';

dayjs.extend(weekOfYear);
dayjs.locale('pt-br');

const BACKEND_ENABLED = import.meta.env.VITE_CLUB_CONTROL_ENABLED === 'true';

const academicWeekToCalendarWeek = (
  academicWeek: number,
  academicYear: number,
  periodStartDate: string | null
): { year: number; week: number } | null => {
  if (!periodStartDate) return null;
  
  const startDate = dayjs(periodStartDate).startOf('week');
  const targetDate = startDate.add((academicWeek - 1) * 7, 'days');
  
  return {
    year: targetDate.year(),
    week: targetDate.week(),
  };
};

const calendarWeekToAcademicWeek = (
  calendarYear: number,
  calendarWeek: number,
  periodStartDate: string | null
): { academicYear: number; academicWeek: number } | null => {
  if (!periodStartDate) return null;
  
  const startDate = dayjs(periodStartDate);
  const targetDate = dayjs().year(calendarYear).week(calendarWeek).startOf('week');
  
  const weeksDiff = targetDate.diff(startDate.startOf('week'), 'week');
  const academicWeek = weeksDiff + 1;
  
  if (academicWeek < 1) return null;
  
  return {
    academicYear: startDate.year(),
    academicWeek,
  };
};

export const ControlDashboard: React.FC = () => {
  const theme = useTheme();
  
  const { data: currentWeekInfo } = useCurrentWeek();
  
  const [academicYear, setAcademicYear] = React.useState<number | null>(
    currentWeekInfo?.academicYear || null
  );
  const [academicWeek, setAcademicWeek] = React.useState<number | null>(
    currentWeekInfo?.academicWeek || null
  );
  
  const [expandedClubs, setExpandedClubs] = React.useState<Set<string>>(new Set());
  const [clubsPage, setClubsPage] = React.useState(1);
  const [clubsLimit, setClubsLimit] = React.useState(50);
  
  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  const [severityFilter, setSeverityFilter] = React.useState<string>('all');
  const [weekdayFilter, setWeekdayFilter] = React.useState<string>('all');
  const [hasProblemsFilter, setHasProblemsFilter] = React.useState<boolean | null>(null);
  
  const { 
    data, 
    isLoading, 
    error, 
    refetch 
  } = useWeekCheck(
    academicYear !== null ? academicYear : undefined, 
    academicWeek !== null ? academicWeek : undefined, 
    clubsPage, 
    clubsLimit
  );
  
  React.useEffect(() => {
    if (data?.year && data?.week) {
      const yearNum = typeof data.year === 'string' ? parseInt(data.year) : data.year;
      const weekNum = typeof data.week === 'string' ? parseInt(data.week) : data.week;
      
      if (academicYear !== yearNum || academicWeek !== weekNum) {
        setAcademicYear(yearNum);
        setAcademicWeek(weekNum);
      }
    } 
    else if ((academicYear === null || academicWeek === null) && 
             currentWeekInfo?.academicYear && currentWeekInfo?.academicWeek) {
      setAcademicYear(currentWeekInfo.academicYear);
      setAcademicWeek(currentWeekInfo.academicWeek);
    }
  }, [data?.year, data?.week, currentWeekInfo?.academicYear, currentWeekInfo?.academicWeek, academicYear, academicWeek]);
  
  const calendarWeek = React.useMemo(() => {
    if (!academicYear || !academicWeek || !currentWeekInfo?.periodStartDate) {
      const now = dayjs();
      return { year: now.year(), week: now.week() };
    }
    
    const converted = academicWeekToCalendarWeek(
      academicWeek,
      academicYear,
      currentWeekInfo.periodStartDate
    );
    
    return converted || { year: dayjs().year(), week: dayjs().week() };
  }, [academicYear, academicWeek, currentWeekInfo?.periodStartDate]);
  
  const isCurrentWeek = React.useMemo(() => {
    if (!currentWeekInfo?.academicYear || !currentWeekInfo?.academicWeek) return false;
    if (academicYear === null || academicWeek === null) return true;
    return academicYear === currentWeekInfo.academicYear && 
           academicWeek === currentWeekInfo.academicWeek;
  }, [academicYear, academicWeek, currentWeekInfo]);

  React.useEffect(() => {
    setClubsPage(1);
    setExpandedClubs(new Set());
  }, [academicYear, academicWeek]);

  const filteredClubs = React.useMemo(() => {
    if (!data?.clubs) return [];
    
    let filtered = [...data.clubs];

    if (statusFilter !== 'all') {
      filtered = filtered.filter(club => club.status === statusFilter);
    }

    if (severityFilter !== 'all') {
      filtered = filtered.filter(club => {
        if (!club.indicators || club.indicators.length === 0) return false;
        return club.indicators.some(ind => ind.severity === severityFilter);
      });
    }

    if (weekdayFilter !== 'all') {
      filtered = filtered.filter(club => {
        const clubWeekday = (club.weekday || '').toLowerCase();
        return clubWeekday === weekdayFilter.toLowerCase();
      });
    }

    if (hasProblemsFilter !== null) {
      if (hasProblemsFilter) {
        filtered = filtered.filter(club => 
          club.status !== 'ok' && 
          club.status !== 'pending' &&
          club.status !== 'exception' && 
          club.status !== 'out_of_period'
        );
      } else {
        filtered = filtered.filter(club => club.status === 'ok');
      }
    }

    return filtered;
  }, [data?.clubs, statusFilter, severityFilter, weekdayFilter, hasProblemsFilter]);

  const clubsToDisplay = filteredClubs;

  const currentWeekData = data?.currentWeek || currentWeekInfo;
  if (!BACKEND_ENABLED) {
    return (
      <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: `2px solid ${theme.palette.info.main}` }}>
        <Alert severity="info" sx={{ borderRadius: 2, mb: 3 }}>
          <AlertTitle>🚧 Módulo em Desenvolvimento</AlertTitle>
          <Typography variant="body2" gutterBottom>
            O <strong>Painel de Controle</strong> está aguardando a implementação do backend.
          </Typography>
        </Alert>

        <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.100', borderRadius: 2 }}>
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
            📋 Como Ativar (Quando o Backend Estiver Pronto):
          </Typography>
          <Typography variant="body2" component="ol" sx={{ pl: 2, m: 0 }}>
            <li>Crie um arquivo <code>.env</code> na raiz do projeto</li>
            <li>Adicione: <code>VITE_CLUB_CONTROL_ENABLED=true</code></li>
            <li>Reinicie o servidor de desenvolvimento</li>
            <li>O painel de controle estará ativo!</li>
          </Typography>
        </Box>

        <Box sx={{ p: 2, bgcolor: theme.palette.primary.main + '10', borderRadius: 2 }}>
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
            🎯 O Que Este Módulo Faz:
          </Typography>
          <Typography variant="body2" component="ul" sx={{ pl: 2, mb: 0 }}>
            <li><strong>Verificação em Tempo Real:</strong> Veja quais clubes lançaram pagelas</li>
            <li><strong>Detecção de Faltantes:</strong> Identifique crianças sem pagela</li>
            <li><strong>Gestão de Períodos:</strong> Configure ano letivo global</li>
            <li><strong>Exceções Globais:</strong> Cadastre feriados e eventos</li>
            <li><strong>Alertas Automáticos:</strong> Sistema de notificações por severidade</li>
          </Typography>
        </Box>
      </Paper>
    );
  }

  const toggleExpanded = (clubId: string) => {
    const newSet = new Set(expandedClubs);
    if (newSet.has(clubId)) {
      newSet.delete(clubId);
    } else {
      newSet.add(clubId);
    }
    setExpandedClubs(newSet);
  };

  const handlePrevWeek = () => {
    if (academicWeek !== null && academicWeek > 1) {
      setAcademicWeek(academicWeek - 1);
    } else if (academicWeek === 1 && academicYear !== null) {
    } else {
      if (currentWeekInfo?.academicYear && currentWeekInfo?.academicWeek) {
        if (currentWeekInfo.academicWeek > 1) {
          setAcademicYear(currentWeekInfo.academicYear);
          setAcademicWeek(currentWeekInfo.academicWeek - 1);
        }
      }
    }
  };

  const handleNextWeek = () => {
    if (academicWeek !== null) {
      setAcademicWeek(academicWeek + 1);
    } else {
      if (currentWeekInfo?.academicYear && currentWeekInfo?.academicWeek) {
        setAcademicYear(currentWeekInfo.academicYear);
        setAcademicWeek(currentWeekInfo.academicWeek + 1);
      }
    }
  };
  
  const handleGoToCurrent = () => {
    if (currentWeekInfo?.academicYear && currentWeekInfo?.academicWeek) {
      setAcademicYear(currentWeekInfo.academicYear);
      setAcademicWeek(currentWeekInfo.academicWeek);
    } else {
      if (data?.currentWeek?.academicYear && data?.currentWeek?.academicWeek) {
        setAcademicYear(data.currentWeek.academicYear);
        setAcademicWeek(data.currentWeek.academicWeek);
      }
    }
  };
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 8 }}>
        <CircularProgress size={60} />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Carregando dados de controle...
        </Typography>
      </Box>
    );
  }

  if (error) {
    const isNetworkError = error && typeof error === 'object' && 'code' in error && error.code === 'ERR_NETWORK';
    const is404 = error && typeof error === 'object' && 'response' in error && (error as any).response?.status === 404;
    
    return (
      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: `2px solid ${theme.palette.error.main}` }}>
        <Alert severity="error" sx={{ borderRadius: 2, mb: 2 }}>
          <AlertTitle>❌ Erro ao Carregar Dados do Painel de Controle</AlertTitle>
          {isNetworkError && (
            <Typography variant="body2">
              <strong>Erro de Rede:</strong> Não foi possível conectar ao servidor backend.
            </Typography>
          )}
          {is404 && (
            <Typography variant="body2">
              <strong>Endpoint não encontrado (404):</strong> O módulo de controle ainda não está implementado no backend.
            </Typography>
          )}
          {!isNetworkError && !is404 && (
            <Typography variant="body2">
              Não foi possível carregar os dados de controle.
            </Typography>
          )}
        </Alert>

        <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.100', borderRadius: 2 }}>
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
            🔧 Possíveis Soluções:
          </Typography>
          <Typography variant="body2" component="ul" sx={{ pl: 2, m: 0 }}>
            <li>Verifique se o backend está rodando em <code>http://localhost:3000</code></li>
            <li>Verifique se o módulo de controle está implementado no backend</li>
            <li>Teste o endpoint manualmente: <code>GET /club-control/dashboard</code></li>
            <li>Verifique o console do navegador (F12) para mais detalhes</li>
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button variant="contained" size="small" onClick={() => refetch()} startIcon={<Refresh />}>
            Tentar Novamente
          </Button>
          <Button 
            variant="outlined" 
            size="small" 
            onClick={() => window.open('http://localhost:3000/club-control/dashboard', '_blank')}
          >
            Testar Endpoint
          </Button>
        </Box>

        <Box sx={{ mt: 2, p: 1, bgcolor: 'grey.50', borderRadius: 1, fontSize: '0.75rem', fontFamily: 'monospace', overflow: 'auto', maxHeight: 200 }}>
          <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
            Detalhes do erro:
          </Typography>
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {error instanceof Error ? error.message : JSON.stringify(error, null, 2)}
          </pre>
        </Box>
      </Paper>
    );
  }

  if (!data) {
    return (
      <Alert severity="warning" sx={{ borderRadius: 2 }}>
        <AlertTitle>⚠️ Nenhum Dado Disponível</AlertTitle>
        Não há dados disponíveis para esta semana.
      </Alert>
    );
  }

  const weekStart = dayjs().year(calendarWeek.year).week(calendarWeek.week).startOf('week');
  const weekEnd = dayjs().year(calendarWeek.year).week(calendarWeek.week).endOf('week');

  const hasClubs = data.clubs && data.clubs.length > 0;

  const totalChildren = hasClubs ? data.clubs.reduce((sum, club) => sum + club.children.total, 0) : 0;
  const childrenWithPagela = hasClubs ? data.clubs.reduce((sum, club) => sum + club.children.withPagela, 0) : 0;
  const childrenMissing = totalChildren - childrenWithPagela;
  const overallCompleteness = totalChildren > 0 ? ((childrenWithPagela / totalChildren) * 100) : 100;

  const criticalAlerts = data?.criticalAlerts || (hasClubs ? data.clubs
    .filter(club => club.status === 'missing' && club.children.total > 5)
    .map(club => ({
      clubId: club.clubId,
      clubNumber: club.clubNumber,
      message: `Clube ${club.clubNumber} sem nenhuma pagela`,
      missingChildren: club.children.total,
    })) : []);

  return (
    <Box>
      <WeekNavigationHeader
        academicWeek={academicWeek}
        academicYear={academicYear}
        calendarWeek={calendarWeek}
        weekStart={weekStart}
        weekEnd={weekEnd}
        isCurrentWeek={isCurrentWeek}
        isWithinPeriod={currentWeekData?.isWithinPeriod}
        onPrevWeek={handlePrevWeek}
        onNextWeek={handleNextWeek}
        onGoToCurrent={handleGoToCurrent}
        onRefresh={() => refetch()}
      />

      <SummaryCards
        summary={data.summary}
        overallCompleteness={overallCompleteness}
        childrenWithPagela={childrenWithPagela}
        totalChildren={totalChildren}
      />

      <ChildrenStatisticsCard
        totalChildren={totalChildren}
        childrenWithPagela={childrenWithPagela}
        childrenMissing={childrenMissing}
      />

      <CriticalAlerts alerts={criticalAlerts} />

      {!hasClubs && data.note ? (
        <NoClubsMessage data={data} />
      ) : hasClubs ? (
        <ClubsListTable
          clubs={clubsToDisplay}
          data={data}
          expandedClubs={expandedClubs}
          onToggleExpanded={toggleExpanded}
          statusFilter={statusFilter}
          severityFilter={severityFilter}
          weekdayFilter={weekdayFilter}
          hasProblemsFilter={hasProblemsFilter}
          onStatusFilterChange={setStatusFilter}
          onSeverityFilterChange={setSeverityFilter}
          onWeekdayFilterChange={setWeekdayFilter}
          onHasProblemsFilterChange={setHasProblemsFilter}
          clubsPage={clubsPage}
          clubsLimit={clubsLimit}
          onPageChange={setClubsPage}
          onLimitChange={setClubsLimit}
          onExpandedClubsReset={() => setExpandedClubs(new Set())}
        />
      ) : null}
    </Box>
  );
};
