// src/modules/clubs/components/ClubsToolbar.tsx
import React from "react";
import {
  Button,
  IconButton,
  Tooltip,
  Grid,
  TextField,
  Paper,
  Stack,
  Box,
  Fab,
  Typography,
} from "@mui/material";
import { Add, Refresh, CleaningServices } from "@mui/icons-material";
import { ClubFilters } from "../types";

type Props = {
  filters: ClubFilters;
  onChange: (updater: (prev: ClubFilters) => ClubFilters) => void;
  onCreateClick: () => void;
  onRefreshClick: () => void;
  isXs?: boolean;
};

export default function ClubsToolbar({
  filters,
  onChange,
  onCreateClick,
  onRefreshClick,
  isXs,
}: Props) {
  const handleChange = <K extends keyof ClubFilters>(
    key: K,
    value: ClubFilters[K]
  ) => {
    onChange((prev) => ({ ...prev, [key]: value }));
  };

  const handleClear = () => {
    onChange(() => ({
      clubSearchString: "",
      userSearchString: "",
      addressSearchString: "",
    }));
  };

  return (
    <Paper
      sx={{
        p: { xs: 2, md: 3 },
        mb: 2,
        borderRadius: 3,
      }}
      elevation={3}
    >
      <Typography
        variant="subtitle1"
        fontWeight={700}
        sx={{ mb: 2, color: "text.primary" }}
      >
        Pesquisar
      </Typography>

      <Grid container spacing={{ xs: 1.5, md: 2 }} alignItems="center">
        {/* Club (número ou dia da semana) */}
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            size="small"
            label="Clubinho"
            value={filters.clubSearchString ?? ""}
            onChange={(e) => handleChange("clubSearchString", e.target.value)}
            placeholder="Número ou dia"
          />
        </Grid>

        {/* Busca em Usuários */}
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            size="small"
            label="Professor/Coordenador"
            value={filters.userSearchString ?? ""}
            onChange={(e) => handleChange("userSearchString", e.target.value)}
            placeholder="Nome, e-mail ou telefone"
          />
        </Grid>

        {/* Busca em Endereço */}
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            size="small"
            label="Endereço"
            value={filters.addressSearchString ?? ""}
            onChange={(e) => handleChange("addressSearchString", e.target.value)}
            placeholder="Rua, bairro ou cidade"
          />
        </Grid>

        {/* Ações */}
        <Grid item xs={12}>
          {isXs ? (
            <>
              <Box sx={{ height: 64 }} /> {/* espaçador pro FAB */}

              <Box
                sx={{
                  position: "fixed",
                  bottom: 16,
                  right: 16,
                  zIndex: 1200,
                }}
              >
                <Stack spacing={1} alignItems="flex-end">
                  <Tooltip title="Limpar filtros">
                    <Fab
                      size="small"
                      color="secondary"
                      aria-label="Limpar filtros"
                      onClick={handleClear}
                    >
                      <CleaningServices fontSize="small" />
                    </Fab>
                  </Tooltip>

                  <Tooltip title="Recarregar">
                    <Fab
                      size="small"
                      aria-label="Recarregar"
                      onClick={onRefreshClick}
                    >
                      <Refresh fontSize="small" />
                    </Fab>
                  </Tooltip>

                  <Tooltip title="Criar Clubinho">
                    <Fab
                      color="primary"
                      aria-label="Criar Clubinho"
                      onClick={onCreateClick}
                    >
                      <Add />
                    </Fab>
                  </Tooltip>
                </Stack>
              </Box>
            </>
          ) : (
            <Stack
              direction="row"
              spacing={1.5}
              justifyContent="flex-end"
              alignItems="center"
            >
              <Button
                variant="contained"
                color="secondary"
                startIcon={<CleaningServices />}
                onClick={handleClear}
              >
                Limpar
              </Button>

              <Tooltip title="Recarregar">
                <IconButton onClick={onRefreshClick}>
                  <Refresh />
                </IconButton>
              </Tooltip>

              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={onCreateClick}
              >
                Criar
              </Button>
            </Stack>
          )}
        </Grid>
      </Grid>
    </Paper>
  );
}
