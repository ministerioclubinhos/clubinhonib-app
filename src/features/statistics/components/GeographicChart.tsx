import React from 'react';
import { Box, Paper, Typography, CircularProgress, useTheme, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { usePagelasChartData } from '../hooks';
import { StatisticsFilters } from '../api';

interface GeographicChartProps {
  filters?: StatisticsFilters;
}

export const GeographicChart: React.FC<GeographicChartProps> = ({ filters }) => {
  const theme = useTheme();
  const { data, isLoading, error } = usePagelasChartData(filters);

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
        <Typography color="error">Erro ao carregar dados geográficos</Typography>
      </Paper>
    );
  }

  // Ordenar por total descendente e pegar top 10
  const topCities = [...data.byCity]
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);

  return (
    <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        🗺️ Análise Geográfica - Top 10 Cidades
      </Typography>

      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={topCities} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
          <XAxis type="number" stroke={theme.palette.text.secondary} style={{ fontSize: 12 }} />
          <YAxis
            type="category"
            dataKey="city"
            stroke={theme.palette.text.secondary}
            style={{ fontSize: 12 }}
            width={100}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 8,
            }}
          />
          <Legend />
          <Bar dataKey="total" name="Total de Pagelas" fill={theme.palette.primary.main} />
          <Bar
            dataKey="uniqueChildren"
            name="Crianças Únicas"
            fill={theme.palette.secondary.main}
          />
        </BarChart>
      </ResponsiveContainer>

      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
          Detalhes por Cidade
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell><strong>Cidade</strong></TableCell>
                <TableCell><strong>Estado</strong></TableCell>
                <TableCell align="right"><strong>Total</strong></TableCell>
                <TableCell align="right"><strong>Crianças</strong></TableCell>
                <TableCell align="right"><strong>Presença %</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {topCities.map((city, index) => (
                <TableRow key={index} hover>
                  <TableCell>{city.city}</TableCell>
                  <TableCell>{city.state}</TableCell>
                  <TableCell align="right">{city.total}</TableCell>
                  <TableCell align="right">{city.uniqueChildren}</TableCell>
                  <TableCell align="right">{city.presenceRate.toFixed(1)}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Paper>
  );
};

