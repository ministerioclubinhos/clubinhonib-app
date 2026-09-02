import React, { useEffect, useRef, useState } from "react";
import { gradients } from "@/theme";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Fab,
  Grid,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import PlaceIcon from "@mui/icons-material/Place";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import EventIcon from "@mui/icons-material/Event";
import { motion } from "framer-motion";

const fallbackImageUrl = import.meta.env.VITE_CLUBINHO_FALLBACK_IMAGE_URL || import.meta.env.VITE_SHELTER_FALLBACK_IMAGE_URL || '';
import dayjs from "dayjs";
import "dayjs/locale/pt-br";
import { AppEvent } from "./EventosPage";

dayjs.locale("pt-br");

const getEventStatus = (dateISO: string) => {
  const eventoDate = dayjs(dateISO);
  const hoje = dayjs();
  const diffDays = eventoDate.diff(hoje, "day");

  if (eventoDate.isSame(hoje, "day")) return "hoje";
  if (diffDays === 1) return "amanha";
  if (diffDays >= 2 && diffDays <= 7) return "semana";
  if (diffDays >= 8 && diffDays <= 30) return "mes";
  if (diffDays > 30) return "futuro";
  if (diffDays === -1) return "ontem";
  if (diffDays >= -7 && diffDays <= -2) return "semana_passada";
  if (diffDays >= -30 && diffDays <= -8) return "mes_passado";
  return "antigo";
};

const createEventArrangement = (eventos: AppEvent[]) => {
  const hoje = dayjs();

  const eventosHoje = eventos.filter((e) => dayjs(e.date).isSame(hoje, "day"));
  const eventosFuturos = eventos.filter((e) => dayjs(e.date).isAfter(hoje, "day"));
  const eventosPassados = eventos.filter((e) => dayjs(e.date).isBefore(hoje, "day"));

  const eventosFuturosOrdenados = eventosFuturos.sort((a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf());
  const eventosPassadosOrdenados = eventosPassados.sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf());

  return {
    temHoje: eventosHoje.length > 0,
    temPassado: eventosPassadosOrdenados.length > 0,
    temFuturo: eventosFuturosOrdenados.length > 0,
    eventoHoje: eventosHoje[0] || null,
    eventoAnterior: eventosPassadosOrdenados[0] || null,
    proximoEvento: eventosFuturosOrdenados[0] || null,
    segundoFuturo: eventosFuturosOrdenados[1] || null,
    terceiroFuturo: eventosFuturosOrdenados[2] || null,
    eventosRestantes: eventosFuturosOrdenados.slice(3),
    eventosAntigosRestantes: eventosPassadosOrdenados.slice(1),
  };
};

const getEstiloCard = (status: string, theme: any) => {
  switch (status) {
    case "hoje":
      return {
        borderLeft: "8px solid #ef4444",
        background: "linear-gradient(135deg, #fef2f2 0%, #ffffff 100%)",
        boxShadow: "0 8px 32px rgba(239, 68, 68, 0.15)",
      };
    case "amanha":
      return {
        borderLeft: "8px solid #f59e0b",
        background: "linear-gradient(135deg, #fffbeb 0%, #ffffff 100%)",
        boxShadow: "0 8px 32px rgba(245, 158, 11, 0.15)",
      };
    case "semana":
      return {
        borderLeft: `8px solid ${theme.palette.secondary.main}`,
        background: "linear-gradient(135deg, #f0f9ff 0%, #ffffff 100%)",
        boxShadow: "0 8px 32px rgba(59, 130, 246, 0.15)",
      };
    case "mes":
      return {
        borderLeft: `8px solid ${theme.palette.primary.main}`,
        background: "linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)",
        boxShadow: "0 8px 32px rgba(99, 102, 241, 0.15)",
      };
    case "futuro":
      return {
        borderLeft: "8px solid #10b981",
        background: "linear-gradient(135deg, #ecfdf5 0%, #ffffff 100%)",
        boxShadow: "0 8px 32px rgba(16, 185, 129, 0.15)",
      };
    case "ontem":
      return {
        borderLeft: "8px solid #8b5cf6",
        background: "linear-gradient(135deg, #faf5ff 0%, #ffffff 100%)",
        boxShadow: "0 8px 32px rgba(139, 92, 246, 0.15)",
      };
    case "semana_passada":
      return {
        borderLeft: "8px solid #6b7280",
        background: "linear-gradient(135deg, #f9fafb 0%, #ffffff 100%)",
        boxShadow: "0 8px 32px rgba(107, 114, 128, 0.15)",
      };
    case "mes_passado":
    case "antigo":
      return {
        borderLeft: "8px solid #9ca3af",
        background: "linear-gradient(135deg, #f3f4f6 0%, #ffffff 100%)",
        boxShadow: "0 8px 32px rgba(156, 163, 175, 0.15)",
      };
    default:
      return {
        borderLeft: "8px solid #e5e7eb",
        background: "linear-gradient(135deg, #f9fafb 0%, #ffffff 100%)",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
      };
  }
};

