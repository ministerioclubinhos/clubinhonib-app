import React, { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Chip,
  Collapse,
  FormControl,
  Grid2,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Pagination,
  Paper,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
  type SelectChangeEvent,
} from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import FilterListIcon from "@mui/icons-material/FilterList";
import PersonIcon from "@mui/icons-material/Person";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import SortIcon from "@mui/icons-material/Sort";
import { AnimatePresence, motion } from "framer-motion";
import { useSelector } from "react-redux";

import type { RootState } from "@/store/slices";
import { UserRole } from "@/types/shared";

import {
  BirthdaySection,
  ProfileAdminEditDialog,
  ProfileCard,
  ProfileCardSkeleton,
  ProfileDetailModal,
} from "./components";
import { roleConfig } from "./components/profileStyles";
import { useProfileBirthdays, useProfiles } from "./hooks";
import {
  PROFILES_PAGE_SIZE_OPTIONS,
  PROFILES_ROLE_FILTERS,
  PROFILE_SORT_OPTIONS,
} from "./constants";
import type { CompleteProfile, ProfileSortField, ProfileSortOrder } from "./types";

/** Valor do seletor de papel quando nenhum está escolhido. */
const ALL_ROLES = "all";

/** Quantos esqueletos aparecem enquanto a primeira página carrega. */
const SKELETON_COUNT = 8;

