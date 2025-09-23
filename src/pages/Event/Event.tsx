import React, { Fragment, useEffect, useRef, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  useTheme,
  useMediaQuery,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  CircularProgress,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Fab,
  Container,
  Paper,
  Chip,
  Stack,
} from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PlaceIcon from '@mui/icons-material/Place';
import EditCalendarIcon from '@mui/icons-material/EditCalendar';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EventIcon from '@mui/icons-material/Event';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/slices';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import api from '@/config/axiosConfig';
import { setEvents } from '@/store/slices/events/eventsSlice';
import EventDetailsModal from './EventDetailsModal';
import EventFormModal from './EventFormModal';
import { UserRole } from '@/store/slices/auth/authSlice';
import { motion, AnimatePresence } from 'framer-motion';

dayjs.locale('pt-br');

// Sistema inteligente de classificação de eventos
const getEventStatus = (dateISO: string) => {
  const eventoDate = dayjs(dateISO);
  const hoje = dayjs();
  const diffDays = eventoDate.diff(hoje, 'day');

  if (eventoDate.isSame(hoje, 'day')) return 'hoje';
  if (diffDays === 1) return 'amanha';
  if (diffDays >= 2 && diffDays <= 7) return 'semana';
  if (diffDays >= 8 && diffDays <= 30) return 'mes';
  if (diffDays > 30) return 'futuro';
  if (diffDays === -1) return 'ontem';
  if (diffDays >= -7 && diffDays <= -2) return 'semana_passada';
  if (diffDays >= -30 && diffDays <= -8) return 'mes_passado';
  return 'antigo';
};

