import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Chip,
  Divider,
  IconButton,
  Stack,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import { motion } from 'framer-motion';
import type { Theme } from '@mui/material';

import {
  EVENT_CARD_STATUS_COLORS,
  EVENT_CARD_STATUS_LABELS,
  EVENT_FALLBACK_IMAGE_URL,
} from '../constants';
import { EventCardStatus } from '../types';
import type { EventCardProps } from '../types';
import { formatEventCardDate, isClubMeeting } from '../utils';

const getAccentColor = (status: EventCardStatus, theme: Theme): string => {
  switch (status) {
    case EventCardStatus.TODAY:
      return theme.palette.error.main;
    case EventCardStatus.TOMORROW:
      return theme.palette.warning.main;
    case EventCardStatus.SOON:
      return theme.palette.success.main;
    case EventCardStatus.LATER:
      return theme.palette.info.main;
    case EventCardStatus.PAST:
      return theme.palette.grey[500];
  }
};

/** Card enxuto e responsivo de um evento da agenda. */
export default function EventCard({
  event,
  isAdmin,
  status,
  onOpenDetails,
  onEdit,
  onDelete,
}: EventCardProps) {
  const theme = useTheme();
  const date = formatEventCardDate(event.date);
  const imageUrl = event.media?.url || EVENT_FALLBACK_IMAGE_URL;
  const hasEventImage = Boolean(event.media?.url);
  const [imageFailed, setImageFailed] = useState(false);
  const accentColor = getAccentColor(status, theme);
  const isPast = status === EventCardStatus.PAST;

  useEffect(() => {
    setImageFailed(false);
  }, [imageUrl]);

  return (
    <motion.article
      data-testid={`event-card-${event.id}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      style={{ height: '100%' }}
    >
      <Card
        variant="outlined"
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          borderRadius: 3,
          borderColor: isPast ? 'divider' : alpha(accentColor, 0.28),
          bgcolor: 'background.paper',
          boxShadow: isPast ? 'none' : `0 10px 28px ${alpha(theme.palette.common.black, 0.08)}`,
          transition: 'border-color 180ms ease, box-shadow 180ms ease, transform 180ms ease',
          '&:hover': {
            borderColor: accentColor,
            boxShadow: {
              xs: isPast ? 'none' : `0 10px 28px ${alpha(theme.palette.common.black, 0.08)}`,
              sm: `0 14px 34px ${alpha(accentColor, 0.16)}`,
            },
            transform: { xs: 'none', sm: 'translateY(-3px)' },
          },
          '&:focus-within': {
            borderColor: accentColor,
            boxShadow: `0 0 0 3px ${alpha(accentColor, 0.18)}`,
          },
        }}
      >
        <Box
          sx={{
            position: 'relative',
            aspectRatio: '16 / 9',
            minHeight: 168,
            maxHeight: 224,
            overflow: 'hidden',
            bgcolor: alpha(accentColor, 0.08),
          }}
        >
          {imageUrl && !imageFailed ? (
            <CardMedia
              data-testid={`event-card-${event.id}-image`}
              component="img"
              src={imageUrl}
              alt={hasEventImage ? `Imagem do evento ${event.title}` : ''}
              loading="lazy"
              onError={() => setImageFailed(true)}
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                filter: isPast ? 'saturate(0.72)' : 'none',
              }}
            />
          ) : (
            <Stack
              data-testid={`event-card-${event.id}-image-placeholder`}
              aria-hidden="true"
              alignItems="center"
              justifyContent="center"
              spacing={1}
              sx={{ width: '100%', height: '100%', color: accentColor }}
            >
              <EventOutlinedIcon sx={{ fontSize: 48, opacity: 0.75 }} />
              <Typography variant="caption" sx={{ fontWeight: 700, opacity: 0.8 }}>
                Clubinho NIB
              </Typography>
            </Stack>
          )}

          <Chip
            label={EVENT_CARD_STATUS_LABELS[status]}
            color={EVENT_CARD_STATUS_COLORS[status]}
            size="small"
            sx={{
              position: 'absolute',
              top: 12,
              right: 12,
              borderRadius: 999,
              fontWeight: 800,
              boxShadow: `0 4px 12px ${alpha(theme.palette.common.black, 0.16)}`,
            }}
          />
        </Box>

        <CardContent
          sx={{
            p: { xs: 2, sm: 2.25 },
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 1.75,
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="flex-start">
            <Box
              component="time"
              dateTime={event.date}
              aria-label={date.full}
              sx={{
                width: 58,
                flexShrink: 0,
                overflow: 'hidden',
                border: 1,
                borderColor: alpha(accentColor, 0.3),
                borderRadius: 2,
                textAlign: 'center',
                bgcolor: alpha(accentColor, 0.07),
              }}
            >
              <Typography
                component="span"
                sx={{
                  display: 'block',
                  py: 0.35,
                  bgcolor: accentColor,
                  color: theme.palette.getContrastText(accentColor),
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  letterSpacing: '0.05em',
                }}
              >
                {date.month}
              </Typography>
              <Typography
                component="span"
                sx={{
                  display: 'block',
                  py: 0.5,
                  color: 'text.primary',
                  fontSize: '1.5rem',
                  fontWeight: 800,
                  lineHeight: 1,
                }}
              >
                {date.day}
              </Typography>
            </Box>

            <Box sx={{ minWidth: 0, pt: 0.25 }}>
              <Typography
                component="h3"
                variant="h6"
                title={event.title}
                sx={{
                  display: '-webkit-box',
                  overflow: 'hidden',
                  WebkitBoxOrient: 'vertical',
                  WebkitLineClamp: 2,
                  color: 'text.primary',
                  fontWeight: 800,
                  lineHeight: 1.25,
                }}
              >
                {event.title}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: 'block', mt: 0.5, textTransform: 'capitalize' }}
              >
                {date.complement}
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
            <PlaceOutlinedIcon sx={{ color: 'text.secondary', fontSize: 20, flexShrink: 0 }} />
            <Typography
              variant="body2"
              color="text.secondary"
              title={event.location || 'Local a definir'}
              noWrap
            >
              {event.location || 'Local a definir'}
            </Typography>
          </Stack>

          {event.description ? (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                display: '-webkit-box',
                overflow: 'hidden',
                WebkitBoxOrient: 'vertical',
                WebkitLineClamp: 3,
                wordBreak: 'break-word',
              }}
            >
              {event.description}
            </Typography>
          ) : null}
        </CardContent>

        <Divider />
        <CardActions sx={{ p: 1.25, gap: 0.5 }}>
          <Button
            data-testid={`event-card-${event.id}-details-action`}
            type="button"
            variant={isPast ? 'outlined' : 'contained'}
            color="success"
            endIcon={<ArrowForwardRoundedIcon />}
            onClick={() => onOpenDetails(event)}
            sx={{
              minHeight: 44,
              flex: 1,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 800,
            }}
          >
            Ver detalhes
          </Button>

          {isAdmin && !isClubMeeting(event) ? (
            <Stack direction="row" spacing={0.25}>
              <Tooltip title="Editar evento">
                <IconButton
                  data-testid={`event-card-${event.id}-edit-action`}
                  type="button"
                  aria-label={`Editar ${event.title}`}
                  color="primary"
                  onClick={() => onEdit(event)}
                  sx={{ width: 44, height: 44 }}
                >
                  <EditOutlinedIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Excluir evento">
                <IconButton
                  data-testid={`event-card-${event.id}-delete-action`}
                  type="button"
                  aria-label={`Excluir ${event.title}`}
                  color="error"
                  onClick={() => onDelete(event)}
                  sx={{ width: 44, height: 44 }}
                >
                  <DeleteOutlineRoundedIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          ) : null}
        </CardActions>
      </Card>
    </motion.article>
  );
}
