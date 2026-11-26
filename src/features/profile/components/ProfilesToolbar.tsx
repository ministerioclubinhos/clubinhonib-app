import React, { useState } from "react";
import {
  Badge,
  Box,
  Button,
  Chip,
  Collapse,
  FormControl,
  Grid2,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
  type SelectChangeEvent,
} from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import FilterListIcon from "@mui/icons-material/FilterList";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import ViewAgendaIcon from "@mui/icons-material/ViewAgenda";
import ViewModuleIcon from "@mui/icons-material/ViewModule";

import { UserRole } from "@/types/shared";

import {
  PROFILES_GENDER_FILTERS,
  PROFILES_MONTHS,
  PROFILES_ROLE_FILTERS,
  PROFILE_SORT_OPTIONS,
  ProfilesViewMode,
} from "../constants";
import type { ProfilesFilters, ProfilesSort } from "../hooks";
import type { ProfileGender, ProfileSortField, ProfileSortOrder } from "../types";
import { countActiveProfileFilters } from "../utils";
import { roleConfig } from "./profileStyles";

/** Valor do seletor quando nenhuma opção está escolhida. */
const ANY = "";
const ALL_ROLES = "all";

interface ProfilesToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  filters: ProfilesFilters;
  onFiltersChange: (updater: (current: ProfilesFilters) => ProfilesFilters) => void;
  sort: ProfilesSort;
  onSortChange: (sort: ProfilesSort) => void;
  viewMode: ProfilesViewMode;
  onViewModeChange: (mode: ProfilesViewMode) => void;
  loading: boolean;
  onRefresh: () => void;
  onClear: () => void;
  /** O coordenador só enxerga professores: filtrar por papel não lhe diz nada. */
  canFilterByRole: boolean;
}

