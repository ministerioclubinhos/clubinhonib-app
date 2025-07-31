// src/modules/children/components/ChildrenCards.tsx
import React, { useMemo, useState } from "react";
import {
  Box, Card, CardContent, Chip, Grid, IconButton, Stack,
  Typography, MenuItem, Select, FormControl, InputLabel,
  Divider, TablePagination, Tooltip, Collapse, ButtonBase
} from "@mui/material";
import {
  Visibility, Edit, Delete, SwapVert,
  CakeOutlined, CalendarMonthOutlined, PlaceOutlined,
  ExpandMore as ExpandMoreIcon, LocationOnOutlined
} from "@mui/icons-material";
import { SortingState } from "@tanstack/react-table";
import { ChildResponseDto } from "../types";

type Props = {
  rows: ChildResponseDto[];
  total: number;
  pageIndex: number;
  pageSize: number;
  setPageIndex: (n: number) => void;
  setPageSize: (n: number) => void;
  sorting: SortingState;
  setSorting: (s: SortingState) => void;
  onOpenView: (row: ChildResponseDto) => void;
  onStartEdit: (row: ChildResponseDto) => void;
  onAskDelete: (row: ChildResponseDto) => void;
};

const fmtDateOnly = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString("pt-BR") : "—";

const gLabel = (g?: "M" | "F") => (g === "M" ? "Menino" : g === "F" ? "Menina" : "—");

// idade (anos)
const ageFrom = (birth?: string | null) => {
  if (!birth) return null;
  const b = new Date(birth);
  if (isNaN(+b)) return null;
  const now = new Date();
  let y = now.getFullYear() - b.getFullYear();
  const m = now.getMonth() - b.getMonth();
  const d = now.getDate() - b.getDate();
  if (m < 0 || (m === 0 && d < 0)) y--;
  return y < 0 ? null : y;
};

// tempo de clube
const tenureFrom = (joined?: string | null) => {
  if (!joined) return null;
  const j = new Date(joined);
  if (isNaN(+j)) return null;
  const now = new Date();
  let months = (now.getFullYear() - j.getFullYear()) * 12 + (now.getMonth() - j.getMonth());
  if (now.getDate() < j.getDate()) months -= 1;
  const y = Math.max(0, Math.floor(months / 12));
  const m = Math.max(0, months % 12);
  if (!y && !m) return "menos de 1 mês";
  if (!y) return `${m}m`;
  if (!m) return `${y}a`;
  return `${y}a ${m}m`;
};

