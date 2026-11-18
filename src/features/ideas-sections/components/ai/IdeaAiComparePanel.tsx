import { useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from '@mui/material';

import {
  IdeaAiDecision,
  IdeaAiSnapshotSource,
  IdeaAiTextField,
  type IdeaAiCompareProps,
  type IdeaAiDecisions,
} from '../../types';
import { ideaAiChosenText, initialIdeaAiDecisions, isIdeaTextEdited } from '../../ai-utils';
import { IDEA_AI_TEXT_LABELS } from '../../ai-constants';
import { IDEA_REVIEW_MAX_DESCRIPTION, IDEA_REVIEW_MAX_TITLE } from '../../constants';
import IdeaAiTextCompare from './IdeaAiTextCompare';
import IdeaAiGuardWarning from './IdeaAiGuardWarning';

/**
 * Etapa 2: item a item, o que vai para a publicação.
 *
 * Só entra em tela quando existe um resultado da IA para comparar; sem ele a
 * revisão edita o texto direto, em vez de mostrar colunas vazias ao lado do
 * original.
 */
export default function IdeaAiComparePanel({
  section,
  decisions,
  onChange,
  text,
  onTextChange,
  disabled,
}: IdeaAiCompareProps) {
  // Decisão em espera: "usar tudo" / "manter original" apagam o texto editado.
  const [pendingAll, setPendingAll] = useState<IdeaAiDecision | null>(null);
  const detail = section.aiEnhancement;
  const original = detail?.snapshot ?? {
    title: section.title,
    description: section.description,
    medias: section.medias,
    source: IdeaAiSnapshotSource.LEGACY_CAPTURE,
  };
  const result = detail?.currentResult;
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

  const textEdited =
    isIdeaTextEdited(
      ideaAiChosenText(
        decisions?.title ?? IdeaAiDecision.ORIGINAL,
        original.title,
        result?.enhancedTitle ?? null
      ),
      text.title
    ) ||
    isIdeaTextEdited(
      ideaAiChosenText(
        decisions?.description ?? IdeaAiDecision.ORIGINAL,
        original.description,
        result?.enhancedDescription ?? null
      ),
      text.description
    );
  const requestApplyToAll = (decision: IdeaAiDecision) => {
    if (textEdited) setPendingAll(decision);
    else applyToAll(decision);
  };

  return (
    <Stack data-testid="idea-ai-compare-panel" spacing={2.5}>
      <Stack direction="row" alignItems="center" flexWrap="wrap" gap={1}>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ width: { xs: '100%', sm: 'auto' } }}
        >
          Aplicar a tudo:
        </Typography>
        <Button
          type="button"
          data-testid="idea-ai-use-all"
          variant="outlined"
          size="small"
          disabled={disabled}
          sx={{ minHeight: 44, textTransform: 'none', flex: { xs: 1, sm: 'none' } }}
          onClick={() => requestApplyToAll(IdeaAiDecision.ENHANCED)}
        >
          Usar todas as melhorias
        </Button>
        <Button
          type="button"
          data-testid="idea-ai-use-original"
          variant="outlined"
          size="small"
          disabled={disabled}
          sx={{ minHeight: 44, textTransform: 'none', flex: { xs: 1, sm: 'none' } }}
          onClick={() => requestApplyToAll(IdeaAiDecision.ORIGINAL)}
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

      <Dialog
        data-testid="idea-ai-replace-text-dialog"
        open={pendingAll !== null}
        onClose={() => setPendingAll(null)}
      >
        <DialogTitle>Substituir o texto que você editou?</DialogTitle>
        <DialogContent>
          Você ajustou o título ou a descrição à mão. Esta ação volta os dois campos e as escolhas
          dos materiais para{' '}
          {pendingAll === IdeaAiDecision.ENHANCED ? 'a versão da IA' : 'o original'}, e o que você
          digitou se perde.
        </DialogContent>
        <DialogActions>
          <Button
            type="button"
            data-testid="idea-ai-replace-text-cancel"
            onClick={() => setPendingAll(null)}
            sx={{ minHeight: 44 }}
          >
            Manter minha edição
          </Button>
          <Button
            type="button"
            data-testid="idea-ai-replace-text-confirm"
            color="warning"
            onClick={() => {
              if (pendingAll) applyToAll(pendingAll);
              setPendingAll(null);
            }}
            sx={{ minHeight: 44 }}
          >
            Substituir
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
