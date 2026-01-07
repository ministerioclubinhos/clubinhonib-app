import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Box,
  Stack,
  Typography,
  Chip,
  Skeleton,
  Alert,
  Card,
  CardContent,
  Avatar,
  Divider,
  Pagination,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
} from '@mui/material';
import PaginationItem from '@mui/material/PaginationItem';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import BookmarksIcon from '@mui/icons-material/Bookmarks';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { useTheme, alpha } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

import type { ChildResponseDto } from '@/features/children/types';
import { apiListPagelasPaginated } from '@/features/pagela-teacher/api';
import type { Pagela } from '@/features/pagela-teacher/types';
import { EmptyState } from './common/EmptyState';
import { PlaceholderCard } from './common/PlaceholderCard';
import { fmtDate, useDebounced } from '../utils';

export function PagelasPanel({ child }: { child: ChildResponseDto | null }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const touchMin = isMobile ? 56 : 48;

  const [rows, setRows] = useState<Pagela[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(9);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [search, setSearch] = useState('');

  const hasFetchedRef = useRef<Record<string, boolean>>({});
  const lastKeyRef = useRef<string>('');
  const abortRef = useRef<AbortController | null>(null);

  const childId = child?.id ?? null;
  const dq = useDebounced(search);

  const query = useMemo(() => {
    if (!childId) return null;
    return {
      childId,
      page,
      limit,
      searchString: dq || undefined,
    };
  }, [childId, page, limit, dq]);

  const fetchPagelas = useCallback(async () => {
    if (!query) return;

    const key = JSON.stringify(query);
    if (key === lastKeyRef.current) return;
    lastKeyRef.current = key;

    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    setLoading(true);
    setError('');
    try {
      const data = await apiListPagelasPaginated(query, { signal: ctrl.signal });
      setRows(Array.isArray(data?.items) ? data.items : []);
      setTotal(Number(data?.total ?? 0));
      hasFetchedRef.current[query.childId] = true;
    } catch (e: any) {
      if (e?.name !== 'CanceledError' && e?.name !== 'AbortError') {
        setError(e?.response?.data?.message || e?.message || 'Erro ao listar pagelas');
      }
    } finally {
      if (abortRef.current === ctrl) abortRef.current = null;
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    setPage(1);
    lastKeyRef.current = '';
  }, [childId, dq]);

  useEffect(() => {
    fetchPagelas();
    return () => abortRef.current?.abort();
  }, [fetchPagelas]);

  if (!childId) {
    return (
      <PlaceholderCard
        title="Escolha uma criança"
        subtitle="Clique em uma criança para ver suas pagelas."
      />
    );
  }

  const hasFetched = !!hasFetchedRef.current[childId];

  const getPagelaStatus = (p: Pagela) => {
    if (!p.present) return 'absent';
    if (p.present && p.didMeditation && p.recitedVerse) return 'complete';
    return 'partial';
  };

  const getStatusColor = (status: 'complete' | 'partial' | 'absent') => {
    switch (status) {
      case 'complete':
        return {
          border: theme.palette.success.main,
          bg: alpha(theme.palette.success.main, 0.08),
          avatar: alpha(theme.palette.success.main, 0.15),
          avatarColor: theme.palette.success.main,
        };
      case 'partial':
        return {
          border: theme.palette.warning.main,
          bg: alpha(theme.palette.warning.main, 0.08),
          avatar: alpha(theme.palette.warning.main, 0.15),
          avatarColor: theme.palette.warning.main,
        };
      default:
        return {
          border: '#d32f2f',
          bg: alpha('#d32f2f', 0.1),
          avatar: alpha('#d32f2f', 0.2),
          avatarColor: '#d32f2f',
        };
    }
  };

  return (
    <Stack sx={{ height: '100%' }} spacing={2}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
        <Chip label={`Total: ${total}`} color="info" variant="outlined" />
        <Chip
          label={`Clubinho #${child?.club?.number ?? '-'}`}
          color="secondary"
          variant="outlined"
        />
      </Box>

      <TextField
        size="small"
        placeholder="Semana e ano (ex: 2025, 48 ou 2025-48)"
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
                <IconButton aria-label="limpar" onClick={() => setSearch('')} size="small">
                  <ClearIcon />
                </IconButton>
              )}
            </InputAdornment>
          ),
        }}
      />

      <Box sx={{ flex: 1, overflow: 'auto', pr: 1 }}>
        <Stack spacing={1}>
          {loading &&
            Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} variant="rounded" height={touchMin + 16} />
            ))}
          {!loading && error && <Alert severity="error">{error}</Alert>}

          {!loading && !error && hasFetched && rows.length === 0 && (
            <EmptyState title="Sem pagelas" subtitle="Crie a primeira pagela desta criança." />
          )}

          {!loading &&
            !error &&
            rows.length > 0 &&
            rows.map((p) => {
              const status = getPagelaStatus(p);
              const colors = getStatusColor(status);
              return (
                <Card
                  key={p.id}
                  variant="outlined"
                  sx={{
                    borderRadius: 2,
                    borderColor: colors.border,
                    backgroundColor: colors.bg,
                    height: isMobile ? 'auto' : touchMin + 32,
                  }}
                >
                  <CardContent
                    sx={{
                      p: 1.25,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      minHeight: 0,
                    }}
                  >
                    {isMobile ? (
                      <Stack spacing={1}>
                        <Stack
                          direction="row"
                          alignItems="center"
                          justifyContent="space-between"
                          sx={{ minHeight: touchMin }}
                        >
                          <Avatar
                            sx={{
                              width: 40,
                              height: 40,
                              bgcolor: colors.avatar,
                              color: colors.avatarColor,
                              flexShrink: 0,
                            }}
                          >
                            <BookmarksIcon />
                          </Avatar>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.1 }}>
                            Semana {p.week} · {p.year}
                          </Typography>
                        </Stack>

                        <Stack direction="row" spacing={0.75}>
                          <Chip
                            size="small"
                            color={p.present ? 'success' : 'default'}
                            label={p.present ? 'Presente' : 'Ausente'}
                            variant={p.present ? 'filled' : 'outlined'}
                            sx={{
                              borderRadius: 999,
                              height: 22,
                              '.MuiChip-label': { px: 1, fontSize: 12 },
                            }}
                          />
                          <Chip
                            size="small"
                            color={p.didMeditation ? 'info' : 'default'}
                            label={p.didMeditation ? 'Meditação' : 'Sem Med.'}
                            variant={p.didMeditation ? 'filled' : 'outlined'}
                            sx={{
                              borderRadius: 999,
                              height: 22,
                              '.MuiChip-label': { px: 1, fontSize: 12 },
                            }}
                          />
                          <Chip
                            size="small"
                            color={p.recitedVerse ? 'secondary' : 'default'}
                            label={p.recitedVerse ? 'Verso' : 'Sem Verso'}
                            variant={p.recitedVerse ? 'filled' : 'outlined'}
                            sx={{
                              borderRadius: 999,
                              height: 22,
                              '.MuiChip-label': { px: 1, fontSize: 12 },
                            }}
                          />
                        </Stack>

                        {p.notes && p.notes.trim() !== '' && (
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
                          <Stack
                            direction="row"
                            spacing={1.25}
                            alignItems="center"
                            sx={{ minWidth: 0, flex: 1 }}
                          >
                            <Avatar
                              sx={{
                                width: 40,
                                height: 40,
                                bgcolor: colors.avatar,
                                color: colors.avatarColor,
                                flexShrink: 0,
                              }}
                            >
                              <BookmarksIcon />
                            </Avatar>
                            <Box sx={{ minWidth: 0 }}>
                              <Typography
                                variant="subtitle1"
                                sx={{ fontWeight: 600, lineHeight: 1.1 }}
                                noWrap
                              >
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
                              color={p.present ? 'success' : 'default'}
                              label={p.present ? 'Presente' : 'Ausente'}
                              variant={p.present ? 'filled' : 'outlined'}
                              sx={{
                                borderRadius: 999,
                                height: 22,
                                '.MuiChip-label': { px: 1, fontSize: 12 },
                              }}
                            />
                            <Chip
                              size="small"
                              color={p.didMeditation ? 'info' : 'default'}
                              label={p.didMeditation ? 'Meditação' : 'Sem Med.'}
                              variant={p.didMeditation ? 'filled' : 'outlined'}
                              sx={{
                                borderRadius: 999,
                                height: 22,
                                '.MuiChip-label': { px: 1, fontSize: 12 },
                              }}
                            />
                            <Chip
                              size="small"
                              color={p.recitedVerse ? 'secondary' : 'default'}
                              label={p.recitedVerse ? 'Verso' : 'Sem Verso'}
                              variant={p.recitedVerse ? 'filled' : 'outlined'}
                              sx={{
                                borderRadius: 999,
                                height: 22,
                                '.MuiChip-label': { px: 1, fontSize: 12 },
                              }}
                            />
                          </Stack>
                        </Stack>
                        {p.notes && p.notes.trim() !== '' && (
                          <Tooltip title={p.notes} arrow>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                mt: 0.5,
                                fontSize: '0.75rem',
                                lineHeight: 1.2,
                                display: '-webkit-box',
                                WebkitLineClamp: 1,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
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

      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ flexWrap: 'wrap', gap: 1 }}
      >
        <Stack direction="row" spacing={1} alignItems="center" sx={{ flexShrink: 0 }}>
          <Tooltip title="- por página">
            <IconButton
              onClick={() => setLimit((l) => Math.max(6, l - 6))}
              size={isMobile ? 'small' : 'medium'}
            >
              <ChevronLeftIcon />
            </IconButton>
          </Tooltip>
          <Typography variant="body2" sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}>
            {limit}/pág.
          </Typography>
          <Tooltip title="+ por página">
            <IconButton
              onClick={() => setLimit((l) => Math.min(48, l + 6))}
              size={isMobile ? 'small' : 'medium'}
            >
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
