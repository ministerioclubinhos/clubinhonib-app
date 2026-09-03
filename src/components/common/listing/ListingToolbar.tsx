import React, { useState } from "react";
import {
  Badge,
  Box,
  Button,
  Collapse,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Tooltip,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import FilterListIcon from "@mui/icons-material/FilterList";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";

import type { ListingFilter } from "./types";

type Props = {
  searchValue: string;
  searchPlaceholder: string;
  onSearchChange: (value: string) => void;
  filters?: ListingFilter[];
  onRefresh: () => void;
  /** Ação principal da tela, quando existe. */
  action?: React.ReactNode;
};

/** Alvo mínimo confortável para o dedo. */
const TOUCH_TARGET = 44;

/**
 * Busca, filtros e recarga da listagem.
 *
 * Os valores sobem para quem chamou e viram query string: quem filtra é a API,
 * não a tela — antes a listagem inteira era baixada só para ser peneirada aqui.
 *
 * No celular os filtros ficam recolhidos atrás de um botão. Empilhados, três
 * seletores empurravam a grade para fora da primeira tela.
 */
export default function ListingToolbar({
  searchValue,
  searchPlaceholder,
  onSearchChange,
  filters = [],
  onRefresh,
  action,
}: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [filtersOpen, setFiltersOpen] = useState(false);

  const activeFilterCount = filters.filter((filter) => filter.value !== "").length;
  const showFilters = !isMobile || filtersOpen;

  const filterFields = filters.map((filter) => (
    <FormControl
      key={filter.id}
      size="small"
      sx={{ minWidth: { xs: "100%", md: 170 } }}
    >
      <InputLabel id={`listing-filter-${filter.id}`}>{filter.label}</InputLabel>
      <Select
        labelId={`listing-filter-${filter.id}`}
        label={filter.label}
        value={filter.value}
        onChange={(event) => filter.onChange(String(event.target.value))}
      >
        {filter.options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  ));

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 1.5, md: 2 },
        mb: 2,
        borderRadius: 3,
        border: 1,
        borderColor: "divider",
      }}
    >
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={{ xs: 1.5, md: 2 }}
        alignItems={{ xs: "stretch", md: "center" }}
      >
        <Stack direction="row" spacing={1} alignItems="center" sx={{ flex: 1, minWidth: 0 }}>
          <TextField
            size="small"
            fullWidth
            value={searchValue}
            placeholder={searchPlaceholder}
            onChange={(event) => onSearchChange(event.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
                endAdornment: searchValue ? (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="Limpar busca"
                      size="small"
                      onClick={() => onSearchChange("")}
                    >
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ) : undefined,
              },
            }}
          />

          {/* No celular as ações ficam ao lado da busca, na mesma linha. */}
          {isMobile ? (
            <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0 }}>
              {filters.length > 0 ? (
                <Tooltip title="Filtros">
                  <IconButton
                    onClick={() => setFiltersOpen((open) => !open)}
                    aria-label="Filtros"
                    aria-expanded={filtersOpen}
                    color={activeFilterCount > 0 ? "primary" : "default"}
                    sx={{ minWidth: TOUCH_TARGET, minHeight: TOUCH_TARGET }}
                  >
                    <Badge badgeContent={activeFilterCount} color="primary">
                      <FilterListIcon />
                    </Badge>
                  </IconButton>
                </Tooltip>
              ) : null}

              <Tooltip title="Recarregar">
                <IconButton
                  onClick={onRefresh}
                  aria-label="Recarregar"
                  sx={{ minWidth: TOUCH_TARGET, minHeight: TOUCH_TARGET }}
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          ) : null}
        </Stack>

        {!isMobile ? (
          <>
            {filterFields}

            <Stack direction="row" spacing={1} alignItems="center">
              <Tooltip title="Recarregar">
                <IconButton onClick={onRefresh} aria-label="Recarregar">
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              {action ? <Box>{action}</Box> : null}
            </Stack>
          </>
        ) : null}
      </Stack>

      {isMobile ? (
        <>
          <Collapse in={showFilters} unmountOnExit>
            <Stack spacing={1.5} sx={{ mt: 1.5 }}>
              {filterFields}
              {activeFilterCount > 0 ? (
                <Button
                  size="small"
                  onClick={() => filters.forEach((filter) => filter.onChange(""))}
                >
                  Limpar filtros
                </Button>
              ) : null}
            </Stack>
          </Collapse>

          {/* A ação principal fica sempre à vista: dentro do painel de filtros
              ela só apareceria depois de o usuário abrir os filtros. */}
          {action ? <Box sx={{ mt: 1.5 }}>{action}</Box> : null}
        </>
      ) : null}
    </Paper>
  );
}
