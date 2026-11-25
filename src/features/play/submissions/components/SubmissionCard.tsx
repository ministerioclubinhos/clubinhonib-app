import type { ReactNode } from 'react';
import { Box, Chip, Stack, Typography } from '@mui/material';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';

import { formatDuration } from '../../utils';
import {
  PLAY_ROLE_LABEL,
  PLAY_SUBMISSION_STATUS_COLOR,
  PLAY_SUBMISSION_STATUS_LABEL,
} from '../constants';
import type { PlaySubmission } from '../types';
import { formatFileSize } from '../utils';

interface SubmissionCardProps {
  submission: PlaySubmission;
  /** Mostra quem enviou (visão do administrador). */
  showSubmitter?: boolean;
  onPreview?: (submission: PlaySubmission) => void;
  actions?: ReactNode;
}

/** Cartão de um envio: miniatura, dados, situação e as ações da tela. */
export default function SubmissionCard({
  submission,
  showSubmitter = false,
  onPreview,
  actions,
}: SubmissionCardProps) {
  const duration = formatDuration(submission.durationSeconds);
  const kind =
    submission.uploadType === 'upload'
      ? ['Arquivo', formatFileSize(submission.size)].filter(Boolean).join(' • ')
      : 'Link do YouTube';
  const when = new Date(submission.createdAt).toLocaleString('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  });

  return (
    <Box
      data-testid="play-submission-card"
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        gap: 2,
        p: 1.5,
        border: 1,
        borderColor: 'divider',
        borderRadius: 3,
        bgcolor: 'background.paper',
      }}
    >
      <Box
        component={onPreview ? 'button' : 'div'}
        type={onPreview ? 'button' : undefined}
        aria-label={onPreview ? `Pré-visualizar ${submission.title}` : undefined}
        onClick={onPreview ? () => onPreview(submission) : undefined}
        sx={{
          position: 'relative',
          flexShrink: 0,
          width: { xs: '100%', sm: 220 },
          aspectRatio: '16 / 9',
          p: 0,
          border: 0,
          borderRadius: 2,
          overflow: 'hidden',
          cursor: onPreview ? 'pointer' : 'default',
          background: 'linear-gradient(135deg, #312e81 0%, #4f46e5 100%)',
          display: 'grid',
          placeItems: 'center',
        }}
      >
        {submission.thumbnailUrl ? (
          <Box
            component="img"
            src={submission.thumbnailUrl}
            alt=""
            loading="lazy"
            sx={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        ) : null}
        {onPreview && (
          <PlayCircleOutlineIcon
            sx={{ position: 'relative', fontSize: 48, color: '#fff', opacity: 0.9 }}
          />
        )}
        {duration && (
          <Typography
            component="span"
            variant="caption"
            sx={{
              position: 'absolute',
              right: 6,
              bottom: 6,
              px: 0.75,
              borderRadius: 1,
              bgcolor: 'rgba(0,0,0,0.8)',
              color: '#fff',
              fontWeight: 700,
            }}
          >
            {duration}
          </Typography>
        )}
      </Box>

      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Stack direction="row" spacing={1} alignItems="flex-start" justifyContent="space-between">
          <Typography fontWeight={800} sx={{ lineHeight: 1.25, wordBreak: 'break-word' }}>
            {submission.title}
          </Typography>
          <Chip
            size="small"
            label={PLAY_SUBMISSION_STATUS_LABEL[submission.status]}
            color={PLAY_SUBMISSION_STATUS_COLOR[submission.status]}
            sx={{ flexShrink: 0 }}
          />
        </Stack>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
          {kind} • {when}
        </Typography>
        {showSubmitter && (
          <Typography variant="body2" sx={{ mt: 0.5 }}>
            {submission.submitter ? (
              <>
                <strong>{submission.submitter.name}</strong>{' '}
                <Typography component="span" variant="body2" color="text.secondary">
                  ({PLAY_ROLE_LABEL[submission.submitter.role] ?? submission.submitter.role}) •{' '}
                  {submission.submitter.email}
                </Typography>
              </>
            ) : (
              <Typography component="span" variant="body2" color="text.secondary">
                Usuário removido
              </Typography>
            )}
          </Typography>
        )}
        {submission.description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 0.75,
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              whiteSpace: 'pre-line',
            }}
          >
            {submission.description}
          </Typography>
        )}
        {submission.status === 'rejected' && (
          <Typography variant="body2" color="error" sx={{ mt: 0.75 }}>
            {submission.rejectionReason
              ? `Motivo: ${submission.rejectionReason}`
              : 'Não foi aprovado pela administração.'}
          </Typography>
        )}
        {actions && <Box sx={{ mt: 1.5 }}>{actions}</Box>}
      </Box>
    </Box>
  );
}
