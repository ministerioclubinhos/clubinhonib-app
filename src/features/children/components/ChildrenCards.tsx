import React, { useMemo, useState } from "react";
import {
  Box, Card, CardContent, Chip, Grid, IconButton, Stack,
  Typography, MenuItem, Select, FormControl, InputLabel,
  Divider, TablePagination, Tooltip, Collapse, ButtonBase,
  Paper, Avatar, Slide, Link
} from "@mui/material";
import {
  Visibility, Edit, Delete, SwapVert,
  CakeOutlined, CalendarMonthOutlined, PlaceOutlined,
  ExpandMore as ExpandMoreIcon, LocationOnOutlined,
  ContentCopy, Phone as PhoneIcon, ChildCare, PersonOutlined,
  WhatsApp
} from "@mui/icons-material";
import { SortingState } from "@tanstack/react-table";
import { ChildResponseDto } from "../types";
// Função para gerar link do WhatsApp com telefone
const buildWhatsappLinkFromPhone = (phone?: string | null) => {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  if (!digits) return null;
  return `https://wa.me/${digits}`;
};

const initials = (name?: string) =>
  (name || "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(s => s[0]?.toUpperCase())
    .join("") || "C";

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

const ageDetailed = (birth?: string | null) => {
  if (!birth) return null;
  const b = new Date(birth);
  if (isNaN(+b)) return null;
  const now = new Date();
  let years = now.getFullYear() - b.getFullYear();
  let months = now.getMonth() - b.getMonth();
  const days = now.getDate() - b.getDate();
  
  if (days < 0) months--;
  if (months < 0) {
    years--;
    months += 12;
  }
  
  if (years < 0) return null;
  
  if (years === 0 && months === 0) return "menos de 1 mês";
  if (years === 0) return `${months} ${months === 1 ? 'mês' : 'meses'}`;
  if (months === 0) return `${years} ${years === 1 ? 'ano' : 'anos'}`;
  
  return `${years} ${years === 1 ? 'ano' : 'anos'} e ${months} ${months === 1 ? 'mês' : 'meses'}`;
};

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
          const ageDetailedText = ageDetailed(c.birthDate);
          const tenure = tenureFrom(c.joinedAt);
          const addrPreview = c.address ? `${c.address.city} / ${c.address.state}` : "—";
          const wa = buildWhatsappLinkFromPhone(c.guardianPhone);

          return (
            <Grid item xs={12} key={c.id} sx={{ mb: { xs: 0.75, sm: 1 }, pb: { xs: 1, sm: 1.25 } }}>
              <Card
                variant="outlined"
                sx={{
                  borderRadius: 3,
                  overflow: "hidden",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  "&:hover": { 
                    boxShadow: "0 8px 25px rgba(0,0,0,0.15)", 
                    transform: "translateY(-2px)",
                    "& .child-avatar": {
                      transform: "scale(1.1)",
                    }
                  },
                  bgcolor: "background.paper",
                  position: "relative",
                  maxHeight: !expanded ? { xs: 170, sm: 170 } : "none",
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 4,
                    background: "linear-gradient(90deg, #ff5722 0%, #ff9800 100%)",
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
                    className="child-avatar"
                    sx={{
                      width: { xs: 40, sm: 48 }, 
                      height: { xs: 40, sm: 48 },
                      bgcolor: c.club ? "primary.main" : "grey.500",
                      color: "white",
                      fontWeight: 800, 
                      fontSize: { xs: 14, sm: 16 },
                      boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                      transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      flexShrink: 0,
                    }}
                    aria-label={`Avatar da criança ${c.name}`}
                  >
                    {initials(c.name)}
                  </Avatar>

                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography 
                      variant="subtitle1" 
                      fontWeight={700} 
                      noWrap 
                      title={c.name}
                      sx={{ fontSize: { xs: "0.9rem", sm: "1rem" } }}
                    >
                      {c.name}
                    </Typography>
                  <Chip
                    size="small"
                    color={c.club ? "primary" : "default"}
                    variant={c.club ? "filled" : "outlined"}
                    label={c.club ? `Clubinho #${c.club.number}` : "Sem clubinho"}
                      sx={{ 
                        fontSize: "0.7rem",
                        height: 20,
                        mt: 0.25
                      }}
                    />
                  </Box>

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
                  <Stack spacing={0.75}>
                    {/* Primeira linha: Nome do responsável */}
                    <Stack direction="row" spacing={0.75} alignItems="center">
                      <PersonOutlined sx={{ fontSize: 18, color: "primary.main", flexShrink: 0 }} />
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
                          title={c.guardianName || "Sem responsável"}
                        >
                          {c.guardianName || "Sem responsável"}
                        </Typography>
                      </Box>
                    </Stack>
                    
                    {/* Segunda linha: Botões de ação */}
                    {c.guardianPhone && (
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        <Tooltip title="Ligar">
                          <IconButton size="small" href={`tel:${c.guardianPhone}`} sx={{ p: 0.5 }}>
                            <PhoneIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
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
                              sx={{ p: 0.5 }}
                            >
                              <WhatsApp fontSize="medium" />
                            </IconButton>
                          </span>
                        </Tooltip>
                        <CopyButton value={c.guardianPhone} title="Copiar telefone" />
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
                      {c.gender && (
                        <Chip
                          size="small"
                          variant="filled"
                          label={gLabel(c.gender)}
                          color="info"
                          sx={{ 
                            fontWeight: 600, 
                            fontSize: "0.7rem",
                            height: 20,
                            "& .MuiChip-label": { px: 0.5 }
                          }}
                        />
                      )}
                      {ageDetailedText && (
                        <Chip
                          size="small"
                          variant="filled"
                          label={ageDetailedText}
                          color="success"
                          sx={{ 
                            fontWeight: 600, 
                            fontSize: "0.7rem",
                            height: 20,
                            "& .MuiChip-label": { px: 0.5 }
                          }}
                        />
                      )}
                      {tenure && (
                        <Chip
                          size="small"
                          variant="filled"
                          label={tenure}
                          color="warning"
                          sx={{ 
                            fontWeight: 600, 
                            fontSize: "0.7rem",
                            height: 20,
                            "& .MuiChip-label": { px: 0.5 }
                          }}
                        />
                      )}
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
                    <Divider sx={{ mx: { xs: 1, sm: 1.25 } }} />
                  <CardContent sx={{ p: { xs: 1.25, sm: 1.5 } }}>
                      <Stack spacing={2}>
                        {/* Informações da Criança */}
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
                              <ChildCare fontSize="small" color="primary" />
                              <Typography variant="subtitle2" color="text.primary" sx={{ fontWeight: 600 }}>
                                Informações da Criança
                            </Typography>
                            </Stack>
                            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap rowGap={1}>
                              {c.gender && (
                                <Chip 
                                  size="small" 
                                  variant="outlined" 
                                  label={gLabel(c.gender)}
                                  color="info"
                                  sx={{ fontWeight: 500 }}
                                />
                              )}
                              {ageDetailedText && (
                                <Chip 
                                  size="small" 
                                  variant="outlined" 
                                  label={`Idade: ${ageDetailedText}`}
                                  color="success"
                                  sx={{ fontWeight: 500 }}
                                />
                              )}
                              {tenure && (
                                <Chip 
                                  size="small" 
                                  variant="outlined" 
                                  label={`Tempo no clubinho: ${tenure}`}
                                  color="warning"
                                  sx={{ fontWeight: 500 }}
                                />
                              )}
                            </Stack>
                          </Stack>
                        </Paper>

                        {/* Datas */}
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
                              <CakeOutlined fontSize="small" color="primary" />
                              <Typography variant="subtitle2" color="text.primary" sx={{ fontWeight: 600 }}>
                                Datas Importantes
                              </Typography>
                            </Stack>
                            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap rowGap={1}>
                              <Chip 
                                size="small" 
                                variant="outlined" 
                                label={`Nascimento: ${fmtDateOnly(c.birthDate)}`}
                                color="default"
                                sx={{ fontWeight: 500 }}
                              />
                              <Chip 
                                size="small" 
                                variant="outlined" 
                                label={`No clubinho desde: ${fmtDateOnly(c.joinedAt)}`}
                                color="default"
                                sx={{ fontWeight: 500 }}
                              />
                            </Stack>
                          </Stack>
                        </Paper>

                        {/* Endereço */}
                        {c.address && (
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
                                <PlaceOutlined fontSize="small" color="primary" />
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
                    {c.name}
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
                    {wa && (
                      <Tooltip title="WhatsApp">
                        <IconButton
                          size="small"
                          color="success"
                          component="a"
                          href={wa}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="abrir WhatsApp"
                        >
                          <WhatsApp fontSize="medium" />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title="Editar criança">
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
                    <Tooltip title="Excluir criança">
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
        labelRowsPerPage="Linhas"
        sx={{ px: 0 }}
      />
    </Box>
  );
}
