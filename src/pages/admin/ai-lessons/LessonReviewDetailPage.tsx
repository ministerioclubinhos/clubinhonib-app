import {
  LESSON_STAGE_LABELS as LABELS,
  SPECIAL_STAGE_LABELS as SPECIAL_LABELS,
  LESSON_STAGE_SHORT_LABELS as SHORT_LABELS,
  SPECIAL_STAGE_SHORT_LABELS as SPECIAL_SHORT_LABELS,
  localizeLegacyDocumentLabels,
} from './lessonDraftDetail.constants';
import {
  LESSON_ACTION_NOTE_MAX_LENGTH,
  getStudioStageOrder,
} from '@/features/ai-lessons/constants';
import {
  LessonCategory,
  LessonConnectionState,
  LessonStageAction,
  LessonStatus,
} from '@/features/ai-lessons/types';
import { canPublishLesson } from '@/features/ai-lessons/workflow';
import { lessonReviewActions } from '@/features/ai-lessons/review-actions';
import { LessonStageContentViewer } from '@/features/ai-lessons/components/LessonStageContentViewer';
import { useLessonPdfPreview } from '@/features/ai-lessons/useLessonPdfPreview';
import { useStudioUnsavedChanges } from '@/features/ai-lessons/useStudioUnsavedChanges';
import { formatLessonBadgeLabel, hasCompleteStageAssets } from '@/features/ai-lessons/utils';
import { getErrorMessage, getHttpStatus } from '@/utils/apiError';
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
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
  Download,
  PictureAsPdf,
  RateReview as ChangesIcon,
  EventNoteOutlined as WeekIcon,
  Send as PublishIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import {
  useLessonDraft,
  useLessonDraftEvents,
  usePublishLesson,
  useStageAction,
  useSubmitLessonPackage,
} from '@/hooks/api/useAiLessons';
import { LessonStageStatus, LessonStageType } from '@/services/aiLessonsService';

