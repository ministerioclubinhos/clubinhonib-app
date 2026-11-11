import {
  Alert, Box, Button, IconButton, Dialog, DialogActions, DialogContent, DialogTitle,
  FormControlLabel, Stack, Switch, TextField, Typography, useMediaQuery, useTheme
} from "@mui/material";
import { useEffect, useState } from "react";
import { apiCreateAcceptedChrist, apiDeleteAcceptedChrist } from "../api";
import { DECISION_LABELS, DECISION_NOTES_MAX_LENGTH, DECISION_TEXTS } from "../constants";
import { hasAcceptedChrist } from "@/features/children/utils";
import { extractErrorMessage } from "@/utils/apiError";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import type { ChildListItem } from "@/features/children/types";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import FavoriteIcon from "@mui/icons-material/Favorite";

interface Props {
  open: boolean;
  onClose: () => void;
  child: ChildListItem;
  onSuccess?: () => void;
}

export default function DecisionModal({ open, onClose, child, onSuccess }: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Mesma conta do filtro da lista: registro antigo sem tipo não é aceitação.
  const alreadyAccepted = hasAcceptedChrist(child.acceptedChrists);
  const inactive = !child.isActive;
  const title = alreadyAccepted ? DECISION_TEXTS.reconcileTitle : DECISION_TEXTS.acceptTitle;
  const history = [...(child.acceptedChrists ?? [])].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );

  const [decision, setDecision] = useState(false);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const canSubmit = decision && !inactive;

  const handleClose = () => {
    if (loading) return;
    setDecision(false);
    setNotes("");
    setError("");
    setConfirmingId(null);
    onClose();
  };

  useEffect(() => {
    if (!open) {
      setDecision(false);
      setNotes("");
      setError("");
      setConfirmingId(null);
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!canSubmit || loading) return;
    setLoading(true);
    setError("");
    try {
      await apiCreateAcceptedChrist({
        childId: child.id,
        decision: alreadyAccepted ? "RECONCILED" : "ACCEPTED",
        notes: notes.trim() || null,
      });
      if (onSuccess) await onSuccess();
      setLoading(false);
      handleCloseAfterSuccess();
    } catch (err: unknown) {
      // A falha fica no modal: antes ia só para o console e a tela não reagia.
      setError(extractErrorMessage(err, DECISION_TEXTS.saveError));
      setLoading(false);
    }
  };

  const handleCloseAfterSuccess = () => {
    setDecision(false);
    setNotes("");
    onClose();
  };

  const handleDelete = async (id: string) => {
    if (loading) return;
    setLoading(true);
    setError("");
    try {
      await apiDeleteAcceptedChrist(id);
      setConfirmingId(null);
      if (onSuccess) await onSuccess();
    } catch (err: unknown) {
      setError(extractErrorMessage(err, DECISION_TEXTS.deleteError));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog data-testid="pagela-teacher-decision-modal" open={open} onClose={handleClose} fullWidth maxWidth="xs" fullScreen={isMobile}>
      <DialogTitle sx={{ fontSize: { xs: "1rem", sm: "1.1rem" }, fontWeight: 800 }}>{title}</DialogTitle>
      <DialogContent sx={{ position: "relative", overflow: "hidden auto" }}>
        <Box sx={{
          position: "absolute", top: -30, right: -20,
          opacity: 0.12, transform: "rotate(15deg)",
          fontSize: 160, color: theme.palette.error.main, pointerEvents: "none"
        }}>
          <FavoriteIcon fontSize="inherit" />
        </Box>

        <Typography sx={{ mb: 2, fontSize: { xs: "0.85rem", sm: "1rem" } }}>
          Criança: <strong>{child.name}</strong>
        </Typography>

        {inactive ? (
          <Alert severity="warning" data-testid="decision-inactive">
            {DECISION_TEXTS.inactive}
          </Alert>
        ) : (
          <RowSwitch
            icon={<CheckCircleIcon />}
            label="Sim, quero registrar"
            checked={decision}
            onChange={setDecision}
          />
        )}

        <TextField
          label="Observações (opcional)"
          fullWidth
          multiline
          rows={isMobile ? 2 : 3}
          margin="normal"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          disabled={inactive}
          slotProps={{ htmlInput: { maxLength: DECISION_NOTES_MAX_LENGTH } }}
        />

        {error && (
          <Alert severity="error" sx={{ mt: 1 }} data-testid="decision-error" onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        {history.length > 0 && (
          <Box sx={{ mt: 2 }} data-testid="decision-history">
            <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 0.5 }}>
              {DECISION_TEXTS.history}
            </Typography>
            <Stack spacing={0.75}>
              {history.map((item) => (
                <Stack
                  key={item.id}
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  spacing={1}
                  sx={{ px: 1, py: 0.5, borderRadius: 2, bgcolor: "action.hover" }}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="body2" fontWeight={700}>
                      {DECISION_LABELS[item.decision ?? "UNSPECIFIED"]}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(item.createdAt).toLocaleDateString("pt-BR")}
                    </Typography>
                  </Box>
                  {confirmingId === item.id ? (
                    <Stack direction="row" spacing={0.5}>
                      <Button size="small" onClick={() => setConfirmingId(null)} disabled={loading}>
                        Não
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        variant="contained"
                        onClick={() => handleDelete(item.id)}
                        disabled={loading}
                      >
                        Excluir
                      </Button>
                    </Stack>
                  ) : (
                    <IconButton
                      size="small"
                      aria-label={`Excluir registro: ${DECISION_LABELS[item.decision ?? "UNSPECIFIED"]}`}
                      onClick={() => setConfirmingId(item.id)}
                      disabled={loading}
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  )}
                </Stack>
              ))}
            </Stack>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>Fechar</Button>
        <Button
          onClick={handleSubmit}
          disabled={!canSubmit || loading}
          variant="contained"
        >
          {loading ? "Salvando..." : "Salvar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function RowSwitch({
  icon,
  label,
  checked,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <FormControlLabel data-testid="pagela-teacher-decision-modal-row-switch"
      control={<Switch checked={checked} onChange={(_, v) => onChange(v)} />}
      label={
        <Stack direction="row" spacing={0.75} alignItems="center">
          <Box sx={{ "& svg": { fontSize: 18, opacity: 0.9 } }}>{icon}</Box>
          <Typography fontWeight={800} sx={{ fontSize: { xs: "0.9rem", sm: "1rem" } }}>
            {label}
          </Typography>
        </Stack>
      }
      labelPlacement="start"
      sx={{
        m: 0,
        px: 1,
        py: 0.5,
        borderRadius: 2,
        justifyContent: "space-between",
        bgcolor: (theme) => theme.palette.action.selected,
      }}
    />
  );
}
