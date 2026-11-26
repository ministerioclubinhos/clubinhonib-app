import { Backdrop, CircularProgress } from '@mui/material';

interface LoadingSpinnerProps {
  open: boolean;
}

export function LoadingSpinner({ open }: LoadingSpinnerProps) {
  return (
    <Backdrop data-testid="teacher-area-modals-loading-spinner" open={open} sx={{ zIndex: 9999, color: '#fff' }}>
      <CircularProgress color="inherit" />
    </Backdrop>
  );
}