export const LessonReviewDetailPage: React.FC = () => {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();

  const { data: lesson, isLoading, error, refetch } = useLessonDraft(id);
  const isSpecial = lesson?.category === LessonCategory.SPECIAL;
  const connection = useLessonDraftEvents(id);
  const approve = useStageAction(LessonStageAction.APPROVE);
  const changes = useStageAction(LessonStageAction.CHANGES);
  const publishMutation = usePublishLesson();
  const submitReview = useSubmitLessonPackage();

  const [selectedType, setSelectedType] = useState<LessonStageType>(LessonStageType.LESSON);
  const [feedbackMap, setFeedbackMap] = useState<Record<string, string>>({});
  const [publicationMessage, setPublicationMessage] = useState<string | null>(null);

  useEffect(() => {
    setFeedbackMap({});
    setPublicationMessage(null);
  }, [id]);

  const stage = useMemo(
    () => lesson?.stages.find((s) => s.type === selectedType),
    [lesson, selectedType]
  );
  const currentVersion =
    stage?.versions.find((version) => version.id === stage.currentVersionId) ?? null;
  const preview = useLessonPdfPreview(
    id,
    selectedType,
    stage?.lockVersion,
    stage?.currentVersionId
  );
  const hasUnsentFeedback = useMemo(
    () => Object.values(feedbackMap).some((text) => text.trim().length > 0),
    [feedbackMap]
  );
  const confirmLeave = useStudioUnsavedChanges(hasUnsentFeedback);
  const document = useMemo(
    () =>
      localizeLegacyDocumentLabels(
        currentVersion?.tiptapAstJson ?? { type: 'doc', content: [] }
      ),
    [currentVersion?.tiptapAstJson]
  );

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
          onClick={() => {
            if (confirmLeave()) navigate('/adm/estudio/revisao');
          }}
          sx={{ mt: 2 }}
        >
          Voltar para Revisão
        </Button>
      </Box>
    );
  }

  const approvedCount = lesson.stages.filter((s) => s.status === LessonStageStatus.APPROVED).length;
  const totalStages = lesson.stages.length || 8;
  const allApproved = approvedCount === totalStages;
  const progress = (approvedCount / totalStages) * 100;
  const remoteBusy =
    lesson.status === LessonStatus.PUBLISHING ||
    lesson.stages.some((item) => item.status === LessonStageStatus.GENERATING);
  const assetsComplete = stage
    ? hasCompleteStageAssets(stage.type, currentVersion?.structuredDataJson)
    : false;

  const reviewActions = lessonReviewActions(
    lesson.status,
    stage?.status,
    Boolean(stage?.currentVersionId),
    { busy: remoteBusy, assetsComplete }
  );
  const requestChangesAllowed = lessonReviewActions(
    lesson.status,
    stage?.status,
    Boolean(stage?.currentVersionId),
    { busy: remoteBusy }
  ).canReviewItem;
  const actionsPending =
    remoteBusy ||
    approve.isPending ||
    changes.isPending ||
    submitReview.isPending ||
    publishMutation.isPending;
  const currentFeedback = feedbackMap[selectedType] || '';
  const stageComments =
    lesson.comments?.filter((comment) => comment.sectionKey === selectedType) ?? [];

  const handleFeedbackChange = (text: string) => {
    setFeedbackMap((prev) => ({ ...prev, [selectedType]: text }));
  };

  const handleApproveStage = () => {
    if (!stage || !reviewActions.canReviewItem || actionsPending) return;
    const observedLock = stage.lockVersion;
    approve.mutate(
      { id, stage: stage.type, lockVersion: observedLock },
      {
        onSuccess: () => {
          setPublicationMessage(null);
        },
        onError: (err) => {
          if (getHttpStatus(err) === 409) {
            void refetch();
          }
        },
      }
    );
  };

  const handleRequestChanges = () => {
    if (!stage || !requestChangesAllowed || actionsPending) return;
    if (!currentFeedback.trim()) {
      setPublicationMessage('Descreva os ajustes necessários antes de devolver o item.');
      return;
    }
    const observedLock = stage.lockVersion;
    const submittedText = currentFeedback;
    changes.mutate(
      {
        id,
        stage: stage.type,
        lockVersion: observedLock,
        note: submittedText.trim(),
      },
      {
        onSuccess: () => {
          setPublicationMessage('Ajustes solicitados salvos para esta etapa.');
          setFeedbackMap((current) =>
            current[stage.type] === submittedText ? { ...current, [stage.type]: '' } : current
          );
        },
        onError: (err) => {
          if (getHttpStatus(err) === 409) {
            void refetch();
          }
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
          `Lição aprovada com sucesso e enviada para o Materiais Semanais (ID: ${result.weekMaterialId}). A definição da semana atual permanece controlada separadamente em Materiais Semanais.`
        );
      },
      onError: () => {
        void refetch();
        setPublicationMessage(
          'Não foi possível confirmar a publicação imediatamente. O estado da lição foi recarregado; verifique antes de tentar novamente.'
        );
      },
    });
  };

  const actionError = submitReview.error ?? approve.error ?? changes.error;
  const isConflictError = getHttpStatus(actionError) === 409;

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
        onClick={() => {
          if (confirmLeave()) navigate('/adm/estudio/revisao');
        }}
        sx={{ mb: 2, fontWeight: 700, textTransform: 'none', borderRadius: 2 }}
      >
        Voltar para a lista de Revisão
      </Button>

      {connection.state !== LessonConnectionState.CONNECTED && (
        <Alert
          data-testid="ai-lesson-review-connection-status"
          severity={connection.state === LessonConnectionState.DENIED ? 'error' : 'info'}
          sx={{ mb: 2 }}
        >
          {connection.state === LessonConnectionState.DENIED
            ? 'Sem acesso às atualizações desta revisão. Verifique sua sessão e permissão.'
            : connection.state === LessonConnectionState.RECONNECTING
              ? 'Conexão interrompida. Reconectando; suas observações locais estão preservadas.'
              : 'Conectando às atualizações da revisão…'}
        </Alert>
      )}

      {lesson.status === LessonStatus.PUBLISHING && (
        <Alert
          data-testid="ai-lesson-publishing-notice"
          severity="info"
          icon={<CircularProgress size={20} />}
          sx={{ mb: 2, borderRadius: 2 }}
        >
          Publicação em andamento no Materiais Semanais. Aguarde a conclusão; envios duplicados
          estão bloqueados.
        </Alert>
      )}

      {lesson.publicationFailureMessage && lesson.status !== LessonStatus.PUBLISHED && (
        <Alert
          data-testid="ai-lesson-publication-failure-notice"
          severity="warning"
          sx={{ mb: 2, borderRadius: 2 }}
        >
          Última tentativa de publicação interrompida: {lesson.publicationFailureMessage}. Os itens
          aprovados foram preservados e você pode retomar o envio quando desejar.
        </Alert>
      )}

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
              {lesson.category === LessonCategory.SPECIAL
                ? 'Os três itens do Material Especial'
                : 'Os oito itens'}{' '}
              estão concluídos. Inicie a revisão para habilitar a aprovação de cada
              item.
            </Typography>
            <Button
              data-testid="ai-lesson-review-start"
              color="inherit"
              disabled={actionsPending}
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
          {isConflictError
            ? 'Este item foi alterado em outra sessão enquanto estava aberto. O conteúdo atualizado foi recarregado e suas observações locais foram preservadas; revise a nova versão antes de decidir.'
            : getErrorMessage(actionError, 'Não foi possível concluir a ação de revisão.')}
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
                label={formatLessonBadgeLabel(lesson)}
                color={lesson.category === LessonCategory.SPECIAL ? 'secondary' : 'primary'}
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
                    : lesson.status === LessonStatus.PUBLISHING
                      ? 'PUBLICANDO NO MATERIAIS SEMANAIS'
                      : allApproved
                        ? 'TODOS OS ITENS APROVADOS'
                        : `${approvedCount}/${totalStages} ITENS APROVADOS`
                }
                color={
                  lesson.status === LessonStatus.PUBLISHED || allApproved
                    ? 'success'
                    : lesson.status === LessonStatus.PUBLISHING
                      ? 'info'
                      : 'warning'
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
                lesson.status !== LessonStatus.READY_FOR_PUBLICATION
              }
              onClick={handlePublish}
              fullWidth
              sx={{ borderRadius: 3, py: 1.5, px: 3, fontWeight: 800, fontSize: '0.95rem' }}
            >
              {publishMutation.isPending || lesson.status === LessonStatus.PUBLISHING
                ? 'Publicando…'
                : 'Enviar ao Materiais Semanais'}
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
          onChange={(_, next: LessonStageType) => setSelectedType(next)}
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
          {getStudioStageOrder(lesson.category).map((stageType) => {
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
                    <span>{isSpecial ? (SPECIAL_SHORT_LABELS[stageType] ?? SHORT_LABELS[stageType]) : SHORT_LABELS[stageType]}</span>
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
            spacing={1.5}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            sx={{ mb: 2 }}
          >
            <Box>
              <Typography variant="h6" fontWeight={800}>
                {isSpecial ? (SPECIAL_LABELS[selectedType] ?? LABELS[selectedType]) : LABELS[selectedType]}
              </Typography>
              {currentVersion && (
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  Versão #{currentVersion.versionNumber} · Lock #{stage?.lockVersion ?? 1}
                </Typography>
              )}
            </Box>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
              <Button
                data-testid="ai-lesson-review-pdf-preview"
                variant="outlined"
                color="secondary"
                size="small"
                startIcon={
                  preview.loading ? <CircularProgress size={16} /> : <PictureAsPdf />
                }
                disabled={!stage?.currentVersionId || preview.loading}
                onClick={() => void preview.open()}
                sx={{ minHeight: 44, borderRadius: 2, fontWeight: 700, textTransform: 'none' }}
              >
                Visualizar PDF do item
              </Button>
              {stage?.status === LessonStageStatus.APPROVED && (
                <Chip
                  icon={<ApproveIcon />}
                  label="Item Aprovado"
                  color="success"
                  sx={{ fontWeight: 800 }}
                />
              )}
            </Stack>
          </Stack>

          <Divider sx={{ mb: 3 }} />

          {stage ? (
            <LessonStageContentViewer
              stage={stage}
              version={currentVersion}
              document={document}
              structuredData={currentVersion?.structuredDataJson ?? {}}
              editable={false}
              onOpenPdfPreview={() => void preview.open()}
              pdfPreviewLoading={preview.loading}
              pdfPreviewDisabled={!stage.currentVersionId}
            />
          ) : (
            <Alert severity="error">Etapa não encontrada na lição.</Alert>
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
                slotProps={{ htmlInput: { maxLength: LESSON_ACTION_NOTE_MAX_LENGTH } }}
                helperText={`${currentFeedback.length}/${LESSON_ACTION_NOTE_MAX_LENGTH} caracteres`}
                sx={{ mb: 2 }}
              />

              {stageComments.length > 0 && (
                <Alert
                  data-testid="ai-lesson-review-comments-history"
                  severity="info"
                  sx={{ mb: 2 }}
                >
                  <Typography variant="caption" fontWeight={800} sx={{ display: 'block', mb: 0.75 }}>
                    Histórico de observações desta etapa:
                  </Typography>
                  {stageComments.map((comment) => (
                    <Box key={comment.id} sx={{ mb: 1 }}>
                      <Typography variant="body2">{comment.commentText}</Typography>
                      {comment.createdAt && (
                        <Typography variant="caption" color="text.secondary">
                          {new Date(comment.createdAt).toLocaleString('pt-BR')}
                        </Typography>
                      )}
                    </Box>
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
                  sx={{ borderRadius: 2.5, fontWeight: 800, py: 1.2, minHeight: 44 }}
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
                  disabled={actionsPending || !currentFeedback.trim() || !requestChangesAllowed}
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

      {/* Dialog de Preview de PDF em Revisão */}
      <Dialog
        data-testid="ai-lesson-pdf-preview-dialog"
        open={preview.loading || Boolean(preview.url) || Boolean(preview.error)}
        onClose={preview.close}
        fullWidth
        maxWidth="lg"
        slotProps={{
          paper: {
            sx: {
              height: { xs: 'calc(100dvh - 12px)', md: '90vh' },
              m: { xs: 0.75, md: 4 },
              width: { xs: 'calc(100% - 12px)', md: '100%' },
            },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          Preview final —{' '}
          {stage ? (isSpecial ? (SPECIAL_LABELS[stage.type] ?? LABELS[stage.type]) : LABELS[stage.type]) : 'Item'}
        </DialogTitle>
        <DialogContent
          dividers
          sx={{ p: { xs: 0.5, md: 1.5 }, display: 'flex', flexDirection: 'column' }}
        >
          {preview.loading ? (
            <Box data-testid="ai-lesson-pdf-loading" role="status" sx={{ p: 3 }}>
              <CircularProgress aria-label="Gerando PDF" />
            </Box>
          ) : preview.error ? (
            <Alert data-testid="ai-lesson-pdf-error" severity="error">
              {preview.error}
            </Alert>
          ) : preview.url ? (
            <Box
              component="iframe"
              title="Preview do PDF do item"
              src={preview.url}
              sx={{
                border: 0,
                width: '100%',
                flex: 1,
                minHeight: { xs: 520, md: 650 },
                bgcolor: 'grey.100',
              }}
            />
          ) : null}
        </DialogContent>
        <DialogActions
          sx={{
            px: { xs: 1.5, sm: 3 },
            '& .MuiButton-root': { minHeight: 44, flex: { xs: 1, sm: 'initial' } },
          }}
        >
          <Button onClick={preview.close}>Fechar</Button>
          {preview.url && (
            <Button
              component="a"
              href={preview.url}
              download={`preview-${stage?.type.toLowerCase() ?? 'item'}.pdf`}
              startIcon={<Download />}
            >
              Baixar preview
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};
