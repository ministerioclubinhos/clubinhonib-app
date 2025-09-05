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
    const [limit] = useState(12);
    const [rows, setRows] = useState<ClubResponseDto[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>("");

    const sort = useMemo<ClubSort>(() => ({ id: "updatedAt", desc: true }), []);
    const filters: ClubFilters = useMemo(
        () => ({
            addressSearchString: dq || undefined,
            clubSearchString: dq || undefined,
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
            {/* Busca */}
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

            {/* Lista */}
            <Box sx={{ flex: 1, overflow: "auto", pr: 1 }}>
                <Stack spacing={1}>
                    {loading &&
                        Array.from({ length: 6 }).map((_, i) => (
                            <Skeleton key={i} variant="rounded" height={72} />
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

                            const shown = teacherNames.slice(0, isMobile ? 2 : 3);
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
                                        "&:hover": {
                                            backgroundColor: alpha(theme.palette.primary.main, 0.04),
                                        },
                                    }}
                                >
                                    <CardActionArea onClick={() => onSelect(c)}>
                                        {isMobile ? (
                                            <Stack spacing={0.75} sx={{ p: 1.25, minHeight: touchMin }}>
                                                <Stack direction="row" alignItems="center" justifyContent="space-between">
                                                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                                        Clubinho #{c.number}
                                                    </Typography>
                                                    <Chip
                                                        size="small"
                                                        label={diaDe(c.weekday)}
                                                        color="info"
                                                        variant="outlined"
                                                        sx={{ borderRadius: 999, height: 22, ".MuiChip-label": { px: 1, fontSize: 12 } }}
                                                    />
                                                </Stack>

                                                <Stack direction="row" spacing={0.75} sx={{ flexWrap: "wrap" }}>
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
                                                            {shown.map((name, idx) => (
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
                                                </Stack>

                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                    noWrap
                                                    title={`${c.address?.street ?? ""}${c.address?.district ? `, ${c.address?.district}` : ""}`}
                                                >
                                                    {(c.address?.street ?? "Rua não informada")},{" "}
                                                    {c.address?.district ?? "Bairro não informado"}
                                                </Typography>
                                            </Stack>
                                        ) : (
                                            <>
                                                <Stack direction="row" alignItems="center" spacing={1.5} sx={{ p: 1.25, minHeight: touchMin }}>
                                                    <Avatar
                                                        sx={{
                                                            bgcolor: alpha(theme.palette.primary.main, 0.12),
                                                            color: theme.palette.primary.main,
                                                            width: 40,
                                                            height: 40,
                                                            fontSize: 13,
                                                            fontWeight: 700,
                                                        }}
                                                    >
                                                        #{c.number}
                                                    </Avatar>

                                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                                        <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.1 }} noWrap>
                                                            {WEEKDAY_PT[c.weekday as Weekday]} · #{c.number}
                                                        </Typography>

                                                        <Stack direction="row" spacing={0.75} sx={{ mt: 0.5, flexWrap: "wrap" }}>
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
                                                                    {shown.map((name, idx) => (
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
                                                        </Stack>

                                                        <Typography
                                                            variant="body2"
                                                            color="text.secondary"
                                                            noWrap
                                                            sx={{ opacity: 0.9, mt: 0.5 }}
                                                            title={`${c.address?.street}, ${c.address?.district} – ${c.address?.city}/${c.address?.state}`}
                                                        >
                                                            {c.address?.street}, {c.address?.district} – {c.address?.city}/{c.address?.state}
                                                        </Typography>
                                                    </Box>

                                                    <Stack direction="row" spacing={0.75} sx={{ alignItems: "center", ml: 0.5 }}>
                                                        <Chip
                                                            size="small"
                                                            label={`Prof.: ${c.teachers?.length ?? 0}`}
                                                            color="secondary"
                                                            variant="outlined"
                                                            sx={{ borderRadius: 999, height: 22, ".MuiChip-label": { px: 1, fontSize: 12 } }}
                                                        />
                                                        <Chip
                                                            size="small"
                                                            color={c.coordinator ? "success" : "default"}
                                                            label={c.coordinator ? "Coord." : "Sem Coord."}
                                                            variant={c.coordinator ? "filled" : "outlined"}
                                                            sx={{ borderRadius: 999, height: 22, ".MuiChip-label": { px: 1, fontSize: 12 } }}
                                                        />
                                                    </Stack>
                                                </Stack>

                                                <Divider sx={{ mx: 1.25 }} />
                                                <Typography
                                                    variant="caption"
                                                    sx={{ p: 1, pt: 0.75, display: "block", color: "text.secondary" }}
                                                >
                                                    Atualizado em {new Date(c.updatedAt).toLocaleDateString("pt-BR")}
                                                </Typography>
                                            </>
                                        )}
                                    </CardActionArea>
                                </Card>
                            );
                        })}
                </Stack>
            </Box>

            <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Tooltip title="Recarregar">
                    <IconButton onClick={() => fetchClubs()}>
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
