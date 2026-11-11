import * as React from "react";
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  CircularProgress,
  MenuItem,
  Card,
  CardContent,
  Divider,
  FormControlLabel,
  IconButton,
  Stack,
  Switch,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Close, Save } from "@mui/icons-material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SpaIcon from "@mui/icons-material/Spa";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { useSelector } from "react-redux";
import type {
  CreatePagelaPayload,
  Pagela,
  PagelaLaunchWindow,
  UpdatePagelaPayload,
} from "../types";
import { launchableWeeks } from "../utils";
import { PAGELA_NOTES_MAX_LENGTH, PAGELA_PERIOD_TEXTS } from "../constants";
import {
  buildCreatePagelaRequest,
  buildUpdatePagelaRequest,
} from "@/features/pagelas/utils";
import { extractErrorMessage } from "@/utils/apiError";
import type { RootState } from '@/store/slices';

type Props = {
  initial?: Pagela | null;
  childId: string;
  childName: string;
  childGender: string;
  teacherProfileId?: string | null;

  /** Janela de lançamento de hoje; `null` enquanto carrega ou se falhou. */
  launchWindow: PagelaLaunchWindow | null;
  launchLoading: boolean;
  launchError: string;

  /** Pagela já lançada para a criança na semana, se houver. */
  findPagela: (year: number, week: number) => Promise<Pagela | null>;

  onCreate: (payload: CreatePagelaPayload) => Promise<void>;
  onUpdate: (id: string, payload: UpdatePagelaPayload) => Promise<void>;
  onClose?: () => void;
};

type Target = { year: number; week: number };

