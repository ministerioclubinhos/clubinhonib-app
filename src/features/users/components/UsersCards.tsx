import React, { useMemo, useState } from "react";
import {
  Box, Card, CardContent, Chip, Grid, IconButton, Stack,
  Typography, MenuItem, Select, FormControl, InputLabel,
  Divider, TablePagination, Tooltip, Collapse, Paper, Avatar,
  Slide, ButtonBase, Link
} from "@mui/material";
import {
  Visibility, Edit, Delete, SwapVert,
  ExpandMore as ExpandMoreIcon,
  PhoneIphone, AlternateEmail, AccessTime, WhatsApp,
  ContentCopy, Phone as PhoneIcon, Badge
} from "@mui/icons-material";
import { SortingState } from "@tanstack/react-table";
import { UserRow } from "../types";
import { fmtDate } from "@/utils/dates";
import { UserRole } from "@/store/slices/auth/authSlice";
import { buildWhatsappLink } from "@/utils/whatsapp";
import { useSelector } from "react-redux";
import { RootState } from "@/store/slices";

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

const roleLabels: Record<UserRole, string> = {
  [UserRole.ADMIN]: "Administrador",
  [UserRole.COORDINATOR]: "Coordenador",
  [UserRole.TEACHER]: "Professor",
};

const initials = (name?: string) =>
  (name || "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(s => s[0]?.toUpperCase())
    .join("") || "U";

function CopyButton({ value, title = "Copiar" }: { value?: string; title?: string }) {
  const copyToClipboard = (text?: string) => {
    if (!text) return;
    navigator.clipboard?.writeText(String(text)).catch(() => {});
  };
  return (
    <Tooltip title={title}>
      <IconButton size="small" onClick={() => copyToClipboard(value)}>
        <ContentCopy fontSize="inherit" />
      </IconButton>
    </Tooltip>
  );
}

export default function UsersCards(props: Props) {
  const {
    rows, total, pageIndex, pageSize, setPageIndex, setPageSize,
    sorting, setSorting, onView, onEdit, onDelete,
  } = props;

  const [open, setOpen] = useState<Set<string>>(new Set());
  const { user } = useSelector((state: RootState) => state.auth);
  
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

  const roleChipColor = (role?: string) => {
    switch (role) {
      case UserRole.COORDINATOR: return "primary";
      case UserRole.TEACHER: return "success";
      default: return "default";
    }
  };

  return (
    <Box sx={{ px: { xs: 0, sm: 1 }, py: 0 }}>
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

      <Grid container spacing={{ xs: 1, sm: 1.25 }}>
        {rows.map((u) => {
          const expanded = open.has(u.id);
          const wa = buildWhatsappLink(u.name, user?.name, u.phone);

          return (
            <Grid item xs={12} key={u.id} sx={{ mb: { xs: 0.75, sm: 1 }, pb: { xs: 1, sm: 1.25 } }}>
              <Card
                variant="outlined"
                sx={{
                  borderRadius: 3,
                  overflow: "hidden",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  "&:hover": { 
                    boxShadow: "0 8px 25px rgba(0,0,0,0.15)", 
                    transform: "translateY(-2px)",
                    "& .user-avatar": {
                      transform: "scale(1.1)",
                    }
                  },
                  bgcolor: "background.paper",
                  position: "relative",
                  maxHeight: !expanded ? { xs: 190, sm: 190 } : "none",
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 4,
                    background: "linear-gradient(90deg, #2196f3 0%, #4caf50 100%)",
                  }
                }}
              >
                <Stack
                  direction="row"
                  alignItems="center"
                  sx={{
                    px: { xs: 1, sm: 1.25 },
                    pt: 1,
                    pb: 0.5,
                    gap: { xs: 0.75, sm: 1 },
                    mt: 0.5, 
                  }}
                >
                  <Avatar
                    className="user-avatar"
                    sx={{
                      width: { xs: 40, sm: 48 }, 
                      height: { xs: 40, sm: 48 },
                      bgcolor: roleChipColor(u.role) === "primary" ? "primary.main" : 
                               roleChipColor(u.role) === "success" ? "success.main" : "grey.500",
                      color: "white",
                      fontWeight: 800, 
                      fontSize: { xs: 14, sm: 16 },
                      boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                      transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      flexShrink: 0,
                    }}
                    aria-label={`Avatar do usuário ${u.name}`}
                  >
                    {initials(u.name)}
                  </Avatar>

                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography 
                      variant="subtitle1" 
                      fontWeight={700} 
                      noWrap 
                      title={u.name}
                      sx={{ fontSize: { xs: "0.9rem", sm: "1rem" } }}
                    >
                      {u.name || "—"}
                    </Typography>
                  <Chip
                    size="small"
                    color={roleChipColor(u.role)}
                    label={roleLabels[u.role as UserRole] || "Usuário"}
                      sx={{ 
                        fontSize: "0.7rem",
                        height: 20,
                        mt: 0.25
                      }}
                    />
                  </Box>

                  <ButtonBase
                      onClick={() => toggle(u.id)}
                    aria-label={expanded ? "Recolher" : "Expandir"}
                      sx={{
                      borderRadius: 2,
                      px: { xs: 0.75, sm: 1 },
                      py: 0.5,
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                        border: "1px solid",
                        borderColor: "divider",
                        bgcolor: "background.paper",
                      flexShrink: 0,
                        "&:hover": { bgcolor: "action.hover" },
                    }}
                  >
                    <Typography 
                      variant="caption" 
                      color="text.secondary" 
                      sx={{ 
                        fontWeight: 600,
                        display: { xs: "none", sm: "block" }
                      }}
                    >
                      {expanded ? "Recolher" : "Detalhes"}
                    </Typography>
                    <ExpandMoreIcon
                      fontSize="small"
                      sx={{ transition: "transform .15s ease", transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }}
                    />
                  </ButtonBase>
                </Stack>

                <Box
                  sx={{
                    mx: { xs: 1, sm: 1.25 },
                    mb: 0.5,
                    p: { xs: 0.75, sm: 1 },
                    borderRadius: 2,
                    bgcolor: "grey.50",
                    border: "1px solid",
                    borderColor: "grey.200",
                  }}
                >
                  <Stack direction="row" spacing={0.75} alignItems="center">
                    <AlternateEmail sx={{ fontSize: 18, color: "primary.main", flexShrink: 0 }} />
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography 
                        variant="body2"
                        sx={{ 
                          fontWeight: 600,
                          color: "text.primary",
                          whiteSpace: "nowrap", 
                          overflow: "hidden", 
                          textOverflow: "ellipsis"
                        }}
                        title={u.email}
                      >
                      {u.email}
                    </Typography>
                    </Box>
                    <CopyButton value={u.email} title="Copiar e-mail" />
                  </Stack>
                </Box>

                {!expanded && (
                  <Box sx={{ px: { xs: 1, sm: 1.25 }, pb: 0.75 }}>
                    <Stack
                      direction="row"
                      spacing={0.5}
                      alignItems="center"
                      flexWrap="wrap"
                      rowGap={0.25}
                    >
                      <Chip
                        size="small"
                        variant="filled"
                        label={`Ativo: ${u.active ? "Sim" : "Não"}`}
                        color={u.active ? "success" : "default"}
                        sx={{ 
                          fontWeight: 600, 
                          fontSize: "0.7rem",
                          height: 20,
                          "& .MuiChip-label": { px: 0.5 }
                        }}
                      />
                      <Chip
                        size="small"
                        variant="filled"
                        label={`Completo: ${u.completed ? "Sim" : "Não"}`}
                        color={u.completed ? "success" : "default"}
                        sx={{ 
                          fontWeight: 600, 
                          fontSize: "0.7rem",
                          height: 20,
                          "& .MuiChip-label": { px: 0.5 }
                        }}
                      />
                    </Stack>
                    <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="space-between" sx={{ mt: 0.5 }}>
                        {u.phone && (
                        <Stack direction="row" spacing={0.5} alignItems="center" sx={{ flex: 1, minWidth: 0 }}>
                          <PhoneIphone sx={{ fontSize: 14, color: "text.secondary" }} />
                          <Link 
                            href={`tel:${u.phone}`} 
                            underline="hover"
                            sx={{ 
                              fontSize: "0.75rem",
                              color: "text.secondary",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis"
                            }}
                          >
                              {u.phone}
                          </Link>
                          <CopyButton value={u.phone} title="Copiar telefone" />
                      </Stack>
                    )}
                      <Tooltip title={wa ? "WhatsApp" : "Sem telefone"}>
                        <span>
                          <IconButton
                            size="small"
                            color="success"
                            component="a"
                            href={wa || undefined}
                            target="_blank"
                            rel="noopener noreferrer"
                            disabled={!wa}
                            aria-label="abrir WhatsApp"
                            sx={{ ml: 0.5 }}
                          >
                            <WhatsApp fontSize="large" />
                          </IconButton>
                        </span>
                      </Tooltip>
                  </Stack>
                  </Box>
                )}

                <Slide direction="down" in={expanded} timeout={300}>
                  <Box>
                    <Divider sx={{ mx: { xs: 1, sm: 1.25 } }} />
                    <CardContent sx={{ p: { xs: 1.25, sm: 1.5 } }}>
                      <Stack spacing={2}>
                        
                        <Paper
                          variant="outlined"
                          sx={{
                            p: 1.25,
                            borderRadius: 2,
                            bgcolor: "grey.50",
                            border: "1px solid",
                            borderColor: "grey.200",
                          }}
                        >
                          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap rowGap={1}>
                            <Chip 
                              size="small" 
                              variant="outlined" 
                              label={`Criado: ${fmtDate(u.createdAt)}`}
                              color="default"
                              sx={{ fontWeight: 500 }}
                            />
                            <Chip 
                              size="small" 
                              variant="outlined" 
                              label={`Atualizado: ${fmtDate(u.updatedAt)}`}
                              color="default"
                              sx={{ fontWeight: 500 }}
                            />
                          </Stack>
                        </Paper>

                        <Paper
                          variant="outlined"
                          sx={{
                            p: 1.25,
                            borderRadius: 2,
                            bgcolor: "grey.50",
                            border: "1px solid",
                            borderColor: "grey.200",
                          }}
                        >
                        <Stack direction="row" flexWrap="wrap" spacing={1} rowGap={1}>
                          <Chip
                            size="small"
                            label={`Papel: ${roleLabels[u.role as UserRole] || "Usuário"}`}
                            color={roleChipColor(u.role)}
                            variant="outlined"
                              sx={{ fontWeight: 500 }}
                            />
                            <Chip 
                              size="small" 
                              label={`Ativo: ${u.active ? "Sim" : "Não"}`} 
                              color={u.active ? "success" : "default"}
                              sx={{ fontWeight: 500 }}
                            />
                            <Chip 
                              size="small" 
                              label={`Completo: ${u.completed ? "Sim" : "Não"}`} 
                              color={u.completed ? "success" : "default"}
                              sx={{ fontWeight: 500 }}
                            />
                            {u.phone && (
                              <Chip 
                                size="small" 
                                label={u.phone} 
                                variant="outlined"
                                sx={{ fontWeight: 500 }}
                              />
                            )}
                          </Stack>
                        </Paper>
                        </Stack>
                  </CardContent>
                  </Box>
                </Slide>

                <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 0.5, px: 1.25, pb: 1 }}>
                  <Tooltip title={wa ? "WhatsApp" : "Sem telefone"}>
                    <span>
                      <IconButton
                        size="small"
                        color="success"
                        component="a"
                        href={wa || undefined}
                        target="_blank"
                        rel="noopener noreferrer"
                        disabled={!wa}
                        aria-label="abrir WhatsApp"
                      >
                        <WhatsApp fontSize="large" />
                      </IconButton>
                    </span>
                  </Tooltip>

                  <Tooltip title="Visualizar">
                    <IconButton size="small" onClick={() => onView(u)}>
                      <Visibility fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Editar">
                    <IconButton size="small" onClick={() => onEdit(u)}>
                      <Edit fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Excluir">
                    <IconButton size="small" color="error" onClick={() => onDelete(u)}>
                      <Delete fontSize="small" />
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
        labelRowsPerPage="Linhas:"
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
        slotProps={{
          select: {
            sx: { fontSize: { xs: "0.75rem", sm: "0.875rem" } }
          }
        }}
        sx={{ 
          px: 0,
          ".MuiTablePagination-toolbar": {
            minHeight: { xs: 52, sm: 64 },
            px: { xs: 0.5, sm: 2 },
          },
          ".MuiTablePagination-selectLabel": {
            margin: 0,
            fontSize: { xs: "0.75rem", sm: "0.875rem" },
          },
          ".MuiTablePagination-displayedRows": {
            margin: 0,
            fontSize: { xs: "0.75rem", sm: "0.875rem" },
          },
          ".MuiTablePagination-actions": {
            marginLeft: { xs: 0.5, sm: 1 },
            "& .MuiIconButton-root": {
              padding: { xs: "4px", sm: "8px" },
            }
          }
        }}
      />
    </Box>
  );
}
