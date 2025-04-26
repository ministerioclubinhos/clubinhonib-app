import { useState } from 'react';
import { Box, Typography, TextField, Button, Grid, IconButton } from '@mui/material';
import { Delete } from '@mui/icons-material';

interface EventItem {
  title: string;
  date: string;
  location: string;
}

export default function EventPageCreator() {
  const [pageTitle, setPageTitle] = useState('');
  const [pageDescription, setPageDescription] = useState('');
  const [events, setEvents] = useState<EventItem[]>([]);
  const [newEvent, setNewEvent] = useState<EventItem>({ title: '', date: '', location: '' });

  const [errors, setErrors] = useState({
    pageTitle: false,
    pageDescription: false,
    newEventTitle: false,
    newEventDate: false,
    newEventLocation: false,
  });

  const handleAddEvent = () => {
    const hasError = !newEvent.title || !newEvent.date || !newEvent.location;
    setErrors((prev) => ({
      ...prev,
      newEventTitle: !newEvent.title,
      newEventDate: !newEvent.date,
      newEventLocation: !newEvent.location,
    }));
    if (hasError) return;

    setEvents([...events, newEvent]);
    setNewEvent({ title: '', date: '', location: '' });
  };

  const handleRemoveEvent = (index: number) => {
    setEvents(events.filter((_, i) => i !== index));
  };

  const handleSavePage = async () => {
    const hasError = !pageTitle || !pageDescription || events.length === 0;
    setErrors((prev) => ({
      ...prev,
      pageTitle: !pageTitle,
      pageDescription: !pageDescription,
    }));
    if (hasError) return;

    const payload = {
      pageTitle,
      pageDescription,
      events,
    };

    try {
      const res = await fetch('/events-page', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Erro ao salvar página');
    } catch (err) {
      console.error('Erro ao salvar página', err);
    }
  };

  return (
    <Box sx={{ width: { xs: '95%', md: '100%' }, maxWidth: 1000, mx: 'auto', p: 0 }}>
      <Typography
        variant="h4"
        mb={3}
        fontWeight="bold"
        sx={{ textAlign: 'center', fontSize: { xs: '1.6rem', sm: '2rem', md: '2.25rem' } }}
      >
        Criar Página de Eventos
      </Typography>

      <Grid container spacing={2} mb={4}>
        <Grid item xs={12}>
          <TextField
            label="Título da Página"
            fullWidth
            value={pageTitle}
            onChange={(e) => setPageTitle(e.target.value)}
            error={errors.pageTitle}
            helperText={errors.pageTitle ? 'Campo obrigatório' : ''}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Descrição da Página"
            fullWidth
            multiline
            rows={3}
            value={pageDescription}
            onChange={(e) => setPageDescription(e.target.value)}
            error={errors.pageDescription}
            helperText={errors.pageDescription ? 'Campo obrigatório' : ''}
          />
        </Grid>
      </Grid>

      <Typography variant="h6" fontWeight="medium" mb={2}>
        Adicionar Evento / Treinamento
      </Typography>

      <Grid container spacing={2} mb={4}>
        <Grid item xs={12} sm={4}>
          <TextField
            label="Título do Evento"
            fullWidth
            value={newEvent.title}
            onChange={(e) => setNewEvent((prev) => ({ ...prev, title: e.target.value }))}
            error={errors.newEventTitle}
            helperText={errors.newEventTitle ? 'Campo obrigatório' : ''}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            label="Data do Evento"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={newEvent.date}
            onChange={(e) => setNewEvent((prev) => ({ ...prev, date: e.target.value }))}
            error={errors.newEventDate}
            helperText={errors.newEventDate ? 'Campo obrigatório' : ''}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            label="Local do Evento"
            fullWidth
            value={newEvent.location}
            onChange={(e) => setNewEvent((prev) => ({ ...prev, location: e.target.value }))}
            error={errors.newEventLocation}
            helperText={errors.newEventLocation ? 'Campo obrigatório' : ''}
          />
        </Grid>
        <Grid item xs={12}>
          <Button variant="contained" fullWidth onClick={handleAddEvent}>
            Adicionar Evento
          </Button>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {events.map((event, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Box border={1} borderRadius={2} p={2} position="relative">
              <Typography fontWeight="bold">{event.title}</Typography>
              <Typography variant="body2" mt={1}>
                📅 {event.date}
              </Typography>
              <Typography variant="body2">📍 {event.location}</Typography>
              <IconButton
                size="small"
                color="error"
                onClick={() => handleRemoveEvent(index)}
                sx={{ position: 'absolute', top: 8, right: 8 }}
              >
                <Delete fontSize="small" />
              </IconButton>
            </Box>
          </Grid>
        ))}
      </Grid>

      <Box textAlign="center" mt={6}>
        <Button variant="contained" size="large" onClick={handleSavePage}>
          Salvar Página
        </Button>
      </Box>
    </Box>
  );
}