export default function ChildrenCards(props: Props) {
  const {
    rows, total, pageIndex, pageSize, setPageIndex, setPageSize,
    sorting, setSorting, onOpenView, onStartEdit, onAskDelete
  } = props;

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
    { id: "name", label: "Nome" },
    { id: "birthDate", label: "Nascimento" },
    { id: "joinedAt", label: "No clubinho desde" },
    { id: "updatedAt", label: "Atualizado em" },
    { id: "createdAt", label: "Criado em" },
  ]), []);

  return (
    <Box sx={{ px: { xs: 0, sm: 1 }, py: 0 }}>
      {/* Ordenação compacta */}
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
          const age = ageFrom(c.birthDate);
          const tenure = tenureFrom(c.joinedAt);
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
                {/* Cabeçalho: clube + expand */}
                <Stack
                  direction="row"
                  alignItems="center"
                  sx={{ px: { xs: 1.25, sm: 1.5 }, pt: 1.25, pb: 0.75, gap: 1 }}
                >
                  <Chip
                    size="small"
                    color={c.club ? "primary" : "default"}
                    variant={c.club ? "filled" : "outlined"}
                    label={c.club ? `Clubinho #${c.club.number}` : "Sem clubinho"}
                    sx={{ fontWeight: 800 }}
                  />
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

                {/* Nome */}
                <Typography
                  variant="subtitle1"
                  fontWeight={800}
                  sx={{
                    px: { xs: 1.25, sm: 1.5 },
                    pb: 0.5,
                    display: "-webkit-box",
                    WebkitLineClamp: 1,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                  title={c.name}
                >
                  {c.name}
                </Typography>

                {/* Resumo curto */}
                <Stack spacing={0.75} sx={{ px: { xs: 1.25, sm: 1.5 }, pb: 1.25 }}>
                  <Stack direction="row" spacing={0.75} alignItems="baseline">
                    <Typography variant="caption" color="text.secondary" sx={{ minWidth: 92 }}>
                      Responsável
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                    >
                      {c.guardianName || "—"}
                    </Typography>
                  </Stack>

                  <Stack direction="row" spacing={0.75} alignItems="baseline">
                    <Typography variant="caption" color="text.secondary" sx={{ minWidth: 92 }}>
                      Telefone
                    </Typography>
                    {c.guardianPhone ? (
                      <Typography variant="body2">
                        <a href={`tel:${c.guardianPhone}`} style={{ color: "inherit", textDecoration: "none" }}>
                          {c.guardianPhone}
                        </a>
                      </Typography>
                    ) : (
                      <Typography variant="body2">—</Typography>
                    )}
                  </Stack>

                  {!expanded && (
                    <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap" useFlexGap>
                      {c.gender && <Chip size="small" variant="outlined" label={gLabel(c.gender)} />}
                      {typeof age === "number" && <Chip size="small" variant="outlined" label={`Idade: ${age}a`} />}
                      {tenure && <Chip size="small" variant="outlined" label={`Tempo: ${tenure}`} />}
                      <Stack direction="row" spacing={0.5} alignItems="center" sx={{ ml: 0.25 }}>
                        <LocationOnOutlined sx={{ fontSize: 18, color: "text.secondary" }} />
                        <Typography variant="caption" color="text.secondary">{addrPreview}</Typography>
                      </Stack>
                    </Stack>
                  )}
                </Stack>

                {/* Expandido */}
                <Collapse in={expanded} timeout="auto" unmountOnExit>
                  <Divider sx={{ my: 0.25 }} />
                  <CardContent sx={{ p: { xs: 1.25, sm: 1.5 } }}>
                    {/* BLOCO RESUMO BONITO */}
                    <Box
                      sx={{
                        p: { xs: 1.25, sm: 1.5 },
                        mb: 1.25,
                        borderRadius: 2,
                        border: "1px solid",
                        borderColor: "divider",
                        bgcolor: "action.hover",
                      }}
                    >
                      <Grid container spacing={{ xs: 1, sm: 1.5 }} alignItems="center">
                        {/* Gênero centralizado */}
                        <Grid item xs={12} sm={4}>
                          <Stack alignItems="center" spacing={0.5}>
                            <Typography variant="caption" color="text.secondary">Gênero</Typography>
                            <Typography variant="body1" fontWeight={700}>
                              {gLabel(c.gender as any)}
                            </Typography>
                          </Stack>
                        </Grid>

                        {/* Nascimento */}
                        <Grid item xs={12} sm={4}>
                          <Stack spacing={0.25}>
                            <Stack direction="row" spacing={0.5} alignItems="center">
                              <CakeOutlined fontSize="small" />
                              <Typography variant="caption" color="text.secondary">Nascimento</Typography>
                            </Stack>
                            <Typography variant="body2">{fmtDateOnly(c.birthDate)}</Typography>
                          </Stack>
                        </Grid>

                        {/* No clubinho desde */}
                        <Grid item xs={12} sm={4}>
                          <Stack spacing={0.25}>
                            <Stack direction="row" spacing={0.5} alignItems="center">
                              <CalendarMonthOutlined fontSize="small" />
                              <Typography variant="caption" color="text.secondary">No clubinho desde</Typography>
                            </Stack>
                            <Typography variant="body2">{fmtDateOnly(c.joinedAt)}</Typography>
                          </Stack>
                        </Grid>
                      </Grid>
                    </Box>

                    <Grid container spacing={{ xs: 1, sm: 1.5 }}>
                      {c.address && (
                        <>
                          <Grid item xs={12}>
                            <Stack direction="row" spacing={0.75} alignItems="center">
                              <PlaceOutlined fontSize="small" />
                              <Typography variant="caption" color="text.secondary">Endereço</Typography>
                            </Stack>
                          </Grid>

                          <Grid item xs={12}>
                            <Stack spacing={0.5}>
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

                      {/* Chips finais */}
                      <Grid item xs={12}>
                        <Divider sx={{ my: 0.5 }} />
                        <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                          {c.gender && <Chip size="small" label={gLabel(c.gender)} />}
                          {typeof age === "number" && <Chip size="small" label={`Idade: ${age} anos`} />}
                          {tenure && <Chip size="small" label={`Tempo no clubinho: ${tenure}`} />}
                        </Stack>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Collapse>

                {/* Rodapé: ações */}
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
                  <Tooltip title="Excluir">
                    <IconButton size="small" color="error" onClick={() => onAskDelete(c)}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </Tooltip>
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
