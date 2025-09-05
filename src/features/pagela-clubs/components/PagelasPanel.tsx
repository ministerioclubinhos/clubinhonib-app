// ──────────────────────────────────────────────────────────────────────────────
// File: src/features/pagela-clubs/components/PagelasPanel.tsx
// ──────────────────────────────────────────────────────────────────────────────
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Box, Stack, Typography, Chip, Skeleton, Alert, Card, CardContent, Avatar,
  Divider, Pagination, IconButton, Tooltip
} from "@mui/material";
import PaginationItem from "@mui/material/PaginationItem";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import BookmarksIcon from "@mui/icons-material/Bookmarks";
import { useTheme, alpha } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

import type { ChildResponseDto } from "@/features/children/types";
import { apiListPagelasPaginated } from "@/features/pagela-teacher/api";
import type { Pagela } from "@/features/pagela-teacher/types";
import { EmptyState } from "./common/EmptyState";
import { PlaceholderCard } from "./common/PlaceholderCard";
import { fmtDate } from "../utils";

export function PagelasPanel({ child }: { child: ChildResponseDto | null }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const touchMin = isMobile ? 56 : 48;

  const [rows, setRows] = useState<Pagela[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const hasFetchedRef = useRef<Record<string, boolean>>({});
  const lastKeyRef = useRef<string>("");
  const abortRef = useRef<AbortController | null>(null);

  const childId = child?.id ?? null;

  const query = useMemo(() => {
    if (!childId) return null;
    return { childId, page, limit };
  }, [childId, page, limit]);

  const fetchPagelas = useCallback(async () => {
    if (!query) return;

    const key = JSON.stringify(query);
    if (key === lastKeyRef.current) return;
    lastKeyRef.current = key;

    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    setLoading(true);
    setError("");
    try {
      const data = await apiListPagelasPaginated(query, { signal: ctrl.signal });
      setRows(Array.isArray(data?.items) ? data.items : []);
      setTotal(Number(data?.total ?? 0));
      hasFetchedRef.current[query.childId] = true;
    } catch (e: any) {
      if (e?.name !== "CanceledError" && e?.name !== "AbortError") {
        setError(e?.response?.data?.message || e?.message || "Erro ao listar pagelas");
      }
    } finally {
      if (abortRef.current === ctrl) abortRef.current = null;
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    setPage(1);
    lastKeyRef.current = "";
  }, [childId]);

  useEffect(() => {
    fetchPagelas();
    return () => abortRef.current?.abort();
  }, [fetchPagelas]);

  if (!childId) {
    return <PlaceholderCard title="Escolha uma criança" subtitle="Clique em uma criança para ver suas pagelas." />;
  }

  const hasFetched = !!hasFetchedRef.current[childId];

  return (
    <Stack sx={{ height: "100%" }} spacing={2}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
        <Chip label={`Total: ${total}`} color="info" variant="outlined" />
        <Chip label={`Clube #${child?.club?.number ?? "-"}`} color="secondary" variant="outlined" />
      </Box>

      <Box sx={{ flex: 1, overflow: "auto", pr: 1 }}>
        <Stack spacing={1}>
          {loading && Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} variant="rounded" height={72} />)}
          {!loading && error && <Alert severity="error">{error}</Alert>}

          {!loading && !error && hasFetched && rows.length === 0 && (
            <EmptyState title="Sem pagelas" subtitle="Crie a primeira pagela desta criança." />
          )}

          {!loading && !error && rows.length > 0 && rows.map((p) => (
            <Card
              key={p.id}
              variant="outlined"
              sx={{
                borderRadius: 2,
                borderColor: alpha(theme.palette.info.main, 0.3),
                backgroundColor: alpha(theme.palette.info.main, 0.02),
              }}
            >
              <CardContent sx={{ p: isMobile ? 1 : 1.25 }}>
                {isMobile ? (
                  // ── MOBILE: 3 linhas ──
                  <Stack spacing={1}>
                    {/* 1ª linha */}
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                      sx={{ minHeight: touchMin }}
                    >
                      <Avatar sx={{ width: 42, height: 42, bgcolor: alpha(theme.palette.info.main, 0.15), color: theme.palette.info.main }}>
                        <BookmarksIcon />
                      </Avatar>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                        Semana {p.week} · {p.year}
                      </Typography>
                    </Stack>

                    {/* 2ª linha: chips */}
                    <Stack direction="row" spacing={0.75}>
                      <Chip
                        size="small"
                        color={p.present ? "success" : "default"}
                        label={p.present ? "Presente" : "Ausente"}
                        variant={p.present ? "filled" : "outlined"}
                        sx={{ borderRadius: 999, height: 22, ".MuiChip-label": { px: 1, fontSize: 12 } }}
                      />
                      <Chip
                        size="small"
                        color={p.didMeditation ? "info" : "default"}
                        label={p.didMeditation ? "Meditação" : "Sem Med."}
                        variant={p.didMeditation ? "filled" : "outlined"}
                        sx={{ borderRadius: 999, height: 22, ".MuiChip-label": { px: 1, fontSize: 12 } }}
                      />
                      <Chip
                        size="small"
                        color={p.recitedVerse ? "secondary" : "default"}
                        label={p.recitedVerse ? "Verso" : "Sem Verso"}
                        variant={p.recitedVerse ? "filled" : "outlined"}
                        sx={{ borderRadius: 999, height: 22, ".MuiChip-label": { px: 1, fontSize: 12 } }}
                      />
                    </Stack>

                    {/* 3ª linha: nota */}
                    {p.notes && p.notes.trim() !== "" && (
                      <Typography variant="body2">{p.notes}</Typography>
                    )}
                  </Stack>
                ) : (
                  // ── DESKTOP ──
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    spacing={1.5}
                    sx={{ minHeight: touchMin }}
                  >
                    <Stack direction="row" spacing={1.25} alignItems="center" sx={{ minWidth: 0 }}>
                      <Avatar sx={{ width: 40, height: 40, bgcolor: alpha(theme.palette.info.main, 0.15), color: theme.palette.info.main }}>
                        <BookmarksIcon />
                      </Avatar>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.1 }} noWrap>
                          Semana {p.week} · {p.year}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" noWrap>
                          Ref.: {fmtDate(p.referenceDate)}
                        </Typography>
                      </Box>
                    </Stack>

                    <Stack direction="row" spacing={0.75} sx={{ flexShrink: 0 }}>
                      <Chip
                        size="small"
                        color={p.present ? "success" : "default"}
                        label={p.present ? "Presente" : "Ausente"}
                        variant={p.present ? "filled" : "outlined"}
                        sx={{ borderRadius: 999, height: 22, ".MuiChip-label": { px: 1, fontSize: 12 } }}
                      />
                      <Chip
                        size="small"
                        color={p.didMeditation ? "info" : "default"}
                        label={p.didMeditation ? "Meditação" : "Sem Med."}
                        variant={p.didMeditation ? "filled" : "outlined"}
                        sx={{ borderRadius: 999, height: 22, ".MuiChip-label": { px: 1, fontSize: 12 } }}
                      />
                      <Chip
                        size="small"
                        color={p.recitedVerse ? "secondary" : "default"}
                        label={p.recitedVerse ? "Verso" : "Sem Verso"}
                        variant={p.recitedVerse ? "filled" : "outlined"}
                        sx={{ borderRadius: 999, height: 22, ".MuiChip-label": { px: 1, fontSize: 12 } }}
                      />
                    </Stack>
                  </Stack>
                )}

                {!isMobile && p.notes && p.notes.trim() !== "" && (
                  <>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="body2">{p.notes}</Typography>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </Stack>
      </Box>

      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Stack direction="row" spacing={1} alignItems="center">
          <Tooltip title="- por página">
            <IconButton onClick={() => setLimit((l) => Math.max(6, l - 6))}>
              <ChevronLeftIcon />
            </IconButton>
          </Tooltip>
          <Typography variant="body2">{limit}/pág.</Typography>
          <Tooltip title="+ por página">
            <IconButton onClick={() => setLimit((l) => Math.min(48, l + 6))}>
              <ChevronRightIcon />
            </IconButton>
          </Tooltip>
        </Stack>

        <Pagination
          size="small"
          count={Math.max(1, Math.ceil(total / limit))}
          page={page}
          onChange={(_, p) => setPage(p)}
          renderItem={(item) => (
            <PaginationItem
              {...item}
              slots={{
                previous: ChevronLeftIcon,
                next: ChevronRightIcon,
              }}
            />
          )}
        />
      </Stack>
    </Stack>
  );
}
