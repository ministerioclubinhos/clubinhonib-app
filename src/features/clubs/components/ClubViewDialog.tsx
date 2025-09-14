import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Divider,
  Chip,
  Box,
  Typography,
  Paper,
  Skeleton,
  Stack,
} from "@mui/material";
import {
  CalendarToday,
  NumbersOutlined,
  PersonOutline,
  SchoolOutlined,
  PlaceOutlined,
  Update as UpdateIcon,
  LocationCityOutlined,
  MapOutlined,
  LocalPostOfficeOutlined,
  AccessTime as AccessTimeIcon,
} from "@mui/icons-material";
import { ClubResponseDto, WEEKDAYS } from "../types";
import { fmtDate } from "../utils";

type Props = {
  open: boolean;
  loading: boolean;
  club: ClubResponseDto | null;
  onClose: () => void;
};

const Info: React.FC<{
  icon?: React.ReactNode;
  label: string;
  value?: React.ReactNode;
  minHeight?: number;
}> = ({ icon, label, value, minHeight = 64 }) => (
  <Box
    sx={{
      display: "grid",
      gridTemplateRows: "auto 1fr",
      rowGap: 0.5,
      minHeight,
    }}
  >
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
      {icon}
      <Typography variant="caption" sx={{ color: "text.secondary" }}>
        {label}
      </Typography>
    </Box>
    <Typography
      variant="body1"
      sx={{
        lineHeight: 1.35,
        wordBreak: "break-word",
      }}
    >
      {value ?? "—"}
    </Typography>
  </Box>
);

export default function ClubViewDialog({ open, loading, club, onClose }: Props) {
  const weekdayLabel =
    club && WEEKDAYS.find((w) => w.value === club.weekday)?.label;

  const address = club?.address;
  const teachers = club?.teachers ?? [];

  const Title = (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <Typography component="span" variant="h6" fontWeight={700}>
        {club ? `Clubinho #${club.number}` : "Detalhes do Clubinho"}
      </Typography>
      {weekdayLabel && (
        <Chip
          size="small"
          variant="outlined"
          icon={<CalendarToday sx={{ fontSize: 16 }} />}
          label={weekdayLabel}
        />
      )}
      {club?.time ? (
        <Chip
          size="small"
          variant="outlined"
          icon={<AccessTimeIcon sx={{ fontSize: 16 }} />}
          label={club.time}
        />
      ) : null}
    </Box>
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{Title}</DialogTitle>

      <DialogContent dividers sx={{ p: { xs: 2, md: 3 } }}>
        {loading && !club && (
          <Box textAlign="center" my={2}>
            <Skeleton height={28} width="60%" sx={{ mx: "auto", mb: 2 }} />
            <Skeleton height={20} />
            <Skeleton height={20} />
            <Skeleton height={120} sx={{ mt: 2 }} />
          </Box>
        )}

        {club && (
          <Stack spacing={2.5}>
            <Grid container spacing={2} alignItems="stretch">
              <Grid item xs={12} md={3} sx={{ display: "flex" }}>
                <Box sx={{ flex: 1, textAlign: "left" }}>
                  <Info
                    icon={<NumbersOutlined fontSize="small" />}
                    label="Número"
                    value={club.number}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={3} sx={{ display: "flex" }}>
                <Box sx={{ flex: 1, textAlign: "left" }}>
                  <Info
                    icon={<CalendarToday fontSize="small" />}
                    label="Dia da semana"
                    value={weekdayLabel}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={3} sx={{ display: "flex" }}>
                <Box sx={{ flex: 1, textAlign: "left" }}>
                  <Info
                    icon={<AccessTimeIcon fontSize="small" />}
                    label="Horário"
                    value={club.time || "—"}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={3} sx={{ display: "flex" }}>
                <Box sx={{ flex: 1, textAlign: "left" }}>
                  <Info
                    icon={<UpdateIcon fontSize="small" />}
                    label="Atualizado"
                    value={fmtDate(club.updatedAt)}
                  />
                </Box>
              </Grid>
            </Grid>

            <Divider />

            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography
                variant="subtitle2"
                sx={{ mb: 1.5, display: "flex", alignItems: "center", gap: 1 }}
              >
                <PlaceOutlined fontSize="small" />
                Endereço
              </Typography>

              <Grid container spacing={2} alignItems="stretch">
                <Grid item xs={12} md={6} sx={{ display: "flex" }}>
                  <Box sx={{ flex: 1, textAlign: "left" }}>
                    <Info
                      icon={<PlaceOutlined fontSize="small" />}
                      label="Rua / Nº"
                      value={
                        address?.street
                          ? `${address.street}${address?.number ? `, ${address.number}` : ""
                          }`
                          : "—"
                      }
                    />
                  </Box>
                </Grid>

                <Grid item xs={12} md={6} sx={{ display: "flex" }}>
                  <Box sx={{ flex: 1, textAlign: "left" }}>
                    <Info label="Bairro" value={address?.district || "—"} />
                  </Box>
                </Grid>

                <Grid item xs={12} md={4} sx={{ display: "flex" }}>
                  <Box sx={{ flex: 1, textAlign: "left" }}>
                    <Info
                      icon={<LocationCityOutlined fontSize="small" />}
                      label="Cidade"
                      value={address?.city || "—"}
                    />
                  </Box>
                </Grid>

                <Grid item xs={12} md={4} sx={{ display: "flex" }}>
                  <Box sx={{ flex: 1, textAlign: "left" }}>
                    <Info
                      icon={<MapOutlined fontSize="small" />}
                      label="Estado"
                      value={address?.state || "—"}
                    />
                  </Box>
                </Grid>

                <Grid item xs={12} md={4} sx={{ display: "flex" }}>
                  <Box sx={{ flex: 1, textAlign: "left" }}>
                    <Info
                      icon={<LocalPostOfficeOutlined fontSize="small" />}
                      label="CEP"
                      value={address?.postalCode || "—"}
                    />
                  </Box>
                </Grid>
              </Grid>
            </Paper>

            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography
                variant="subtitle2"
                sx={{ mb: 1.5, display: "flex", alignItems: "center", gap: 1 }}
              >
                <PersonOutline fontSize="small" />
                Coordenador
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", minHeight: 36 }}>
                {club.coordinator ? (
                  <Chip
                    icon={<PersonOutline />}
                    label={
                      club.coordinator.user?.name ||
                      club.coordinator.user?.email ||
                      club.coordinator.id
                    }
                  />
                ) : (
                  <Chip variant="outlined" color="default" label="Não vinculado" />
                )}
              </Box>
            </Paper>

            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography
                variant="subtitle2"
                sx={{ mb: 1.5, display: "flex", alignItems: "center", gap: 1 }}
              >
                <SchoolOutlined fontSize="small" />
                Professores
              </Typography>
              {teachers.length ? (
                <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap" }}>
                  {teachers.map((t) => (
                    <Chip
                      key={t.id}
                      icon={<SchoolOutlined />}
                      label={t.user?.name || t.user?.email || t.id}
                      variant="outlined"
                    />
                  ))}
                </Box>
              ) : (
                <Chip
                  variant="outlined"
                  color="default"
                  label="Nenhum professor vinculado"
                />
              )}
            </Paper>
          </Stack>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="contained">
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
