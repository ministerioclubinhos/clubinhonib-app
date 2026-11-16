import * as React from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Button,
  Alert,
  Snackbar,
  Paper,
  Typography,
  IconButton,
  CircularProgress,
  useMediaQuery,
  useTheme,
  Avatar,
  Stack,
} from "@mui/material";
import MuiAlert from "@mui/material/Alert";
import { ArrowBack, FamilyRestroom, Phone, Add } from "@mui/icons-material";
import { useChildPagelas, usePagelaLaunchWindow } from "./hooks";
import PagelaList from "./components/PagelaList";
import PagelaEditorDialog from "./components/PagelaEditorDialog";
import { apiFetchChild } from "../children/api";
import type { ChildListItem, ChildResponse } from "../children/types";
import { PagelaEditorMode, type Pagela, type PagelaEditorState } from "./types";
import {
  INACTIVE_CHILD_PAGELA_TEXT,
  PAGELA_EDITOR_TEXTS,
  PAGELA_PERIOD_TEXTS,
  PAGELAS_PAGE_SIZE,
} from "./constants";
import { getErrorMessage } from "@/utils/apiError";

function genderPastel(seed: string, gender?: string) {
  const hash = Array.from(seed).reduce((a, ch) => (a * 33 + ch.charCodeAt(0)) % 1000, 7);
  const t = hash / 1000;
  const g = (gender || "").toUpperCase();
  const h = g === "F" ? (310 + t * 70) % 360 : 190 + t * 40;
  const s = 70, l = 85;
  return {
    solid: `hsl(${h} ${s}% ${l - 15}%)`,
    soft: `hsl(${(h + 12) % 360} ${s}% ${l}%)`,
  };
}

