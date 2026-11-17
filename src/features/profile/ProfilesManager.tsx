import React, { useCallback, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  FormControl,
  Grid2,
  InputLabel,
  MenuItem,
  Pagination,
  Paper,
  Select,
  Snackbar,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";
import { AnimatePresence } from "framer-motion";
import { useSelector } from "react-redux";

import type { RootState } from "@/store/slices";
import { UserRole } from "@/types/shared";

import {
  BirthdaySection,
  ProfileAdminEditDialog,
  ProfileCard,
  ProfileCardSkeleton,
  ProfileDetailModal,
  ProfileListRow,
  ProfilesStats,
  ProfilesToolbar,
} from "./components";
import type { ProfileNoticeSeverity } from "./components/ProfileAdminEditDialog";
import {
  PROFILES_PAGE_SIZE_OPTIONS,
  PROFILES_TOAST_DURATION_MS,
  PROFILES_VIEW_STORAGE_KEY,
  ProfilesViewMode,
} from "./constants";
import { useProfileBirthdays, useProfiles, useProfilesSummary } from "./hooks";
import type { CompleteProfile } from "./types";
import { countActiveProfileFilters } from "./utils";

/** Quantos esqueletos aparecem enquanto a primeira página carrega. */
const SKELETON_COUNT = 8;

type Notice = { message: string; severity: ProfileNoticeSeverity };

/** O modo escolhido da última vez; o armazenamento pode estar bloqueado. */
function readStoredViewMode(): ProfilesViewMode {
  try {
    return window.localStorage.getItem(PROFILES_VIEW_STORAGE_KEY) === ProfilesViewMode.LIST
      ? ProfilesViewMode.LIST
      : ProfilesViewMode.GRID;
  } catch {
    return ProfilesViewMode.GRID;
  }
}

export default function ProfilesManager() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const loggedUser = useSelector((state: RootState) => state.auth.user);
  const isCoordinator = loggedUser?.role === UserRole.COORDINATOR;

  const {
    items, meta, page, setPage, pageSize, setPageSize, search, setSearch,
    filters, setFilters, sort, setSort, loading, error, setError, refresh,
  } = useProfiles();

  const [reloadToken, setReloadToken] = useState(0);
  const { today: birthdayToday, week: birthdayWeek, month: birthdayMonth, loading: loadingBirthdays } =
    useProfileBirthdays(reloadToken);
  const { summary, loading: loadingSummary } = useProfilesSummary(reloadToken);

  const [viewMode, setViewMode] = useState<ProfilesViewMode>(readStoredViewMode);
  const [selectedProfile, setSelectedProfile] = useState<CompleteProfile | null>(null);
  const [editingProfile, setEditingProfile] = useState<CompleteProfile | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);

  const currentMonth = new Date().getMonth() + 1;
  const birthdayFilterActive = filters.birthMonth === currentMonth;
  const hasActiveFilters =
    Boolean(search) ||
    countActiveProfileFilters({ role: filters.role, ...filters }) > 0;

  const hasBirthdays = birthdayToday.length + birthdayWeek.length + birthdayMonth.length > 0;

  const handleRefresh = useCallback(() => {
    refresh();
    setReloadToken((token) => token + 1);
  }, [refresh]);

  const clearFilters = () => {
    setSearch("");
    setFilters({});
  };

  const changeViewMode = (mode: ProfilesViewMode) => {
    setViewMode(mode);
    try {
      window.localStorage.setItem(PROFILES_VIEW_STORAGE_KEY, mode);
    } catch {
      // Sem armazenamento, a escolha vale só até recarregar.
    }
  };

  const notify = (message: string, severity: ProfileNoticeSeverity) =>
    setNotice({ message, severity });

  if (loading && items.length === 0 && !error) {
    return (
      <Box data-testid="profile-profiles-manager" sx={{ p: { xs: 2, sm: 3 }, width: "100%" }}>
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

  const firstItem = meta ? (meta.currentPage - 1) * meta.itemsPerPage + 1 : 0;
  const lastItem = meta ? firstItem + items.length - 1 : 0;

  return (
    <Box
      data-testid="profile-profiles-manager"
      sx={{ p: { xs: 2, sm: 3 }, width: "100%", minHeight: "100%", display: "flex", flexDirection: "column" }}
    >
      <Box
        sx={{
          mb: 2,
          p: { xs: 2, sm: 3 },
          borderRadius: 4,
          color: "common.white",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 55%, #f093fb 100%)",
          boxShadow: "0 12px 32px rgba(118, 75, 162, 0.28)",
        }}
      >
        <Typography component="h1" variant="h4" fontWeight={800} sx={{ color: "common.white", fontSize: { xs: "1.5rem", sm: "2.125rem" } }}>
          Nossa Família ❤️
        </Typography>
        <Typography variant="body2" sx={{ color: "common.white", opacity: 0.9, mt: 0.5 }}>
          {isCoordinator
            ? "Conheça os professores dos seus clubinhos"
            : "Conheça cada pessoa especial do nosso ministério"}
        </Typography>
      </Box>

      {error ? (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          onClose={() => setError("")}
          action={
            <Button color="inherit" size="small" onClick={handleRefresh}>
              Tentar de novo
            </Button>
          }
        >
          {error}
        </Alert>
      ) : null}

      <ProfilesStats
        summary={summary}
        loading={loadingSummary}
        showRoleBreakdown={!isCoordinator}
        activeRole={filters.role}
        birthdayFilterActive={birthdayFilterActive}
        onSelectRole={(role) => setFilters((current) => ({ ...current, role, birthMonth: undefined }))}
        onToggleBirthdays={() =>
          setFilters((current) => ({
            ...current,
            birthMonth: current.birthMonth === currentMonth ? undefined : currentMonth,
          }))
        }
      />

      {!loadingBirthdays && hasBirthdays ? (
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ mb: 2 }}>
          <BirthdaySection title="Aniversário Hoje! 🎉" emoji="🎂" profiles={birthdayToday} variant="today" onProfileClick={(profile) => setSearch(profile.name)} />
          <BirthdaySection title="Esta Semana" emoji="🎈" profiles={birthdayWeek} variant="week" onProfileClick={(profile) => setSearch(profile.name)} />
          <BirthdaySection title="Este Mês" emoji="🎁" profiles={birthdayMonth} variant="month" onProfileClick={(profile) => setSearch(profile.name)} />
        </Stack>
      ) : null}

      <ProfilesToolbar
        search={search}
        onSearchChange={setSearch}
        filters={filters}
        onFiltersChange={setFilters}
        sort={sort}
        onSortChange={setSort}
        viewMode={viewMode}
        onViewModeChange={changeViewMode}
        loading={loading}
        onRefresh={handleRefresh}
        onClear={clearFilters}
        canFilterByRole={!isCoordinator}
      />

      {items.length === 0 && !loading ? (
        <Paper elevation={0} sx={{ p: { xs: 4, md: 6 }, textAlign: "center", borderRadius: 4, border: 1, borderStyle: "dashed", borderColor: "divider" }}>
          <PersonSearchIcon sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Nenhum perfil encontrado
          </Typography>
          <Typography variant="body2" color="text.disabled">
            {hasActiveFilters
              ? "Nenhuma pessoa combina com a busca e os filtros atuais."
              : "Ainda não há pessoas para mostrar aqui."}
          </Typography>
          {hasActiveFilters ? (
            <Chip label="Limpar filtros" onClick={clearFilters} color="primary" variant="outlined" sx={{ mt: 2 }} />
          ) : null}
        </Paper>
      ) : (
        <>
          <Box sx={{ opacity: loading ? 0.6 : 1, transition: "opacity .2s" }} aria-busy={loading}>
            {viewMode === ProfilesViewMode.LIST ? (
              <Stack spacing={1}>
                {items.map((profile) => (
                  <ProfileListRow key={profile.id} profile={profile} onClick={() => setSelectedProfile(profile)} />
                ))}
              </Stack>
            ) : (
              <Grid2 container spacing={2}>
                <AnimatePresence>
                  {items.map((profile, index) => (
                    <Grid2 key={profile.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                      <ProfileCard profile={profile} index={index} onClick={() => setSelectedProfile(profile)} />
                    </Grid2>
                  ))}
                </AnimatePresence>
              </Grid2>
            )}
          </Box>

          {meta ? (
            <Paper elevation={0} sx={{ mt: 3, p: { xs: 1.5, sm: 2 }, borderRadius: 3, border: 1, borderColor: "divider" }}>
              <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems="center" spacing={1.5}>
                <Typography variant="body2" color="text.secondary" data-testid="profile-profiles-range">
                  Mostrando <strong>{firstItem}–{lastItem}</strong> de <strong>{meta.totalItems}</strong>
                  {hasActiveFilters ? " (filtrado)" : ""}
                </Typography>

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

                <FormControl size="small" sx={{ minWidth: 100 }}>
                  <InputLabel id="profiles-page-size">Por página</InputLabel>
                  <Select labelId="profiles-page-size" label="Por página" value={pageSize} onChange={(event) => setPageSize(Number(event.target.value))}>
                    {PROFILES_PAGE_SIZE_OPTIONS.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
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
        onNotify={notify}
      />

      <Snackbar
        open={!!notice}
        autoHideDuration={PROFILES_TOAST_DURATION_MS}
        onClose={() => setNotice(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        {notice ? (
          <Alert severity={notice.severity} variant="filled" onClose={() => setNotice(null)} sx={{ width: "100%" }}>
            {notice.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </Box>
  );
}
