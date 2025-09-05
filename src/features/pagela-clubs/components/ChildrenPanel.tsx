import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Box, Stack, TextField, InputAdornment, IconButton, Skeleton, Alert,
  Card, CardActionArea, Avatar, Typography, Chip, Tooltip, Pagination
} from "@mui/material";
import PaginationItem from "@mui/material/PaginationItem";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import RefreshIcon from "@mui/icons-material/Refresh";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { useTheme, alpha } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

import { apiFetchChildren } from "@/features/children/api";
import type { ChildResponseDto, ChildFilters, ChildSort } from "@/features/children/types";
import type { ClubResponseDto } from "@/features/clubs/types";
import { EmptyState } from "./common/EmptyState";
import { PlaceholderCard } from "./common/PlaceholderCard";
import { fmtDate, formatPhone, useDebounced } from "../utils";

function initialsFromName(name?: string): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  const first = parts[0][0] || "";
  const last = parts[parts.length - 1][0] || "";
  return (first + last).toUpperCase();
}

export function ChildrenPanel({
  club,
  onSelect,
  selectedId,
}: {
  club: ClubResponseDto | null;
  onSelect: (c: ChildResponseDto) => void;
  selectedId: string | null;
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const touchMin = isMobile ? 56 : 48;

  const [search, setSearch] = useState("");
  const dq = useDebounced(search);

  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [rows, setRows] = useState<ChildResponseDto[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const sort = useMemo<ChildSort>(() => ({ id: "updatedAt", desc: true }), []);
  const filters: ChildFilters = useMemo(
    () => ({
      searchString: dq || undefined,
      clubNumber: club?.number ?? undefined,
    }),
    [dq, club?.number]
  );

  const lastKeyRef = useRef<string>("");
  const abortRef = useRef<AbortController | null>(null);

  const fetchChildren = useCallback(async () => {
    if (!club) {
      setRows([]);
      setTotal(0);
      return;
    }

    const key = JSON.stringify({ page, limit, filters, sort, clubId: club.id });
    if (key === lastKeyRef.current) return;
    lastKeyRef.current = key;

    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    setLoading(true);
    setError("");
    try {
      const data = await apiFetchChildren({ page, limit, filters, sort });
      const meta = (data as any)?.meta;
      setRows(Array.isArray((data as any)?.data) ? (data as any).data : []);
      setTotal(Number(meta?.totalItems ?? (data as any)?.total ?? 0));
    } catch (e: any) {
      if (e?.name !== "CanceledError" && e?.name !== "AbortError") {
        setError(e?.response?.data?.message || e?.message || "Erro ao listar crianças");
      }
    } finally {
      if (abortRef.current === ctrl) abortRef.current = null;
      setLoading(false);
    }
  }, [club, page, limit, filters, sort]);

  useEffect(() => {
    setPage(1);
  }, [club?.id]);

  useEffect(() => {
    fetchChildren();
    return () => abortRef.current?.abort();
  }, [fetchChildren]);

  if (!club) {
    return <PlaceholderCard title="Escolha um clube" subtitle="Clique em um clube para ver suas crianças." />;
  }

  return (
    <Stack sx={{ height: "100%" }} spacing={2}>
      <TextField
        size="small"
        placeholder="Buscar por nome, responsável, telefone..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              {search && (
                <IconButton aria-label="limpar" onClick={() => setSearch("")}>
                  <ClearIcon />
                </IconButton>
              )}
            </InputAdornment>
          ),
        }}
      />

      <Box sx={{ flex: 1, overflow: "auto", pr: 1 }}>
        <Stack spacing={1}>
          {loading &&
            Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} variant="rounded" height={72} />
            ))}

          {!loading && error && <Alert severity="error">{error}</Alert>}

          {!loading && !error && rows.length === 0 && (
            <EmptyState title="Sem crianças neste clube" subtitle="Cadastre crianças ou escolha outro clube." />
          )}

          {!loading && !error && rows.map((c) => {
            const initials = initialsFromName(c.name);
            const nasc = c.birthDate ? fmtDate(c.birthDate) : null;
            const desde = c.joinedAt ? fmtDate(c.joinedAt) : null;
            const selected = selectedId === c.id;

            const avatarBg = c.gender === "F"
              ? alpha(theme.palette.secondary.main, 0.18)
              : alpha(theme.palette.info.main, 0.18);
            const avatarFg = c.gender === "F"
              ? theme.palette.secondary.main
              : theme.palette.info.main;

            return (
              <Card
                key={c.id}
                variant={selected ? "elevation" : "outlined"}
                sx={{
                  borderRadius: 2,
                  borderColor: selected ? "secondary.main" : "divider",
                  backgroundColor: selected ? alpha(theme.palette.secondary.main, 0.06) : "background.paper",
                  transition: "background-color .2s, border-color .2s",
                  "&:hover": { backgroundColor: alpha(theme.palette.secondary.main, 0.04) },
                }}
              >
                <CardActionArea onClick={() => onSelect(c)}>
                  {isMobile ? (
                    <Stack spacing={0.75} sx={{ p: 1, minHeight: touchMin }}>
                      <Stack direction="row" alignItems="center">
                        <Avatar
                          sx={{
                            width: 44,
                            height: 44,
                            fontSize: 14,
                            fontWeight: 700,
                            bgcolor: avatarBg,
                            color: avatarFg,
                          }}
                        >
                          {initials}
                        </Avatar>
                      </Stack>

                      <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.1 }}>
                        {c.name}
                      </Typography>

                      <Typography variant="body2" color="text.secondary">
                        {nasc ? `Nasc.: ${nasc}` : "Nasc.: —"} · {desde ? `Desde ${desde}` : "Desde —"}
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ wordBreak: "break-word" }}
                        title={`Resp.: ${c.guardianName} · ${formatPhone(c.guardianPhone)}`}
                      >
                        Resp.: {c.guardianName} · {formatPhone(c.guardianPhone)}
                      </Typography>
                    </Stack>
                  ) : (
                    <Stack direction="row" alignItems="center" spacing={1.5} sx={{ p: 1.25, minHeight: touchMin }}>
                      <Avatar
                        sx={{
                          width: 40,
                          height: 40,
                          fontSize: 13,
                          fontWeight: 700,
                          bgcolor: avatarBg,
                          color: avatarFg,
                        }}
                      >
                        {initials}
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.1 }} noWrap>
                          {c.name}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          noWrap
                          title={`Resp.: ${c.guardianName} · ${formatPhone(c.guardianPhone)}`}
                        >
                          Resp.: {c.guardianName} · {formatPhone(c.guardianPhone)}
                        </Typography>
                      </Box>
                      <Stack direction="row" spacing={0.75} sx={{ ml: 0.5 }}>
                        {c.birthDate && (
                          <Chip
                            size="small"
                            label={`Nasc.: ${fmtDate(c.birthDate)}`}
                            color="default"
                            variant="outlined"
                            sx={{ borderRadius: 999, height: 22, ".MuiChip-label": { px: 1, fontSize: 12 } }}
                          />
                        )}
                        {c.joinedAt && (
                          <Chip
                            size="small"
                            color="secondary"
                            label={`Desde ${fmtDate(c.joinedAt)}`}
                            sx={{ borderRadius: 999, height: 22, ".MuiChip-label": { px: 1, fontSize: 12 } }}
                          />
                        )}
                      </Stack>
                    </Stack>
                  )}
                </CardActionArea>
              </Card>
            );
          })}
        </Stack>
      </Box>

      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Tooltip title="Recarregar">
          <IconButton onClick={() => fetchChildren()}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
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
