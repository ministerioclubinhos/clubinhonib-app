import type { ReactNode } from 'react';
import { Alert, AlertTitle, Box, Button, Paper, Skeleton, Stack, Typography } from '@mui/material';

import { OBSERVABILITY_AUDIT_MESSAGES } from '../constants';

interface RecordsTableShellProps {
  title: string;
  description: string;
  testIds: {
    panel: string;
    loading: string;
    empty: string;
    error: string;
    unavailable: string;
  };
  loading: boolean;
  initialLoading: boolean;
  error: string;
  /** Erro de uma ação (excluir), mostrado no painel e dispensável. */
  actionError?: string;
  onDismissActionError?: () => void;
  /** Storage `file`: a API não lista nem apaga; explica em vez de tabela vazia. */
  unavailable: boolean;
  isEmpty: boolean;
  onRetry: () => void;
  /** Toolbar de filtros da aba. */
  toolbar: ReactNode;
  /** A tabela em si; o shell só decide quando mostrá-la. */
  children: ReactNode;
  pagination: ReactNode;
}

const SKELETON_ROWS = 5;

/**
 * A casca comum às duas abas: título, toolbar, loading, erro, vazio e o
 * espaço da tabela.
 *
 * Só o que é igual mora aqui; as colunas e o DTO são de cada tabela. Não há
 * flag que misture os dois contratos.
 */
export default function RecordsTableShell({
  title,
  description,
  testIds,
  loading,
  initialLoading,
  error,
  actionError,
  onDismissActionError,
  unavailable,
  isEmpty,
  onRetry,
  toolbar,
  children,
  pagination,
}: RecordsTableShellProps) {
  const headingId = `${testIds.panel}-title`;
  const showTable = !initialLoading && !isEmpty && !unavailable;

  return (
    <Paper
      data-testid={testIds.panel}
      component="section"
      aria-labelledby={headingId}
      aria-busy={loading}
      variant="outlined"
      sx={{ p: { xs: 1.5, sm: 3 }, borderRadius: { xs: 2, sm: 3 }, minWidth: 0 }}
    >
      <Stack spacing={0.5} sx={{ mb: 2 }}>
        <Typography id={headingId} variant="h6" component="h2" fontWeight={700}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </Stack>

      {toolbar}

      {unavailable && (
        <Alert data-testid={testIds.unavailable} severity="info" role="status" sx={{ mb: 2 }}>
          <AlertTitle>{OBSERVABILITY_AUDIT_MESSAGES.unavailableTitle}</AlertTitle>
          {OBSERVABILITY_AUDIT_MESSAGES.unavailableBody}
        </Alert>
      )}

      {actionError && (
        <Alert severity="error" role="alert" onClose={onDismissActionError} sx={{ mb: 2 }}>
          {actionError}
        </Alert>
      )}

      {error && (
        <Alert
          data-testid={testIds.error}
          severity="error"
          role="alert"
          sx={{ mb: 2, alignItems: 'center' }}
          action={
            <Button color="inherit" size="small" onClick={onRetry} disabled={loading} sx={{ minHeight: 44 }}>
              {OBSERVABILITY_AUDIT_MESSAGES.retry}
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {initialLoading && (
        <Stack data-testid={testIds.loading} spacing={1} role="status" aria-label={`Carregando ${title.toLowerCase()}`}>
          {Array.from({ length: SKELETON_ROWS }, (_, index) => (
            <Skeleton key={index} variant="rectangular" height={40} sx={{ borderRadius: 1 }} />
          ))}
        </Stack>
      )}

      {!initialLoading && isEmpty && !error && !unavailable && (
        <Typography
          data-testid={testIds.empty}
          role="status"
          variant="body2"
          color="text.secondary"
          sx={{ py: 3, textAlign: 'center' }}
        >
          {OBSERVABILITY_AUDIT_MESSAGES.empty}
        </Typography>
      )}

      {showTable && (
        <Box sx={{ opacity: loading ? 0.55 : 1, transition: 'opacity 0.2s ease', minWidth: 0 }}>
          {children}
        </Box>
      )}

      {!initialLoading && !unavailable && pagination}
    </Paper>
  );
}
