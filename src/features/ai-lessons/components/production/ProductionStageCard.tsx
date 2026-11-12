import { Box, Card, CardContent, Chip, Divider, Stack, TextField, Typography } from '@mui/material';
import {
  LESSON_INSTRUCTIONS_MAX_LENGTH,
  LESSON_STAGE_STATUS_COLORS,
  LESSON_STAGE_STATUS_LABELS,
} from '../../presentation.constants';
import { lessonStageDescription, lessonStageLabel } from '../../presentation.utils';
import { PRODUCTION_STAGE_CARD_ID, PRODUCTION_TEXTS } from '../../production.constants';
import type { ProductionStageCardProps } from '../../production.types';
import { LessonCategory, LessonStageType } from '../../types';
import { LessonCommentsPanel } from '../LessonCommentsPanel';
import { LessonStageContentViewer } from '../LessonStageContentViewer';
import { StoryVisualConfiguration } from '../StoryVisualConfiguration';
import { ProductionStageActions } from './ProductionStageActions';
import { ProductionStageGuidance } from './ProductionStageGuidance';

/** The selected item: where it stands, what to do next and the content itself. */
export function ProductionStageCard({
  lesson,
  data,
  workflow,
  preview,
  resolvingCommentId,
  onResolveComment,
  onShowFailureDetails,
  onGoToReview,
  onOpenProviderSettings,
}: ProductionStageCardProps) {
  const { stage, version, edited } = data;
  if (!stage) return null;
  const { visual } = workflow;
  const hasVersion = Boolean(stage.currentVersionId);
  const openPreview = () => {
    // The PDF is built from the saved version; an unsaved edit would not be in it.
    if (!edited) void preview.open();
  };

  return (
    <Card
      id={PRODUCTION_STAGE_CARD_ID}
      data-testid={`ai-stage-${stage.type}`}
      elevation={0}
      sx={{
        minWidth: 0,
        borderRadius: 4,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        // Leaves the fixed app bar out of the way when the header button scrolls here.
        scrollMarginTop: 96,
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          gap={1.5}
          sx={{ mb: 2 }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography
              component="h2"
              color="text.primary"
              sx={{ fontSize: { xs: '1.1rem', sm: '1.3rem' }, fontWeight: 800, lineHeight: 1.3 }}
            >
              {lessonStageLabel(stage.type, lesson.category)}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
              {lessonStageDescription(stage.type, lesson.category)}
            </Typography>
          </Box>
          <Chip
            data-testid="ai-lesson-stage-status-chip"
            label={LESSON_STAGE_STATUS_LABELS[stage.status]}
            color={LESSON_STAGE_STATUS_COLORS[stage.status]}
            sx={{ fontWeight: 800, px: 1, borderRadius: 2, flexShrink: 0 }}
          />
        </Stack>

        <ProductionStageGuidance
          stage={stage}
          category={lesson.category}
          verse={data.verse}
          staleOrigin={workflow.staleOrigin}
          stageGenerating={workflow.stageGenerating}
          generationLocked={workflow.generationLocked}
          elapsedSeconds={workflow.elapsedSeconds}
          dependencyReady={workflow.actions.dependencyReady}
          completionNotice={workflow.completionNotice}
          canRetry={workflow.canRetry}
          onRetry={workflow.requestGeneration}
          onShowFailureDetails={onShowFailureDetails}
          onDismissCompletionNotice={workflow.dismissCompletionNotice}
          onGoToReview={onGoToReview}
        />

        <LessonCommentsPanel
          data-testid="ai-lesson-stage-comments"
          title={PRODUCTION_TEXTS.commentsTitle}
          comments={data.comments}
          onResolve={onResolveComment}
          resolvingId={resolvingCommentId}
        />

        {stage.type === LessonStageType.LESSON_VISUALS ? (
          <StoryVisualConfiguration
            visualType={visual.visualType}
            isSpecial={lesson.category === LessonCategory.SPECIAL}
            visualOrientation={visual.visualOrientation}
            visualQuantity={visual.visualQuantity}
            instructions={workflow.instructions}
            hasVersion={hasVersion}
            isGenerating={workflow.stageGenerating}
            canGenerate={workflow.actions.canGenerate}
            onVisualTypeChange={visual.setVisualType}
            onVisualOrientationChange={visual.setVisualOrientation}
            onVisualQuantityChange={visual.setVisualQuantity}
            onInstructionsChange={workflow.setInstructions}
            onGenerate={workflow.runGeneration}
          />
        ) : (
          <TextField
            fullWidth
            multiline
            minRows={2}
            label={PRODUCTION_TEXTS.instructionsLabel}
            placeholder={PRODUCTION_TEXTS.instructionsPlaceholder}
            value={workflow.instructions}
            onChange={(event) => workflow.setInstructions(event.target.value)}
            slotProps={{
              htmlInput: {
                maxLength: LESSON_INSTRUCTIONS_MAX_LENGTH,
                'data-testid': 'ai-lesson-generation-instructions',
              },
            }}
            helperText={`${workflow.instructions.length}/${LESSON_INSTRUCTIONS_MAX_LENGTH} caracteres`}
            sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }}
          />
        )}

        <ProductionStageActions
          stage={stage}
          primary={workflow.primaryAction}
          completed={workflow.completed}
          stageGenerating={workflow.stageGenerating}
          canGenerate={workflow.actions.canGenerate}
          edited={edited}
          saveEnabled={workflow.saveEnabled}
          savePending={workflow.savePending}
          canComplete={workflow.canComplete}
          completePending={workflow.completePending}
          previewLoading={preview.loading}
          providerCaption={workflow.providerCaption}
          regenerationLock={workflow.regenerationLock}
          completeBlockedReason={workflow.completeBlockedReason}
          saveError={workflow.saveError}
          completeError={workflow.completeError}
          onGenerate={workflow.requestGeneration}
          onSave={workflow.requestSave}
          onPreview={openPreview}
          onComplete={() => workflow.completeStage(stage)}
          onDiscard={workflow.requestDiscard}
          onOpenProviderSettings={onOpenProviderSettings}
        />

        <Divider sx={{ mb: 3 }} />

        <LessonStageContentViewer
          stage={stage}
          version={version}
          document={data.document}
          structuredData={data.structuredData}
          visualOrientation={visual.visualOrientation}
          editable={workflow.editorEditable}
          onChangeDocument={data.local.edit}
          onOpenPdfPreview={openPreview}
          pdfPreviewLoading={preview.loading}
          pdfPreviewDisabled={!hasVersion || edited}
          pdfPreviewLabel={edited ? PRODUCTION_TEXTS.previewNeedsSave : undefined}
          onLayoutOverflowChange={workflow.setLayoutOverflow}
        />
      </CardContent>
    </Card>
  );
}
