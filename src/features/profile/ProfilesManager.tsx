import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Grid,
  Chip,
  Stack,
  Alert,
  Collapse,
  useTheme,
  useMediaQuery,
  Paper,
  Pagination,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Tooltip,
  CircularProgress,
  Skeleton,
  SelectChangeEvent,
} from '@mui/material';
import {
  Search as SearchIcon,
  Person as PersonIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  Sort as SortIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/slices';
import { apiGetAllProfiles } from './api';
import { CompleteProfileListItem, QueryProfilesDto, PaginationMeta } from './types';
import {
  ProfileAdminEditDialog,
  ProfileDetailModal,
  BirthdaySection,
  ProfileCard,
  ProfileCardSkeleton,
} from './components';
import { roleConfig } from './constants/profileConstants';
import { getBirthdayStatus, getDaysUntilBirthday } from './utils/profileHelpers';
import { extractErrorMessage } from '@/utils/apiError';


const ProfilesManager: React.FC = () => {
  const [profiles, setProfiles] = useState<CompleteProfileListItem[]>([]);
  const [allProfiles, setAllProfiles] = useState<CompleteProfileListItem[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<CompleteProfileListItem | null>(null);
  const [editingProfile, setEditingProfile] = useState<CompleteProfileListItem | null>(null);

  const { user } = useSelector((state: RootState) => state.auth);

  const [loading, setLoading] = useState(true);
  const [loadingBirthdays, setLoadingBirthdays] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState<QueryProfilesDto>({
    page: 1,
    limit: 12,
    sortBy: 'name',
    order: 'ASC',
  });

  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchInput), 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    setFilters(prev => ({ ...prev, q: debouncedSearch || undefined, page: 1 }));
  }, [debouncedSearch]);

  const loadProfiles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiGetAllProfiles(filters);
      setProfiles(response.items);
      setMeta(response.meta);
    } catch (err: unknown) {
      setError(extractErrorMessage(err, 'Erro ao carregar perfis'));
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const loadAllProfilesForBirthdays = useCallback(async () => {
    try {
      setLoadingBirthdays(true);
      const response = await apiGetAllProfiles({ limit: 1000 });
      setAllProfiles(response.items);
    } catch {
    } finally {
      setLoadingBirthdays(false);
    }
  }, []);

  useEffect(() => { loadProfiles(); }, [loadProfiles]);
  useEffect(() => { loadAllProfilesForBirthdays(); }, [loadAllProfilesForBirthdays]);

  const { birthdayToday, birthdayWeek, birthdayMonth } = useMemo(() => {
    const today: CompleteProfileListItem[] = [];
    const week: CompleteProfileListItem[] = [];
    const month: CompleteProfileListItem[] = [];

    allProfiles.forEach((profile) => {
      const status = getBirthdayStatus(profile.personalData?.birthDate);
      if (status === 'today') today.push(profile);
      else if (status === 'this-week') week.push(profile);
      else if (status === 'this-month') month.push(profile);
    });

    const sortByBirthday = (a: CompleteProfileListItem, b: CompleteProfileListItem) => {
      const daysA = getDaysUntilBirthday(a.personalData?.birthDate) ?? 999;
      const daysB = getDaysUntilBirthday(b.personalData?.birthDate) ?? 999;
      return daysA - daysB;
    };

    week.sort(sortByBirthday);
    month.sort(sortByBirthday);

    return { birthdayToday: today, birthdayWeek: week, birthdayMonth: month };
  }, [allProfiles]);

  const handlePageChange = (_: React.ChangeEvent<unknown>, page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleRoleFilterChange = (role: string) => {
    setFilters(prev => ({ ...prev, role: role === 'all' ? undefined : role, page: 1 }));
  };

  const handleSortChange = (e: SelectChangeEvent<string>) => {
    const [sortBy, order] = e.target.value.split('-') as [QueryProfilesDto['sortBy'], QueryProfilesDto['order']];
    setFilters(prev => ({ ...prev, sortBy, order, page: 1 }));
  };

  const handleLimitChange = (e: SelectChangeEvent<number>) => {
    setFilters(prev => ({ ...prev, limit: e.target.value as number, page: 1 }));
  };

  const handleAdvancedFilterChange = (field: keyof QueryProfilesDto, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value || undefined, page: 1 }));
  };

  const clearFilters = () => {
    setSearchInput('');
    setFilters({ page: 1, limit: 12, sortBy: 'name', order: 'ASC' });
  };

  const hasActiveFilters = Boolean(
    filters.q || filters.role || filters.temperaments || filters.loveLanguages || filters.favoriteColor
  );

  const handleRefresh = () => {
    loadProfiles();
    loadAllProfilesForBirthdays();
  };

  if (loading && profiles.length === 0) {
    return (
      <Box sx={{ p: { xs: 2, sm: 3 }, width: '100%', minHeight: '100%' }}>
        <Box sx={{ mb: 3, textAlign: 'center' }}>
          <Skeleton variant="text" width={300} height={50} sx={{ mx: 'auto' }} />
          <Skeleton variant="text" width={400} height={24} sx={{ mx: 'auto', mt: 1 }} />
        </Box>
        <Grid container spacing={2}>
          {[...Array(8)].map((_, i) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
              <ProfileCardSkeleton />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, width: '100%', minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <Box sx={{ mb: 2, textAlign: 'center' }}>
          <Typography
            variant="h4"
            fontWeight={800}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 0.5,
            }}
          >
            Nossa Família ❤️
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Conheça cada pessoa especial do nosso ministério
          </Typography>
        </Box>
      </motion.div>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {!loadingBirthdays && (birthdayToday.length > 0 || birthdayWeek.length > 0 || birthdayMonth.length > 0) && (
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1}
          sx={{ mb: 2 }}
        >
          <BirthdaySection
            title="Aniversário Hoje! 🎉"
            emoji="🎂"
            profiles={birthdayToday}
            variant="today"
            onProfileClick={setSelectedProfile}
          />
          <BirthdaySection
            title="Esta Semana"
            emoji="🎈"
            profiles={birthdayWeek}
            variant="week"
            onProfileClick={setSelectedProfile}
          />
          <BirthdaySection
            title="Este Mês"
            emoji="🎁"
            profiles={birthdayMonth}
            variant="month"
            onProfileClick={setSelectedProfile}
          />
        </Stack>
      )}

      <Paper
        elevation={0}
        sx={{ p: { xs: 1.5, sm: 2 }, mb: 2, borderRadius: 3, border: '1px solid rgba(0,0,0,0.06)', bgcolor: 'rgba(255,255,255,0.8)' }}
      >
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 1.5, sm: 2 }} alignItems={{ xs: 'stretch', md: 'center' }}>
          <TextField
            placeholder="Buscar por nome ou email..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            size="small"
            sx={{ flex: 1, minWidth: { xs: '100%', md: 200 }, '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'white' } }}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: 'text.disabled' }} /></InputAdornment>,
              endAdornment: searchInput && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearchInput('')}><ClearIcon sx={{ fontSize: 18 }} /></IconButton>
                </InputAdornment>
              ),
            }}
          />

          {user?.role !== 'coordinator' && (
            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ justifyContent: { xs: 'center', md: 'flex-start' } }}>
              {(['all', 'teacher', 'coordinator', 'admin'] as const).map((role) => {
                const isSelected = (filters.role || 'all') === (role === 'all' ? 'all' : role) && (role === 'all' ? !filters.role : true);
                const config = role === 'all' ? null : roleConfig[role];
                return (
                  <Chip
                    key={role}
                    label={role === 'all' ? 'Todos' : config?.label}
                    size="small"
                    onClick={() => handleRoleFilterChange(role)}
                    sx={{
                      fontWeight: isSelected ? 700 : 500,
                      fontSize: { xs: '0.7rem', sm: '0.8125rem' },
                      height: { xs: 28, sm: 32 },
                      bgcolor: isSelected ? (config?.color || '#667eea') : 'rgba(0,0,0,0.04)',
                      color: isSelected ? 'white' : 'text.secondary',
                      '&:hover': { bgcolor: isSelected ? (config?.color || '#667eea') : 'rgba(0,0,0,0.08)' },
                    }}
                  />
                );
              })}
            </Stack>
          )}

          <Stack direction="row" spacing={1} sx={{ justifyContent: { xs: 'center', md: 'flex-start' } }}>
            <Tooltip title="Filtros avançados">
              <IconButton
                size="small"
                onClick={() => setShowFilters(!showFilters)}
                sx={{
                  bgcolor: showFilters ? 'primary.main' : 'rgba(0,0,0,0.04)',
                  color: showFilters ? 'white' : 'text.secondary',
                  '&:hover': { bgcolor: showFilters ? 'primary.dark' : 'rgba(0,0,0,0.08)' },
                }}
              >
                <FilterIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Atualizar">
              <IconButton size="small" onClick={handleRefresh} disabled={loading} sx={{ bgcolor: 'rgba(0,0,0,0.04)' }}>
                {loading ? <CircularProgress size={20} /> : <RefreshIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
            {hasActiveFilters && (
              <Tooltip title="Limpar filtros">
                <IconButton size="small" onClick={clearFilters} sx={{ bgcolor: 'rgba(244,67,54,0.1)', color: '#f44336' }}>
                  <ClearIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        </Stack>
      </Paper>

      <Collapse in={showFilters}>
        <Paper
          elevation={0}
          sx={{ p: 2, mb: 2, borderRadius: 3, border: '1px solid rgba(0,0,0,0.06)', bgcolor: 'rgba(248,248,255,0.5)' }}
        >
          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2, color: 'text.secondary' }}>
            <FilterIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} /> Filtros Avançados
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField label="Temperamento" placeholder="Ex: Sanguíneo" value={filters.temperaments || ''} onChange={(e) => handleAdvancedFilterChange('temperaments', e.target.value)} size="small" fullWidth />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField label="Linguagem do Amor" placeholder="Ex: Palavras" value={filters.loveLanguages || ''} onChange={(e) => handleAdvancedFilterChange('loveLanguages', e.target.value)} size="small" fullWidth />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField label="Cor Favorita" placeholder="Ex: Azul" value={filters.favoriteColor || ''} onChange={(e) => handleAdvancedFilterChange('favoriteColor', e.target.value)} size="small" fullWidth />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl size="small" fullWidth>
                <InputLabel><SortIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} /> Ordenar por</InputLabel>
                <Select value={`${filters.sortBy}-${filters.order}`} onChange={handleSortChange} label="Ordenar por">
                  <MenuItem value="name-ASC">Nome (A-Z)</MenuItem>
                  <MenuItem value="name-DESC">Nome (Z-A)</MenuItem>
                  <MenuItem value="email-ASC">Email (A-Z)</MenuItem>
                  <MenuItem value="email-DESC">Email (Z-A)</MenuItem>
                  <MenuItem value="createdAt-DESC">Mais recentes</MenuItem>
                  <MenuItem value="createdAt-ASC">Mais antigos</MenuItem>
                  <MenuItem value="birthDate-ASC">Aniversário (Jan-Dez)</MenuItem>
                  <MenuItem value="birthDate-DESC">Aniversário (Dez-Jan)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>
      </Collapse>

      {profiles.length === 0 && !loading ? (
        <Paper elevation={0} sx={{ p: 6, textAlign: 'center', borderRadius: 4, border: '1px solid rgba(0,0,0,0.06)' }}>
          <PersonIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>Nenhum perfil encontrado</Typography>
          <Typography variant="body2" color="text.disabled">Tente ajustar os filtros de busca</Typography>
          {hasActiveFilters && <Chip label="Limpar filtros" onClick={clearFilters} sx={{ mt: 2 }} color="primary" variant="outlined" />}
        </Paper>
      ) : (
        <>
          <Grid container spacing={2}>
            <AnimatePresence>
              {profiles.map((profile, index) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={profile.id}>
                  <ProfileCard profile={profile} index={index} onClick={() => setSelectedProfile(profile)} />
                </Grid>
              ))}
            </AnimatePresence>
          </Grid>

          {meta && (
            <Paper
              elevation={0}
              sx={{
                mt: 3,
                p: { xs: 1.5, sm: 2 },
                borderRadius: 3,
                border: '1px solid rgba(0,0,0,0.06)',
                bgcolor: 'rgba(255,255,255,0.8)'
              }}
            >
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent="center"
                alignItems="center"
                spacing={{ xs: 1.5, sm: 2 }}
                sx={{ position: 'relative' }}
              >
                {meta.totalPages > 1 && (
                  <Pagination
                    count={meta.totalPages}
                    page={meta.currentPage}
                    onChange={handlePageChange}
                    color="primary"
                    size={isMobile ? 'small' : 'medium'}
                    showFirstButton
                    showLastButton
                    siblingCount={isMobile ? 0 : 1}
                    boundaryCount={1}
                  />
                )}

                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  sx={{
                    position: { xs: 'static', sm: 'absolute' },
                    right: { sm: 16 },
                  }}
                >
                  <FormControl size="small" sx={{ minWidth: { xs: 60, sm: 70 } }}>
                    <Select
                      value={filters.limit || 12}
                      onChange={handleLimitChange}
                      sx={{
                        '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,0,0,0.1)' },
                        bgcolor: 'white',
                        borderRadius: 2,
                        fontSize: { xs: '0.7rem', sm: '0.8rem' },
                        '& .MuiSelect-select': { py: 0.75 },
                      }}
                    >
                      <MenuItem value={8}>8</MenuItem>
                      <MenuItem value={12}>12</MenuItem>
                      <MenuItem value={24}>24</MenuItem>
                      <MenuItem value={48}>48</MenuItem>
                    </Select>
                  </FormControl>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' }, whiteSpace: 'nowrap' }}
                  >
                    de <strong>{meta.totalItems}</strong>
                    {hasActiveFilters && ' (filtrado)'}
                  </Typography>
                </Stack>
              </Stack>
            </Paper>
          )}
        </>
      )}

      {loading && profiles.length > 0 && (
        <Box sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1000 }}>
          <Paper elevation={8} sx={{ p: 2, borderRadius: 3, display: 'flex', alignItems: 'center', gap: 1.5, bgcolor: 'white' }}>
            <CircularProgress size={20} />
            <Typography variant="body2" color="text.secondary">Carregando...</Typography>
          </Paper>
        </Box>
      )}

      <ProfileDetailModal
        profile={selectedProfile}
        open={!!selectedProfile}
        onClose={() => setSelectedProfile(null)}
        userRole={user?.role}
        currentUserName={user?.name}
        onEdit={() => {
          setEditingProfile(selectedProfile);
          setSelectedProfile(null);
        }}
      />

      <ProfileAdminEditDialog
        open={!!editingProfile}
        profile={editingProfile}
        onClose={() => setEditingProfile(null)}
        onUpdate={() => {
          loadProfiles();
          // Optionally refresh birthdays too
          loadAllProfilesForBirthdays();
        }}
      />
    </Box>
  );
};

export default ProfilesManager;
