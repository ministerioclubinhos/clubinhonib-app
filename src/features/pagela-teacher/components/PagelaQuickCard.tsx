// src/features/pagela-teacher/components/PagelaQuickCard.tsx
import * as React from "react";
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
  Fab,
  useMediaQuery,
  useTheme,
  Chip,
  Tooltip,
} from "@mui/material";
import {
  Save,
  CheckCircle,
  RadioButtonUnchecked,
  AddCircleOutline,
  EditOutlined,
  EventAvailable,
} from "@mui/icons-material";
import { alpha } from "@mui/material/styles";
import type { CreatePagelaPayload, Pagela, UpdatePagelaPayload } from "../types";
import { todayISO, toLabelWeek } from "../utils";

type Props = {
  childName?: string;
  current?: Pagela | null;
  childId: string;
  year: number;
  week: number;
  teacherProfileId?: string | null;
  onCreate: (p: CreatePagelaPayload) => Promise<void>;
  onUpdate: (id: string, p: UpdatePagelaPayload) => Promise<void>;
};

// ...dentro de PagelaQuickCard, depois dos hooks/useEffect:
const titleSx = {
  fontWeight: 900,
  lineHeight: 1.2,
  fontSize: { xs: ".9rem", md: "1.15rem" }, // mobile 16px, desktop ~18.4px
} as const;

// 31 de Agosto 2025
function formatDateBRLong(date = new Date()) {
  const dd = String(date.getDate()).padStart(2, "0");
  const months = [
    "janeiro", "fevereiro", "março", "abril", "maio", "junho",
    "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
  ];
  const month = months[date.getMonth()];
  const monthCap = month.charAt(0).toUpperCase() + month.slice(1);
  const yyyy = date.getFullYear();
  return `${dd} de ${monthCap} ${yyyy}`;
}

