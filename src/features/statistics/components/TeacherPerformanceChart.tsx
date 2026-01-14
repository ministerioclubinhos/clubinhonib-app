import React from 'react';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  useTheme,
  Avatar,
  Chip,
  LinearProgress,
  Grid,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { School, TrendingUp, EmojiEvents } from '@mui/icons-material';
import { usePagelasChartData } from '../hooks';
import { StatisticsFilters } from '../api';

interface TeacherPerformanceChartProps {
  filters?: StatisticsFilters;
}

export const TeacherPerformanceChart: React.FC<TeacherPerformanceChartProps> = ({ filters }) => {
  const theme = useTheme();
  const { data, isLoading } = usePagelasChartData(filters);

  if (isLoading) {
    return (
      <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      </Paper>
    );
  }

  if (!data || !data.byTeacher || data.byTeacher.length === 0) {
    return (
      <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
        <Typography color="text.secondary">Sem dados de professores para o período selecionado</Typography>
      </Paper>
    );
  }

  const topTeachers = [...data.byTeacher]
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);

  const getPerformanceColor = (rate: number) => {
    if (rate >= 90) return theme.palette.success.main;
    if (rate >= 75) return theme.palette.info.main;
    if (rate >= 60) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Paper
          elevation={8}
          sx={{
            p: 2,
            background: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 2,
            minWidth: 200,
          }}
        >
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
            {data.teacherName}
          </Typography>
          <Typography variant="body2">
            Total de Pagelas: <strong>{data.total}</strong>
          </Typography>
          {data.presenceRate !== undefined && (
            <Typography variant="body2">
              Taxa de Presença: <strong>{data.presenceRate.toFixed(1)}%</strong>
            </Typography>
          )}
        </Paper>
      );
    }
    return null;
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 3,
        background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.success.main}03 100%)`,
        border: `2px solid ${theme.palette.divider}`,
      }}
    >
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
          <School sx={{ fontSize: 28, color: theme.palette.success.main }} />
          <Typography variant="h5" fontWeight="bold">
            👨‍🏫 Performance dos Professores
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          Top 10 professores por número de pagelas registradas
        </Typography>
      </Box>

      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={topTeachers}>
          <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
          <XAxis
            dataKey="teacherName"
            stroke={theme.palette.text.secondary}
            angle={-45}
            textAnchor="end"
            height={100}
            style={{ fontSize: 11 }}
          />
          <YAxis stroke={theme.palette.text.secondary} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="total" name="Total de Pagelas" radius={[8, 8, 0, 0]}>
            {topTeachers.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={
                  index === 0
                    ? theme.palette.warning.main
                    : index === 1
                    ? theme.palette.info.main
                    : theme.palette.success.main
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
          Top 5 Professores Detalhados
        </Typography>
        <Grid container spacing={2}>
          {topTeachers.slice(0, 5).map((teacher, index) => (
            <Grid item xs={12} md={6} key={teacher.teacherId}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  background:
                    index === 0
                      ? `${theme.palette.warning.main}08`
                      : theme.palette.background.default,
                  border: `1px solid ${theme.palette.divider}`,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 2,
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  
                  <Avatar
                    sx={{
                      width: 48,
                      height: 48,
                      bgcolor:
                        index === 0
                          ? theme.palette.warning.main
                          : index === 1
                          ? theme.palette.info.main
                          : theme.palette.success.main,
                      fontWeight: 'bold',
                    }}
                  >
                    {index === 0 ? <EmojiEvents /> : getInitials(teacher.teacherName)}
                  </Avatar>

                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {teacher.teacherName}
                      </Typography>
                      {index < 3 && (
                        <Chip
                          label={`#${index + 1}`}
                          size="small"
                          color={index === 0 ? 'warning' : index === 1 ? 'info' : 'success'}
                        />
                      )}
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                      <Chip
                        label={`${teacher.total} pagelas`}
                        size="small"
                        variant="outlined"
                        icon={<TrendingUp />}
                      />
                      {teacher.presenceRate !== undefined && (
                        <Typography variant="caption" color="text.secondary">
                          {teacher.presenceRate.toFixed(1)}% presença
                        </Typography>
                      )}
                    </Box>

                    <LinearProgress
                      variant="determinate"
                      value={Math.min((teacher.total / topTeachers[0].total) * 100, 100)}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        bgcolor: `${theme.palette.success.main}15`,
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 3,
                          bgcolor:
                            index === 0
                              ? theme.palette.warning.main
                              : index === 1
                              ? theme.palette.info.main
                              : theme.palette.success.main,
                        },
                      }}
                    />
                  </Box>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Box sx={{ mt: 3, p: 2, bgcolor: 'rgba(76, 175, 80, 0.08)', borderRadius: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <Typography variant="body2" color="text.secondary">
              Total de Professores
            </Typography>
            <Typography variant="h6" fontWeight="bold" color="success.main">
              {data.byTeacher.length}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="body2" color="text.secondary">
              Média de Pagelas
            </Typography>
            <Typography variant="h6" fontWeight="bold" color="success.main">
              {(data.byTeacher.reduce((sum, t) => sum + t.total, 0) / data.byTeacher.length).toFixed(
                0
              )}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="body2" color="text.secondary">
              Total Geral
            </Typography>
            <Typography variant="h6" fontWeight="bold" color="success.main">
              {data.byTeacher.reduce((sum, t) => sum + t.total, 0)}
            </Typography>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

