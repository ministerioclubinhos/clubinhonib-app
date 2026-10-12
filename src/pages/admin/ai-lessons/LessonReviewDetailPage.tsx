import {
  LESSON_STAGE_LABELS as LABELS,
  LESSON_STAGE_SHORT_LABELS as SHORT_LABELS,
} from './lessonDraftDetail.constants';
import { STUDIO_STAGE_ORDER as STAGE_ORDER } from '@/features/ai-lessons/constants';
import { LessonStageAction, LessonStatus } from '@/features/ai-lessons/types';
import { canPublishLesson } from '@/features/ai-lessons/workflow';
import { ManualWorkPreview } from '@/features/ai-lessons/manual-work-preview/ManualWorkPreview';
import { lessonReviewActions } from '@/features/ai-lessons/review-actions';
import { getErrorMessage } from '@/utils/apiError';
import { OlderMeditationEditor } from '@/features/ai-lessons/older-meditation-editor';
import { YoungerMeditationEditor } from '@/features/ai-lessons/younger-meditation-editor';
import React, { useState } from 'react';
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
  Tab,
  Tabs,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import {
  ArrowBack,
  CheckCircle as ApproveIcon,
  RateReview as ChangesIcon,
  EventNoteOutlined as WeekIcon,
  Send as PublishIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import {
  useLessonDraft,
  usePublishLesson,
  useStageAction,
  useSubmitLessonPackage,
} from '@/hooks/api/useAiLessons';
import { LessonStageStatus, LessonStageType } from '@/services/aiLessonsService';
import { LibreOfficeDocEditor } from '@/components/ai-lessons/LibreOfficeDocEditor';
import { StoryVisualCarousel } from '@/features/ai-lessons/components/StoryVisualCarousel';
import { visualAssets } from '@/features/ai-lessons/utils';

export const LessonReviewDetailPage: React.FC = () => {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();

  const { data: lesson, isLoading, error } = useLessonDraft(id);
  const approve = useStageAction(LessonStageAction.APPROVE);
  const changes = useStageAction(LessonStageAction.CHANGES);
  const publishMutation = usePublishLesson();
  const submitReview = useSubmitLessonPackage();

  const [selectedType, setSelectedType] = useState<LessonStageType>(LessonStageType.LESSON);
  const [feedbackMap, setFeedbackMap] = useState<Record<string, string>>({});
  const [publicationMessage, setPublicationMessage] = useState<string | null>(null);

  if (isLoading) {
    return (
      <Box
        data-testid="ai-lesson-review-loading"
        sx={{ display: 'flex', justifyContent: 'center', py: 10 }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error || !lesson) {
    return (
      <Box
        data-testid="ai-lesson-review-error"
        sx={{ width: { xs: '98%', md: '95%' }, mx: 'auto', py: 4 }}
      >
        <Alert severity="error">Não foi possível carregar a lição para revisão.</Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/adm/estudio/revisao')}
          sx={{ mt: 2 }}
        >
          Voltar para Revisão
        </Button>
      </Box>
    );
  }

  const stage = lesson.stages.find((s) => s.type === selectedType);
  const currentVersion =
    stage?.versions.find((version) => version.id === stage.currentVersionId) ?? null;

  const approvedCount = lesson.stages.filter((s) => s.status === LessonStageStatus.APPROVED).length;
  const totalStages = lesson.stages.length || 8;
  const allApproved = approvedCount === totalStages;
  const progress = (approvedCount / totalStages) * 100;

  const reviewActions = lessonReviewActions(
    lesson.status,
    stage?.status,
    Boolean(stage?.currentVersionId)
  );
  const actionsPending =
    approve.isPending || changes.isPending || submitReview.isPending || publishMutation.isPending;
  const currentFeedback = feedbackMap[selectedType] || '';
  const stageComments =
    lesson.comments?.filter((comment) => comment.sectionKey === selectedType) ?? [];

  const handleFeedbackChange = (text: string) => {
    setFeedbackMap((prev) => ({ ...prev, [selectedType]: text }));
  };

  const handleApproveStage = () => {
    if (
      !stage ||
      !reviewActions.canReviewItem ||
      approve.isPending ||
      changes.isPending ||
      submitReview.isPending ||
      publishMutation.isPending
    )
      return;
    approve.mutate(
      { id, stage: stage.type },
      {
        onSuccess: () => {
          setPublicationMessage(null);
        },
      }
    );
  };

  const handleRequestChanges = () => {
    if (
      !stage ||
      !reviewActions.canReviewItem ||
      approve.isPending ||
      changes.isPending ||
      submitReview.isPending ||
      publishMutation.isPending
    )
      return;
    if (!currentFeedback.trim()) {
      setPublicationMessage('Descreva os ajustes necessários antes de devolver o item.');
      return;
    }
    changes.mutate(
      { id, stage: stage.type, note: currentFeedback.trim() },
      {
        onSuccess: () => {
          setPublicationMessage('Ajustes solicitados salvos para esta etapa.');
          setFeedbackMap((current) =>
            current[stage.type] === currentFeedback ? { ...current, [stage.type]: '' } : current
          );
        },
      }
    );
  };

  const handlePublish = () => {
    if (!canPublishLesson(lesson) || actionsPending) return;
    setPublicationMessage(null);
    publishMutation.mutate(id, {
      onSuccess: (result) => {
        setPublicationMessage(
          `Lição aprovada com sucesso e enviada para o Materiais Semanais (ID: ${result.weekMaterialId}).`
        );
      },
      onError: () => {
        setPublicationMessage('Não foi possível publicar. Verifique se os dados estão completos.');
      },
    });
  };

  return (
    <Box
      data-testid="ai-lesson-review-detail"
      sx={{
        width: { xs: '98%', md: '95%' },
        mx: 'auto',
        py: { xs: 2, md: 3 },
      }}
    >
      {/* Voltar */}
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate('/adm/estudio/revisao')}
        sx={{ mb: 2, fontWeight: 700, textTransform: 'none', borderRadius: 2 }}
      >
        Voltar para a lista de Revisão
      </Button>

      {reviewActions.canStartReview && (
        <Alert
          data-testid="ai-lesson-review-start-notice"
          severity="info"
          sx={{ mb: 2, '& .MuiAlert-message': { width: '100%' } }}
        >
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            alignItems={{ xs: 'stretch', sm: 'center' }}
          >
            <Typography variant="body2" sx={{ flex: 1 }}>
              Os oito itens estão concluídos. Inicie a revisão para habilitar a aprovação de cada
              item.
            </Typography>
            <Button
              data-testid="ai-lesson-review-start"
              color="inherit"
              disabled={
                submitReview.isPending ||
                approve.isPending ||
                changes.isPending ||
                publishMutation.isPending
              }
              onClick={() => submitReview.mutate(id)}
              sx={{ minHeight: 44, whiteSpace: 'nowrap' }}
            >
              {submitReview.isPending ? 'Iniciando revisão…' : 'Iniciar revisão'}
            </Button>
          </Stack>
        </Alert>
      )}
      {(submitReview.isError || approve.isError || changes.isError) && (
        <Alert data-testid="ai-lesson-review-action-error" severity="error" sx={{ mb: 2 }}>
          {getErrorMessage(
            submitReview.error ?? approve.error ?? changes.error,
            'Não foi possível concluir a ação de revisão.'
          )}
        </Alert>
      )}
      {publicationMessage && (
        <Alert
          severity={publishMutation.isError ? 'error' : 'success'}
          onClose={() => setPublicationMessage(null)}
          sx={{ mb: 2, borderRadius: 2 }}
          action={
            lesson.status === LessonStatus.PUBLISHED ? (
              <Button
                color="inherit"
                size="small"
                startIcon={<WeekIcon />}
                onClick={() => navigate('/adm/paginas-materiais-semanais')}
              >
                Ver em Materiais Semanais
              </Button>
            ) : undefined
          }
        >
          {publicationMessage}
        </Alert>
      )}

      {/* Top Header Card */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 3 },
          mb: 3,
          borderRadius: 4,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'stretch', md: 'center' }}
          spacing={2}
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
                color="primary"
                size="small"
                sx={{ fontWeight: 800, borderRadius: 1.5 }}
              />
              <Typography
                variant="h4"
                fontWeight={800}
                sx={{ fontSize: { xs: '1.3rem', md: '1.8rem' } }}
              >
                {lesson.theme}
              </Typography>
              <Chip
                label={
                  lesson.status === LessonStatus.PUBLISHED
                    ? 'PUBLICADO NO MATERIAIS SEMANAIS'
                    : allApproved
                      ? 'TODOS OS ITENS APROVADOS'
                      : `${approvedCount}/${totalStages} ITENS APROVADOS`
                }
                color={
                  lesson.status === LessonStatus.PUBLISHED || allApproved ? 'success' : 'warning'
                }
                sx={{ fontWeight: 800, borderRadius: 1.5 }}
              />
            </Stack>

            <Typography variant="body1" color="text.secondary" fontWeight={600} sx={{ mb: 1.5 }}>
              {lesson.biblicalReference}
            </Typography>

            {/* Progresso de Aprovação */}
            <Box sx={{ maxWidth: 600 }}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent="space-between"
                spacing={0.25}
                sx={{ mb: 0.5 }}
              >
                <Typography variant="caption" fontWeight={700} color="text.secondary">
                  Progresso de Revisão & Aprovação
                </Typography>
                <Typography variant="caption" fontWeight={800} color="primary.main">
                  {approvedCount} de {totalStages} itens aprovados ({Math.round(progress)}%)
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

          {/* Botão de Ação Principal: Publicação Direta */}
          <Box sx={{ flexShrink: 0, width: { xs: '100%', md: 'auto' } }}>
            <Button
              variant="contained"
              color={allApproved ? 'success' : 'primary'}
              size="large"
              startIcon={<PublishIcon />}
              disabled={
                actionsPending ||
                !canPublishLesson(lesson) ||
                lesson.status !== 'READY_FOR_PUBLICATION'
              }
              onClick={handlePublish}
              fullWidth
              sx={{ borderRadius: 3, py: 1.5, px: 3, fontWeight: 800, fontSize: '0.95rem' }}
            >
              {publishMutation.isPending ? 'Publicando…' : 'Enviar ao Materiais Semanais'}
            </Button>
          </Box>
        </Stack>
      </Paper>

      {/* Tabs com Itens/Etapas */}
      <Paper
        elevation={0}
        sx={{
          mb: 3,
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Tabs
          value={selectedType}
          onChange={(_, next) => setSelectedType(next)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            px: 1,
            py: 0.5,
            '& .MuiTab-root': {
              minHeight: 52,
              textTransform: 'none',
              fontWeight: 700,
            },
          }}
        >
          {STAGE_ORDER.map((stageType) => {
            const st = lesson.stages?.find((item) => item.type === stageType);
            const isApproved = st?.status === LessonStageStatus.APPROVED;
            const isRequested = st?.status === LessonStageStatus.CHANGES_REQUESTED;

            return (
              <Tab
                data-testid={`ai-lesson-review-tab-${stageType.toLowerCase().replaceAll('_', '-')}`}
                key={stageType}
                value={stageType}
                label={
                  <Stack direction="row" spacing={1} alignItems="center">
                    <span>{SHORT_LABELS[stageType]}</span>
                    <Chip
                      size="small"
                      label={isApproved ? 'APROVADO' : isRequested ? 'AJUSTES' : 'EM REVISÃO'}
                      color={isApproved ? 'success' : isRequested ? 'error' : 'default'}
                      sx={{ height: 20, fontSize: '0.675rem', fontWeight: 800, borderRadius: 1 }}
                    />
                  </Stack>
                }
              />
            );
          })}
        </Tabs>
      </Paper>

      {/* Grid Principal: Conteúdo do Item (Esq) + Painel do Revisor (Dir) */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) 360px' },
          gap: { xs: 2, md: 3 },
          alignItems: 'start',
        }}
      >
        {/* Visualizador de Conteúdo do Item */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 1.5, sm: 3 },
            borderRadius: 4,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
          }}
        >
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            sx={{ mb: 2 }}
          >
            <Typography variant="h6" fontWeight={800}>
              {LABELS[selectedType]}
            </Typography>
            {stage?.status === LessonStageStatus.APPROVED && (
              <Chip
                icon={<ApproveIcon />}
                label="Item Aprovado"
                color="success"
                sx={{ fontWeight: 800 }}
              />
            )}
          </Stack>

          <Divider sx={{ mb: 3 }} />

          {/* Se a etapa possui visuais da história ou imagens */}
          {selectedType === LessonStageType.LESSON_VISUALS ? (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" fontWeight={700} color="text.secondary" gutterBottom>
                Cenas Visuais da História
              </Typography>
              <StoryVisualCarousel
                assets={visualAssets(currentVersion?.structuredDataJson, selectedType)}
                orientation=""
                title="Visuais da Lição"
              />
            </Box>
          ) : null}

          {/* Editor/Visualizador LibreOffice / Tiptap */}
          {selectedType === LessonStageType.MANUAL_WORK ? (
            <ManualWorkPreview structuredData={currentVersion?.structuredDataJson ?? {}} />
          ) : selectedType === LessonStageType.MEDITATION_YOUNGER ? (
            <YoungerMeditationEditor
              initialJson={currentVersion?.tiptapAstJson ?? { type: 'doc', content: [] }}
              structuredData={currentVersion?.structuredDataJson ?? {}}
              editable={false}
            />
          ) : selectedType === LessonStageType.MEDITATION_OLDER ? (
            <OlderMeditationEditor
              initialJson={currentVersion?.tiptapAstJson ?? { type: 'doc', content: [] }}
              structuredData={currentVersion?.structuredDataJson ?? {}}
              editable={false}
            />
          ) : (
            <LibreOfficeDocEditor
              initialJson={currentVersion?.tiptapAstJson ?? { type: 'doc', content: [] }}
              editable={false}
            />
          )}
        </Paper>

        {/* Painel de Controle do Revisor (Direita) */}
        <Stack spacing={2.5}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 4,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="subtitle1" fontWeight={800} gutterBottom>
                Avaliação do Revisor
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Forneça sugestões de melhoria ou aprove este item individualmente.
              </Typography>

              <TextField
                fullWidth
                multiline
                rows={4}
                label="Sugestões de melhoria / observações"
                placeholder="Ex: Ajustar o parágrafo inicial para ficar mais claro para as crianças..."
                value={currentFeedback}
                onChange={(e) => handleFeedbackChange(e.target.value)}
                sx={{ mb: 2 }}
              />

              {stageComments.length > 0 && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  {stageComments.map((comment) => (
                    <Typography key={comment.id} variant="body2" sx={{ mb: 0.5 }}>
                      {comment.commentText}
                    </Typography>
                  ))}
                </Alert>
              )}

              <Stack spacing={1.5}>
                <Button
                  fullWidth
                  variant="contained"
                  color="success"
                  size="large"
                  startIcon={<ApproveIcon />}
                  data-testid="ai-lesson-review-approve"
                  disabled={actionsPending || !reviewActions.canReviewItem}
                  onClick={handleApproveStage}
                  sx={{ borderRadius: 2.5, fontWeight: 800, py: 1.2 }}
                >
                  {approve.isPending
                    ? 'Aprovando…'
                    : stage?.status === LessonStageStatus.APPROVED
                      ? 'Item Aprovado'
                      : 'Aprovar Este Item'}
                </Button>

                <Button
                  fullWidth
                  variant="outlined"
                  color="error"
                  startIcon={<ChangesIcon />}
                  disabled={
                    actionsPending || !currentFeedback.trim() || !reviewActions.canReviewItem
                  }
                  data-testid="ai-lesson-review-request-changes"
                  onClick={handleRequestChanges}
                  sx={{ borderRadius: 2.5, fontWeight: 700, minHeight: 44 }}
                >
                  {changes.isPending ? 'Solicitando…' : 'Solicitar Ajustes neste Item'}
                </Button>
              </Stack>
            </CardContent>
          </Card>

          {(canPublishLesson(lesson) || publishMutation.isPending) && (
            <Alert
              severity="success"
              variant="filled"
              sx={{ borderRadius: 3 }}
              action={
                <Button
                  color="inherit"
                  size="small"
                  startIcon={<PublishIcon />}
                  onClick={handlePublish}
                  data-testid="ai-lesson-review-publish-now"
                  disabled={actionsPending || !canPublishLesson(lesson)}
                  sx={{ fontWeight: 800, minHeight: 44 }}
                >
                  Publicar Agora
                </Button>
              }
            >
              🎉 Todos os itens foram aprovados! A lição está pronta para ir ao Materiais Semanais.
            </Alert>
          )}
        </Stack>
      </Box>
    </Box>
  );
};
