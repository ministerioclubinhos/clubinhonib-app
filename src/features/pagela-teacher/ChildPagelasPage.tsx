// src/features/pagela-teacher/ChildPagelasPage.tsx
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
} from "@mui/material";
import MuiAlert from "@mui/material/Alert";
import { ArrowBack, FamilyRestroom, Phone } from "@mui/icons-material";
import { getISOWeekYear } from "./utils";
import { useChildrenBrowser, useChildPagelas } from "./hooks";
import WeekBar from "./components/WeekBar";
import PagelaQuickCard from "./components/PagelaQuickCard";
import PagelaList from "./components/PagelaList";
import type { ChildSimpleResponseDto } from "../children/types";
import type { Pagela } from "./types";

/** mesmas faixas do ChildCard: F rosa/lilás, M azul/teal */
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
  const iso = React.useMemo(() => getISOWeekYear(new Date()), []);
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));

  const [year, setYear] = React.useState(iso.year);
  const [week, setWeek] = React.useState(iso.week);

  // lista/cache local das crianças
  const { byId, loading: loadingChildren, error: cError, setError: setCErr, onChangeQ } =
    useChildrenBrowser();
  React.useEffect(() => {
    if (!loc.state?.child && !byId.get(childId)) onChangeQ("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [childId]);

  const child = loc.state?.child || byId.get(childId) || null;
  const colors = React.useMemo(
    () => genderPastel(child?.name || childId, (child as any)?.gender),
    [child, childId]
  );

  const { filters, list, actions } = useChildPagelas(childId, { year, week });
  React.useEffect(() => {
    filters.setYear(year);
    filters.setWeek(week);
    list.setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, week]);

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

  const currentOfWeek: Pagela | null = React.useMemo(
    () => list.rows.find((r) => r.childId === childId && r.year === year && r.week === week) ?? null,
    [list.rows, childId, year, week]
  );

  const initials = React.useMemo(() => {
    const parts = (child?.name || "").trim().split(/\s+/).slice(0, 2);
    return parts.map((p: string) => p?.[0]?.toUpperCase() || "").join("");
  }, [child?.name]);

  return (
    <Box
      sx={{
        px: { xs: 2, md: 4 },
        pt: { xs: 2, md: 4 }, // padding-top responsivo; removemos mt
        minHeight: "100vh",
        bgcolor: "#f6f7f9",
      }}
    >
      {/* HERO com gradiente e avatar — mobile: 4 linhas; desktop: layout atual */}
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
        {/* decorações leves */}
        <Box sx={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          <Box sx={{ position: "absolute", top: -12, left: -12, width: 96, height: 96, borderRadius: "50%", bgcolor: "rgba(255,255,255,.3)", filter: "blur(2px)" }} />
          <Box sx={{ position: "absolute", bottom: -14, right: -14, width: 120, height: 120, borderRadius: "50%", bgcolor: "rgba(255,255,255,.18)", filter: "blur(1px)" }} />
        </Box>

        <Grid container spacing={{ xs: 1.5, md: 2 }} alignItems="center" sx={{ position: "relative", zIndex: 1 }}>
          {isXs ? (
            <>
              {/* 1) seta esquerda + avatar direita — APENAS MOBILE */}
              <Grid item xs={12}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <IconButton
                    size="small"
                    onClick={() => nav(-1)}
                    sx={{
                      width: 40,
                      height: 40,
                      bgcolor: "background.paper",
                      boxShadow: 1,
                      "&:hover": { bgcolor: "background.paper" },
                    }}
                    aria-label="Voltar"
                  >
                    <ArrowBack />
                  </IconButton>

                  <Avatar
                    sx={{
                      width: 48,
                      height: 48,
                      border: "3px solid",
                      borderColor: "background.paper",
                      bgcolor: colors.solid,
                      fontWeight: 900,
                    }}
                  >
                    {initials || "?"}
                  </Avatar>
                </Box>
              </Grid>

              {/* 2) nome da criança */}
              <Grid item xs={12}>
                <Typography
                  variant="h6"
                  fontWeight={900}
                  sx={{
                    color: "#143a2b",
                    lineHeight: 1.15,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  Pagela do(a) {child?.name || "Criança"}
                </Typography>
              </Grid>

              {/* 3) responsável */}
              <Grid item xs={12}>
                <Stack direction="row" spacing={0.75} alignItems="center" sx={{ color: "rgba(0,0,0,.72)" }}>
                  <FamilyRestroom fontSize="small" />
                  <Typography variant="body2" noWrap>
                    {child?.guardianName || "—"}
                  </Typography>
                </Stack>
              </Grid>

              {/* 4) telefone */}
              <Grid item xs={12}>
                <Stack direction="row" spacing={0.75} alignItems="center" sx={{ color: "rgba(0,0,0,.72)" }}>
                  <Phone fontSize="small" />
                  <Typography variant="body2" noWrap>
                    {child?.guardianPhone || "—"}
                  </Typography>
                </Stack>
              </Grid>

              {/* WeekBar abaixo no mobile */}
              <Grid item xs={12} sx={{ mt: 0.5 }}>
                <Box
                  sx={{
                    p: 1.25,
                    borderRadius: 2,
                    bgcolor: "rgba(255,255,255,.65)",
                    backdropFilter: "saturate(140%) blur(4px)",
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <WeekBar
                    year={year}
                    week={week}
                    onChange={(n) => {
                      setYear(n.year);
                      setWeek(n.week);
                    }}
                    goCurrent={() => {
                      setYear(iso.year);
                      setWeek(iso.week);
                    }}
                  />
                </Box>
              </Grid>
            </>
          ) : (
            /* DESKTOP: sem botão de voltar aqui */
            <>
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

                    <Stack direction="row" spacing={1} alignItems="center" sx={{ color: "rgba(0,0,0,.72)", flexWrap: "wrap" }}>
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

              <Grid item xs={12} md={5}>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 2,
                    bgcolor: "rgba(255,255,255,.65)",
                    backdropFilter: "saturate(140%) blur(4px)",
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <WeekBar
                    year={year}
                    week={week}
                    onChange={(n) => { setYear(n.year); setWeek(n.week); }}
                    goCurrent={() => { setYear(iso.year); setWeek(iso.week); }}
                  />
                </Box>
              </Grid>
            </>
          )}
        </Grid>
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
            <PagelaQuickCard
              childName={child.name}
              current={currentOfWeek}
              childId={childId}
              year={year}
              week={week}
              teacherProfileId={TEACHER_PROFILE_ID}
              onCreate={async (p) => {
                await actions.create(p);
                showSnack("Pagela salva!");
              }}
              onUpdate={async (id, p) => {
                await actions.update(id, p);
                showSnack("Pagela atualizada!");
              }}
            />
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
              onEdit={(row) => {
                setYear(row.year);
                setWeek(row.week);
              }}
              onDelete={async (row) => {
                await actions.remove(row.id);
                showSnack("Pagela excluída.", "info");
              }}
            />
          </Paper>
        </Grid>
      </Grid>

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
