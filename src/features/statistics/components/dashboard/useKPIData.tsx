
import { useMemo, useState } from 'react';
import { useTheme } from '@mui/material';
import {
    People,
    Groups,
    School,
    Favorite,
    TrendingUp,
    EmojiEvents,
    Timeline,
    AutoAwesome,
} from '@mui/icons-material';
import { useOverview } from '../../hooks';
import { ATTENDANCE_EMPTY_MESSAGES, NO_DATA_PLACEHOLDER } from '../../constants';
import { sortWeeksAscending } from '../../utils/attendance';

export interface KPICategory {
    id: string;
    label: string;
    icon: React.ReactNode;
    color: string;
}

export const categories: KPICategory[] = [
    { id: 'overview', label: 'Visão Geral', icon: <Timeline />, color: '#6366f1' },
    { id: 'engagement', label: 'Engajamento', icon: <TrendingUp />, color: '#10b981' },
    { id: 'decisions', label: 'Decisões', icon: <Favorite />, color: '#f43f5e' },
    { id: 'performance', label: 'Performance', icon: <EmojiEvents />, color: '#f59e0b' },
];

export const useKPIData = () => {
    const theme = useTheme();
    const [activeCategory, setActiveCategory] = useState('overview');

    // Só `/statistics/overview`, que não recebe filtro: todos os números daqui
    // são de janelas fixas. A consulta de insights (filtrada) saiu junto com o
    // cartão "Top Performers", que mostrava o tamanho de uma lista limitada a
    // 20 pelo back como se fosse uma contagem.
    const { data: overview, isLoading, refetch: refetchOverview } = useOverview();

    const kpis = useMemo(() => {
        if (!overview) return { overview: [], engagement: [], decisions: [], performance: [] };

        return {
            overview: [
                {
                    title: 'Total Crianças',
                    value: overview.summary.totalChildren,
                    icon: <People />,
          color: theme.palette.primary.main,
                    tooltip: 'Número total de crianças cadastradas no sistema',
                    subtitle: `${overview.summary.activeChildrenThisMonth} ativos este mês`,
                },
                {
                    title: 'Clubinhos Ativos',
                    value: overview.summary.totalClubs,
                    icon: <Groups />,
          color: theme.palette.secondary.main,
                    tooltip: 'Número de clubinhos em funcionamento',
                    subtitle: overview.summary.inactiveClubs ? `${overview.summary.inactiveClubs} inativos` : undefined,
                },
                {
                    title: 'Professores',
                    value: overview.summary.totalTeachers,
                    icon: <School />,
          color: theme.palette.success.main,
                    tooltip: 'Total de professores cadastrados',
                },
                {
                    // Sem `previousValue`: o total cadastrado não é o "mês
                    // anterior", e usá-lo desenhava uma queda que não existe.
                    title: 'Ativos Este Mês',
                    value: overview.summary.activeChildrenThisMonth,
                    icon: <TrendingUp />,
          color: theme.palette.info.main,
                    suffix: 'crianças',
                    tooltip: 'Crianças que participaram este mês',
                },
            ],
            engagement: [
                {
                    title: 'Taxa Presença Semana',
                    // Sem pagela na janela (recesso, semana ainda não lançada)
                    // não existe taxa: "0%" seria lido como frequência ruim.
                    ...(overview.pagelas.thisWeek.total > 0
                        ? { value: overview.pagelas.thisWeek.presenceRate, suffix: '%' }
                        : {
                            value: NO_DATA_PLACEHOLDER,
                            subtitle: ATTENDANCE_EMPTY_MESSAGES.noPagelasThisWeek,
                        }),
                    icon: <Timeline />,
          color: '#10b981',
                    tooltip: 'Taxa de presença na semana atual',
                    // O back manda da mais nova para a mais antiga.
                    sparkline: sortWeeksAscending(overview.pagelas.lastSixWeeks).map(w => w.presenceRate),
                },
                {
                    title: 'Taxa Presença Mês',
                    ...(overview.pagelas.thisMonth.total > 0
                        ? { value: overview.pagelas.thisMonth.presenceRate, suffix: '%' }
                        : {
                            value: NO_DATA_PLACEHOLDER,
                            subtitle: ATTENDANCE_EMPTY_MESSAGES.noPagelasThisMonth,
                        }),
                    icon: <Timeline />,
          color: '#6366f1',
                    tooltip: 'Taxa de presença no mês atual',
                },
                {
                    title: 'Pagelas Semana',
                    value: overview.pagelas.thisWeek.total,
                    icon: <AutoAwesome />,
          color: '#8b5cf6',
                    tooltip: 'Total de pagelas registradas esta semana',
                },
                {
                    title: 'Pagelas Mês',
                    value: overview.pagelas.thisMonth.total,
                    icon: <AutoAwesome />,
          color: '#ec4899',
                    tooltip: 'Total de pagelas registradas este mês',
                },
            ],
            decisions: [
                {
                    title: 'Decisões Este Ano',
                    value: overview.acceptedChrists.thisYear,
                    icon: <Favorite />,
          color: '#f43f5e',
                    variant: 'gradient' as const,
                    tooltip: 'Total de decisões por Cristo no ano',
                },
                {
                    title: 'Decisões Este Mês',
                    value: overview.acceptedChrists.thisMonth,
                    icon: <Favorite />,
          color: '#f43f5e',
                    tooltip: 'Decisões por Cristo este mês',
                },
                {
                    title: 'Aceitos',
                    value: overview.acceptedChrists.byDecisionType?.ACCEPTED || 0,
                    icon: <Favorite />,
          color: '#10b981',
                },
                {
                    title: 'Reconciliados',
                    value: overview.acceptedChrists.byDecisionType?.RECONCILED || 0,
                    icon: <Favorite />,
          color: '#6366f1',
                },
            ],
            performance: [
                {
                    title: 'Taxa Meditação',
                    value: overview.pagelas.thisMonth.meditationRate || 0,
                    suffix: '%',
                    icon: <EmojiEvents />,
          color: '#f59e0b',
                    tooltip: 'Percentual de crianças que fizeram meditação',
                },
                {
                    title: 'Taxa Versículo',
                    value: overview.pagelas.thisMonth.verseRecitationRate || 0,
                    suffix: '%',
                    icon: <EmojiEvents />,
          color: '#84cc16',
                    tooltip: 'Percentual de crianças que recitaram versículo',
                },
                {
                    title: 'Engajamento Médio',
                    value: overview.engagement?.avgEngagementScore || 0,
                    suffix: '%',
                    icon: <TrendingUp />,
          color: '#06b6d4',
                    tooltip: 'Score médio de engajamento das crianças',
                },
            ],
        };
    }, [overview, theme]);

    const activeKPIs = kpis[activeCategory as keyof typeof kpis] || [];
    const activeColor = categories.find(c => c.id === activeCategory)?.color || theme.palette.primary.main;

    const engagementRate = overview
        ? overview.summary.totalChildren > 0
          ? (overview.summary.activeChildrenThisMonth / overview.summary.totalChildren) * 100
          : 0
        : 0;

    const refetchAll = () => refetchOverview();

    return {
        categories,
        activeCategory,
        setActiveCategory,
        activeKPIs,
        activeColor,
        isLoading,
        refetchAll,
        engagementRate,
        overview,
    };
};
