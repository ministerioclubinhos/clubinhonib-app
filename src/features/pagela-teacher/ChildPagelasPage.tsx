import * as React from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Alert,
  Snackbar,
  Grid,
  Paper,
  Typography,
  IconButton,
  CircularProgress,
  useMediaQuery,
  useTheme,
  Avatar,
  Chip,
  Stack,
  Fab,
  SwipeableDrawer,
} from "@mui/material";
import MuiAlert from "@mui/material/Alert";
import { ArrowBack, FamilyRestroom, Phone, Add } from "@mui/icons-material";
import { useChildPagelas, usePagelaLaunchWindow } from "./hooks";
import PagelaList from "./components/PagelaList";
import PagelaQuickForm from "./components/PagelaQuickForm";
import { apiFetchChild } from "../children/api";
import type { ChildListItem, ChildResponse } from "../children/types";
import type { Pagela } from "./types";
import { INACTIVE_CHILD_PAGELA_TEXT, PAGELA_PERIOD_TEXTS } from "./constants";
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

const TEACHER_PROFILE_ID: string | null = null;

export default function ChildPagelasPage() {
  const { childId = "" } = useParams();
  const nav = useNavigate();
  const loc = useLocation() as { state?: { child?: ChildListItem } };
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));

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

  const { filters, list, actions } = useChildPagelas(childId);
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

  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [formInitial, setFormInitial] = React.useState<Pagela | null>(null);

  const findPagela = React.useCallback(
    async (y: number, w: number) =>
      list.rows.find((r) => r.childId === childId && r.year === y && r.week === w) ??
      (await actions.findByWeek(y, w)),
    [list.rows, childId, actions.findByWeek]
  );

  const openCreate = () => {
    setFormInitial(null);
    setSheetOpen(true);
  };
  const openEdit = (p: Pagela) => {
    setFormInitial(p);
    setSheetOpen(true);
  };
  const closeSheet = () => setSheetOpen(false);

  const initials = React.useMemo(() => {
    const parts = (child?.name || "").trim().split(/\s+/).slice(0, 2);
    return parts.map((p: string) => p?.[0]?.toUpperCase() || "").join("");
  }, [child?.name]);

  return (
    <Box data-testid="pagela-teacher-child-pagelas-page"
      sx={{
        px: { xs: 2, md: 4 },
        pt: { xs: 3, md: 5 },
        pb: 6,
        minHeight: "100vh",
        bgcolor: "#f6f7f9",
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 2 },
          mb: 2,
          borderRadius: 4,
          border: "1px solid",
          borderColor: "divider",
          overflow: "hidden",
          position: "relative",
          background: `linear-gradient(135deg, ${colors.soft} 0%, ${colors.solid} 100%)`,
        }}
      >
        <Box sx={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          <Box sx={{ position: "absolute", top: -24, left: -24, width: 130, height: 130, borderRadius: "50%", bgcolor: "rgba(255,255,255,.28)", filter: "blur(3px)" }} />
          <Box sx={{ position: "absolute", bottom: -28, right: -28, width: 160, height: 160, borderRadius: "50%", bgcolor: "rgba(255,255,255,.18)", filter: "blur(2px)" }} />
        </Box>

        {isXs ? (
          <Box sx={{ position: "relative", zIndex: 1 }}>
            <Stack spacing={0.75}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <IconButton
                  size="small"
                  onClick={() => nav(-1)}
                  aria-label="Voltar"
                  sx={{
                    width: 40,
                    height: 40,
                    bgcolor: "background.paper",
                    boxShadow: 2,
                    border: "1px solid",
                    borderColor: "divider",
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
                    flex: "0 0 auto",
                  }}
                >
                  {initials || "?"}
                </Avatar>
              </Box>

              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 900,
                  lineHeight: 1.15,
                  color: "#143a2b",
                  display: "-webkit-box",
                  WebkitLineClamp: 1,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
                title={child?.name}
              >
                {child?.name || "Criança"}
              </Typography>

              <Stack direction="row" spacing={0.75} alignItems="center" sx={{ color: "rgba(0,0,0,.75)" }}>
                <FamilyRestroom fontSize="small" />
                <Typography variant="body2" noWrap title={child?.guardianName || "—"}>
                  {child?.guardianName || "—"}
                </Typography>
              </Stack>

              <Stack direction="row" spacing={0.75} alignItems="center" sx={{ color: "rgba(0,0,0,.75)" }}>
                <Phone fontSize="small" />
                <Typography variant="body2" noWrap title={child?.guardianPhone || "—"}>
                  {child?.guardianPhone || "—"}
                </Typography>
              </Stack>

              {child?.clubId && (
                <Chip
                  size="small"
                  color="success"
                  label="Clubinho"
                  sx={{ fontWeight: 800, height: 22, alignSelf: "flex-start", "& .MuiChip-label": { px: 0.75 } }}
                />
              )}
            </Stack>
          </Box>
        ) : (
          <Grid
            container
            spacing={{ xs: 1.5, md: 2 }}
            alignItems="center"
            sx={{ position: "relative", zIndex: 1 }}
          >
            <Grid item>
              <IconButton
                size="small"
                onClick={() => nav(-1)}
                aria-label="Voltar"
                sx={{
                  width: 40,
                  height: 40,
                  bgcolor: "background.paper",
                  boxShadow: 2,
                  border: "1px solid",
                  borderColor: "divider",
                  "&:hover": { bgcolor: "background.paper" },
                }}
              >
                <ArrowBack />
              </IconButton>
            </Grid>

            <Grid item xs>
              <Stack direction="row" spacing={1.25} alignItems="center" sx={{ minWidth: 0 }}>
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

                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      color: "#143a2b",
                      lineHeight: 1.1,
                      display: "-webkit-box",
                      WebkitLineClamp: 1,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      fontWeight: 700,
                    }}
                  >
                    Pagela {(child?.gender === "F" ? "da" : "do")}{" "}
                    <Box component="span" sx={{ fontWeight: 900 }}>
                      {child?.name || "Criança"}
                    </Box>
                  </Typography>

                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    sx={{ color: "rgba(0,0,0,.72)", flexWrap: "wrap" }}
                  >
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <FamilyRestroom fontSize="small" />
                      <Typography variant="body2" noWrap>
                        {child?.guardianName || "—"}
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <Phone fontSize="small" />
                      <Typography variant="body2" noWrap>
                        {child?.guardianPhone || "—"}
                      </Typography>
                    </Stack>
                    {child?.clubId && (
                      <Chip
                        size="small"
                        color="success"
                        label="Clubinho"
                        sx={{ fontWeight: 700 }}
                      />
                    )}
                  </Stack>
                </Box>
              </Stack>
            </Grid>
          </Grid>

        )}
      </Paper>

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

      {isXs && launchClosed && !childInactive && (
        <Alert severity="warning" sx={{ mb: 2 }} data-testid="pagela-launch-closed-banner">
          <strong>{PAGELA_PERIOD_TEXTS.closedTitle}.</strong>{" "}
          {launch.window?.message || PAGELA_PERIOD_TEXTS.closedFallback}
        </Alert>
      )}

      <Grid container spacing={{ xs: 1.5, md: 2.5 }}>
        <Grid item xs={12} lg={5}>
          {(list.loading && !list.rows.length) || loadingChild ? (
            <Box textAlign="center" my={4}>
              <CircularProgress />
            </Box>
          ) : child ? (
            isXs || childInactive ? null : (
              <PagelaQuickForm
                initial={formInitial}
                childId={childId}
                childName={child?.name || ""}
                childGender={child?.gender || ""}
                launchWindow={launch.window}
                launchLoading={launch.loading}
                launchError={launch.error}
                teacherProfileId={TEACHER_PROFILE_ID}
                findPagela={findPagela}
                onCreate={async (p) => {
                  await actions.create(p);
                  showSnack("Pagela salva!");
                }}
                onUpdate={async (id, p) => {
                  await actions.update(id, p);
                  showSnack("Pagela atualizada!");
                }}
              />
            )
          ) : null}
        </Grid>

        <Grid item xs={12} lg={7}>
          <Paper
            sx={{
              p: { xs: 1.5, md: 2 },
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Typography variant="subtitle1" fontWeight={900} sx={{ mb: 1.25 }}>
              Pagelas anteriores
            </Typography>
            <PagelaList
              rows={list.rows}
              total={list.total}
              page={list.page}
              limit={list.limit}
              setPage={list.setPage}
              filters={filters}
              onEdit={(row) => {
                if (childInactive) return;
                if (isXs) {
                  openEdit(row);
                } else {
                  setFormInitial(row);
                }
              }}
              onDelete={async (row) => {
                try {
                  await actions.remove(row.id);
                  showSnack("Pagela excluída.", "info");
                } catch (err: unknown) {
                  showSnack(getErrorMessage(err, "Não foi possível excluir a pagela."), "error");
                }
              }}
            />
          </Paper>
        </Grid>
      </Grid>

      {isXs && !launchClosed && !childInactive && (
        <Fab
          color="primary"
          aria-label="Criar pagela"
          onClick={openCreate}
          sx={{ position: "fixed", bottom: 88, right: 16, zIndex: 1300 }}
        >
          <Add />
        </Fab>
      )}

      {isXs && (
        <SwipeableDrawer
          anchor="bottom"
          open={sheetOpen}
          onOpen={() => setSheetOpen(true)}
          onClose={closeSheet}
          disableSwipeToOpen
          ModalProps={{ keepMounted: true }}
          PaperProps={{
            sx: { height: "86vh", borderTopLeftRadius: 24, borderTopRightRadius: 24 },
          }}
        >
          <Box sx={{ p: 1.25, pb: 2, height: "100%", overflow: "auto" }}>
            <PagelaQuickForm
              initial={formInitial}
              childId={childId}
              childName={child?.name || ""}
              childGender={child?.gender || ""}
              launchWindow={launch.window}
              launchLoading={launch.loading}
              launchError={launch.error}
              teacherProfileId={TEACHER_PROFILE_ID}
              findPagela={findPagela}
              onCreate={async (p) => {
                await actions.create(p);
                showSnack("Pagela salva!");
                closeSheet();
              }}
              onUpdate={async (id, p) => {
                await actions.update(id, p);
                showSnack("Pagela atualizada!");
                closeSheet();
              }}
              onClose={closeSheet}
            />
          </Box>
        </SwipeableDrawer>
      )}

      <Snackbar
        open={snack.open}
        autoHideDuration={2800}
        onClose={closeSnack}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <MuiAlert elevation={6} variant="filled" severity={snack.severity} onClose={closeSnack}>
          {snack.message}
        </MuiAlert>
      </Snackbar>
    </Box>
  );
}
