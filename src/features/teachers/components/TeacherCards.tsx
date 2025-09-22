import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";
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
  Paper,
  Avatar,
  Slide,
  ButtonBase,
  Link
} from "@mui/material";
import {
  Visibility,
  Link as LinkIcon,
  LinkOff as LinkOffIcon,
  ExpandMore as ExpandMoreIcon,
  SwapVert,
  ContentCopy,
  Phone as PhoneIcon,
  SchoolOutlined,
  GroupOutlined,
  PersonOutlined,
  WhatsApp
} from "@mui/icons-material";
import type { SortingState } from "@tanstack/react-table";
import type { TeacherProfile } from "../types";
import { fmtDate } from "@/utils/dates";
import { RootState } from "@/store/slices";
import { buildWhatsappLink } from "@/utils/whatsapp";
import { weekdayLabel } from "@/utils/dateUtils";
import { CopyButton, initials } from "@/utils/components";



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
      { id: "club", label: "Nº do Clubinho" },
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

      <Grid container spacing={{ xs: 1, sm: 1.25 }}>
        {rows.map((t) => {
          const expanded = open.has(t.id);
          const club = t.club || null;
          const coordUser = club?.coordinator?.user || null;
          const { user: loggedUser } = useSelector((state: RootState) => state.auth);
          const wa = buildWhatsappLink(t.user?.name, loggedUser?.name, t.user?.phone);

          return (
            <Grid item xs={12} key={t.id} sx={{ mb: { xs: 0.75, sm: 1 }, pb: { xs: 1, sm: 1.25 } }}>
              <Card
                variant="outlined"
                sx={{
                  borderRadius: 3,
                  overflow: "hidden",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  "&:hover": {
                    boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
                    transform: "translateY(-2px)",
                    "& .teacher-avatar": {
                      transform: "scale(1.1)",
                    }
                  },
                  bgcolor: "background.paper",
                  position: "relative",
                  maxHeight: !expanded ? { xs: 150, sm: 150 } : "none",
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 4,
                    background: "linear-gradient(90deg, #ff9800 0%, #4caf50 100%)",
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
                    mt: 0.5, // Espaço para a barra colorida
                  }}
                >
                  <Avatar
                    className="teacher-avatar"
                    sx={{
                      width: { xs: 40, sm: 48 },
                      height: { xs: 40, sm: 48 },
                      bgcolor: t.active ? "success.main" : "grey.500",
                      color: "white",
                      fontWeight: 800,
                      fontSize: { xs: 14, sm: 16 },
                      boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                      transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      flexShrink: 0,
                    }}
                    aria-label={`Avatar do professor ${t.user?.name}`}
                  >
                    {initials(t.user?.name)}
                  </Avatar>

                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography
                      variant="subtitle1"
                      fontWeight={700}
                      noWrap
                      title={t.user?.name || t.user?.email}
                      sx={{ fontSize: { xs: "0.9rem", sm: "1rem" } }}
                    >
                      {t.user?.name || t.user?.email || "—"}
                    </Typography>
                    <Chip
                      size="small"
                      color={t.active ? "success" : "default"}
                      label={t.active ? "Ativo" : "Inativo"}
                      sx={{
                        fontSize: "0.7rem",
                        height: 20,
                        mt: 0.25
                      }}
                    />
                  </Box>

                  <ButtonBase
                    onClick={() => toggle(t.id)}
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
                    <SchoolOutlined sx={{ fontSize: 18, color: "primary.main", flexShrink: 0 }} />
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
                        title={club ? `Clubinho #${club.number ?? "?"}` : "Sem Clubinho"}
                      >
                        {club ? `Clubinho #${club.number ?? "?"}` : "Sem Clubinho"}
                      </Typography>
                    </Box>
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
                        icon={<GroupOutlined sx={{ fontSize: 12 }} />}
                        label={
                          coordUser?.name
                            ? coordUser.name
                            : coordUser?.email
                              ? coordUser.email
                              : "Sem coordenador"
                        }
                        color="info"
                        sx={{
                          fontWeight: 600,
                          fontSize: "0.7rem",
                          height: 20,
                          "& .MuiChip-label": { px: 0.5 }
                        }}
                      />
                      {coordUser?.phone && (
                        <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.5 }}>
                          <PhoneIcon sx={{ fontSize: 14, color: "text.secondary" }} />
                          <Link
                            href={`tel:${coordUser.phone}`}
                            underline="hover"
                            sx={{
                              fontSize: "0.75rem",
                              color: "text.secondary",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis"
                            }}
                          >
                            {coordUser.phone}
                          </Link>
                          <CopyButton value={coordUser.phone} title="Copiar telefone" />
                        </Stack>
                      )}
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
                          <Stack spacing={1}>
                            <Stack direction="row" spacing={0.75} alignItems="center">
                              <PersonOutlined fontSize="small" color="primary" />
                              <Typography variant="subtitle2" color="text.primary" sx={{ fontWeight: 600 }}>
                                Informações do Professor
                              </Typography>
                            </Stack>
                            <Stack spacing={1}>
                              <Typography variant="body2" color="text.secondary">
                                {t.user?.email}
                              </Typography>
                              {t.user?.phone && (
                                <Stack direction="row" spacing={0.5} alignItems="center">
                                  <PhoneIcon sx={{ fontSize: 14, color: "text.secondary" }} />
                                  <Typography variant="body2" color="text.secondary">
                                    {t.user.phone}
                                  </Typography>
                                  <CopyButton value={t.user.phone} title="Copiar telefone" />
                                  {wa && (
                                    <Tooltip title="WhatsApp">
                                      <IconButton
                                        size="small"
                                        component="a"
                                        href={wa}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        sx={{ color: "success.main", p: 0.5 }}
                                      >
                                        <WhatsApp fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                  )}
                                </Stack>
                              )}
                            </Stack>
                          </Stack>
                        </Paper>

                        {/* Clubinho */}
                        {club && (
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
                            <Stack spacing={1}>
                              <Stack direction="row" spacing={0.75} alignItems="center">
                                <SchoolOutlined fontSize="small" color="primary" />
                                <Typography variant="subtitle2" color="text.primary" sx={{ fontWeight: 600 }}>
                                  Clubinho #{club.number ?? "?"}
                                </Typography>
                              </Stack>
                              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap rowGap={1}>
                                <Chip
                                  size="small"
                                  color="primary"
                                  label={`#${club.number ?? "?"}`}
                                  sx={{ fontWeight: 500 }}
                                />
                                <Chip
                                  size="small"
                                  variant="outlined"
                                  label={weekdayLabel(club.weekday)}
                                  sx={{ fontWeight: 500 }}
                                />
                                <Chip
                                  size="small"
                                  variant="outlined"
                                  label={coordUser?.name || coordUser?.email || "Sem coordenador"}
                                  sx={{ fontWeight: 500 }}
                                />
                              </Stack>
                            </Stack>
                          </Paper>
                        )}

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
                              label={`Criado: ${fmtDate(t.createdAt)}`}
                              color="default"
                              sx={{ fontWeight: 500 }}
                            />
                            <Chip
                              size="small"
                              variant="outlined"
                              label={`Atualizado: ${fmtDate(t.updatedAt)}`}
                              color="default"
                              sx={{ fontWeight: 500 }}
                            />
                          </Stack>
                        </Paper>
                      </Stack>
                    </CardContent>
                  </Box>
                </Slide>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 0.75,
                    px: { xs: 1, sm: 1.25 },
                    pb: { xs: 0.75, sm: 1 },
                    pt: 0.75,
                    bgcolor: "grey.50",
                    borderTop: "1px solid",
                    borderColor: "grey.200",
                  }}
                >
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                    {t.user?.name || t.user?.email}
                  </Typography>

                  <Stack direction="row" spacing={0.5}>
                    <Tooltip title="Visualizar detalhes">
                      <IconButton
                        size="small"
                        onClick={() => onView(t)}
                        sx={{
                          color: "primary.main",
                          "&:hover": { bgcolor: "primary.50" }
                        }}
                      >
                        <Visibility fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Vincular / Alterar Clubinho">
                      <IconButton
                        size="small"
                        onClick={() => onEditLinks(t)}
                        sx={{
                          color: "info.main",
                          "&:hover": { bgcolor: "info.50" }
                        }}
                      >
                        <LinkIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Desvincular Clubinho">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => onClearClub(t.id)}
                        sx={{
                          "&:hover": { bgcolor: "error.50" }
                        }}
                      >
                        <LinkOffIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
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
