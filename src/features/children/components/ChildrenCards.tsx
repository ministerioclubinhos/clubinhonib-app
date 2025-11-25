import React, { useMemo, useState } from "react";
import {
  Box, Card, CardContent, Chip, Grid, IconButton, Stack,
  Typography, MenuItem, Select, FormControl, InputLabel,
  Divider, TablePagination, Tooltip, Collapse, ButtonBase,
  Paper, Avatar, Link
} from "@mui/material";
import { Visibility, Edit, Delete, SwapVert, CakeOutlined, PlaceOutlined, ExpandMore as ExpandMoreIcon, LocationOnOutlined, Phone as PhoneIcon, ChildCare, PersonOutlined, WhatsApp, ToggleOn, ToggleOff } from "@mui/icons-material";
import { SortingState } from "@tanstack/react-table";
import { ChildResponseDto } from "../types";
import { RootState } from "@/store/slices";
import { useSelector } from "react-redux";
import { buildWhatsappLink } from "@/utils/whatsapp";
import { formatDate, gLabel, ageFrom, timeDifference } from "@/utils/dateUtils";
import { CopyButton, initials } from "@/utils/components";

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
  onToggleActive: (row: ChildResponseDto) => void;
};

export default function ChildrenCards(props: Props) {
  const {
    rows, total, pageIndex, pageSize, setPageIndex, setPageSize,
    sorting, setSorting, onOpenView, onStartEdit, onAskDelete, onToggleActive
  } = props;

  const [open, setOpen] = useState<Set<string>>(new Set());
  const { user } = useSelector((state: RootState) => state.auth);
  
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
          const ageDetailedText = timeDifference(c.birthDate);
          const tenure = timeDifference(c.joinedAt);
          const addrPreview = c.address ? `${c.address.city} / ${c.address.state}` : "—";
          const wa = buildWhatsappLink(c.name, user?.name, c.guardianPhone);

          return (
            <Grid item xs={12} key={c.id} sx={{ mb: { xs: 0.75, sm: 1 } }}>
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
                  display: "flex",
                  flexDirection: "column",
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
                {/* Header - Compacto no mobile */}
                <Box sx={{ px: { xs: 0.75, sm: 1.25 }, pt: { xs: 0.5, sm: 1 }, pb: { xs: 0, sm: 0.5 }, mt: { xs: 0.25, sm: 0.5 } }}>
                  <Stack direction="row" alignItems="center" spacing={{ xs: 0.5, sm: 1 }} sx={{ mb: { xs: 0.25, sm: 0 } }}>
                    <Avatar
                      className="child-avatar"
                      sx={{
                        width: { xs: 32, sm: 48 },
                        height: { xs: 32, sm: 48 },
                        bgcolor: c.club ? "primary.main" : "grey.500",
                        color: "white",
                        fontWeight: 800,
                        fontSize: { xs: 11, sm: 16 },
                        boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
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
                        sx={{ fontSize: { xs: "0.85rem", sm: "1rem" } }}
                      >
                        {c.name}
                      </Typography>
                      <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap rowGap={0.25} sx={{ mt: 0.25 }}>
                        <Chip
                          size="small"
                          color={c.club ? "primary" : "default"}
                          variant={c.club ? "filled" : "outlined"}
                          label={c.club ? `#${c.club.number}` : "Sem clubinho"}
                          sx={{
                            fontSize: { xs: "0.65rem", sm: "0.7rem" },
                            height: { xs: 18, sm: 20 },
                          }}
                        />
                        <Chip
                          size="small"
                          label={c.isActive ? "Ativo" : "Inativo"}
                          color={c.isActive ? "success" : "default"}
                          variant={c.isActive ? "filled" : "outlined"}
                          sx={{
                            fontSize: { xs: "0.65rem", sm: "0.7rem" },
                            height: { xs: 18, sm: 20 },
                          }}
                        />
                      </Stack>
                    </Box>

                    <ButtonBase
                      onClick={() => toggle(c.id)}
                      aria-label={expanded ? "Recolher" : "Expandir"}
                      sx={{
                        borderRadius: 1.5,
                        px: { xs: 0.5, sm: 1 },
                        py: { xs: 0.25, sm: 0.5 },
                        display: "flex",
                        alignItems: "center",
                        border: "1px solid",
                        borderColor: "divider",
                        bgcolor: "background.paper",
                        flexShrink: 0,
                        "&:hover": { bgcolor: "action.hover" },
                      }}
                    >
                      <ExpandMoreIcon
                        sx={{ 
                          fontSize: { xs: 18, sm: 20 },
                          transition: "transform .15s ease", 
                          transform: expanded ? "rotate(180deg)" : "rotate(0deg)" 
                        }}
                      />
                    </ButtonBase>
                  </Stack>

                  {/* Responsável - Compacto */}
                  <Box
                    sx={{
                      p: { xs: 0.375, sm: 0.75 },
                      borderRadius: 1.5,
                      bgcolor: "grey.50",
                      border: "1px solid",
                      borderColor: "grey.200",
                      mt: { xs: 0.25, sm: 0.5 },
                    }}
                  >
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <PersonOutlined sx={{ fontSize: { xs: 14, sm: 18 }, color: "primary.main", flexShrink: 0 }} />
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          color: "text.primary",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          fontSize: { xs: "0.75rem", sm: "0.875rem" },
                          flex: 1
                        }}
                        title={c.guardianName || "Sem responsável"}
                      >
                        {c.guardianName || "Sem responsável"}
                      </Typography>
                      {c.guardianPhone && (
                        <Stack direction="row" spacing={0.25}>
                          <Tooltip title="Ligar">
                            <IconButton size="small" href={`tel:${c.guardianPhone}`} sx={{ p: { xs: 0.25, sm: 0.5 } }}>
                              <PhoneIcon sx={{ fontSize: { xs: 16, sm: 18 } }} />
                            </IconButton>
                          </Tooltip>
                          <CopyButton value={c.guardianPhone} title="Copiar telefone" />
                        </Stack>
                      )}
                    </Stack>
                  </Box>

                  {/* Info adicional - Apenas no modo comprimido */}
                  {!expanded && (
                    <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap" useFlexGap rowGap={0.5} sx={{ mt: { xs: 0.5, sm: 0.5 }, pb: { xs: 0.5, sm: 0 } }}>
                      {c.gender && (
                        <Chip
                          size="small"
                          variant="filled"
                          label={gLabel(c.gender)}
                          color="info"
                          sx={{
                            fontWeight: 600,
                            fontSize: { xs: "0.7rem", sm: "0.75rem" },
                            height: { xs: 22, sm: 24 },
                            "& .MuiChip-label": { px: { xs: 0.75, sm: 1 } }
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
                            fontSize: { xs: "0.7rem", sm: "0.75rem" },
                            height: { xs: 22, sm: 24 },
                            "& .MuiChip-label": { px: { xs: 0.75, sm: 1 } }
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
                            fontSize: { xs: "0.7rem", sm: "0.75rem" },
                            height: { xs: 22, sm: 24 },
                            "& .MuiChip-label": { px: { xs: 0.75, sm: 1 } }
                          }}
                        />
                      )}
                      <Stack direction="row" spacing={0.5} alignItems="center" sx={{ ml: { xs: 0, sm: 0.25 }, mt: { xs: 0.25, sm: 0 } }}>
                        <LocationOnOutlined sx={{ fontSize: { xs: 14, sm: 16 }, color: "text.secondary" }} />
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            fontWeight: 500,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            fontSize: { xs: "0.75rem", sm: "0.875rem" },
                            lineHeight: 1.4
                          }}
                        >
                          {addrPreview}
                        </Typography>
                      </Stack>
                    </Stack>
                  )}
                </Box>

                {expanded && (
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
                                label={`Nascimento: ${formatDate(c.birthDate)}`}
                                color="default"
                                sx={{ fontWeight: 500 }}
                              />
                              <Chip
                                size="small"
                                variant="outlined"
                                label={`No clubinho desde: ${formatDate(c.joinedAt)}`}
                                color="default"
                                sx={{ fontWeight: 500 }}
                              />
                            </Stack>
                          </Stack>
                        </Paper>

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
                )}

                {/* Rodapé - Sempre visível */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    gap: { xs: 0.5, sm: 0.75 },
                    px: { xs: 0.75, sm: 1.25 },
                    py: { xs: 0.375, sm: 0.75 },
                    bgcolor: "grey.50",
                    borderTop: "1px solid",
                    borderColor: "grey.200",
                    flexShrink: 0,
                    mt: "auto",
                  }}
                >
                  <Stack direction="row" spacing={{ xs: 0.25, sm: 0.5 }}>
                    <Tooltip title="Visualizar detalhes">
                      <IconButton
                        size="small"
                        onClick={() => onOpenView(c)}
                        sx={{
                          color: "primary.main",
                          p: { xs: 0.5, sm: 0.75 },
                          "&:hover": { bgcolor: "primary.50" },
                          "& .MuiSvgIcon-root": {
                            fontSize: { xs: 20, sm: 22 }
                          }
                        }}
                      >
                        <Visibility />
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
                          sx={{
                            p: { xs: 0.5, sm: 0.75 },
                            "& .MuiSvgIcon-root": {
                              fontSize: { xs: 20, sm: 22 }
                            }
                          }}
                        >
                          <WhatsApp />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title="Editar criança">
                      <IconButton
                        size="small"
                        onClick={() => onStartEdit(c)}
                        sx={{
                          color: "info.main",
                          p: { xs: 0.5, sm: 0.75 },
                          "&:hover": { bgcolor: "info.50" },
                          "& .MuiSvgIcon-root": {
                            fontSize: { xs: 20, sm: 22 }
                          }
                        }}
                      >
                        <Edit />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={c.isActive ? "Desativar" : "Ativar"}>
                      <IconButton
                        size="small"
                        color={c.isActive ? "success" : "default"}
                        onClick={() => onToggleActive(c)}
                        sx={{
                          p: { xs: 0.5, sm: 0.75 },
                          "&:hover": { bgcolor: c.isActive ? "success.50" : "action.hover" },
                          "& .MuiSvgIcon-root": {
                            fontSize: { xs: 20, sm: 22 }
                          }
                        }}
                      >
                        {c.isActive ? <ToggleOn /> : <ToggleOff />}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Excluir criança">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => onAskDelete(c)}
                        sx={{
                          p: { xs: 0.5, sm: 0.75 },
                          "&:hover": { bgcolor: "error.50" },
                          "& .MuiSvgIcon-root": {
                            fontSize: { xs: 20, sm: 22 }
                          }
                        }}
                      >
                        <Delete />
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
