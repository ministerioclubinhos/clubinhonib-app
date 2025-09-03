// src/features/pagela-teacher/components/PagelaQuickForm.tsx
import React from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  FormControlLabel,
  Stack,
  Switch,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Save } from "@mui/icons-material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SpaIcon from "@mui/icons-material/Spa";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import FavoriteIcon from "@mui/icons-material/Favorite";
import type { CreatePagelaPayload, Pagela, UpdatePagelaPayload } from "../types";
import { todayISO } from "../utils";

type Props = {
  current?: Pagela | null;
  childId?: string;
  year: number;
  week: number;
  teacherProfileId?: string | null;
  onCreate: (payload: CreatePagelaPayload) => Promise<void>;
  onUpdate: (id: string, payload: UpdatePagelaPayload) => Promise<void>;
};

export default function PagelaQuickForm({
  current,
  childId,
  year,
  week,
  teacherProfileId,
  onCreate,
  onUpdate,
}: Props) {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));

  const [present, setPresent] = React.useState(current?.present ?? false);
  const [med, setMed] = React.useState(current?.didMeditation ?? false);
  const [verse, setVerse] = React.useState(current?.recitedVerse ?? false);
  const [notes, setNotes] = React.useState(current?.notes ?? "");
  const [refDate, setRefDate] = React.useState(current?.referenceDate ?? todayISO());

  React.useEffect(() => {
    setPresent(current?.present ?? false);
    setMed(current?.didMeditation ?? false);
    setVerse(current?.recitedVerse ?? false);
    setNotes(current?.notes ?? "");
    setRefDate(current?.referenceDate ?? todayISO());
  }, [current]);

  const canSave = !!childId && !!week;

  const handleSave = async () => {
    if (!canSave) return;
    if (current?.id) {
      await onUpdate(current.id, {
        referenceDate: refDate,
        year,
        week,
        present,
        didMeditation: med,
        recitedVerse: verse,
        notes,
        teacherProfileId: teacherProfileId ?? null,
      });
    } else {
      await onCreate({
        childId: childId!,
        teacherProfileId: teacherProfileId ?? null,
        referenceDate: refDate,
        year,
        week,
        present,
        didMeditation: med,
        recitedVerse: verse,
        notes,
      });
    }
  };

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 4,
        overflow: "hidden",
        borderColor: "divider",
        transition: "box-shadow .12s ease, transform .12s ease",
        "&:hover": { boxShadow: 4, transform: "translateY(-1px)" },
      }}
    >
      {/* cabeçalho pastel fofinho */}
      <Box
        sx={{
          position: "relative",
          height: { xs: 72, sm: 84 },
          background:
            "linear-gradient(135deg, #b8f1d7 0%, #b8d6ff 50%, #ffc7ec 100%)",
        }}
      >
        {/* bolhinhas decorativas */}
        <Box
          sx={{
            position: "absolute",
            top: -10,
            left: -18,
            width: 90,
            height: 90,
            borderRadius: "50%",
            opacity: 0.15,
            bgcolor: "#69d1b6",
            filter: "blur(2px)",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: -16,
            right: -12,
            width: 80,
            height: 80,
            borderRadius: "50%",
            opacity: 0.15,
            bgcolor: "#ffbde6",
            filter: "blur(1px)",
          }}
        />
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ height: "100%", px: { xs: 1.25, sm: 2 } }}
        >
          <Stack spacing={0}>
            <Typography
              variant="subtitle2"
              sx={{ color: "text.primary", opacity: 0.8, fontWeight: 700 }}
            >
              {current ? "Editar Pagela" : "Nova Pagela"}
            </Typography>
            <Stack direction="row" spacing={0.75} alignItems="center">
              <CalendarMonthIcon fontSize="small" sx={{ opacity: 0.8 }} />
              <Typography variant="caption" sx={{ fontWeight: 700 }}>
                Ano: {year} • Semana: {week}
              </Typography>
            </Stack>
          </Stack>

          <Stack direction="row" spacing={0.75} alignItems="center">
            <MiniChip
              active={present}
              icon={<CheckCircleIcon sx={{ fontSize: 14 }} />}
              label={present ? "Presente" : "Ausente"}
            />
            <MiniChip
              active={med}
              icon={<SpaIcon sx={{ fontSize: 14 }} />}
              label="Meditação"
            />
            <MiniChip
              active={verse}
              icon={<MenuBookIcon sx={{ fontSize: 14 }} />}
              label="Versículo"
            />
          </Stack>
        </Stack>
      </Box>

      <CardContent sx={{ p: { xs: 1.5, md: 2.25 } }}>
        <Stack spacing={1.25}>
          {/* linhas com ícone + switch (label à esquerda) */}
          <RowSwitch
            icon={<CheckCircleIcon />}
            label="Presença"
            checked={present}
            onChange={setPresent}
          />
          <RowSwitch
            icon={<SpaIcon />}
            label="Fez meditação"
            checked={med}
            onChange={setMed}
          />
          <RowSwitch
            icon={<MenuBookIcon />}
            label="Recitou o versículo"
            checked={verse}
            onChange={setVerse}
          />

          <Divider sx={{ my: 0.5 }} />

          <TextField
            label="Data do registro (YYYY-MM-DD)"
            size="small"
            fullWidth
            value={refDate}
            onChange={(e) => setRefDate(e.target.value)}
            helperText="Pode ser diferente da semana alvo."
          />

          <TextField
            label="Observações"
            size="small"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            multiline
            minRows={2}
            fullWidth
          />

          <Box
            sx={{
              display: "flex",
              justifyContent: { xs: "stretch", sm: "flex-end" },
              mt: 0.5,
            }}
          >
            <Button
              onClick={handleSave}
              disabled={!canSave}
              variant="contained"
              startIcon={<Save />}
              sx={{
                borderRadius: 999,
                px: 2.25,
                py: 0.75,
                fontWeight: 800,
                width: { xs: "100%", sm: "auto" },
              }}
            >
              Salvar
            </Button>
          </Box>

          {/* rodapé fofo */}
          <Stack
            direction="row"
            spacing={0.5}
            alignItems="center"
            justifyContent="center"
            sx={{ color: "text.secondary", mt: 0.25 }}
          >
            <Typography variant="caption" sx={{ fontWeight: 600 }}>
              toque em salvar para guardar seu registro
            </Typography>
            <FavoriteIcon fontSize="inherit" sx={{ opacity: 0.6 }} />
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

/* ----------------------- helpers visuais ----------------------- */

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
          <Box sx={{ "& svg": { fontSize: 18, opacity: 0.75 } }}>{icon}</Box>
          <Typography fontWeight={800}>{label}</Typography>
        </Stack>
      }
      labelPlacement="start"
      sx={{
        m: 0,
        px: 1,
        py: 0.5,
        borderRadius: 2,
        justifyContent: "space-between",
        bgcolor: "action.hover",
      }}
    />
  );
}

function MiniChip({
  active,
  icon,
  label,
}: {
  active: boolean;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Box
      sx={{
        px: 1,
        py: 0.25,
        borderRadius: 2,
        display: "inline-flex",
        alignItems: "center",
        gap: 0.5,
        fontSize: 11,
        fontWeight: 800,
        bgcolor: active ? "success.light" : "rgba(255,255,255,.6)",
        color: active ? "success.contrastText" : "text.secondary",
        border: active ? "1px solid rgba(0,0,0,0.06)" : "1px solid rgba(0,0,0,0.04)",
        backdropFilter: "blur(2px)",
      }}
    >
      <Box sx={{ "& svg": { fontSize: 14 } }}>{icon}</Box>
      {label}
    </Box>
  );
}
