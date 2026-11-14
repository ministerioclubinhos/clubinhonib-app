import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import ToggleOnIcon from "@mui/icons-material/ToggleOn";
import ToggleOffIcon from "@mui/icons-material/ToggleOff";

import { TOGGLE_ACTIVE_COPY } from "./constants";
import { ToggleActiveSubject } from "./types";

interface Props {
  open: boolean;
  title?: string;
  isActive: boolean;
  /**
   * O que está sendo ativado ou desativado.
   *
   * Obrigatório: o texto do diálogo era fixo em "criança", e a tela de
   * clubinhos herdava a pergunta errada. Declarar o assunto faz o compilador
   * cobrar de quem reusar o diálogo.
   */
  subject: ToggleActiveSubject;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  loading?: boolean;
}

export default function ToggleActiveConfirmDialog({
  open,
  title,
  isActive,
  subject,
  onClose,
  onConfirm,
  loading = false,
}: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const fs = {
    title: { xs: "0.9rem", sm: "1.05rem" },
    body: { xs: "0.85rem", sm: "0.95rem" },
    strong: { xs: "0.9rem", sm: "1rem" },
    warning: { xs: "0.75rem", sm: "0.85rem" },
    btn: { xs: "0.875rem", sm: "1rem" },
  } as const;

  const actionCapitalized = isActive ? "Desativar" : "Ativar";
  const copy = TOGGLE_ACTIVE_COPY[subject];
  const { question, consequence } = isActive ? copy.deactivate : copy.activate;

  return (
    <Dialog data-testid="modal-toggle-active-confirm-dialog"
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="xs"
      fullWidth
      aria-labelledby="toggle-active-dialog-title"
      aria-describedby="toggle-active-dialog-description"
      PaperProps={{
        sx: {
          borderRadius: { xs: 2, sm: 3 },
          m: { xs: 1.5, sm: 4 },
          width: { xs: "calc(100% - 24px)", sm: "auto" },
          maxWidth: { xs: "100%", sm: "400px" },
        },
      }}
    >
      <DialogTitle
        id="toggle-active-dialog-title"
        sx={{
          bgcolor: (t) => isActive ? t.palette.warning.main : t.palette.success.main,
          color: (t) => isActive ? t.palette.warning.contrastText : t.palette.success.contrastText,
          display: "flex",
          alignItems: "center",
          gap: 1,
          py: { xs: 1.5, sm: 2 },
          px: { xs: 1.5, sm: 2 }
        }}
      >
        <WarningAmberRoundedIcon fontSize={isMobile ? "small" : "medium"} />
        <Typography
          component="span"
          fontWeight={900}
          sx={{ fontSize: fs.title }}
        >
          Confirmar {actionCapitalized}
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ pt: 3, pb: 1.5 }}>
        <Typography
          id="toggle-active-dialog-description"
          sx={{ pt: 2, mb: 1.5, fontSize: fs.body, lineHeight: 1.5 }}
        >
          {question}
        </Typography>

        <Typography
          sx={{
            mb: 1.5,
            fontSize: fs.body,
            lineHeight: 1.4,
            color: "text.primary",
          }}
        >
          <strong style={{ fontSize: isMobile ? fs.strong.xs : fs.strong.sm }}>
            {title ?? copy.fallbackName}
          </strong>
        </Typography>

        <Typography
          sx={{
            color: (t) => isActive ? t.palette.warning.main : t.palette.success.main,
            fontWeight: 600,
            fontSize: fs.warning,
            lineHeight: 1.4,
          }}
        >
          {consequence}
        </Typography>
      </DialogContent>

      <DialogActions 
        sx={{ 
          px: { xs: 1.5, sm: 2 }, 
          pb: { xs: 1.5, sm: 2 }, 
          pt: { xs: 1.5, sm: 1 },
          gap: { xs: 1, sm: 1.5 },
          flexDirection: { xs: "column-reverse", sm: "row" },
          "& > *": {
            margin: "0 !important",
          }
        }}
      >
        <Button
          onClick={onClose}
          disabled={loading}
          variant="outlined"
          fullWidth
          size="large"
          sx={{ 
            fontSize: fs.btn, 
            py: { xs: 1.25, sm: 0.875 },
            minHeight: { xs: 48, sm: 40 },
            order: { xs: 2, sm: 1 }
          }}
        >
          Cancelar
        </Button>
        <Button
          onClick={onConfirm}
          color={isActive ? "warning" : "success"}
          variant="contained"
          startIcon={isActive ? <ToggleOffIcon fontSize="small" /> : <ToggleOnIcon fontSize="small" />}
          disabled={loading}
          fullWidth
          size="large"
          sx={{ 
            fontWeight: 800, 
            fontSize: fs.btn, 
            py: { xs: 1.25, sm: 0.875 },
            minHeight: { xs: 48, sm: 40 },
            order: { xs: 1, sm: 2 }
          }}
        >
          {loading ? `${actionCapitalized}...` : actionCapitalized}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

