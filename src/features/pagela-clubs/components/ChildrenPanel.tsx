import React from "react";
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

import type { ChildResponse } from "@/features/children/types";
import type { ClubResponse } from "@/features/clubs/types";
import { EmptyState } from "./common/EmptyState";
import { PlaceholderCard } from "./common/PlaceholderCard";
import {
  CHILDREN_PAGE_LIMIT,
  TOUCH_TARGET_DESKTOP,
  TOUCH_TARGET_MOBILE,
} from "../constants";
import { useChildrenBrowser } from "../hooks";
import { formatDate, formatPhone, initialsFromName } from "../utils";

type Props = {
  club: ClubResponse | null;
  onSelect: (child: ChildResponse) => void;
  selectedId: string | null;
};

export function ChildrenPanel({ club, onSelect, selectedId }: Props) {
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
  } = useChildrenBrowser(club);

  const limit = CHILDREN_PAGE_LIMIT;

  if (!club) {
    return <PlaceholderCard title="Escolha um Clubinho" subtitle="Clique em um Clubinho para ver suas crianças." />;
  }

  return (
    <Stack sx={{ height: "100%" }} spacing={2}>
      <TextField
        size="small"
        placeholder="Buscar por nome, responsável, telefone..."
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
              <Skeleton key={i} variant="rounded" height={touchMin + 16} />
            ))}

          {!loading && error && <Alert severity="error">{error}</Alert>}

          {!loading && !error && rows.length === 0 && (
            <EmptyState title="Sem crianças neste Clubinho" subtitle="Cadastre crianças ou escolha outro Clubinho." />
          )}

          {!loading && !error && rows.map((c) => {
            const initials = initialsFromName(c.name);
            const nasc = c.birthDate ? formatDate(c.birthDate) : null;
            const desde = c.joinedAt ? formatDate(c.joinedAt) : null;
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
                  height: isMobile ? "auto" : touchMin + 16,
                  "&:hover": { backgroundColor: alpha(theme.palette.secondary.main, 0.04) },
                }}
              >
                <CardActionArea onClick={() => onSelect(c)}>
                  {isMobile ? (
                    <Stack spacing={0.75} sx={{ p: 1.25, minHeight: touchMin }}>
                      <Stack direction="row" alignItems="center" spacing={1.5}>
                        <Avatar
                          sx={{
                            width: 40,
                            height: 40,
                            fontSize: 13,
                            fontWeight: 700,
                            bgcolor: avatarBg,
                            color: avatarFg,
                            flexShrink: 0,
                          }}
                        >
                          {initials}
                        </Avatar>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.1, flex: 1 }}>
                          {c.name}
                        </Typography>
                      </Stack>

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
                    <Stack direction="row" alignItems="center" spacing={1.5} sx={{ p: 1.25, height: "100%" }}>
                      <Avatar
                        sx={{
                          width: 40,
                          height: 40,
                          fontSize: 13,
                          fontWeight: 700,
                          bgcolor: avatarBg,
                          color: avatarFg,
                          flexShrink: 0,
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
                      <Stack direction="row" spacing={0.75} sx={{ ml: 0.5, flexShrink: 0 }}>
                        {c.birthDate && (
                          <Chip
                            size="small"
                            label={`Nasc.: ${formatDate(c.birthDate)}`}
                            color="default"
                            variant="outlined"
                            sx={{ borderRadius: 999, height: 22, ".MuiChip-label": { px: 1, fontSize: 12 } }}
                          />
                        )}
                        {c.joinedAt && (
                          <Chip
                            size="small"
                            color="secondary"
                            label={`Desde ${formatDate(c.joinedAt)}`}
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

      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ flexWrap: "wrap", gap: 1 }}>
        <Tooltip title="Recarregar">
          <IconButton onClick={reload} size={isMobile ? "small" : "medium"}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
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
