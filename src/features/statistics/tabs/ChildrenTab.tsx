import React, { memo, useState, useCallback, useMemo } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Avatar,
  Chip,
  LinearProgress,
  useTheme,
  alpha,
  Card,
  CardContent,
  Stack,
  Divider,
  IconButton,
  Tooltip,
  useMediaQuery,
} from '@mui/material';
import {
  Star,
  CheckCircle,
  ChildCare,
  TrendingUp,
  Visibility,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useStatistics } from '../context';
import { useChildren } from '../hooks';
import { ChildrenStatsQueryDto, ChildStat } from '../api';
import { StatCard, DataTable, Column } from '../components/ui';

const MotionCard = motion.create(Card);

// Mobile Card Component
const ChildMobileCard: React.FC<{ child: ChildStat; index: number }> = memo(({ child, index }) => {
  const theme = useTheme();

  const getEngagementColor = (score: number): 'success' | 'info' | 'warning' | 'default' => {
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

  return (
    <MotionCard
      elevation={0}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      sx={{
        borderRadius: 3,
        border: `1px solid ${theme.palette.divider}`,
        borderLeft: `4px solid ${child.gender === 'F' ? theme.palette.secondary.main : theme.palette.info.main}`,
        overflow: 'visible',
      }}
    >
      <CardContent sx={{ p: 2 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
          <Box
            sx={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              bgcolor:
                child.rank === 1
                  ? '#ffd700'
                  : child.rank === 2
                    ? '#c0c0c0'
                    : child.rank === 3
                      ? '#cd7f32'
                      : alpha(theme.palette.primary.main, 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: 12,
              color: child.rank <= 3 ? 'black' : theme.palette.primary.main,
            }}
          >
            {child.rank}
          </Box>
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
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography fontWeight={600} noWrap sx={{ fontSize: '0.9rem' }}>
              {child.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {child.gender === 'M' ? 'Masculino' : 'Feminino'} - {child.age} anos
            </Typography>
          </Box>
          <Chip
            icon={<Star sx={{ fontSize: 14 }} />}
            label={`${child.stats.engagementScore.toFixed(0)}%`}
            size="small"
            color={getEngagementColor(child.stats.engagementScore)}
            sx={{ fontWeight: 700 }}
          />
        </Box>

        <Divider sx={{ mb: 1.5 }} />

        {/* Stats Grid */}
        <Grid container spacing={1}>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">
              Clubinho
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {child.club ? `#${child.club.number}` : '-'}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">
              Cidade
            </Typography>
            <Typography variant="body2" fontWeight={600} noWrap>
              {child.address?.city || '-'}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">
              Tempo
            </Typography>
            <Chip label={`${child.monthsParticipating}m`} size="small" variant="outlined" sx={{ height: 22 }} />
          </Grid>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">
              Pagelas
            </Typography>
            <Typography variant="body2" fontWeight={700} color="primary">
              {child.stats.totalPagelas}
            </Typography>
          </Grid>
        </Grid>

        {/* Progress Bar */}
        <Box sx={{ mt: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption" color="text.secondary">
              Presenca
            </Typography>
            <Typography variant="caption" fontWeight={700}>
              {child.stats.presenceRate.toFixed(1)}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={child.stats.presenceRate}
            sx={{
              height: 6,
              borderRadius: 3,
              bgcolor: alpha(theme.palette.success.main, 0.1),
              '& .MuiLinearProgress-bar': {
                bgcolor: theme.palette.success.main,
                borderRadius: 3,
              },
            }}
          />
        </Box>

        {/* Badges */}
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 1.5 }}>
          {child.isActive && (
            <Chip label="Ativo" size="small" color="success" variant="outlined" sx={{ height: 22, fontSize: '0.7rem' }} />
          )}
          {child.decisions.hasDecision && (
            <Chip
              icon={<CheckCircle sx={{ fontSize: 14 }} />}
              label={child.decisions.decisionType || 'Decisao'}
              size="small"
              color="success"
              sx={{ height: 22, fontSize: '0.7rem' }}
            />
          )}
        </Box>
      </CardContent>
    </MotionCard>
  );
});

ChildMobileCard.displayName = 'ChildMobileCard';

export const ChildrenTab: React.FC = memo(() => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [filters, setFilters] = useState<ChildrenStatsQueryDto>({
    page: 1,
    limit: isMobile ? 10 : 20,
    sortBy: 'engagementScore',
    sortOrder: 'DESC',
  });

  const { data, isLoading, refetch } = useChildren(filters);

  const handlePageChange = useCallback((page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  }, []);

  const handleLimitChange = useCallback((limit: number) => {
    setFilters((prev) => ({ ...prev, limit, page: 1 }));
  }, []);

  const handleSort = useCallback((column: string, order: 'ASC' | 'DESC') => {
    setFilters((prev) => ({
      ...prev,
      sortBy: column as ChildrenStatsQueryDto['sortBy'],
      sortOrder: order,
      page: 1
    }));
  }, []);

  const handleSearch = useCallback((value: string) => {
    setFilters((prev) => ({ ...prev, search: value || undefined, page: 1 }));
  }, []);

  // Table columns
  const columns: Column<ChildStat>[] = useMemo(
    () => [
      {
        id: 'rank',
        label: '#',
        minWidth: 60,
        sortable: false,
        renderCell: (row: ChildStat) => (
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              bgcolor:
                row.rank === 1
                  ? '#ffd700'
                  : row.rank === 2
                    ? '#c0c0c0'
                    : row.rank === 3
                      ? '#cd7f32'
                      : alpha(theme.palette.primary.main, 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              color: row.rank <= 3 ? 'black' : theme.palette.primary.main,
            }}
          >
            {row.rank}
          </Box>
        ),
      },
      {
        id: 'name',
        label: 'Crianca',
        minWidth: 200,
        sortable: true,
        sticky: true,
        renderCell: (row: ChildStat) => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar
              sx={{
                width: 36,
                height: 36,
                bgcolor: row.gender === 'F' ? theme.palette.secondary.main : theme.palette.info.main,
                fontSize: 14,
              }}
            >
              {row.name.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()}
            </Avatar>
            <Box>
              <Typography fontWeight={600} sx={{ fontSize: '0.875rem' }}>
                {row.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {row.gender === 'M' ? 'Masculino' : 'Feminino'}
              </Typography>
            </Box>
          </Box>
        ),
      },
      {
        id: 'age',
        label: 'Idade',
        minWidth: 80,
        sortable: true,
        format: (value: number) => `${value} anos`,
      },
      {
        id: 'club',
        label: 'Clubinho',
        minWidth: 100,
        getValue: (row: ChildStat) => row.club?.number,
        format: (value: number | undefined) => (value ? `#${value}` : '-'),
      },
      {
        id: 'address',
        label: 'Cidade',
        minWidth: 150,
        getValue: (row: ChildStat) => row.address,
        format: (value: ChildStat['address']) => (value ? `${value.city}, ${value.state}` : '-'),
      },
      {
        id: 'monthsParticipating',
        label: 'Tempo',
        minWidth: 80,
        align: 'center' as const,
        renderCell: (row: ChildStat) => <Chip label={`${row.monthsParticipating}m`} size="small" variant="outlined" />,
      },
      {
        id: 'totalPagelas',
        label: 'Pagelas',
        minWidth: 80,
        align: 'right' as const,
        sortable: true,
        getValue: (row: ChildStat) => row.stats.totalPagelas,
      },
      {
        id: 'presenceRate',
        label: 'Presenca',
        minWidth: 120,
        sortable: true,
        getValue: (row: ChildStat) => row.stats.presenceRate,
        renderCell: (row: ChildStat) => (
          <Box>
            <Typography variant="body2" fontWeight={600}>
              {row.stats.presenceRate.toFixed(1)}%
            </Typography>
            <LinearProgress
              variant="determinate"
              value={row.stats.presenceRate}
              sx={{
                mt: 0.5,
                height: 4,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.success.main, 0.1),
                '& .MuiLinearProgress-bar': {
                  bgcolor: theme.palette.success.main,
                  borderRadius: 2,
                },
              }}
            />
          </Box>
        ),
      },
      {
        id: 'engagementScore',
        label: 'Engajamento',
        minWidth: 100,
        align: 'center' as const,
        sortable: true,
        getValue: (row: ChildStat) => row.stats.engagementScore,
        renderCell: (row: ChildStat) => {
          const score = row.stats.engagementScore;
          const chipColor: 'success' | 'info' | 'warning' | 'default' =
            score >= 90 ? 'success' : score >= 75 ? 'info' : score >= 60 ? 'warning' : 'default';
          return (
            <Chip icon={<Star />} label={score.toFixed(0)} size="small" color={chipColor} sx={{ fontWeight: 700 }} />
          );
        },
      },
      {
        id: 'status',
        label: 'Status',
        minWidth: 150,
        align: 'center' as const,
        renderCell: (row: ChildStat) => (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, alignItems: 'center' }}>
            {row.isActive && <Chip label="Ativo" size="small" color="success" variant="outlined" />}
            {row.decisions.hasDecision && (
              <Chip icon={<CheckCircle />} label={row.decisions.decisionType || 'Decisao'} size="small" color="success" />
            )}
          </Box>
        ),
      },
    ],
    [theme]
  );

  return (
    <Box sx={{ width: '100%' }}>
      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={6} md={2.4}>
          <StatCard
            title="Total Filtrado"
            value={data?.summary.filteredChildren || 0}
            subtitle={`de ${data?.summary.totalChildren || 0}`}
            icon={<ChildCare />}
            color={theme.palette.primary.main}
            loading={isLoading}
            compact
          />
        </Grid>
        <Grid item xs={6} sm={6} md={2.4}>
          <StatCard
            title="Idade Media"
            value={data?.summary.avgAge?.toFixed(1) || '0'}
            suffix="anos"
            icon={<ChildCare />}
            color={theme.palette.info.main}
            loading={isLoading}
            compact
          />
        </Grid>
        <Grid item xs={6} sm={6} md={2.4}>
          <StatCard
            title="Engajamento Medio"
            value={data?.summary.avgEngagementScore?.toFixed(1) || '0'}
            suffix="%"
            icon={<TrendingUp />}
            color={theme.palette.success.main}
            loading={isLoading}
            compact
          />
        </Grid>
        <Grid item xs={6} sm={6} md={2.4}>
          <StatCard
            title="Presenca Media"
            value={data?.summary.avgPresenceRate?.toFixed(1) || '0'}
            suffix="%"
            icon={<TrendingUp />}
            color={theme.palette.secondary.main}
            loading={isLoading}
            compact
          />
        </Grid>
        <Grid item xs={6} sm={6} md={2.4}>
          <StatCard
            title="Com Decisao"
            value={data?.summary.childrenWithDecisions || 0}
            icon={<CheckCircle />}
            color="#f43f5e"
            loading={isLoading}
            compact
          />
        </Grid>
      </Grid>

      {/* Data Table */}
      <DataTable
        title="Lista de Criancas"
        subtitle={data?.filters.summary}
        columns={columns}
        data={data?.children || []}
        loading={isLoading}
        getRowId={(row: ChildStat) => row.childId}
        pagination={{
          page: data?.pagination.page || 1,
          limit: data?.pagination.limit || 20,
          total: data?.pagination.total || 0,
          onPageChange: handlePageChange,
          onLimitChange: handleLimitChange,
        }}
        sorting={{
          sortBy: filters.sortBy || 'engagementScore',
          sortOrder: filters.sortOrder || 'DESC',
          onSort: handleSort,
        }}
        searchable
        searchValue={filters.search}
        onSearchChange={handleSearch}
        onRefresh={refetch}
        showRowNumber={false}
        striped
        hover
        mobileCardRender={(row: ChildStat, index: number) => <ChildMobileCard child={row} index={index} />}
        rowActions={(row: ChildStat) => (
          <Tooltip title="Ver detalhes">
            <IconButton size="small">
              <Visibility />
            </IconButton>
          </Tooltip>
        )}
      />
    </Box>
  );
});

ChildrenTab.displayName = 'ChildrenTab';

export default ChildrenTab;
