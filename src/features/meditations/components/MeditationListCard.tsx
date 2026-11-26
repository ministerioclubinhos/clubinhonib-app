import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import EventNoteOutlinedIcon from '@mui/icons-material/EventNoteOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { IconButton, Tooltip, Typography } from '@mui/material';

import { ListingCard } from '@/components/common/listing';
import type { ListingBadge, ListingMeta } from '@/components/common/listing';

import { MEDITATION_DAYS_COUNT } from '../constants';
import type { MeditationResponse } from '../types';
import { formatPtBrDate, meditationInitials, periodStatus } from '../utils';

interface Props {
  meditation: MeditationResponse;
  onOpenDays: (meditation: MeditationResponse) => void;
  onPreviewMedia: (meditation: MeditationResponse) => void;
  onEdit: (meditation: MeditationResponse) => void;
  onDelete: (meditation: MeditationResponse) => void;
}

/** Rótulo e cor de cada situação do período. */
const STATUS_BADGE: Record<
  ReturnType<typeof periodStatus>,
  { label: string; color: ListingBadge['color'] }
> = {
  current: { label: 'Desta semana', color: 'success' },
  upcoming: { label: 'Futura', color: 'info' },
  past: { label: 'Encerrada', color: 'default' },
};

/** Card de uma meditação na listagem do painel. */
export default function MeditationListCard({
  meditation,
  onOpenDays,
  onPreviewMedia,
  onEdit,
  onDelete,
}: Props) {
  const status = STATUS_BADGE[periodStatus(meditation)];
  const dayCount = meditation.days?.length ?? 0;

  const badges: ListingBadge[] = [
    { label: status.label, color: status.color },
  ];

  if (dayCount !== MEDITATION_DAYS_COUNT) {
    // Uma meditação incompleta não aparece direito na área do professor.
    badges.push({ label: `${dayCount} de ${MEDITATION_DAYS_COUNT} dias`, color: 'warning' });
  }

  const meta: ListingMeta[] = [
    {
      icon: <CalendarMonthOutlinedIcon sx={{ fontSize: 16 }} />,
      label: `${formatPtBrDate(meditation.startDate)} — ${formatPtBrDate(meditation.endDate)}`,
    },
  ];

  return (
    <ListingCard data-testid={`meditations-meditation-list-card-${meditation.id}`}
      avatar={meditationInitials(meditation.topic)}
      title={meditation.topic}
      accent={status.color === 'default' ? 'default' : status.color}
      badges={badges}
      meta={meta}
      excerpt={meditation.days?.map((day) => day.topic).join(' · ')}
      onClick={() => onOpenDays(meditation)}
      footer={
        <Typography variant="caption" color="text.secondary" noWrap>
          {meditation.media ? 'Material anexado' : 'Sem material'}
        </Typography>
      }
      actions={
        <>
          <Tooltip title="Ver os dias">
            <IconButton
              size="small"
              aria-label="Ver os dias"
              onClick={(event) => {
                event.stopPropagation();
                onOpenDays(meditation);
              }}
            >
              <EventNoteOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Abrir material">
            {/* O `span` mantém a dica visível quando o botão está desabilitado. */}
            <span>
              <IconButton
                size="small"
                aria-label="Abrir material"
                disabled={!meditation.media}
                onClick={(event) => {
                  event.stopPropagation();
                  onPreviewMedia(meditation);
                }}
              >
                <VisibilityOutlinedIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>

          <Tooltip title="Editar">
            <IconButton
              size="small"
              aria-label="Editar"
              onClick={(event) => {
                event.stopPropagation();
                onEdit(meditation);
              }}
            >
              <EditOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Excluir">
            <IconButton
              size="small"
              color="error"
              aria-label="Excluir"
              onClick={(event) => {
                event.stopPropagation();
                onDelete(meditation);
              }}
            >
              <DeleteOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </>
      }
    />
  );
}
