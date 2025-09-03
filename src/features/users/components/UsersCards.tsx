// src/modules/users/components/UsersCards.tsx
import React, { useMemo, useState } from "react";
import {
  Box, Card, CardContent, Chip, Grid, IconButton, Stack,
  Typography, MenuItem, Select, FormControl, InputLabel,
  Divider, TablePagination, Tooltip, Collapse
} from "@mui/material";
import {
  Visibility, Edit, Delete, SwapVert,
  ExpandMore as ExpandMoreIcon,
  PhoneIphone, AlternateEmail, AccessTime
} from "@mui/icons-material";
import { SortingState } from "@tanstack/react-table";
import { UserRow } from "../types";
import { fmtDate } from "@/utils/dates";
import { RoleUser } from "@/store/slices/auth/authSlice";

type Props = {
  rows: UserRow[];
  total: number;
  pageIndex: number;
  pageSize: number;
  setPageIndex: (n: number) => void;
  setPageSize: (n: number) => void;
  sorting: SortingState;
  setSorting: (s: SortingState) => void;
  onView: (u: UserRow) => void;
  onEdit: (u: UserRow) => void;
  onDelete: (u: UserRow) => void;
};

export default function UsersCards(props: Props) {
  const {
    rows, total, pageIndex, pageSize, setPageIndex, setPageSize,
    sorting, setSorting, onView, onEdit, onDelete,
  } = props;

  const [open, setOpen] = useState<Set<string>>(new Set());
  const toggle = (id: string) =>
    setOpen(prev => {
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
    { id: "role", label: "Papel" },
    { id: "updatedAt", label: "Atualizado em" },
    { id: "createdAt", label: "Criado em" },
  ]), []);

  const roleChipColor = (role?: string) =>
    (String(role).toLowerCase() === RoleUser.ADMIN ? "secondary" : "default") as
      | "default" | "primary" | "secondary" | "success" | "error" | "info" | "warning";

  return (
    <Box sx={{ px: { xs: 0, sm: 1 }, py: 0 }}>
      {/* Ordenação compacta */}
      <Stack direction="row" spacing={0.75} sx={{ mb: 1, px: { xs: 0, sm: .5 } }} alignItems="center" justifyContent="flex-end">
        <FormControl size="small" sx={{ minWidth: { xs: 140, sm: 180 } }}>
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

      <Grid container spacing={{ xs: .75, sm: 1 }}>
        {rows.map((u) => {
          const expanded = open.has(u.id);
          return (
            <Grid item xs={12} key={u.id}>
              <Card
                variant="outlined"
                sx={{
                  borderRadius: 2,
                  overflow: "hidden",
                  transition: "box-shadow .12s ease, transform .12s ease",
                  "&:hover": { boxShadow: 2, transform: "translateY(-1px)" },
                }}
              >
                {/* Topo: role + expandir */}
                <Stack direction="row" alignItems="center" sx={{ px: { xs: 1, sm: 1.25 }, pt: .75, pb: .25 }}>
                  <Chip size="small" color={roleChipColor(u.role)} label={u.role || "user"} variant="outlined" />
                  <Box sx={{ flex: 1 }} />
                  <Tooltip title={expanded ? "Recolher" : "Expandir"}>
                    <IconButton
                      size="small"
                      onClick={() => toggle(u.id)}
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

                {/* Nome + email */}
                <Box sx={{ px: { xs: 1, sm: 1.25 }, pb: .5 }}>
                  <Typography variant="subtitle1" fontWeight={800} noWrap title={u.name}>
                    {u.name || "—"}
                  </Typography>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <AlternateEmail sx={{ fontSize: 16, color: "text.secondary" }} />
                    <Typography variant="body2" color="text.secondary" noWrap title={u.email}>
                      {u.email}
                    </Typography>
                  </Stack>
                </Box>

                {/* Resumo chips */}
                {!expanded && (
                  <Stack direction="row" spacing={.5} alignItems="center" flexWrap="wrap" sx={{ px: { xs: 1, sm: 1.25 }, pb: .75 }}>
                    <Chip size="small" variant="outlined" label={`Ativo: ${u.active ? "Sim" : "Não"}`} color={u.active ? "success" : "default"} />
                    <Chip size="small" variant="outlined" label={`Completo: ${u.completed ? "Sim" : "Não"}`} color={u.completed ? "success" : "default"} />
                    {u.phone && (
                      <Stack direction="row" spacing={.5} alignItems="center" sx={{ ml: .25 }}>
                        <PhoneIphone sx={{ fontSize: 18, color: "text.secondary" }} />
                        <Typography variant="caption" color="text.secondary">
                          <a href={`tel:${u.phone}`} style={{ color: "inherit", textDecoration: "none" }}>
                            {u.phone}
                          </a>
                        </Typography>
                      </Stack>
                    )}
                  </Stack>
                )}

                {/* Expandido */}
                <Collapse in={expanded} timeout="auto" unmountOnExit>
                  <Divider />
                  <CardContent sx={{ p: { xs: 1, sm: 1.25 } }}>
                    <Grid container spacing={{ xs: .75, sm: 1.25 }}>
                      <Grid item xs={12} sm={6}>
                        <Stack spacing={0.25}>
                          <Stack direction="row" spacing={0.5} alignItems="center">
                            <AccessTime fontSize="small" />
                            <Typography variant="caption" color="text.secondary">Criado em</Typography>
                          </Stack>
                          <Typography variant="body2">{fmtDate(String(u.createdAt))}</Typography>
                        </Stack>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Stack spacing={0.25}>
                          <Stack direction="row" spacing={0.5} alignItems="center">
                            <AccessTime fontSize="small" />
                            <Typography variant="caption" color="text.secondary">Atualizado em</Typography>
                          </Stack>
                          <Typography variant="body2">{fmtDate(String(u.updatedAt))}</Typography>
                        </Stack>
                      </Grid>

                      <Grid item xs={12}>
                        <Stack direction="row" spacing={.5} flexWrap="wrap">
                          <Chip size="small" label={`Papel: ${u.role || "user"}`} color={roleChipColor(u.role)} variant="outlined" />
                          <Chip size="small" label={`Ativo: ${u.active ? "Sim" : "Não"}`} color={u.active ? "success" : "default"} />
                          <Chip size="small" label={`Completo: ${u.completed ? "Sim" : "Não"}`} color={u.completed ? "success" : "default"} />
                          {u.phone && <Chip size="small" label={u.phone} variant="outlined" />}
                        </Stack>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Collapse>

                {/* Rodapé: ações */}
                <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 0.5, px: { xs: 1, sm: 1.25 }, pb: 1, pt: 0.25 }}>
                  <Tooltip title="Visualizar"><IconButton size="small" onClick={() => onView(u)}><Visibility fontSize="small" /></IconButton></Tooltip>
                  <Tooltip title="Editar"><IconButton size="small" onClick={() => onEdit(u)}><Edit fontSize="small" /></IconButton></Tooltip>
                  <Tooltip title="Excluir"><IconButton size="small" color="error" onClick={() => onDelete(u)}><Delete fontSize="small" /></IconButton></Tooltip>
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