const getChipProps = (status: string, slotType?: string) => {
  if (slotType === "hoje") return { label: "HOJE", color: "error" as const, variant: "filled" as const };
  if (slotType === "anterior") return { label: "ANTERIOR", color: "default" as const, variant: "outlined" as const };
  if (slotType === "proximo") return { label: "PRÓXIMO", color: "secondary" as const, variant: "filled" as const };
  if (slotType === "posterior") return { label: "POSTERIOR", color: "primary" as const, variant: "filled" as const };

  switch (status) {
    case "hoje":
      return { label: "HOJE", color: "error" as const, variant: "filled" as const };
    case "amanha":
      return { label: "AMANHÃ", color: "warning" as const, variant: "filled" as const };
    case "semana":
      return { label: "ESTA SEMANA", color: "secondary" as const, variant: "filled" as const };
    case "mes":
      return { label: "ESTE MÊS", color: "primary" as const, variant: "filled" as const };
    case "futuro":
      return { label: "FUTURO", color: "success" as const, variant: "outlined" as const };
    case "ontem":
      return { label: "ONTEM", color: "secondary" as const, variant: "outlined" as const };
    case "semana_passada":
      return { label: "SEMANA PASSADA", color: "default" as const, variant: "outlined" as const };
    case "mes_passado":
      return { label: "MÊS PASSADO", color: "default" as const, variant: "outlined" as const };
    case "antigo":
      return { label: "ANTIGO", color: "default" as const, variant: "outlined" as const };
    default:
      return { label: "EVENTO", color: "default" as const, variant: "outlined" as const };
  }
};

type Props = {
  eventos: AppEvent[];
  isAdmin: boolean;
  onOpenDetails: (e: AppEvent) => void;
  onAdd: () => void;
  onEdit: (e: AppEvent) => void;
  onDelete: (e: AppEvent) => void;
};

