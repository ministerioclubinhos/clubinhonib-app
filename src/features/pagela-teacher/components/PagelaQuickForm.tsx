import * as React from "react";
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  CircularProgress,
  FormControlLabel,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { Save } from "@mui/icons-material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SpaIcon from "@mui/icons-material/Spa";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import { useSelector } from "react-redux";
import {
  PagelaEditorMode,
  type CreatePagelaPayload,
  type Pagela,
  type PagelaLaunchWindow,
  type UpdatePagelaPayload,
} from "../types";
import { launchableWeeks } from "../utils";
import {
  PAGELA_EDITOR_TEXTS,
  PAGELA_NOTES_MAX_LENGTH,
  PAGELA_PERIOD_TEXTS,
} from "../constants";
import {
  buildCreatePagelaRequest,
  buildUpdatePagelaRequest,
} from "@/features/pagelas/utils";
import { extractErrorMessage } from "@/utils/apiError";
import type { RootState } from "@/store/slices";

type Props = {
  mode: PagelaEditorMode;
  /** A pagela corrigida; só existe no modo de edição. */
  initial: Pagela | null;
  childId: string;

  /** Janela de lançamento de hoje; `null` enquanto carrega ou se falhou. */
  launchWindow: PagelaLaunchWindow | null;
  launchLoading: boolean;
  launchError: string;

  /** Pagela já lançada para a criança na semana, se houver. */
  findPagela: (year: number, week: number) => Promise<Pagela | null>;

  onCreate: (payload: CreatePagelaPayload) => Promise<void>;
  onUpdate: (id: string, payload: UpdatePagelaPayload) => Promise<void>;
  /** Chamado depois de salvar com sucesso. */
  onDone: () => void;
  /** A semana escolhida já tem pagela: passa a editá-la. */
  onEditExisting: (pagela: Pagela) => void;
  onCancel: () => void;
};

/**
 * Formulário de uma pagela.
 *
 * Quem o usa troca a `key` a cada abertura, então o estado nasce da pagela
 * recebida e nunca precisa ser ressincronizado por efeito: criar e editar são
 * dois modos separados, e a semana de uma pagela existente não muda.
 */
