import { useMemo } from 'react';
import AutoAwesomeOutlined from '@mui/icons-material/AutoAwesomeOutlined';
import SubjectRoundedIcon from '@mui/icons-material/SubjectRounded';
import TitleRoundedIcon from '@mui/icons-material/TitleRounded';
import { alpha } from '@mui/material/styles';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import { Box, Paper, Stack, TextField, Typography } from '@mui/material';
import {
  IdeaAiDecision,
  IdeaAiTextField,
  IdeaWordDiffKind,
  type IdeaAiTextCompareProps,
} from '../../types';
import {
  ideaAiChosenText,
  ideaDiffChangeRatio,
  ideaWordDiff,
  isIdeaTextEdited,
} from '../../ai-utils';
import IdeaAiDiffSide from './IdeaAiDiffSide';
import {
  IDEA_AI_DESCRIPTION_ROWS,
  IDEA_AI_DIFF_REWRITE_RATIO,
  IDEA_AI_DIFF_TEXT_SX,
  IDEA_AI_FIELD_ACCENTS,
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
  const accent = IDEA_AI_FIELD_ACCENTS[field];
  const chosenOriginal = decision === IdeaAiDecision.ORIGINAL || !hasEnhanced;
  const chosenEnhanced = hasEnhanced && decision === IdeaAiDecision.ENHANCED;
  const paneSx = (chosen: boolean, color: 'primary' | 'success') =>
    ({
      minWidth: 0,
      borderRadius: 2.5,
      overflow: 'hidden',
      borderWidth: 2,
      borderStyle: 'solid',
      borderColor: chosen ? `${color}.main` : 'divider',
      bgcolor: 'background.paper',
      display: 'flex',
      flexDirection: 'column',
    }) as const;
  const labelSx = { display: 'flex', alignItems: 'center', gap: 0.75, px: 1.5, pt: 1.25 } as const;
  const textSx = {
    ...IDEA_AI_DIFF_TEXT_SX,
    px: 1.5,
    py: 1,
    lineHeight: 1.65,
    whiteSpace: 'pre-wrap',
    overflowWrap: 'anywhere',
  } as const;
  return (
    <Paper
      data-testid={`idea-ai-text-compare-${field}`}
      variant="outlined"
      sx={{ p: { xs: 1.5, md: 2 }, borderRadius: 3, minWidth: 0 }}
    >
      <Stack spacing={1.75}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ sm: 'center' }}
          gap={1.25}
        >
          <Stack direction="row" alignItems="center" spacing={1.25}>
            <Box
              aria-hidden
              sx={(theme) => ({
                width: 32,
                height: 32,
                borderRadius: 2,
                display: 'grid',
                placeItems: 'center',
                color: `${accent}.main`,
                bgcolor: alpha(theme.palette[accent].main, 0.12),
              })}
            >
              {field === IdeaAiTextField.TITLE ? (
                <TitleRoundedIcon fontSize="small" />
              ) : (
                <SubjectRoundedIcon fontSize="small" />
              )}
            </Box>
            <Typography
              component="h3"
              fontWeight={800}
              sx={{ fontSize: { xs: 17, md: 18 }, color: 'text.primary' }}
            >
              {label}
            </Typography>
          </Stack>
          <IdeaAiChoice
            label={label}
            decision={decision}
            enhanced={hasEnhanced}
            onChange={onChange}
            disabled={disabled}
          />
        </Stack>
        <IdeaAiGuardWarning guard={guard} />
        {/* Original | Versão da IA | Texto final: lado a lado no desktop, empilhados no celular. */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'minmax(0, 1fr)',
              md: hasEnhanced ? 'repeat(3, minmax(0, 1fr))' : 'repeat(2, minmax(0, 1fr))',
            },
            alignItems: 'stretch',
            gap: 1.5,
          }}
        >
          <Box
            data-testid={`idea-ai-text-original-${field}`}
            sx={paneSx(chosenOriginal, 'primary')}
          >
            <Box sx={labelSx}>
              <Typography variant="caption" fontWeight={800} color="text.secondary">
                ORIGINAL DO PROFESSOR
              </Typography>
              {chosenOriginal && hasEnhanced && (
                <CheckCircleRoundedIcon
                  sx={{ fontSize: 16 }}
                  color="primary"
                  aria-label="Escolhida"
                />
              )}
            </Box>
            <Typography component="div" sx={{ ...textSx, color: 'text.secondary' }}>
              {highlight ? (
                <IdeaAiDiffSide parts={diff} marked={IdeaWordDiffKind.REMOVED} />
              ) : (
                original
              )}
            </Typography>
          </Box>
          {hasEnhanced && (
            <Box data-testid={`idea-ai-text-diff-${field}`} sx={paneSx(chosenEnhanced, 'success')}>
              <Box sx={labelSx}>
                <AutoAwesomeOutlined sx={{ fontSize: 16 }} color="success" />
                <Typography variant="caption" fontWeight={800} color="success.main">
                  MELHORADA PELA IA
                </Typography>
                {chosenEnhanced && (
                  <CheckCircleRoundedIcon
                    sx={{ fontSize: 16 }}
                    color="success"
                    aria-label="Escolhida"
                  />
                )}
              </Box>
              <Typography component="div" sx={textSx}>
                {highlight ? (
                  <IdeaAiDiffSide parts={diff} marked={IdeaWordDiffKind.ADDED} />
                ) : (
                  enhanced
                )}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: 'block', px: 1.5, pb: 1.25, mt: 'auto' }}
              >
                {highlight
                  ? 'Sublinhado: acrescentado pela IA · Riscado no original: removido'
                  : 'A IA reorganizou o texto: compare as versões lado a lado.'}
              </Typography>
            </Box>
          )}
          <Box sx={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Typography
              variant="caption"
              fontWeight={800}
              sx={{ px: 0.5, color: `${accent}.main` }}
            >
              TEXTO FINAL · VAI AO AR
            </Typography>
            <TextField
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
                      ? 'Editado por você. Trocar Original/Versão IA volta ao texto da versão.'
                      : `Ajuste se quiser (${value.length}/${maxLength}).`
              }
              inputProps={{
                'aria-label': IDEA_AI_FINAL_TEXT_LABELS[field],
                'data-testid': `idea-ai-final-${field}`,
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2.5,
                  fontSize: 16,
                  lineHeight: 1.65,
                  bgcolor: 'grey.50',
                  alignItems: 'flex-start',
                },
              }}
            />
          </Box>
        </Box>
        {!hasEnhanced && (
          <Typography variant="caption" color="text.secondary">
            Nenhuma melhoria aprovada para este campo.
          </Typography>
        )}
      </Stack>
    </Paper>
  );
}