const ProfilesToolbar: React.FC<ProfilesToolbarProps> = ({
  search,
  onSearchChange,
  filters,
  onFiltersChange,
  sort,
  onSortChange,
  viewMode,
  onViewModeChange,
  loading,
  onRefresh,
  onClear,
  canFilterByRole,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const advancedCount = countActiveProfileFilters({
    gender: filters.gender,
    birthMonth: filters.birthMonth,
    temperaments: filters.temperaments,
    loveLanguages: filters.loveLanguages,
    favoriteColor: filters.favoriteColor,
  });
  const hasAnyFilter = Boolean(search) || advancedCount > 0 || Boolean(filters.role);

  const setFilter = <K extends keyof ProfilesFilters>(
    key: K,
    value: ProfilesFilters[K] | undefined,
  ) => onFiltersChange((current) => ({ ...current, [key]: value || undefined }));

  const handleSort = (event: SelectChangeEvent<string>) => {
    const [sortBy, order] = event.target.value.split("-") as [
      ProfileSortField,
      ProfileSortOrder,
    ];
    onSortChange({ sortBy, order });
  };

  const monthLabel = PROFILES_MONTHS.find(
    (month) => month.value === filters.birthMonth,
  )?.label;

  /** Cada filtro ativo vira uma etiqueta que se remove com um toque. */
  const activeChips: Array<{ key: string; label: string; onDelete: () => void }> = [
    ...(search
      ? [{ key: "search", label: `Busca: ${search}`, onDelete: () => onSearchChange("") }]
      : []),
    ...(filters.gender
      ? [{ key: "gender", label: filters.gender, onDelete: () => setFilter("gender", undefined) }]
      : []),
    ...(monthLabel
      ? [{ key: "month", label: `Aniversário em ${monthLabel}`, onDelete: () => setFilter("birthMonth", undefined) }]
      : []),
    ...(filters.temperaments
      ? [{ key: "temperaments", label: `Temperamento: ${filters.temperaments}`, onDelete: () => setFilter("temperaments", undefined) }]
      : []),
    ...(filters.loveLanguages
      ? [{ key: "love", label: `Linguagem: ${filters.loveLanguages}`, onDelete: () => setFilter("loveLanguages", undefined) }]
      : []),
    ...(filters.favoriteColor
      ? [{ key: "color", label: `Cor: ${filters.favoriteColor}`, onDelete: () => setFilter("favoriteColor", undefined) }]
      : []),
  ];

  const roleTabValue = filters.role ?? ALL_ROLES;

  return (
    <Paper
      data-testid="profile-profiles-toolbar"
      elevation={0}
      sx={{ mb: 2, borderRadius: 3, border: 1, borderColor: "divider", overflow: "hidden" }}
    >
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={1.5}
        alignItems={{ xs: "stretch", md: "center" }}
        sx={{ p: { xs: 1.5, sm: 2 } }}
      >
        <TextField
          size="small"
          placeholder="Buscar por nome ou e-mail…"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          sx={{ flex: 1, minWidth: { md: 240 } }}
          slotProps={{
            htmlInput: { "aria-label": "Buscar perfis" },
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: search ? (
                <InputAdornment position="end">
                  <IconButton size="small" aria-label="Limpar busca" onClick={() => onSearchChange("")}>
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : undefined,
            },
          }}
        />

        <Stack direction="row" spacing={1} alignItems="center" justifyContent={{ xs: "space-between", md: "flex-end" }}>
          <Button
            size="small"
            variant={showAdvanced || advancedCount > 0 ? "contained" : "outlined"}
            aria-expanded={showAdvanced}
            aria-label="Filtros avançados"
            onClick={() => setShowAdvanced((open) => !open)}
            startIcon={
              <Badge color="error" badgeContent={advancedCount} invisible={advancedCount === 0}>
                <FilterListIcon fontSize="small" />
              </Badge>
            }
            sx={{ textTransform: "none", fontWeight: 700, borderRadius: 2 }}
          >
            Filtros
          </Button>

          <Stack direction="row" spacing={0.5} alignItems="center">
            <ToggleButtonGroup
              size="small"
              exclusive
              value={viewMode}
              aria-label="Modo de visualização"
              onChange={(_, next: ProfilesViewMode | null) => next && onViewModeChange(next)}
            >
              <ToggleButton value={ProfilesViewMode.GRID} aria-label="Ver em cartões">
                <ViewModuleIcon fontSize="small" />
              </ToggleButton>
              <ToggleButton value={ProfilesViewMode.LIST} aria-label="Ver em lista">
                <ViewAgendaIcon fontSize="small" />
              </ToggleButton>
            </ToggleButtonGroup>

            <Tooltip title="Atualizar">
              <span>
                <IconButton size="small" aria-label="Atualizar" disabled={loading} onClick={onRefresh}>
                  <RefreshIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </Stack>
        </Stack>
      </Stack>

      {canFilterByRole ? (
        <Tabs
          value={roleTabValue}
          onChange={(_, value: string) =>
            setFilter("role", value === ALL_ROLES ? undefined : (value as UserRole))
          }
          variant="scrollable"
          scrollButtons="auto"
          aria-label="Filtrar por papel"
          sx={{ borderTop: 1, borderColor: "divider", minHeight: 42, px: { xs: 0.5, sm: 1 } }}
        >
          {PROFILES_ROLE_FILTERS.map((role) => (
            <Tab
              key={role}
              value={role}
              label={role === ALL_ROLES ? "Todos" : roleConfig[role].pluralLabel}
              sx={{ minHeight: 42, textTransform: "none", fontWeight: 700 }}
            />
          ))}
        </Tabs>
      ) : null}

      <Collapse in={showAdvanced} unmountOnExit>
        <Box sx={{ p: { xs: 1.5, sm: 2 }, borderTop: 1, borderColor: "divider", bgcolor: "action.hover" }}>
          <Grid2 container spacing={1.5}>
            <Grid2 size={{ xs: 6, md: 2 }}>
              <FormControl size="small" fullWidth>
                <InputLabel id="profiles-gender">Gênero</InputLabel>
                <Select
                  labelId="profiles-gender"
                  label="Gênero"
                  value={filters.gender ?? ANY}
                  onChange={(event) => setFilter("gender", (event.target.value || undefined) as ProfileGender | undefined)}
                >
                  <MenuItem value={ANY}>Todos</MenuItem>
                  {PROFILES_GENDER_FILTERS.map((gender) => (
                    <MenuItem key={gender.value} value={gender.value}>
                      {gender.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid2>

            <Grid2 size={{ xs: 6, md: 2 }}>
              <FormControl size="small" fullWidth>
                <InputLabel id="profiles-month">Aniversário</InputLabel>
                <Select
                  labelId="profiles-month"
                  label="Aniversário"
                  value={filters.birthMonth ?? ANY}
                  onChange={(event) => setFilter("birthMonth", event.target.value === ANY ? undefined : Number(event.target.value))}
                >
                  <MenuItem value={ANY}>Qualquer mês</MenuItem>
                  {PROFILES_MONTHS.map((month) => (
                    <MenuItem key={month.value} value={month.value}>
                      {month.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid2>

            <Grid2 size={{ xs: 12, sm: 4, md: 2 }}>
              <TextField size="small" fullWidth label="Temperamento" placeholder="Ex.: Sanguíneo" value={filters.temperaments ?? ""} onChange={(event) => setFilter("temperaments", event.target.value)} />
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 4, md: 2 }}>
              <TextField size="small" fullWidth label="Linguagem do amor" placeholder="Ex.: Palavras" value={filters.loveLanguages ?? ""} onChange={(event) => setFilter("loveLanguages", event.target.value)} />
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 4, md: 2 }}>
              <TextField size="small" fullWidth label="Cor favorita" placeholder="Ex.: Azul" value={filters.favoriteColor ?? ""} onChange={(event) => setFilter("favoriteColor", event.target.value)} />
            </Grid2>

            <Grid2 size={{ xs: 12, md: 2 }}>
              <FormControl size="small" fullWidth>
                <InputLabel id="profiles-sort">Ordenar por</InputLabel>
                <Select labelId="profiles-sort" label="Ordenar por" value={`${sort.sortBy}-${sort.order}`} onChange={handleSort}>
                  {PROFILE_SORT_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid2>
          </Grid2>
        </Box>
      </Collapse>

      {hasAnyFilter ? (
        <Stack
          direction="row"
          spacing={0.75}
          alignItems="center"
          flexWrap="wrap"
          useFlexGap
          sx={{ px: { xs: 1.5, sm: 2 }, py: 1, borderTop: 1, borderColor: "divider" }}
        >
          <Typography variant="caption" color="text.secondary" fontWeight={700}>
            Filtrando por:
          </Typography>
          {filters.role ? (
            <Chip
              size="small"
              label={roleConfig[filters.role].pluralLabel}
              onDelete={() => setFilter("role", undefined)}
            />
          ) : null}
          {activeChips.map((chip) => (
            <Chip key={chip.key} size="small" label={chip.label} onDelete={chip.onDelete} />
          ))}
          <Button size="small" color="error" onClick={onClear} sx={{ textTransform: "none", ml: "auto" }}>
            Limpar tudo
          </Button>
        </Stack>
      ) : null}
    </Paper>
  );
};

export default ProfilesToolbar;
