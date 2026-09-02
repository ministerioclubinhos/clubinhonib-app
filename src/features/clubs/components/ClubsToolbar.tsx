import React from "react";
import {
  Button,
  IconButton,
  Tooltip,
  Grid2,
  TextField,
  Paper,
  Stack,
  Box,
  Fab,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { Add, Refresh, CleaningServices } from "@mui/icons-material";
import { useSelector } from "react-redux";
import { ClubFilters } from "../types";
import { selectIsAdmin } from "@/store/selectors/routeSelectors";

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
  const isAdmin = useSelector(selectIsAdmin);

  const handleChange = <K extends keyof ClubFilters>(
    key: K,
    value: ClubFilters[K]
  ) => {
    onChange((prev) => ({ ...prev, [key]: value }));
  };

  const handleClear = () => {
    onChange(() => ({
      searchString: "",
      isActive: undefined,
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

      <Grid2 container spacing={{ xs: 1.5, md: 2 }} alignItems="center">
        <Grid2 size={{ xs: 12, md: 8 }}>
          <TextField
            fullWidth
            size="small"
            label="Buscar"
            value={filters.searchString ?? ""}
            onChange={(e) => handleChange("searchString", e.target.value)}
            placeholder="Endereço / nº do clubinho.."
          />
        </Grid2>

        <Grid2 size={{ xs: 12, md: 4 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Status</InputLabel>
            <Select
              label="Status"
              value={filters.isActive === undefined ? "" : filters.isActive ? "true" : "false"}
              onChange={(e) => {
                const val = e.target.value;
                handleChange("isActive", val === "" ? undefined : val === "true");
              }}
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="true">Ativo</MenuItem>
              <MenuItem value="false">Inativo</MenuItem>
            </Select>
          </FormControl>
        </Grid2>

        <Grid2 size={12}>
          {isXs ? (
            <>
              <Box sx={{ height: 64 }} />
              <Box
                sx={{
                  position: "fixed",
                  // Acima do conteúdo, abaixo dos diálogos: com z-index maior
                  // que o do modal, os botões ficavam por cima do formulário
                  // aberto em tela cheia.
                  bottom: 16,
                  right: 16,
                  zIndex: (theme) => theme.zIndex.fab,
                  pb: "env(safe-area-inset-bottom)",
                }}
              >
                <Stack spacing={1} alignItems="flex-end">
                  <Tooltip title="Limpar filtros">
                    <Fab
                      size="small"
                      color="secondary"
                      aria-label="Limpar filtros"
                      onClick={handleClear}
                      sx={{ boxShadow: 6 }}
                    >
                      <CleaningServices fontSize="small" />
                    </Fab>
                  </Tooltip>

                  <Tooltip title="Recarregar">
                    <Fab
                      size="small"
                      aria-label="Recarregar"
                      onClick={onRefreshClick}
                      sx={{ boxShadow: 6 }}
                    >
                      <Refresh fontSize="small" />
                    </Fab>
                  </Tooltip>

                  {isAdmin && (
                    <Tooltip title="Criar Clubinho">
                      <Fab
                        color="primary"
                        aria-label="Criar Clubinho"
                        onClick={onCreateClick}
                        sx={{ boxShadow: 6 }}
                      >
                        <Add />
                      </Fab>
                    </Tooltip>
                  )}
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

              {isAdmin && (
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={onCreateClick}
                >
                  Criar
                </Button>
              )}
            </Stack>
          )}
        </Grid2>
      </Grid2>
    </Paper>
  );
}
