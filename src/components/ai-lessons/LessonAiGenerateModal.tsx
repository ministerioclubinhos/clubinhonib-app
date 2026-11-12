import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  CircularProgress,
  Typography,
  Alert,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import { AutoAwesome as AiIcon } from '@mui/icons-material';
import {
  LESSON_REFERENCE_MAX_LENGTH,
  LESSON_REFERENCE_MIN_LENGTH,
  LESSON_THEME_MAX_LENGTH,
  LESSON_SPECIAL_CONTEXT_MAX_LENGTH,
  LESSON_THEME_MIN_LENGTH,
} from '@/features/ai-lessons/constants';
import { LessonCategory, type LessonAiGenerateModalProps } from '@/features/ai-lessons/types';
import { aiLessonsService } from '@/features/ai-lessons/api';
import { duplicateWeekWarning } from '@/features/ai-lessons/production-list.utils';
import { aiLessonsKeys } from '@/features/ai-lessons/queryKeys';
import { useDebouncedValue } from '@/hooks/useListingQuery';
import { useGenerateLessonDraft } from '../../hooks/api/useAiLessons';

export const LessonAiGenerateModal: React.FC<LessonAiGenerateModalProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const [lessonTheme, setLessonTheme] = useState('');
  const [biblicalReference, setBiblicalReference] = useState('');
  const [weekNumber, setWeekNumber] = useState<number | ''>('');
  const [category, setCategory] = useState<LessonCategory>(LessonCategory.REGULAR);
  const [specialContext, setSpecialContext] = useState('');

  const generateMutation = useGenerateLessonDraft();

  const trimmedTheme = lessonTheme.trim();
  const trimmedReference = biblicalReference.trim();
  const isThemeValid =
    trimmedTheme.length >= LESSON_THEME_MIN_LENGTH &&
    trimmedTheme.length <= LESSON_THEME_MAX_LENGTH;
  const isReferenceValid =
    trimmedReference.length >= LESSON_REFERENCE_MIN_LENGTH &&
    trimmedReference.length <= LESSON_REFERENCE_MAX_LENGTH;
  const isSpecial = category === LessonCategory.SPECIAL;
  const isWeekNumberValid =
    weekNumber === '' ? isSpecial : Number.isInteger(Number(weekNumber)) && Number(weekNumber) >= 1;
  const isFormValid = isThemeValid && isReferenceValid && isWeekNumberValid;

  // Semana repetida não impede a criação, mas quase sempre é engano: a tela
  // avisa antes, em vez de deixar a duplicidade aparecer só na publicação.
  const weekToCheck = useDebouncedValue(weekNumber, 400);
  const weekQuery = { weekNumber: Number(weekToCheck), limit: 10 };
  const sameWeek = useQuery({
    queryKey: aiLessonsKeys.drafts(weekQuery),
    queryFn: ({ signal }) => aiLessonsService.getDrafts(weekQuery, signal),
    enabled: open && weekToCheck !== '' && Number(weekToCheck) >= 1,
    staleTime: 15_000,
  });
  const weekWarning =
    weekToCheck === weekNumber
      ? duplicateWeekWarning(weekNumber, category, sameWeek.data?.items)
      : null;

  const handleGenerate = async () => {
    if (!isFormValid || generateMutation.isPending) return;

    try {
      const result = await generateMutation.mutateAsync({
        theme: trimmedTheme,
        biblicalReference: trimmedReference,
        category,
        weekNumber: weekNumber === '' ? undefined : Number(weekNumber),
        ...(isSpecial && specialContext.trim() ? { specialContext: specialContext.trim() } : {}),
      });

      onSuccess(result.id);
      handleCloseModal(true);
    } catch {
      // The failure is rendered from `generateMutation.error`; nothing to log here.
    }
  };

  const handleCloseModal = (force = false) => {
    if (!force && generateMutation.isPending) return;
    setLessonTheme('');
    setBiblicalReference('');
    setWeekNumber('');
    setCategory(LessonCategory.REGULAR);
    setSpecialContext('');
    generateMutation.reset();
    onClose();
  };

  return (
    <Dialog
      data-testid="ai-lessons-generate-modal"
      open={open}
      onClose={() => {
        if (!generateMutation.isPending) handleCloseModal();
      }}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: { xs: 2, sm: 3 },
            p: { xs: 0, sm: 1 },
            m: { xs: 1.5, sm: 4 },
            width: { xs: 'calc(100% - 24px)', sm: '100%' },
          },
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}>
        <AiIcon color="primary" /> Criar Pacote de Nova Lição
      </DialogTitle>

      <DialogContent dividers>
        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
          Qual tipo de material você deseja criar?
        </Typography>
        <ToggleButtonGroup
          data-testid="ai-lessons-category-selector"
          exclusive
          fullWidth
          color="primary"
          size="small"
          value={category}
          onChange={(_, value: LessonCategory | null) => {
            if (value) {
              setCategory(value);
            }
          }}
          disabled={generateMutation.isPending}
          sx={{ mb: 2.5, flexDirection: { xs: 'column', sm: 'row' } }}
        >
          <ToggleButton
            value={LessonCategory.REGULAR}
            data-testid="ai-lessons-category-regular"
            sx={{ textTransform: 'none', fontWeight: 700 }}
          >
            Material Semanal (8 itens)
          </ToggleButton>
          <ToggleButton
            value={LessonCategory.SPECIAL}
            data-testid="ai-lessons-category-special"
            sx={{ textTransform: 'none', fontWeight: 700 }}
          >
            Material Especial (3 itens)
          </ToggleButton>
        </ToggleButtonGroup>

        <Alert severity="info" sx={{ mb: 2.5, borderRadius: 2 }}>
          {isSpecial ? (
            <>
              O Material Especial produzirá três itens:{' '}
              <strong>1. Lição Especial + Versículo</strong> (conectando o tema e as referências
              bíblicas a uma história para os dias de hoje, com um jeito legal de contar),{' '}
              <strong>2. Visual da Lição</strong> (com dinâmica criativa de apresentação) e{' '}
              <strong>3. Visual do Versículo</strong>.
            </>
          ) : (
            <>
              Cada pacote produzirá oito itens separados seguindo o padrão histórico do Clubinho:
              lição, visuais, brincadeira, materiais do versículo, meditações e trabalho manual.
              Informe o <strong>Tema/Título</strong>, a <strong>semana</strong> e todas as{' '}
              <strong>Referências Bíblicas</strong>.
            </>
          )}
        </Alert>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <TextField
            label={isSpecial ? 'Tema / Título do Material Especial *' : 'Tema / Título da Lição *'}
            placeholder={
              isSpecial
                ? 'Ex: O Picolé Roubado / A Mentira no Recreio / O Plano da Salvação na Linha do Tempo'
                : 'Ex: A última ceia do Senhor com os discípulos'
            }
            fullWidth
            value={lessonTheme}
            onChange={(e) => setLessonTheme(e.target.value)}
            disabled={generateMutation.isPending}
            slotProps={{ htmlInput: { maxLength: LESSON_THEME_MAX_LENGTH } }}
            error={trimmedTheme.length > 0 && !isThemeValid}
            helperText={
              trimmedTheme.length > 0 && !isThemeValid
                ? `Informe entre ${LESSON_THEME_MIN_LENGTH} e ${LESSON_THEME_MAX_LENGTH} caracteres.`
                : undefined
            }
            InputProps={{ sx: { borderRadius: 2.5 } }}
          />

            <TextField
              data-testid="ai-lessons-week-number-input"
              label={isSpecial ? 'Número da semana (opcional)' : 'Número da semana *'}
              type="number"
              fullWidth
              value={weekNumber}
              onChange={(event) => {
                const value = event.target.value;
                setWeekNumber(value === '' ? '' : Math.max(1, Math.trunc(Number(value))));
              }}
              disabled={generateMutation.isPending}
              slotProps={{ htmlInput: { min: 1, step: 1 } }}
              error={weekNumber === '' ? false : !isWeekNumberValid}
              helperText={
                isSpecial
                  ? 'Opcional. Vazio gera o cabeçalho "LIÇÃO ESPECIAL"; preenchido gera "LIÇÃO ESPECIAL N".'
                  : 'Use o número editorial que aparecerá no PDF e no material semanal.'
              }
              InputProps={{ sx: { borderRadius: 2.5 } }}
            />

          {weekWarning && (
            <Alert data-testid="ai-lessons-week-duplicate-warning" severity="warning" sx={{ borderRadius: 2 }}>
              {weekWarning}
            </Alert>
          )}

          <TextField
            label={
              isSpecial
                ? 'Texto / Referências Bíblicas que conectam com a história *'
                : 'Texto / Referências Bíblicas *'
            }
            placeholder={
              isSpecial
                ? 'Ex: Êxodo 20:15; Efésios 4:27,28; Romanos 6:23; 1 Coríntios 15:3,4; Romanos 10:13'
                : 'Ex: Mateus 26:17-30 / Marcos 14:12-26 / Lucas 22:7-39'
            }
            multiline
            minRows={2}
            maxRows={4}
            fullWidth
            value={biblicalReference}
            onChange={(e) => setBiblicalReference(e.target.value)}
            disabled={generateMutation.isPending}
            slotProps={{ htmlInput: { maxLength: LESSON_REFERENCE_MAX_LENGTH } }}
            error={trimmedReference.length > 0 && !isReferenceValid}
            helperText={
              trimmedReference.length > 0 && !isReferenceValid
                ? `Informe entre ${LESSON_REFERENCE_MIN_LENGTH} e ${LESSON_REFERENCE_MAX_LENGTH} caracteres.`
                : 'Suporta múltiplas referências paralelas separadas por barra ( / ), ponto e vírgula ( ; ) ou quebra de linha.'
            }
            InputProps={{ sx: { borderRadius: 2.5 } }}
          />

          {isSpecial && (
            <TextField
              data-testid="ai-lessons-special-context-input"
              label="Ideia para a história nos dias de hoje / Jeito legal de contar (opcional)"
              placeholder="Ex: Três amigos, um picolé que sumiu e uma decisão difícil — como em “O Picolé Roubado”."
              multiline
              minRows={3}
              maxRows={8}
              fullWidth
              value={specialContext}
              onChange={(e) => setSpecialContext(e.target.value)}
              disabled={generateMutation.isPending}
              slotProps={{ htmlInput: { maxLength: LESSON_SPECIAL_CONTEXT_MAX_LENGTH } }}
              helperText="Descreva uma situação atual, personagens, dilema ou dinâmica de contação. Se ficar em branco, a IA criará uma história atual para crianças e um jeito criativo de contá-la, conectados ao tema e às referências."
              InputProps={{ sx: { borderRadius: 2.5 } }}
            />
          )}

          {generateMutation.isPending && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                p: 2,
                bgcolor: 'action.hover',
                borderRadius: 2,
              }}
            >
              <CircularProgress size={24} />
              <Typography variant="body2" color="text.secondary" fontWeight={500}>
                Criando o pacote de trabalho em rascunho...
              </Typography>
            </Box>
          )}

          {generateMutation.isError && (
            <Alert severity="error" sx={{ borderRadius: 2 }}>
              Ocorreu um erro ao criar a lição. Verifique os dados e tente novamente.
            </Alert>
          )}
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          px: { xs: 2, sm: 3 },
          pb: 2,
          flexDirection: { xs: 'column-reverse', sm: 'row' },
          '& > :not(style) ~ :not(style)': { ml: { xs: 0, sm: 1 }, mt: { xs: 1, sm: 0 } },
          '& .MuiButton-root': { width: { xs: '100%', sm: 'auto' } },
        }}
      >
        <Button
          onClick={() => handleCloseModal()}
          disabled={generateMutation.isPending}
          sx={{ borderRadius: 2, textTransform: 'none' }}
        >
          Cancelar
        </Button>
        <Button
          variant="contained"
          startIcon={<AiIcon />}
          onClick={handleGenerate}
          disabled={!isFormValid || generateMutation.isPending}
          sx={{ borderRadius: 2.5, px: 3, fontWeight: 700, textTransform: 'none' }}
        >
          {generateMutation.isPending ? 'Criando...' : 'Criar pacote da lição'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
