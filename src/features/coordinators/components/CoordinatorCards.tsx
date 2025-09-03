import React, { useMemo, useState } from "react";
import {
  Box, Card, CardContent, Chip, Grid, IconButton, Stack,
  Typography, Divider, TablePagination, Tooltip, Collapse, Select, MenuItem, FormControl, InputLabel
} from "@mui/material";
import { Visibility, Link as LinkIcon, ExpandMore as ExpandMoreIcon, SwapVert } from "@mui/icons-material";
import type { SortingState } from "@tanstack/react-table";
import type { CoordinatorProfile } from "../types";
import { fmtDate } from "../utils";

type Props = {
  rows: CoordinatorProfile[];
  total: number;
  pageIndex: number;
  pageSize: number;
  setPageIndex: (n: number) => void;
  setPageSize: (n: number) => void;
  sorting: SortingState;
  setSorting: (s: SortingState) => void;
  onView: (row: CoordinatorProfile) => void;
  onLink: (row: CoordinatorProfile) => void;
};

export default function CoordinatorCards(props: Props) {
  const {
    rows, total, pageIndex, pageSize, setPageIndex, setPageSize,
    sorting, setSorting, onView, onLink
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

  const sortOptions = useMemo(() => ([
    { id: "user", label: "Nome" },
    { id: "updatedAt", label: "Atualizado em" },
    { id: "createdAt", label: "Criado em" },
  ]), []);

  const handleSortField = (field: string) => setSorting([{ id: field, desc: sortDesc }]);
  const toggleSortDir = () => setSorting([{ id: sortField, desc: !sortDesc }]);

  return (
    <Box sx={{ px: 0, py: 0 }}>
      <Stack direction="row" spacing={0.75} sx={{ mb: 1 }} alignItems="center" justifyContent="flex-end">
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Ordenar por</InputLabel>
          <Select
            label="Ordenar por"
            value={sortField}
            onChange={(e) => handleSortField(String(e.target.value))}
            sx={{ ".MuiSelect-select": { py: .75 } }}
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

      <Grid container spacing={0.75}>
        {rows.map((c) => {
          const expanded = open.has(c.id);
          const clubs = c.clubs ?? [];
          const totalTeachers = clubs.reduce((acc, cl) => acc + (cl.teachers?.length || 0), 0);

          return (
            <Grid item xs={12} key={c.id}>
              <Card
                variant="outlined"
                sx={{
                  borderRadius: 2,
                  overflow: "hidden",
                  transition: "box-shadow .12s ease, transform .12s ease",
                  "&:hover": { boxShadow: 2, transform: "translateY(-1px)" },
                }}
              >
                {/* Cabeçalho + expandir */}
                <Stack direction="row" alignItems="center" sx={{ px: 1.25, pt: .75, pb: .25 }}>
                  <Typography variant="subtitle1" fontWeight={800} sx={{ pr: 1, flex: 1, minWidth: 0 }}>
                    <span title={c.user?.name}>{c.user?.name || "—"}</span>
                  </Typography>
                  <Tooltip title={expanded ? "Recolher" : "Expandir"}>
                    <IconButton
                      size="small"
                      onClick={() => toggle(c.id)}
                      sx={{
                        border: "1px solid",
                        borderColor: "divider",
                        bgcolor: "background.paper",
                        "&:hover": { bgcolor: "action.hover" },
                        width: 32, height: 32,
                        borderRadius: "50%",
                        transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform .15s ease",
                      }}
                    >
                      <ExpandMoreIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Stack>

                {/* Sub-infos curtas */}
                <Stack direction="row" spacing={.5} sx={{ px: 1.25, pb: .5 }} flexWrap="wrap">
                  <Chip size="small" variant="outlined" label={`Clubs: ${clubs.length}`} />
                  <Chip size="small" variant="outlined" label={`Profs.: ${totalTeachers}`} />
                  <Chip size="small" color={c.active ? "success" : "default"} label={c.active ? "Ativo" : "Inativo"} />
                </Stack>

                {/* Expandido */}
                <Collapse in={expanded} timeout="auto" unmountOnExit>
                  <Divider />
                  <CardContent sx={{ p: 1.25 }}>
                    <Stack spacing={0.75}>
                      <Typography variant="body2" color="text.secondary">{c.user?.email}</Typography>
                      {(c.createdAt || c.updatedAt) && (
                        <Typography variant="caption" color="text.secondary">
                          Criado: {fmtDate(c.createdAt)} • Atualizado: {fmtDate(c.updatedAt)}
                        </Typography>
                      )}
                      <Divider light sx={{ my: .25 }} />
                      {clubs.length === 0 ? (
                        <Typography variant="body2" color="text.secondary">Sem clubinhos vinculados.</Typography>
                      ) : (
                        <Stack spacing={0.5}>
                          {clubs.map((cl) => (
                            <Stack key={cl.id} direction="row" spacing={0.75} alignItems="center" flexWrap="wrap">
                              <Chip size="small" color="primary" label={`#${cl.number ?? "?"}`} />
                              <Typography variant="body2" sx={{ mr: .5 }}>{cl.weekday}</Typography>
                              {(cl.teachers ?? []).map((t) => (
                                <Chip
                                  key={t.id}
                                  size="small"
                                  variant="outlined"
                                  label={t.user?.name || t.user?.email || t.id}
                                />
                              ))}
                            </Stack>
                          ))}
                        </Stack>
                      )}
                    </Stack>
                  </CardContent>
                </Collapse>

                {/* Ações */}
                <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 0.5, px: 1.25, pb: 1, pt: 0.25 }}>
                  <Tooltip title="Detalhes">
                    <IconButton size="small" onClick={() => onView(c)}>
                      <Visibility fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Vincular/Desvincular clubinho">
                    <IconButton size="small" onClick={() => onLink(c)}>
                      <LinkIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      <Divider sx={{ mt: 1 }} />
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
