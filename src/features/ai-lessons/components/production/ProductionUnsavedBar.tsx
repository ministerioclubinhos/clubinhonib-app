import { Button, Paper, Typography } from '@mui/material';
import { EditNote } from '@mui/icons-material';
import { PRODUCTION_TEXTS } from '../../production.constants';
import type { ProductionUnsavedBarProps } from '../../production.types';

/**
 * Keeps "save" within reach while the item has an unsaved edit: the item's own
 * buttons sit above a document that can be several screens long.
 */
export function ProductionUnsavedBar({
  visible,
  saveEnabled,
  savePending,
  onSave,
  onDiscard,
}: ProductionUnsavedBarProps) {
  if (!visible) return null;
  return (
    <Paper
      data-testid="ai-lesson-unsaved-bar"
      role="region"
      aria-label={PRODUCTION_TEXTS.unsavedBarLabel}
      elevation={6}
      sx={{
        // Fixed to the viewport on small screens; on desktop it sticks to the bottom of
        // the item column so it never covers the stage menu beside it.
        position: { xs: 'fixed', lg: 'sticky' },
        left: { xs: 0, lg: 'auto' },
        right: { xs: 0, lg: 'auto' },
        bottom: { xs: 0, lg: 16 },
        zIndex: (theme) => theme.zIndex.appBar,
        mt: { lg: 2 },
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        p: 1.25,
        pb: { xs: 'max(10px, env(safe-area-inset-bottom))', lg: 1.25 },
        borderRadius: { xs: 0, lg: 3 },
        border: '1px solid',
        borderColor: 'warning.main',
      }}
    >
      <Typography
        variant="body2"
        fontWeight={700}
        color="text.primary"
        sx={{ flex: 1, minWidth: 0, display: { xs: 'none', sm: 'block' } }}
      >
        {PRODUCTION_TEXTS.unsavedBarLabel}
        <Typography
          component="span"
          variant="caption"
          color="text.secondary"
          sx={{ ml: 1, display: { xs: 'none', lg: 'inline' } }}
        >
          {PRODUCTION_TEXTS.unsavedBarShortcut}
        </Typography>
      </Typography>
      <Button
        data-testid="ai-lesson-unsaved-bar-discard"
        disabled={savePending}
        onClick={onDiscard}
        sx={{ minHeight: 44, flex: { xs: 1, sm: 'none' } }}
      >
        {PRODUCTION_TEXTS.unsavedBarDiscard}
      </Button>
      <Button
        data-testid="ai-lesson-unsaved-bar-save"
        // Named apart from the item's own "Salvar edição" so each button stays unique
        // for assistive technology (and for selectors that look the button up by name).
        aria-label={PRODUCTION_TEXTS.unsavedBarSaveName}
        variant="contained"
        startIcon={<EditNote />}
        disabled={!saveEnabled}
        onClick={onSave}
        sx={{ minHeight: 44, flex: { xs: 2, sm: 'none' }, fontWeight: 700 }}
      >
        {savePending ? PRODUCTION_TEXTS.saving : PRODUCTION_TEXTS.save}
      </Button>
    </Paper>
  );
}
