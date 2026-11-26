import type { ReactNode } from 'react';
import { Alert, Typography } from '@mui/material';
import ConfirmDialog from '@/components/common/modal/ConfirmDialog';
import { SIGNED_OFF_STAGE_STATUSES } from '../../constants';
import { lessonStageLabel } from '../../presentation.utils';
import { PRODUCTION_CONFIRM_COPY, PRODUCTION_TEXTS } from '../../production.constants';
import type { ProductionConfirmDialogProps } from '../../production.types';
import { ProductionConfirmationKind } from '../../types';
import { StageImpactList } from '../StageImpactList';

type BodyProps = Omit<ProductionConfirmDialogProps, 'confirmation' | 'onConfirm' | 'onClose'>;

/** What each confirmation explains before the producer decides. */
const CONFIRM_BODIES: Record<ProductionConfirmationKind, (props: BodyProps) => ReactNode> = {
  [ProductionConfirmationKind.SAVE]: ({ impactedStages, category }) => (
    <>
      <Typography variant="body2">{PRODUCTION_TEXTS.confirmSaveBody}</Typography>
      <StageImpactList stages={impactedStages} category={category} />
    </>
  ),
  [ProductionConfirmationKind.REGENERATE]: ({
    stage,
    impactedStages,
    category,
    reviewCycleActive,
  }) => (
    <>
      {stage && SIGNED_OFF_STAGE_STATUSES.includes(stage.status) && (
        <Alert severity="warning" sx={{ mb: 1.5 }}>
          {PRODUCTION_TEXTS.confirmRegenerateSignedOff}
        </Alert>
      )}
      <Typography variant="body2">{PRODUCTION_TEXTS.confirmRegenerateBody}</Typography>
      {impactedStages.length > 0 ? (
        <>
          <Typography variant="body2" sx={{ mt: 1.5 }}>
            {PRODUCTION_TEXTS.confirmRegenerateImpact}
          </Typography>
          <StageImpactList stages={impactedStages} category={category} />
        </>
      ) : (
        <Typography data-testid="ai-lesson-regenerate-no-impact" variant="body2" sx={{ mt: 1.5 }}>
          {reviewCycleActive
            ? PRODUCTION_TEXTS.confirmRegenerateNoImpactInReview
            : PRODUCTION_TEXTS.confirmRegenerateNoImpact}
        </Typography>
      )}
    </>
  ),
  [ProductionConfirmationKind.COMPLETE_OUTDATED]: ({ staleOrigin, category }) => (
    <Typography variant="body2">
      Este item foi produzido a partir de uma versão anterior
      {staleOrigin
        ? ` de “${lessonStageLabel(staleOrigin, category)}”`
        : PRODUCTION_TEXTS.confirmOutdatedUnknownOrigin}
      , que mudou depois. Confirme apenas se você conferiu que o conteúdo continua correto (por
      exemplo, o versículo e a história); caso contrário, gere o item novamente ou edite-o.
    </Typography>
  ),
  [ProductionConfirmationKind.REBASE]: () => (
    <Typography variant="body2">{PRODUCTION_TEXTS.confirmRebaseBody}</Typography>
  ),
  [ProductionConfirmationKind.DISCARD]: () => (
    <Typography variant="body2">{PRODUCTION_TEXTS.confirmDiscardBody}</Typography>
  ),
};

/** One dialog for every decision of the production screen that needs a second look. */
export function ProductionConfirmDialog({
  confirmation,
  onConfirm,
  onClose,
  ...body
}: ProductionConfirmDialogProps) {
  const copy = confirmation ? PRODUCTION_CONFIRM_COPY[confirmation.kind] : null;
  return (
    <ConfirmDialog
      data-testid="ai-lesson-production-confirm-dialog"
      open={Boolean(confirmation)}
      maxWidth="sm"
      title={copy?.title(body.stageLabel)}
      confirmText={copy?.confirmText}
      confirmColor={copy?.confirmColor}
      onConfirm={onConfirm}
      onClose={onClose}
      autoCloseOnConfirm={false}
    >
      {confirmation && CONFIRM_BODIES[confirmation.kind](body)}
    </ConfirmDialog>
  );
}
