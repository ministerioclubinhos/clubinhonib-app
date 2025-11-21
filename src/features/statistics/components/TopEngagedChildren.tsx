import React from 'react';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar,
  useTheme,
} from '@mui/material';
import { Star, EmojiEvents } from '@mui/icons-material';
import { useInsights } from '../hooks';
import { StatisticsFilters } from '../api';

interface TopEngagedChildrenProps {
  filters?: StatisticsFilters;
}

export const TopEngagedChildren: React.FC<TopEngagedChildrenProps> = ({ filters }) => {
  const theme = useTheme();
  const { data, isLoading, error } = useInsights(filters);

  if (isLoading) {
    return (
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      </Paper>
    );
  }

  if (error || !data) {
    return (
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        <Typography color="error">Erro ao carregar crianças mais engajadas</Typography>
      </Paper>
    );
  }

  const getMedalColor = (position: number) => {
    switch (position) {
      case 0:
        return '#FFD700'; // Ouro
      case 1:
        return '#C0C0C0'; // Prata
      case 2:
        return '#CD7F32'; // Bronze
      default:
        return theme.palette.grey[400];
    }
  };

  const getEngagementColor = (score: number) => {
    if (score >= 90) return 'success';
    if (score >= 75) return 'info';
    if (score >= 60) return 'warning';
    return 'default';
  };

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <Star sx={{ color: theme.palette.warning.main, fontSize: 28 }} />
        <Typography variant="h6" fontWeight="bold">
          ⭐ Crianças Mais Engajadas
        </Typography>
      </Box>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell width={60}><strong>Pos.</strong></TableCell>
              <TableCell><strong>Nome</strong></TableCell>
              <TableCell align="center"><strong>Idade</strong></TableCell>
              <TableCell><strong>Cidade</strong></TableCell>
              <TableCell align="center"><strong>Tempo</strong></TableCell>
              <TableCell align="right"><strong>Pagelas</strong></TableCell>
              <TableCell align="right"><strong>Presença %</strong></TableCell>
              <TableCell align="center"><strong>Engajamento</strong></TableCell>
              <TableCell align="center"><strong>Decisão</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.topEngagedChildren.map((child, index) => (
              <TableRow
                key={child.childId}
                hover
                sx={{
                  backgroundColor: index < 3 ? `${getMedalColor(index)}10` : 'transparent',
                }}
              >
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {index < 3 ? (
                      <EmojiEvents sx={{ color: getMedalColor(index), fontSize: 24 }} />
                    ) : (
                      <Typography fontWeight="bold">{index + 1}</Typography>
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        bgcolor: child.gender === 'F' ? theme.palette.secondary.main : theme.palette.info.main,
                        fontSize: 14,
                      }}
                    >
                      {getInitials(child.childName)}
                    </Avatar>
                    <Typography fontWeight="medium">{child.childName}</Typography>
                  </Box>
                </TableCell>
                <TableCell align="center">{child.age} anos</TableCell>
                <TableCell>
                  {child.city ? `${child.city}, ${child.state}` : '-'}
                </TableCell>
                <TableCell align="center">
                  {child.monthsParticipating} {child.monthsParticipating === 1 ? 'mês' : 'meses'}
                </TableCell>
                <TableCell align="right">{child.totalPagelas}</TableCell>
                <TableCell align="right">{child.presenceRate.toFixed(1)}%</TableCell>
                <TableCell align="center">
                  <Chip
                    label={child.engagementScore.toFixed(0)}
                    color={getEngagementColor(child.engagementScore)}
                    size="small"
                    icon={<Star />}
                  />
                </TableCell>
                <TableCell align="center">
                  {child.hasDecision ? (
                    <Chip
                      label={child.decisionType === 'ACCEPTED' ? 'Aceitou' : 'Reconciliado'}
                      color="success"
                      size="small"
                      variant="outlined"
                    />
                  ) : (
                    <Chip label="-" size="small" variant="outlined" />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {data.topEngagedChildren.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="text.secondary">Nenhum dado disponível</Typography>
        </Box>
      )}
    </Paper>
  );
};

