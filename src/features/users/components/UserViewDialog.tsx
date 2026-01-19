import React, { useMemo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  Grid,
  Stack,
  Tooltip,
  IconButton,
  Divider,
  Alert,
  Link,
  Paper,
  useMediaQuery,
  useTheme,
  Avatar,
} from "@mui/material";
import {
  WhatsApp,
  PhoneIphone,
  AlternateEmail,
  Badge,
  AccessTime,
  ContentCopy,
  Phone as PhoneIcon,
} from "@mui/icons-material";
import { useSelector } from "react-redux";
import { SENSITIVE_KEYS, UserRow } from "../types";
import { UserRole } from "@/types/shared";
import { buildWhatsappLink } from "@/utils/whatsapp";
import { formatDate } from "@/utils/dateUtils";
import { roleChipColor, anchorProps, isCoreOrSensitive } from "@/utils/textUtils";
import { initials, CopyButton } from "@/utils/components";
import { RootState } from "@/store/slices";

type Props = { open: boolean; user: UserRow | null; onClose: () => void };

const roleLabels: Record<UserRole, string> = {
  [UserRole.ADMIN]: "Administrador",
  [UserRole.COORDINATOR]: "Coordenador",
  [UserRole.TEACHER]: "Professor",
};

function LineCard({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Paper variant="outlined" sx={{ p: 1.25, borderRadius: 2 }}>
      <Stack spacing={0.5}>
        <Stack direction="row" spacing={0.75} alignItems="center">
          {icon}
          <Typography variant="caption" color="text.secondary">
            {title}
          </Typography>
        </Stack>
        {children}
      </Stack>
    </Paper>
  );
}

