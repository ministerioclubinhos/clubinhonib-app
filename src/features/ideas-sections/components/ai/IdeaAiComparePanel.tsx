import { Alert, Box, Button, Divider, Stack, Typography } from '@mui/material';

import { MediaType } from '@/store/slices/types';
import {
  IdeaAiDecision,
  IdeaAiMediaStatus,
  IdeaAiSkipReason,
  IdeaAiSnapshotSource,
  IdeaAiTextField,
  type IdeaAiCompareProps,
  type IdeaAiDecisions,
} from '../../types';
import { ideaAiChosenText, initialIdeaAiDecisions } from '../../ai-utils';
import { IDEA_AI_TEXT_LABELS } from '../../ai-constants';
import { IDEA_REVIEW_MAX_DESCRIPTION, IDEA_REVIEW_MAX_TITLE } from '../../constants';
import IdeaAiMediaNotice from './IdeaAiMediaNotice';
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
  text,
  onTextChange,
  disabled,
}: IdeaAiCompareProps) {
  const detail = section.aiEnhancement;
  const original = detail?.snapshot ?? {
    title: section.title,
    description: section.description,
    medias: section.medias,
    source: IdeaAiSnapshotSource.LEGACY_CAPTURE,
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
    const title = enhancedOrOriginal(Boolean(result?.enhancedTitle));
    const description = enhancedOrOriginal(result?.enhancedDescription != null);
    onTextChange({
      title: ideaAiChosenText(title, original.title, result?.enhancedTitle ?? null),
      description: ideaAiChosenText(
        description,
        original.description,
        result?.enhancedDescription ?? null
      ),
    });
    onChange({
      ...base,
      title,
      description,
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

      {/* Tentativas antigas não têm veredito por campo: o aviso vale para os dois. */}
      {!result?.textGuard?.fields && <IdeaAiGuardWarning guard={result?.textGuard} />}
      <IdeaAiTextCompare
        field={IdeaAiTextField.TITLE}
        label={IDEA_AI_TEXT_LABELS.title}
        original={original.title}
        enhanced={result?.enhancedTitle ?? null}
        decision={decisions?.title ?? IdeaAiDecision.ORIGINAL}
        guard={result?.textGuard?.fields?.title}
        value={text.title}
        maxLength={IDEA_REVIEW_MAX_TITLE}
        onValueChange={(title) => onTextChange({ title })}
        disabled={disabled || !decisions}
        onChange={(title) => {
          if (!decisions) return;
          onChange({ ...decisions, title });
          onTextChange({
            title: ideaAiChosenText(title, original.title, result?.enhancedTitle ?? null),
          });
        }}
      />
      <IdeaAiTextCompare
        field={IdeaAiTextField.DESCRIPTION}
        label={IDEA_AI_TEXT_LABELS.description}
        original={original.description}
        enhanced={result?.enhancedDescription ?? null}
        decision={decisions?.description ?? IdeaAiDecision.ORIGINAL}
        guard={result?.textGuard?.fields?.description}
        value={text.description}
        maxLength={IDEA_REVIEW_MAX_DESCRIPTION}
        onValueChange={(description) => onTextChange({ description })}
        disabled={disabled || !decisions}
        onChange={(description) => {
          if (!decisions) return;
          onChange({ ...decisions, description });
          onTextChange({
            description: ideaAiChosenText(
              description,
              original.description,
              result?.enhancedDescription ?? null
            ),
          });
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
            {media.mediaType === MediaType.IMAGE ? (
              <IdeaAiImageCompare
                original={media}
                result={improved}
                decision={decision}
                onChange={(value) => changeMedia(media.id, value)}
                disabled={disabled || !decisions || excluded}
              />
            ) : media.mediaType === MediaType.DOCUMENT ? (
              <IdeaAiDocumentCompare
                original={media}
                result={improved}
                decision={decision}
                onChange={(value) => changeMedia(media.id, value)}
                disabled={disabled || !decisions || excluded}
              />
            ) : (
              <Button
                data-testid="idea-ai-video-link"
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
              <IdeaAiMediaNotice result={improved} baseAttempt={result?.baseAttempt ?? null} />
              {(improved?.status === IdeaAiMediaStatus.SKIPPED ||
                improved?.status === IdeaAiMediaStatus.FAILED ||
                media.mediaType === MediaType.VIDEO) && (
                <IdeaAiSkippedNotice
                  reason={improved?.skipReason ?? IdeaAiSkipReason.NOT_SUPPORTED}
                  failed={improved?.status === IdeaAiMediaStatus.FAILED}
                  errorCode={improved?.errorCode}
                />
              )}
            </Box>
          </Box>
        );
      })}
    </Stack>
  );
}
