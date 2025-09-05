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
import { useChildrenBrowser, useChildPagelas } from "./hooks";
import PagelaList from "./components/PagelaList";
import PagelaQuickForm from "./components/PagelaQuickForm";
import type { ChildSimpleResponseDto } from "../children/types";
import type { Pagela } from "./types";

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
  const loc = useLocation() as { state?: { child?: ChildSimpleResponseDto } };
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));

  const { byId, loading: loadingChildren, error: cError, setError: setCErr, onChangeQ } =
    useChildrenBrowser();
  React.useEffect(() => {
    if (!loc.state?.child && !byId.get(childId)) onChangeQ("");
  }, [childId]);

  const child = loc.state?.child || byId.get(childId) || null;
  const colors = React.useMemo(
    () => genderPastel(child?.name || childId, (child as any)?.gender),
    [child, childId]
  );

  const { filters, list, actions } = useChildPagelas(childId);

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
    (y: number, w: number) =>
      list.rows.find((r) => r.childId === childId && r.year === y && r.week === w) ?? null,
    [list.rows, childId]
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
    <Box
      sx={{
        px: { xs: 2, md: 4 },
        pt: { xs: 3, md: 10 },
        pb: 4,
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
          <Grid container spacing={{ xs: 1.5, md: 2 }} alignItems="center" sx={{ position: "relative", zIndex: 1 }}>
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
                  }}
                >
                  {initials || "?"}
                </Avatar>

                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    variant="h6"
                    fontWeight={900}
                    sx={{
                      color: "#143a2b",
                      lineHeight: 1.1,
                      display: "-webkit-box",
                      WebkitLineClamp: 1,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    Pagela do(a) {child?.name || "Criança"}
                  </Typography>

                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    sx={{ color: "rgba(0,0,0,.72)", flexWrap: "wrap" }}
                  >
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <FamilyRestroom fontSize="small" />
                      <Typography variant="body2" noWrap>{child?.guardianName || "—"}</Typography>
                    </Stack>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <Phone fontSize="small" />
                      <Typography variant="body2" noWrap>{child?.guardianPhone || "—"}</Typography>
                    </Stack>
                    {child?.clubId && <Chip size="small" color="success" label="Clubinho" sx={{ fontWeight: 700 }} />}
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

      <Grid container spacing={{ xs: 1.5, md: 2.5 }}>
        <Grid item xs={12} lg={5}>
          {(list.loading && !list.rows.length) || loadingChildren ? (
            <Box textAlign="center" my={4}>
              <CircularProgress />
            </Box>
          ) : child ? (
            isXs ? null : (
              <PagelaQuickForm
                initial={formInitial}
                childId={childId}
                defaultYear={0}
                defaultWeek={0}
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
                if (isXs) {
                  openEdit(row);
                } else {
                  setFormInitial(row);
                }
              }}
              onDelete={async (row) => {
                await actions.remove(row.id);
                showSnack("Pagela excluída.", "info");
              }}
            />
          </Paper>
        </Grid>
      </Grid>

      {isXs && (
        <Fab
          color="primary"
          aria-label="Criar pagela"
          onClick={openCreate}
          sx={{ position: "fixed", bottom: 88, right: 16, zIndex: 1100 }}
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
          disableSwipeToOpen={false}
          ModalProps={{ keepMounted: true }}
          PaperProps={{
            sx: { height: "86vh", borderTopLeftRadius: 24, borderTopRightRadius: 24 },
          }}
        >
          <Box sx={{ p: 1.25, pb: 2, height: "100%", overflow: "auto" }}>
            <PagelaQuickForm
              initial={formInitial}
              childId={childId}
              defaultYear={0}
              defaultWeek={0}
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
