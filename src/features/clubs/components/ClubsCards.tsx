import React, { useMemo, useState } from "react";
import {
  Box, Card, CardContent, Chip, Grid, IconButton, Stack,
  Typography, MenuItem, Select, FormControl, InputLabel,
  Divider, TablePagination, Tooltip, Collapse, ButtonBase,
  Paper, Avatar, Fade, Slide
} from "@mui/material";
import {
  Visibility, Edit, Delete, SwapVert,
  ExpandMore as ExpandMoreIcon,
  CalendarMonthOutlined, LocationOnOutlined,
  SupervisorAccount, Group as GroupIcon, AccessTime as AccessTimeIcon,
  Phone as PhoneIcon,
} from "@mui/icons-material";
import { SortingState } from "@tanstack/react-table";
import { ClubResponseDto } from "../types";
import { formatDate, weekdayLabel } from "@/utils/dateUtils";
import { CopyButton } from "@/utils/components";

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
    { id: "time", label: "Horário" },
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
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  "&:hover": { 
                    boxShadow: "0 8px 25px rgba(0,0,0,0.15)", 
                    transform: "translateY(-2px)",
                    "& .club-avatar": {
                      transform: "scale(1.1)",
                    }
                  },
                  bgcolor: "background.paper",
                  position: "relative",
                  maxHeight: !expanded ? { xs: 160, sm: 140 } : "none",
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 4,
                    background: "linear-gradient(90deg, #4caf50 0%, #2196f3 100%)",
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
                    className="club-avatar"
                    sx={{
                      width: { xs: 40, sm: 48 }, 
                      height: { xs: 40, sm: 48 },
                      bgcolor: "success.main", 
                      color: "success.contrastText",
                      fontWeight: 800, 
                      fontSize: { xs: 14, sm: 16 },
                      boxShadow: "0 4px 12px rgba(76, 175, 80, 0.3)",
                      transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      flexShrink: 0,
                    }}
                    aria-label={`Clubinho número ${c.number}`}
                  >
                    {c.number}
                  </Avatar>

                  <Stack 
                    direction="row" 
                    spacing={0.5} 
                    alignItems="center"
                    sx={{ minWidth: 0, flex: 1 }}
                  >
                    <CalendarMonthOutlined sx={{ fontSize: 16, color: "text.secondary", flexShrink: 0 }} />
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ 
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis"
                      }}
                    >
                      {weekdayLabel(c.weekday)}
                    </Typography>
                  </Stack>

                  {c.time && (
                    <Stack 
                      direction="row" 
                      spacing={0.5} 
                      alignItems="center"
                      sx={{ minWidth: 0, flexShrink: 0 }}
                    >
                      <AccessTimeIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        sx={{ 
                          fontWeight: 600,
                          whiteSpace: "nowrap"
                        }}
                      >
                        {c.time}
                      </Typography>
                    </Stack>
                  )}

                  <ButtonBase
                    onClick={() => toggle(c.id)}
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
                  <Stack
                    direction="row"
                    spacing={0.75}
                    alignItems="center"
                  >
                    <SupervisorAccount sx={{ fontSize: 18, color: "primary.main", flexShrink: 0 }} />
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
                        title={coordName}
                      >
                        {coordName}
                      </Typography>
                    </Box>
                    {c.coordinator?.user?.phone && (
                      <Stack direction="row" spacing={0.25}>
                        <Tooltip title="Ligar">
                          <IconButton size="small" href={`tel:${c.coordinator.user.phone}`} sx={{ p: 0.5 }}>
                            <PhoneIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <CopyButton value={c.coordinator.user.phone} title="Copiar telefone" />
                      </Stack>
                    )}
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
                        icon={<GroupIcon sx={{ fontSize: 12 }} />}
                        label={`${teachers.length || 0}`}
                        color="info"
                        sx={{ 
                          fontWeight: 600, 
                          fontSize: "0.7rem",
                          height: 20,
                          "& .MuiChip-label": { px: 0.5 }
                        }}
                      />
                      {c.time && (
                        <Chip
                          size="small"
                          variant="filled"
                          icon={<AccessTimeIcon sx={{ fontSize: 12 }} />}
                          label={c.time}
                          color="success"
                          sx={{ 
                            fontWeight: 600, 
                            fontSize: "0.7rem",
                            height: 20,
                            "& .MuiChip-label": { px: 0.5 }
                          }}
                        />
                      )}
                      <Chip
                        size="small"
                        variant="outlined"
                        icon={<CalendarMonthOutlined sx={{ fontSize: 12 }} />}
                        label={weekdayLabel(c.weekday)}
                        sx={{ 
                          fontWeight: 600, 
                          fontSize: "0.7rem",
                          height: 20,
                          "& .MuiChip-label": { px: 0.5 }
                        }}
                      />
                    </Stack>
                    <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.5 }}>
                      <LocationOnOutlined sx={{ fontSize: 14, color: "text.secondary" }} />
                      <Typography 
                        variant="caption" 
                        color="text.secondary" 
                        sx={{ 
                          fontWeight: 500,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis"
                        }}
                      >
                        {addrPreview}
                      </Typography>
                    </Stack>
                  </Box>
                )}

                <Slide direction="down" in={expanded} timeout={300}>
                  <Box>
                    <Divider sx={{ mx: { xs: 1.5, sm: 2 } }} />
                    <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                      <Stack spacing={2}>
                        {/* Professores */}
                        <Paper
                          variant="outlined"
                          sx={{
                            p: 1.5,
                            borderRadius: 2,
                            bgcolor: "grey.50",
                            border: "1px solid",
                            borderColor: "grey.200",
                          }}
                        >
                          <Stack spacing={1}>
                            <Stack direction="row" spacing={0.75} alignItems="center">
                              <GroupIcon fontSize="small" color="primary" />
                              <Typography variant="subtitle2" color="text.primary" sx={{ fontWeight: 600 }}>
                                Professores ({teachers.length})
                              </Typography>
                            </Stack>

                            {teachers.length ? (
                              <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap" }}>
                                {teachers.map((t) => (
                                  <Chip
                                    key={t.id}
                                    size="small"
                                    label={t.user?.name || t.user?.email || t.id}
                                    variant="outlined"
                                    color="primary"
                                    sx={{ fontWeight: 500 }}
                                  />
                                ))}
                              </Box>
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                Nenhum professor vinculado.
                              </Typography>
                            )}
                          </Stack>
                        </Paper>

                        {/* Endereço */}
                        {c.address && (
                          <Paper
                            variant="outlined"
                            sx={{
                              p: 1.5,
                              borderRadius: 2,
                              bgcolor: "grey.50",
                              border: "1px solid",
                              borderColor: "grey.200",
                            }}
                          >
                            <Stack spacing={1}>
                              <Stack direction="row" spacing={0.75} alignItems="center">
                                <LocationOnOutlined fontSize="small" color="primary" />
                                <Typography variant="subtitle2" color="text.primary" sx={{ fontWeight: 600 }}>
                                  Endereço
                                </Typography>
                              </Stack>

                              <Stack spacing={0.5}>
                                <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: 1.4 }}>
                                  {c.address.street}{c.address.number ? `, ${c.address.number}` : ""}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.4 }}>
                                  {c.address.district} • {c.address.city} / {c.address.state}
                                </Typography>
                                {c.address.postalCode && (
                                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.4 }}>
                                    CEP: {c.address.postalCode}
                                  </Typography>
                                )}
                                {c.address.complement && (
                                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.4 }}>
                                    Complemento: {c.address.complement}
                                  </Typography>
                                )}
                              </Stack>
                            </Stack>
                          </Paper>
                        )}

                        {/* Informações adicionais */}
                        <Paper
                          variant="outlined"
                          sx={{
                            p: 1.5,
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
                              label={`Criado: ${formatDate(c.createdAt)}`}
                              color="default"
                              sx={{ fontWeight: 500 }}
                            />
                            <Chip 
                              size="small" 
                              variant="outlined" 
                              label={`Atualizado: ${formatDate(c.updatedAt)}`}
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
                    Clubinho #{c.number}
                  </Typography>
                  
                  <Stack direction="row" spacing={0.5}>
                    <Tooltip title="Visualizar detalhes">
                      <IconButton 
                        size="small" 
                        onClick={() => onOpenView(c)}
                        sx={{ 
                          color: "primary.main",
                          "&:hover": { bgcolor: "primary.50" }
                        }}
                      >
                        <Visibility fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Editar clubinho">
                      <IconButton 
                        size="small" 
                        onClick={() => onStartEdit(c)}
                        sx={{ 
                          color: "info.main",
                          "&:hover": { bgcolor: "info.50" }
                        }}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    {isAdmin && (
                      <Tooltip title="Excluir clubinho">
                        <IconButton 
                          size="small" 
                          color="error" 
                          onClick={() => onAskDelete(c)}
                          sx={{ 
                            "&:hover": { bgcolor: "error.50" }
                          }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Stack>
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
