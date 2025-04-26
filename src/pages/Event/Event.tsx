import React, { useEffect, useRef, useState } from 'react';
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
  TextField,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Fab,
} from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PlaceIcon from '@mui/icons-material/Place';
import EditCalendarIcon from '@mui/icons-material/EditCalendar';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/slices';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import api from '../../config/axiosConfig';
import { setEvents } from '../../store/slices/events/eventsSlice';

dayjs.locale('pt-br');

const getDestaque = (dateISO: string) => {
  const eventoDate = dayjs(dateISO);
  const hoje = dayjs();

  if (eventoDate.isSame(hoje, 'day')) return 'hoje';
  if (eventoDate.diff(hoje, 'day') <= 7 && eventoDate.isAfter(hoje, 'day')) return 'semana';
  if (eventoDate.month() === hoje.month() && eventoDate.year() === hoje.year()) return 'mes';
  return 'fora';
};

const getEstiloCard = (destaque: string, theme: any) => {
  switch (destaque) {
    case 'hoje':
      return { borderLeft: '8px solid red' };
    case 'semana':
      return { borderLeft: `6px solid ${theme.palette.secondary.main}` };
    case 'mes':
      return { borderLeft: `4px solid ${theme.palette.primary.main}` };
    default:
      return { borderLeft: '4px solid #ccc' };
  }
};

