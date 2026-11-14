import React from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import MarkEmailUnreadIcon from "@mui/icons-material/MarkEmailUnread";
import { Link as RouterLink, useSearchParams } from "react-router-dom";

import { UNSUBSCRIBE_TOKEN_PARAM } from "./constants";
import { useUnsubscribeFromNotices } from "./hooks";

/**
 * Onde o link do rodapé do e-mail chega.
 *
 * A página não descadastra sozinha ao abrir: pede a confirmação. Os provedores
 * de e-mail visitam os links das mensagens antes de a pessoa clicar, e agir na
 * abertura tiraria da lista quem nunca tocou no link.
 */
export default function UnsubscribePage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get(UNSUBSCRIBE_TOKEN_PARAM);

  const { status, message, unsubscribe } = useUnsubscribeFromNotices(token);

  const isDone = status === "done";
  const isLoading = status === "loading";

  return (
    <Box data-testid="email-preferences-unsubscribe-page"
      sx={{
        minHeight: "100vh",
        "@supports (min-height: 100dvh)": { minHeight: "100dvh" },
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: { xs: 2, sm: 3 },
        bgcolor: "#f9fafb",
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 520,
          p: { xs: 3, sm: 4 },
          borderRadius: 3,
          border: 1,
          borderColor: "divider",
          textAlign: "center",
        }}
      >
        <Stack spacing={2} alignItems="center">
          {isDone ? (
            <CheckCircleOutlineIcon color="success" sx={{ fontSize: 56 }} />
          ) : (
            <MarkEmailUnreadIcon color="action" sx={{ fontSize: 56 }} />
          )}

          <Typography component="h1" variant="h5" fontWeight={800}>
            {isDone ? "Tudo certo" : "Cancelar o recebimento"}
          </Typography>

          {isDone ? (
            <Typography variant="body2" color="text.secondary">
              {message}
            </Typography>
          ) : (
            <>
              <Typography variant="body2" color="text.secondary">
                Você deixa de receber os avisos do Clubinho — novos materiais da
                semana e eventos da agenda.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                E-mails de recuperação de senha e de confirmação de conta
                continuam chegando: eles respondem a algo que você mesmo pedir.
              </Typography>
            </>
          )}

          {status === "error" ? (
            <Alert severity="error" sx={{ width: "100%", textAlign: "left" }}>
              {message}
            </Alert>
          ) : null}

          {isDone ? (
            <Button
              component={RouterLink}
              to="/"
              variant="outlined"
              fullWidth
              sx={{ mt: 1 }}
            >
              Voltar ao site
            </Button>
          ) : (
            <Stack spacing={1} sx={{ width: "100%", mt: 1 }}>
              <Button
                type="button"
                variant="contained"
                color="error"
                fullWidth
                disabled={isLoading || !token}
                onClick={() => void unsubscribe()}
                startIcon={
                  isLoading ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : undefined
                }
              >
                Não quero mais receber
              </Button>

              <Button component={RouterLink} to="/" fullWidth>
                Continuar recebendo
              </Button>
            </Stack>
          )}
        </Stack>
      </Paper>
    </Box>
  );
}
