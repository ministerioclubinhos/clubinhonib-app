import React from 'react';
import { Alert, Box, Button, Skeleton } from '@mui/material';
import { STATISTICS_TEXTS } from '../../texts';

interface DataStateProps {
  /** Identificador da visão que está sendo carregada. */
  'data-testid': string;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  children: React.ReactNode;
}

/** Mostra o carregamento ou o erro com "Tentar de novo"; senão, o conteúdo. */
export const DataState: React.FC<DataStateProps> = ({ 'data-testid': testId, isLoading, isError, onRetry, children }) => {
  if (isLoading) {
    return (
      <Box data-testid="statistics-plain-data-state-loading" sx={{ display: 'grid', gap: 1.5 }}>
        <Skeleton variant="rounded" height={110} />
        <Skeleton variant="rounded" height={220} />
      </Box>
    );
  }

  if (isError) {
    return (
      <Alert
        data-testid="statistics-plain-data-state-error"
        severity="error"
        action={
          <Button color="inherit" size="small" onClick={onRetry} sx={{ minHeight: 44 }}>
            {STATISTICS_TEXTS.retry}
          </Button>
        }
      >
        {STATISTICS_TEXTS.loadError}
      </Alert>
    );
  }

  return (
    <Box data-testid={testId} sx={{ display: 'grid', gap: 2 }}>
      {children}
    </Box>
  );
};
