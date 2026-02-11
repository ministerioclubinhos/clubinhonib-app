import React from "react";
import {
  Box,
  Button,
  IconButton,
  Tooltip,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  FormGroup,
  Paper,
  Fab,
} from "@mui/material";
import { Add, Refresh } from "@mui/icons-material";
import { UserFilters } from "../types";
import { UserRole } from "@/types/shared";

type Props = {
  filters: UserFilters;
  onChange: (updater: (prev: UserFilters) => UserFilters) => void;
  onCreate: () => void;
  onRefresh: () => void;
  onClearFilters: () => void;
  isXs?: boolean;
};

const roleLabels: Record<UserRole, string> = {
  [UserRole.COORDINATOR]: "Coordenador",
  [UserRole.TEACHER]: "Professor",
  [UserRole.ADMIN]: "Administrador",
};

export default function UsersToolbar({
  filters,
  onChange,
  onCreate,
  onRefresh,
  onClearFilters,
  isXs,
}: Props) {
  const roleOptions = ["all", UserRole.COORDINATOR, UserRole.TEACHER] as const;

  return (
    <Paper sx={{ p: { xs: 1.5, md: 2 }, mb: 2 }}>
      <Grid container spacing={{ xs: 1.5, md: 2 }} alignItems="center">
        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            size="small"
            label="Buscar"
            placeholder="Nome, e-mail, telefone..."
            value={filters.q}
            onChange={(e) =>
              onChange((prev) => ({ ...prev, q: e.target.value }))
            }
          />
        </Grid>

        <Grid item xs={6} md={2}>
          <FormControl size="small" fullWidth>
            <InputLabel>Papel</InputLabel>
            <Select
              value={filters.role}
              label="Papel"
              onChange={(e) =>
                onChange((prev) => ({
                  ...prev,
                  role: e.target.value as (typeof roleOptions)[number],
                }))
              }
            >
              <MenuItem value="all">Todos</MenuItem>
              {roleOptions
                .filter((role) => role !== "all")
                .map((role) => (
                  <MenuItem key={role} value={role}>
                    {roleLabels[role]}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={6} md={2}>
          <FormControl size="small" fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={
                filters.active === null
                  ? "all"
                  : filters.active
                    ? "true"
                    : "false"
              }
              label="Status"
              onChange={(e) => {
                const val = e.target.value;
                const active =
                  val === "all" ? null : val === "true" ? true : false;
                onChange((prev) => ({ ...prev, active }));
              }}
            >
              <MenuItem value="all">Todos</MenuItem>
              <MenuItem value="true">Ativos</MenuItem>
              <MenuItem value="false">Inativos</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={6} md={2}>
          <FormControl size="small" fullWidth>
            <InputLabel>Cadastro</InputLabel>
            <Select
              value={
                filters.completed === null
                  ? "all"
                  : filters.completed
                    ? "true"
                    : "false"
              }
              label="Cadastro"
              onChange={(e) => {
                const val = e.target.value;
                const completed =
                  val === "all" ? null : val === "true" ? true : false;
                onChange((prev) => ({ ...prev, completed }));
              }}
            >
              <MenuItem value="all">Todos</MenuItem>
              <MenuItem value="true">Completo</MenuItem>
              <MenuItem value="false">Incompleto</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid
          item
          xs={6}
          md={3}
          sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}
        >
          <Button
            color="inherit"
            size="small"
            onClick={onClearFilters}
            sx={{ minWidth: "auto" }}
          >
            Limpar
          </Button>

          {isXs ? (
            <>
              <Fab
                color="primary"
                aria-label="Criar usuário"
                onClick={onCreate}
                sx={{
                  position: "fixed",
                  bottom: "calc(env(safe-area-inset-bottom, 0px) + 96px)",
                  right: "calc(env(safe-area-inset-right, 0px) + 16px)",
                  zIndex: 9999,
                  boxShadow: 6,
                }}
              >
                <Add />
              </Fab>

              <Fab
                aria-label="Recarregar"
                onClick={onRefresh}
                sx={{
                  position: "fixed",
                  bottom: "calc(env(safe-area-inset-bottom, 0px) + 16px)",
                  right: "calc(env(safe-area-inset-right, 0px) + 16px)",
                  zIndex: 9999,
                  bgcolor: "white",
                  boxShadow: 6,
                  "&:hover": { bgcolor: "grey.100" },
                }}
              >
                <Refresh />
              </Fab>
            </>
          ) : (
            <>
              <Tooltip title="Recarregar">
                <IconButton onClick={onRefresh} aria-label="Recarregar">
                  <Refresh />
                </IconButton>
              </Tooltip>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={onCreate}
              >
                Criar
              </Button>
            </>
          )}
        </Grid>
      </Grid>
    </Paper>
  );
}
