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
  useTheme,
} from '@mui/material';
import { EmojiEvents, TrendingUp } from '@mui/icons-material';
import { useInsights } from '../hooks';
import { StatisticsFilters } from '../api';

interface ClubRankingsProps {
  filters?: StatisticsFilters;
}

export const ClubRankings: React.FC<ClubRankingsProps> = ({ filters }) => {
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
        <Typography color="error">Erro ao carregar rankings</Typography>
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

  const getPerformanceColor = (score: number) => {
    if (score >= 85) return 'success';
    if (score >= 70) return 'info';
    if (score >= 50) return 'warning';
    return 'error';
  };

  return (
    <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <EmojiEvents sx={{ color: theme.palette.warning.main, fontSize: 28 }} />
        <Typography variant="h6" fontWeight="bold">
          🏆 Ranking de Clubinhos
        </Typography>
      </Box>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell width={60}><strong>Pos.</strong></TableCell>
              <TableCell><strong>Clubinho</strong></TableCell>
              <TableCell align="right"><strong>Crianças</strong></TableCell>
              <TableCell align="right"><strong>Presença %</strong></TableCell>
              <TableCell align="right"><strong>Decisões</strong></TableCell>
              <TableCell align="right"><strong>Performance</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.clubRankings.map((club, index) => (
              <TableRow
                key={club.clubId}
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
                  <Typography fontWeight="bold">Clubinho #{club.clubNumber}</Typography>
                </TableCell>
                <TableCell align="right">{club.totalChildren}</TableCell>
                <TableCell align="right">{club.avgPresenceRate.toFixed(1)}%</TableCell>
                <TableCell align="right">{club.totalDecisions}</TableCell>
                <TableCell align="right">
                  <Chip
                    label={`${club.performanceScore.toFixed(1)}%`}
                    color={getPerformanceColor(club.performanceScore)}
                    size="small"
                    icon={<TrendingUp />}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {data.clubRankings.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="text.secondary">Nenhum dado disponível</Typography>
        </Box>
      )}
    </Paper>
  );
};

