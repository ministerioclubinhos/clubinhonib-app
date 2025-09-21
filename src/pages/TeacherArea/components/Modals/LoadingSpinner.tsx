import { Backdrop, CircularProgress } from '@mui/material';

interface LoadingSpinnerProps {
  open: boolean;
}

export function LoadingSpinner({ open }: LoadingSpinnerProps) {
  return (
    <Backdrop open={open} sx={{ zIndex: 9999, color: '#fff' }}>
      <CircularProgress color="inherit" />
    </Backdrop>
  );
}
