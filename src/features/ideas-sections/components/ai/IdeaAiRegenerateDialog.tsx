import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  FormLabel,
  Radio,
  RadioGroup,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { IdeaAiScope, type IdeaAiRegenerateDialogProps } from '../../types';
import {
  IDEA_AI_MAX_INSTRUCTIONS,
  IDEA_AI_SCOPE_HELP,
  IDEA_AI_SCOPE_LABELS,
  IDEA_AI_SCOPE_ORDER,
} from '../../ai-constants';
import {
  buildIdeaAiRequest,
  ideaAiAttemptsLeft,
  ideaAiHasFailedItems,
  ideaAiRegenerableMedias,
} from '../../ai-utils';

/**
 * Regeneração dirigida: o que refazer e uma orientação opcional. Mostra o
 * custo em tentativas antes de confirmar, porque cada pedido chama a IA.
 */
export default function IdeaAiRegenerateDialog({
  open,
  section,
  busy,
  onClose,
  onConfirm,
}: IdeaAiRegenerateDialogProps) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const detail = section.aiEnhancement;
  const current = detail?.currentResult ?? null;
  const medias = useMemo(() => ideaAiRegenerableMedias(detail), [detail]);
  const [scope, setScope] = useState(IdeaAiScope.FULL);
  const [mediaIds, setMediaIds] = useState<string[]>([]);
  const [instructions, setInstructions] = useState('');

  useEffect(() => {
    if (!open) return;
    setScope(current && ideaAiHasFailedItems(current) ? IdeaAiScope.FAILED : IdeaAiScope.FULL);
    setMediaIds([]);
    setInstructions('');
  }, [open, current]);

  const available: Record<IdeaAiScope, boolean> = {
    [IdeaAiScope.FULL]: true,
    [IdeaAiScope.TEXT]: Boolean(current),
    [IdeaAiScope.FAILED]: ideaAiHasFailedItems(current),
    [IdeaAiScope.MEDIA]: Boolean(current) && medias.length > 0,
  };
  const left = ideaAiAttemptsLeft(detail);
  const invalid =
    (scope === IdeaAiScope.MEDIA && !mediaIds.length) ||
    instructions.length > IDEA_AI_MAX_INSTRUCTIONS;

  return (
    <Dialog
      data-testid="idea-ai-regenerate-dialog"
      open={open}
      onClose={busy ? undefined : onClose}
      fullScreen={fullScreen}
      fullWidth
      maxWidth="sm"
      aria-labelledby="idea-ai-regenerate-title"
    >
      <DialogTitle id="idea-ai-regenerate-title">
        {current ? 'Regenerar com IA' : 'Melhorar ideia com IA'}
      </DialogTitle>
      <DialogContent dividers>
        <FormControl component="fieldset" fullWidth>
          <FormLabel component="legend">O que refazer</FormLabel>
          <RadioGroup
            value={scope}
            onChange={(event) => setScope(event.target.value as IdeaAiScope)}
          >
            {IDEA_AI_SCOPE_ORDER.map((option) => (
              <Box key={option} sx={{ mb: 1 }}>
                <FormControlLabel
                  value={option}
                  disabled={!available[option] || busy}
                  control={<Radio data-testid={`idea-ai-scope-${option.toLowerCase()}`} />}
                  label={IDEA_AI_SCOPE_LABELS[option]}
                  sx={{ minHeight: 44 }}
                />
                <FormHelperText sx={{ mt: -0.5, ml: 4 }}>{IDEA_AI_SCOPE_HELP[option]}</FormHelperText>
              </Box>
            ))}
          </RadioGroup>
        </FormControl>

        {scope === IdeaAiScope.MEDIA && (
          <FormControl component="fieldset" fullWidth sx={{ mt: 1 }}>
            <FormLabel component="legend">Materiais</FormLabel>
            <FormGroup>
              {medias.map((media) => (
                <FormControlLabel
                  key={media.id}
                  sx={{ minHeight: 44, overflowWrap: 'anywhere' }}
                  control={
                    <Checkbox
                      data-testid={`idea-ai-scope-media-${media.id}`}
                      checked={mediaIds.includes(media.id)}
                      disabled={busy}
                      onChange={(event) =>
                        setMediaIds((previous) =>
                          event.target.checked
                            ? [...previous, media.id]
                            : previous.filter((id) => id !== media.id)
                        )
                      }
                    />
                  }
                  label={media.originalName || media.title || 'Material'}
                />
              ))}
            </FormGroup>
            {!mediaIds.length && (
              <FormHelperText error>Marque ao menos um material.</FormHelperText>
            )}
          </FormControl>
        )}

        <TextField
          label="Orientação para a IA (opcional)"
          placeholder="Ex.: deixe a descrição mais curta e mantenha o tom acolhedor."
          value={instructions}
          onChange={(event) => setInstructions(event.target.value)}
          disabled={busy}
          fullWidth
          multiline
          minRows={2}
          sx={{ mt: 2 }}
          error={instructions.length > IDEA_AI_MAX_INSTRUCTIONS}
          helperText={`Vale para texto e documentos. A IA nunca muda a essência da ideia. ${instructions.length}/${IDEA_AI_MAX_INSTRUCTIONS}`}
          inputProps={{ 'data-testid': 'idea-ai-instructions' }}
        />

        <Alert severity="info" sx={{ mt: 2 }} data-testid="idea-ai-regenerate-cost">
          {left === null ? 'Usa 1 tentativa.' : `Usa 1 das ${left} tentativa(s) restantes.`}{' '}
          Cancelamentos e falhas de configuração ou da fila não contam. O original e o resultado
          atual continuam disponíveis.
        </Alert>
        {scope !== IdeaAiScope.FULL && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            O que não for refeito é aproveitado do resultado atual. Se algo refeito falhar, a versão
            anterior daquele item é mantida.
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button
          type="button"
          data-testid="idea-ai-regenerate-cancel"
          onClick={onClose}
          disabled={busy}
          sx={{ minHeight: 44 }}
        >
          Voltar
        </Button>
        <Button
          type="button"
          data-testid="idea-ai-regenerate-confirm"
          variant="contained"
          disabled={busy || invalid || left === 0}
          onClick={() => onConfirm(buildIdeaAiRequest(scope, mediaIds, instructions))}
          sx={{ minHeight: 44 }}
        >
          {busy ? 'Solicitando…' : 'Iniciar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
