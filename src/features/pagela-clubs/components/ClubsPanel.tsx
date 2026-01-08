import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    Box,
    Stack,
    TextField,
    InputAdornment,
    IconButton,
    Skeleton,
    Alert,
    Card,
    CardActionArea,
    Avatar,
    Typography,
    Chip,
    Tooltip,
    Pagination,
    Divider,
} from "@mui/material";
import PaginationItem from "@mui/material/PaginationItem";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import RefreshIcon from "@mui/icons-material/Refresh";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { useTheme, alpha } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

import { apiFetchClubs } from "@/features/clubs/api";
import type { ClubResponseDto, ClubFilters, ClubSort, Weekday } from "@/features/clubs/types";
import { EmptyState } from "./common/EmptyState";
import { WEEKDAY_PT, useDebounced } from "../utils";

export function ClubsPanel({
    onSelect,
    selectedId,
}: {
    onSelect: (club: ClubResponseDto) => void;
    selectedId: string | null;
}) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const touchMin = isMobile ? 56 : 48;

    const [search, setSearch] = useState("");
    const dq = useDebounced(search);

    const [page, setPage] = useState(1);
    const [limit] = useState(6);
    const [rows, setRows] = useState<ClubResponseDto[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>("");

    const sort = useMemo<ClubSort>(() => ({ id: "updatedAt", desc: true }), []);
    const filters: ClubFilters = useMemo(
        () => ({
            searchString: dq || undefined,
        }),
        [dq]
    );

    const lastKeyRef = useRef<string>("");
    const abortRef = useRef<AbortController | null>(null);

    const fetchClubs = useCallback(async () => {
        const key = JSON.stringify({ page, limit, filters, sort });
        if (key === lastKeyRef.current) return;
        lastKeyRef.current = key;

        abortRef.current?.abort();
        const ctrl = new AbortController();
        abortRef.current = ctrl;

        setLoading(true);
        setError("");
        try {
            const data = await apiFetchClubs({ page, limit, filters, sort });
            setRows(Array.isArray(data?.data) ? data.data : []);
            setTotal(Number(data?.total ?? 0));
        } catch (e: any) {
            if (e?.name !== "CanceledError" && e?.name !== "AbortError") {
                setError(e?.response?.data?.message || e?.message || "Erro ao listar clubinhos");
            }
        } finally {
            if (abortRef.current === ctrl) abortRef.current = null;
            setLoading(false);
        }
    }, [page, limit, filters, sort]);

    useEffect(() => {
        fetchClubs();
        return () => abortRef.current?.abort();
    }, [fetchClubs]);

    const weekdayLong = (w: Weekday | undefined) => (w ? WEEKDAY_PT[w] : "-");
    const diaDe = (w: Weekday | undefined) => (w ? `Dia de ${weekdayLong(w)}` : "Dia não informado");

    return (
        <Stack sx={{ height: "100%" }} spacing={2}>
            <TextField
                size="small"
                placeholder="Endereço / nº do clubinho.."
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
                            <Skeleton key={i} variant="rounded" height={touchMin + 88} />
                        ))}

                    {!loading && error && <Alert severity="error">{error}</Alert>}

                    {!loading && !error && rows.length === 0 && (
                        <EmptyState title="Nenhum clubinho encontrado" subtitle="Ajuste a busca ou cadastre um novo." />
                    )}

                    {!loading &&
                        !error &&
                        rows.map((c) => {
                            const teacherNames = (c.teachers ?? [])
                                .map((t) => t.user?.name || t.user?.email || "Prof.")
                                .filter(Boolean);

                            const shown = teacherNames.slice(0, 2);
                            const extra = Math.max(0, teacherNames.length - shown.length);
                            const selected = selectedId === c.id;

                            return (
                                <Card
                                    key={c.id}
                                    variant={selected ? "elevation" : "outlined"}
                                    sx={{
                                        borderRadius: 2,
                                        borderColor: selected ? "primary.main" : "divider",
                                        backgroundColor: selected ? alpha(theme.palette.primary.main, 0.06) : "background.paper",
                                        transition: "background-color .2s, border-color .2s",
                                        minHeight: isMobile ? touchMin : touchMin + 16,
                                        height: isMobile ? "auto" : touchMin + 88,
                                        "&:hover": {
                                            backgroundColor: alpha(theme.palette.primary.main, 0.04),
                                        },
                                    }}
                                >
                                    <CardActionArea onClick={() => onSelect(c)}>
                                        {isMobile ? (
                                            <Stack spacing={0.75} sx={{ p: 1.25 }}>
                                                {/* Primeira linha: Avatar, dia da semana, quantidade de professores */}
                                                <Stack direction="row" alignItems="center" spacing={1.5}>
                                                    <Avatar
                                                        sx={{
                                                            bgcolor: alpha(theme.palette.primary.main, 0.12),
                                                            color: theme.palette.primary.main,
                                                            width: 40,
                                                            height: 40,
                                                            fontSize: 13,
                                                            fontWeight: 700,
                                                            flexShrink: 0,
                                                        }}
                                                    >
                                                        #{c.number}
                                                    </Avatar>
                                                    <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.1, flex: 1 }}>
                                                        {WEEKDAY_PT[c.weekday as Weekday]}
                                                    </Typography>
                                                    <Chip
                                                        size="small"
                                                        label={`Prof.: ${c.teachers?.length ?? 0}`}
                                                        color="secondary"
                                                        variant="outlined"
                                                        sx={{ borderRadius: 999, height: 22, ".MuiChip-label": { px: 1, fontSize: 12 }, flexShrink: 0 }}
                                                    />
                                                </Stack>

                                                {/* Segunda linha: Nome do coordenador */}
                                                {c.coordinator?.user?.name && (
                                                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                                                        <Chip
                                                            size="small"
                                                            color="success"
                                                            label="Coord."
                                                            variant="filled"
                                                            sx={{ borderRadius: 999, height: 22, ".MuiChip-label": { px: 1, fontSize: 12, fontWeight: 700 } }}
                                                        />
                                                        <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.success.main }}>
                                                            {c.coordinator.user.name}
                                                        </Typography>
                                                    </Box>
                                                )}

                                                {/* Terceira linha: 2 primeiros professores e "+n" */}
                                                <Box
                                                    sx={{
                                                        display: "flex",
                                                        flexWrap: "wrap",
                                                        gap: 0.75,
                                                    }}
                                                >
                                                    {shown.length === 0 ? (
                                                        <Chip
                                                            size="small"
                                                            variant="outlined"
                                                            color="warning"
                                                            label="Sem professores"
                                                            sx={{ borderRadius: 999, height: 22, ".MuiChip-label": { px: 1, fontSize: 12 } }}
                                                        />
                                                    ) : (
                                                        <>
                                                            {shown.slice(0, 2).map((name, idx) => (
                                                                <Chip
                                                                    key={idx}
                                                                    size="small"
                                                                    color="secondary"
                                                                    label={name}
                                                                    variant="outlined"
                                                                    sx={{ borderRadius: 999, height: 22, ".MuiChip-label": { px: 1, fontSize: 12 } }}
                                                                />
                                                            ))}
                                                            {extra > 0 && (
                                                                <Chip
                                                                    size="small"
                                                                    color="primary"
                                                                    label={`+${extra}`}
                                                                    sx={{ borderRadius: 999, height: 22, ".MuiChip-label": { px: 1, fontSize: 12 } }}
                                                                />
                                                            )}
                                                        </>
                                                    )}
                                                </Box>

                                                {/* Quarta linha: Endereço (cidade e bairro) */}
                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                    noWrap
                                                    sx={{ opacity: 0.9 }}
                                                    title={`${c.address?.district ?? ""} – ${c.address?.city ?? ""}/${c.address?.state ?? ""}`}
                                                >
                                                    {c.address?.district ?? "Bairro não informado"} – {c.address?.city ?? "Cidade não informada"}/{c.address?.state ?? "Estado não informado"}
                                                </Typography>
                                            </Stack>
                                        ) : (
                                            <Stack spacing={0.75} sx={{ p: 1.25 }}>
                                                {/* Primeira linha: Avatar, dia da semana, quantidade de professores */}
                                                <Stack direction="row" alignItems="center" spacing={1.5}>
                                                    <Avatar
                                                        sx={{
                                                            bgcolor: alpha(theme.palette.primary.main, 0.12),
                                                            color: theme.palette.primary.main,
                                                            width: 40,
                                                            height: 40,
                                                            fontSize: 13,
                                                            fontWeight: 700,
                                                            flexShrink: 0,
                                                        }}
                                                    >
                                                        #{c.number}
                                                    </Avatar>
                                                    <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.1, flex: 1 }}>
                                                        {WEEKDAY_PT[c.weekday as Weekday]}
                                                    </Typography>
                                                    <Chip
                                                        size="small"
                                                        label={`Prof.: ${c.teachers?.length ?? 0}`}
                                                        color="secondary"
                                                        variant="outlined"
                                                        sx={{ borderRadius: 999, height: 22, ".MuiChip-label": { px: 1, fontSize: 12 }, flexShrink: 0 }}
                                                    />
                                                </Stack>

                                                {/* Segunda linha: Nome do coordenador */}
                                                {c.coordinator?.user?.name && (
                                                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                                                        <Chip
                                                            size="small"
                                                            color="success"
                                                            label="Coord."
                                                            variant="filled"
                                                            sx={{ borderRadius: 999, height: 22, ".MuiChip-label": { px: 1, fontSize: 12, fontWeight: 700 } }}
                                                        />
                                                        <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.success.main }}>
                                                            {c.coordinator.user.name}
                                                        </Typography>
                                                    </Box>
                                                )}

                                                {/* Terceira linha: 2 primeiros professores e "+n" */}
                                                <Box
                                                    sx={{
                                                        display: "flex",
                                                        flexWrap: "wrap",
                                                        gap: 0.75,
                                                    }}
                                                >
                                                            {shown.length === 0 ? (
                                                                <Chip
                                                                    size="small"
                                                                    variant="outlined"
                                                                    color="warning"
                                                                    label="Sem professores"
                                                                    sx={{ borderRadius: 999, height: 22, ".MuiChip-label": { px: 1, fontSize: 12 } }}
                                                                />
                                                            ) : (
                                                                <>
                                                            {shown.slice(0, 2).map((name, idx) => (
                                                                        <Chip
                                                                            key={idx}
                                                                            size="small"
                                                                            color="secondary"
                                                                            label={name}
                                                                            variant="outlined"
                                                                            sx={{ borderRadius: 999, height: 22, ".MuiChip-label": { px: 1, fontSize: 12 } }}
                                                                        />
                                                                    ))}
                                                                    {extra > 0 && (
                                                                        <Chip
                                                                            size="small"
                                                                            color="primary"
                                                                            label={`+${extra}`}
                                                                            sx={{ borderRadius: 999, height: 22, ".MuiChip-label": { px: 1, fontSize: 12 } }}
                                                                        />
                                                                    )}
                                                                </>
                                                            )}
                                                </Box>

                                                {/* Quarta linha: Endereço (cidade e bairro) */}
                                                        <Typography
                                                            variant="body2"
                                                            color="text.secondary"
                                                            noWrap
                                                    sx={{ opacity: 0.9 }}
                                                    title={`${c.address?.district} – ${c.address?.city}/${c.address?.state}`}
                                                        >
                                                    {c.address?.district} – {c.address?.city}/{c.address?.state}
                                                </Typography>
                                            </Stack>
                                        )}
                                    </CardActionArea>
                                </Card>
                            );
                        })}
                </Stack>
            </Box>

            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ flexWrap: "wrap", gap: 1 }}>
                <Tooltip title="Recarregar">
                    <IconButton onClick={() => fetchClubs()} size={isMobile ? "small" : "medium"}>
                        <RefreshIcon />
                    </IconButton>
                </Tooltip>
                <Pagination
                    size={isMobile ? "small" : "small"}
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
