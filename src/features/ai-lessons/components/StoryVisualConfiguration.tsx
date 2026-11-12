import { useEffect, useState } from 'react';
import { AutoAwesome, Replay } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
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
  LESSON_VISUAL_STYLE_OPTIONS,
  REGULAR_STORY_VISUAL_TYPES,
  STORY_VISUAL_MAX_QUANTITY,
  STORY_VISUAL_MIN_QUANTITY,
  STORY_VISUAL_SETUP_STEPS,
  cutoutKitSummary,
} from '../constants';
import { IMAGE_REGENERATION_TEXTS } from '../image-regeneration.constants';
import {
  LessonVisualOrientation,
  LessonVisualStyle,
  LessonVisualType,
  StoryVisualConfigurationProps,
} from '../types';

const VISUAL_TYPE_OPTIONS = [
  {
    value: LessonVisualType.CUTOUT_KIT,
    title: 'Kit de recortes (padrão)',
    description:
      'Pranchas com personagens, animais, casas, cenário e objetos para recortar e montar.',
  },
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

/** In a weekly lesson the sequence option means complete scenes, one per excerpt. */
const REGULAR_SCENES_OPTION = {
  value: LessonVisualType.STORY_SEQUENCE,
  title: 'Cenas completas',
  description:
    'Uma ilustração inteira por trecho da história, com ambiente, personagens e a ação daquele momento.',
} as const;

const typeOptions = (isSpecial: boolean) =>
  isSpecial
    ? VISUAL_TYPE_OPTIONS.filter((option) => option.value !== LessonVisualType.CUTOUT_KIT)
    : VISUAL_TYPE_OPTIONS.filter((option) => REGULAR_STORY_VISUAL_TYPES.includes(option.value)).map(
        (option) =>
          option.value === LessonVisualType.STORY_SEQUENCE ? REGULAR_SCENES_OPTION : option
      );

const visualTypeLabel = (value: LessonVisualType | '', isSpecial: boolean): string =>
  typeOptions(isSpecial).find((option) => option.value === value)?.title ?? 'Não escolhido';

const visualStyleLabel = (value: LessonVisualStyle): string =>
  LESSON_VISUAL_STYLE_OPTIONS.find((option) => option.value === value)?.title ?? '';

export const StoryVisualConfiguration = ({
  visualType,
  isSpecial = false,
  visualOrientation,
  visualQuantity,
  visualStyle,
  instructions,
  hasVersion,
  isGenerating,
  canGenerate,
  onVisualTypeChange,
  onVisualOrientationChange,
  onVisualQuantityChange,
  onVisualStyleChange,
  onInstructionsChange,
  onGenerate,
  onRegenerate,
  editRequest,
}: StoryVisualConfigurationProps) => {
  const [step, setStep] = useState(0);
  const [editing, setEditing] = useState(!hasVersion);

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
  const isKit = !isSpecial && visualType !== LessonVisualType.STORY_SEQUENCE;
  const unitLabel = isKit ? 'pranchas' : 'imagens';

  // "Alterar escolhas" in the regeneration dialog reopens the steps from the start.
  useEffect(() => {
    if (editRequest === 0) return;
    setStep(0);
    setEditing(true);
  }, [editRequest]);

  const generate = () => {
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
          {visualQuantity || '—'} {unitLabel} · {visualTypeLabel(visualType, isSpecial)} ·{' '}
          {visualStyleLabel(visualStyle)} ·{' '}
          {visualOrientation === LessonVisualOrientation.PORTRAIT ? 'Vertical' : 'Horizontal'}
        </Typography>
        <Button
          data-testid="ai-story-visual-regenerate-button"
          startIcon={<Replay />}
          variant="contained"
          disabled={!canGenerate || isGenerating}
          onClick={onRegenerate}
          sx={{ mt: 2, minHeight: 48, width: { xs: '100%', sm: 'auto' }, fontWeight: 700 }}
        >
          {isGenerating ? 'Gerando imagens…' : IMAGE_REGENERATION_TEXTS.button}
        </Button>
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
        {isSpecial
          ? 'Você escolhe como quer as imagens. A IA lê toda a lição e decide onde dividir a história.'
          : 'Escolha entre o kit de recortes (padrão), em que a IA monta pranchas com todos os elementos da lição, e cenas completas, uma ilustração por trecho da história.'}
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
            label={isKit ? 'Número de pranchas' : 'Quantidade de imagens'}
            value={visualQuantity}
            error={visualQuantity !== '' && !validQuantity}
            helperText={
              visualQuantity !== '' && !validQuantity
                ? 'Informe um número de 4 a 10.'
                : !isKit
                  ? 'A IA dividirá toda a lição em 4 a 10 partes, conforme o número informado.'
                  : `Kit de recortes com 4 a 10 pranchas. ${cutoutKitSummary(Number(visualQuantity))}`
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
          <Stack spacing={2.5}>
            <RadioGroup
              aria-label="Tipo dos visuais"
              value={visualType}
              onChange={(event) => onVisualTypeChange(event.target.value as LessonVisualType)}
            >
              <Stack spacing={1}>
                {typeOptions(isSpecial).map((option) => (
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

            <Box>
              <Typography id="story-visual-style-label" fontWeight={800} sx={{ mb: 1 }}>
                Desenho
              </Typography>
              <RadioGroup
                data-testid="ai-story-visual-style"
                aria-labelledby="story-visual-style-label"
                value={visualStyle}
                onChange={(event) => onVisualStyleChange(event.target.value as LessonVisualStyle)}
              >
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                  {LESSON_VISUAL_STYLE_OPTIONS.map((option) => (
                    <Paper key={option.value} variant="outlined" sx={{ px: 1.5, py: 1, flex: 1 }}>
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
            </Box>
          </Stack>
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
                Serão {visualQuantity} {unitLabel} em formato{' '}
                {visualOrientation === LessonVisualOrientation.PORTRAIT ? 'vertical' : 'horizontal'}
                , como “{visualTypeLabel(visualType, isSpecial)}”, com desenho “
                {visualStyleLabel(visualStyle)}”.
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
          sx={{ minHeight: 48 }}
          disabled={step === 0}
          onClick={() => setStep((current) => Math.max(0, current - 1))}
        >
          Voltar
        </Button>
        {step < STORY_VISUAL_SETUP_STEPS.length - 1 ? (
          <Button
            variant="contained"
            sx={{ minHeight: 48, fontWeight: 700 }}
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
            sx={{ minHeight: 48, fontWeight: 700 }}
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
