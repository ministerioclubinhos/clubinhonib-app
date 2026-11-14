import React, { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  LinearProgress,
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

import { motion } from "framer-motion";

import dayjs from "dayjs";
import "dayjs/locale/pt-br";
dayjs.locale("pt-br");

import api from "@/config/axiosConfig";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/slices";
import { setEvents } from "@/store/slices/events/eventsSlice";
import { UserRole } from "@/types/shared";
import {
  apiListEvents,
  buildEventCalendarQuery,
  buildEventCardsQuery,
  displayDate,
  EventCardsPeriod,
  EventsViewMode,
  type AppEvent,
} from "@/features/events";

import EventDetailsModal from "./EventDetailsModal";
import EventFormModal from "./EventFormModal";
import EventsCardsView from "./EventsCardsView";
import EventsCalendarView from "./EventsCalendarView";

type AddEditMode = "add" | "edit";

/**
 * O evento como a API o devolve, antes do recuo de data.
 *
 * `date` pode vir vazio em registros antigos; a tela ordena por data, então
 * cai para a data da mídia ou a de criação em vez de mostrar um vazio.
 */
type RawEvent = Omit<AppEvent, 'date' | 'media'> & {
  date?: string | null;
  media?: AppEvent['media'] | null;
};

/**
 * Prepara os eventos para a tela.
 *
 * Além do recuo de data, um encontro de clubinho passa a mostrar a **próxima**
 * ocorrência: a API manda todas as datas da série — já limitadas ao período
 * letivo e sem os dias de exceção — e a primeira delas pode ser de meses atrás.
 */
const mapEventsForDisplay = (raw: RawEvent[]): AppEvent[] =>
  (raw || []).map((evento) => {
    const temData = Boolean(evento.date && String(evento.date).trim());
    const recuo = evento.media?.createdAt ?? evento.createdAt ?? '';
    const base = temData ? String(evento.date) : recuo;

    return {
      ...evento,
      date: displayDate({ date: base, occurrences: evento.occurrences }),
      media: evento.media ?? undefined,
    };
  });

export default function EventosPage() {
  const dispatch = useDispatch();

  const { isAuthenticated, user } = useSelector(
    (state: RootState) => state.auth,
  );

  const isAdmin = Boolean(isAuthenticated && user?.role === UserRole.ADMIN);

  const [viewMode, setViewMode] = useState(EventsViewMode.CALENDAR);
  const [cardsPeriod, setCardsPeriod] = useState(EventCardsPeriod.WEEK);
  const [calendarMonth, setCalendarMonth] = useState(dayjs().format("YYYY-MM-DD"));

  const [eventos, setEventosState] = useState<AppEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const latestRequestId = useRef(0);

  const [eventoSelecionado, setEventoSelecionado] = useState<AppEvent | null>(null);

  const [dialogAddEditOpen, setDialogAddEditOpen] = useState(false);
  const [dialogAddEditMode, setDialogAddEditMode] = useState<AddEditMode>("add");
  const [currentEditEvent, setCurrentEditEvent] = useState<AppEvent | undefined>(undefined);

  const [dialogDeleteOpen, setDialogDeleteOpen] = useState(false);
  const [deleteTargetEvent, setDeleteTargetEvent] = useState<AppEvent | null>(null);
  const [error, setError] = useState("");

  const eventQuery = useMemo(
    () =>
      viewMode === EventsViewMode.CARDS
        ? buildEventCardsQuery(cardsPeriod)
        : buildEventCalendarQuery(calendarMonth),
    [calendarMonth, cardsPeriod, viewMode],
  );

  const fetchEventos = useCallback(async () => {
    const requestId = latestRequestId.current + 1;
    latestRequestId.current = requestId;
    setLoading(true);
    try {
      const mapped = mapEventsForDisplay(await apiListEvents(eventQuery));
      if (requestId !== latestRequestId.current) return;
      dispatch(setEvents(mapped));
      setEventosState(mapped);
      setError("");
    } catch (err: unknown) {
      if (requestId !== latestRequestId.current) return;
      // Sem isto a falha virava uma agenda vazia, indistinguível de não haver
      // evento nenhum.
      setError(extractErrorMessage(err, "Erro ao carregar a agenda"));
      setEventosState([]);
    } finally {
      if (requestId === latestRequestId.current) {
        setLoading(false);
        setHasLoaded(true);
      }
    }
  }, [dispatch, eventQuery]);

  useEffect(() => {
    void fetchEventos();

    return () => {
      latestRequestId.current += 1;
    };
  }, [fetchEventos]);

  const eventosOrdenados = useMemo(() => {
    return [...eventos].sort((a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf());
  }, [eventos]);

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

  if (loading && !hasLoaded) {
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

        <Container
          maxWidth={false}
          sx={{
            width: { xs: "98%", md: "95%" },
            mx: "auto",
            py: { xs: 2, sm: 2.5, md: 4 },
            px: { xs: 1.5, sm: 2, md: 3 },
          }}
        >
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
                  data-testid="event-view-options"
                  value={viewMode}
                  exclusive
                  disabled={loading}
                  onChange={(_, nextMode: EventsViewMode | null) => {
                    if (nextMode) setViewMode(nextMode);
                  }}
                  sx={{
                    width: { xs: "100%", sm: "auto" },
                    bgcolor: "rgba(255,255,255,0.75)",
                    borderRadius: 2.5,
                    p: 0.5,
                    backdropFilter: "blur(10px)",
                    "& .MuiToggleButton-root": {
                      minHeight: 44,
                      flex: { xs: 1, sm: "initial" },
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
                  <ToggleButton
                    data-testid="event-view-cards"
                    type="button"
                    value={EventsViewMode.CARDS}
                  >
                    <ViewModuleIcon fontSize="small" style={{ marginRight: 4 }} />
                    Cards
                  </ToggleButton>
                  <ToggleButton
                    data-testid="event-view-calendar"
                    type="button"
                    value={EventsViewMode.CALENDAR}
                  >
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
            width: { xs: "98%", md: "95%" },
            mx: "auto",
            pb: { xs: 4, md: 6 },
            px: { xs: 0.5, md: 1 },
          }}
        >
          {loading ? (
            <LinearProgress
              data-testid="event-events-refreshing"
              color="success"
              aria-label="Atualizando eventos"
              sx={{ mb: 1.5, borderRadius: 999 }}
            />
          ) : null}

          <Box
            data-testid="event-events-results"
            aria-busy={loading}
            sx={{
              opacity: loading ? 0.55 : 1,
              pointerEvents: loading ? "none" : "auto",
              transition: "opacity 160ms ease",
            }}
          >
            {viewMode === EventsViewMode.CALENDAR ? (
              <EventsCalendarView
                eventos={eventosOrdenados}
                isAdmin={isAdmin}
                isLoading={loading}
                calendarMonth={calendarMonth}
                onCalendarMonthChange={setCalendarMonth}
                onOpenDetails={(e) => setEventoSelecionado(e)}
                onAdd={openAddModal}
                onEdit={openEditModal}
                onDelete={openDeleteModal}
              />
            ) : (
              <EventsCardsView
                eventos={eventosOrdenados}
                isAdmin={isAdmin}
                isLoading={loading}
                period={cardsPeriod}
                onPeriodChange={setCardsPeriod}
                onOpenDetails={(e) => setEventoSelecionado(e)}
                onEdit={openEditModal}
                onDelete={openDeleteModal}
                onAdd={openAddModal}
              />
            )}
          </Box>
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
