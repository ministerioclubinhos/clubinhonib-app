import { useEffect, useState } from 'react';
import { AutoAwesome, EditOutlined, Replay } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Select,
  Stack,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
} from '@mui/material';

import {
  STORY_VISUAL_MAX_QUANTITY,
  STORY_VISUAL_MIN_QUANTITY,
  STORY_VISUAL_SETUP_STEPS,
} from '../constants';
import { LessonVisualOrientation, LessonVisualType, StoryVisualConfigurationProps } from '../types';

const VISUAL_TYPE_OPTIONS = [
  {
    value: LessonVisualType.STORY_SEQUENCE,
    title: 'Contar a história em sequência',
    description: 'Mostra os principais momentos na ordem em que acontecem.',
  },
  {
    value: LessonVisualType.CHARACTER_AND_EMOTION,
    title: 'Destacar personagens e emoções',
    description: 'Dá mais atenção às pessoas, ações e emoções de cada trecho.',
  },
  {
    value: LessonVisualType.VISUAL_ANCHORS,
    title: 'Usar imagens fáceis de lembrar',
    description: 'Transforma cada trecho em uma imagem simples e marcante.',
  },
  {
    value: LessonVisualType.INTERACTIVE_COLORING,
    title: 'Criar cenas para colorir',
    description: 'Gera desenhos em preto e branco, próprios para pintura.',
  },
] as const;

const visualTypeLabel = (value: LessonVisualType | ''): string =>
  VISUAL_TYPE_OPTIONS.find((option) => option.value === value)?.title ?? 'Não escolhido';

