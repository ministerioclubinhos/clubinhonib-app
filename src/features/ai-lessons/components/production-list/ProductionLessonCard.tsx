import React from 'react';
import { Box, Button, CircularProgress, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import {
  ArrowForward,
  AutoAwesome as AiIcon,
  DeleteOutline as DeleteIcon,
  PictureAsPdfOutlined as PdfIcon,
} from '@mui/icons-material';

import { ListingCard } from '@/components/common/listing';
import type { ListingBadge } from '@/components/common/listing';

import { STUDIO_HUB_ACTION_COLORS } from '../../hub.constants';
import { hubRelativeTime } from '../../hub.utils';
import { PRODUCTION_STATUSPRESENTATION as statusPresentation } from '../../listConstants';
import { PRODUCTION_LIST_TEXTS } from '../../production-list.constants';
import {
  canExportLessonPdf,
  hasFailedStage,
  isLessonGenerating,
} from '../../production-list.utils';
import { LessonCategory, type StudioHubQueueItem } from '../../types';
import { formatLessonBadgeLabel } from '../../utils';
import { canDeleteLesson } from '../../workflow';
import { HubStagePipeline } from '../hub/HubStagePipeline';

interface Props {
  /** A lição com o próximo passo e as etapas já calculados. */
  item: StudioHubQueueItem;
  /** Lição cujo PDF está sendo baixado agora, se houver. */
  downloadingId: string | null;
  onOpen: (href: string) => void;
  onDownload: () => void;
  onDelete: () => void;
}

/**
 * Uma lição na lista de produção.
 *
 * O cartão responde "onde ela está e o que eu faço agora": as etapas viram uma
 * barra de segmentos e o botão diz o próximo passo. As ações secundárias só
 * aparecem quando valem — o PDF exige o pacote todo aprovado, e excluir espera
 * a geração terminar.
 */
export const ProductionLessonCard: React.FC<Props> = ({
  item,
  downloadingId,
  onOpen,
  onDownload,
  onDelete,
}) => {
  const { lesson } = item;
  const presentation = statusPresentation[lesson.status];
  const generating = isLessonGenerating(lesson);
  const failed = hasFailedStage(lesson);
  const actionColor = STUDIO_HUB_ACTION_COLORS[item.action];

  const badges: ListingBadge[] = [{ label: presentation.label, color: presentation.color }];
  if (failed) badges.push({ label: PRODUCTION_LIST_TEXTS.failedBadge, color: 'error' });
  if (generating) badges.push({ label: PRODUCTION_LIST_TEXTS.generatingBadge, color: 'info' });
  badges.push({
    label: formatLessonBadgeLabel(lesson),
    color: lesson.category === LessonCategory.SPECIAL ? 'secondary' : 'default',
  });

  return (
    <ListingCard
      data-testid={`ai-lesson-card-${lesson.id}`}
      avatar={<AiIcon fontSize="small" />}
      title={lesson.theme}
      subtitle={lesson.biblicalReference}
      accent={failed ? 'error' : presentation.color}
      badges={badges}
      onClick={() => onOpen(item.href)}
      stackedFooter
      footer={
        <Box sx={{ flex: 1, minWidth: 0, width: '100%' }}>
          <HubStagePipeline stages={item.stages} />
          <Stack direction="row" justifyContent="space-between" gap={1} sx={{ mt: 0.5 }}>
            <Typography variant="caption" color="text.secondary" noWrap>
              Mexida {hubRelativeTime(lesson.updatedAt)}
            </Typography>
            <Typography
              data-testid={`ai-lesson-card-progress-${lesson.id}`}
              variant="caption"
              fontWeight={700}
              color="text.secondary"
              sx={{ flexShrink: 0 }}
            >
              {item.completed} de {item.total} etapas
            </Typography>
          </Stack>
        </Box>
      }
      actions={
        <Stack direction="row" alignItems="center" gap={0.5} sx={{ flex: 1, width: '100%', minWidth: 0 }}>
          <Button
            variant="contained"
            color={actionColor === 'default' ? 'primary' : actionColor}
            endIcon={<ArrowForward />}
            // O nome acessível segue o padrão anterior, que os testes procuram.
            aria-label={`Abrir produção ${lesson.theme}: ${item.actionLabel}`}
            data-testid={`ai-lesson-card-action-${lesson.id}`}
            onClick={(event) => {
              event.stopPropagation();
              onOpen(item.href);
            }}
            sx={{
              flex: 1,
              minWidth: 0,
              minHeight: 44,
              borderRadius: 2,
              fontWeight: 700,
              textTransform: 'none',
              justifyContent: 'space-between',
              '& .MuiButton-endIcon': { flexShrink: 0 },
            }}
          >
            <Box component="span" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {item.actionLabel}
            </Box>
          </Button>

          {canExportLessonPdf(lesson) && (
            <Tooltip title={PRODUCTION_LIST_TEXTS.pdfTooltip}>
              <span>
                <IconButton
                  color="secondary"
                  data-testid={`ai-lesson-download-${lesson.id}`}
                  disabled={Boolean(downloadingId)}
                  sx={{ minWidth: 44, minHeight: 44 }}
                  aria-label={`Baixar PDF de ${lesson.theme}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    onDownload();
                  }}
                >
                  {downloadingId === lesson.id ? (
                    <CircularProgress data-testid="ai-lesson-download-loading" size={20} aria-label="Baixando PDF" />
                  ) : (
                    <PdfIcon fontSize="small" />
                  )}
                </IconButton>
              </span>
            </Tooltip>
          )}

          {canDeleteLesson(lesson) && (
            <Tooltip
              title={generating ? PRODUCTION_LIST_TEXTS.deleteBlockedTooltip : PRODUCTION_LIST_TEXTS.deleteTooltip}
            >
              <span>
                <IconButton
                  data-testid={`ai-lessons-delete-action-${lesson.id}`}
                  color="error"
                  disabled={generating}
                  sx={{ minWidth: 44, minHeight: 44 }}
                  aria-label={`Excluir lição ${lesson.theme}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    onDelete();
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          )}
        </Stack>
      }
    />
  );
};