export default function EventsCardsView({ eventos, isAdmin, onOpenDetails, onAdd, onEdit, onDelete }: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [mostrarAntigos, setMostrarAntigos] = useState(false);
  const eventosAntigosRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (mostrarAntigos && eventosAntigosRef.current) {
      setTimeout(() => eventosAntigosRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  }, [mostrarAntigos]);

  const arrangement = createEventArrangement(eventos);

  const renderCard = (evento: AppEvent, slotType?: string) => {
    const status = getEventStatus(evento.date);
    const estilo = getEstiloCard(status, theme);
    const chipProps = getChipProps(status, slotType);
    const dataFormatada = dayjs(evento.date).format("DD [de] MMMM");

    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} whileHover={{ scale: 1.02 }}>
        <Card
          elevation={0}
          sx={{
            borderRadius: 4,
            ...estilo,
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            "&:hover": { transform: "translateY(-4px)", boxShadow: "0 20px 40px rgba(0,0,0,0.1)" },
          }}
        >
          <CardContent sx={{ p: 0 }}>
            <Box
              sx={{
                height: { xs: 240, md: 320 },
                backgroundImage: evento.media?.url ? `url(${evento.media.url})` : (fallbackImageUrl ? `url('${fallbackImageUrl}')` : 'none'),
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundColor: "#000000",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                borderRadius: "16px 16px 0 0",
                overflow: "hidden",
                backgroundRepeat: "no-repeat",
              }}
            >
              <Box sx={{ position: "absolute", top: 12, right: 12 }}>
                <Chip
                  {...chipProps}
                  size="small"
                  sx={{
                    fontWeight: 700,
                    fontSize: "0.75rem",
                    backdropFilter: "blur(10px)",
                    backgroundColor: chipProps.variant === "filled" ? undefined : "rgba(255, 255, 255, 0.9)",
                  }}
                />
              </Box>
            </Box>

            <Box sx={{ p: 3 }}>
              <Typography
                variant="h6"
                fontWeight={700}
                sx={{
                  fontSize: { xs: "0.9rem", md: "1.25rem" },
                  mb: 2,
                  lineHeight: 1.3,
                  color: "#000000",
                }}
              >
                {evento.title}
              </Typography>

              <Stack spacing={1.5}>
                <Box display="flex" alignItems="center" gap={1.5}>
                  <Box sx={{ p: 0.75, borderRadius: 2, bgcolor: "#f3f4f6", display: "flex", alignItems: "center" }}>
                    <CalendarTodayIcon fontSize="small" sx={{ color: "#333333" }} />
                  </Box>
                  <Typography variant="body2" sx={{ color: "#333333", fontWeight: 500, fontSize: { xs: "0.75rem", md: "0.875rem" } }}>
                    {dataFormatada}
                  </Typography>
                </Box>

                <Box display="flex" alignItems="center" gap={1.5}>
                  <Box sx={{ p: 0.75, borderRadius: 2, bgcolor: "#f3f4f6", display: "flex", alignItems: "center" }}>
                    <PlaceIcon fontSize="small" sx={{ color: "#333333" }} />
                  </Box>
                  <Typography variant="body2" sx={{ color: "#333333", fontWeight: 500, fontSize: { xs: "0.75rem", md: "0.875rem" } }}>
                    {evento.location || "—"}
                  </Typography>
                </Box>
              </Stack>
            </Box>
          </CardContent>

          <CardActions sx={{ px: 3, pb: 3, pt: 0 }}>
            {!isAdmin ? (
              <Button
                variant="contained"
                fullWidth
                onClick={() => onOpenDetails(evento)}
                sx={{
                  borderRadius: 3,
                  py: { xs: 1, md: 1.5 },
                  fontWeight: 600,
                  textTransform: "none",
                  fontSize: { xs: "0.75rem", md: "0.95rem" },
                  backgroundColor: "#009933",
                  color: "#FFFFFF",
                  "&:hover": { backgroundColor: "#007a29", transform: "translateY(-1px)" },
                }}
              >
                Ver Detalhes
              </Button>
            ) : (
              <Stack direction="row" spacing={1} sx={{ width: "100%" }}>
                <Box sx={{ display: "flex", gap: 0.5 }}>
                  <Tooltip title="Editar">
                    <IconButton
                      onClick={() => onEdit(evento)}
                      size="small"
                      sx={{
                        bgcolor: "#f0f9ff",
                        color: "#0ea5e9",
                        "&:hover": { bgcolor: "#e0f2fe" },
                        width: { xs: 32, md: 40 },
                        height: { xs: 32, md: 40 },
                      }}
                    >
                      <EditIcon sx={{ fontSize: { xs: "1rem", md: "1.25rem" } }} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Excluir">
                    <IconButton
                      onClick={() => onDelete(evento)}
                      size="small"
                      sx={{
                        bgcolor: "#fef2f2",
                        color: "#ef4444",
                        "&:hover": { bgcolor: "#fee2e2" },
                        width: { xs: 32, md: 40 },
                        height: { xs: 32, md: 40 },
                      }}
                    >
                      <DeleteIcon sx={{ fontSize: { xs: "1rem", md: "1.25rem" } }} />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => onOpenDetails(evento)}
                  sx={{
                    borderRadius: 3,
                    py: { xs: 1, md: 1.5 },
                    fontWeight: 600,
                    textTransform: "none",
                    fontSize: { xs: "0.75rem", md: "0.95rem" },
                    backgroundColor: "#009933",
                    color: "#FFFFFF",
                    "&:hover": { backgroundColor: "#007a29", transform: "translateY(-1px)" },
                  }}
                >
                  Ver Detalhes
                </Button>
              </Stack>
            )}
          </CardActions>
        </Card>
      </motion.div>
    );
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      {isMobile && isAdmin && (
        <Box sx={{ position: "fixed", bottom: 16, right: 16, zIndex: 9999 }}>
          <Tooltip title="Adicionar Evento">
            <Fab
              color="primary"
              aria-label="adicionar"
              onClick={onAdd}
              size="medium"
              sx={{
                width: { xs: 48, md: 56 },
                height: { xs: 48, md: 56 },
                boxShadow: "0 8px 32px rgba(102, 126, 234, 0.3)",
                "&:hover": { transform: "scale(1.1)", boxShadow: "0 12px 40px rgba(102, 126, 234, 0.4)" },
                transition: "all 0.3s ease",
              }}
            >
              <AddIcon sx={{ fontSize: { xs: "1.2rem", md: "1.5rem" } }} />
            </Fab>
          </Tooltip>
        </Box>
      )}

      <Box sx={{ width: "100%", mb: 6 }}>
        {arrangement.temHoje ? (
          <Box sx={{ width: "100%" }}>
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.8, type: "spring", stiffness: 100, damping: 15 }}
              style={{ width: "100%", maxWidth: "800px", margin: "0 auto", marginBottom: "2rem" }}
            >
              <Paper
                elevation={0}
                sx={{
                  width: "100%",
                  borderRadius: 4,
                  overflow: "hidden",
                  position: "relative",
                  background: "rgba(255, 255, 255, 0.98)",
                  border: "2px solid rgba(239, 68, 68, 0.3)",
                  boxShadow: "0 24px 48px rgba(239, 68, 68, 0.2), 0 12px 24px rgba(0, 0, 0, 0.15)",
                  "&:hover": { transform: "translateY(-6px)" },
                  transition: "all 0.3s ease",
                }}
              >
                <Box sx={{ position: "absolute", top: 0, left: 0, right: 0, height: 6, background: "linear-gradient(90deg, #ef4444 0%, #dc2626 100%)" }} />
                <Box sx={{ p: 0 }}>{renderCard(arrangement.eventoHoje!, "hoje")}</Box>
              </Paper>
            </motion.div>

            {(arrangement.proximoEvento || arrangement.eventoAnterior) && (
              <Grid container spacing={{ xs: 2, md: 3 }} sx={{ justifyContent: "center" }}>
                {arrangement.proximoEvento && (
                  <Grid item xs={12} md={6}>
                    <Paper
                      elevation={0}
                      sx={{
                        borderRadius: 4,
                        overflow: "hidden",
                        position: "relative",
                        background: "rgba(255, 255, 255, 0.98)",
                        border: "1px solid rgba(59, 130, 246, 0.3)",
                        boxShadow: "0 16px 32px rgba(59, 130, 246, 0.15)",
                      }}
                    >
                      <Box sx={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: "linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)" }} />
                      <Box sx={{ p: 0 }}>{renderCard(arrangement.proximoEvento, "proximo")}</Box>
                    </Paper>
                  </Grid>
                )}

                {arrangement.eventoAnterior && (
                  <Grid item xs={12} md={6}>
                    <Paper
                      elevation={0}
                      sx={{
                        borderRadius: 4,
                        overflow: "hidden",
                        background: "rgba(255, 255, 255, 0.98)",
                        border: "1px solid rgba(156, 163, 175, 0.3)",
                        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
                      }}
                    >
                      <Box sx={{ p: 0 }}>{renderCard(arrangement.eventoAnterior, "anterior")}</Box>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            )}
          </Box>
        ) : (
          <Grid container spacing={{ xs: 2, md: 3 }} sx={{ justifyContent: "center" }}>
            {arrangement.proximoEvento && (
              <Grid item xs={12} md={6}>
                <Paper
                  elevation={0}
                  sx={{
                    borderRadius: 4,
                    overflow: "hidden",
                    position: "relative",
                    background: "rgba(255, 255, 255, 0.98)",
                    border: "1px solid rgba(59, 130, 246, 0.3)",
                    boxShadow: "0 16px 32px rgba(59, 130, 246, 0.15)",
                  }}
                >
                  <Box sx={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: "linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)" }} />
                  <Box sx={{ p: 0 }}>{renderCard(arrangement.proximoEvento, "proximo")}</Box>
                </Paper>
              </Grid>
            )}

            {arrangement.eventoAnterior && (
              <Grid item xs={12} md={6}>
                <Paper
                  elevation={0}
                  sx={{
                    borderRadius: 4,
                    overflow: "hidden",
                    background: "rgba(255, 255, 255, 0.98)",
                    border: "1px solid rgba(156, 163, 175, 0.3)",
                    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
                  }}
                >
                  <Box sx={{ p: 0 }}>{renderCard(arrangement.eventoAnterior, "anterior")}</Box>
                </Paper>
              </Grid>
            )}
          </Grid>
        )}
      </Box>

      {(arrangement.eventosRestantes.length > 0 || arrangement.segundoFuturo || arrangement.terceiroFuturo) && (
        <Accordion
          defaultExpanded
          sx={{
            mb: 4,
            borderRadius: 4,
            overflow: "hidden",
            background: "linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(255, 255, 255, 0.9) 100%)",
            backdropFilter: "blur(10px)",
            border: "2px solid rgba(16, 185, 129, 0.2)",
            "&:before": { display: "none" },
          }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ background: "linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%)" }}>
            <CalendarTodayIcon sx={{ color: "#10b981", mr: 1 }} />
            <Typography variant="h6" fontWeight={700} sx={{ color: "#065f46", fontSize: { xs: "0.9rem", md: "1.25rem" } }}>
              Mais Eventos Futuros ({arrangement.eventosRestantes.length + (arrangement.segundoFuturo ? 1 : 0) + (arrangement.terceiroFuturo ? 1 : 0)})
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 4 }}>
            <Grid container spacing={{ xs: 3, md: 4 }}>
              {arrangement.segundoFuturo && (
                <Grid item xs={12} sm={6} md={4}>
                  {renderCard(arrangement.segundoFuturo)}
                </Grid>
              )}
              {arrangement.terceiroFuturo && (
                <Grid item xs={12} sm={6} md={4}>
                  {renderCard(arrangement.terceiroFuturo)}
                </Grid>
              )}
              {arrangement.eventosRestantes.map((ev) => (
                <Grid item xs={12} sm={6} md={4} key={ev.id}>
                  {renderCard(ev)}
                </Grid>
              ))}
            </Grid>
          </AccordionDetails>
        </Accordion>
      )}

      {arrangement.eventosAntigosRestantes.length > 0 && (
        <Accordion
          ref={eventosAntigosRef}
          expanded={mostrarAntigos}
          onChange={(_, expanded) => setMostrarAntigos(expanded)}
          sx={{
            mb: 4,
            borderRadius: 4,
            overflow: "hidden",
            background: "rgba(255, 255, 255, 0.8)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            "&:before": { display: "none" },
          }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ background: gradients.subtle.greenWhiteSoft }}>
            <EventIcon color="action" style={{ marginRight: 8 }} />
            <Typography variant="h6" fontWeight={700} sx={{ color: "#1f2937", fontSize: { xs: "0.9rem", md: "1.25rem" } }}>
              Eventos Anteriores ({arrangement.eventosAntigosRestantes.length})
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 4 }}>
            <Grid container spacing={{ xs: 3, md: 4 }}>
              {arrangement.eventosAntigosRestantes.map((ev) => (
                <Grid item xs={12} sm={6} md={4} key={ev.id}>
                  {renderCard(ev)}
                </Grid>
              ))}
            </Grid>
          </AccordionDetails>
        </Accordion>
      )}

      {isAdmin && (
        <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.3 }}>
          <Fab
            onClick={onAdd}
            sx={{
              position: "fixed",
              bottom: { xs: 20, sm: 24, md: 32 },
              right: { xs: 20, sm: 24, md: 32 },
              backgroundColor: "#009933",
              color: "#FFFFFF",
              width: { xs: 52, sm: 56, md: 64 },
              height: { xs: 52, sm: 56, md: 64 },
              fontSize: { xs: "1.4rem", sm: "1.5rem", md: "1.75rem" },
              fontWeight: 900,
              boxShadow: "0 6px 20px rgba(0, 153, 51, 0.35)",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              "&:hover": {
                backgroundColor: "#007a29",
                boxShadow: "0 10px 28px rgba(0, 153, 51, 0.45)",
                transform: "scale(1.08) translateY(-2px)",
              },
              "&:active": {
                transform: "scale(0.92)",
              },
            }}
          >
            <AddIcon sx={{ fontSize: { xs: "1.6rem", sm: "1.75rem", md: "2rem" } }} />
          </Fab>
        </motion.div>
      )}
    </motion.div>
  );
}