export const StoryVisualConfiguration = ({
  visualType,
  visualOrientation,
  visualQuantity,
  instructions,
  hasVersion,
  isGenerating,
  canGenerate,
  onVisualTypeChange,
  onVisualOrientationChange,
  onVisualQuantityChange,
  onInstructionsChange,
  onGenerate,
}: StoryVisualConfigurationProps) => {
  const [step, setStep] = useState(0);
  const [editing, setEditing] = useState(!hasVersion);
  const [regenerateDialogOpen, setRegenerateDialogOpen] = useState(false);

  useEffect(() => {
    if (hasVersion) setEditing(false);
  }, [hasVersion]);

  const validQuantity =
    typeof visualQuantity === 'number' &&
    Number.isInteger(visualQuantity) &&
    visualQuantity >= STORY_VISUAL_MIN_QUANTITY &&
    visualQuantity <= STORY_VISUAL_MAX_QUANTITY;
  const stepComplete =
    step === 0 ? validQuantity : step === 1 ? Boolean(visualType) : Boolean(visualOrientation);
  const configurationComplete = Boolean(validQuantity && visualType && visualOrientation);

  const generate = () => {
    setRegenerateDialogOpen(false);
    setEditing(false);
    onGenerate();
  };

  if (hasVersion && !editing) {
    return (
      <Paper
        data-testid="ai-story-visual-configuration-summary"
        variant="outlined"
        sx={{ p: 2, mb: 3, borderRadius: 3 }}
      >
        <Typography fontWeight={800}>Configuração dos visuais</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {visualQuantity || '—'} imagens · {visualTypeLabel(visualType)} ·{' '}
          {visualOrientation === LessonVisualOrientation.PORTRAIT ? 'Vertical' : 'Horizontal'}
        </Typography>
        <Button
          data-testid="ai-story-visual-regenerate-button"
          startIcon={<Replay />}
          variant="contained"
          disabled={!canGenerate || isGenerating}
          onClick={() => setRegenerateDialogOpen(true)}
          sx={{ mt: 2, minHeight: 44 }}
        >
          {isGenerating ? 'Gerando imagens…' : 'Regenerar imagens'}
        </Button>

        <Dialog
          data-testid="ai-story-visual-regenerate-dialog"
          open={regenerateDialogOpen}
          onClose={() => setRegenerateDialogOpen(false)}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>Como deseja regenerar?</DialogTitle>
          <DialogContent>
            <Typography color="text.secondary">
              Você pode manter quantidade, estilo e formato atuais ou revisar as escolhas passo a
              passo.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 2, flexWrap: 'wrap' }}>
            <Button onClick={() => setRegenerateDialogOpen(false)}>Cancelar</Button>
            <Button
              startIcon={<EditOutlined />}
              onClick={() => {
                setRegenerateDialogOpen(false);
                setStep(0);
                setEditing(true);
              }}
            >
              Alterar escolhas
            </Button>
            <Button variant="contained" onClick={generate} disabled={!configurationComplete}>
              Manter e regenerar
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    );
  }

  return (
    <Paper
      data-testid="ai-story-visual-configuration-steps"
      variant="outlined"
      sx={{ p: { xs: 2, sm: 3 }, mb: 3, borderRadius: 3 }}
    >
      <Typography variant="h6" fontWeight={800}>
        Preparar os visuais da história
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2.5 }}>
        Você escolhe como quer as imagens. A IA lê toda a lição e decide onde dividir a história.
      </Typography>

      <Stepper activeStep={step} alternativeLabel sx={{ mb: 3 }}>
        {STORY_VISUAL_SETUP_STEPS.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Box sx={{ minHeight: 180 }}>
        {step === 0 && (
          <TextField
            data-testid="ai-story-visual-quantity"
            fullWidth
            type="number"
            label="Quantidade de imagens"
            value={visualQuantity}
            error={visualQuantity !== '' && !validQuantity}
            helperText={
              visualQuantity !== '' && !validQuantity
                ? 'Informe um número de 4 a 10.'
                : 'A IA dividirá toda a lição em 4 a 10 partes, conforme o número informado.'
            }
            slotProps={{
              htmlInput: {
                min: STORY_VISUAL_MIN_QUANTITY,
                max: STORY_VISUAL_MAX_QUANTITY,
                step: 1,
                inputMode: 'numeric',
              },
            }}
            onChange={(event) =>
              onVisualQuantityChange(event.target.value === '' ? '' : Number(event.target.value))
            }
          />
        )}

        {step === 1 && (
          <RadioGroup
            value={visualType}
            onChange={(event) => onVisualTypeChange(event.target.value as LessonVisualType)}
          >
            <Stack spacing={1}>
              {VISUAL_TYPE_OPTIONS.map((option) => (
                <Paper key={option.value} variant="outlined" sx={{ px: 1.5, py: 1 }}>
                  <FormControlLabel
                    value={option.value}
                    control={<Radio />}
                    label={
                      <Box>
                        <Typography fontWeight={700}>{option.title}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {option.description}
                        </Typography>
                      </Box>
                    }
                    sx={{ m: 0, width: '100%' }}
                  />
                </Paper>
              ))}
            </Stack>
          </RadioGroup>
        )}

        {step === 2 && (
          <FormControl fullWidth>
            <InputLabel id="story-visual-orientation-label">Formato da página</InputLabel>
            <Select
              data-testid="ai-story-visual-orientation"
              labelId="story-visual-orientation-label"
              label="Formato da página"
              value={visualOrientation}
              onChange={(event) =>
                onVisualOrientationChange(event.target.value as LessonVisualOrientation)
              }
            >
              <MenuItem value={LessonVisualOrientation.LANDSCAPE}>Horizontal — paisagem</MenuItem>
              <MenuItem value={LessonVisualOrientation.PORTRAIT}>Vertical — retrato</MenuItem>
            </Select>
            {configurationComplete && (
              <Alert severity="success" sx={{ mt: 2 }}>
                Serão {visualQuantity} imagens em formato{' '}
                {visualOrientation === LessonVisualOrientation.PORTRAIT ? 'vertical' : 'horizontal'}
                , no estilo “{visualTypeLabel(visualType)}”.
              </Alert>
            )}
            <TextField
              fullWidth
              multiline
              minRows={2}
              label="Alguma orientação extra? (opcional)"
              placeholder="Ex.: use cores mais suaves ou destaque um personagem."
              value={instructions}
              onChange={(event) => onInstructionsChange(event.target.value)}
              slotProps={{ htmlInput: { maxLength: 1000 } }}
              helperText={`${instructions.length}/1000 caracteres`}
              sx={{ mt: 2 }}
            />
          </FormControl>
        )}
      </Box>

      <Stack direction="row" justifyContent="space-between" spacing={1} sx={{ mt: 2 }}>
        <Button
          disabled={step === 0}
          onClick={() => setStep((current) => Math.max(0, current - 1))}
        >
          Voltar
        </Button>
        {step < STORY_VISUAL_SETUP_STEPS.length - 1 ? (
          <Button
            variant="contained"
            disabled={!stepComplete}
            onClick={() => setStep((current) => current + 1)}
          >
            Continuar
          </Button>
        ) : (
          <Button
            data-testid="ai-story-visual-generate-button"
            startIcon={<AutoAwesome />}
            variant="contained"
            disabled={!configurationComplete || !canGenerate || isGenerating}
            onClick={generate}
          >
            {isGenerating
              ? 'Gerando imagens…'
              : hasVersion
                ? 'Aplicar e regenerar'
                : 'Gerar imagens'}
          </Button>
        )}
      </Stack>
    </Paper>
  );
};
