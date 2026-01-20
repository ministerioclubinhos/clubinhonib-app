import React, { memo, useState, useMemo, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Button,
  Collapse,
  Grid,
  TextField,
  MenuItem,
  Divider,
  useTheme,
  alpha,
  Badge,
  Popover,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  useMediaQuery,
  InputAdornment,
  Autocomplete,
} from '@mui/material';
import {
  FilterList,
  CalendarMonth,
  Refresh,
  ExpandMore,
  ExpandLess,
  Today,
  DateRange,
  Event,
  History,
  BookmarkBorder,
  Bookmark,
  Clear,
  Search,
  TuneOutlined,
  CheckCircle,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/pt-br';
import { motion, AnimatePresence } from 'framer-motion';
import { useStatistics } from '../../context';
import { PeriodShortcut } from '../../api';

dayjs.locale('pt-br');

interface QuickPeriod {
  id: PeriodShortcut;
  label: string;
  icon: React.ReactNode;
  color: string;
}

const quickPeriods: QuickPeriod[] = [
  { id: PeriodShortcut.TODAY, label: 'Hoje', icon: <Today />, color: '#6366f1' },
  { id: PeriodShortcut.THIS_WEEK, label: 'Esta Semana', icon: <DateRange />, color: '#10b981' },
  { id: PeriodShortcut.THIS_MONTH, label: 'Este Mes', icon: <CalendarMonth />, color: '#f59e0b' },
  { id: PeriodShortcut.LAST_7_DAYS, label: '7 Dias', icon: <History />, color: '#8b5cf6' },
  { id: PeriodShortcut.LAST_30_DAYS, label: '30 Dias', icon: <History />, color: '#ec4899' },
  { id: PeriodShortcut.THIS_YEAR, label: 'Este Ano', icon: <Event />, color: '#ef4444' },
];

const MotionBox = motion.create(Box);

export const SmartFilters: React.FC = memo(() => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const {
    state,
    setPeriod,
    setDateRange,
    setFilters,
    resetFilters,
    formattedPeriod,
    hasActiveFilters,
  } = useStatistics();

  const [expanded, setExpanded] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [savedFiltersAnchor, setSavedFiltersAnchor] = useState<null | HTMLElement>(null);

  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchValue !== (state.filters.search || '')) {
        setFilters({ search: searchValue || undefined });
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchValue, state.filters.search, setFilters]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    const f = state.filters;
    if (f.clubId) count++;
    if (f.teacherId) count++;
    if (f.coordinatorId) count++;
    if (f.gender) count++;
    if (f.minAge || f.maxAge) count++;
    if (f.city) count++;
    if (f.state) count++;
    if (f.search) count++;
    return count;
  }, [state.filters]);

  const handlePeriodSelect = useCallback((period: PeriodShortcut) => {
    setPeriod(period);
  }, [setPeriod]);

  const handleStartDateChange = useCallback((date: Dayjs | null) => {
    if (date) {
      setDateRange({
        startDate: date.format('YYYY-MM-DD'),
        endDate: state.filters.endDate || date.format('YYYY-MM-DD'),
      });
    }
  }, [setDateRange, state.filters.endDate]);

  const handleEndDateChange = useCallback((date: Dayjs | null) => {
    if (date) {
      setDateRange({
        startDate: state.filters.startDate || date.format('YYYY-MM-DD'),
        endDate: date.format('YYYY-MM-DD'),
      });
    }
  }, [setDateRange, state.filters.startDate]);

  const activePeriod = state.filters.period || 'this_month';
  const activePeriodData = quickPeriods.find(p => p.id === activePeriod);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          overflow: 'hidden',
          border: `1px solid ${theme.palette.divider}`,
          background: `linear-gradient(180deg, ${alpha(activePeriodData?.color || theme.palette.primary.main, 0.02)} 0%, ${theme.palette.background.paper} 100%)`,
        }}
      >
        {/* Header */}
        <Box
          sx={{
            px: { xs: 2, md: 3 },
            py: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 1,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                p: 1,
                borderRadius: 2,
                bgcolor: alpha(activePeriodData?.color || theme.palette.primary.main, 0.1),
                color: activePeriodData?.color || theme.palette.primary.main,
                display: 'flex',
              }}
            >
              <FilterList />
            </Box>
            <Box>
              <Typography variant="subtitle1" fontWeight={700}>
                Filtros Inteligentes
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formattedPeriod}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {activeFiltersCount > 0 && (
              <Chip
                label={`${activeFiltersCount} filtro${activeFiltersCount > 1 ? 's' : ''}`}
                size="small"
                color="primary"
                onDelete={resetFilters}
              />
            )}
            <Tooltip title="Filtros salvos">
              <IconButton
                size="small"
                onClick={(e) => setSavedFiltersAnchor(e.currentTarget)}
              >
                <Badge badgeContent={state.favorites.length} color="primary">
                  <BookmarkBorder />
                </Badge>
              </IconButton>
            </Tooltip>
            <Tooltip title="Limpar filtros">
              <IconButton size="small" onClick={resetFilters}>
                <Refresh />
              </IconButton>
            </Tooltip>
            <Button
              variant={expanded ? 'contained' : 'outlined'}
              size="small"
              startIcon={<TuneOutlined />}
              endIcon={expanded ? <ExpandLess /> : <ExpandMore />}
              onClick={() => setExpanded(!expanded)}
              sx={{ textTransform: 'none' }}
            >
              {isMobile ? '' : 'Avancados'}
            </Button>
          </Box>
        </Box>

        <Box sx={{ px: { xs: 2, md: 3 }, pb: 2 }}>
          <Box
            sx={{
              display: 'flex',
              gap: 1,
              flexWrap: 'wrap',
            }}
          >
            {quickPeriods.map((period) => {
              const isActive = activePeriod === period.id;
              return (
                <motion.div
                  key={period.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    variant={isActive ? 'contained' : 'outlined'}
                    size="small"
                    startIcon={period.icon}
                    onClick={() => handlePeriodSelect(period.id)}
                    sx={{
                      textTransform: 'none',
                      borderRadius: 2,
                      borderColor: isActive ? undefined : alpha(period.color, 0.4),
                      color: isActive ? undefined : period.color,
                      bgcolor: isActive ? period.color : 'transparent',
                      fontSize: { xs: '0.7rem', sm: '0.8rem' },
                      px: { xs: 1, sm: 1.5 },
                      '&:hover': {
                        bgcolor: isActive ? period.color : alpha(period.color, 0.1),
                        borderColor: period.color,
                      },
                    }}
                  >
                    {period.label}
                  </Button>
                </motion.div>
              );
            })}

            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1, ml: { xs: 0, md: 'auto' }, width: { xs: '100%', sm: 'auto' } }}>
              <DatePicker
                label="De"
                value={state.filters.startDate ? dayjs(state.filters.startDate) : null}
                onChange={handleStartDateChange}
                slotProps={{
                  textField: {
                    size: 'small',
                    sx: { width: { xs: '100%', sm: 140, md: 160 } },
                  },
                }}
                format="DD/MM/YYYY"
              />
              <DatePicker
                label="Ate"
                value={state.filters.endDate ? dayjs(state.filters.endDate) : null}
                onChange={handleEndDateChange}
                slotProps={{
                  textField: {
                    size: 'small',
                    sx: { width: { xs: '100%', sm: 140, md: 160 } },
                  },
                }}
                format="DD/MM/YYYY"
              />
            </Box>
          </Box>
        </Box>

        <Collapse in={expanded}>
          <Divider />
          <Box sx={{ p: { xs: 2, md: 3 } }}>
            <Grid container spacing={2}>
              {/* Search */}
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  size="small"
                  label="Buscar"
                  placeholder="Nome, cidade, clubinho..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search sx={{ fontSize: 20, opacity: 0.5 }} />
                      </InputAdornment>
                    ),
                    endAdornment: searchValue && (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => setSearchValue('')}>
                          <Clear sx={{ fontSize: 18 }} />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Gender */}
              <Grid item xs={6} md={2}>
                <TextField
                  fullWidth
                  select
                  size="small"
                  label="Genero"
                  value={state.filters.gender || ''}
                  onChange={(e) => setFilters({ gender: e.target.value as 'M' | 'F' || undefined })}
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="M">Masculino</MenuItem>
                  <MenuItem value="F">Feminino</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={6} md={2}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Idade Min"
                  value={state.filters.minAge || ''}
                  onChange={(e) => setFilters({ minAge: e.target.value ? Number(e.target.value) : undefined })}
                  inputProps={{ min: 0, max: 100 }}
                />
              </Grid>

              <Grid item xs={6} md={2}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Idade Max"
                  value={state.filters.maxAge || ''}
                  onChange={(e) => setFilters({ maxAge: e.target.value ? Number(e.target.value) : undefined })}
                  inputProps={{ min: 0, max: 100 }}
                />
              </Grid>

              <Grid item xs={6} md={2}>
                <TextField
                  fullWidth
                  select
                  size="small"
                  label="Agrupar Por"
                  value={state.filters.groupBy || 'week'}
                  onChange={(e) => setFilters({ groupBy: e.target.value as 'day' | 'week' | 'month' | 'year' })}
                >
                  <MenuItem value="day">Dia</MenuItem>
                  <MenuItem value="week">Semana</MenuItem>
                  <MenuItem value="month">Mes</MenuItem>
                  <MenuItem value="year">Ano</MenuItem>
                </TextField>
              </Grid>

              {/* City */}
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  label="Cidade"
                  value={state.filters.city || ''}
                  onChange={(e) => setFilters({ city: e.target.value || undefined })}
                />
              </Grid>

              <Grid item xs={6} md={2}>
                <TextField
                  fullWidth
                  size="small"
                  label="Estado"
                  value={state.filters.state || ''}
                  onChange={(e) => setFilters({ state: e.target.value || undefined })}
                />
              </Grid>

              <Grid item xs={6} md={2}>
                <TextField
                  fullWidth
                  size="small"
                  label="Bairro"
                  value={state.filters.district || ''}
                  onChange={(e) => setFilters({ district: e.target.value || undefined })}
                />
              </Grid>
            </Grid>

            {hasActiveFilters && (
              <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
                  Filtros ativos:
                </Typography>
                {state.filters.gender && (
                  <Chip
                    size="small"
                    label={`Genero: ${state.filters.gender === 'M' ? 'Masculino' : 'Feminino'}`}
                    onDelete={() => setFilters({ gender: undefined })}
                    color="primary"
                    variant="outlined"
                  />
                )}
                {state.filters.city && (
                  <Chip
                    size="small"
                    label={`Cidade: ${state.filters.city}`}
                    onDelete={() => setFilters({ city: undefined })}
                    color="primary"
                    variant="outlined"
                  />
                )}
                {(state.filters.minAge || state.filters.maxAge) && (
                  <Chip
                    size="small"
                    label={`Idade: ${state.filters.minAge || 0} - ${state.filters.maxAge || '∞'}`}
                    onDelete={() => setFilters({ minAge: undefined, maxAge: undefined })}
                    color="primary"
                    variant="outlined"
                  />
                )}
              </Box>
            )}
          </Box>
        </Collapse>

        <Popover
          open={Boolean(savedFiltersAnchor)}
          anchorEl={savedFiltersAnchor}
          onClose={() => setSavedFiltersAnchor(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Box sx={{ width: 280, p: 2 }}>
            <Typography variant="subtitle2" fontWeight={700} gutterBottom>
              Filtros Salvos
            </Typography>
            {state.favorites.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                Nenhum filtro salvo ainda
              </Typography>
            ) : (
              <List dense>
                {state.favorites.map((fav, index) => (
                  <ListItemButton key={index} sx={{ borderRadius: 1 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <Bookmark color="primary" />
                    </ListItemIcon>
                    <ListItemText primary={fav} />
                  </ListItemButton>
                ))}
              </List>
            )}
          </Box>
        </Popover>
      </Paper>
    </LocalizationProvider>
  );
});

SmartFilters.displayName = 'SmartFilters';

export default SmartFilters;
