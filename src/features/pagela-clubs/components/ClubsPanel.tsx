import React from "react";
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
} from "@mui/material";
import PaginationItem from "@mui/material/PaginationItem";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import RefreshIcon from "@mui/icons-material/Refresh";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { useTheme, alpha } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

import type { ClubResponse } from "@/features/clubs/types";
import { EmptyState } from "./common/EmptyState";
import {
    CLUBS_EMPTY_MESSAGE,
    CLUBS_PAGE_LIMIT,
    TOUCH_TARGET_DESKTOP,
    TOUCH_TARGET_MOBILE,
} from "../constants";
import { useClubsBrowser } from "../hooks";
import { formatClubLocation, formatMeetingDay } from "../utils";
import type { PagelaViewerScope } from "../types";

type Props = {
    onSelect: (club: ClubResponse) => void;
    selectedId: string | null;
    /** Muda apenas o texto: quem filtra a lista é a API. */
    scope: PagelaViewerScope;
};

export function ClubsPanel({ onSelect, selectedId, scope }: Props) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const touchMin = isMobile ? TOUCH_TARGET_MOBILE : TOUCH_TARGET_DESKTOP;

    const {
        rows,
        total,
        page,
        setPage,
        search,
        setSearch,
        loading,
        error,
        reload,
    } = useClubsBrowser();

    const limit = CLUBS_PAGE_LIMIT;

    return (
        <Stack sx={{ height: "100%" }} spacing={2}>
            <TextField
                size="small"
                placeholder="Endereço / nº do clubinho.."
                value={search}
                onChange={(e) => {
                    setSearch(e.target.value);
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
                        <EmptyState title="Nenhum clubinho encontrado" subtitle={CLUBS_EMPTY_MESSAGE[scope]} />
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
                                                        {formatMeetingDay(c.weekday)}
                                                    </Typography>
                                                    <Chip
                                                        size="small"
                                                        label={`Prof.: ${c.teachers?.length ?? 0}`}
                                                        color="secondary"
                                                        variant="outlined"
                                                        sx={{ borderRadius: 999, height: 22, ".MuiChip-label": { px: 1, fontSize: 12 }, flexShrink: 0 }}
                                                    />
                                                </Stack>

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

                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                    noWrap
                                                    sx={{ opacity: 0.9 }}
                                                    title={formatClubLocation(c.address)}
                                                >
                                                    {formatClubLocation(c.address)}
                                                </Typography>
                                            </Stack>
                                        ) : (
                                            <Stack spacing={0.75} sx={{ p: 1.25 }}>
                                                
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
                                                        {formatMeetingDay(c.weekday)}
                                                    </Typography>
                                                    <Chip
                                                        size="small"
                                                        label={`Prof.: ${c.teachers?.length ?? 0}`}
                                                        color="secondary"
                                                        variant="outlined"
                                                        sx={{ borderRadius: 999, height: 22, ".MuiChip-label": { px: 1, fontSize: 12 }, flexShrink: 0 }}
                                                    />
                                                </Stack>

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

                                                        <Typography
                                                            variant="body2"
                                                            color="text.secondary"
                                                            noWrap
                                                    sx={{ opacity: 0.9 }}
                                                    title={formatClubLocation(c.address)}
                                                        >
                                                    {formatClubLocation(c.address)}
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
                    <IconButton onClick={reload} size={isMobile ? "small" : "medium"}>
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