export default function PagelaQuickForm({
  initial,
  childId,
  childName,
  childGender,
  teacherProfileId,
  launchWindow,
  launchLoading,
  launchError,
  findPagela,
  onCreate,
  onUpdate,
  onClose,
}: Props) {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));

  const teacherProfileIdFromRedux = useSelector(
    (s: RootState) => s.auth.user?.teacherProfile?.id ?? null
  ) as string | null;

  const effectiveTeacherProfileId = teacherProfileIdFromRedux ?? teacherProfileId ?? null;

  const isOpen = !!launchWindow?.open;
  const weeks = React.useMemo(() => launchableWeeks(launchWindow), [launchWindow]);

  // A semana é a letiva, contada do início do período — nunca a do
  // calendário. A semana padrão é a que está em andamento.
  const [target, setTarget] = React.useState<Target | null>(null);
  const [current, setCurrent] = React.useState<Pagela | null>(null);
  const [present, setPresent] = React.useState(false);
  const [med, setMed] = React.useState(false);
  const [verse, setVerse] = React.useState(false);
  const [notes, setNotes] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [saveError, setSaveError] = React.useState("");

  const fill = React.useCallback((pagela: Pagela | null) => {
    setCurrent(pagela);
    setPresent(!!pagela?.present);
    setMed(!!pagela?.didMeditation);
    setVerse(!!pagela?.recitedVerse);
    setNotes(pagela?.notes ?? "");
    setSaveError("");
  }, []);

  // A pagela escolhida na lista, ou a semana em andamento para uma nova.
  const windowYear = launchWindow?.open ? launchWindow.year : null;
  const windowWeek = launchWindow?.open ? launchWindow.currentWeek : null;
  React.useEffect(() => {
    if (initial?.id) {
      setTarget({ year: initial.year, week: initial.week });
      fill(initial);
    } else if (windowYear && windowWeek) {
      setTarget({ year: windowYear, week: windowWeek });
      fill(null);
    } else {
      setTarget(null);
      fill(null);
    }
  }, [initial, windowYear, windowWeek, fill]);

  // Ao trocar de semana, o formulário passa a editar a pagela daquela semana
  // ou fica em branco para criar uma. A busca vai à API porque a lista da tela
  // é paginada e filtrada.
  const findPagelaRef = React.useRef(findPagela);
  findPagelaRef.current = findPagela;
  const targetYear = target?.year;
  const targetWeek = target?.week;
  const initialId = initial?.id;
  React.useEffect(() => {
    if (!targetYear || !targetWeek) return;
    if (initialId && initial?.year === targetYear && initial?.week === targetWeek) return;

    let cancelled = false;
    findPagelaRef.current(targetYear, targetWeek)
      .then((found) => {
        if (!cancelled) fill(found);
      })
      .catch(() => {
        if (!cancelled) fill(null);
      });
    return () => {
      cancelled = true;
    };
    // `initial` entra só pelos campos que identificam a pagela.
  }, [targetYear, targetWeek, initialId, fill]);

  const editing = !!current?.id;
  // Pagela de outro período (ou de semana que o período atual não tem) pode
  // ser corrigida, mas não muda de semana.
  const weekLocked =
    !!target && (target.year !== windowYear || !weeks.includes(target.week));

  const canSave = isOpen && !!childId && !!target && !saving;

  const handleSave = async () => {
    if (!canSave || !target || !launchWindow) return;

    setSaving(true);
    setSaveError("");
    try {
      if (current?.id) {
        // Só o que o formulário edita: mandar a data ou o professor de novo
        // trocava a data do registro por hoje e apagava quem lançou.
        await onUpdate(
          current.id,
          buildUpdatePagelaRequest({
            present,
            didMeditation: med,
            recitedVerse: verse,
            notes,
          }),
        );
      } else {
        await onCreate(
          buildCreatePagelaRequest({
            childId,
            referenceDate: launchWindow.today,
            year: target.year,
            week: target.week,
            present,
            didMeditation: med,
            recitedVerse: verse,
            notes,
            teacherProfileId: effectiveTeacherProfileId,
          }),
        );
        // A semana agora tem pagela: o formulário passa a editá-la, em vez de
        // tentar criar outra na mesma semana.
        fill(await findPagelaRef.current(target.year, target.week).catch(() => null));
      }
      if (isXs && onClose) onClose();
    } catch (err: unknown) {
      setSaveError(extractErrorMessage(err, PAGELA_PERIOD_TEXTS.saveError));
    } finally {
      setSaving(false);
    }
  };

  const parsedYear = target?.year;
  const parsedWeek = target?.week;

  const headerBg = editing
    ? "linear-gradient(135deg, #FFE8B3 0%, #FFD480 50%, #FFC266 100%)"
    : "linear-gradient(135deg, #b8f1d7 0%, #b8d6ff 50%, #ffc7ec 100%)";

  const headerTitle = editing ? "Editando" : "Criando";
  const footerMsg = editing
    ? "ao salvar, você ATUALIZA o registro existente"
    : "ao salvar, você CRIA um novo registro";

  const yearWeekLabel = `Ano: ${parsedYear ?? "--"} • Semana: ${parsedWeek ?? "--"}`;

  const article = childGender === "F" ? "a" : "o";

  return (
    <Card data-testid="pagela-teacher-pagela-quick-form"
      variant="outlined"
      sx={{
        borderRadius: { xs: "24px 24px 0 0", sm: 4 },
        overflow: "hidden",
        borderColor: "divider",
        transition: "box-shadow .12s ease, transform .12s ease",
        "&:hover": { boxShadow: 4, transform: { sm: "translateY(-1px)" } },
      }}
    >
      <Box
        sx={{
          position: "relative",
          height: { xs: 64, sm: 84 },
          background: headerBg,
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: -10,
            left: -18,
            width: 90,
            height: 90,
            borderRadius: "50%",
            opacity: 0.15,
            bgcolor: "#000",
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
            opacity: 0.12,
            bgcolor: "#000",
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
            <Typography variant="subtitle2" sx={{ color: "text.primary", opacity: 0.9, fontWeight: 800 }}>
              {headerTitle} para {article} <strong>{childName || "—"}</strong>
            </Typography>

            <Stack direction="row" spacing={0.75} alignItems="center">
              <CalendarMonthIcon fontSize="small" sx={{ opacity: 0.9 }} />
              <Typography variant="caption" sx={{ fontWeight: 700 }}>
                {yearWeekLabel}
              </Typography>
            </Stack>
          </Stack>

          {isXs && (
            <IconButton
              size="small"
              onClick={onClose}
              aria-label="Fechar"
              sx={{ bgcolor: "rgba(255,255,255,.85)", "&:hover": { bgcolor: "rgba(255,255,255,.95)" } }}
            >
              <Close fontSize="small" />
            </IconButton>
          )}
        </Stack>
      </Box>

      <CardContent sx={{ p: { xs: 1.5, md: 2.25 } }}>
        <Stack spacing={1.25}>
          {launchLoading && (
            <Alert severity="info" icon={<CircularProgress size={18} />}>
              {PAGELA_PERIOD_TEXTS.loading}
            </Alert>
          )}

          {!launchLoading && !launchWindow && (
            <Alert severity="error" data-testid="pagela-launch-unavailable">
              {launchError || PAGELA_PERIOD_TEXTS.unavailable}
            </Alert>
          )}

          {launchWindow && !isOpen && (
            <Alert severity="warning" data-testid="pagela-launch-closed">
              <AlertTitle>{PAGELA_PERIOD_TEXTS.closedTitle}</AlertTitle>
              {launchWindow.message || PAGELA_PERIOD_TEXTS.closedFallback}
            </Alert>
          )}

          {isOpen && target && (
            <Stack direction="row" spacing={1}>
              <TextField
                label="Ano letivo"
                size="small"
                value={target.year}
                sx={{ width: 120 }}
                slotProps={{ input: { readOnly: true } }}
              />
              {weekLocked ? (
                <TextField
                  label="Semana"
                  size="small"
                  value={target.week}
                  helperText={PAGELA_PERIOD_TEXTS.lockedWeek}
                  sx={{ flex: 1 }}
                  slotProps={{ input: { readOnly: true } }}
                />
              ) : (
                <TextField
                  select
                  label="Semana"
                  size="small"
                  value={target.week}
                  onChange={(e) =>
                    setTarget({ year: target.year, week: Number(e.target.value) })
                  }
                  helperText={PAGELA_PERIOD_TEXTS.weekHelper}
                  sx={{ flex: 1 }}
                  slotProps={{ htmlInput: { "data-testid": "pagela-week-select" } }}
                >
                  {weeks.map((week) => (
                    <MenuItem key={week} value={week}>
                      Semana {week}
                      {week === launchWindow?.currentWeek ? " (atual)" : ""}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            </Stack>
          )}

          {isOpen && target && (
            <>
          <RowSwitch icon={<CheckCircleIcon />} label="Presença" checked={present} onChange={setPresent} />
          <RowSwitch icon={<SpaIcon />} label="Fez meditação" checked={med} onChange={setMed} />
          <RowSwitch icon={<MenuBookIcon />} label="Recitou o versículo" checked={verse} onChange={setVerse} />

          <Divider sx={{ my: 0.5 }} />

          <TextField
            label="Observações"
            size="small"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            multiline
            minRows={2}
            fullWidth
            slotProps={{ htmlInput: { maxLength: PAGELA_NOTES_MAX_LENGTH } }}
          />

          {saveError && (
            <Alert severity="error" data-testid="pagela-save-error" onClose={() => setSaveError("")}>
              {saveError}
            </Alert>
          )}

          <Box sx={{ display: "flex", justifyContent: { xs: "stretch", sm: "flex-end" }, mt: 0.5 }}>
            <Button
              onClick={handleSave}
              disabled={!canSave}
              variant="contained"
              startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <Save />}
              sx={{ borderRadius: 999, px: 2.25, py: 0.75, fontWeight: 800, width: { xs: "100%", sm: "auto" } }}
            >
              {saving ? "Salvando..." : "Salvar"}
            </Button>
          </Box>
            </>
          )}

          <Stack
            direction="row"
            spacing={0.5}
            alignItems="center"
            justifyContent="center"
            sx={{ color: "text.secondary", mt: 0.25 }}
          >
            <Typography variant="caption" sx={{ fontWeight: 700 }}>
              {footerMsg}
            </Typography>
            <FavoriteIcon fontSize="inherit" sx={{ opacity: 0.6 }} />
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

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
    <FormControlLabel data-testid="pagela-teacher-pagela-quick-form-row-switch"
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