export default function PagelaQuickCard({
  childName,
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
  const isNew = !current?.id;

  const [present, setPresent] = React.useState(current?.present ?? false);
  const [med, setMed] = React.useState(current?.didMeditation ?? false);
  const [verse, setVerse] = React.useState(current?.recitedVerse ?? false);
  const [notes, setNotes] = React.useState(current?.notes ?? "");

  React.useEffect(() => {
    setPresent(current?.present ?? false);
    setMed(current?.didMeditation ?? false);
    setVerse(current?.recitedVerse ?? false);
    setNotes(current?.notes ?? "");
  }, [current]);

  const handleSave = async () => {
    const referenceDate = todayISO(); // sempre “hoje”
    if (current?.id) {
      await onUpdate(current.id, {
        referenceDate,
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
        childId,
        teacherProfileId: teacherProfileId ?? null,
        referenceDate,
        year,
        week,
        present,
        didMeditation: med,
        recitedVerse: verse,
        notes,
      });
    }
  };

  const ChipYes = (props: any) => (
    <Chip size="small" color="success" icon={<CheckCircle sx={{ fontSize: 16 }} />} {...props} />
  );
  const ChipNo = (props: any) => (
    <Chip size="small" variant="outlined" icon={<RadioButtonUnchecked sx={{ fontSize: 16 }} />} {...props} />
  );

  // chips no mobile: 3 colunas (33% cada)
  const chipMobileSx = {
    width: "100%",
    px: 0.5,
    height: 28,
    borderRadius: 2,
    "& .MuiChip-label": {
      px: 0.75,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
      fontWeight: 700,
    },
    "& .MuiChip-icon": { mr: 0.5 },
  } as const;

  const Chips = () =>
    isXs ? (
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          columnGap: 0.5,
          rowGap: 0,
          width: "100%",
        }}
      >
        <Tooltip title={present ? "Presente" : "Presença"}>
          {present ? <ChipYes label="Pres" sx={chipMobileSx} /> : <ChipNo label="Pres" sx={chipMobileSx} />}
        </Tooltip>
        <Tooltip title="Meditação">
          {med ? <ChipYes label="Med" sx={chipMobileSx} /> : <ChipNo label="Med" sx={chipMobileSx} />}
        </Tooltip>
        <Tooltip title="Versículo">
          {verse ? <ChipYes label="Vers" sx={chipMobileSx} /> : <ChipNo label="Vers" sx={chipMobileSx} />}
        </Tooltip>
      </Box>
    ) : (
      <Stack direction="row" spacing={0.75} flexWrap="wrap" justifyContent="flex-end">
        {present ? <ChipYes label="Presente" /> : <ChipNo label="Presença" />}
        {med ? <ChipYes label="Meditação" /> : <ChipNo label="Meditação" />}
        {verse ? <ChipYes label="Versículo" /> : <ChipNo label="Versículo" />}
      </Stack>
    );

  const accent = isNew ? theme.palette.info.main : theme.palette.warning.main;
  const todayBr = formatDateBRLong(new Date());

  return (
    <>
      {/* CARD PAI DESTACADO */}
      <Card
        sx={{
          borderRadius: 4,
          overflow: "hidden",
          boxShadow: "0 10px 26px rgba(0,0,0,.08)",
          borderLeft: `8px solid ${accent}`,
          bgcolor: alpha(accent, theme.palette.mode === "light" ? 0.06 : 0.12),
        }}
      >
        {/* Cabeçalho do card pai */}
        <Box
          sx={{
            px: { xs: 1.5, md: 2.25 },
            py: 1,
            bgcolor: alpha(accent, 0.12),
            borderBottom: "1px solid",
            borderColor: alpha(accent, 0.28),
          }}
        >
          {isXs ? (
            // MOBILE: 3 LINHAS
            <Stack direction="row" spacing={1} alignItems="flex-start">
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  display: "grid",
                  placeItems: "center",
                  color: accent,
                  bgcolor: alpha(accent, 0.22),
                  flex: "0 0 auto",
                  mt: 0.25,
                }}
              >
                {isNew ? <AddCircleOutline fontSize="small" /> : <EditOutlined fontSize="small" />}
              </Box>

              <Stack spacing={0.3} sx={{ minWidth: 0, flex: 1 }}>
                <Typography noWrap title={childName} sx={titleSx}>
                  {isNew ? "Criando novo registro de pagela" : "Editando registro de pagela"}
                </Typography>


                <Typography variant="caption" color="text.secondary" noWrap>
                  {toLabelWeek(year, week)}
                </Typography>

                <Chip
                  size="small"
                  color={isNew ? "info" : "warning"}
                  icon={<EventAvailable sx={{ fontSize: 16 }} />}
                  label={`Hoje: ${todayBr}`}
                  sx={{
                    height: 22,
                    alignSelf: "flex-start",
                    "& .MuiChip-label": { px: 0.75, fontWeight: 700 },
                  }}
                />
              </Stack>
            </Stack>
          ) : (
            // DESKTOP: título centralizado e chip de data FIXO à direita
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "auto 1fr auto",
                alignItems: "center",
                columnGap: 1.25,
              }}
            >
              {/* Esquerda: ícone + ano/semana */}
              <Stack direction="row" spacing={1} alignItems="center">
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    display: "grid",
                    placeItems: "center",
                    color: accent,
                    bgcolor: alpha(accent, 0.22),
                    flex: "0 0 auto",
                  }}
                >
                  {isNew ? <AddCircleOutline fontSize="small" /> : <EditOutlined fontSize="small" />}
                </Box>
                <Typography variant="caption" color="text.secondary" noWrap>
                  {toLabelWeek(year, week)}
                </Typography>
              </Stack>

              {/* Centro: título */}
              <Typography noWrap title={childName} sx={titleSx}>
                {isNew ? "Criando novo registro de pagela" : "Editando registro de pagela"}
              </Typography>


              {/* Direita: data (no local indicado) */}
              <Chip
                size="small"
                color={isNew ? "info" : "warning"}
                icon={<EventAvailable sx={{ fontSize: 16 }} />}
                label={`Hoje: ${todayBr}`}
                sx={{
                  height: 24,
                  justifySelf: "end",
                  "& .MuiChip-label": { px: 0.75, fontWeight: 700 },
                }}
              />
            </Box>
          )}
        </Box>

        {/* CONTEÚDO */}
        <CardContent sx={{ p: { xs: 1.5, md: 2.25 } }}>
          <Card
            variant="outlined"
            sx={{
              borderRadius: 3,
              boxShadow: "0 1px 0 rgba(0,0,0,.04)",
              "&:hover": { boxShadow: "0 6px 16px rgba(0,0,0,.06)" },
            }}
          >
            <CardContent sx={{ p: { xs: 1.5, md: 2.25 } }}>
              <Stack spacing={1.25}>
                {isXs ? (
                  <Stack spacing={0.5} sx={{ minWidth: 0 }}>
                    {/* 1) Nome */}
                    <Typography variant="subtitle1" noWrap title={childName} sx={titleSx}>
                      {childName || "—"}
                    </Typography>
                    {/* 2) Ano e semana */}
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {toLabelWeek(year, week)}
                    </Typography>
                    {/* 3) Estados */}
                    <Chips />
                  </Stack>
                ) : (
                  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ gap: 1, minWidth: 0 }}>
                    <Typography variant="subtitle1" fontWeight={900} noWrap>
                      {childName || "—"} • {toLabelWeek(year, week)}
                    </Typography>
                    <Chips />
                  </Stack>
                )}

                <Divider />

                <FormControlLabel
                  control={<Switch checked={present} onChange={(_, v) => setPresent(v)} />}
                  label={<Typography fontWeight={700}>Presença</Typography>}
                  labelPlacement="start"
                  sx={{ m: 0, justifyContent: "space-between" }}
                />
                <FormControlLabel
                  control={<Switch checked={med} onChange={(_, v) => setMed(v)} />}
                  label={<Typography fontWeight={700}>Fez meditação</Typography>}
                  labelPlacement="start"
                  sx={{ m: 0, justifyContent: "space-between" }}
                />
                <FormControlLabel
                  control={<Switch checked={verse} onChange={(_, v) => setVerse(v)} />}
                  label={<Typography fontWeight={700}>Recitou o versículo</Typography>}
                  labelPlacement="start"
                  sx={{ m: 0, justifyContent: "space-between" }}
                />

                <TextField
                  size="small"
                  label="Observações"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  multiline
                  minRows={2}
                  fullWidth
                />

                {!isXs && (
                  <Box textAlign="right" mt={0.5}>
                    <Button variant="contained" startIcon={<Save />} onClick={handleSave} sx={{ borderRadius: 2 }}>
                      Salvar
                    </Button>
                  </Box>
                )}
              </Stack>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {/* FAB só no mobile */}
      {isXs && (
        <Fab
          color="primary"
          variant="extended"
          onClick={handleSave}
          sx={{ position: "fixed", bottom: 88, right: 16, zIndex: 1200 }}
        >
          <Save sx={{ mr: 1 }} /> Salvar
        </Fab>
      )}
    </>
  );
}
