import React, { useState } from 'react';
import { Alert, Box, Button, CircularProgress, TextField } from '@mui/material';

import { getErrorMessage } from '@/utils/apiError';

import { resendEmailVerification } from '../api';
import { EMAIL_CONFIRMATION_MESSAGES } from '../constants';

interface Feedback {
  severity: 'success' | 'error';
  text: string;
}

/** Pede um novo link de confirmação para o endereço informado. */
export default function ResendVerificationForm() {
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSending(true);
    setFeedback(null);
    try {
      const { emailVerification } = await resendEmailVerification({ email: email.trim() });
      setFeedback({ severity: 'success', text: emailVerification.message ?? '' });
    } catch (error) {
      setFeedback({
        severity: 'error',
        text: getErrorMessage(error, EMAIL_CONFIRMATION_MESSAGES.RESEND_FAILED),
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Box
      data-testid="auth-resend-verification-form"
      component="form"
      onSubmit={handleSubmit}
      sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, width: '100%' }}
    >
      {feedback && <Alert severity={feedback.severity}>{feedback.text}</Alert>}
      <TextField
        type="email"
        label="E-mail cadastrado"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        required
        fullWidth
      />
      <Button type="submit" variant="outlined" disabled={sending || !email.trim()} sx={{ minHeight: 44 }}>
        {sending ? <CircularProgress size={22} aria-label="Enviando" /> : 'Reenviar link de confirmação'}
      </Button>
    </Box>
  );
}
