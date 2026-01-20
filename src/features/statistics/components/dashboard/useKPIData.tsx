
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
import { useOverview, useInsights } from '../../hooks';

export interface KPICategory {
    id: string;
    label: string;
    icon: React.ReactNode;
    color: string;
}

export const categories: KPICategory[] = [
    { id: 'overview', label: 'Visao Geral', icon: <Timeline />, color: '#6366f1' },
    { id: 'engagement', label: 'Engajamento', icon: <TrendingUp />, color: '#10b981' },
    { id: 'decisions', label: 'Decisoes', icon: <Favorite />, color: '#f43f5e' },
    { id: 'performance', label: 'Performance', icon: <EmojiEvents />, color: '#f59e0b' },
];

export const useKPIData = () => {
    const theme = useTheme();
    const [activeCategory, setActiveCategory] = useState('overview');

    const { data: overview, isLoading: overviewLoading, refetch: refetchOverview } = useOverview();
    const { data: insights, isLoading: insightsLoading } = useInsights();

    const isLoading = overviewLoading || insightsLoading;

    const kpis = useMemo(() => {
        if (!overview) return { overview: [], engagement: [], decisions: [], performance: [] };

        return {
            overview: [
                {
                    title: 'Total Criancas',
                    value: overview.summary.totalChildren,
                    icon: <People />,
          color: theme.palette.primary.main,
                    tooltip: 'Numero total de criancas cadastradas no sistema',
                    subtitle: `${overview.summary.activeChildrenThisMonth} ativos este mes`,
                },
                {
                    title: 'Clubinhos Ativos',
                    value: overview.summary.totalClubs,
                    icon: <Groups />,
          color: theme.palette.secondary.main,
                    tooltip: 'Numero de clubinhos em funcionamento',
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
                    title: 'Ativos Este Mes',
                    value: overview.summary.activeChildrenThisMonth,
                    previousValue: overview.summary.totalChildren,
                    icon: <TrendingUp />,
          color: theme.palette.info.main,
                    suffix: 'criancas',
                    tooltip: 'Criancas que participaram este mes',
                },
            ],
            engagement: [
                {
                    title: 'Taxa Presenca Semana',
                    value: overview.pagelas.thisWeek.presenceRate,
                    suffix: '%',
                    icon: <Timeline />,
          color: '#10b981',
                    tooltip: 'Taxa de presenca na semana atual',
                    sparkline: overview.pagelas.lastSixWeeks.map(w => w.presenceRate),
                },
                {
                    title: 'Taxa Presenca Mes',
                    value: overview.pagelas.thisMonth.presenceRate,
                    suffix: '%',
                    icon: <Timeline />,
          color: '#6366f1',
                    tooltip: 'Taxa de presenca no mes atual',
                },
                {
                    title: 'Pagelas Semana',
                    value: overview.pagelas.thisWeek.total,
                    icon: <AutoAwesome />,
          color: '#8b5cf6',
                    tooltip: 'Total de pagelas registradas esta semana',
                },
                {
                    title: 'Pagelas Mes',
                    value: overview.pagelas.thisMonth.total,
                    icon: <AutoAwesome />,
          color: '#ec4899',
                    tooltip: 'Total de pagelas registradas este mes',
                },
            ],
            decisions: [
                {
                    title: 'Decisoes Este Ano',
                    value: overview.acceptedChrists.thisYear,
                    icon: <Favorite />,
          color: '#f43f5e',
                    variant: 'gradient' as const,
                    tooltip: 'Total de decisoes por Cristo no ano',
                },
                {
                    title: 'Decisoes Este Mes',
                    value: overview.acceptedChrists.thisMonth,
                    icon: <Favorite />,
          color: '#f43f5e',
                    tooltip: 'Decisoes por Cristo este mes',
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
                    title: 'Taxa Meditacao',
                    value: overview.pagelas.thisMonth.meditationRate || 0,
                    suffix: '%',
                    icon: <EmojiEvents />,
          color: '#f59e0b',
                    tooltip: 'Percentual de criancas que fizeram meditacao',
                },
                {
                    title: 'Taxa Versiculo',
                    value: overview.pagelas.thisMonth.verseRecitationRate || 0,
                    suffix: '%',
                    icon: <EmojiEvents />,
          color: '#84cc16',
                    tooltip: 'Percentual de criancas que recitaram versiculo',
                },
                {
                    title: 'Engajamento Medio',
                    value: overview.engagement?.avgEngagementScore || 0,
                    suffix: '%',
                    icon: <TrendingUp />,
          color: '#06b6d4',
                    tooltip: 'Score medio de engajamento das criancas',
                },
                {
                    title: 'Top Performers',
                    value: insights?.topEngagedChildren?.length || 0,
                    icon: <EmojiEvents />,
          color: '#a855f7',
                    subtitle: 'criancas com alto engajamento',
                },
            ],
        };
    }, [overview, insights, theme]);

    const activeKPIs = kpis[activeCategory as keyof typeof kpis] || [];
    const activeColor = categories.find(c => c.id === activeCategory)?.color || theme.palette.primary.main;

    const engagementRate = overview
        ? (overview.summary.activeChildrenThisMonth / overview.summary.totalChildren) * 100
        : 0;

    return {
        categories,
        activeCategory,
        setActiveCategory,
        activeKPIs,
        activeColor,
        isLoading,
        refetchOverview,
        engagementRate,
        overview,
    };
};