export default function PagelaQuickForm({
  mode,
  initial,
  childId,
  launchWindow,
  launchLoading,
  launchError,
  findPagela,
  onCreate,
  onUpdate,
  onDone,
  onEditExisting,
  onCancel,
}: Props) {
  const teacherProfileId = useSelector(
    (s: RootState) => s.auth.user?.teacherProfile?.id ?? null,
  ) as string | null;

  const editing = mode === PagelaEditorMode.EDIT && !!initial;
  const isOpen = !!launchWindow?.open;
  const weeks = React.useMemo(() => launchableWeeks(launchWindow), [launchWindow]);

  const [pickedWeek, setPickedWeek] = React.useState<number | null>(null);
  const [present, setPresent] = React.useState(!!initial?.present);
  const [med, setMed] = React.useState(!!initial?.didMeditation);
  const [verse, setVerse] = React.useState(!!initial?.recitedVerse);
  const [notes, setNotes] = React.useState(initial?.notes ?? "");
  const [saving, setSaving] = React.useState(false);
  const [saveError, setSaveError] = React.useState("");

  // Na criação a semana padrão é a letiva em andamento, nunca a do calendário.
  const year = editing ? initial.year : launchWindow?.open ? launchWindow.year : null;
  const week = editing
    ? initial.week
    : pickedWeek ?? (launchWindow?.open ? launchWindow.currentWeek : null);

  // Criar numa semana que já tem pagela duplicaria o registro: a tela avisa e
  // oferece editar a existente. A busca vai à API porque a lista é paginada.
  const [existing, setExisting] = React.useState<Pagela | null>(null);
  const [checking, setChecking] = React.useState(false);
  const findPagelaRef = React.useRef(findPagela);
  findPagelaRef.current = findPagela;

  React.useEffect(() => {
    if (editing || !year || !week) return;

    let cancelled = false;
    setChecking(true);
    setExisting(null);
    findPagelaRef
      .current(year, week)
      .then((found) => {
        if (!cancelled) setExisting(found);
      })
      .catch(() => {
        // Sem resposta, a API recusa a duplicata na hora de salvar.
      })
      .finally(() => {
        if (!cancelled) setChecking(false);
      });

    return () => {
      cancelled = true;
    };
  }, [editing, year, week]);

  // A API só aceita criar ou corrigir pagela com o período letivo aberto.
  const canSave =
    isOpen && !saving && (editing || (!!week && !checking && !existing));

  const handleSave = async () => {
    if (!canSave) return;

    setSaving(true);
    setSaveError("");
    try {
      if (editing) {
        // Só o que o formulário edita: mandar a data ou o professor de novo
        // trocava a data do registro por hoje e apagava quem lançou.
        await onUpdate(
          initial.id,
          buildUpdatePagelaRequest({
            present,
            didMeditation: med,
            recitedVerse: verse,
            notes,
          }),
        );
      } else if (launchWindow && year && week) {
        await onCreate(
          buildCreatePagelaRequest({
            childId,
            referenceDate: launchWindow.today,
            year,
            week,
            present,
            didMeditation: med,
            recitedVerse: verse,
            notes,
            teacherProfileId,
          }),
        );
      }
      onDone();
    } catch (err: unknown) {
      setSaveError(extractErrorMessage(err, PAGELA_PERIOD_TEXTS.saveError));
      setSaving(false);
    }
  };

  const showFields = isOpen && (editing || !!week);

  return (
    <Box data-testid="pagela-teacher-pagela-quick-form">
      <Stack spacing={1.5}>
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

        {editing ? (
          <Typography
            variant="body2"
            color="text.secondary"
            data-testid="pagela-editor-week"
          >
            Ano {initial.year} · Semana {initial.week}
          </Typography>
        ) : (
          isOpen &&
          week && (
            <TextField
              select
              label="Semana"
              value={week}
              onChange={(e) => setPickedWeek(Number(e.target.value))}
              helperText={
                checking
                  ? PAGELA_EDITOR_TEXTS.checking
                  : `Ano letivo ${year} — ${PAGELA_PERIOD_TEXTS.weekHelper}`
              }
              fullWidth
              slotProps={{
                htmlInput: { "data-testid": "pagela-week-select" },
              }}
            >
              {weeks.map((option) => (
                <MenuItem key={option} value={option} sx={{ minHeight: 44 }}>
                  Semana {option}
                  {option === launchWindow?.currentWeek ? " (atual)" : ""}
                </MenuItem>
              ))}
            </TextField>
          )
        )}

        {existing && (
          <Alert
            severity="warning"
            data-testid="pagela-week-taken"
            action={
              <Button
                color="inherit"
                size="small"
                onClick={() => onEditExisting(existing)}
                sx={{ minHeight: 44, fontWeight: 800 }}
              >
                {PAGELA_EDITOR_TEXTS.editExisting}
              </Button>
            }
          >
            {PAGELA_EDITOR_TEXTS.weekTaken}
          </Alert>
        )}

        {showFields && (
          <>
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

            <TextField
              label="Observações"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              multiline
              minRows={3}
              fullWidth
              helperText={`${notes.length}/${PAGELA_NOTES_MAX_LENGTH}`}
              slotProps={{ htmlInput: { maxLength: PAGELA_NOTES_MAX_LENGTH } }}
            />
          </>
        )}

        {saveError && (
          <Alert
            severity="error"
            data-testid="pagela-save-error"
            onClose={() => setSaveError("")}
          >
            {saveError}
          </Alert>
        )}

        <Stack
          direction={{ xs: "column-reverse", sm: "row" }}
          spacing={1}
          justifyContent="flex-end"
        >
          <Button
            onClick={onCancel}
            disabled={saving}
            data-testid="pagela-editor-cancel"
            sx={{ minHeight: 44 }}
          >
            {PAGELA_EDITOR_TEXTS.cancel}
          </Button>
          <Button
            onClick={handleSave}
            disabled={!canSave}
            variant="contained"
            data-testid="pagela-editor-save"
            startIcon={
              saving ? <CircularProgress size={16} color="inherit" /> : <Save />
            }
            sx={{ minHeight: 44, fontWeight: 800, px: 3 }}
          >
            {saving ? PAGELA_EDITOR_TEXTS.saving : PAGELA_EDITOR_TEXTS.save}
          </Button>
        </Stack>
      </Stack>
    </Box>
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
    <FormControlLabel
      data-testid="pagela-teacher-pagela-quick-form-row-switch"
      control={<Switch checked={checked} onChange={(_, v) => onChange(v)} />}
      label={
        <Stack direction="row" spacing={1} alignItems="center">
          <Box sx={{ display: "flex", "& svg": { fontSize: 20, opacity: 0.75 } }}>
            {icon}
          </Box>
          <Typography fontWeight={800}>{label}</Typography>
        </Stack>
      }
      labelPlacement="start"
      sx={{
        m: 0,
        px: 1.5,
        minHeight: 52,
        borderRadius: 2,
        justifyContent: "space-between",
        bgcolor: "action.hover",
      }}
    />
  );
}
