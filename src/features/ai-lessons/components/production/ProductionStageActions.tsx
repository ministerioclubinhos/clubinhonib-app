import { Alert, Box, Button, CircularProgress, Link, Stack, Typography } from '@mui/material';
import { AutoAwesome, Check, Collections, EditNote, PictureAsPdf } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { IMAGE_REGENERATION_TEXTS } from '../../image-regeneration.constants';
import { AI_PROVIDER_SETTINGS_ROUTE, PRODUCTION_TEXTS } from '../../production.constants';
import { ProductionStageAction, type ProductionStageActionsProps } from '../../production.types';
import { LessonStageType } from '../../types';

const BUTTON_SX = { borderRadius: 2.5, minHeight: 44, fontWeight: 700 } as const;

/**
 * The item's actions. Only `primary` is filled: one obvious next step per state,
 * instead of several buttons competing for the click.
 */
export function ProductionStageActions({
  stage,
  primary,
  completed,
  stageGenerating,
  canGenerate,
  edited,
  saveEnabled,
  savePending,
  canComplete,
  completePending,
  previewLoading,
  providerCaption,
  regenerationLock,
  completeBlockedReason,
  saveError,
  completeError,
  onGenerate,
  onSave,
  onPreview,
  onComplete,
  onDiscard,
  onOpenProviderSettings,
  imageRegeneration,
}: ProductionStageActionsProps) {
  const hasVersion = Boolean(stage.currentVersionId);
  const variantOf = (action: ProductionStageAction) =>
    primary === action ? 'contained' : 'outlined';

  return (
    <Box data-testid="ai-lesson-stage-actions" sx={{ mb: 3 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} flexWrap="wrap" useFlexGap>
        {/* The story visuals generate from their own configuration steps. */}
        {stage.type !== LessonStageType.LESSON_VISUALS && (
          <Button
            data-testid="ai-lesson-generate-stage-button"
            startIcon={<AutoAwesome />}
            variant={variantOf(ProductionStageAction.GENERATE)}
            // Regenerating is paid and replaces what exists: it must not look like the default.
            color={hasVersion ? 'warning' : 'primary'}
            disabled={!canGenerate || stageGenerating}
            onClick={onGenerate}
            sx={BUTTON_SX}
          >
            {stageGenerating
              ? PRODUCTION_TEXTS.generating
              : hasVersion
                ? PRODUCTION_TEXTS.regenerate
                : PRODUCTION_TEXTS.generate}
          </Button>
        )}

        {imageRegeneration && hasVersion && (
          <Button
            data-testid="ai-lesson-regenerate-images-button"
            startIcon={<Collections />}
            variant="outlined"
            color="warning"
            disabled={!imageRegeneration.enabled || stageGenerating}
            onClick={imageRegeneration.onOpen}
            sx={BUTTON_SX}
          >
            {IMAGE_REGENERATION_TEXTS.button}
          </Button>
        )}

        <Button
          data-testid="ai-lesson-save-edit"
          startIcon={<EditNote />}
          variant={variantOf(ProductionStageAction.SAVE)}
          disabled={!saveEnabled}
          onClick={onSave}
          sx={BUTTON_SX}
        >
          {savePending ? PRODUCTION_TEXTS.saving : PRODUCTION_TEXTS.save}
        </Button>

        <Button
          data-testid="ai-lesson-complete-stage"
          startIcon={<Check />}
          variant={variantOf(ProductionStageAction.COMPLETE)}
          color={completed ? 'success' : 'primary'}
          disabled={!canComplete}
          onClick={onComplete}
          sx={BUTTON_SX}
        >
          {completePending
            ? PRODUCTION_TEXTS.completing
            : completed
              ? PRODUCTION_TEXTS.completed
              : PRODUCTION_TEXTS.complete}
        </Button>

        <Button
          data-testid="ai-lesson-stage-pdf-preview"
          variant="text"
          color="secondary"
          startIcon={previewLoading ? <CircularProgress size={18} /> : <PictureAsPdf />}
          disabled={!hasVersion || edited || previewLoading}
          onClick={onPreview}
          sx={{ ...BUTTON_SX, fontWeight: 600 }}
        >
          {edited ? PRODUCTION_TEXTS.previewNeedsSave : PRODUCTION_TEXTS.preview}
        </Button>
      </Stack>

      {providerCaption && (
        <Typography
          data-testid="ai-lesson-provider-caption"
          variant="caption"
          color="text.secondary"
          sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', columnGap: 0.5 }}
        >
          {providerCaption}
          <Link
            data-testid="ai-lesson-provider-settings-link"
            component={RouterLink}
            to={AI_PROVIDER_SETTINGS_ROUTE}
            underline="hover"
            onClick={(event) => {
              // Leaving goes through the unsaved-changes guard, like every exit of this screen.
              event.preventDefault();
              onOpenProviderSettings();
            }}
            sx={{ display: 'inline-flex', alignItems: 'center', minHeight: 44, px: 0.5 }}
          >
            {PRODUCTION_TEXTS.providerSettingsLink}
          </Link>
        </Typography>
      )}

      {regenerationLock && (
        <Typography
          data-testid="ai-lesson-regeneration-locked-reason"
          variant="caption"
          color="text.secondary"
          sx={{ display: 'block', mt: providerCaption ? 0 : 1 }}
        >
          {regenerationLock}
        </Typography>
      )}
      {imageRegeneration?.blockedReason && hasVersion && !stageGenerating && (
        <Typography
          data-testid="ai-lesson-regenerate-images-blocked-reason"
          variant="caption"
          color="text.secondary"
          sx={{ display: 'block', mt: providerCaption ? 0 : 1 }}
        >
          {imageRegeneration.blockedReason}
        </Typography>
      )}
      {completeBlockedReason && (
        <Typography
          data-testid="ai-lesson-complete-blocked-reason"
          variant="caption"
          color="text.secondary"
          sx={{ display: 'block', mt: providerCaption ? 0 : 1 }}
        >
          {completeBlockedReason}
        </Typography>
      )}

      {/* Beside the buttons that caused them, so the failure is seen where the click was. */}
      {saveError && (
        <Alert data-testid="ai-lesson-save-error" severity="error" sx={{ mt: 1.5 }}>
          {saveError}
        </Alert>
      )}
      {completeError && (
        <Alert data-testid="ai-lesson-complete-error" severity="error" sx={{ mt: 1.5 }}>
          {completeError}
        </Alert>
      )}

      {edited && (
        <Button
          data-testid="ai-lesson-discard-edit"
          disabled={savePending}
          onClick={onDiscard}
          sx={{ minHeight: 44, mt: 1 }}
        >
          {PRODUCTION_TEXTS.discard}
        </Button>
      )}
    </Box>
  );
}
