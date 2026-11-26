import { useEffect, useRef, useState } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';
import { Alert, Box, Button, CircularProgress, Container, Paper, Typography } from '@mui/material';

import { verifyEmail } from '@/features/auth/api';
import ResendVerificationForm from '@/features/auth/components/ResendVerificationForm';
import { EMAIL_CONFIRMATION_MESSAGES } from '@/features/auth/constants';
import { EmailConfirmationStatus, type VerifyEmailResponseDto } from '@/features/auth/types';
import { getErrorMessage } from '@/utils/apiError';

/** Chegada do link "Confirmar e-mail": ativa a conta pelo token da URL. */
export default function ConfirmEmailPage() {
  const { token = '' } = useParams<{ token: string }>();
  const [status, setStatus] = useState(EmailConfirmationStatus.Confirming);
  const [message, setMessage] = useState('');
  // O token vale uma vez só: o efeito repetido do StrictMode reaproveita o
  // mesmo pedido, senão um link válido apareceria como já usado.
  const request = useRef<{ token: string; result: Promise<VerifyEmailResponseDto> } | null>(null);

  useEffect(() => {
    let active = true;
    if (request.current?.token !== token) {
      request.current = { token, result: verifyEmail({ token }) };
    }
    request.current.result.then(
      (response) => {
        if (!active) return;
        setMessage(response.message);
        setStatus(EmailConfirmationStatus.Confirmed);
      },
      (error: unknown) => {
        if (!active) return;
        setMessage(getErrorMessage(error, EMAIL_CONFIRMATION_MESSAGES.FAILED));
        setStatus(EmailConfirmationStatus.Failed);
      }
    );
    return () => {
      active = false;
    };
  }, [token]);

  return (
    <Box data-testid="auth-confirm-email-page" sx={{ px: 2, pt: { xs: 6, md: 12 }, pb: 6 }}>
      <Container maxWidth="sm" disableGutters>
        <Paper
          elevation={3}
          sx={{ p: { xs: 3, md: 4 }, borderRadius: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}
        >
          <Typography variant="h5" component="h1" align="center" fontWeight="bold">
            Confirmação de e-mail
          </Typography>

          {status === EmailConfirmationStatus.Confirming && (
            <Box sx={{ display: 'grid', placeItems: 'center', gap: 2 }} role="status">
              <CircularProgress aria-label={EMAIL_CONFIRMATION_MESSAGES.CONFIRMING} />
              <Typography color="text.secondary">{EMAIL_CONFIRMATION_MESSAGES.CONFIRMING}</Typography>
            </Box>
          )}

          {status === EmailConfirmationStatus.Confirmed && (
            <>
              <Alert severity="success">{message}</Alert>
              <Button component={RouterLink} to="/login" variant="contained" sx={{ minHeight: 44 }}>
                Entrar
              </Button>
            </>
          )}

          {status === EmailConfirmationStatus.Failed && (
            <>
              <Alert severity="error">{message}</Alert>
              <ResendVerificationForm />
              <Button component={RouterLink} to="/login" sx={{ minHeight: 44 }}>
                Voltar para o login
              </Button>
            </>
          )}
        </Paper>
      </Container>
    </Box>
  );
}
