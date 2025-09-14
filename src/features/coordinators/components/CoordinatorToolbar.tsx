import React from "react";
import {
  Paper,
  Grid,
  TextField,
  Stack,
  Button,
  Tooltip,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Box,
  Fab,
} from "@mui/material";
import { Clear, Refresh } from "@mui/icons-material";
import type { CoordinatorFilters } from "../types";

type Props = {
  filters: CoordinatorFilters;
  onChange: (updater: (prev: CoordinatorFilters) => CoordinatorFilters) => void;
  onRefresh: () => void;
  isXs?: boolean;
};

export default function CoordinatorToolbar({
  filters,
  onChange,
  onRefresh,
  isXs,
}: Props) {
  const set = <K extends keyof CoordinatorFilters>(
    key: K,
    val: CoordinatorFilters[K]
  ) => onChange((prev) => ({ ...prev, [key]: val }));

  const clear = () =>
    onChange(() => ({
      searchString: "",
      active: "all",
      hasClubs: "all",
      clubNumber: "",
    }));

  const handleClubNumber = (v: string) => {
    if (v === "") return set("clubNumber", "");
    const n = Number(v);
    if (Number.isFinite(n) && n >= 0) set("clubNumber", n);
  };

  return (
    <Paper sx={{ p: { xs: 1.25, md: 2 }, mb: 2 }}>
      <Grid container spacing={{ xs: 1.25, md: 2 }} alignItems="center">
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            size="small"
            label="Buscar (nome, e-mail, telefone)"
            value={filters.searchString}
            onChange={(e) => set("searchString", e.target.value)}
            placeholder="Ex.: Ana, ana@site.com, 92..."
            inputProps={{ "aria-label": "Campo de busca" }}
          />
        </Grid>

        <Grid item xs={6} md={2}>
          <FormControl fullWidth size="small">
            <InputLabel id="coord-vinculo-label">Vínculo</InputLabel>
            <Select
              labelId="coord-vinculo-label"
              label="Vínculo"
              value={filters.hasClubs}
              onChange={(e) =>
                set("hasClubs", e.target.value as CoordinatorFilters["hasClubs"])
              }
            >
              <MenuItem value="all">Todos</MenuItem>
              <MenuItem value="yes">Com clubinhos</MenuItem>
              <MenuItem value="no">Sem clubinhos</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={6} md={2}>
          <TextField
            fullWidth
            size="small"
            label="Nº do Clubinho"
            type="number"
            value={filters.clubNumber ?? ""}
            onChange={(e) => handleClubNumber(e.target.value)}
            inputProps={{ inputMode: "numeric", min: 0 }}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          {isXs ? (
            <>
              <Fab
                color="secondary"
                aria-label="Limpar filtros"
                onClick={clear}
                sx={{
                  position: "fixed",
                  bottom: "calc(env(safe-area-inset-bottom, 0px) + 96px)",
                  right: "calc(env(safe-area-inset-right, 0px) + 16px)",
                  zIndex: 1200,
                }}
              >
                <Clear />
              </Fab>

              <Fab
                aria-label="Recarregar"
                onClick={onRefresh}
                sx={{
                  position: "fixed",
                  bottom: "calc(env(safe-area-inset-bottom, 0px) + 16px)",
                  right: "calc(env(safe-area-inset-right, 0px) + 16px)",
                  zIndex: 1200,
                  bgcolor: "white",
                  boxShadow: 3,
                  "&:hover": { bgcolor: "grey.100" },
                }}
              >
                <Refresh />
              </Fab>
            </>
          ) : (
            <Stack direction="row" spacing={1.25} justifyContent="flex-end">
              <Button
                variant="contained"
                color="secondary"
                startIcon={<Clear />}
                onClick={clear}
              >
                Limpar
              </Button>
              <Tooltip title="Recarregar">
                <IconButton onClick={onRefresh} aria-label="Recarregar">
                  <Refresh />
                </IconButton>
              </Tooltip>
            </Stack>
          )}
        </Grid>
      </Grid>
    </Paper>
  );
}
