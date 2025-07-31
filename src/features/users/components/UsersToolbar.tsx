import React from "react";
import {
  Box, Button, IconButton, Tooltip, Grid, TextField,
  FormControl, InputLabel, Select, MenuItem, Switch, FormControlLabel, Paper, Fab
} from "@mui/material";
import { Add, Refresh } from "@mui/icons-material";
import { UserFilters } from "../types";
import { RoleUser } from "@/store/slices/auth/authSlice";

type Props = {
  filters: UserFilters;
  onChange: (updater: (prev: UserFilters) => UserFilters) => void;
  onCreate: () => void;
  onRefresh: () => void;
  isXs?: boolean;
};

export default function UsersToolbar({
  filters,
  onChange,
  onCreate,
  onRefresh,
  isXs,
}: Props) {
  const roleOptions = ["all", ...Object.values(RoleUser)] as const;

  return (
    <Paper sx={{ p: { xs: 1.5, md: 2 }, mb: 2 }}>
      <Grid container spacing={{ xs: 1.5, md: 2 }} alignItems="center">
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            size="small"
            label="Buscar (nome, e-mail, telefone, papel)"
            value={filters.q}
            onChange={(e) => onChange((prev) => ({ ...prev, q: e.target.value }))}
          />
        </Grid>

        <Grid item xs={12} md={3}>
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
              {Object.values(RoleUser).map((role) => (
                <MenuItem key={role} value={role}>
                  {role}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={3}>
          <Box
            sx={{
              display: "flex",
              gap: { xs: 1, md: 2 },
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <FormControlLabel
              control={
                <Switch
                  checked={filters.onlyActive}
                  onChange={(e) =>
                    onChange((p) => ({ ...p, onlyActive: e.target.checked }))
                  }
                />
              }
              label="Somente ativos"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={filters.onlyCompleted}
                  onChange={(e) =>
                    onChange((p) => ({ ...p, onlyCompleted: e.target.checked }))
                  }
                />
              }
              label="Somente completos"
            />
          </Box>
        </Grid>

        {/* Ações */}
        <Grid item xs={12} md={2}>
          {isXs ? (
            // MOBILE: FABs flutuantes com respiro e safe-area
            <>
              <Fab
                color="primary"
                aria-label="Criar usuário"
                onClick={onCreate}
                sx={{
                  position: "fixed",
                  bottom: "calc(env(safe-area-inset-bottom, 0px) + 96px)",
                  right: "calc(env(safe-area-inset-right, 0px) + 16px)",
                  zIndex: 1200,
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
            // DESKTOP: layout tradicional
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                gap: 1.25,
              }}
            >
              <Tooltip title="Recarregar">
                <IconButton onClick={onRefresh} aria-label="Recarregar">
                  <Refresh />
                </IconButton>
              </Tooltip>
              <Tooltip title="Criar Usuário">
                <Button variant="contained" startIcon={<Add />} onClick={onCreate}>
                  Criar
                </Button>
              </Tooltip>
            </Box>
          )}
        </Grid>
      </Grid>
    </Paper>
  );
}
