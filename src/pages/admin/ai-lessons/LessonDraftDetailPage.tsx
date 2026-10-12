import {
  LessonConnectionState,
  LessonStageAction,
  LessonStatus,
} from '@/features/ai-lessons/types';
import {
  LESSON_STATUS_LABELS,
  PRODUCTION_COMPLETED_STATUSES,
} from '@/features/ai-lessons/constants';
import { lessonProductionActions } from '@/features/ai-lessons/workflow';
import { useLessonLocalDrafts } from '@/features/ai-lessons/useLessonLocalDrafts';
import { useStudioUnsavedChanges } from '@/features/ai-lessons/useStudioUnsavedChanges';
import { useLessonPdfPreview } from '@/features/ai-lessons/useLessonPdfPreview';
import { getHttpStatus } from '@/utils/apiError';
import { ManualWorkPreview } from '@/features/ai-lessons/manual-work-preview/ManualWorkPreview';
import { OlderMeditationEditor } from '@/features/ai-lessons/older-meditation-editor';
import { YoungerMeditationEditor } from '@/features/ai-lessons/younger-meditation-editor';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  alpha,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  LinearProgress,
  Paper,
  Stack,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import {
  ArrowBack,
  AutoAwesome,
  Check,
  DeleteOutline as DeleteIcon,
  PictureAsPdf,
  RateReview,
  EditNote,
  AutoStories,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import {
  useDeleteLessonDraft,
  useGenerateStage,
  useLessonDraft,
  useLessonDraftEvents,
  useStageAction,
  useUpdateDraftContent,
} from '@/hooks/api/useAiLessons';
import {
  LessonStage,
  LessonStageStatus,
  LessonStageType,
  LessonVisualOrientation,
  LessonVisualType,
} from '@/services/aiLessonsService';
import { LibreOfficeDocEditor } from '@/components/ai-lessons/LibreOfficeDocEditor';
import { StoryVisualCarousel } from '@/features/ai-lessons/components/StoryVisualCarousel';
import { StoryVisualConfiguration } from '@/features/ai-lessons/components/StoryVisualConfiguration';
import { objectValue, visualAssets } from '@/features/ai-lessons/utils';
import {
  LESSON_STAGE_DESCRIPTIONS as DESCRIPTIONS,
  LESSON_STAGE_LABELS as LABELS,
  LESSON_STAGE_STATUS_COLORS as STATUS_COLORS,
  LESSON_STAGE_STATUS_LABELS as STATUS_LABELS,
  localizeLegacyDocumentLabels,
} from './lessonDraftDetail.constants';
import { LessonDraftDialogs } from './components/LessonDraftDialogs';
import { LessonStageNavigation } from './components/LessonStageNavigation';

export const LessonDraftDetailPage: React.FC = () => {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();

  const { data: lesson, isLoading, error } = useLessonDraft(id);
  const connection = useLessonDraftEvents(id);
  const generate = useGenerateStage();
  const save = useUpdateDraftContent();
  const complete = useStageAction(LessonStageAction.COMPLETE);
  const deleteMutation = useDeleteLessonDraft();

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<LessonStageType>(LessonStageType.LESSON);
  const [instructions, setInstructions] = useState('');
  const [visualType, setVisualType] = useState<LessonVisualType | ''>('');
  const [visualOrientation, setVisualOrientation] = useState<LessonVisualOrientation | ''>('');
  const [visualQuantity, setVisualQuantity] = useState<number | ''>('');
  const [llmErrorOpen, setLlmErrorOpen] = useState(false);
  const preview = useLessonPdfPreview(id, selectedType);
  const { url: previewUrl, error: previewError, loading: previewLoading } = preview;
  const stage = useMemo(
    () => lesson?.stages.find((item) => item.type === selectedType),
    [lesson, selectedType]
  );
  const version = stage?.versions.find((item) => item.id === stage.currentVersionId);
  const local = useLessonLocalDrafts(id, stage, version);
  const edited = local.draft?.document;
  const confirmLeave = useStudioUnsavedChanges(local.hasDrafts || save.isPending);
  const document = useMemo(
    () =>
      localizeLegacyDocumentLabels(
        edited ?? version?.tiptapAstJson ?? { type: 'doc', content: [] }
      ),
    [edited, version?.tiptapAstJson]
  );
  const assets = stage ? visualAssets(version?.structuredDataJson, stage.type) : [];
  const approvedLessonStage = lesson?.stages.find((item) => item.type === LessonStageType.LESSON);
  const approvedLessonVersion = approvedLessonStage?.versions.find(
    (item) => item.id === approvedLessonStage.currentVersionId
  );
  const mainVerse = objectValue(approvedLessonVersion?.structuredDataJson?.memoryVerse);
  const generationLocked =
    generate.isPending ||
    Boolean(lesson?.stages.some((item) => item.status === LessonStageStatus.GENERATING));

  useEffect(() => {
    if (stage?.failureMessage) setLlmErrorOpen(true);
  }, [stage?.failureMessage]);

  useEffect(() => {
    if (selectedType !== LessonStageType.LESSON_VISUALS) return;
    const config = objectValue(version?.structuredDataJson?.visualConfig);
    setVisualType(
      Object.values(LessonVisualType).includes(config.type as LessonVisualType)
        ? (config.type as LessonVisualType)
        : ''
    );
    setVisualOrientation(
      Object.values(LessonVisualOrientation).includes(config.orientation as LessonVisualOrientation)
        ? (config.orientation as LessonVisualOrientation)
        : ''
    );
    setVisualQuantity(
      typeof config.quantity === 'number' && config.quantity >= 1 && config.quantity <= 10
        ? config.quantity
        : ''
    );
  }, [selectedType, version?.id]);

  if (isLoading) {
    return (
      <Box
        data-testid="ai-lessons-detail-loading"
        sx={{ display: 'grid', placeItems: 'center', py: 12 }}
      >
        <CircularProgress size={44} thickness={4} />
        <Typography color="text.secondary" sx={{ mt: 2, fontWeight: 500 }}>
          Carregando detalhes da lição...
        </Typography>
      </Box>
    );
  }

  if (error || !lesson) {
    return (
      <Box
        data-testid="ai-lessons-detail-error"
        sx={{ width: { xs: '98%', md: '95%' }, mx: 'auto', py: 3 }}
      >
        <Alert severity="error" sx={{ borderRadius: 3 }}>
          Não foi possível carregar os detalhes da lição.
        </Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => {
            if (confirmLeave()) navigate('/adm/estudio/licoes');
          }}
          sx={{ mt: 2 }}
        >
          Voltar para lições
        </Button>
      </Box>
    );
  }

  const actions = lessonProductionActions(
    lesson,
    stage,
    local.hasDrafts,
    save.isPending || complete.isPending || generate.isPending || deleteMutation.isPending
  );
  // Typing may continue during save; later edits keep their own draft revision.
  const editorEditable = lessonProductionActions(
    lesson,
    stage,
    false,
    complete.isPending || generate.isPending || deleteMutation.isPending
  ).canEdit;
  const canGenerate = actions.canGenerate;
  const approvedCount = lesson.stages.filter(
    (item) => item.status === LessonStageStatus.APPROVED
  ).length;
  const packageCompletedCount = lesson.stages.filter((item) =>
    PRODUCTION_COMPLETED_STATUSES.includes(item.status)
  ).length;
  const isFinalReview =
    lesson.status === LessonStatus.IN_REVIEW ||
    lesson.status === LessonStatus.READY_FOR_PUBLICATION ||
    lesson.status === LessonStatus.PUBLISHED;
  const progressCount = isFinalReview ? approvedCount : packageCompletedCount;
  const progress = lesson.stages.length ? (progressCount / lesson.stages.length) * 100 : 0;
  const action = (mutation: typeof complete, target: LessonStage) =>
    mutation.mutate({ id, stage: target.type });

  const generateSelectedStage = () => {
    if (!stage || !canGenerate) return;
    generate.mutate({
      id,
      payload: {
        stage: stage.type,
        revisionInstructions: instructions || undefined,
        ...(stage.type === LessonStageType.LESSON_VISUALS
          ? {
              visualType: visualType as LessonVisualType,
              visualOrientation: visualOrientation as LessonVisualOrientation,
              visualQuantity: Number(visualQuantity),
            }
          : {}),
      },
    });
  };

  const openStagePreview = async () => {
    if (!stage || edited) return;
    await preview.open();
  };
  const saveSelectedStage = () => {
    const sent = local.draft;
    if (!sent || !actions.canSave) return;
    save.mutate(
      {
        id: sent.lessonId,
        payload: {
          stage: sent.stage,
          lockVersion: sent.lockVersion,
          tiptapAstJson: sent.document,
          structuredDataJson: sent.structuredData ?? undefined,
          changeSummary: 'Revisão manual',
        },
      },
      {
        onSuccess: (saved) => {
          const savedStage = saved.stages.find((item) => item.type === sent.stage);
          if (savedStage) local.acknowledge(sent, savedStage);
        },
      }
    );
  };

  return (
    <Box
      component="fieldset"
      data-testid="ai-lessons-detail"
      disabled={generationLocked}
      aria-busy={generationLocked}
      sx={{
        width: { xs: '98%', md: '95%' },
        m: 0,
        mx: 'auto',
        py: { xs: 1.5, sm: 2.5, md: 3.5 },
        px: 0,
        border: 0,
        minInlineSize: 0,
      }}
    >
      {/* Top Bar with Back Button */}
      <Button
        startIcon={<ArrowBack />}
        onClick={() => {
          if (confirmLeave()) navigate('/adm/estudio/licoes');
        }}
        sx={{ mb: 2, fontWeight: 700, textTransform: 'none', borderRadius: 2 }}
      >
        Voltar para Produção de Lições
      </Button>

      {connection.state !== LessonConnectionState.CONNECTED && (
        <Alert
          data-testid="ai-lesson-connection-status"
          severity={connection.state === LessonConnectionState.DENIED ? 'error' : 'info'}
          sx={{ mb: 2 }}
        >
          {connection.state === LessonConnectionState.DENIED
            ? 'Sem acesso às atualizações desta lição. Verifique sua sessão e permissão.'
            : connection.state === LessonConnectionState.RECONNECTING
              ? 'Conexão interrompida. Reconectando; suas edições locais estão preservadas.'
              : 'Conectando às atualizações da lição…'}
        </Alert>
      )}
      {local.hasDrafts && (
        <Alert data-testid="ai-lesson-unsaved-notice" severity="warning" sx={{ mb: 2 }}>
          Há edições não salvas. Você pode alternar as etapas; salve ou descarte as edições antes de
          concluir ou gerar conteúdo.
        </Alert>
      )}
      {save.isError && (
        <Alert data-testid="ai-lesson-save-error" severity="error" sx={{ mb: 2 }}>
          {getHttpStatus(save.error) === 409
            ? 'Esta etapa foi alterada em outra sessão. Sua edição foi preservada. Copie seu texto antes de descartar a edição e carregar a versão atual.'
            : 'Não foi possível salvar. Sua edição foi preservada; tente novamente.'}
        </Alert>
      )}
      {/* Hero Card Header */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 3, md: 3.5 },
          mb: 3,
          borderRadius: 4,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
        }}
      >
        <Stack
          direction={{ xs: 'column', lg: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'stretch', lg: 'center' }}
          spacing={2.5}
        >
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              flexWrap="wrap"
              sx={{ gap: 1, mb: 1 }}
            >
              <Chip
                label={`Semana ${lesson.weekNumber}`}
                size="small"
                color="primary"
                sx={{ fontWeight: 800, borderRadius: 1.5 }}
              />
              <Typography
                variant="h4"
                fontWeight={800}
                sx={{
                  fontSize: { xs: '1.4rem', sm: '1.8rem', md: '2.1rem' },
                  color: 'text.primary',
                  overflowWrap: 'anywhere',
                }}
              >
                {lesson.theme}
              </Typography>
              <Chip
                label={LESSON_STATUS_LABELS[lesson.status] ?? lesson.status}
                color={
                  lesson.status === LessonStatus.READY_FOR_PUBLICATION ||
                  lesson.status === LessonStatus.PUBLISHED
                    ? 'success'
                    : lesson.status === LessonStatus.CHANGES_REQUESTED
                      ? 'warning'
                      : 'primary'
                }
                sx={{ fontWeight: 700, borderRadius: 1.5 }}
              />
            </Stack>

            <Typography
              variant="body1"
              color="text.secondary"
              fontWeight={600}
              sx={{ overflowWrap: 'anywhere', mb: 1 }}
            >
              {lesson.biblicalReference}
            </Typography>

            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              Criada em {new Date(lesson.createdAt).toLocaleString('pt-BR')} · Atualizada em{' '}
              {new Date(lesson.updatedAt).toLocaleString('pt-BR')}
            </Typography>

            <Box sx={{ mt: 2, maxWidth: 650 }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 0.75 }}
              >
                <Typography variant="caption" fontWeight={700} color="text.secondary">
                  Progresso geral da lição
                </Typography>
                <Typography variant="caption" fontWeight={800} color="primary.main">
                  {progressCount}/{lesson.stages.length} ({Math.round(progress)}%){' '}
                  {isFinalReview ? 'aprovados' : 'itens concluídos'}
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                  height: 9,
                  borderRadius: 4.5,
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 4.5,
                    bgcolor: progress === 100 ? 'success.main' : 'primary.main',
                  },
                }}
              />
            </Box>
          </Box>

          {/* Action Buttons Top Bar */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ flexShrink: 0 }}>
            <Button
              startIcon={<RateReview />}
              variant="contained"
              onClick={() => {
                if (confirmLeave()) navigate(`/adm/estudio/revisao/${id}`);
              }}
              sx={{ borderRadius: 2.5, minHeight: 48, fontWeight: 700 }}
            >
              Ir para Revisão e Aprovação
            </Button>

            <Button
              startIcon={<DeleteIcon />}
              variant="outlined"
              color="error"
              disabled={local.hasDrafts || save.isPending || complete.isPending}
              onClick={() => setDeleteConfirmOpen(true)}
              sx={{ borderRadius: 2.5, minHeight: 48, fontWeight: 600 }}
            >
              Excluir lição
            </Button>
          </Stack>
        </Stack>
      </Paper>

      <LessonStageNavigation
        stages={lesson.stages}
        selectedType={selectedType}
        mode="mobile"
        onSelect={(type) => {
          setSelectedType(type);
        }}
      />

      {/* Main Grid: Sidebar (Desktop) + Stage Content */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'minmax(0, 1fr)', lg: '320px minmax(0, 1fr)' },
          gap: { xs: 2.5, lg: 3 },
          alignItems: 'start',
        }}
      >
        <LessonStageNavigation
          stages={lesson.stages}
          selectedType={selectedType}
          mode="desktop"
          onSelect={(type) => {
            setSelectedType(type);
          }}
        />

        {/* Stage Main Details Card */}
        <Box>
          {!stage ? (
            <Alert severity="error" sx={{ borderRadius: 3 }}>
              Etapa ausente no pacote.
            </Alert>
          ) : (
            <Card
              data-testid={`ai-stage-${stage.type}`}
              elevation={0}
              sx={{
                minWidth: 0,
                borderRadius: 4,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
              }}
            >
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                {/* Stage Header */}
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  justifyContent="space-between"
                  alignItems={{ xs: 'flex-start', sm: 'center' }}
                  gap={1.5}
                  sx={{ mb: 2 }}
                >
                  <Box>
                    <Typography
                      variant="h5"
                      fontWeight={800}
                      sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}
                    >
                      {LABELS[stage.type]}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                      {DESCRIPTIONS[stage.type]}
                    </Typography>
                  </Box>

                  <Chip
                    label={STATUS_LABELS[stage.status] ?? stage.status}
                    color={STATUS_COLORS[stage.status] ?? 'default'}
                    sx={{ fontWeight: 800, px: 1, borderRadius: 2 }}
                  />
                </Stack>

                {/* Biblical Verse Reference Box if applicable */}
                {[
                  LessonStageType.VERSE_VISUALS,
                  LessonStageType.VERSE_FIXATION,
                  LessonStageType.MEDITATION_YOUNGER,
                  LessonStageType.MEDITATION_OLDER,
                  LessonStageType.MANUAL_WORK,
                ].includes(stage.type) && mainVerse.text ? (
                  <Alert
                    severity="success"
                    icon={<AutoStories />}
                    sx={{ mb: 2, borderRadius: 2.5 }}
                  >
                    <strong>{String(mainVerse.reference)} — NVI:</strong> “{String(mainVerse.text)}”
                  </Alert>
                ) : null}

                {(generate.isPending || stage.status === LessonStageStatus.GENERATING) && (
                  <Alert
                    data-testid="ai-lesson-stage-generating"
                    severity="info"
                    icon={<CircularProgress size={20} />}
                    sx={{ mb: 2, borderRadius: 2.5 }}
                  >
                    Gerando o conteúdo com IA. Esta tela será atualizada automaticamente.
                  </Alert>
                )}

                {!actions.dependencyReady && (
                  <Alert severity="warning" sx={{ mb: 2, borderRadius: 2.5 }}>
                    Aprove a etapa anterior no fluxo antes de gerar esta.
                  </Alert>
                )}

                {/* AI Instructions Input */}
                {stage.type !== LessonStageType.LESSON_VISUALS && (
                  <Box sx={{ mb: 3 }}>
                    <TextField
                      fullWidth
                      multiline
                      minRows={2}
                      label="Orientações e instruções para a IA (geração ou ajuste)"
                      placeholder="Ex: Enfatize o amor de Deus, mantenha linguagem acessível para crianças de 6 anos..."
                      value={instructions}
                      onChange={(event) => setInstructions(event.target.value)}
                      slotProps={{ htmlInput: { maxLength: 1000 } }}
                      helperText={`${instructions.length}/1000 caracteres`}
                      sx={{
                        '& .MuiOutlinedInput-root': { borderRadius: 2.5 },
                      }}
                    />
                  </Box>
                )}

                {stage.type === LessonStageType.LESSON_VISUALS && (
                  <StoryVisualConfiguration
                    visualType={visualType}
                    visualOrientation={visualOrientation}
                    visualQuantity={visualQuantity}
                    instructions={instructions}
                    hasVersion={Boolean(stage.currentVersionId)}
                    isGenerating={
                      generate.isPending || stage.status === LessonStageStatus.GENERATING
                    }
                    canGenerate={canGenerate}
                    onVisualTypeChange={setVisualType}
                    onVisualOrientationChange={setVisualOrientation}
                    onVisualQuantityChange={setVisualQuantity}
                    onInstructionsChange={setInstructions}
                    onGenerate={generateSelectedStage}
                  />
                )}

                {/* Stage Action Controls */}
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={1.5}
                  flexWrap="wrap"
                  useFlexGap
                  sx={{ mb: 3 }}
                >
                  {stage.type !== LessonStageType.LESSON_VISUALS && (
                    <Button
                      data-testid="ai-lesson-generate-stage-button"
                      startIcon={<AutoAwesome />}
                      variant="contained"
                      disabled={
                        !canGenerate ||
                        generate.isPending ||
                        stage.status === LessonStageStatus.GENERATING
                      }
                      onClick={generateSelectedStage}
                      sx={{ borderRadius: 2.5, px: 2.5, minHeight: 44, fontWeight: 700 }}
                    >
                      {generate.isPending || stage.status === LessonStageStatus.GENERATING
                        ? 'Gerando com IA…'
                        : stage.currentVersionId
                          ? 'Regenerar com IA'
                          : 'Gerar com IA'}
                    </Button>
                  )}

                  <Button
                    variant="outlined"
                    startIcon={<EditNote />}
                    data-testid="ai-lesson-save-edit"
                    disabled={!edited || !actions.canSave}
                    onClick={saveSelectedStage}
                    sx={{ borderRadius: 2.5, minHeight: 44, fontWeight: 600 }}
                  >
                    {save.isPending ? 'Salvando…' : 'Salvar edição'}
                  </Button>

                  <Button
                    variant="outlined"
                    color="secondary"
                    startIcon={previewLoading ? <CircularProgress size={18} /> : <PictureAsPdf />}
                    disabled={!stage.currentVersionId || Boolean(edited) || previewLoading}
                    onClick={() => void openStagePreview()}
                    sx={{ borderRadius: 2.5, minHeight: 44, fontWeight: 600 }}
                  >
                    {edited ? 'Salve para visualizar' : 'Visualizar PDF do item'}
                  </Button>

                  <Button
                    startIcon={<Check />}
                    color="primary"
                    variant="contained"
                    data-testid="ai-lesson-complete-stage"
                    disabled={!actions.canComplete}
                    onClick={() => action(complete, stage)}
                    sx={{ borderRadius: 2.5, minHeight: 44, fontWeight: 700 }}
                  >
                    {complete.isPending ? 'Concluindo…' : 'Concluir item para o pacote'}
                  </Button>
                </Stack>

                {edited && (
                  <Button
                    data-testid="ai-lesson-discard-edit"
                    disabled={save.isPending}
                    sx={{ minHeight: 44, mb: 2 }}
                    onClick={() => {
                      if (
                        window.confirm(
                          'Descartar a edição local desta etapa e carregar a versão atual?'
                        )
                      ) {
                        local.discard();
                        save.reset();
                      }
                    }}
                  >
                    Descartar edição desta etapa
                  </Button>
                )}
                <Divider sx={{ mb: 3 }} />

                {/* Editor Container: materiais puramente visuais não recebem folha/cabeçalho textual. */}
                {![
                  LessonStageType.LESSON_VISUALS,
                  LessonStageType.VERSE_VISUALS,
                  LessonStageType.MANUAL_WORK,
                ].includes(stage.type) && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 1.5 }}>
                      Editor de Conteúdo da Lição
                    </Typography>

                    {version ? (
                      stage.type === LessonStageType.MEDITATION_YOUNGER ? (
                        <YoungerMeditationEditor
                          initialJson={document}
                          structuredData={
                            local.draft?.structuredData ?? version.structuredDataJson ?? {}
                          }
                          editable={editorEditable}
                          onChange={local.edit}
                        />
                      ) : stage.type === LessonStageType.MEDITATION_OLDER ? (
                        <OlderMeditationEditor
                          initialJson={document}
                          structuredData={
                            local.draft?.structuredData ?? version.structuredDataJson ?? {}
                          }
                          editable={editorEditable}
                          onChange={local.edit}
                        />
                      ) : (
                        <LibreOfficeDocEditor
                          initialJson={document}
                          editable={editorEditable}
                          onChange={local.edit}
                        />
                      )
                    ) : (
                      <Paper
                        elevation={0}
                        sx={{
                          p: 4,
                          textAlign: 'center',
                          borderRadius: 3,
                          border: '1px dashed',
                          borderColor: 'divider',
                          bgcolor: alpha(theme.palette.primary.main, 0.02),
                        }}
                      >
                        <Typography color="text.secondary" fontWeight={500}>
                          Gere esta etapa para iniciar a revisão e visualização do conteúdo.
                        </Typography>
                      </Paper>
                    )}
                  </Box>
                )}

                {stage.type === LessonStageType.MANUAL_WORK && version && (
                  <ManualWorkPreview
                    structuredData={local.draft?.structuredData ?? version.structuredDataJson ?? {}}
                  />
                )}

                {stage.type === LessonStageType.LESSON_VISUALS && (
                  <StoryVisualCarousel assets={assets} orientation={visualOrientation} />
                )}

                {[LessonStageType.STANDARD_GAME, LessonStageType.VERSE_FIXATION].includes(
                  stage.type
                ) && (
                  <Box data-testid="ai-game-instruction-preview-area">
                    <StoryVisualCarousel
                      assets={assets}
                      orientation={LessonVisualOrientation.LANDSCAPE}
                      title={
                        stage.type === LessonStageType.VERSE_FIXATION
                          ? 'Como fixar o versículo — passo a passo visual'
                          : 'Como brincar — passo a passo visual'
                      }
                      ariaLabel={
                        stage.type === LessonStageType.VERSE_FIXATION
                          ? 'Instruções visuais da fixação do versículo'
                          : 'Instruções visuais da brincadeira'
                      }
                      testIdPrefix={
                        stage.type === LessonStageType.VERSE_FIXATION
                          ? 'ai-verse-fixation-instruction'
                          : 'ai-game-instruction'
                      }
                    />
                    <Stack direction="row" justifyContent="center" sx={{ mt: 2 }}>
                      <Button
                        data-testid="ai-game-instruction-pdf-preview"
                        variant="contained"
                        color="secondary"
                        startIcon={
                          previewLoading ? (
                            <CircularProgress size={18} color="inherit" />
                          ) : (
                            <PictureAsPdf />
                          )
                        }
                        disabled={!stage.currentVersionId || Boolean(edited) || previewLoading}
                        onClick={() => void openStagePreview()}
                        sx={{ minHeight: 44, borderRadius: 2.5, width: { xs: '100%', sm: 'auto' } }}
                      >
                        {edited
                          ? 'Salve para visualizar'
                          : stage.type === LessonStageType.VERSE_FIXATION
                            ? 'Visualizar preview do PDF da fixação'
                            : 'Visualizar preview do PDF da brincadeira'}
                      </Button>
                    </Stack>
                  </Box>
                )}

                {stage.type === LessonStageType.VERSE_VISUALS && (
                  <StoryVisualCarousel
                    assets={assets}
                    orientation={LessonVisualOrientation.LANDSCAPE}
                    title="Versículo — sequência visual"
                    ariaLabel="Visuais do versículo"
                    testIdPrefix="ai-verse-visual"
                  />
                )}

                {/* Generated Visual Assets Preview */}
                {assets.length > 0 &&
                  stage.type !== LessonStageType.MANUAL_WORK &&
                  stage.type !== LessonStageType.LESSON_VISUALS &&
                  stage.type !== LessonStageType.STANDARD_GAME &&
                  stage.type !== LessonStageType.VERSE_FIXATION &&
                  stage.type !== LessonStageType.VERSE_VISUALS &&
                  stage.type !== LessonStageType.MEDITATION_YOUNGER &&
                  stage.type !== LessonStageType.MEDITATION_OLDER && (
                    <Box sx={{ mt: 4 }}>
                      <Typography variant="h6" fontWeight={800} gutterBottom>
                        Ilustrações das atividades
                      </Typography>

                      <Box
                        sx={{
                          display: 'grid',
                          gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
                          gap: 2.5,
                          mt: 2,
                        }}
                      >
                        {assets.map((asset, index) => (
                          <Card
                            key={asset.id ?? index}
                            elevation={0}
                            sx={{
                              borderRadius: 3,
                              border: '1px solid',
                              borderColor: 'divider',
                              overflow: 'hidden',
                            }}
                          >
                            <Box
                              component="img"
                              src={asset.url}
                              alt={asset.altText ?? asset.purpose ?? `Visual ${index + 1}`}
                              sx={{
                                display: 'block',
                                width: '100%',
                                aspectRatio: '3 / 2',
                                objectFit: 'contain',
                                bgcolor: 'grey.50',
                              }}
                            />
                            <CardContent sx={{ p: 2 }}>
                              <Typography fontWeight={700}>
                                {asset.purpose ?? `Visual ${index + 1}`}
                              </Typography>
                              {asset.displayText && (
                                <Typography
                                  sx={{ mt: 0.75, fontWeight: 600 }}
                                  color="primary.main"
                                  variant="body2"
                                >
                                  {asset.displayText}
                                </Typography>
                              )}
                              {asset.altText && (
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                  {asset.altText}
                                </Typography>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </Box>
                    </Box>
                  )}
              </CardContent>
            </Card>
          )}
        </Box>
      </Box>
      <LessonDraftDialogs
        lesson={lesson}
        stage={stage}
        canGenerate={canGenerate}
        generationLocked={generationLocked}
        llmErrorOpen={llmErrorOpen}
        previewUrl={previewUrl}
        previewError={previewError}
        previewLoading={previewLoading}
        deleteConfirmOpen={deleteConfirmOpen}
        deletePending={deleteMutation.isPending}
        onCloseLlmError={() => setLlmErrorOpen(false)}
        onRetryGeneration={() => {
          setLlmErrorOpen(false);
          generateSelectedStage();
        }}
        onClosePreview={preview.close}
        onCloseDelete={() => setDeleteConfirmOpen(false)}
        onConfirmDelete={async () => {
          await deleteMutation.mutateAsync(id);
          navigate('/adm/estudio/licoes');
        }}
      />
    </Box>
  );
};
