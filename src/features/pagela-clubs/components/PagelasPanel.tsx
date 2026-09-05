import React from "react";
import {
  Box, Stack, Typography, Chip, Skeleton, Alert, Card, CardContent, Avatar,
  Pagination, IconButton, Tooltip, TextField, InputAdornment
} from "@mui/material";
import PaginationItem from "@mui/material/PaginationItem";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import BookmarksIcon from "@mui/icons-material/Bookmarks";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import { useTheme, alpha } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

import type { ChildResponse } from "@/features/children/types";
import type { PagelaResponse, PagelaStatus } from "@/features/pagelas/types";
import { EMPTY_VALUE } from "@/features/pagelas/constants";
import { pagelaStatus, weekSearchIsMeaningful } from "@/features/pagelas/utils";
import { EmptyState } from "./common/EmptyState";
import { PlaceholderCard } from "./common/PlaceholderCard";
import { TOUCH_TARGET_DESKTOP, TOUCH_TARGET_MOBILE } from "../constants";
import { usePagelasBrowser } from "../hooks";
import { formatDate } from "../utils";

type Props = {
  child: ChildResponse | null;
};

export function PagelasPanel({ child }: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const touchMin = isMobile ? TOUCH_TARGET_MOBILE : TOUCH_TARGET_DESKTOP;

  const {
    rows,
    total,
    page,
    setPage,
    limit,
    stepLimit,
    search,
    setSearch,
    loading,
    error,
    loaded,
  } = usePagelasBrowser(child);

  /** Cores de cada situação da semana. */
  const statusColors = (status: PagelaStatus) => {
    const palette =
      status === "complete"
        ? theme.palette.success
        : status === "partial"
          ? theme.palette.warning
          : theme.palette.error;

    return {
      border: palette.main,
      bg: alpha(palette.main, 0.08),
      avatar: alpha(palette.main, 0.15),
      avatarColor: palette.main,
    };
  };

  if (!child) {
    return <PlaceholderCard title="Escolha uma criança" subtitle="Clique em uma criança para ver suas pagelas." />;
  }

  // A API só entende `2026-48`, `2026` ou `48`; qualquer outra coisa não
  // filtra nada, e a tela avisa em vez de devolver a lista inteira calada.
  const searchIsUseful = weekSearchIsMeaningful(search);

  return (
    <Stack sx={{ height: "100%" }} spacing={2}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
        <Chip label={`Total: ${total}`} color="info" variant="outlined" />
        <Chip
          label={`Clubinho #${child.club?.number ?? EMPTY_VALUE}`}
          color="secondary"
          variant="outlined"
        />
      </Box>

      <TextField
        size="small"
        placeholder="Semana e ano (ex: 2025, 48 ou 2025-48)"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        error={!searchIsUseful}
        helperText={
          searchIsUseful ? undefined : "Use o ano, a semana ou ano-semana."
        }
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              {search && (
                <IconButton aria-label="limpar" onClick={() => setSearch("")} size="small">
                  <ClearIcon />
                </IconButton>
              )}
            </InputAdornment>
          ),
        }}
      />

      <Box sx={{ flex: 1, overflow: "auto", pr: 1 }}>
        <Stack spacing={1}>
          {loading && Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} variant="rounded" height={touchMin + 16} />)}
          {!loading && error && <Alert severity="error">{error}</Alert>}

          {!loading && !error && loaded && rows.length === 0 && (
            <EmptyState title="Sem pagelas" subtitle="Crie a primeira pagela desta criança." />
          )}

          {!loading && !error && rows.length > 0 && rows.map((p: PagelaResponse) => {
            const colors = statusColors(pagelaStatus(p));
            return (
            <Card
              key={p.id}
              variant="outlined"
              sx={{
                borderRadius: 2,
                borderColor: colors.border,
                backgroundColor: colors.bg,
                height: isMobile ? "auto" : touchMin + 32,
              }}
            >
              <CardContent sx={{ p: 1.25, height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", minHeight: 0 }}>
                {isMobile ? (
                  <Stack spacing={1}>
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                      sx={{ minHeight: touchMin }}
                    >
                      <Avatar sx={{ width: 40, height: 40, bgcolor: colors.avatar, color: colors.avatarColor, flexShrink: 0 }}>
                        <BookmarksIcon />
                      </Avatar>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.1 }}>
                        Semana {p.week} · {p.year}
                      </Typography>
                    </Stack>

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

                    {p.notes && p.notes.trim() !== "" && (
                      <Typography variant="body2">{p.notes}</Typography>
                    )}
                  </Stack>
                ) : (
                  <>
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    spacing={1.5}
                  >
                      <Stack direction="row" spacing={1.25} alignItems="center" sx={{ minWidth: 0, flex: 1 }}>
                        <Avatar sx={{ width: 40, height: 40, bgcolor: colors.avatar, color: colors.avatarColor, flexShrink: 0 }}>
                        <BookmarksIcon />
                      </Avatar>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.1 }} noWrap>
                          Semana {p.week} · {p.year}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" noWrap>
                          Ref.: {formatDate(p.referenceDate)}
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
                    {p.notes && p.notes.trim() !== "" && (
                      <Tooltip title={p.notes} arrow>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            mt: 0.5,
                            fontSize: "0.75rem",
                            lineHeight: 1.2,
                            display: "-webkit-box",
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {p.notes}
                        </Typography>
                      </Tooltip>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
            );
          })}
        </Stack>
      </Box>

      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ flexWrap: "wrap", gap: 1 }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ flexShrink: 0 }}>
          <Tooltip title="- por página">
            <IconButton onClick={() => stepLimit(-1)} size={isMobile ? "small" : "medium"} aria-label="- por página">
              <ChevronLeftIcon />
            </IconButton>
          </Tooltip>
          <Typography variant="body2" sx={{ fontSize: isMobile ? "0.75rem" : "0.875rem" }}>{limit}/pág.</Typography>
          <Tooltip title="+ por página">
            <IconButton onClick={() => stepLimit(1)} size={isMobile ? "small" : "medium"} aria-label="+ por página">
              <ChevronRightIcon />
            </IconButton>
          </Tooltip>
        </Stack>

        <Pagination
          size="small"
          count={Math.max(1, Math.ceil(total / limit))}
          page={page}
          onChange={(_, p) => setPage(p)}
          siblingCount={isMobile ? 0 : 1}
          boundaryCount={isMobile ? 1 : 1}
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
