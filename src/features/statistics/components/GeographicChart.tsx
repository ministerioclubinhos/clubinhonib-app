import React from 'react';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  useTheme,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  useMediaQuery,
  Stack,
  Divider,
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
} from 'recharts';
import { usePagelasChartData } from '../hooks';
import { StatisticsFilters } from '../api';

interface GeographicChartProps {
  filters?: StatisticsFilters;
}

export const GeographicChart: React.FC<GeographicChartProps> = ({ filters }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
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
  const topCities = [...data.byCity].sort((a, b) => b.total - a.total).slice(0, 10);

  return (
    <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 2 }}>
      <Typography
        variant="h6"
        fontWeight="bold"
        gutterBottom
        sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
      >
        🗺️ Análise Geográfica - Top 10 Cidades
      </Typography>

      <Box sx={{ height: { xs: 300, sm: 400 }, width: '100%', mb: { xs: 2, sm: 3 } }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={topCities} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
            <XAxis
              type="number"
              stroke={theme.palette.text.secondary}
              style={{ fontSize: { xs: 10, sm: 12 } }}
            />
            <YAxis
              type="category"
              dataKey="city"
              stroke={theme.palette.text.secondary}
              style={{ fontSize: { xs: 10, sm: 12 } }}
              width={isMobile ? 80 : 100}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 8,
                fontSize: isMobile ? '0.75rem' : '0.875rem',
              }}
            />
            <Legend wrapperStyle={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }} />
            <Bar dataKey="total" name="Total de Pagelas" fill={theme.palette.primary.main} />
            <Bar
              dataKey="uniqueChildren"
              name="Crianças Únicas"
              fill={theme.palette.secondary.main}
            />
          </BarChart>
        </ResponsiveContainer>
      </Box>

      <Box sx={{ mt: { xs: 2, sm: 3 } }}>
        <Typography
          variant="subtitle2"
          fontWeight="bold"
          gutterBottom
          sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
        >
          Detalhes por Cidade
        </Typography>
        {isMobile ? (
          /* Versão Mobile: Cards */
          <Stack spacing={2}>
            {topCities.map((city, index) => (
              <Card key={index} elevation={2} sx={{ borderRadius: 2 }}>
                <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                  <Stack spacing={1.5}>
                    {/* Header */}
                    <Box>
                      <Typography
                        variant="subtitle2"
                        fontWeight="bold"
                        sx={{ fontSize: { xs: '0.95rem', sm: '1.125rem' } }}
                      >
                        {city.city}, {city.state}
                      </Typography>
                    </Box>

                    <Divider />

                    {/* Informações */}
                    <Grid container spacing={1.5}>
                      <Grid item xs={6}>
                        <Box>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                          >
                            Total
                          </Typography>
                          <Typography
                            variant="body2"
                            fontWeight="bold"
                            sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                          >
                            {city.total}
                          </Typography>
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
                          <Typography
                            variant="body2"
                            fontWeight="bold"
                            sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                          >
                            {city.uniqueChildren}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12}>
                        <Box>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                          >
                            Presença
                          </Typography>
                          <Typography
                            variant="body2"
                            fontWeight="bold"
                            sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                          >
                            {city.presenceRate.toFixed(1)}%
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        ) : (
          /* Versão Desktop: Tabela */
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>
                    <strong>Cidade</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Estado</strong>
                  </TableCell>
                  <TableCell align="right">
                    <strong>Total</strong>
                  </TableCell>
                  <TableCell align="right">
                    <strong>Crianças</strong>
                  </TableCell>
                  <TableCell align="right">
                    <strong>Presença %</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {topCities.map((city, index) => (
                  <TableRow key={index} hover>
                    <TableCell sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                      {city.city}
                    </TableCell>
                    <TableCell sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                      {city.state}
                    </TableCell>
                    <TableCell align="right" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                      {city.total}
                    </TableCell>
                    <TableCell align="right" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                      {city.uniqueChildren}
                    </TableCell>
                    <TableCell align="right" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                      {city.presenceRate.toFixed(1)}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </Paper>
  );
};
