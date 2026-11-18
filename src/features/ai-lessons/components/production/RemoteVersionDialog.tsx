import { useId } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { EMPTY_STRUCTURED_DATA } from '../../constants';
import { PRODUCTION_TEXTS } from '../../production.constants';
import type { RemoteVersionDialogProps } from '../../production.types';
import { LessonStageContentViewer } from '../LessonStageContentViewer';

/** Read-only look at what the server holds, to compare before reapplying a local edit. */
export function RemoteVersionDialog({
  open,
  stage,
  stageLabel,
  version,
  document,
  onClose,
}: RemoteVersionDialogProps) {
  const titleId = useId();
  return (
    <Dialog
      data-testid="ai-lesson-remote-version-dialog"
      open={open && Boolean(stage)}
      onClose={onClose}
      aria-labelledby={titleId}
      fullWidth
      maxWidth="lg"
    >
      <DialogTitle id={titleId} sx={{ fontWeight: 800 }}>
        {PRODUCTION_TEXTS.remoteVersionTitle} {stageLabel}
      </DialogTitle>
      <DialogContent dividers>
        {stage && (
          <LessonStageContentViewer
            stage={stage}
            version={version}
            document={document}
            structuredData={version?.structuredDataJson ?? EMPTY_STRUCTURED_DATA}
            editable={false}
            readOnly
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button
          data-testid="ai-lesson-remote-version-close"
          onClick={onClose}
          sx={{ minHeight: 44 }}
        >
          {PRODUCTION_TEXTS.close}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
