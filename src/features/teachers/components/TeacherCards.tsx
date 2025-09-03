// src/modules/teachers/components/TeacherCards.tsx
import React, { useMemo, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  IconButton,
  Stack,
  Typography,
  Divider,
  TablePagination,
  Tooltip,
  Collapse,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import {
  Visibility,
  Link as LinkIcon,
  LinkOff as LinkOffIcon,
  ExpandMore as ExpandMoreIcon,
  SwapVert,
} from "@mui/icons-material";
import type { SortingState } from "@tanstack/react-table";
import type { TeacherProfile } from "../types";
import { fmtDate } from "../utils";

type Props = {
  rows: TeacherProfile[];
  total: number;
  pageIndex: number;
  pageSize: number;
  setPageIndex: (n: number) => void;
  setPageSize: (n: number) => void;
  sorting: SortingState;
  setSorting: (s: SortingState) => void;
  onView: (row: TeacherProfile) => void;
  onEditLinks: (row: TeacherProfile) => void;
  onClearClub: (teacherId: string) => void;
};

export default function TeacherCards({
  rows,
  total,
  pageIndex,
  pageSize,
  setPageIndex,
  setPageSize,
  sorting,
  setSorting,
  onView,
  onEditLinks,
  onClearClub,
}: Props) {
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

  const sortOptions = useMemo(
    () => [
      { id: "teacher", label: "Nome" },
      { id: "club", label: "Nº do clube" },
      { id: "updatedAt", label: "Atualizado em" },
      { id: "createdAt", label: "Criado em" },
    ],
    []
  );

  const handleSortField = (field: string) =>
    setSorting([{ id: field, desc: sortDesc }]);
  const toggleSortDir = () =>
    setSorting([{ id: sortField, desc: !sortDesc }]);

  return (
    <Box sx={{ px: 0, py: 0 }}>
      {/* Controle de ordenação (server-side) */}
      <Stack
        direction="row"
        spacing={0.75}
        sx={{ mb: 1 }}
        alignItems="center"
        justifyContent="flex-end"
      >
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Ordenar por</InputLabel>
          <Select
            label="Ordenar por"
            value={sortField}
            onChange={(e) => handleSortField(String(e.target.value))}
            sx={{ ".MuiSelect-select": { py: 0.75 } }}
          >
            {sortOptions.map((o) => (
              <MenuItem key={o.id} value={o.id}>
                {o.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Tooltip
          title={sortDesc ? "Ordem: Descendente" : "Ordem: Ascendente"}
        >
          <IconButton size="small" onClick={toggleSortDir} aria-label="Inverter ordem">
            <SwapVert fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>

      <Grid container spacing={0.75}>
        {rows.map((t) => {
          const expanded = open.has(t.id);
          const club = t.club || null;
          const coordUser = club?.coordinator?.user || null;

          return (
            <Grid item xs={12} key={t.id}>
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
                <Stack
                  direction="row"
                  alignItems="center"
                  sx={{ px: 1.25, pt: 0.75, pb: 0.25 }}
                >
                  <Typography
                    variant="subtitle1"
                    fontWeight={800}
                    sx={{ pr: 1, flex: 1, minWidth: 0 }}
                  >
                    <span title={t.user?.name}>
                      {t.user?.name || t.user?.email || "—"}
                    </span>
                  </Typography>

                  <Tooltip title={expanded ? "Recolher" : "Expandir"}>
                    <IconButton
                      size="small"
                      onClick={() => toggle(t.id)}
                      sx={{
                        border: "1px solid",
                        borderColor: "divider",
                        bgcolor: "background.paper",
                        "&:hover": { bgcolor: "action.hover" },
                        width: 32,
                        height: 32,
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
                <Stack
                  direction="row"
                  spacing={0.5}
                  sx={{ px: 1.25, pb: 0.5 }}
                  flexWrap="wrap"
                >
                  <Chip
                    size="small"
                    variant="outlined"
                    color={club ? "primary" : "default"}
                    label={club ? `Clube #${club.number ?? "?"}` : "Sem clube"}
                  />
                  <Chip
                    size="small"
                    variant="outlined"
                    label={
                      coordUser?.name
                        ? `Coord.: ${coordUser.name}`
                        : coordUser?.email
                        ? `Coord.: ${coordUser.email}`
                        : "Coord.: —"
                    }
                  />
                  <Chip
                    size="small"
                    color={t.active ? "success" : "default"}
                    label={t.active ? "Ativo" : "Inativo"}
                  />
                </Stack>

                {/* Expandido */}
                <Collapse in={expanded} timeout="auto" unmountOnExit>
                  <Divider />
                  <CardContent sx={{ p: 1.25 }}>
                    <Stack spacing={0.75}>
                      <Typography variant="body2" color="text.secondary">
                        {t.user?.email}
                      </Typography>
                      {(t.createdAt || t.updatedAt) && (
                        <Typography variant="caption" color="text.secondary">
                          Criado: {fmtDate(t.createdAt)} • Atualizado:{" "}
                          {fmtDate(t.updatedAt)}
                        </Typography>
                      )}

                      {club ? (
                        <>
                          <Divider light sx={{ my: 0.25 }} />
                          <Stack
                            direction="row"
                            spacing={0.75}
                            alignItems="center"
                            flexWrap="wrap"
                          >
                            <Chip
                              size="small"
                              color="primary"
                              label={`#${club.number ?? "?"}`}
                            />
                            <Typography variant="body2" sx={{ mr: 0.5 }}>
                              {club.weekday || "—"}
                            </Typography>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ ml: 0.5 }}
                            >
                              {coordUser?.name || coordUser?.email || "Coord.: —"}
                            </Typography>
                          </Stack>
                        </>
                      ) : null}
                    </Stack>
                  </CardContent>
                </Collapse>

                {/* Ações */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 0.5,
                    px: 1.25,
                    pb: 1,
                    pt: 0.25,
                  }}
                >
                  <Tooltip title="Detalhes">
                    <IconButton size="small" onClick={() => onView(t)}>
                      <Visibility fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Vincular / Alterar clube">
                    <IconButton size="small" onClick={() => onEditLinks(t)}>
                      <LinkIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Desvincular clube">
                    <IconButton size="small" onClick={() => onClearClub(t.id)}>
                      <LinkOffIcon fontSize="small" />
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
        onRowsPerPageChange={(e) => {
          setPageSize(parseInt(e.target.value, 10));
          setPageIndex(0);
        }}
        rowsPerPageOptions={[6, 12, 24]}
        labelRowsPerPage="Linhas"
        sx={{ px: 0 }}
      />
    </Box>
  );
}
