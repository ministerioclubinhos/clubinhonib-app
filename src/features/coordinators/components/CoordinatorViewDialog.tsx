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
import AlternateEmailIcon from "@mui/icons-material/AlternateEmail";
import GroupsIcon from "@mui/icons-material/Groups";
import PhoneIphoneIcon from "@mui/icons-material/PhoneIphone";
import SchoolIcon from "@mui/icons-material/School";

import { EMPTY_VALUE } from "../constants";
import {
  clubLabel,
  coordinatorInitials,
  coordinatorName,
  coordinatorTeachers,
  formatDate,
  formatPhone,
} from "../utils";
import type { CoordinatorResponse } from "../types";

type Props = {
  coordinator: CoordinatorResponse | null;
  onClose: () => void;
  onManageClubs: () => void;
};

/** Um dado do coordenador, rotulado. */
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
    <Paper data-testid="coordinators-coordinator-view-dialog-detail-card" variant="outlined" sx={{ p: 1.25, borderRadius: 2, height: "100%" }}>
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

/** Detalhes de um coordenador. */
export default function CoordinatorViewDialog({
  coordinator,
  onClose,
  onManageClubs,
}: Props) {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));

  const teachers = React.useMemo(
    () => (coordinator ? coordinatorTeachers(coordinator) : []),
    [coordinator],
  );

  return (
    <Dialog data-testid="coordinators-coordinator-view-dialog"
      open={!!coordinator}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      aria-labelledby="coordinator-view-title"
    >
      {coordinator ? (
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
                  bgcolor: "secondary.main",
                  color: "secondary.contrastText",
                  fontWeight: 700,
                }}
              >
                {coordinatorInitials(coordinatorName(coordinator))}
              </Avatar>

              <Box sx={{ minWidth: 0 }}>
                <Typography
                  id="coordinator-view-title"
                  variant="h6"
                  fontWeight={800}
                  noWrap={!isXs}
                >
                  {coordinatorName(coordinator)}
                </Typography>
                <Chip
                  size="small"
                  sx={{ mt: 0.5 }}
                  label={coordinator.active ? "Ativo" : "Inativo"}
                  color={coordinator.active ? "success" : "default"}
                  variant={coordinator.active ? "filled" : "outlined"}
                />
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
                  {coordinator.user?.email ? (
                    <Link
                      href={`mailto:${coordinator.user.email}`}
                      underline="hover"
                    >
                      {coordinator.user.email}
                    </Link>
                  ) : (
                    <Typography variant="body2">{EMPTY_VALUE}</Typography>
                  )}
                </DetailCard>
              </Grid2>

              <Grid2 size={{ xs: 12, sm: 6 }}>
                <DetailCard
                  icon={<PhoneIphoneIcon fontSize="small" />}
                  title="Telefone"
                >
                  <Typography>{formatPhone(coordinator.user?.phone)}</Typography>
                </DetailCard>
              </Grid2>

              <Grid2 size={{ xs: 12 }}>
                <DetailCard
                  icon={<GroupsIcon fontSize="small" />}
                  title={`Clubinhos (${coordinator.clubs?.length ?? 0})`}
                >
                  <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                    {(coordinator.clubs ?? []).length === 0 ? (
                      <Typography variant="body2">{EMPTY_VALUE}</Typography>
                    ) : (
                      coordinator.clubs.map((club) => (
                        <Chip key={club.id} size="small" label={clubLabel(club)} />
                      ))
                    )}
                  </Stack>
                </DetailCard>
              </Grid2>

              <Grid2 size={{ xs: 12 }}>
                <DetailCard
                  icon={<SchoolIcon fontSize="small" />}
                  title={`Professores (${teachers.length})`}
                >
                  <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                    {teachers.length === 0 ? (
                      <Typography variant="body2">{EMPTY_VALUE}</Typography>
                    ) : (
                      teachers.map((teacher) => (
                        <Chip
                          key={teacher.id}
                          size="small"
                          variant="outlined"
                          label={teacher.user?.name || teacher.user?.email}
                        />
                      ))
                    )}
                  </Stack>
                </DetailCard>
              </Grid2>

              <Grid2 size={{ xs: 12, sm: 6 }}>
                <DetailCard
                  icon={<AccessTimeIcon fontSize="small" />}
                  title="Criado em"
                >
                  <Typography>{formatDate(coordinator.createdAt)}</Typography>
                </DetailCard>
              </Grid2>

              <Grid2 size={{ xs: 12, sm: 6 }}>
                <DetailCard
                  icon={<AccessTimeIcon fontSize="small" />}
                  title="Atualizado em"
                >
                  <Typography>{formatDate(coordinator.updatedAt)}</Typography>
                </DetailCard>
              </Grid2>
            </Grid2>
          </DialogContent>

          <DialogActions sx={{ p: { xs: 1.5, sm: 2 }, gap: 1 }}>
            <Button type="button" fullWidth={isXs} onClick={onManageClubs}>
              Gerenciar clubinhos
            </Button>
            <Button type="button" fullWidth={isXs} onClick={onClose}>
              Fechar
            </Button>
          </DialogActions>
        </>
      ) : null}
    </Dialog>
  );
}
