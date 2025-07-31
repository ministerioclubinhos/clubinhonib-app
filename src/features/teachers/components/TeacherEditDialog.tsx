// src/modules/teachers/components/TeacherEditDialog.tsx
import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
  Alert,
  Box,
  Typography,
  Stack,
  InputAdornment,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import { TeacherProfile } from "../types";

type Props = {
  open: boolean;
  teacher: TeacherProfile | null;
  loading: boolean;
  error: string;
  onSetClub: (clubNumber: number) => void;
  onClearClub: () => void;
  onClose: () => void;
};

export default function TeacherEditDialog({
  open,
  teacher,
  loading,
  error,
  onSetClub,
  onClearClub,
  onClose,
}: Props) {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));

  const [clubInput, setClubInput] = React.useState<string>("");
  const [localErr, setLocalErr] = React.useState<string>("");

  React.useEffect(() => {
    setClubInput(teacher?.club?.number ? String(teacher.club.number) : "");
    setLocalErr("");
  }, [teacher]);

  const submit = React.useCallback(() => {
    setLocalErr("");
    const v = Number(clubInput);
    if (!clubInput || Number.isNaN(v) || v <= 0) {
      setLocalErr("Informe um número de clube válido (maior que zero).");
      return;
    }
    onSetClub(v);
  }, [clubInput, onSetClub]);

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter" && !loading) {
      e.preventDefault();
      submit();
    }
  };

  const currentClubLabel =
    teacher?.club?.number != null ? `#${teacher.club.number}` : "—";

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Vincular / Desvincular Clube</DialogTitle>

      <DialogContent
        dividers
        sx={{ p: { xs: 2, md: 3 }, position: "relative" }}
      >
        {(error || localErr) && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error || localErr}
          </Alert>
        )}

        {!!teacher && (
          <Grid container spacing={2}>
            {/* Identificação */}
            <Grid item xs={12}>
              <Typography
                component="div"
                sx={{ fontWeight: 700, lineHeight: 1.3 }}
              >
                {teacher.user?.name || teacher.user?.email || "—"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Clube atual: <strong>{currentClubLabel}</strong>
              </Typography>
            </Grid>

            {/* Campo + Ações */}
            <Grid item xs={12} md={8}>
              <TextField
                label="Número do Clube"
                type="number"
                size="small"
                fullWidth
                value={clubInput}
                onChange={(e) => setClubInput(e.target.value)}
                onKeyDown={handleKeyDown}
                inputProps={{ min: 1 }}
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">#</InputAdornment>
                  ),
                }}
                helperText={
                  teacher?.club?.number
                    ? `Digite um novo número para alterar o vínculo`
                    : `Digite o número do clube para vincular`
                }
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <Stack
                direction={isXs ? "row" : "column"}
                spacing={1}
                sx={{ height: "100%", alignItems: "stretch", justifyContent: "center" }}
              >
                <Button
                  variant="contained"
                  onClick={submit}
                  disabled={loading || !clubInput}
                >
                  Vincular
                </Button>
                <Button
                  color="warning"
                  variant="outlined"
                  onClick={onClearClub}
                  disabled={loading}
                >
                  Desvincular
                </Button>
              </Stack>
            </Grid>
          </Grid>
        )}

        {/* Loading overlay discreto */}
        {loading && (
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              bgcolor: "rgba(255,255,255,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
            }}
          >
            <CircularProgress size={28} />
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} sx={{ color: "text.secondary" }}>
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
