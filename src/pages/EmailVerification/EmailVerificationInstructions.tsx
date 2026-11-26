import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Container, Paper, Typography } from '@mui/material';

import ResendVerificationForm from '@/features/auth/components/ResendVerificationForm';
import { EMAIL_VERIFICATION_SUBJECT, EMAIL_VERIFICATION_TTL_HOURS } from '@/features/auth/constants';

const EmailVerificationInstructions = () => (
  <Box data-testid="email-verification-email-verification-instructions" sx={{ px: 2, pt: { xs: 6, md: 12 }, pb: 6 }}>
    <Container maxWidth="sm" disableGutters>
      <Paper
        elevation={3}
        sx={{ p: { xs: 3, md: 4 }, borderRadius: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}
      >
        <Typography variant="h5" component="h1" align="center" fontWeight="bold">
          Verifique seu e-mail
        </Typography>
        <Typography>Para ativar sua conta, siga os passos abaixo:</Typography>
        <Box component="ol" sx={{ m: 0, pl: 3, '& li': { mb: 1 } }}>
          <li>Acesse seu e-mail (verifique também a caixa de spam).</li>
          <li>
            Abra a mensagem com o assunto <b>&ldquo;{EMAIL_VERIFICATION_SUBJECT}&rdquo;</b>.
          </li>
          <li>
            Toque em <b>Confirmar e-mail</b>. O link vale por {EMAIL_VERIFICATION_TTL_HOURS} horas.
          </li>
        </Box>
        <Typography variant="body2" color="text.secondary">
          Não chegou? Peça um novo link:
        </Typography>
        <ResendVerificationForm />
        <Button component={RouterLink} to="/login" sx={{ minHeight: 44 }}>
          Voltar para o login
        </Button>
      </Paper>
    </Container>
  </Box>
);

export default EmailVerificationInstructions;
