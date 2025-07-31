// src/modules/children/components/ChildrenToolbar.tsx
import React from "react";
import {
  Paper, Grid, TextField, Stack, Button, Tooltip, IconButton,
  InputAdornment, Popover, ToggleButtonGroup, ToggleButton, Box, Typography, Fab
} from "@mui/material";
import { CleaningServices, Refresh, Add, Event, Close } from "@mui/icons-material";
import { ChildFilters } from "../types";

type Props = {
  filters: ChildFilters;
  onChange: (updater: (prev: ChildFilters) => ChildFilters) => void;
  onCreateClick: () => void;
  onRefreshClick: () => void;
  isXs?: boolean;
};

/** Utils */
const fmtBR = (d: string) =>
  d ? new Date(d + "T00:00:00").toLocaleDateString("pt-BR") : "";

function summaryLabel(from?: string, to?: string) {
  const f = from || "";
  const t = to || "";
  if (!f && !t) return "";
  if (f && t && f === t) return fmtBR(f);
  if (f && t) return `${fmtBR(f)} — ${fmtBR(t)}`;
  if (f && !t) return `${fmtBR(f)} — `;
  if (!f && t) return `— ${fmtBR(t)}`;
  return "";
}

/** Um input que permite “Data única” OU “Período” e devolve (from,to) em YYYY-MM-DD */
function DateFilterInput(props: {
  label: string;
  from?: string;
  to?: string;
  onChange: (from: string, to: string) => void;
  disabled?: boolean;
}) {
  const { label, from = "", to = "", onChange, disabled } = props;
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);

  // estado temporário do popover
  const [mode, setMode] = React.useState<"single" | "range">(
    from && to && from !== to ? "range" : "single"
  );
  const [tmpFrom, setTmpFrom] = React.useState(from);
  const [tmpTo, setTmpTo] = React.useState(to || from);

  // abrir fecha
  const open = Boolean(anchorEl);
  const handleOpen = (e: React.MouseEvent<HTMLElement>) => {
    setTmpFrom(from);
    setTmpTo(to || from);
    setMode(from && to && from !== to ? "range" : "single");
    setAnchorEl(e.currentTarget);
  };
  const handleClose = () => setAnchorEl(null);

  // aplicar/limpar
  const handleApply = () => {
    if (mode === "single") {
      if (tmpFrom) onChange(tmpFrom, tmpFrom);
      else onChange("", "");
    } else {
      const f = tmpFrom || "";
      const t = tmpTo || tmpFrom || "";
      if (!f && !t) onChange("", "");
      else onChange(f, t || f);
    }
    handleClose();
  };
  const handleClear = (e?: React.MouseEvent) => {
    e?.stopPropagation?.();
    onChange("", "");
  };

  return (
    <>
      <TextField
        fullWidth
        size="small"
        label={label}
        value={summaryLabel(from, to)}
        onClick={handleOpen}
        InputProps={{
          readOnly: true,
          startAdornment: (
            <InputAdornment position="start">
              <Event fontSize="small" />
            </InputAdornment>
          ),
          endAdornment: (from || to) ? (
            <InputAdornment position="end">
              <IconButton size="small" edge="end" onClick={handleClear} aria-label="Limpar">
                <Close fontSize="small" />
              </IconButton>
            </InputAdornment>
          ) : undefined,
        }}
        placeholder="Selecionar…"
        disabled={disabled}
      />

      <Popover
        open={open}
        onClose={handleClose}
        anchorEl={anchorEl}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        PaperProps={{ sx: { p: 1.5, width: 320 } }}
      >
        <Stack spacing={1.25}>
          <ToggleButtonGroup
            exclusive
            size="small"
            value={mode}
            onChange={(_, v) => v && setMode(v)}
            aria-label="Tipo de filtro"
          >
            <ToggleButton value="single" aria-label="Data única">Data única</ToggleButton>
            <ToggleButton value="range" aria-label="Período">Período</ToggleButton>
          </ToggleButtonGroup>

          {mode === "single" ? (
            <TextField
              fullWidth
              label="Data"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={tmpFrom || ""}
              onChange={(e) => setTmpFrom(e.target.value)}
            />
          ) : (
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}>
              <TextField
                fullWidth
                label="De"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={tmpFrom || ""}
                onChange={(e) => setTmpFrom(e.target.value)}
              />
              <TextField
                fullWidth
                label="Até"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={tmpTo || ""}
                onChange={(e) => setTmpTo(e.target.value)}
              />
            </Box>
          )}

          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button onClick={() => handleClear()} color="secondary">Limpar</Button>
            <Button variant="contained" onClick={handleApply}>Aplicar</Button>
          </Stack>

          <Typography variant="caption" color="text.secondary">
            Dica: se escolher uma única data, enviaremos <strong>from</strong> e <strong>to</strong> iguais.
          </Typography>
        </Stack>
      </Popover>
    </>
  );
}

