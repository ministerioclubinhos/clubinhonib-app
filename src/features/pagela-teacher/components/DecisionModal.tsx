import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  FormControlLabel, Stack, Switch, TextField, Typography, useMediaQuery, useTheme
} from "@mui/material";
import { useEffect, useState } from "react";
import { apiCreateAcceptedChrist } from "../api";
import type { ChildSimpleResponseDto } from "@/features/children/types";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import FavoriteIcon from "@mui/icons-material/Favorite";

interface Props {
  open: boolean;
  onClose: () => void;
  child: ChildSimpleResponseDto;
  onSuccess?: () => void;
}

export default function DecisionModal({ open, onClose, child, onSuccess }: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const alreadyAccepted = child.acceptedChrists.length > 0;
  const title = alreadyAccepted
    ? "A criança quer se reconciliar com Jesus?"
    : "A criança fez a decisão de aceitar Jesus?";

  const [decision, setDecision] = useState(false);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const canSubmit = decision;

  const handleClose = () => {
    setDecision(false);
    setNotes("");
    onClose();
  };

  useEffect(() => {
    if (!open) {
      setDecision(false);
      setNotes("");
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setLoading(true);
    try {
      await apiCreateAcceptedChrist({
        childId: child.id,
        decision: alreadyAccepted ? "RECONCILED" : "ACCEPTED",
        notes: notes || null,
      });
      if (onSuccess) await onSuccess();
      handleClose();
    } catch (e) {
      console.error("Erro ao salvar decisão", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ fontSize: { xs: "0.85rem", sm: "1rem" } }}>{title}</DialogTitle>
      <DialogContent sx={{ position: "relative", overflow: "hidden" }}>
        <Box sx={{
          position: "absolute", top: -30, right: -20,
          opacity: 0.12, transform: "rotate(15deg)",
          fontSize: 160, color: theme.palette.error.main, pointerEvents: "none"
        }}>
          <FavoriteIcon fontSize="inherit" />
        </Box>
        <Box sx={{
          position: "absolute", bottom: -30, left: -20,
          opacity: 0.12, transform: "rotate(-15deg)",
          fontSize: 160, color: theme.palette.error.main, pointerEvents: "none"
        }}>
          <FavoriteIcon fontSize="inherit" />
        </Box>

        <Typography sx={{ mb: 2, fontSize: { xs: "0.85rem", sm: "1rem" } }}>
          Criança: <strong>{child.name}</strong>
        </Typography>

        <RowSwitch
          icon={<CheckCircleIcon />}
          label="Sim, quero registrar"
          checked={decision}
          onChange={setDecision}
        />

        <TextField
          label="Observações (opcional)"
          fullWidth
          multiline
          rows={isMobile ? 2 : 3}
          margin="normal"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          InputProps={{
            sx: { fontSize: { xs: "0.85rem", sm: "1rem" } },
          }}
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Cancelar</Button>
        <Button
          onClick={handleSubmit}
          disabled={!canSubmit || loading}
          variant="contained"
        >
          Salvar
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
    <FormControlLabel
      control={<Switch checked={checked} onChange={(_, v) => onChange(v)} />}
      label={
        <Stack direction="row" spacing={0.75} alignItems="center">
          <Box sx={{ "& svg": { fontSize: 18, opacity: 0.9 } }}>{icon}</Box>
          <Typography fontWeight={800} sx={{ fontSize: { xs: "0.7rem", sm: "1rem" } }}>
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
