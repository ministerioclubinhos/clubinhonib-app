import React from 'react';
import {
  Box,
  Paper,
  TextField,
  MenuItem,
  Grid,
  Button,
  Typography,
  Collapse,
  IconButton,
  Chip,
} from '@mui/material';
import { FilterList, ExpandMore, ExpandLess, Refresh, CalendarMonth } from '@mui/icons-material';
import { StatisticsFilters as Filters } from '../api';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';

interface StatisticsFiltersProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
  onReset: () => void;
}

export const StatisticsFiltersComponent: React.FC<StatisticsFiltersProps> = ({
  filters,
  onChange,
  onReset,
}) => {
  const [expanded, setExpanded] = React.useState(false);

  // Configurar locale em português
  React.useEffect(() => {
    dayjs.locale('pt-br');
  }, []);

  const handleChange = (field: keyof Filters, value: any) => {
    onChange({
      ...filters,
      [field]: value || undefined,
    });
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

  // Verificar se está usando o mês atual
  const isCurrentMonth = React.useMemo(() => {
    const now = new Date();
    const firstDay = dayjs(new Date(now.getFullYear(), now.getMonth(), 1)).format('YYYY-MM-DD');
    const lastDay = dayjs(new Date(now.getFullYear(), now.getMonth() + 1, 0)).format('YYYY-MM-DD');

    return filters.startDate === firstDay && filters.endDate === lastDay;
  }, [filters.startDate, filters.endDate]);

  return (
    <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 2, mb: { xs: 2, sm: 3 } }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 2,
          flexWrap: 'wrap',
          gap: 1,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 } }}>
          <FilterList sx={{ fontSize: { xs: 20, sm: 24 } }} />
          <Typography
            variant="h6"
            fontWeight="bold"
            sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
          >
            Filtros
          </Typography>
          {isCurrentMonth && (
            <Chip
              icon={<CalendarMonth />}
              label="Mês Atual"
              color="primary"
              size="small"
              variant="outlined"
            />
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button size="small" startIcon={<Refresh />} onClick={onReset} variant="outlined">
            Resetar
          </Button>
          <IconButton size="small" onClick={() => setExpanded(!expanded)}>
            {expanded ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </Box>
      </Box>

      {/* Info do período selecionado */}
      {filters.startDate && filters.endDate && (
        <Box
          key={`${filters.startDate}-${filters.endDate}`}
          sx={{
            mb: 2,
            p: 1.5,
            bgcolor: isCurrentMonth ? 'rgba(25, 118, 210, 0.08)' : 'rgba(156, 39, 176, 0.08)',
            borderRadius: 1,
            border: 1,
            borderColor: isCurrentMonth ? 'primary.main' : 'secondary.main',
          }}
        >
          <Typography
            variant="body2"
            sx={{ color: isCurrentMonth ? 'primary.dark' : 'secondary.dark' }}
          >
            📅 <strong>Período Selecionado:</strong> {dayjs(filters.startDate).format('DD/MM/YYYY')}{' '}
            até {dayjs(filters.endDate).format('DD/MM/YYYY')}
            {(() => {
              const start = dayjs(filters.startDate);
              const end = dayjs(filters.endDate);
              const sameMonth = start.format('YYYY-MM') === end.format('YYYY-MM');

              if (isCurrentMonth) {
                return <span> ({start.format('MMMM [de] YYYY').toUpperCase()})</span>;
              } else if (sameMonth) {
                return <span> ({start.format('MMMM/YYYY').toUpperCase()})</span>;
              } else {
                return (
                  <span>
                    {' '}
                    ({start.format('MMM/YYYY').toUpperCase()} a{' '}
                    {end.format('MMM/YYYY').toUpperCase()})
                  </span>
                );
              }
            })()}
          </Typography>
        </Box>
      )}

      {/* Filtros Básicos - Sempre visíveis */}
      <Grid container spacing={{ xs: 1.5, sm: 2 }}>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            type="date"
            label="Data Inicial"
            value={filters.startDate || ''}
            onChange={(e) => handleChange('startDate', e.target.value)}
            size="small"
            InputLabelProps={{ shrink: true }}
            helperText={
              isCurrentMonth
                ? 'Primeiro dia do mês atual'
                : filters.startDate
                  ? dayjs(filters.startDate).format('DD/MM/YYYY')
                  : ''
            }
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            type="date"
            label="Data Final"
            value={filters.endDate || ''}
            onChange={(e) => handleChange('endDate', e.target.value)}
            size="small"
            InputLabelProps={{ shrink: true }}
            helperText={
              isCurrentMonth
                ? 'Último dia do mês atual'
                : filters.endDate
                  ? dayjs(filters.endDate).format('DD/MM/YYYY')
                  : ''
            }
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            select
            label="Agrupar por"
            value={filters.groupBy || 'week'}
            onChange={(e) => handleChange('groupBy', e.target.value)}
            size="small"
          >
            <MenuItem value="day">Dia</MenuItem>
            <MenuItem value="week">Semana</MenuItem>
            <MenuItem value="month">Mês</MenuItem>
            <MenuItem value="year">Ano</MenuItem>
          </TextField>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            select
            label="Ano (opcional)"
            value={filters.year || ''}
            onChange={(e) =>
              handleChange('year', e.target.value ? Number(e.target.value) : undefined)
            }
            size="small"
          >
            <MenuItem value="">Nenhum</MenuItem>
            {years.map((year) => (
              <MenuItem key={year} value={year}>
                {year}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
      </Grid>

      {/* Filtros Avançados - Expandíveis */}
      <Collapse in={expanded}>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Filtros Demográficos
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              select
              label="Gênero"
              value={filters.gender || ''}
              onChange={(e) => handleChange('gender', e.target.value)}
              size="small"
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="M">Masculino</MenuItem>
              <MenuItem value="F">Feminino</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              type="number"
              label="Idade Mínima"
              value={filters.minAge || ''}
              onChange={(e) =>
                handleChange('minAge', e.target.value ? Number(e.target.value) : undefined)
              }
              size="small"
              inputProps={{ min: 0, max: 100 }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              type="number"
              label="Idade Máxima"
              value={filters.maxAge || ''}
              onChange={(e) =>
                handleChange('maxAge', e.target.value ? Number(e.target.value) : undefined)
              }
              size="small"
              inputProps={{ min: 0, max: 100 }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Cidade"
              value={filters.city || ''}
              onChange={(e) => handleChange('city', e.target.value)}
              size="small"
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ mt: 2 }}>
              Filtros de Participação
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              type="date"
              label="Entrou Após"
              value={filters.joinedAfter || ''}
              onChange={(e) => handleChange('joinedAfter', e.target.value)}
              size="small"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              type="date"
              label="Entrou Antes"
              value={filters.joinedBefore || ''}
              onChange={(e) => handleChange('joinedBefore', e.target.value)}
              size="small"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>
      </Collapse>
    </Paper>
  );
};
