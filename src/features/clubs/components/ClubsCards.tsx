import React, { useMemo, useState } from "react";
import {
  Box, Card, CardContent, Chip, Grid, IconButton, Stack,
  Typography, MenuItem, Select, FormControl, InputLabel,
  Divider, TablePagination, Tooltip, Collapse, ButtonBase
} from "@mui/material";
import {
  Visibility, Edit, Delete, SwapVert,
  ExpandMore as ExpandMoreIcon,
  CalendarMonthOutlined, LocationOnOutlined,
  SupervisorAccount, Group as GroupIcon
} from "@mui/icons-material";
import { SortingState } from "@tanstack/react-table";
import { ClubResponseDto, WEEKDAYS } from "../types";

type Props = {
  isAdmin: boolean;
  rows: ClubResponseDto[];
  total: number;
  pageIndex: number;
  pageSize: number;
  setPageIndex: (n: number) => void;
  setPageSize: (n: number) => void;
  sorting: SortingState;
  setSorting: (s: SortingState) => void;
  onOpenView: (club: ClubResponseDto) => void;
  onStartEdit: (club: ClubResponseDto) => void;
  onAskDelete: (club: ClubResponseDto) => void;
};

const weekdayLabel = (v?: string | null) =>
  WEEKDAYS.find((w) => w.value === v)?.label ?? (v ?? "—");

const fmtDateOnly = (iso?: string | null) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(+d)) return "—";
  return d.toLocaleDateString("pt-BR");
};

