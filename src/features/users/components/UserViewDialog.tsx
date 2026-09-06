import React, { useMemo } from "react";
import {
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  Grid2,
  IconButton,
  Link,
  Paper,
  Stack,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AlternateEmailIcon from "@mui/icons-material/AlternateEmail";
import PhoneIphoneIcon from "@mui/icons-material/PhoneIphone";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import { useSelector } from "react-redux";

import type { RootState } from "@/store/slices";
import { CopyButton } from "@/utils/components";
import { anchorProps, roleChipColor } from "@/utils/textUtils";
import { buildWhatsappLink } from "@/utils/whatsapp";

import { EMPTY_VALUE } from "../constants";
import { formatDate, formatPhone, userInitials, userRoleLabel } from "../utils";
import type { UserResponse } from "../types";

type Props = {
  user: UserResponse | null;
  onClose: () => void;
  onEdit: () => void;
};

/** Um dado do usuário, rotulado. */
function DetailCard({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Paper data-testid="users-user-view-dialog-detail-card" variant="outlined" sx={{ p: 1.25, borderRadius: 2, height: "100%" }}>
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

/**
 * Detalhes de um usuário.
 *
 * Só os campos do contrato aparecem. A versão anterior varria o objeto inteiro
 * numa seção "Outros campos": qualquer campo novo da API — inclusive um que
 * não devesse aparecer — passava a ser exibido sozinho.
 */
export default function UserViewDialog({ user, onClose, onEdit }: Props) {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));
  const loggedUser = useSelector((state: RootState) => state.auth.user);

  const whatsappLink = useMemo(
    () =>
      user
        ? (buildWhatsappLink(user.name, loggedUser?.name, user.phone) ??
          undefined)
        : undefined,
    [user, loggedUser?.name],
  );

  return (
    <Dialog data-testid="users-user-view-dialog"
      open={!!user}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      aria-labelledby="user-view-title"
    >
      {user ? (
        <>
          <Box
            sx={{
              px: { xs: 2, sm: 3 },
              pt: { xs: 2, sm: 3 },
              pb: 1.5,
              borderBottom: 1,
              borderColor: "divider",
            }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Avatar
                sx={{
                  width: 48,
                  height: 48,
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                  fontWeight: 700,
                }}
              >
                {userInitials(user.name)}
              </Avatar>

              <Box sx={{ minWidth: 0 }}>
                <Typography
                  id="user-view-title"
                  variant="h6"
                  fontWeight={800}
                  noWrap={!isXs}
                  title={user.name}
                >
                  {user.name || EMPTY_VALUE}
                </Typography>
                <Stack direction="row" spacing={0.75} sx={{ mt: 0.5 }} flexWrap="wrap" useFlexGap>
                  <Chip
                    size="small"
                    label={userRoleLabel(user.role)}
                    color={roleChipColor(user.role)}
                    variant="outlined"
                  />
                  <Chip
                    size="small"
                    label={user.active ? "Ativo" : "Inativo"}
                    color={user.active ? "success" : "default"}
                    variant={user.active ? "filled" : "outlined"}
                  />
                  <Chip
                    size="small"
                    label={user.completed ? "Cadastro completo" : "Cadastro incompleto"}
                    color={user.completed ? "success" : "warning"}
                    variant="outlined"
                  />
                </Stack>
              </Box>
            </Stack>
          </Box>

          <DialogContent dividers sx={{ p: { xs: 2, sm: 3 } }}>
            <Grid2 container spacing={1.25}>
              <Grid2 size={{ xs: 12, sm: 6 }}>
                <DetailCard
                  icon={<AlternateEmailIcon fontSize="small" />}
                  title="E-mail"
                >
                  <Stack direction="row" spacing={0.5} alignItems="center" flexWrap="wrap">
                    <Link href={`mailto:${user.email}`} underline="hover">
                      {user.email}
                    </Link>
                    <CopyButton value={user.email} title="Copiar e-mail" />
                  </Stack>
                </DetailCard>
              </Grid2>

              <Grid2 size={{ xs: 12, sm: 6 }}>
                <DetailCard
                  icon={<PhoneIphoneIcon fontSize="small" />}
                  title="Telefone"
                >
                  {user.phone ? (
                    <Stack direction="row" spacing={0.5} alignItems="center" flexWrap="wrap">
                      <Link href={`tel:${user.phone}`} underline="hover">
                        {formatPhone(user.phone)}
                      </Link>
                      <Tooltip title={whatsappLink ? "Abrir WhatsApp" : "Sem número"}>
                        <span>
                          <IconButton
                            size="small"
                            color="success"
                            aria-label="Abrir WhatsApp"
                            disabled={!whatsappLink}
                            {...anchorProps(whatsappLink)}
                          >
                            <WhatsAppIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                      <CopyButton value={user.phone} title="Copiar telefone" />
                    </Stack>
                  ) : (
                    <Typography variant="body2">{EMPTY_VALUE}</Typography>
                  )}
                </DetailCard>
              </Grid2>

              <Grid2 size={{ xs: 12, sm: 6 }}>
                <DetailCard
                  icon={<AccessTimeIcon fontSize="small" />}
                  title="Criado em"
                >
                  <Typography>{formatDate(user.createdAt)}</Typography>
                </DetailCard>
              </Grid2>

              <Grid2 size={{ xs: 12, sm: 6 }}>
                <DetailCard
                  icon={<AccessTimeIcon fontSize="small" />}
                  title="Atualizado em"
                >
                  <Typography>{formatDate(user.updatedAt)}</Typography>
                </DetailCard>
              </Grid2>
            </Grid2>
          </DialogContent>

          <DialogActions
            sx={{
              p: { xs: 1.5, sm: 2 },
              gap: 1,
              flexWrap: "wrap",
              justifyContent: "space-between",
            }}
          >
            <Tooltip title={whatsappLink ? "Abrir WhatsApp" : "Sem telefone"}>
              <span>
                <Button
                  type="button"
                  fullWidth={isXs}
                  variant="contained"
                  color="success"
                  startIcon={<WhatsAppIcon />}
                  disabled={!whatsappLink}
                  {...anchorProps(whatsappLink)}
                >
                  Conversar no WhatsApp
                </Button>
              </span>
            </Tooltip>

            <Stack direction="row" spacing={1} sx={{ width: isXs ? "100%" : "auto" }}>
              <Button type="button" fullWidth={isXs} onClick={onEdit}>
                Editar
              </Button>
              <Button type="button" fullWidth={isXs} onClick={onClose}>
                Fechar
              </Button>
            </Stack>
          </DialogActions>
        </>
      ) : null}
    </Dialog>
  );
}
