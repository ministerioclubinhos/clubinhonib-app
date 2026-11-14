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
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";

import { EMPTY_VALUE } from "../constants";
import {
  clubLabel,
  formatDate,
  formatPhone,
  teacherCoordinatorName,
  teacherInitials,
  teacherName,
} from "../utils";
import type { TeacherResponse } from "../types";

type Props = {
  teacher: TeacherResponse | null;
  onClose: () => void;
  onEditClub: () => void;
};

/** Um dado do professor, rotulado. */
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
    <Paper data-testid="teachers-teacher-view-dialog-detail-card" variant="outlined" sx={{ p: 1.25, borderRadius: 2, height: "100%" }}>
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

/** Detalhes de um professor. */
export default function TeacherViewDialog({
  teacher,
  onClose,
  onEditClub,
}: Props) {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Dialog data-testid="teachers-teacher-view-dialog"
      open={!!teacher}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      aria-labelledby="teacher-view-title"
    >
      {teacher ? (
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
                {teacherInitials(teacherName(teacher))}
              </Avatar>

              <Box sx={{ minWidth: 0 }}>
                <Typography
                  id="teacher-view-title"
                  variant="h6"
                  fontWeight={800}
                  noWrap={!isXs}
                >
                  {teacherName(teacher)}
                </Typography>
                <Stack direction="row" spacing={0.75} sx={{ mt: 0.5 }} flexWrap="wrap" useFlexGap>
                  <Chip
                    size="small"
                    label={teacher.active ? "Ativo" : "Inativo"}
                    color={teacher.active ? "success" : "default"}
                    variant={teacher.active ? "filled" : "outlined"}
                  />
                  <Chip
                    size="small"
                    label={clubLabel(teacher.club)}
                    color={teacher.club ? "primary" : "default"}
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
                  {teacher.user?.email ? (
                    <Link href={`mailto:${teacher.user.email}`} underline="hover">
                      {teacher.user.email}
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
                  <Typography>{formatPhone(teacher.user?.phone)}</Typography>
                </DetailCard>
              </Grid2>

              <Grid2 size={{ xs: 12, sm: 6 }}>
                <DetailCard icon={<GroupsIcon fontSize="small" />} title="Clubinho">
                  <Typography>{clubLabel(teacher.club)}</Typography>
                </DetailCard>
              </Grid2>

              <Grid2 size={{ xs: 12, sm: 6 }}>
                <DetailCard
                  icon={<SupervisorAccountIcon fontSize="small" />}
                  title="Coordenador"
                >
                  <Typography>{teacherCoordinatorName(teacher.club)}</Typography>
                </DetailCard>
              </Grid2>

              <Grid2 size={{ xs: 12, sm: 6 }}>
                <DetailCard
                  icon={<AccessTimeIcon fontSize="small" />}
                  title="Criado em"
                >
                  <Typography>{formatDate(teacher.createdAt)}</Typography>
                </DetailCard>
              </Grid2>

              <Grid2 size={{ xs: 12, sm: 6 }}>
                <DetailCard
                  icon={<AccessTimeIcon fontSize="small" />}
                  title="Atualizado em"
                >
                  <Typography>{formatDate(teacher.updatedAt)}</Typography>
                </DetailCard>
              </Grid2>
            </Grid2>
          </DialogContent>

          <DialogActions sx={{ p: { xs: 1.5, sm: 2 }, gap: 1 }}>
            <Button type="button" fullWidth={isXs} onClick={onEditClub}>
              {teacher.club ? "Trocar clubinho" : "Vincular clubinho"}
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
