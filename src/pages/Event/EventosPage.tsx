import React, { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { gradients } from "@/theme";
import { extractErrorMessage } from "@/utils/apiError";
import {
  Alert,
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  CircularProgress,
} from "@mui/material";

import EventIcon from "@mui/icons-material/Event";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

import { motion } from "framer-motion";

import dayjs from "dayjs";
import "dayjs/locale/pt-br";
dayjs.locale("pt-br");

import api from "@/config/axiosConfig";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/slices";
import { setEvents } from "@/store/slices/events/eventsSlice";
import { UserRole } from "@/types/shared";

import EventDetailsModal from "./EventDetailsModal";
import EventFormModal from "./EventFormModal";
import EventsCardsView from "./EventsCardsView";
import EventsCalendarView from "./EventsCalendarView";

export type AppEvent = {
  id: string;
  title: string;
  location: string;
  date: string;
  description: string;
  media?: { url: string; originalName?: string; size?: number; createdAt?: string };
  createdAt?: string;
  updatedAt?: string;
  audience?: string;
};

type ViewMode = "cards" | "calendar";
type AddEditMode = "add" | "edit";

/**
 * O evento como a API o devolve, antes do recuo de data.
 *
 * `date` pode vir vazio em registros antigos; a tela ordena por data, então
 * cai para a data da mídia ou a de criação em vez de mostrar um vazio.
 */
type RawEvent = Omit<AppEvent, 'date'> & { date?: string | null };

const mapEventsWithFallbackDate = (raw: RawEvent[]): AppEvent[] =>
  (raw || []).map((evento) => {
    const temData = Boolean(evento.date && String(evento.date).trim());
    const recuo = evento.media?.createdAt ?? evento.createdAt ?? '';

    return {
      ...evento,
      date: temData ? String(evento.date) : recuo,
    };
  });

export default function EventosPage() {
  const dispatch = useDispatch();

  const { isAuthenticated, user } = useSelector(
    (state: RootState) => state.auth,
  );

  const isAdmin = Boolean(isAuthenticated && user?.role === UserRole.ADMIN);

  const [viewMode, setViewMode] = useState<ViewMode>("calendar");

  const [eventos, setEventosState] = useState<AppEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const [eventoSelecionado, setEventoSelecionado] = useState<AppEvent | null>(null);

  const [dialogAddEditOpen, setDialogAddEditOpen] = useState(false);
  const [dialogAddEditMode, setDialogAddEditMode] = useState<AddEditMode>("add");
  const [currentEditEvent, setCurrentEditEvent] = useState<AppEvent | undefined>(undefined);

  const [dialogDeleteOpen, setDialogDeleteOpen] = useState(false);
  const [deleteTargetEvent, setDeleteTargetEvent] = useState<AppEvent | null>(null);
  const [error, setError] = useState("");

  const fetchEventos = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/events");
      const mapped = mapEventsWithFallbackDate(res.data || []);
      dispatch(setEvents(mapped));
      setEventosState(mapped);
      setError("");
    } catch (err: unknown) {
      // Sem isto a falha virava uma agenda vazia, indistinguível de não haver
      // evento nenhum.
      setError(extractErrorMessage(err, "Erro ao carregar a agenda"));
      setEventosState([]);
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    fetchEventos();
  }, [fetchEventos]);

  const eventosOrdenados = useMemo(() => {
    return [...eventos].sort((a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf());
  }, [eventos]);

  const naoTemEventos = eventosOrdenados.length === 0;

  const openAddModal = () => {
    setDialogAddEditMode("add");
    setCurrentEditEvent(undefined);
    setDialogAddEditOpen(true);
  };

  const openEditModal = (evento: AppEvent) => {
    setDialogAddEditMode("edit");
    setCurrentEditEvent(evento);
    setDialogAddEditOpen(true);
  };

  const openDeleteModal = (evento: AppEvent) => {
    setDeleteTargetEvent(evento);
    setDialogDeleteOpen(true);
  };

  const closeDeleteModal = () => {
    setDialogDeleteOpen(false);
    setDeleteTargetEvent(null);
  };

  const confirmDelete = async () => {
    if (!deleteTargetEvent) return;
    try {
      await api.delete(`/events/${deleteTargetEvent.id}`);
      closeDeleteModal();
      await fetchEventos();
    } catch (err: unknown) {
      // O modal fica aberto: o evento continua lá, e a pessoa precisa saber.
      setError(extractErrorMessage(err, "Erro ao excluir o evento"));
    }
  };

  if (loading) {
    return (
      <Box data-testid="event-eventos-page"
        sx={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #f5f7fa 0%, #e8f5e9 50%, #ffffff 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}>
          <Paper
            elevation={8}
            sx={{
              p: 6,
              borderRadius: 4,
              textAlign: "center",
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(10px)",
            }}
          >
            <EventIcon sx={{ fontSize: 64, color: "primary.main", mb: 2 }} />
            <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>
              Carregando Eventos
            </Typography>
            <CircularProgress size={40} />
          </Paper>
        </motion.div>
      </Box>
    );
  }

  return (
    <Fragment>
      <Box data-testid="event-eventos-page" sx={{ minHeight: "100vh", background: gradients.subtle.greenWhiteSoft }}>

        <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 2.5, md: 4 }, px: { xs: 1.5, sm: 2, md: 3 } }}>
          {error ? (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
              {error}
            </Alert>
          ) : null}

          <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                justifyContent: "space-between",
                alignItems: { xs: "center", md: "flex-start" },
                gap: { xs: 1.5, sm: 2, md: 0 },
                mb: { xs: 2, sm: 2.5, md: 3 },
              }}
            >
              <Box sx={{ textAlign: { xs: "center", md: "left" } }}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: { xs: "center", md: "flex-start" }, gap: { xs: 1, sm: 1.5 }, mb: { xs: 0.5, sm: 1 } }}>
                  <EventIcon sx={{ fontSize: { xs: 18, sm: 24, md: 40 }, color: "#009933" }} />
                  <Typography
                    variant="h3"
                    fontWeight={900}
                    sx={{
                      fontSize: { xs: "0.95rem", sm: "1.35rem", md: "2.5rem" },
                      lineHeight: 1.2,
                      color: "#000000",
                    }}
                  >
                    Eventos do Clubinho
                  </Typography>
                </Box>

                <Typography
                  variant="h6"
                  sx={{
                    color: "#333333",
                    fontSize: { xs: "0.7rem", sm: "0.85rem", md: "1.1rem" },
                    fontWeight: 400,
                    lineHeight: 1.4,
                  }}
                >
                  Participe das atividades e encontros do Clubinho!
                </Typography>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  gap: { xs: 1, sm: 1.5 },
                  alignItems: "center",
                  width: { xs: "100%", md: "auto" },
                  justifyContent: { xs: "center", md: "flex-end" },
                }}
              >
                <ToggleButtonGroup
                  value={viewMode}
                  exclusive
                  onChange={(_, val) => val && setViewMode(val)}
                  sx={{
                    bgcolor: "rgba(255,255,255,0.75)",
                    borderRadius: 2.5,
                    p: 0.5,
                    backdropFilter: "blur(10px)",
                    "& .MuiToggleButton-root": {
                      border: 0,
                      borderRadius: 1.75,
                      px: { xs: 1.2, sm: 2 },
                      py: { xs: 0.5, sm: 0.75 },
                      textTransform: "none",
                      fontWeight: 700,
                      fontSize: { xs: "0.75rem", sm: "0.9rem" },
                    },
                  }}
                >
                  <ToggleButton value="cards">
                    <ViewModuleIcon fontSize="small" style={{ marginRight: 4 }} />
                    Cards
                  </ToggleButton>
                  <ToggleButton value="calendar">
                    <CalendarMonthIcon fontSize="small" style={{ marginRight: 4 }} />
                    Calendário
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>
            </Box>
          </motion.div>
        </Container>

        <Box
          sx={{
            width: "95%",
            mx: "auto",
            pb: { xs: 4, md: 6 },
            px: { xs: 0.5, md: 1 },
          }}
        >
          {viewMode === "calendar" ? (
            <EventsCalendarView
              eventos={eventosOrdenados}
              isAdmin={isAdmin}
              onOpenDetails={(e) => setEventoSelecionado(e)}
              onAdd={openAddModal}
              onEdit={openEditModal}
              onDelete={openDeleteModal}
            />
          ) : naoTemEventos ? (
            <Paper
              elevation={0}
              sx={{
                p: 6,
                textAlign: "center",
                borderRadius: 4,
                background: "rgba(255, 255, 255, 0.8)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
              }}
            >
              <EventIcon sx={{ fontSize: 80, color: "text.secondary", mb: 3, opacity: 0.6 }} />

              <Typography variant="h4" fontWeight={700} color="text.secondary" gutterBottom sx={{ mb: 2 }}>
                Nenhum evento encontrado
              </Typography>

              <Typography variant="body1" color="text.secondary" sx={{ mb: 4, opacity: 0.8 }}>
                Não há eventos cadastrados no momento. Volte em breve!
              </Typography>

              {isAdmin && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={openAddModal}
                  size="large"
                  sx={{
                    borderRadius: 3,
                    py: { xs: 1, md: 1.5 },
                    px: { xs: 2, md: 4 },
                    fontWeight: 700,
                    textTransform: "none",
                    fontSize: { xs: "0.85rem", md: "1.1rem" },
                    backgroundColor: "#009933",
                    color: "#FFFFFF",
                    "&:hover": { backgroundColor: "#007a29", transform: "translateY(-2px)" },
                    transition: "all 0.25s ease",
                  }}
                >
                  Adicionar Primeiro Evento
                </Button>
              )}
            </Paper>
          ) : (
            <EventsCardsView
              eventos={eventosOrdenados}
              isAdmin={isAdmin}
              onOpenDetails={(e) => setEventoSelecionado(e)}
              onEdit={openEditModal}
              onDelete={openDeleteModal}
              onAdd={openAddModal}
            />
          )}
        </Box>

        {eventoSelecionado && (
          <EventDetailsModal
            open={Boolean(eventoSelecionado)}
            onClose={() => setEventoSelecionado(null)}
            event={eventoSelecionado}
          />
        )}

        <EventFormModal
          open={dialogAddEditOpen}
          onClose={() => setDialogAddEditOpen(false)}
          onSuccess={fetchEventos}
          mode={dialogAddEditMode}
          initialData={currentEditEvent}
        />

        <Dialog
          open={dialogDeleteOpen}
          onClose={closeDeleteModal}
          maxWidth="xs"
          fullWidth
          sx={{
            "& .MuiDialog-paper": {
              borderRadius: 4,
              boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
              overflow: "hidden",
            },
          }}
        >
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <DialogTitle
              sx={{
                background: "linear-gradient(135deg, #fef2f2 0%, #ffffff 100%)",
                borderBottom: "1px solid #fee2e2",
                py: 3,
                textAlign: "center",
              }}
            >
              <DeleteIcon sx={{ fontSize: 48, color: "error.main", mb: 1 }} />
              <Typography variant="h6" fontWeight={800} color="error.main">
                Confirmar Exclusão
              </Typography>
            </DialogTitle>

            <DialogContent sx={{ p: 4, textAlign: "center" }}>
              <Typography variant="body1" sx={{ mb: 2, color: "#6b7280" }}>
                Tem certeza que deseja excluir este evento?
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Esta ação não pode ser desfeita.
              </Typography>
            </DialogContent>

            <DialogActions sx={{ p: 3, gap: 2 }}>
              <Button
                onClick={closeDeleteModal}
                variant="outlined"
                fullWidth
                sx={{
                  borderRadius: 3,
                  py: 1.4,
                  fontWeight: 700,
                  textTransform: "none",
                  borderColor: "#d1d5db",
                  color: "#6b7280",
                  "&:hover": { borderColor: "#9ca3af", backgroundColor: "#f9fafb" },
                }}
              >
                Cancelar
              </Button>

              <Button
                onClick={confirmDelete}
                color="error"
                variant="contained"
                fullWidth
                sx={{
                  borderRadius: 3,
                  py: 1.4,
                  fontWeight: 800,
                  textTransform: "none",
                  background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                  boxShadow: "0 4px 14px rgba(239, 68, 68, 0.4)",
                  "&:hover": {
                    background: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
                    boxShadow: "0 6px 20px rgba(239, 68, 68, 0.6)",
                    transform: "translateY(-1px)",
                  },
                  transition: "all 0.25s ease",
                }}
              >
                Excluir Evento
              </Button>
            </DialogActions>
          </motion.div>
        </Dialog>
      </Box>
    </Fragment>
  );
}
