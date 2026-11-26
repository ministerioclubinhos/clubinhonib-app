import React, { useEffect, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Stack,
  Tab,
  Tabs,
  Typography,
  alpha,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import FavoriteIcon from "@mui/icons-material/Favorite";
import PersonIcon from "@mui/icons-material/Person";

import { extractErrorMessage } from "@/utils/apiError";

import { apiDeleteProfile } from "../api";
import type { CompleteProfile } from "../types";
import { getInitials } from "../utils";
import PersonalDataForm from "./PersonalDataForm";
import PreferencesForm from "./PreferencesForm";
import { getGenderStyle, roleConfig } from "./profileStyles";

export type ProfileNoticeSeverity = "success" | "error";

interface ProfileAdminEditDialogProps {
  open: boolean;
  onClose: () => void;
  profile: CompleteProfile | null;
  /** Os dados foram salvos: a listagem precisa recarregar. */
  onUpdate: () => void;
  /** Avisa quem hospeda o diálogo, que mostra a mensagem fora dele. */
  onNotify?: (message: string, severity: ProfileNoticeSeverity) => void;
}

const SAVED_MESSAGE = "Perfil atualizado com sucesso.";
const CLEARED_MESSAGE = "Dados do perfil removidos.";

const ProfileAdminEditDialog: React.FC<ProfileAdminEditDialogProps> = ({
  open,
  onClose,
  profile,
  onUpdate,
  onNotify,
}) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));
  const [tab, setTab] = useState(0);
  const [error, setError] = useState("");
  const [confirmingClear, setConfirmingClear] = useState(false);
  const [clearing, setClearing] = useState(false);

  // Cada pessoa abre na primeira aba e sem o erro da anterior.
  useEffect(() => {
    if (open) {
      setTab(0);
      setError("");
      setConfirmingClear(false);
    }
  }, [open, profile?.id]);

  if (!profile) return null;

  const roleStyle = roleConfig[profile.role?.toLowerCase()] ?? roleConfig.teacher;
  const genderStyle = getGenderStyle(profile.personalData?.gender);

  const handleSaved = () => {
    onNotify?.(SAVED_MESSAGE, "success");
    onUpdate();
  };

  const handleClear = async () => {
    setClearing(true);
    try {
      await apiDeleteProfile(profile.id);
      setConfirmingClear(false);
      onNotify?.(CLEARED_MESSAGE, "success");
      onUpdate();
      onClose();
    } catch (err: unknown) {
      setConfirmingClear(false);
      setError(extractErrorMessage(err, "Não foi possível remover os dados do perfil"));
    } finally {
      setClearing(false);
    }
  };

  return (
    <>
      <Dialog
        data-testid="profile-profile-admin-edit-dialog"
        open={open}
        onClose={onClose}
        fullScreen={fullScreen}
        maxWidth="md"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: fullScreen ? 0 : 4, overflow: "hidden" } } }}
      >
        <DialogTitle component="div" sx={{ p: 0 }}>
          <Stack
            direction="row"
            spacing={1.5}
            alignItems="center"
            sx={{ p: 2, background: genderStyle.gradient, color: "common.white" }}
          >
            <Avatar
              src={profile.image?.url}
              alt={profile.name}
              sx={{ width: 48, height: 48, fontWeight: 800, border: "2px solid rgba(255,255,255,.7)", bgcolor: alpha("#fff", 0.25) }}
            >
              {!profile.image?.url && getInitials(profile.name)}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="overline" sx={{ color: "common.white", opacity: 0.85, lineHeight: 1.2 }}>
                Editar perfil · {roleStyle.label}
              </Typography>
              <Typography component="h2" variant="h6" fontWeight={800} noWrap sx={{ color: "common.white" }}>
                {profile.name}
              </Typography>
            </Box>
            <IconButton aria-label="Fechar" onClick={onClose} sx={{ color: "inherit", bgcolor: alpha("#fff", 0.2), "&:hover": { bgcolor: alpha("#fff", 0.32) } }}>
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent dividers sx={{ p: 0 }}>
          <Tabs value={tab} onChange={(_, value: number) => { setTab(value); setError(""); }} variant="fullWidth" sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tab icon={<PersonIcon />} label="Dados Pessoais" iconPosition="start" />
            <Tab icon={<FavoriteIcon />} label="Preferências" iconPosition="start" />
          </Tabs>

          {error ? (
            <Alert severity="error" onClose={() => setError("")} sx={{ m: 2, mb: 0 }}>
              {error}
            </Alert>
          ) : null}

          <Box
            role="tabpanel"
            data-testid="profile-profile-admin-edit-dialog-tab-panel"
            id={`profile-tabpanel-${tab}`}
            sx={{ p: { xs: 2, sm: 3 } }}
          >
            {tab === 0 ? (
              <PersonalDataForm userId={profile.id} personalData={profile.personalData} onUpdate={handleSaved} onError={setError} />
            ) : (
              <PreferencesForm userId={profile.id} preferences={profile.preferences} onUpdate={handleSaved} onError={setError} />
            )}
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 2, py: 1.25, justifyContent: "space-between" }}>
          <Button color="error" size="small" startIcon={<DeleteSweepIcon />} onClick={() => setConfirmingClear(true)} sx={{ textTransform: "none" }}>
            Limpar dados do perfil
          </Button>
          <Button onClick={onClose} sx={{ textTransform: "none" }}>
            Fechar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog data-testid="profile-admin-clear-confirm" open={open && confirmingClear} onClose={() => !clearing && setConfirmingClear(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Limpar dados de {profile.name}?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Isso apaga a data de nascimento, o gênero, o líder de GA e todas as preferências desta pessoa.
            A conta e o acesso dela continuam como estão. Não dá para desfazer.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button disabled={clearing} onClick={() => setConfirmingClear(false)}>
            Cancelar
          </Button>
          <Button color="error" variant="contained" disabled={clearing} onClick={() => void handleClear()} startIcon={clearing ? <CircularProgress size={16} color="inherit" /> : undefined}>
            {clearing ? "Removendo…" : "Limpar dados"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ProfileAdminEditDialog;
