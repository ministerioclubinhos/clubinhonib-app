import { Alert, Button, Stack, Typography } from '@mui/material';
import { PRODUCTION_TEXTS } from '../../production.constants';
import type { ProductionNoticesProps } from '../../production.types';

/** Page-level warnings about local edits: recovered, unsaved, or behind the server. */
export function ProductionNotices({
  recovered,
  hasDrafts,
  draftOutdated,
  rebaseDisabled,
  onDismissRecovered,
  onViewRemote,
  onRebase,
}: ProductionNoticesProps) {
  return (
    <>
      {recovered && (
        <Alert
          data-testid="ai-lesson-draft-recovered"
          severity="info"
          onClose={onDismissRecovered}
          sx={{ mb: 2 }}
        >
          {PRODUCTION_TEXTS.draftRecovered}
        </Alert>
      )}
      {hasDrafts && (
        <Alert data-testid="ai-lesson-unsaved-notice" severity="warning" sx={{ mb: 2 }}>
          {PRODUCTION_TEXTS.unsavedNotice}
        </Alert>
      )}
      {draftOutdated && (
        <Alert
          data-testid="ai-lesson-draft-outdated"
          severity="error"
          sx={{ mb: 2, '& .MuiAlert-message': { width: '100%' } }}
        >
          <Typography variant="body2" sx={{ mb: 1 }}>
            {PRODUCTION_TEXTS.draftOutdated}
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <Button
              data-testid="ai-lesson-draft-view-remote"
              color="inherit"
              variant="outlined"
              onClick={onViewRemote}
              sx={{ minHeight: 44 }}
            >
              {PRODUCTION_TEXTS.viewRemote}
            </Button>
            <Button
              data-testid="ai-lesson-draft-rebase"
              color="inherit"
              variant="outlined"
              disabled={rebaseDisabled}
              onClick={onRebase}
              sx={{ minHeight: 44 }}
            >
              {PRODUCTION_TEXTS.rebase}
            </Button>
          </Stack>
        </Alert>
      )}
    </>
  );
}
