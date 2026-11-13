import { useMemo } from 'react';
import { Box, Paper, Stack, TextField, Typography } from '@mui/material';
import { IdeaAiTextField, IdeaWordDiffKind, type IdeaAiTextCompareProps } from '../../types';
import {
  ideaAiChosenText,
  ideaDiffChangeRatio,
  ideaWordDiff,
  isIdeaTextEdited,
} from '../../ai-utils';
import IdeaAiDiffSide from './IdeaAiDiffSide';
import {
  IDEA_AI_COMPARE_COLUMNS,
  IDEA_AI_DESCRIPTION_ROWS,
  IDEA_AI_DIFF_REWRITE_RATIO,
  IDEA_AI_DIFF_TEXT_SX,
  IDEA_AI_FINAL_TEXT_LABELS,
} from '../../ai-constants';
import IdeaAiChoice from './IdeaAiChoice';
import IdeaAiGuardWarning from './IdeaAiGuardWarning';

/**
 * Original × versão da IA de um campo, e o texto final editável.
 *
 * O destaque não depende só de cor: inserções usam `<ins>` (sublinhado) e
 * remoções `<del>` (riscado), que leitores de tela anunciam.
 */
export default function IdeaAiTextCompare({
  field,
  label,
  original,
  enhanced,
  decision,
  onChange,
  value,
  maxLength,
  onValueChange,
  guard,
  disabled,
}: IdeaAiTextCompareProps) {
  const hasEnhanced = enhanced !== null;
  const diff = useMemo(
    () => (enhanced === null ? [] : ideaWordDiff(original, enhanced)),
    [original, enhanced]
  );
  const rewritten = ideaDiffChangeRatio(diff) > IDEA_AI_DIFF_REWRITE_RATIO;
  const highlight = hasEnhanced && !rewritten;
  const base = ideaAiChosenText(decision, original, enhanced);
  const edited = isIdeaTextEdited(base, value);
  const tooLong = value.length > maxLength;
  return (
    <Stack data-testid={`idea-ai-text-compare-${field}`} spacing={1.5}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ sm: 'center' }}
        gap={1}
      >
        <Typography component="h3" variant="subtitle1" fontWeight={700}>
          {label}
        </Typography>
        <IdeaAiChoice
          label={label}
          decision={decision}
          enhanced={hasEnhanced}
          onChange={onChange}
          disabled={disabled}
        />
      </Stack>
      <IdeaAiGuardWarning guard={guard} />
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: hasEnhanced ? IDEA_AI_COMPARE_COLUMNS : 'minmax(0, 1fr)',
          gap: 2,
        }}
      >
        <Paper
          data-testid={`idea-ai-text-original-${field}`}
          variant="outlined"
          sx={{ p: 2, bgcolor: 'action.hover', minWidth: 0 }}
        >
          <Typography variant="overline" color="text.secondary">
            Original
          </Typography>
          <Typography sx={{ ...IDEA_AI_DIFF_TEXT_SX, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
            {highlight ? <IdeaAiDiffSide parts={diff} marked={IdeaWordDiffKind.REMOVED} /> : original}
          </Typography>
        </Paper>
        {hasEnhanced && (
          <Paper
            data-testid={`idea-ai-text-diff-${field}`}
            variant="outlined"
            sx={{ p: 2, minWidth: 0, borderColor: 'success.light' }}
          >
            <Typography variant="overline" color="success.main">
              Melhorada pela IA
            </Typography>
            <Typography sx={{ ...IDEA_AI_DIFF_TEXT_SX, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
              {highlight ? <IdeaAiDiffSide parts={diff} marked={IdeaWordDiffKind.ADDED} /> : enhanced}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
              {highlight
                ? 'Sublinhado aqui: acrescentado pela IA · Riscado no original: removido'
                : 'A IA reorganizou o texto: compare as duas versões lado a lado.'}
            </Typography>
          </Paper>
        )}
      </Box>
      {!hasEnhanced && (
        <Typography variant="caption" color="text.secondary">
          Nenhuma melhoria aprovada para este campo.
        </Typography>
      )}
      <TextField
        label={IDEA_AI_FINAL_TEXT_LABELS[field]}
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        disabled={disabled}
        fullWidth
        multiline={field !== IdeaAiTextField.TITLE}
        minRows={field === IdeaAiTextField.TITLE ? undefined : IDEA_AI_DESCRIPTION_ROWS}
        error={tooLong || !value.trim()}
        helperText={
          !value.trim()
            ? 'Este campo não pode ficar vazio.'
            : tooLong
              ? `Use no máximo ${maxLength} caracteres.`
              : edited
                ? 'Você editou a versão escolhida. Trocar entre Original e Versão IA volta ao texto da versão.'
                : `Texto da versão escolhida. Você pode ajustar antes de publicar (${value.length}/${maxLength}).`
        }
        inputProps={{ 'data-testid': `idea-ai-final-${field}` }}
      />
    </Stack>
  );
}