const Eventos: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const dispatch = useDispatch();

  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const isAdmin = isAuthenticated && user?.role === 'admin';

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

  const [formTitle, setFormTitle] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formDescription, setFormDescription] = useState('');

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
  const eventosAnterioresFull = eventosOrdenados.filter((e) => dayjs(e.date).isBefore(hoje, 'day'));
  const eventosHojeFull = eventosOrdenados.filter((e) => dayjs(e.date).isSame(hoje, 'day'));
  const eventosFuturosFull = eventosOrdenados.filter((e) => dayjs(e.date).isAfter(hoje, 'day'));

  const eventoAnterior = eventosAnterioresFull.at(-1) || null;
  const leftoverAnteriores = eventoAnterior ? eventosAnterioresFull.slice(0, -1) : [];
  const eventoHoje = eventosHojeFull[0] || null;
  const eventoProximo = eventosFuturosFull[0] || null;
  const eventoPosterior = eventosFuturosFull[1] || null;
  const leftoverFuturos = eventosFuturosFull.slice(1);

  const renderCard = (evento: any) => {
    const destaque = getDestaque(evento.date);
    const estilo = getEstiloCard(destaque, theme);
    const dataFormatada = dayjs(evento.date).format('DD [de] MMMM');

    return (
      <Card
        elevation={4}
        sx={{
          borderRadius: 3,
          ...estilo,
          backgroundColor: '#ffffff',
          transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
          '&:hover': {
            transform: 'scale(1.03)',
            boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
          },
        }}
      >
        <CardContent>
          <Box
            sx={{
              height: 180,
              backgroundColor: '#e0e0e0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2,
              borderRadius: '8px 8px 0 0',
            }}
          >
            <Typography variant="h6" color="text.secondary">
              Imagem do Evento
            </Typography>
          </Box>
          <Typography
            variant="h6"
            fontWeight="bold"
            color={destaque === 'hoje' ? 'error' : 'primary'}
            gutterBottom
            sx={{ fontFamily: 'Roboto, sans-serif' }}
          >
            {evento.title}
          </Typography>
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <CalendarTodayIcon fontSize="small" color="action" />
            <Typography variant="body2" sx={{ fontFamily: 'Roboto, sans-serif' }}>
              <strong>Data:</strong> {dataFormatada}
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <PlaceIcon fontSize="small" color="action" />
            <Typography variant="body2" sx={{ fontFamily: 'Roboto, sans-serif' }}>
              <strong>Local:</strong> {evento.location}
            </Typography>
          </Box>
        </CardContent>
        <Divider />
        <CardActions sx={{ px: 2, pb: 2, display: 'flex', justifyContent: 'space-between' }}>
          {!editMode ? (
            <Button
              variant="outlined"
              color="primary"
              fullWidth={isMobile}
              onClick={() => setEventoSelecionado(evento)}
              sx={{ fontWeight: 'bold', textTransform: 'none', fontFamily: 'Roboto, sans-serif' }}
            >
              Ver Detalhes
            </Button>
          ) : (
            <>
              <Box>
                <Tooltip title="Editar">
                  <IconButton onClick={() => handleEditEvent(evento)}>
                    <EditIcon color="primary" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Excluir">
                  <IconButton onClick={() => handleDeleteEvent(evento)}>
                    <DeleteIcon color="error" />
                  </IconButton>
                </Tooltip>
              </Box>
              <Button
                variant="outlined"
                color="primary"
                fullWidth={isMobile}
                onClick={() => setEventoSelecionado(evento)}
                sx={{ fontWeight: 'bold', textTransform: 'none', fontFamily: 'Roboto, sans-serif' }}
              >
                Ver Detalhes
              </Button>
            </>
          )}
        </CardActions>
      </Card>
    );
  };

  const handleAddNewEvent = () => {
    setDialogAddEditMode('add');
    setCurrentEditEvent(null);
    setFormTitle('');
    setFormDate('');
    setFormLocation('');
    setFormDescription('');
    setDialogAddEditOpen(true);
  };

  const handleEditEvent = (evento: any) => {
    setDialogAddEditMode('edit');
    setCurrentEditEvent(evento);
    setFormTitle(evento.title);
    setFormDate(dayjs(evento.date).format('YYYY-MM-DD'));
    setFormLocation(evento.location);
    setFormDescription(evento.description);
    setDialogAddEditOpen(true);
  };

  const handleSubmitAddEdit = async () => {
    try {
      if (dialogAddEditMode === 'add') {
        await api.post('/events', {
          title: formTitle,
          date: formDate,
          location: formLocation,
          description: formDescription,
        });
      } else {
        if (!currentEditEvent?.id) return;
        await api.patch(`/events/${currentEditEvent.id}`, {
          title: formTitle,
          date: formDate,
          location: formLocation,
          description: formDescription,
        });
      }
      setDialogAddEditOpen(false);
      await reloadEventsAndLeaveEditMode();
    } catch (error) {
      console.error('Erro ao criar/editar evento:', error);
    }
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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="60vh">
        <CircularProgress />
      </Box>
    );
  }

  const naoTemEventos = !eventos.length;

  return (
    <>
      {naoTemEventos && (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          flexDirection="column"
          minHeight="50vh"
          gap={2}
          sx={{ px: 2 }}
        >
          <Typography
            variant="h6"
            color="text.secondary"
            gutterBottom
            sx={{ fontFamily: 'Roboto, sans-serif' }}
          >
            Nenhum evento encontrado
          </Typography>
          {isAdmin && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              color="primary"
              onClick={handleAddNewEvent}
              sx={{ boxShadow: '0 4px 6px rgba(0,0,0,0.1)', fontFamily: 'Roboto, sans-serif' }}
            >
              Adicionar Evento
            </Button>
          )}
        </Box>
      )}

      {!naoTemEventos && (
        <Box sx={{ mt: { xs: 10, md: 11 }, mb: { xs: 5, md: 6 }, px: { xs: 0, md: 4 } }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              justifyContent: { xs: 'center', md: 'space-between' },
              alignItems: { xs: 'center', md: 'center' },
              textAlign: { xs: 'center', md: 'left' },
              mb: { xs: 1, md: 1 },
              gap: { xs: 2, md: 0 },
            }}
          >
            <Box>
              <Typography
                variant="h4"
                fontWeight="bold"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  //  gap: 1,
                  justifyContent: { xs: 'center', md: 'flex-start' },
                  fontFamily: 'Roboto, sans-serif',
                }}
              >
                <CalendarTodayIcon color="primary" /> Eventos
              </Typography>
              <Typography
                variant="subtitle1"
                color="text.secondary"
                sx={{ fontFamily: 'Roboto, sans-serif' }}
              >
                Participe das atividades e encontros do Clubinho!
              </Typography>
            </Box>
            <Box textAlign={{ xs: 'center', md: 'right' }}>
              {!isMobile && isAdmin && !editMode && (
                <Button
                  variant="contained"
                  color="warning"
                  startIcon={<EditCalendarIcon />}
                  onClick={handleEnterEditMode}
                  sx={{
                    mb: 1,
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    fontFamily: 'Roboto, sans-serif',
                  }}
                >
                  Editar Página
                </Button>
              )}
              {!isMobile && editMode && (
                <>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={handleAddNewEvent}
                    sx={{
                      mr: 2,
                      mb: 1,
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                      fontFamily: 'Roboto, sans-serif',
                    }}
                  >
                    Adicionar Evento
                  </Button>
                  <Button
                    variant="contained"
                    color="inherit"
                    onClick={handleCancelEditMode}
                    sx={{
                      mb: 1,
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                      fontFamily: 'Roboto, sans-serif',
                    }}
                  >
                    Cancelar
                  </Button>
                </>
              )}
              {leftoverAnteriores.length > 0 && (
                <Button
                  variant="text"
                  color="secondary"
                  onClick={() => setMostrarAntigos(!mostrarAntigos)}
                  sx={{
                    fontWeight: 'bold',
                    display: 'block',
                    mt: 1,
                    mb: 0,
                    fontFamily: 'Roboto, sans-serif',
                  }}
                >
                  {mostrarAntigos ? 'Esconder Eventos Antigos' : 'Ver Eventos Antigos'}
                </Button>
              )}
            </Box>
          </Box>

          {/* Botões flutuantes no modo mobile para admin */}
          {isMobile && isAdmin && (
            <Box
              sx={{
                position: 'fixed',
                bottom: 16,
                right: 16,
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                zIndex: 1000,
              }}
            >
              {!editMode ? (
                <Tooltip title="Editar Página">
                  <Fab
                    color="warning"
                    aria-label="editar"
                    onClick={handleEnterEditMode}
                    sx={{ boxShadow: '0 4px 6px rgba(0,0,0,0.3)' }}
                  >
                    <EditCalendarIcon />
                  </Fab>
                </Tooltip>
              ) : (
                <>
                  <Tooltip title="Adicionar Evento">
                    <Fab
                      color="primary"
                      aria-label="adicionar"
                      onClick={handleAddNewEvent}
                      sx={{ boxShadow: '0 4px 6px rgba(0,0,0,0.3)' }}
                    >
                      <AddIcon />
                    </Fab>
                  </Tooltip>
                  <Tooltip title="Cancelar">
                    <Fab
                      color="default"
                      aria-label="cancelar"
                      onClick={handleCancelEditMode}
                      sx={{ boxShadow: '0 4px 6px rgba(0,0,0,0.3)' }}
                    >
                      <CloseIcon />
                    </Fab>
                  </Tooltip>
                </>
              )}
            </Box>
          )}

          {/* Bloco Principal */}
          <Box
            sx={{
              mt: { xs: 1, md: 3 },
              mb: { xs: 4, md: 4 },
              pt: { xs: 1, md: 2 },
              pb: { xs: 6, md: 3 },
              px: { xs: 2, md: 4 },
              backgroundColor: '#f5f5f5',
              borderRadius: 3,
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            }}
          >
            <Grid container spacing={4} justifyContent="center" sx={{ mt: 1, mb: 1 }}>
              {eventoHoje ? (
                <>
                  {eventoAnterior && (
                    <Grid item xs={12} md={4}>
                      <Typography
                        variant="subtitle1"
                        textAlign="center"
                        fontWeight="bold"
                        mb={1}
                        sx={{ fontFamily: 'Roboto, sans-serif' }}
                      >
                        Evento Anterior
                      </Typography>
                      {renderCard(eventoAnterior)}
                    </Grid>
                  )}
                  <Grid item xs={12} md={4} sx={{ order: { xs: -1, md: 0 } }}>
                    <Typography
                      variant="subtitle1"
                      textAlign="center"
                      fontWeight="bold"
                      mb={1}
                      sx={{ fontFamily: 'Roboto, sans-serif' }}
                    >
                      Evento de Hoje
                    </Typography>
                    {renderCard(eventoHoje)}
                  </Grid>
                  {eventoProximo && (
                    <Grid item xs={12} md={4}>
                      <Typography
                        variant="subtitle1"
                        textAlign="center"
                        fontWeight="bold"
                        mb={1}
                        sx={{ fontFamily: 'Roboto, sans-serif' }}
                      >
                        Próximo Evento
                      </Typography>
                      {renderCard(eventoProximo)}
                    </Grid>
                  )}
                </>
              ) : (
                <>
                  {eventoAnterior && (
                    <Grid item xs={12} md={4}>
                      <Typography
                        variant="subtitle1"
                        textAlign="center"
                        fontWeight="bold"
                        mb={1}
                        sx={{ fontFamily: 'Roboto, sans-serif' }}
                      >
                        Evento Anterior
                      </Typography>
                      {renderCard(eventoAnterior)}
                    </Grid>
                  )}
                  {eventoProximo && (
                    <Grid item xs={12} md={4}>
                      <Typography
                        variant="subtitle1"
                        textAlign="center"
                        fontWeight="bold"
                        mb={1}
                        sx={{ fontFamily: 'Roboto, sans-serif' }}
                      >
                        Próximo Evento
                      </Typography>
                      {renderCard(eventoProximo)}
                    </Grid>
                  )}
                  {eventoPosterior && (
                    <Grid item xs={12} md={4}>
                      <Typography
                        variant="subtitle1"
                        textAlign="center"
                        fontWeight="bold"
                        mb={1}
                        sx={{ fontFamily: 'Roboto, sans-serif' }}
                      >
                        Evento Posterior
                      </Typography>
                      {renderCard(eventoPosterior)}
                    </Grid>
                  )}
                </>
              )}
            </Grid>
          </Box>

          {/* Próximos Eventos */}
          {leftoverFuturos.length > 0 && (
            <Accordion
              defaultExpanded
              sx={{
                mb: 6,
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                borderRadius: 2,
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  color="text.secondary"
                  sx={{ fontFamily: 'Roboto, sans-serif' }}
                >
                  Próximos Eventos
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={4} justifyContent="center">
                  {leftoverFuturos.map((evento) => (
                    <Grid item xs={12} sm={6} md={4} key={evento.id}>
                      {renderCard(evento)}
                    </Grid>
                  ))}
                </Grid>
              </AccordionDetails>
            </Accordion>
          )}

          {/* Eventos Anteriores */}
          {mostrarAntigos && leftoverAnteriores.length > 0 && (
            <Accordion
              ref={eventosAntigosRef}
              sx={{
                mb: 6,
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                borderRadius: 2,
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  color="text.secondary"
                  sx={{ fontFamily: 'Roboto, sans-serif' }}
                >
                  Eventos Anteriores
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={4} justifyContent="center">
                  {leftoverAnteriores.map((evento) => (
                    <Grid item xs={12} sm={6} md={4} key={evento.id}>
                      {renderCard(evento)}
                    </Grid>
                  ))}
                </Grid>
              </AccordionDetails>
            </Accordion>
          )}
        </Box>
      )}

      {/* Dialog de Detalhes */}
      {eventoSelecionado && (
        <Dialog
          open
          onClose={() => setEventoSelecionado(null)}
          maxWidth="sm"
          fullWidth
          sx={{
            '& .MuiDialog-paper': {
              borderRadius: 3,
              boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
            },
          }}
        >
          <DialogTitle
            sx={{
              textAlign: 'center',
              fontWeight: 'bold',
              color: theme.palette.primary.main,
              fontFamily: 'Roboto, sans-serif',
            }}
          >
            {eventoSelecionado.title}
            <IconButton
              aria-label="close"
              onClick={() => setEventoSelecionado(null)}
              sx={{ position: 'absolute', right: 8, top: 8, color: theme.palette.grey[500] }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <Box mt={2}>
              <Typography
                variant="subtitle1"
                gutterBottom
                sx={{ fontFamily: 'Roboto, sans-serif' }}
              >
                <strong>Data:</strong> {dayjs(eventoSelecionado.date).format('DD [de] MMMM')}
              </Typography>
              <Typography
                variant="subtitle1"
                gutterBottom
                sx={{ fontFamily: 'Roboto, sans-serif' }}
              >
                <strong>Local:</strong> {eventoSelecionado.location}
              </Typography>
              <Typography variant="subtitle1" sx={{ fontFamily: 'Roboto, sans-serif' }}>
                <strong>Descrição:</strong> {eventoSelecionado.description}
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
            <Button
              onClick={() => setEventoSelecionado(null)}
              color="primary"
              variant="text"
              sx={{ fontFamily: 'Roboto, sans-serif' }}
            >
              Fechar
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Dialog de ADD/EDIT Evento */}
      <Dialog
        open={dialogAddEditOpen}
        onClose={() => setDialogAddEditOpen(false)}
        maxWidth="sm"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: 3,
            boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
          },
        }}
      >
        <DialogTitle sx={{ fontFamily: 'Roboto, sans-serif' }}>
          {dialogAddEditMode === 'add' ? 'Adicionar Evento' : 'Editar Evento'}
          <IconButton
            aria-label="close"
            onClick={() => setDialogAddEditOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8, color: theme.palette.grey[500] }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField
              label="Título"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              fullWidth
              variant="outlined"
              sx={{ fontFamily: 'Roboto, sans-serif' }}
            />
            <TextField
              label="Data"
              type="date"
              value={formDate}
              onChange={(e) => setFormDate(e.target.value)}
              fullWidth
              variant="outlined"
              InputLabelProps={{ shrink: true }}
              sx={{ fontFamily: 'Roboto, sans-serif' }}
            />
            <TextField
              label="Local"
              value={formLocation}
              onChange={(e) => setFormLocation(e.target.value)}
              fullWidth
              variant="outlined"
              sx={{ fontFamily: 'Roboto, sans-serif' }}
            />
            <TextField
              label="Descrição"
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              multiline
              rows={3}
              fullWidth
              variant="outlined"
              sx={{ fontFamily: 'Roboto, sans-serif' }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDialogAddEditOpen(false)}
            color="inherit"
            sx={{ fontFamily: 'Roboto, sans-serif' }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmitAddEdit}
            variant="contained"
            color="primary"
            sx={{ fontFamily: 'Roboto, sans-serif' }}
          >
            {dialogAddEditMode === 'add' ? 'Adicionar' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Confirmação de DELETE */}
      <Dialog
        open={dialogDeleteOpen}
        onClose={handleCloseDelete}
        maxWidth="xs"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: 3,
            boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
          },
        }}
      >
        <DialogTitle sx={{ fontFamily: 'Roboto, sans-serif' }}>Confirmação</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontFamily: 'Roboto, sans-serif' }}>
            Tem certeza que deseja excluir este evento?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDelete} sx={{ fontFamily: 'Roboto, sans-serif' }}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            sx={{ fontFamily: 'Roboto, sans-serif' }}
          >
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Eventos;