const createEventArrangement = (eventos: any[]) => {
  const hoje = dayjs();

  const eventosHoje = eventos.filter(e => dayjs(e.date).isSame(hoje, 'day'));
  const eventosFuturos = eventos.filter(e => dayjs(e.date).isAfter(hoje, 'day'));
  const eventosPassados = eventos.filter(e => dayjs(e.date).isBefore(hoje, 'day'));

  const eventosFuturosOrdenados = eventosFuturos.sort((a, b) =>
    dayjs(a.date).valueOf() - dayjs(b.date).valueOf()
  );

  const eventosPassadosOrdenados = eventosPassados.sort((a, b) =>
    dayjs(b.date).valueOf() - dayjs(a.date).valueOf()
  );

  const arrangement = {
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

  return arrangement;
};

const getLayoutConfig = (arrangement: any) => {
  const { temHoje, temPassado, temFuturo, proximoEvento, segundoFuturo, terceiroFuturo } = arrangement;

  if (temHoje) {
    if (temPassado && temFuturo) {
      return {
        type: 'today_with_past_future',
        slots: [
          { type: 'anterior', event: arrangement.eventoAnterior, label: 'Evento Anterior' },
          { type: 'hoje', event: arrangement.eventoHoje, label: 'Evento de Hoje', priority: 'high' },
          { type: 'proximo', event: proximoEvento, label: 'Próximo Evento' }
        ]
      };
    } else if (temPassado && !temFuturo) {
      return {
        type: 'today_with_past_only',
        slots: [
          { type: 'anterior', event: arrangement.eventoAnterior, label: 'Evento Anterior' },
          { type: 'hoje', event: arrangement.eventoHoje, label: 'Evento de Hoje', priority: 'high' }
        ]
      };
    } else if (!temPassado && temFuturo) {
      return {
        type: 'today_with_future_only',
        slots: [
          { type: 'hoje', event: arrangement.eventoHoje, label: 'Evento de Hoje', priority: 'high' },
          { type: 'proximo', event: proximoEvento, label: 'Próximo Evento' }
        ]
      };
    } else {
      return {
        type: 'today_only',
        slots: [
          { type: 'hoje', event: arrangement.eventoHoje, label: 'Evento de Hoje', priority: 'high' }
        ]
      };
    }
  } else {
    if (temPassado && temFuturo) {
      if (segundoFuturo) {
        return {
          type: 'no_today_with_past_two_future',
          slots: [
            { type: 'anterior', event: arrangement.eventoAnterior, label: 'Evento Anterior' },
            { type: 'proximo', event: proximoEvento, label: 'Próximo Evento' },
            { type: 'posterior', event: segundoFuturo, label: 'Evento Posterior' }
          ]
        };
      } else {
        return {
          type: 'no_today_with_past_one_future',
          slots: [
            { type: 'anterior', event: arrangement.eventoAnterior, label: 'Evento Anterior' },
            { type: 'proximo', event: proximoEvento, label: 'Próximo Evento' }
          ]
        };
      }
    } else if (!temPassado && temFuturo) {
      if (segundoFuturo && terceiroFuturo) {
        return {
          type: 'no_today_three_future',
          slots: [
            { type: 'proximo', event: proximoEvento, label: 'Próximo Evento' },
            { type: 'posterior', event: segundoFuturo, label: 'Evento Posterior' },
            { type: 'terceiro', event: terceiroFuturo, label: 'Próximo Evento' }
          ]
        };
      } else if (segundoFuturo) {
        return {
          type: 'no_today_two_future',
          slots: [
            { type: 'proximo', event: proximoEvento, label: 'Próximo Evento' },
            { type: 'posterior', event: segundoFuturo, label: 'Evento Posterior' }
          ]
        };
      } else {
        return {
          type: 'no_today_one_future',
          slots: [
            { type: 'proximo', event: proximoEvento, label: 'Próximo Evento' }
          ]
        };
      }
    } else if (temPassado && !temFuturo) {
      return {
        type: 'no_today_past_only',
        slots: [
          { type: 'anterior', event: arrangement.eventoAnterior, label: 'Evento Anterior' }
        ]
      };
    }
  }

  return {
    type: 'empty',
    slots: []
  };
};

const getEstiloCard = (status: string, theme: any) => {
  switch (status) {
    case 'hoje':
      return {
        borderLeft: '8px solid #ef4444',
        background: 'linear-gradient(135deg, #fef2f2 0%, #ffffff 100%)',
        boxShadow: '0 8px 32px rgba(239, 68, 68, 0.15)',
      };
    case 'amanha':
      return {
        borderLeft: '8px solid #f59e0b',
        background: 'linear-gradient(135deg, #fffbeb 0%, #ffffff 100%)',
        boxShadow: '0 8px 32px rgba(245, 158, 11, 0.15)',
      };
    case 'semana':
      return {
        borderLeft: `8px solid ${theme.palette.secondary.main}`,
        background: 'linear-gradient(135deg, #f0f9ff 0%, #ffffff 100%)',
        boxShadow: '0 8px 32px rgba(59, 130, 246, 0.15)',
      };
    case 'mes':
      return {
        borderLeft: `8px solid ${theme.palette.primary.main}`,
        background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
        boxShadow: '0 8px 32px rgba(99, 102, 241, 0.15)',
      };
    case 'futuro':
      return {
        borderLeft: '8px solid #10b981',
        background: 'linear-gradient(135deg, #ecfdf5 0%, #ffffff 100%)',
        boxShadow: '0 8px 32px rgba(16, 185, 129, 0.15)',
      };
    case 'ontem':
      return {
        borderLeft: '8px solid #8b5cf6',
        background: 'linear-gradient(135deg, #faf5ff 0%, #ffffff 100%)',
        boxShadow: '0 8px 32px rgba(139, 92, 246, 0.15)',
      };
    case 'semana_passada':
      return {
        borderLeft: '8px solid #6b7280',
        background: 'linear-gradient(135deg, #f9fafb 0%, #ffffff 100%)',
        boxShadow: '0 8px 32px rgba(107, 114, 128, 0.15)',
      };
    case 'mes_passado':
    case 'antigo':
      return {
        borderLeft: '8px solid #9ca3af',
        background: 'linear-gradient(135deg, #f3f4f6 0%, #ffffff 100%)',
        boxShadow: '0 8px 32px rgba(156, 163, 175, 0.15)',
      };
    default:
      return {
        borderLeft: '8px solid #e5e7eb',
        background: 'linear-gradient(135deg, #f9fafb 0%, #ffffff 100%)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
      };
  }
};

const getChipProps = (status: string, slotType?: string) => {
  if (slotType === 'hoje') {
    return { label: 'HOJE', color: 'error' as const, variant: 'filled' as const };
  }
  if (slotType === 'anterior') {
    return { label: 'ANTERIOR', color: 'default' as const, variant: 'outlined' as const };
  }
  if (slotType === 'proximo') {
    return { label: 'PRÓXIMO', color: 'secondary' as const, variant: 'filled' as const };
  }
  if (slotType === 'posterior') {
    return { label: 'POSTERIOR', color: 'primary' as const, variant: 'filled' as const };
  }

  switch (status) {
    case 'hoje':
      return { label: 'HOJE', color: 'error' as const, variant: 'filled' as const };
    case 'amanha':
      return { label: 'AMANHÃ', color: 'warning' as const, variant: 'filled' as const };
    case 'semana':
      return { label: 'ESTA SEMANA', color: 'secondary' as const, variant: 'filled' as const };
    case 'mes':
      return { label: 'ESTE MÊS', color: 'primary' as const, variant: 'filled' as const };
    case 'futuro':
      return { label: 'FUTURO', color: 'success' as const, variant: 'outlined' as const };
    case 'ontem':
      return { label: 'ONTEM', color: 'secondary' as const, variant: 'outlined' as const };
    case 'semana_passada':
      return { label: 'SEMANA PASSADA', color: 'default' as const, variant: 'outlined' as const };
    case 'mes_passado':
      return { label: 'MÊS PASSADO', color: 'default' as const, variant: 'outlined' as const };
    case 'antigo':
      return { label: 'ANTIGO', color: 'default' as const, variant: 'outlined' as const };
    default:
      return { label: 'EVENTO', color: 'default' as const, variant: 'outlined' as const };
  }
};

const Eventos: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const dispatch = useDispatch();

  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth) as any;
  const isAdmin = isAuthenticated && user?.role === UserRole.ADMIN;

  const hoje = dayjs();
  const [eventos, setEventos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mostrarAntigos, setMostrarAntigos] = useState(false);
  const [eventoSelecionado, setEventoSelecionado] = useState<any | null>(null);
  const [editMode, setEditMode] = useState(false);

  const [dialogAddEditOpen, setDialogAddEditOpen] = useState(false);
  const [dialogAddEditMode, setDialogAddEditMode] = useState<'add' | 'edit'>('add');
  const [currentEditEvent, setCurrentEditEvent] = useState<any | null>(null);

  const [dialogDeleteOpen, setDialogDeleteOpen] = useState(false);
  const [deleteTargetEvent, setDeleteTargetEvent] = useState<any | null>(null);

  const eventosAntigosRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchEventos = async () => {
      try {
        const response = await api.get('/events');
        dispatch(setEvents(response.data));
        setEventos(response.data);
      } catch (error) {
        console.error('Erro ao carregar eventos:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEventos();
  }, [dispatch]);

  useEffect(() => {
    if (mostrarAntigos && eventosAntigosRef.current) {
      setTimeout(() => {
        eventosAntigosRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [mostrarAntigos]);

  const handleEnterEditMode = () => setEditMode(true);
  const handleCancelEditMode = () => setEditMode(false);

  const eventosOrdenados = [...eventos].sort(
    (a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf()
  );

  const arrangement = createEventArrangement(eventosOrdenados);
  const layoutConfig = getLayoutConfig(arrangement);

  const handleAddNewEvent = () => {
    setDialogAddEditMode('add');
    setCurrentEditEvent(null);
    setDialogAddEditOpen(true);
  };

  const handleEditEvent = (evento: any) => {
    setDialogAddEditMode('edit');
    setCurrentEditEvent(evento);
    setDialogAddEditOpen(true);
  };

  const handleDeleteEvent = (evento: any) => {
    setDeleteTargetEvent(evento);
    setDialogDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetEvent) return;
    try {
      await api.delete(`/events/${deleteTargetEvent.id}`);
      setDialogDeleteOpen(false);
      setDeleteTargetEvent(null);
      await reloadEventsAndLeaveEditMode();
    } catch (error) {
      console.error('Erro ao deletar evento:', error);
    }
  };

  const handleCloseDelete = () => {
    setDialogDeleteOpen(false);
    setDeleteTargetEvent(null);
  };

  const reloadEventsAndLeaveEditMode = async () => {
    setLoading(true);
    try {
      const response = await api.get('/events');
      dispatch(setEvents(response.data));
      setEventos(response.data);
    } catch (err) {
      console.error('Erro ao recarregar eventos:', err);
    } finally {
      setLoading(false);
      setEditMode(false);
    }
  };

  const renderCard = (evento: any, slotType?: string) => {
    const status = getEventStatus(evento.date);
    const estilo = getEstiloCard(status, theme);
    const chipProps = getChipProps(status, slotType);
    const dataFormatada = dayjs(evento.date).format('DD [de] MMMM');

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        whileHover={{ scale: 1.02 }}
      >
        <Card
          elevation={0}
          sx={{
            borderRadius: 4,
            ...estilo,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            },
          }}
        >
          <CardContent sx={{ p: 0 }}>
            <Box
              sx={{
                height: { xs: 240, md: 320 },
                backgroundImage: evento.media ? `url(${evento.media.url})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundColor: evento.media ? 'transparent' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                borderRadius: '16px 16px 0 0',
                overflow: 'hidden',
              }}
            >
              {!evento.media && (
                <Box sx={{ textAlign: 'center', color: 'white' }}>
                  <EventIcon sx={{ fontSize: 48, mb: 1, opacity: 0.7 }} />
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Imagem do Evento
                  </Typography>
                </Box>
              )}

              <Box sx={{ position: 'absolute', top: 12, right: 12 }}>
                <Chip
                  {...chipProps}
                  size="small"
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    backdropFilter: 'blur(10px)',
                    backgroundColor: chipProps.variant === 'filled' ? undefined : 'rgba(255, 255, 255, 0.9)',
                  }}
                />
              </Box>
            </Box>

            <Box sx={{ p: 3 }}>
              <Typography
                variant="h6"
                fontWeight={700}
                sx={{
                  fontSize: { xs: '0.9rem', md: '1.25rem' },
                  mb: 2,
                  lineHeight: 1.3,
                  color: '#1f2937',
                }}
              >
                {evento.title}
              </Typography>

              <Stack spacing={1.5}>
                <Box display="flex" alignItems="center" gap={1.5}>
                  <Box
                    sx={{
                      p: 0.75,
                      borderRadius: 2,
                      bgcolor: '#f3f4f6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <CalendarTodayIcon fontSize="small" sx={{ color: '#6b7280' }} />
                  </Box>
                  <Typography variant="body2" sx={{ color: '#6b7280', fontWeight: 500, fontSize: { xs: '0.75rem', md: '0.875rem' } }}>
                    {dataFormatada}
                  </Typography>
                </Box>

                <Box display="flex" alignItems="center" gap={1.5}>
                  <Box
                    sx={{
                      p: 0.75,
                      borderRadius: 2,
                      bgcolor: '#f3f4f6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <PlaceIcon fontSize="small" sx={{ color: '#6b7280' }} />
                  </Box>
                  <Typography variant="body2" sx={{ color: '#6b7280', fontWeight: 500, fontSize: { xs: '0.75rem', md: '0.875rem' } }}>
                    {evento.location}
                  </Typography>
                </Box>
              </Stack>
            </Box>
          </CardContent>

          <CardActions sx={{ px: 3, pb: 3, pt: 0 }}>
            {!editMode ? (
              <Button
                variant="contained"
                fullWidth
                onClick={() => setEventoSelecionado(evento)}
                sx={{
                  borderRadius: 3,
                  py: { xs: 1, md: 1.5 },
                  fontWeight: 600,
                  textTransform: 'none',
                  fontSize: { xs: '0.75rem', md: '0.95rem' },
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  boxShadow: '0 4px 14px rgba(102, 126, 234, 0.4)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                    boxShadow: '0 6px 20px rgba(102, 126, 234, 0.6)',
                  },
                }}
              >
                Ver Detalhes
              </Button>
            ) : (
              <Stack direction="row" spacing={1} sx={{ width: '100%' }}>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <Tooltip title="Editar">
                    <IconButton
                      onClick={() => handleEditEvent(evento)}
                      size="small"
                      sx={{
                        bgcolor: '#f0f9ff',
                        color: '#0ea5e9',
                        '&:hover': { bgcolor: '#e0f2fe' },
                        width: { xs: 32, md: 40 },
                        height: { xs: 32, md: 40 },
                      }}
                    >
                      <EditIcon sx={{ fontSize: { xs: '1rem', md: '1.25rem' } }} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Excluir">
                    <IconButton
                      onClick={() => handleDeleteEvent(evento)}
                      size="small"
                      sx={{
                        bgcolor: '#fef2f2',
                        color: '#ef4444',
                        '&:hover': { bgcolor: '#fee2e2' },
                        width: { xs: 32, md: 40 },
                        height: { xs: 32, md: 40 },
                      }}
                    >
                      <DeleteIcon sx={{ fontSize: { xs: '1rem', md: '1.25rem' } }} />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => setEventoSelecionado(evento)}
                  sx={{
                    borderRadius: 3,
                    py: { xs: 1, md: 1.5 },
                    fontWeight: 600,
                    textTransform: 'none',
                    fontSize: { xs: '0.75rem', md: '0.95rem' },
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    boxShadow: '0 4px 14px rgba(102, 126, 234, 0.4)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                      boxShadow: '0 6px 20px rgba(102, 126, 234, 0.6)',
                    },
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

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Paper
            elevation={8}
            sx={{
              p: 6,
              borderRadius: 4,
              textAlign: 'center',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <EventIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
            <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>
              Carregando Eventos
            </Typography>
            <CircularProgress size={40} />
          </Paper>
        </motion.div>
      </Box>
    );
  }

  const naoTemEventos = !eventos.length;

  return (
    <Fragment>
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        }}
      >
        {/* Header com gradiente */}
        <Paper
          elevation={0}
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            borderRadius: 0,
            py: { xs: 4, md: 6 },
            px: { xs: 2, md: 4 },
          }}
        >
          <Container maxWidth="lg">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', md: 'row' },
                  justifyContent: 'space-between',
                  alignItems: { xs: 'center', md: 'flex-start' },
                  gap: { xs: 3, md: 0 },
                }}
              >
                <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                  <Typography
                    variant="h3"
                    fontWeight={800}
                    sx={{
                      fontSize: { xs: '1.3rem', md: '2.5rem' },
                      mb: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: { xs: 'center', md: 'flex-start' },
                      gap: 2,
                    }}
                  >
                    <EventIcon sx={{ fontSize: { xs: 24, md: 40 } }} />
                    Eventos do Clubinho
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      opacity: 0.9,
                      fontSize: { xs: '0.8rem', md: '1.1rem' },
                      fontWeight: 400,
                    }}
                  >
                    Participe das atividades e encontros do Clubinho!
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    gap: 2,
                    alignItems: 'center',
                  }}
                >
                  {isAdmin && (
                    <Fragment>
                      {!editMode ? (
                        <Button
                          variant="contained"
                          startIcon={<EditCalendarIcon />}
                          onClick={handleEnterEditMode}
                          sx={{
                            borderRadius: 3,
                            py: { xs: 1, md: 1.5 },
                            px: { xs: 2, md: 3 },
                            fontWeight: 600,
                            textTransform: 'none',
                            fontSize: { xs: '0.8rem', md: '1rem' },
                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            '&:hover': {
                              backgroundColor: 'rgba(255, 255, 255, 0.3)',
                              transform: 'translateY(-2px)',
                            },
                            transition: 'all 0.3s ease',
                          }}
                        >
                          Editar Página
                        </Button>
                      ) : (
                        <Fragment>
                          <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={handleAddNewEvent}
                            sx={{
                              borderRadius: 3,
                              py: { xs: 1, md: 1.5 },
                              px: { xs: 2, md: 3 },
                              fontWeight: 600,
                              textTransform: 'none',
                              fontSize: { xs: '0.8rem', md: '1rem' },
                              backgroundColor: 'rgba(255, 255, 255, 0.2)',
                              border: '1px solid rgba(255, 255, 255, 0.3)',
                              '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                                transform: 'translateY(-2px)',
                              },
                              transition: 'all 0.3s ease',
                            }}
                          >
                            Adicionar Evento
                          </Button>
                          <Button
                            variant="outlined"
                            onClick={handleCancelEditMode}
                            sx={{
                              borderRadius: 3,
                              py: { xs: 1, md: 1.5 },
                              px: { xs: 2, md: 3 },
                              fontWeight: 600,
                              textTransform: 'none',
                              fontSize: { xs: '0.8rem', md: '1rem' },
                              color: 'white',
                              borderColor: 'rgba(255, 255, 255, 0.5)',
                              '&:hover': {
                                borderColor: 'white',
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                transform: 'translateY(-2px)',
                              },
                              transition: 'all 0.3s ease',
                            }}
                          >
                            Cancelar
                          </Button>
                        </Fragment>
                      )}
                    </Fragment>
                  )}

                  {arrangement.eventosAntigosRestantes.length > 0 && (
                    <Button
                      variant="text"
                      onClick={() => setMostrarAntigos(!mostrarAntigos)}
                      sx={{
                        color: 'white',
                        fontWeight: 600,
                        textTransform: 'none',
                        fontSize: { xs: '0.8rem', md: '0.95rem' },
                        py: { xs: 0.5, md: 1 },
                        px: { xs: 1, md: 2 },
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        },
                      }}
                    >
                      {mostrarAntigos ? 'Esconder Eventos Antigos' : `Ver ${arrangement.eventosAntigosRestantes.length} Eventos Antigos`}
                    </Button>
                  )}
                </Box>
              </Box>
            </motion.div>
          </Container>
        </Paper>

        <Box sx={{
          width: '95%',
          maxWidth: '1600px',
          mx: 'auto',
          py: { xs: 4, md: 6 },
          px: { xs: 0.5, md: 1 }
        }}>
          {naoTemEventos ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Paper
                elevation={0}
                sx={{
                  p: 6,
                  textAlign: 'center',
                  borderRadius: 4,
                  background: 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                }}
              >
                <EventIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 3, opacity: 0.6 }} />
                <Typography
                  variant="h4"
                  fontWeight={600}
                  color="text.secondary"
                  gutterBottom
                  sx={{ mb: 2 }}
                >
                  Nenhum evento encontrado
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ mb: 4, opacity: 0.8 }}
                >
                  Não há eventos cadastrados no momento. Volte em breve!
                </Typography>
                {isAdmin && (
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleAddNewEvent}
                    size="large"
                        sx={{
                          borderRadius: 3,
                          py: { xs: 1, md: 1.5 },
                          px: { xs: 2, md: 4 },
                          fontWeight: 600,
                          textTransform: 'none',
                          fontSize: { xs: '0.8rem', md: '1.1rem' },
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                        boxShadow: '0 12px 40px rgba(102, 126, 234, 0.4)',
                        transform: 'translateY(-2px)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    Adicionar Primeiro Evento
                  </Button>
                )}
              </Paper>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {/* FABs para Mobile */}
              {isMobile && isAdmin && (
                <Box
                  sx={{
                    position: 'fixed',
                    bottom: 16,
                    right: 16,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                    zIndex: 9999,
                  }}
                >
                  <AnimatePresence>
                    {!editMode ? (
                      <motion.div
                        key="edit-fab"
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: 180 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Tooltip title="Editar Página">
                          <Fab
                            color="warning"
                            aria-label="editar"
                            onClick={handleEnterEditMode}
                            size="medium"
                            sx={{
                              width: { xs: 48, md: 56 },
                              height: { xs: 48, md: 56 },
                              boxShadow: '0 8px 32px rgba(251, 146, 60, 0.3)',
                              '&:hover': {
                                transform: 'scale(1.1)',
                                boxShadow: '0 12px 40px rgba(251, 146, 60, 0.4)',
                              },
                              transition: 'all 0.3s ease',
                            }}
                          >
                            <EditCalendarIcon sx={{ fontSize: { xs: '1.2rem', md: '1.5rem' } }} />
                          </Fab>
                        </Tooltip>
                      </motion.div>
                    ) : (
                      <Fragment>
                        <motion.div
                          key="add-fab"
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ duration: 0.3, delay: 0.1 }}
                        >
                          <Tooltip title="Adicionar Evento">
                            <Fab
                              color="primary"
                              aria-label="adicionar"
                              onClick={handleAddNewEvent}
                              size="medium"
                              sx={{
                                width: { xs: 48, md: 56 },
                                height: { xs: 48, md: 56 },
                                boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
                                '&:hover': {
                                  transform: 'scale(1.1)',
                                  boxShadow: '0 12px 40px rgba(102, 126, 234, 0.4)',
                                },
                                transition: 'all 0.3s ease',
                              }}
                            >
                              <AddIcon sx={{ fontSize: { xs: '1.2rem', md: '1.5rem' } }} />
                            </Fab>
                          </Tooltip>
                        </motion.div>
                        <motion.div
                          key="cancel-fab"
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ duration: 0.3, delay: 0.2 }}
                        >
                          <Tooltip title="Cancelar">
                            <Fab
                              color="default"
                              aria-label="cancelar"
                              onClick={handleCancelEditMode}
                              size="medium"
                              sx={{
                                width: { xs: 48, md: 56 },
                                height: { xs: 48, md: 56 },
                                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
                                '&:hover': {
                                  transform: 'scale(1.1)',
                                  boxShadow: '0 12px 40px rgba(0, 0, 0, 0.2)',
                                },
                                transition: 'all 0.3s ease',
                              }}
                            >
                              <CloseIcon sx={{ fontSize: { xs: '1.2rem', md: '1.5rem' } }} />
                            </Fab>
                          </Tooltip>
                        </motion.div>
                      </Fragment>
                    )}
                  </AnimatePresence>
                </Box>
              )}

              {/* Layout Principal - Eventos Principais */}
              <Box sx={{ width: '100%', mb: 6 }}>
                {/* Layout quando tem evento hoje */}
                {arrangement.temHoje ? (
                  <Box sx={{ width: '100%' }}>
                    {/* Evento Hoje - Destacado Sozinho */}
                    <motion.div
                      initial={{ opacity: 0, y: 30, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{
                        duration: 0.8,
                        type: "spring",
                        stiffness: 100,
                        damping: 15
                      }}
                      style={{ width: '100%', maxWidth: '800px', margin: '0 auto', marginBottom: '2rem' }}
                    >
                      <Paper
                        elevation={0}
                        sx={{
                          width: '100%',
                          borderRadius: 4,
                          overflow: 'hidden',
                          position: 'relative',
                          background: 'rgba(255, 255, 255, 0.98)',
                          border: '2px solid rgba(239, 68, 68, 0.3)',
                          boxShadow: '0 24px 48px rgba(239, 68, 68, 0.2), 0 12px 24px rgba(0, 0, 0, 0.15)',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          '&:hover': {
                            transform: 'translateY(-6px)',
                            boxShadow: '0 32px 64px rgba(239, 68, 68, 0.25), 0 16px 32px rgba(0, 0, 0, 0.2)',
                          },
                        }}
                      >
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: 6,
                            background: 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)',
                            zIndex: 2,
                          }}
                        />

                        <Box sx={{ p: 0 }}>
                          {renderCard(arrangement.eventoHoje, 'hoje')}
                        </Box>
                      </Paper>
                    </motion.div>

                    {(arrangement.proximoEvento || arrangement.eventoAnterior) && (
                      <Grid container spacing={{ xs: 2, md: 3 }} sx={{ justifyContent: 'center' }}>
                        {arrangement.proximoEvento && (
                          <Grid item xs={12} md={6}>
                            <motion.div
                              initial={{ opacity: 0, y: 30, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              transition={{
                                duration: 0.6,
                                delay: 0.3,
                                type: "spring",
                                stiffness: 100,
                                damping: 15
                              }}
                              style={{ width: '100%' }}
                            >
                              <Paper
                                elevation={0}
                                sx={{
                                  width: '100%',
                                  height: '100%',
                                  borderRadius: 4,
                                  overflow: 'hidden',
                                  position: 'relative',
                                  background: 'rgba(255, 255, 255, 0.98)',
                                  border: '1px solid rgba(59, 130, 246, 0.3)',
                                  boxShadow: '0 16px 32px rgba(59, 130, 246, 0.15), 0 8px 16px rgba(0, 0, 0, 0.1)',
                                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                  '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: '0 20px 40px rgba(59, 130, 246, 0.2), 0 12px 24px rgba(0, 0, 0, 0.15)',
                                  },
                                }}
                              >
                                {/* Barra de Status Superior - Próximo */}
                                <Box
                                  sx={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    height: 4,
                                    background: 'linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)',
                                    zIndex: 2,
                                  }}
                                />

                                <Box sx={{ p: 0 }}>
                                  {renderCard(arrangement.proximoEvento, 'proximo')}
                                </Box>
                              </Paper>
                            </motion.div>
                          </Grid>
                        )}

                        {arrangement.eventoAnterior && (
                          <Grid item xs={12} md={6}>
                            <motion.div
                              initial={{ opacity: 0, y: 30, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              transition={{
                                duration: 0.6,
                                delay: 0.4,
                                type: "spring",
                                stiffness: 100,
                                damping: 15
                              }}
                              style={{ width: '100%' }}
                            >
                              <Paper
                                elevation={0}
                                sx={{
                                  width: '100%',
                                  height: '100%',
                                  borderRadius: 4,
                                  overflow: 'hidden',
                                  position: 'relative',
                                  background: 'rgba(255, 255, 255, 0.98)',
                                  border: '1px solid rgba(156, 163, 175, 0.3)',
                                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
                                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                  '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: '0 12px 32px rgba(0, 0, 0, 0.12)',
                                  },
                                }}
                              >
                                <Box sx={{ p: 0 }}>
                                  {renderCard(arrangement.eventoAnterior, 'anterior')}
                                </Box>
                              </Paper>
                            </motion.div>
                          </Grid>
                        )}
                      </Grid>
                    )}
                  </Box>
                ) : (
                  <Grid container spacing={{ xs: 2, md: 3 }} sx={{ justifyContent: 'center' }}>
                    {arrangement.proximoEvento && (
                      <Grid item xs={12} md={6}>
                        <motion.div
                          initial={{ opacity: 0, y: 30, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{
                            duration: 0.6,
                            delay: 0.1,
                            type: "spring",
                            stiffness: 100,
                            damping: 15
                          }}
                          style={{ width: '100%' }}
                        >
                          <Paper
                            elevation={0}
                            sx={{
                              width: '100%',
                              height: '100%',
                              borderRadius: 4,
                              overflow: 'hidden',
                              position: 'relative',
                              background: 'rgba(255, 255, 255, 0.98)',
                              border: '1px solid rgba(59, 130, 246, 0.3)',
                              boxShadow: '0 16px 32px rgba(59, 130, 246, 0.15), 0 8px 16px rgba(0, 0, 0, 0.1)',
                              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                              '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: '0 20px 40px rgba(59, 130, 246, 0.2), 0 12px 24px rgba(0, 0, 0, 0.15)',
                              },
                            }}
                          >
                            <Box
                              sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                height: 4,
                                background: 'linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)',
                                zIndex: 2,
                              }}
                            />

                            <Box sx={{ p: 0 }}>
                              {renderCard(arrangement.proximoEvento, 'proximo')}
                            </Box>
                          </Paper>
                        </motion.div>
                      </Grid>
                    )}

                    {arrangement.eventoAnterior && (
                      <Grid item xs={12} md={6}>
                        <motion.div
                          initial={{ opacity: 0, y: 30, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{
                            duration: 0.6,
                            delay: 0.2,
                            type: "spring",
                            stiffness: 100,
                            damping: 15
                          }}
                          style={{ width: '100%' }}
                        >
                          <Paper
                            elevation={0}
                            sx={{
                              width: '100%',
                              height: '100%',
                              borderRadius: 4,
                              overflow: 'hidden',
                              position: 'relative',
                              background: 'rgba(255, 255, 255, 0.98)',
                              border: '1px solid rgba(156, 163, 175, 0.3)',
                              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
                              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                              '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: '0 12px 32px rgba(0, 0, 0, 0.12)',
                              },
                            }}
                          >
                            <Box sx={{ p: 0 }}>
                              {renderCard(arrangement.eventoAnterior, 'anterior')}
                            </Box>
                          </Paper>
                        </motion.div>
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
                    overflow: 'hidden',
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(255, 255, 255, 0.9) 100%)',
                    backdropFilter: 'blur(10px)',
                    border: '2px solid rgba(16, 185, 129, 0.2)',
                    '&:before': { display: 'none' },
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    sx={{
                      background: 'linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%)',
                      '& .MuiAccordionSummary-content': {
                        alignItems: 'center',
                        gap: 2,
                      },
                    }}
                  >
                    <CalendarTodayIcon sx={{ color: '#10b981' }} />
                    <Typography
                      variant="h6"
                      fontWeight={700}
                      sx={{ color: '#065f46', fontSize: { xs: '0.9rem', md: '1.25rem' } }}
                    >
                      Mais Eventos Futuros ({arrangement.eventosRestantes.length + (arrangement.segundoFuturo ? 1 : 0) + (arrangement.terceiroFuturo ? 1 : 0)})
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ p: 4 }}>
                    <Grid container spacing={{ xs: 3, md: 4 }}>
                      {arrangement.segundoFuturo && (
                        <Grid item xs={12} sm={6} md={4}>
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0 }}
                          >
                            {renderCard(arrangement.segundoFuturo)}
                          </motion.div>
                        </Grid>
                      )}

                      {arrangement.terceiroFuturo && (
                        <Grid item xs={12} sm={6} md={4}>
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                          >
                            {renderCard(arrangement.terceiroFuturo)}
                          </motion.div>
                        </Grid>
                      )}

                      {arrangement.eventosRestantes.map((evento, index) => (
                        <Grid item xs={12} sm={6} md={4} key={evento.id}>
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: (index + 2) * 0.1 }}
                          >
                            {renderCard(evento)}
                          </motion.div>
                        </Grid>
                      ))}
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              )}

              {!arrangement.temFuturo && arrangement.eventosRestantes.length === 0 && (
                <Paper
                  elevation={0}
                  sx={{
                    p: { xs: 3, md: 4 },
                    borderRadius: 4,
                    background: 'linear-gradient(135deg, rgba(156, 163, 175, 0.05) 0%, rgba(255, 255, 255, 0.9) 100%)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(156, 163, 175, 0.2)',
                    mb: 4,
                    textAlign: 'center',
                  }}
                >
                  <EventIcon sx={{ fontSize: 48, color: '#9ca3af', mb: 2 }} />
                  <Typography variant="h6" fontWeight={600} color="text.secondary" gutterBottom>
                    Nenhum Evento Futuro
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Não há eventos programados para o futuro no momento.
                  </Typography>
                </Paper>
              )}

              {arrangement.temFuturo && arrangement.eventosRestantes.length > 5 && (
                <Accordion
                  defaultExpanded={false}
                  sx={{
                    mb: 4,
                    borderRadius: 4,
                    overflow: 'hidden',
                    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(255, 255, 255, 0.9) 100%)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(99, 102, 241, 0.2)',
                    '&:before': { display: 'none' },
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    sx={{
                      background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                      '& .MuiAccordionSummary-content': {
                        alignItems: 'center',
                        gap: 2,
                      },
                    }}
                  >
                    <CalendarTodayIcon sx={{ color: '#6366f1' }} />
                    <Typography
                      variant="h6"
                      fontWeight={700}
                      sx={{ color: '#3730a3', fontSize: { xs: '0.9rem', md: '1.25rem' } }}
                    >
                      🗓️ Todos os Eventos Futuros ({arrangement.eventosRestantes.length + (arrangement.proximoEvento ? 1 : 0) + (arrangement.segundoFuturo ? 1 : 0) + (arrangement.terceiroFuturo ? 1 : 0)})
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ p: 4 }}>
                    <Grid container spacing={{ xs: 3, md: 4 }}>
                      {/* Mostrar todos os eventos futuros */}
                      {arrangement.proximoEvento && (
                        <Grid item xs={12} sm={6} md={4} key={`proximo-${arrangement.proximoEvento.id}`}>
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0 }}
                          >
                            {renderCard(arrangement.proximoEvento, 'proximo')}
                          </motion.div>
                        </Grid>
                      )}
                      {arrangement.segundoFuturo && (
                        <Grid item xs={12} sm={6} md={4} key={`segundo-${arrangement.segundoFuturo.id}`}>
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                          >
                            {renderCard(arrangement.segundoFuturo, 'posterior')}
                          </motion.div>
                        </Grid>
                      )}
                      {arrangement.terceiroFuturo && (
                        <Grid item xs={12} sm={6} md={4} key={`terceiro-${arrangement.terceiroFuturo.id}`}>
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                          >
                            {renderCard(arrangement.terceiroFuturo, 'terceiro')}
                          </motion.div>
                        </Grid>
                      )}
                      {arrangement.eventosRestantes.map((evento, index) => (
                        <Grid item xs={12} sm={6} md={4} key={evento.id}>
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: (index + 3) * 0.1 }}
                          >
                            {renderCard(evento)}
                          </motion.div>
                        </Grid>
                      ))}
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              )}

              {mostrarAntigos && arrangement.eventosAntigosRestantes.length > 0 && (
                <Accordion
                  ref={eventosAntigosRef}
                  sx={{
                    mb: 4,
                    borderRadius: 4,
                    overflow: 'hidden',
                    background: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    '&:before': { display: 'none' },
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    sx={{
                      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                      '& .MuiAccordionSummary-content': {
                        alignItems: 'center',
                        gap: 2,
                      },
                    }}
                  >
                    <EventIcon color="action" />
                    <Typography
                      variant="h6"
                      fontWeight={700}
                      sx={{ color: '#1f2937', fontSize: { xs: '0.9rem', md: '1.25rem' } }}
                    >
                      Eventos Anteriores ({arrangement.eventosAntigosRestantes.length})
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ p: 4 }}>
                    <Grid container spacing={{ xs: 3, md: 4 }}>
                      {arrangement.eventosAntigosRestantes.map((evento, index) => (
                        <Grid item xs={12} sm={6} md={4} key={evento.id}>
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                          >
                            {renderCard(evento)}
                          </motion.div>
                        </Grid>
                      ))}
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              )}
            </motion.div>
          )}
        </Box>
        {eventoSelecionado && (
          <EventDetailsModal
            open={!!eventoSelecionado}
            onClose={() => setEventoSelecionado(null)}
            event={eventoSelecionado}
          />
        )}

        <EventFormModal
          open={dialogAddEditOpen}
          onClose={() => setDialogAddEditOpen(false)}
          onSuccess={reloadEventsAndLeaveEditMode}
          mode={dialogAddEditMode}
          initialData={currentEditEvent}
        />

        <Dialog
          open={dialogDeleteOpen}
          onClose={handleCloseDelete}
          maxWidth="xs"
          fullWidth
          sx={{
            '& .MuiDialog-paper': {
              borderRadius: 4,
              boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
              overflow: 'hidden',
            },
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <DialogTitle
              sx={{
                background: 'linear-gradient(135deg, #fef2f2 0%, #ffffff 100%)',
                borderBottom: '1px solid #fee2e2',
                py: 3,
                textAlign: 'center',
              }}
            >
              <DeleteIcon sx={{ fontSize: 48, color: 'error.main', mb: 1 }} />
              <Typography variant="h6" fontWeight={700} color="error.main">
                Confirmar Exclusão
              </Typography>
            </DialogTitle>
            <DialogContent sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body1" sx={{ mb: 2, color: '#6b7280' }}>
                Tem certeza que deseja excluir este evento?
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Esta ação não pode ser desfeita.
              </Typography>
            </DialogContent>
            <DialogActions sx={{ p: 3, gap: 2 }}>
              <Button
                onClick={handleCloseDelete}
                variant="outlined"
                fullWidth
                sx={{
                  borderRadius: 3,
                  py: 1.5,
                  fontWeight: 600,
                  textTransform: 'none',
                  borderColor: '#d1d5db',
                  color: '#6b7280',
                  '&:hover': {
                    borderColor: '#9ca3af',
                    backgroundColor: '#f9fafb',
                  },
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleConfirmDelete}
                color="error"
                variant="contained"
                fullWidth
                sx={{
                  borderRadius: 3,
                  py: 1.5,
                  fontWeight: 600,
                  textTransform: 'none',
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  boxShadow: '0 4px 14px rgba(239, 68, 68, 0.4)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                    boxShadow: '0 6px 20px rgba(239, 68, 68, 0.6)',
                    transform: 'translateY(-1px)',
                  },
                  transition: 'all 0.3s ease',
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
};

export default Eventos;
