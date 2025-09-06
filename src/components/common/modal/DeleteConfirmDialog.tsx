import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  useMediaQuery,
  useTheme,
  Stack,
} from "@mui/material";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import DeleteForeverRoundedIcon from "@mui/icons-material/DeleteForeverRounded";

interface Props {
  open: boolean;
  title?: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  loading?: boolean;
}

export default function DeleteConfirmDialog({
  open,
  title,
  onClose,
  onConfirm,
  loading = false,
}: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const fs = {
    title: { xs: "0.95rem", sm: "1.05rem" },
    body: { xs: "0.88rem", sm: "0.95rem" },
    strong: { xs: "0.9rem", sm: "1rem" },
    danger: { xs: "0.8rem", sm: "0.9rem" },
    btn: { xs: "0.95rem", sm: "1rem" },
  } as const;

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="xs"
      fullWidth
      aria-labelledby="delete-dialog-title"
      aria-describedby="delete-dialog-description"
      PaperProps={{
        sx: {
          borderRadius: 3,
          m: isMobile ? 2 : 4,
        },
      }}
    >
      <DialogTitle
        id="delete-dialog-title"
        sx={{
          bgcolor: (t) => t.palette.error.main,
          color: (t) => t.palette.error.contrastText,
          display: "flex",
          alignItems: "center",
          gap: 1,
          py: 2,
          px: 2
        }}
      >
        <WarningAmberRoundedIcon fontSize={isMobile ? "small" : "small"} />
        <Typography
          component="span"
          fontWeight={900}
          sx={{ fontSize: fs.title, px: 0 }}
        >
          Atenção! Ação Irreversível
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ pt: 3, pb: 1.5 }}>
        <Typography
          id="delete-dialog-description"
          sx={{ pt: 3, mb: 1.25, fontSize: fs.body, lineHeight: 1.4 }}
        >
          Você está prestes a excluir permanentemente:
          <br />
          <strong style={{ fontSize: isMobile ? fs.strong.xs : fs.strong.sm }}>
            {title ?? "este item"}
          </strong>
          .
        </Typography>

        <Typography
          sx={{
            color: "error.main",
            fontWeight: 700,
            fontSize: fs.danger,
          }}
        >
          Esta operação não pode ser desfeita. Todos os dados relacionados
          serão perdidos para sempre.
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: 2, pb: 2 }}>
        {isMobile ? (
          <Stack spacing={1} width="100%">
            <Button
              onClick={onConfirm}
              color="error"
              variant="contained"
              startIcon={<DeleteForeverRoundedIcon fontSize="small" />}
              disabled={loading}
              fullWidth
              size="large"
              sx={{ fontWeight: 800, fontSize: fs.btn, py: 1.1 }}
            >
              {loading ? "Excluindo..." : "Excluir"}
            </Button>
            <Button
              onClick={onClose}
              disabled={loading}
              fullWidth
              size="large"
              variant="outlined"
              sx={{ fontSize: fs.btn, py: 1.1 }}
            >
              Cancelar
            </Button>
          </Stack>
        ) : (
          <>
            <Button
              onClick={onClose}
              disabled={loading}
              sx={{ fontSize: fs.btn }}
            >
              Cancelar
            </Button>
            <Button
              onClick={onConfirm}
              color="error"
              variant="contained"
              startIcon={<DeleteForeverRoundedIcon fontSize="small" />}
              disabled={loading}
              sx={{ fontWeight: 700, fontSize: fs.btn }}
            >
              {loading ? "Excluindo..." : "Excluir"}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}
