import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Chip,
  Fab,
  Paper,
  Stack,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import EventBusyOutlinedIcon from '@mui/icons-material/EventBusyOutlined';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import { motion } from 'framer-motion';

import { EventCardStatus } from '../types';
import type { EventsCardsViewProps } from '../types';
import { formatEventCount, getEventCardStatus, groupEventsForCards } from '../utils';
import EventCard from './EventCard';

/** Visualização da agenda em cards, organizada por relevância temporal. */
export default function EventsCardsView({
  eventos,
  isAdmin,
  onOpenDetails,
  onAdd,
  onEdit,
  onDelete,
}: EventsCardsViewProps) {
  const theme = useTheme();
  const referenceDate = new Date();
  const groups = groupEventsForCards(eventos, referenceDate);

  return (
    <motion.div
      data-testid="event-events-cards-view"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <Box sx={{ width: '100%', mx: 'auto' }}>
        <Box
          component="section"
          data-testid="event-upcoming-events"
          aria-labelledby="event-upcoming-events-title"
          sx={{ mb: { xs: 3, md: 4 } }}
        >
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            justifyContent="space-between"
            spacing={1}
            sx={{ mb: 2 }}
          >
            <Stack direction="row" alignItems="center" spacing={1.25}>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 2.5,
                  display: 'grid',
                  placeItems: 'center',
                  bgcolor: alpha(theme.palette.success.main, 0.1),
                  color: 'success.main',
                }}
              >
                <EventAvailableOutlinedIcon />
              </Box>
              <Box>
                <Typography
                  id="event-upcoming-events-title"
                  component="h2"
                  variant="h5"
                  sx={{ color: 'text.primary', fontWeight: 800, lineHeight: 1.2 }}
                >
                  Próximos eventos
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Confira o que está chegando no Clubinho.
                </Typography>
              </Box>
            </Stack>

            <Chip
              label={formatEventCount(groups.upcoming.length)}
              variant="outlined"
              color="success"
              sx={{ borderRadius: 999, fontWeight: 700 }}
            />
          </Stack>

          {groups.upcoming.length > 0 ? (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: 'minmax(0, 1fr)',
                  sm: 'repeat(2, minmax(0, 1fr))',
                  lg: 'repeat(3, minmax(0, 1fr))',
                  xl: 'repeat(4, minmax(0, 1fr))',
                },
                gap: { xs: 2, md: 2.5 },
              }}
            >
              {groups.upcoming.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  isAdmin={isAdmin}
                  status={getEventCardStatus(event.date, referenceDate)}
                  onOpenDetails={onOpenDetails}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </Box>
          ) : (
            <Paper
              data-testid="event-upcoming-events-empty"
              variant="outlined"
              sx={{
                px: 2,
                py: { xs: 4, sm: 5 },
                borderRadius: 3,
                borderStyle: 'dashed',
                textAlign: 'center',
                bgcolor: alpha(theme.palette.background.paper, 0.76),
              }}
            >
              <EventBusyOutlinedIcon sx={{ color: 'text.disabled', fontSize: 44, mb: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                Nenhum próximo evento
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Os novos encontros aparecerão aqui assim que forem publicados.
              </Typography>
            </Paper>
          )}
        </Box>

        {groups.past.length > 0 ? (
          <Accordion
            data-testid="event-past-events"
            disableGutters
            elevation={0}
            sx={{
              overflow: 'hidden',
              border: 1,
              borderColor: 'divider',
              borderRadius: '12px !important',
              bgcolor: alpha(theme.palette.background.paper, 0.82),
              '&::before': { display: 'none' },
            }}
          >
            <AccordionSummary
              data-testid="event-past-events-toggle"
              expandIcon={<ExpandMoreRoundedIcon />}
              aria-controls="event-past-events-content"
              id="event-past-events-header"
              sx={{
                minHeight: 64,
                px: { xs: 2, sm: 2.5 },
                '& .MuiAccordionSummary-content': { my: 1.25 },
              }}
            >
              <Stack
                direction="row"
                spacing={1.25}
                alignItems="center"
                justifyContent="space-between"
                sx={{ width: '100%', pr: 1 }}
              >
                <Stack direction="row" spacing={1.25} alignItems="center">
                  <HistoryRoundedIcon sx={{ color: 'text.secondary' }} />
                  <Box>
                    <Typography component="h2" variant="subtitle1" sx={{ fontWeight: 800 }}>
                      Eventos anteriores
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Relembre atividades que já aconteceram.
                    </Typography>
                  </Box>
                </Stack>
                <Chip
                  label={formatEventCount(groups.past.length)}
                  size="small"
                  variant="outlined"
                  sx={{ display: { xs: 'none', sm: 'inline-flex' }, borderRadius: 999 }}
                />
              </Stack>
            </AccordionSummary>
            <AccordionDetails
              id="event-past-events-content"
              aria-labelledby="event-past-events-header"
              sx={{ px: { xs: 2, sm: 2.5 }, pt: 1, pb: { xs: 2, sm: 2.5 } }}
            >
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: 'minmax(0, 1fr)',
                    sm: 'repeat(2, minmax(0, 1fr))',
                    lg: 'repeat(3, minmax(0, 1fr))',
                    xl: 'repeat(4, minmax(0, 1fr))',
                  },
                  gap: { xs: 2, md: 2.5 },
                }}
              >
                {groups.past.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    isAdmin={isAdmin}
                    status={EventCardStatus.PAST}
                    onOpenDetails={onOpenDetails}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                ))}
              </Box>
            </AccordionDetails>
          </Accordion>
        ) : null}
      </Box>

      {isAdmin ? (
        <Fab
          data-testid="event-cards-add-action"
          type="button"
          color="success"
          aria-label="Adicionar evento"
          onClick={onAdd}
          sx={{
            position: 'fixed',
            right: { xs: 16, sm: 24, md: 32 },
            bottom: {
              xs: 'calc(16px + env(safe-area-inset-bottom))',
              sm: 'calc(24px + env(safe-area-inset-bottom))',
              md: 32,
            },
            zIndex: theme.zIndex.speedDial,
            boxShadow: `0 10px 24px ${alpha(theme.palette.success.main, 0.3)}`,
          }}
        >
          <AddRoundedIcon />
        </Fab>
      ) : null}
    </motion.div>
  );
}
