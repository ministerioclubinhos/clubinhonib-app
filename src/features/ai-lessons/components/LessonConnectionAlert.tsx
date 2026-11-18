import { Alert, Button } from '@mui/material';
import { STUDIO_CONNECTION_COPY, STUDIO_CONNECTION_TEST_IDS } from '../presentation.constants';
import { LessonConnectionState, type LessonConnectionAlertProps } from '../types';

export function LessonConnectionAlert({ state, screen, onBackToList }: LessonConnectionAlertProps) {
  if (state === LessonConnectionState.CONNECTED || state === LessonConnectionState.CONNECTING)
    return null;
  const terminal =
    state === LessonConnectionState.DENIED || state === LessonConnectionState.NOT_FOUND;
  return (
    <Alert
      data-testid={STUDIO_CONNECTION_TEST_IDS[screen]}
      data-connection-state={state}
      severity={terminal ? 'error' : 'info'}
      sx={{ mb: 2 }}
      action={
        state === LessonConnectionState.NOT_FOUND ? (
          <Button
            data-testid={`${STUDIO_CONNECTION_TEST_IDS[screen]}-back`}
            color="inherit"
            size="small"
            onClick={onBackToList}
            sx={{ minHeight: 44 }}
          >
            Voltar para a lista
          </Button>
        ) : undefined
      }
    >
      {STUDIO_CONNECTION_COPY[screen][state]}
    </Alert>
  );
}