export default function ChildPagelasPage() {
  const { childId = "" } = useParams();
  const nav = useNavigate();
  const loc = useLocation() as { state?: { child?: ChildListItem } };
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"), { noSsr: true });

  // A criança vem da navegação ou de uma busca só dela. Antes a tela carregava
  // a lista inteira de crianças apenas para procurar esta.
  const [directChild, setDirectChild] = React.useState<Omit<
    ChildListItem,
    "acceptedChrists"
  > | null>(null);
  const [loadingChild, setLoadingChild] = React.useState(!loc.state?.child);
  const [cError, setCErr] = React.useState("");

  React.useEffect(() => {
    if (!childId) return;
    let cancelled = false;
    // Mesmo vindo da lista, a situação (ativa ou não) é conferida de novo.
    apiFetchChild(childId)
      .then((full: ChildResponse) => {
        if (cancelled) return;
        setDirectChild({
          id: full.id,
          name: full.name,
          guardianName: full.guardianName,
          guardianPhone: full.guardianPhone,
          gender: full.gender,
          clubId: full.club?.id ?? null,
          isActive: full.isActive,
        });
      })
      .catch((err: unknown) => {
        if (!cancelled) setCErr(getErrorMessage(err, "Criança não encontrada"));
      })
      .finally(() => {
        if (!cancelled) setLoadingChild(false);
      });
    return () => {
      cancelled = true;
    };
  }, [childId]);

  const child = directChild || loc.state?.child || null;
  const colors = React.useMemo(
    () => genderPastel(child?.name || childId, child?.gender),
    [child, childId]
  );

  const { filters, list, actions } = useChildPagelas(childId, {
    limit: isXs ? PAGELAS_PAGE_SIZE.mobile : PAGELAS_PAGE_SIZE.desktop,
  });
  const launch = usePagelaLaunchWindow();
  const launchClosed = !!launch.window && !launch.window.open;
  // Criança desativada saiu do clubinho: não recebe nem tem pagela editada.
  const childInactive = child?.isActive === false;

  const [snack, setSnack] = React.useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "info" | "warning",
  });
  const showSnack = (m: string, s: typeof snack.severity = "success") =>
    setSnack({ open: true, message: m, severity: s });
  const closeSnack = (_?: unknown, r?: string) => {
    if (r === "clickaway") return;
    setSnack((s) => ({ ...s, open: false }));
  };

  const [editor, setEditor] = React.useState<PagelaEditorState | null>(null);
  const openCreate = () => setEditor({ mode: PagelaEditorMode.CREATE });
  const openEdit = (pagela: Pagela) =>
    setEditor({ mode: PagelaEditorMode.EDIT, pagela });
  const closeEditor = () => setEditor(null);

  const findPagela = React.useCallback(
    async (y: number, w: number) =>
      list.rows.find((r) => r.childId === childId && r.year === y && r.week === w) ??
      (await actions.findByWeek(y, w)),
    [list.rows, childId, actions.findByWeek]
  );

  const initials = React.useMemo(() => {
    const parts = (child?.name || "").trim().split(/\s+/).slice(0, 2);
    return parts.map((p: string) => p?.[0]?.toUpperCase() || "").join("");
  }, [child?.name]);

  const canCreate = !childInactive && !launchClosed;

  return (
    <Box
      data-testid="pagela-teacher-child-pagelas-page"
      sx={{
        px: { xs: 2, md: 4 },
        pt: { xs: 2, md: 4 },
        pb: { xs: 4, md: 6 },
        minHeight: "100vh",
        bgcolor: "#f6f7f9",
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 2,
          borderRadius: 4,
          border: "1px solid",
          borderColor: "divider",
          background: `linear-gradient(135deg, ${colors.soft} 0%, ${colors.solid} 100%)`,
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <IconButton
            onClick={() => nav(-1)}
            aria-label="Voltar"
            sx={{
              width: 44,
              height: 44,
              flexShrink: 0,
              bgcolor: "background.paper",
              boxShadow: 2,
              "&:hover": { bgcolor: "background.paper" },
            }}
          >
            <ArrowBack />
          </IconButton>

          <Avatar
            sx={{
              width: 52,
              height: 52,
              border: "3px solid",
              borderColor: "background.paper",
              bgcolor: colors.solid,
              fontWeight: 900,
              flexShrink: 0,
            }}
          >
            {initials || "?"}
          </Avatar>

          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography
              variant="h6"
              noWrap
              title={child?.name}
              sx={{ color: "#143a2b", lineHeight: 1.2, fontWeight: 900 }}
            >
              {child?.name || "Criança"}
            </Typography>
            <Stack
              direction="row"
              columnGap={1.5}
              flexWrap="wrap"
              alignItems="center"
              sx={{ color: "rgba(0,0,0,.75)" }}
            >
              <Stack direction="row" spacing={0.5} alignItems="center" sx={{ minWidth: 0 }}>
                <FamilyRestroom fontSize="small" />
                <Typography variant="body2" noWrap>
                  {child?.guardianName || "—"}
                </Typography>
              </Stack>
              {child?.guardianPhone && (
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <Phone fontSize="small" />
                  <Typography variant="body2" noWrap>
                    {child.guardianPhone}
                  </Typography>
                </Stack>
              )}
            </Stack>
          </Box>

          {!isXs && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={openCreate}
              disabled={!canCreate}
              data-testid="pagela-create-button"
              sx={{ minHeight: 44, fontWeight: 800, flexShrink: 0 }}
            >
              {PAGELA_EDITOR_TEXTS.newButton}
            </Button>
          )}
        </Stack>
      </Paper>

      {isXs && (
        <Button
          fullWidth
          variant="contained"
          size="large"
          startIcon={<Add />}
          onClick={openCreate}
          disabled={!canCreate}
          data-testid="pagela-create-button"
          sx={{ minHeight: 48, mb: 2, fontWeight: 800 }}
        >
          {PAGELA_EDITOR_TEXTS.newButton}
        </Button>
      )}

      {(list.error || cError) && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          onClose={() => {
            list.setError("");
            setCErr("");
          }}
        >
          {list.error || cError}
        </Alert>
      )}

      {childInactive && (
        <Alert severity="warning" sx={{ mb: 2 }} data-testid="pagela-child-inactive">
          {INACTIVE_CHILD_PAGELA_TEXT}
        </Alert>
      )}

      {launchClosed && !childInactive && (
        <Alert severity="warning" sx={{ mb: 2 }} data-testid="pagela-launch-closed-banner">
          <strong>{PAGELA_PERIOD_TEXTS.closedTitle}.</strong>{" "}
          {launch.window?.message || PAGELA_PERIOD_TEXTS.closedFallback}
        </Alert>
      )}

      <Paper
        sx={{
          p: { xs: 1.5, md: 2 },
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Typography variant="subtitle1" fontWeight={900} sx={{ mb: 0.5 }}>
          Pagelas
        </Typography>
        {(list.loading && !list.rows.length) || loadingChild ? (
          <Box textAlign="center" my={4} data-testid="pagela-list-loading">
            <CircularProgress />
          </Box>
        ) : (
          <PagelaList
            rows={list.rows}
            total={list.total}
            page={list.page}
            limit={list.limit}
            setPage={list.setPage}
            filters={filters}
            canEdit={!childInactive}
            onEdit={openEdit}
            onDelete={async (row) => {
              try {
                await actions.remove(row.id);
                showSnack(PAGELA_EDITOR_TEXTS.deleted, "info");
              } catch (err: unknown) {
                showSnack(getErrorMessage(err, PAGELA_EDITOR_TEXTS.deleteError), "error");
              }
            }}
          />
        )}
      </Paper>

      {child && (
        <PagelaEditorDialog
          editor={editor}
          childId={childId}
          childName={child.name}
          launchWindow={launch.window}
          launchLoading={launch.loading}
          launchError={launch.error}
          findPagela={findPagela}
          onCreate={async (p) => {
            await actions.create(p);
            showSnack(PAGELA_EDITOR_TEXTS.created);
          }}
          onUpdate={async (id, p) => {
            await actions.update(id, p);
            showSnack(PAGELA_EDITOR_TEXTS.updated);
          }}
          onEditExisting={openEdit}
          onClose={closeEditor}
        />
      )}

      <Snackbar
        open={snack.open}
        autoHideDuration={2800}
        onClose={closeSnack}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        sx={{ bottom: { xs: 16, md: 24 } }}
      >
        <MuiAlert elevation={6} variant="filled" severity={snack.severity} onClose={closeSnack}>
          {snack.message}
        </MuiAlert>
      </Snackbar>
    </Box>
  );
}