export default function UserViewDialog({ open, user, onClose }: Props) {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));

  const { user: loggedUser } = useSelector((state: RootState) => state.auth);
  const waLink = useMemo(() => (user ? buildWhatsappLink(user.name, loggedUser?.name, user.phone) ?? undefined : undefined), [user, loggedUser?.name]);
  const telLink = user?.phone ? `tel:${user.phone}` : undefined;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="lg"
      PaperProps={{
        sx: {
          width: isXs ? "98%" : "44rem",
          m: 0,
          borderRadius: { xs: 2, sm: 3 },
          overflow: "hidden",
        },
      }}
    >
      <Box
        sx={{
          px: { xs: 2, sm: 3 },
          pt: { xs: 2, sm: 3 },
          pb: { xs: 1.25, sm: 1.5 },
          background:
            "linear-gradient(135deg, rgba(2,136,209,.08) 0%, rgba(76,175,80,.08) 100%)",
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        {!user ? (
          <Typography variant="h6">Detalhes do Usuário</Typography>
        ) : (
          <Stack spacing={1.25}>
            <Stack direction="row" spacing={1.25} alignItems="center">
              <Avatar
                sx={{
                  width: 48,
                  height: 48,
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                  fontWeight: 700,
                }}
                aria-label="avatar do usuário"
              >
                {initials(user.name)}
              </Avatar>
              <Box sx={{ minWidth: 0 }}>
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  flexWrap="wrap"
                >
                  <Typography
                    variant="h6"
                    fontWeight={800}
                    noWrap={!isXs}
                    title={user.name}
                  >
                    {user.name || "—"}
                  </Typography>
                  <Chip
                    size="small"
                    label={roleLabels[user.role] ?? "Usuário"}
                    color={roleChipColor(user.role)}
                    variant="outlined"
                  />
                </Stack>

              </Box>
            </Stack>

          </Stack>
        )}
      </Box>

      <DialogContent dividers sx={{ p: { xs: 2, sm: 3 } }}>
        {!user ? (
          <Alert severity="info">Nenhum usuário selecionado.</Alert>
        ) : (
          <Stack spacing={2}>
            <Grid container spacing={1.25}>
              <Grid item xs={12} sm={6}>
                <LineCard icon={<AlternateEmail fontSize="small" />} title="E-mail">
                  <Stack direction="row" spacing={0.5} alignItems="center" flexWrap="wrap">
                    <Link href={`mailto:${user.email}`} underline="hover" sx={{ fontSize: ".95rem" }}>
                      {user.email}
                    </Link>
                    <CopyButton value={user.email} title="Copiar e-mail" />
                  </Stack>
                </LineCard>
              </Grid>
              <Grid item xs={12} sm={6}>
                <LineCard icon={<PhoneIphone fontSize="small" />} title="Telefone">
                  {user.phone ? (
                    <Stack direction="row" spacing={0.5} alignItems="center" flexWrap="wrap">
                      <Link href={telLink} underline="hover" sx={{ fontSize: ".95rem" }}>
                        {user.phone}
                      </Link>
                      <Tooltip title={waLink ? "Abrir WhatsApp" : "Sem número"}>
                        <span>
                          <IconButton size="small" color="success" {...anchorProps(waLink)} disabled={!waLink}>
                            <WhatsApp fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                      <CopyButton value={user.phone} title="Copiar telefone" />
                    </Stack>
                  ) : (
                    <Typography variant="body2">—</Typography>
                  )}
                </LineCard>
              </Grid>
            </Grid>

            <Paper variant="outlined" sx={{ p: 1.25, borderRadius: 2 }}>
              <Stack direction="row" spacing={1} flexWrap="wrap" rowGap={1}>
                <Chip
                  size="small"
                  label={`Ativo: ${user.active ? "Sim" : "Não"}`}
                  color={user.active ? "success" : "default"}
                  variant={user.active ? "filled" : "outlined"}
                />
                <Chip
                  size="small"
                  label={`Completo: ${user.completed ? "Sim" : "Não"}`}
                  color={user.completed ? "success" : "default"}
                  variant={user.completed ? "filled" : "outlined"}
                />
                <Chip
                  size="small"
                  label={`Usuário comum: ${user.commonUser ? "Sim" : "Não"}`}
                  color={user.commonUser ? "info" : "default"}
                  variant={user.commonUser ? "filled" : "outlined"}
                />
              </Stack>
            </Paper>

            <Grid container spacing={1.25}>
              <Grid item xs={12} sm={6}>
                <LineCard icon={<AccessTime fontSize="small" />} title="Criado em">
                  <Typography>{formatDate(user.createdAt)}</Typography>
                </LineCard>
              </Grid>
              <Grid item xs={12} sm={6}>
                <LineCard icon={<AccessTime fontSize="small" />} title="Atualizado em">
                  <Typography>{formatDate(user.updatedAt)}</Typography>
                </LineCard>
              </Grid>
            </Grid>

            {Object.entries(user).some(([k]) => !isCoreOrSensitive(k)) && (
              <Paper variant="outlined" sx={{ p: 1.25, borderRadius: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Outros campos
                </Typography>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                    gap: 1.25,
                  }}
                >
                  {Object.entries(user)
                    .filter(([k]) => !isCoreOrSensitive(k))
                    .map(([k, v]) => (
                      <Box key={k}>
                        <Typography variant="caption" color="text.secondary">
                          {k}
                        </Typography>
                        <Typography>{String(v ?? "—")}</Typography>
                      </Box>
                    ))}
                </Box>
              </Paper>
            )}
          </Stack>
        )}
      </DialogContent>

      <DialogActions
        sx={{
          p: { xs: 1.5, sm: 2 },
          gap: 1,
          flexWrap: "wrap",
          justifyContent: "space-between",
        }}
      >
        <Tooltip title={waLink ? "Abrir WhatsApp" : "Sem telefone"}>
          <span>
            <Button
              fullWidth={isXs}
              variant="contained"
              color="success"
              startIcon={<WhatsApp />}
              {...anchorProps(waLink)}
              disabled={!waLink}
            >
              Conversar no WhatsApp
            </Button>
          </span>
        </Tooltip>

        <Button fullWidth={isXs} onClick={onClose}>
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