export default function ClubsCards(props: Props) {
  const { isAdmin, rows, total, pageIndex, pageSize, setPageIndex, setPageSize, sorting, setSorting, onOpenView, onStartEdit, onAskDelete } = props;
  const [open, setOpen] = useState<Set<string>>(new Set());
  const toggle = (id: string) =>
    setOpen((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  const currentSort = sorting?.[0] ?? { id: "updatedAt", desc: true };
  const sortField = String(currentSort.id ?? "updatedAt");
  const sortDesc = !!currentSort.desc;

  const handleSortField = (field: string) => setSorting([{ id: field, desc: sortDesc }]);
  const toggleSortDir = () => setSorting([{ id: sortField, desc: !sortDesc }]);

  const sortOptions = useMemo(() => ([
    { id: "number", label: "Número" },
    { id: "weekday", label: "Dia da semana" },
    { id: "updatedAt", label: "Atualizado em" },
    { id: "createdAt", label: "Criado em" },
  ]), []);

  return (
    <Box sx={{ px: { xs: 0, sm: 1 }, py: 0 }}>
      <Stack
        direction="row"
        spacing={1}
        sx={{ mb: 1.25, px: { xs: 0, sm: 0.5 } }}
        alignItems="center"
        justifyContent="flex-end"
      >
        <FormControl size="small" sx={{ minWidth: { xs: 140, sm: 180 } }}>
          <InputLabel>Ordenar por</InputLabel>
          <Select
            label="Ordenar por"
            value={sortField}
            onChange={(e) => handleSortField(String(e.target.value))}
            sx={{ ".MuiSelect-select": { py: 0.75 } }}
          >
            {sortOptions.map(o => <MenuItem key={o.id} value={o.id}>{o.label}</MenuItem>)}
          </Select>
        </FormControl>
        <Tooltip title={sortDesc ? "Ordem: Descendente" : "Ordem: Ascendente"}>
          <IconButton size="small" onClick={toggleSortDir} aria-label="Inverter ordem">
            <SwapVert fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>

      <Grid container spacing={{ xs: 1, sm: 1.25 }}>
        {rows.map((c) => {
          const expanded = open.has(c.id);
          const coordName = c.coordinator?.user?.name || c.coordinator?.user?.email || "—";
          const teachers = c.teachers ?? [];
          const addrPreview = c.address ? `${c.address.city} / ${c.address.state}` : "—";

          return (
            <Grid item xs={12} key={c.id}>
              <Card
                variant="outlined"
                sx={{
                  borderRadius: 3,
                  overflow: "hidden",
                  transition: "box-shadow .12s ease, transform .12s ease",
                  "&:hover": { boxShadow: 3, transform: "translateY(-1px)" },
                  bgcolor: "background.paper",
                }}
              >
                <Stack
                  direction="row"
                  alignItems="center"
                  sx={{
                    px: { xs: 1.25, sm: 1.5 },
                    pt: 1.25,
                    pb: 0.75,
                    gap: 1.25,
                  }}
                >
                  <Box
                    sx={{
                      width: 38, height: 38, borderRadius: "50%",
                      bgcolor: "primary.main", color: "primary.contrastText",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontWeight: 800, fontSize: 14, boxShadow: 1, flex: "0 0 auto",
                    }}
                    aria-label={`Clube número ${c.number}`}
                  >
                    {c.number}
                  </Box>

                  <Stack direction="row" spacing={0.75} alignItems="center">
                    <CalendarMonthOutlined sx={{ fontSize: 18, color: "text.secondary" }} />
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                      {weekdayLabel(c.weekday)}
                    </Typography>
                  </Stack>

                  <Box sx={{ flex: 1 }} />

                  <ButtonBase
                    onClick={() => toggle(c.id)}
                    aria-label={expanded ? "Recolher" : "Expandir"}
                    sx={{
                      borderRadius: 2,
                      px: 1.25,
                      py: 0.5,
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      border: "1px solid",
                      borderColor: "divider",
                      bgcolor: "background.paper",
                      "&:hover": { bgcolor: "action.hover" },
                    }}
                  >
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                      {expanded ? "Recolher" : "Detalhes"}
                    </Typography>
                    <ExpandMoreIcon
                      fontSize="small"
                      sx={{ transition: "transform .15s ease", transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }}
                    />
                  </ButtonBase>
                </Stack>

                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  sx={{ px: { xs: 1.25, sm: 1.5 }, pb: 1 }}
                >
                  <SupervisorAccount sx={{ fontSize: 18, color: "text.secondary" }} />
                  <Typography variant="caption" color="text.secondary" sx={{ minWidth: 90 }}>
                    Coord.
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontWeight: 600 }}
                    title={coordName}
                  >
                    {coordName}
                  </Typography>
                </Stack>

                {!expanded && (
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    flexWrap="wrap"
                    sx={{ px: { xs: 1.25, sm: 1.5 }, pb: 1.25 }}
                  >
                    <Chip
                      size="small"
                      variant="outlined"
                      icon={<GroupIcon sx={{ fontSize: 16 }} />}
                      label={`Profs: ${teachers.length || 0}`}
                      sx={{ fontWeight: 700 }}
                    />
                    <Stack direction="row" spacing={0.5} alignItems="center" sx={{ ml: 0.25 }}>
                      <LocationOnOutlined sx={{ fontSize: 18, color: "text.secondary" }} />
                      <Typography variant="caption" color="text.secondary">
                        {addrPreview}
                      </Typography>
                    </Stack>
                  </Stack>
                )}

                <Collapse in={expanded} timeout="auto" unmountOnExit>
                  <Divider sx={{ my: 0.25 }} />
                  <CardContent sx={{ p: { xs: 1.25, sm: 1.5 } }}>
                    <Grid container spacing={{ xs: 1, sm: 1.5 }}>
                      <Grid item xs={12}>
                        <Stack spacing={0.75}>
                          <Stack direction="row" spacing={0.75} alignItems="center">
                            <GroupIcon fontSize="small" />
                            <Typography variant="caption" color="text.secondary">Professores</Typography>
                          </Stack>

                          {teachers.length ? (
                            <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap" }}>
                              {teachers.map((t) => (
                                <Chip
                                  key={t.id}
                                  size="small"
                                  label={t.user?.name || t.user?.email || t.id}
                                  variant="outlined"
                                />
                              ))}
                            </Box>
                          ) : (
                            <Typography variant="body2">Nenhum professor vinculado.</Typography>
                          )}
                        </Stack>
                      </Grid>

                      {c.address && (
                        <>
                          <Grid item xs={12}><Divider light sx={{ my: 0.5 }} /></Grid>
                          <Grid item xs={12}>
                            <Stack spacing={0.5}>
                              <Stack direction="row" spacing={0.75} alignItems="center">
                                <LocationOnOutlined fontSize="small" />
                                <Typography variant="caption" color="text.secondary">Endereço</Typography>
                              </Stack>

                              <Typography variant="body2" sx={{ lineHeight: 1.35 }}>
                                {c.address.street}{c.address.number ? `, ${c.address.number}` : ""} — {c.address.district}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.35 }}>
                                {c.address.city} / {c.address.state}
                                {c.address.postalCode ? ` — CEP ${c.address.postalCode}` : ""}
                              </Typography>
                              {c.address.complement && (
                                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.35 }}>
                                  Compl.: {c.address.complement}
                                </Typography>
                              )}
                            </Stack>
                          </Grid>
                        </>
                      )}

                      <Grid item xs={12}>
                        <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                          <Chip size="small" variant="outlined" label={`Criado: ${fmtDateOnly(c.createdAt)}`} />
                          <Chip size="small" variant="outlined" label={`Atualizado: ${fmtDateOnly(c.updatedAt)}`} />
                          <Chip size="small" variant="outlined" label={`Dia do Clubinho: ${weekdayLabel(c.weekday)}`} />
                        </Stack>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Collapse>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 0.75,
                    px: { xs: 1.25, sm: 1.5 },
                    pb: 1.25,
                    pt: 0.25,
                  }}
                >
                  <Tooltip title="Visualizar">
                    <IconButton size="small" onClick={() => onOpenView(c)}>
                      <Visibility fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Editar">
                    <IconButton size="small" onClick={() => onStartEdit(c)}>
                      <Edit fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  {isAdmin && (
                    <Tooltip title="Excluir">
                      <IconButton size="small" color="error" onClick={() => onAskDelete(c)}>
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      <Divider sx={{ mt: 1.25 }} />
      <TablePagination
        component="div"
        count={total}
        page={pageIndex}
        onPageChange={(_, p) => setPageIndex(p)}
        rowsPerPage={pageSize}
        onRowsPerPageChange={(e) => { setPageSize(parseInt(e.target.value, 10)); setPageIndex(0); }}
        rowsPerPageOptions={[6, 12, 24]}
        labelRowsPerPage="Linhas"
        sx={{ px: 0 }}
      />
    </Box>
  );
}