export default function ChildrenToolbar({ filters, onChange, onCreateClick, onRefreshClick, isXs }: Props) {
  const set = <K extends keyof ChildFilters>(k: K, v: ChildFilters[K]) =>
    onChange(prev => ({ ...prev, [k]: v }));

  const clear = () =>
    onChange(() => ({
      searchString: "",
      clubNumber: undefined,
      birthDateFrom: "",
      birthDateTo: "",
      joinedFrom: "",
      joinedTo: "",
    }));

  return (
    <Paper sx={{ p: { xs: 1.5, md: 2 }, mb: 2 }}>
      <Grid container spacing={{ xs: 1.5, md: 2 }} alignItems="center">
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            size="small"
            label="Nome/Responsável"
            value={filters.searchString ?? ""}
            onChange={e => set("searchString", e.target.value)}
            placeholder="Ex.: Maria, João"
          />
        </Grid>

        <Grid item xs={12} md={2}>
          <TextField
            fullWidth
            size="small"
            label="Nº Clubinho"
            type="number"
            value={filters.clubNumber ?? ""}
            onChange={e => set("clubNumber", e.target.value ? Number(e.target.value) : undefined)}
          />
        </Grid>

        {/* Nascimento */}
        <Grid item xs={12} md={3}>
          <DateFilterInput
            label="Nascimento"
            from={filters.birthDateFrom}
            to={filters.birthDateTo}
            onChange={(from, to) => onChange(prev => ({ ...prev, birthDateFrom: from, birthDateTo: to }))}
          />
        </Grid>

        {/* No clube */}
        <Grid item xs={12} md={3}>
          <DateFilterInput
            label="No clube"
            from={filters.joinedFrom}
            to={filters.joinedTo}
            onChange={(from, to) => onChange(prev => ({ ...prev, joinedFrom: from, joinedTo: to }))}
          />
        </Grid>

        <Grid item xs={12}>
          {isXs ? (
            <>
              {/* Espaçador para os FABs não cobrirem o conteúdo logo abaixo */}
              <Box sx={{ height: 64 }} />

              {/* FABs flutuantes (somente mobile) */}
              <Box
                sx={{
                  position: "fixed",
                  bottom: 16,
                  right: 16,
                  zIndex: 1200,
                  display: { xs: "block", md: "none" },
                }}
              >
                <Stack spacing={1} alignItems="flex-end">
                  <Tooltip title="Limpar filtros">
                    <Fab
                      size="small"
                      color="secondary"
                      aria-label="Limpar filtros"
                      onClick={clear}
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

                  <Tooltip title="Nova Criança">
                    <Fab
                      color="primary"
                      aria-label="Nova Criança"
                      onClick={onCreateClick}
                    >
                      <Add />
                    </Fab>
                  </Tooltip>
                </Stack>
              </Box>
            </>
          ) : (
            <Stack direction="row" spacing={1.5} justifyContent="flex-end">
              <Button variant="contained" color="secondary" startIcon={<CleaningServices />} onClick={clear}>
                Limpar
              </Button>
              <Tooltip title="Recarregar">
                <IconButton onClick={onRefreshClick}>
                  <Refresh />
                </IconButton>
              </Tooltip>
              <Button variant="contained" startIcon={<Add />} onClick={onCreateClick}>
                Criar
              </Button>
            </Stack>
          )}
        </Grid>
      </Grid>
    </Paper>
  );
}