export default function ProfilesManager() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const loggedUser = useSelector((state: RootState) => state.auth.user);

  const {
    items,
    meta,
    page,
    setPage,
    pageSize,
    setPageSize,
    search,
    setSearch,
    filters,
    setFilters,
    sort,
    setSort,
    loading,
    error,
    setError,
    refresh,
  } = useProfiles();

  const [birthdayReloadToken, setBirthdayReloadToken] = useState(0);
  const {
    today: birthdayToday,
    week: birthdayWeek,
    month: birthdayMonth,
    loading: loadingBirthdays,
  } = useProfileBirthdays(birthdayReloadToken);

  const [showFilters, setShowFilters] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<CompleteProfile | null>(
    null,
  );
  const [editingProfile, setEditingProfile] = useState<CompleteProfile | null>(
    null,
  );

  const hasActiveFilters = useMemo(
    () =>
      Boolean(
        search ||
          filters.role ||
          filters.temperaments ||
          filters.loveLanguages ||
          filters.favoriteColor,
      ),
    [search, filters],
  );

  const hasBirthdays =
    birthdayToday.length > 0 ||
    birthdayWeek.length > 0 ||
    birthdayMonth.length > 0;

  const handleRefresh = () => {
    refresh();
    setBirthdayReloadToken((token) => token + 1);
  };

  const clearFilters = () => {
    setSearch("");
    setFilters({});
  };

  const handleSortChange = (event: SelectChangeEvent<string>) => {
    const [sortBy, order] = event.target.value.split("-") as [
      ProfileSortField,
      ProfileSortOrder,
    ];
    setSort({ sortBy, order });
  };

  if (loading && items.length === 0) {
    return (
      <Box sx={{ p: { xs: 2, sm: 3 }, width: "100%" }}>
        <Grid2 container spacing={2}>
          {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
            <Grid2 key={index} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <ProfileCardSkeleton />
            </Grid2>
          ))}
        </Grid2>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 3 },
        width: "100%",
        minHeight: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <Box sx={{ mb: 2, textAlign: "center" }}>
          <Typography
            component="h1"
            variant="h4"
            fontWeight={800}
            sx={{
              background:
                "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
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

      {error ? (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
          {error}
        </Alert>
      ) : null}

      {!loadingBirthdays && hasBirthdays ? (
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ mb: 2 }}>
          <BirthdaySection
            title="Aniversário Hoje! 🎉"
            emoji="🎂"
            profiles={birthdayToday}
            variant="today"
            onProfileClick={(profile) => setSearch(profile.name)}
          />
          <BirthdaySection
            title="Esta Semana"
            emoji="🎈"
            profiles={birthdayWeek}
            variant="week"
            onProfileClick={(profile) => setSearch(profile.name)}
          />
          <BirthdaySection
            title="Este Mês"
            emoji="🎁"
            profiles={birthdayMonth}
            variant="month"
            onProfileClick={(profile) => setSearch(profile.name)}
          />
        </Stack>
      ) : null}

      <Paper
        elevation={0}
        sx={{
          p: { xs: 1.5, sm: 2 },
          mb: 2,
          borderRadius: 3,
          border: 1,
          borderColor: "divider",
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={{ xs: 1.5, sm: 2 }}
          alignItems={{ xs: "stretch", md: "center" }}
        >
          <TextField
            size="small"
            placeholder="Buscar por nome ou e-mail…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            sx={{ flex: 1, minWidth: { xs: "100%", md: 200 } }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
                endAdornment: search ? (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      aria-label="Limpar busca"
                      onClick={() => setSearch("")}
                    >
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ) : undefined,
              },
            }}
          />

          {/* O coordenador só enxerga os professores dos seus clubinhos, então
              filtrar por papel não lhe diria nada. */}
          {loggedUser?.role !== UserRole.COORDINATOR ? (
            <Stack
              direction="row"
              spacing={0.5}
              flexWrap="wrap"
              useFlexGap
              sx={{ justifyContent: { xs: "center", md: "flex-start" } }}
            >
              {PROFILES_ROLE_FILTERS.map((role) => {
                const isSelected =
                  role === ALL_ROLES ? !filters.role : filters.role === role;
                const config = role === ALL_ROLES ? null : roleConfig[role];

                return (
                  <Chip
                    key={role}
                    size="small"
                    label={role === ALL_ROLES ? "Todos" : config?.label}
                    onClick={() =>
                      setFilters((current) => ({
                        ...current,
                        role: role === ALL_ROLES ? undefined : role,
                      }))
                    }
                    sx={{
                      fontWeight: isSelected ? 700 : 500,
                      height: { xs: 28, sm: 32 },
                      bgcolor: isSelected
                        ? (config?.color ?? theme.palette.primary.main)
                        : "action.hover",
                      color: isSelected ? "common.white" : "text.secondary",
                    }}
                  />
                );
              })}
            </Stack>
          ) : null}

          <Stack
            direction="row"
            spacing={1}
            sx={{ justifyContent: { xs: "center", md: "flex-start" } }}
          >
            <Tooltip title="Filtros avançados">
              <IconButton
                size="small"
                aria-label="Filtros avançados"
                aria-expanded={showFilters}
                color={showFilters ? "primary" : "default"}
                onClick={() => setShowFilters((open) => !open)}
              >
                <FilterListIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title="Atualizar">
              <span>
                <IconButton
                  size="small"
                  aria-label="Atualizar"
                  disabled={loading}
                  onClick={handleRefresh}
                >
                  <RefreshIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>

            {hasActiveFilters ? (
              <Tooltip title="Limpar filtros">
                <IconButton
                  size="small"
                  color="error"
                  aria-label="Limpar filtros"
                  onClick={clearFilters}
                >
                  <ClearIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            ) : null}
          </Stack>
        </Stack>
      </Paper>

      <Collapse in={showFilters} unmountOnExit>
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 2,
            borderRadius: 3,
            border: 1,
            borderColor: "divider",
          }}
        >
          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2 }}>
            Filtros avançados
          </Typography>

          <Grid2 container spacing={2}>
            <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                size="small"
                fullWidth
                label="Temperamento"
                placeholder="Ex.: Sanguíneo"
                value={filters.temperaments ?? ""}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    temperaments: event.target.value || undefined,
                  }))
                }
              />
            </Grid2>

            <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                size="small"
                fullWidth
                label="Linguagem do amor"
                placeholder="Ex.: Palavras"
                value={filters.loveLanguages ?? ""}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    loveLanguages: event.target.value || undefined,
                  }))
                }
              />
            </Grid2>

            <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                size="small"
                fullWidth
                label="Cor favorita"
                placeholder="Ex.: Azul"
                value={filters.favoriteColor ?? ""}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    favoriteColor: event.target.value || undefined,
                  }))
                }
              />
            </Grid2>

            <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl size="small" fullWidth>
                <InputLabel id="profiles-sort">
                  <SortIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: "middle" }} />
                  Ordenar por
                </InputLabel>
                <Select
                  labelId="profiles-sort"
                  label="Ordenar por"
                  value={`${sort.sortBy}-${sort.order}`}
                  onChange={handleSortChange}
                >
                  {PROFILE_SORT_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid2>
          </Grid2>
        </Paper>
      </Collapse>

      {items.length === 0 && !loading ? (
        <Paper
          elevation={0}
          sx={{
            p: { xs: 4, md: 6 },
            textAlign: "center",
            borderRadius: 4,
            border: 1,
            borderStyle: "dashed",
            borderColor: "divider",
          }}
        >
          <PersonIcon sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Nenhum perfil encontrado
          </Typography>
          <Typography variant="body2" color="text.disabled">
            Ajuste a busca ou os filtros para ver outros resultados.
          </Typography>
          {hasActiveFilters ? (
            <Chip
              label="Limpar filtros"
              onClick={clearFilters}
              color="primary"
              variant="outlined"
              sx={{ mt: 2 }}
            />
          ) : null}
        </Paper>
      ) : (
        <>
          <Grid2
            container
            spacing={2}
            // Recarregar não deve apagar a grade; só esmaece enquanto vem.
            sx={{ opacity: loading ? 0.6 : 1, transition: "opacity .2s" }}
          >
            <AnimatePresence>
              {items.map((profile, index) => (
                <Grid2 key={profile.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                  <ProfileCard
                    profile={profile}
                    index={index}
                    onClick={() => setSelectedProfile(profile)}
                  />
                </Grid2>
              ))}
            </AnimatePresence>
          </Grid2>

          {meta ? (
            <Paper
              elevation={0}
              sx={{
                mt: 3,
                p: { xs: 1.5, sm: 2 },
                borderRadius: 3,
                border: 1,
                borderColor: "divider",
              }}
            >
              <Stack
                direction={{ xs: "column", sm: "row" }}
                justifyContent="center"
                alignItems="center"
                spacing={{ xs: 1.5, sm: 2 }}
                sx={{ position: "relative" }}
              >
                {meta.totalPages > 1 ? (
                  <Pagination
                    count={meta.totalPages}
                    page={page}
                    onChange={(_, nextPage) => setPage(nextPage)}
                    color="primary"
                    size={isMobile ? "small" : "medium"}
                    showFirstButton
                    showLastButton
                    siblingCount={isMobile ? 0 : 1}
                    boundaryCount={1}
                  />
                ) : null}

                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  sx={{
                    position: { xs: "static", sm: "absolute" },
                    right: { sm: 16 },
                  }}
                >
                  <FormControl size="small" sx={{ minWidth: { xs: 70, sm: 80 } }}>
                    <InputLabel id="profiles-page-size">Por página</InputLabel>
                    <Select
                      labelId="profiles-page-size"
                      label="Por página"
                      value={pageSize}
                      onChange={(event) => setPageSize(Number(event.target.value))}
                    >
                      {PROFILES_PAGE_SIZE_OPTIONS.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <Typography variant="caption" color="text.secondary" noWrap>
                    de <strong>{meta.totalItems}</strong>
                    {hasActiveFilters ? " (filtrado)" : ""}
                  </Typography>
                </Stack>
              </Stack>
            </Paper>
          ) : null}
        </>
      )}

      <ProfileDetailModal
        profile={selectedProfile}
        open={!!selectedProfile}
        onClose={() => setSelectedProfile(null)}
        userRole={loggedUser?.role}
        currentUserName={loggedUser?.name}
        onEdit={() => {
          setEditingProfile(selectedProfile);
          setSelectedProfile(null);
        }}
      />

      <ProfileAdminEditDialog
        open={!!editingProfile}
        profile={editingProfile}
        onClose={() => setEditingProfile(null)}
        onUpdate={handleRefresh}
      />
    </Box>
  );
}
