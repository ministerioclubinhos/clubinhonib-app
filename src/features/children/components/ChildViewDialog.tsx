import React from "react";
import {
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  Grid2,
  Link,
  Paper,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CakeIcon from "@mui/icons-material/Cake";
import GroupsIcon from "@mui/icons-material/Groups";
import PhoneIphoneIcon from "@mui/icons-material/PhoneIphone";
import PlaceIcon from "@mui/icons-material/Place";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import { useSelector } from "react-redux";

import type { RootState } from "@/store/slices";
import { anchorProps } from "@/utils/textUtils";
import { buildWhatsappLink } from "@/utils/whatsapp";

import { EMPTY_VALUE, Gender } from "../constants";
import {
  ageInYears,
  authorLabel,
  childInitials,
  clubLabel,
  formatDateOnly,
  formatPhone,
  genderLabel,
} from "../utils";
import type { ChildResponse } from "../types";

type Props = {
  child: ChildResponse | null;
  onClose: () => void;
  onEdit: () => void;
  onToggleActive: () => void;
};

/** Um dado da criança, rotulado. */
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
    <Paper data-testid="children-child-view-dialog-detail-card" variant="outlined" sx={{ p: 1.25, borderRadius: 2, height: "100%" }}>
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

/** Endereço completo em uma linha. */
function fullAddress(child: ChildResponse): string {
  const address = child.address;
  if (!address) return EMPTY_VALUE;

  const street = [address.street, address.number].filter(Boolean).join(", ");
  const parts = [
    street,
    address.complement,
    address.district,
    [address.city, address.state].filter(Boolean).join("/"),
    address.postalCode,
  ].filter((part) => part && String(part).trim());

  return parts.length ? parts.join(" · ") : EMPTY_VALUE;
}

/** Detalhes de uma criança. */
export default function ChildViewDialog({
  child,
  onClose,
  onEdit,
  onToggleActive,
}: Props) {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));
  const loggedUser = useSelector((state: RootState) => state.auth.user);

  const whatsappLink = React.useMemo(
    () =>
      child
        ? (buildWhatsappLink(
            child.guardianName,
            loggedUser?.name,
            child.guardianPhone,
          ) ?? undefined)
        : undefined,
    [child, loggedUser?.name],
  );

  const age = child ? ageInYears(child.birthDate) : null;

  return (
    <Dialog data-testid="children-child-view-dialog"
      open={!!child}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      aria-labelledby="child-view-title"
    >
      {child ? (
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
                  fontWeight: 700,
                  bgcolor:
                    child.gender === Gender.FEMALE
                      ? "secondary.main"
                      : "primary.main",
                  color: "common.white",
                }}
              >
                {childInitials(child.name)}
              </Avatar>

              <Box sx={{ minWidth: 0 }}>
                <Typography
                  id="child-view-title"
                  variant="h6"
                  fontWeight={800}
                  noWrap={!isXs}
                >
                  {child.name}
                </Typography>
                <Stack direction="row" spacing={0.75} sx={{ mt: 0.5 }} flexWrap="wrap" useFlexGap>
                  <Chip
                    size="small"
                    label={child.isActive ? "Ativa" : "Inativa"}
                    color={child.isActive ? "success" : "default"}
                    variant={child.isActive ? "filled" : "outlined"}
                  />
                  <Chip size="small" label={genderLabel(child.gender)} variant="outlined" />
                  <Chip
                    size="small"
                    label={clubLabel(child)}
                    color={child.club ? "primary" : "default"}
                    variant="outlined"
                  />
                </Stack>
              </Box>
            </Stack>
          </Box>

          <DialogContent dividers sx={{ p: { xs: 2, sm: 3 } }}>
            <Grid2 container spacing={1.25}>
              <Grid2 size={{ xs: 12, sm: 6 }}>
                <DetailCard icon={<CakeIcon fontSize="small" />} title="Nascimento">
                  <Typography>
                    {formatDateOnly(child.birthDate)}
                    {age === null ? "" : ` · ${age} ano(s)`}
                  </Typography>
                </DetailCard>
              </Grid2>

              <Grid2 size={{ xs: 12, sm: 6 }}>
                <DetailCard
                  icon={<GroupsIcon fontSize="small" />}
                  title="No clubinho desde"
                >
                  <Typography>{formatDateOnly(child.joinedAt)}</Typography>
                </DetailCard>
              </Grid2>

              <Grid2 size={{ xs: 12, sm: 6 }}>
                <DetailCard
                  icon={<PhoneIphoneIcon fontSize="small" />}
                  title="Responsável"
                >
                  <Typography>{child.guardianName}</Typography>
                  {child.guardianPhone ? (
                    <Link href={`tel:${child.guardianPhone}`} underline="hover">
                      {formatPhone(child.guardianPhone)}
                    </Link>
                  ) : (
                    <Typography variant="body2">{EMPTY_VALUE}</Typography>
                  )}
                </DetailCard>
              </Grid2>

              <Grid2 size={{ xs: 12, sm: 6 }}>
                <DetailCard icon={<PlaceIcon fontSize="small" />} title="Endereço">
                  <Typography variant="body2">{fullAddress(child)}</Typography>
                </DetailCard>
              </Grid2>

              <Grid2 size={{ xs: 12, sm: 6 }}>
                <DetailCard
                  icon={<AccessTimeIcon fontSize="small" />}
                  title="Cadastrada em"
                >
                  <Typography>{formatDateOnly(child.createdAt)}</Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    data-testid="child-created-by"
                  >
                    por {authorLabel(child.createdBy)}
                  </Typography>
                </DetailCard>
              </Grid2>

              <Grid2 size={{ xs: 12, sm: 6 }}>
                <DetailCard
                  icon={<AccessTimeIcon fontSize="small" />}
                  title="Atualizada em"
                >
                  <Typography>{formatDateOnly(child.updatedAt)}</Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    data-testid="child-updated-by"
                  >
                    por {authorLabel(child.updatedBy)}
                  </Typography>
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
            <Button
              type="button"
              fullWidth={isXs}
              variant="contained"
              color="success"
              startIcon={<WhatsAppIcon />}
              disabled={!whatsappLink}
              {...anchorProps(whatsappLink)}
            >
              Falar com o responsável
            </Button>

            <Stack direction="row" spacing={1} sx={{ width: isXs ? "100%" : "auto" }}>
              <Button type="button" fullWidth={isXs} onClick={onEdit}>
                Editar
              </Button>
              <Button
                type="button"
                fullWidth={isXs}
                color={child.isActive ? "warning" : "success"}
                onClick={onToggleActive}
              >
                {child.isActive ? "Inativar" : "Reativar"}
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
