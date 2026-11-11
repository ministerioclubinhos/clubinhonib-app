import { Alert, Box, Button, Divider, Stack, Typography } from '@mui/material';

import {
  IdeaAiDecision,
  IdeaAiMediaStatus,
  type IdeaAiCompareProps,
  type IdeaAiDecisions,
} from '../../types';
import { initialIdeaAiDecisions } from '../../ai-utils';
import IdeaAiTextCompare from './IdeaAiTextCompare';
import IdeaAiDocumentCompare from './IdeaAiDocumentCompare';
import IdeaAiImageCompare from './IdeaAiImageCompare';
import IdeaAiGuardWarning from './IdeaAiGuardWarning';
import IdeaAiSkippedNotice from './IdeaAiSkippedNotice';

/**
 * Etapa 2: item a item, o que vai para a publicação.
 *
 * Só entra em tela quando existe um resultado da IA para comparar; sem ele a
 * revisão edita o texto direto, em vez de mostrar colunas vazias ao lado do
 * original.
 */
export default function IdeaAiComparePanel({
  excludedMediaIds = [],
  section,
  decisions,
  onChange,
  disabled,
}: IdeaAiCompareProps) {
  const detail = section.aiEnhancement;
  const original = detail?.snapshot ?? {
    title: section.title,
    description: section.description,
    medias: section.medias,
    source: 'LEGACY_CAPTURE',
  };
  const result = detail?.currentResult;
  const changeMedia = (sourceMediaId: string, decision: IdeaAiDecision) => {
    if (decisions)
      onChange({
        ...decisions,
        medias: decisions.medias.map((m) =>
          m.sourceMediaId === sourceMediaId ? { ...m, decision } : m
        ),
      });
  };
  const applyToAll = (decision: IdeaAiDecision) => {
    const base: IdeaAiDecisions | null =
      decision === IdeaAiDecision.ENHANCED ? initialIdeaAiDecisions(detail) : decisions;
    if (!base) return;
    const enhancedOrOriginal = (available: boolean) =>
      available && decision === IdeaAiDecision.ENHANCED
        ? IdeaAiDecision.ENHANCED
        : IdeaAiDecision.ORIGINAL;
    onChange({
      ...base,
      title: enhancedOrOriginal(Boolean(result?.enhancedTitle)),
      description: enhancedOrOriginal(result?.enhancedDescription != null),
      medias: base.medias.map((m) => ({
        ...m,
        decision: enhancedOrOriginal(
          Boolean(result?.medias.find((r) => r.sourceMediaId === m.sourceMediaId)?.enhancedMedia)
        ),
      })),
    });
  };

  return (
    <Stack data-testid="idea-ai-compare-panel" spacing={2.5}>
      <Stack direction={{ xs: 'column', sm: 'row' }} gap={1} flexWrap="wrap">
        <Button
          type="button"
          data-testid="idea-ai-use-all"
          variant="outlined"
          disabled={disabled}
          sx={{ minHeight: 44, textTransform: 'none' }}
          onClick={() => applyToAll(IdeaAiDecision.ENHANCED)}
        >
          Usar todas as melhorias
        </Button>
        <Button
          type="button"
          data-testid="idea-ai-use-original"
          variant="outlined"
          disabled={disabled}
          sx={{ minHeight: 44, textTransform: 'none' }}
          onClick={() => applyToAll(IdeaAiDecision.ORIGINAL)}
        >
          Manter tudo original
        </Button>
      </Stack>

      <IdeaAiGuardWarning guard={result?.textGuard} />
      <IdeaAiTextCompare
        label="Título"
        original={original.title}
        enhanced={result?.enhancedTitle ?? null}
        decision={decisions?.title ?? IdeaAiDecision.ORIGINAL}
        disabled={disabled || !decisions}
        onChange={(title) => {
          if (decisions) onChange({ ...decisions, title });
        }}
      />
      <IdeaAiTextCompare
        label="Descrição"
        original={original.description}
        enhanced={result?.enhancedDescription ?? null}
        decision={decisions?.description ?? IdeaAiDecision.ORIGINAL}
        disabled={disabled || !decisions}
        onChange={(description) => {
          if (decisions) onChange({ ...decisions, description });
        }}
      />

      {original.medias.length > 0 && (
        <>
          <Divider />
          <Typography component="h3" variant="subtitle1" fontWeight={700}>
            Materiais enviados
          </Typography>
        </>
      )}
      {original.medias.map((media) => {
        const excluded = excludedMediaIds.includes(media.id);
        const improved = result?.medias.find((m) => m.sourceMediaId === media.id);
        const decision =
          decisions?.medias.find((m) => m.sourceMediaId === media.id)?.decision ??
          IdeaAiDecision.ORIGINAL;
        return (
          <Box key={media.id} data-testid="idea-ai-media-item" sx={{ minWidth: 0 }}>
            {excluded && (
              <Alert severity="info" sx={{ mb: 1 }}>
                Removido da publicação na etapa 3. O arquivo original continua preservado.
              </Alert>
            )}
            <Typography
              component="h4"
              variant="subtitle2"
              fontWeight={700}
              sx={{ mb: 1, overflowWrap: 'anywhere' }}
            >
              {media.originalName || media.title || 'Material'}
            </Typography>
            {media.mediaType === 'image' ? (
              <IdeaAiImageCompare
                original={media}
                result={improved}
                decision={decision}
                onChange={(value) => changeMedia(media.id, value)}
                disabled={disabled || !decisions || excluded}
              />
            ) : media.mediaType === 'document' ? (
              <IdeaAiDocumentCompare
                original={media}
                result={improved}
                decision={decision}
                onChange={(value) => changeMedia(media.id, value)}
                disabled={disabled || !decisions || excluded}
              />
            ) : (
              <Button
                component="a"
                href={media.url}
                target="_blank"
                rel="noreferrer"
                sx={{ minHeight: 44 }}
              >
                Assistir vídeo original
              </Button>
            )}
            <Box sx={{ mt: 1 }}>
              <IdeaAiGuardWarning guard={improved?.guard} />
              {(improved?.status === IdeaAiMediaStatus.SKIPPED ||
                improved?.status === IdeaAiMediaStatus.FAILED ||
                media.mediaType === 'video') && (
                <IdeaAiSkippedNotice
                  reason={improved?.skipReason ?? 'NOT_SUPPORTED'}
                  failed={improved?.status === IdeaAiMediaStatus.FAILED}
                />
              )}
            </Box>
          </Box>
        );
      })}
    </Stack>
  );
}
