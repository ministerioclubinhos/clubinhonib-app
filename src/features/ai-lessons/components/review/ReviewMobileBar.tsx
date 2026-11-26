import { Button, Paper } from '@mui/material';
import { CheckCircle as ApproveIcon } from '@mui/icons-material';
import type { ReviewMobileBarProps } from '../../review.types';

/** No celular a decisão fica no fim da página: a barra a mantém à mão durante a leitura. */
export function ReviewMobileBar({
  approving,
  approveDisabled,
  requestChangesDisabled,
  onApprove,
  onFocusFeedback,
}: ReviewMobileBarProps) {
  return (
    <Paper
      elevation={6}
      data-testid="ai-lesson-review-mobile-bar"
      sx={{
        display: { xs: 'flex', lg: 'none' },
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1100,
        gap: 1,
        p: 1.25,
        paddingBottom: 'max(10px, env(safe-area-inset-bottom))',
        borderTop: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Button
        variant="outlined"
        color="error"
        disabled={requestChangesDisabled}
        onClick={onFocusFeedback}
        sx={{ flex: 1, minHeight: 44, fontWeight: 700, textTransform: 'none', borderRadius: 2.5 }}
      >
        Pedir ajuste
      </Button>
      <Button
        variant="contained"
        color="success"
        startIcon={<ApproveIcon />}
        disabled={approveDisabled}
        onClick={onApprove}
        sx={{ flex: 1.4, minHeight: 44, fontWeight: 800, textTransform: 'none', borderRadius: 2.5 }}
      >
        {approving ? 'Aprovando…' : 'Aprovar item'}
      </Button>
    </Paper>
  );
}
