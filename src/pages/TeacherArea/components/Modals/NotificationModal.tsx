import { Snackbar, Alert } from '@mui/material';

interface NotificationProps {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
  onClose: () => void;
}

export function NotificationModal({ open, message, severity, onClose }: NotificationProps) {
  return (
    <Snackbar
      open={open}
      autoHideDuration={4000}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Alert severity={severity} variant="filled" onClose={onClose} sx={{ width: '100%' }}>
        {message}
      </Alert>
    </Snackbar>
  );
}
