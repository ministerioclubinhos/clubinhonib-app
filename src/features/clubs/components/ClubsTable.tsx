import React, { useMemo } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Divider,
  Typography,
  Chip,
  Box,
  useTheme,
  useMediaQuery,
  TablePagination,
} from '@mui/material';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { Visibility, Edit, Delete, AccessTime, ToggleOn, ToggleOff } from '@mui/icons-material';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { ClubResponseDto, WEEKDAYS } from '../types';
import { fmtDate } from '@/utils/dates';
import ClubsCards from './ClubsCards';

type Props = {
  isAdmin: boolean;
  rows: ClubResponseDto[];
  total: number;
  pageIndex: number;
  pageSize: number;
  setPageIndex: (n: number) => void;
  setPageSize: (n: number) => void;
  sorting: SortingState;
  setSorting: (s: SortingState) => void;
  onOpenView: (club: ClubResponseDto) => void;
  onStartEdit: (club: ClubResponseDto) => void;
  onAskDelete: (club: ClubResponseDto) => void;
  onToggleActive: (club: ClubResponseDto) => void;
};

export default function ClubsTable(props: Props) {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down('sm'), { noSsr: true });
  return isXs ? <ClubsCards {...props} /> : <ClubsTableDesktop {...props} />;
}

function ClubsTableDesktop(props: Props) {
  const {
    isAdmin,
    rows,
    total,
    pageIndex,
    pageSize,
    setPageIndex,
    setPageSize,
    sorting,
    setSorting,
    onOpenView,
    onStartEdit,
    onAskDelete,
    onToggleActive,
  } = props;

  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down('sm'));
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));

  const columns = useMemo<ColumnDef<ClubResponseDto>[]>(() => {
    const base: ColumnDef<ClubResponseDto>[] = [
      {
        accessorKey: 'number',
        header: 'Nº',
        cell: ({ getValue }) => <Typography fontWeight={700}>{String(getValue())}</Typography>,
        meta: { width: 80 },
      },
      {
        accessorKey: 'weekday',
        header: 'Dia da semana',
        cell: ({ getValue }) => {
          const v = String(getValue() ?? '');
          const label = WEEKDAYS.find((w) => w.value === v)?.label ?? v;
          return <Typography>{label}</Typography>;
        },
        meta: { width: 150 },
      },
      {
        accessorKey: 'time',
        header: 'Horário',
        cell: ({ row }) => {
          const t = row.original.time;
          return (
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
              <AccessTime fontSize="inherit" sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography>{t || '—'}</Typography>
            </Box>
          );
        },
        meta: { width: 120 },
      },
      {
        id: 'coordinator',
        header: 'Coordenador',
        cell: ({ row }) => {
          const c = row.original.coordinator;
          const label = c?.user?.name || c?.user?.email || '—';
          return <Typography noWrap>{label}</Typography>;
        },
        meta: { width: 240 },
      },
      {
        id: 'teachers',
        header: 'Professores',
        cell: ({ row }) => {
          const list = row.original.teachers ?? [];
          if (!list.length) return <Chip label="Nenhum" size="small" />;
          return (
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
              {list.map((t) => (
                <Chip
                  key={t.id}
                  size="small"
                  label={t.user?.name || t.user?.email || t.id}
                  variant="outlined"
                />
              ))}
            </Box>
          );
        },
      },
      {
        accessorKey: 'isActive',
        header: 'Status',
        cell: ({ getValue }) => {
          const active = getValue() as boolean;
          return (
            <Chip
              size="small"
              label={active ? 'Ativo' : 'Inativo'}
              color={active ? 'success' : 'default'}
              variant={active ? 'filled' : 'outlined'}
            />
          );
        },
        meta: { width: 100 },
      },
      ...(isMdUp
        ? ([
            {
              accessorKey: 'createdAt',
              header: 'Criado em',
              cell: ({ getValue }) => <>{fmtDate(getValue() as string)}</>,
              meta: { width: 170 },
            },
            {
              accessorKey: 'updatedAt',
              header: 'Atualizado em',
              cell: ({ getValue }) => <>{fmtDate(getValue() as string)}</>,
              meta: { width: 170 },
            },
          ] as ColumnDef<ClubResponseDto>[])
        : []),
      {
        id: 'actions',
        header: 'Ações',
        enableSorting: false,
        cell: ({ row }) => (
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Tooltip title="Detalhes">
              <IconButton size={isXs ? 'small' : 'medium'} onClick={() => onOpenView(row.original)}>
                <Visibility fontSize="inherit" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Editar">
              <IconButton
                size={isXs ? 'small' : 'medium'}
                onClick={() => onStartEdit(row.original)}
              >
                <Edit fontSize="inherit" />
              </IconButton>
            </Tooltip>
            {isAdmin && (
              <>
                <Tooltip title={row.original.isActive ? 'Desativar' : 'Ativar'}>
                  <IconButton
                    size={isXs ? 'small' : 'medium'}
                    color={row.original.isActive ? 'success' : 'default'}
                    onClick={() => onToggleActive(row.original)}
                  >
                    {row.original.isActive ? (
                      <ToggleOn fontSize="inherit" />
                    ) : (
                      <ToggleOff fontSize="inherit" />
                    )}
                  </IconButton>
                </Tooltip>
                <Tooltip title="Excluir">
                  <IconButton
                    size={isXs ? 'small' : 'medium'}
                    color="error"
                    onClick={() => onAskDelete(row.original)}
                  >
                    <Delete fontSize="inherit" />
                  </IconButton>
                </Tooltip>
              </>
            )}
          </Box>
        ),
        meta: { width: isXs ? 180 : 220 },
      },
    ];
    return base;
  }, [isXs, isMdUp, onAskDelete, onOpenView, onStartEdit, onToggleActive]);

  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting, pagination: { pageIndex, pageSize } },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    manualSorting: true,
    onSortingChange: (u) => {
      const next = typeof u === 'function' ? u(sorting) : u;
      setSorting(next);
      setPageIndex(0);
    },
    onPaginationChange: (u) => {
      const next = typeof u === 'function' ? u({ pageIndex, pageSize }) : u;
      setPageIndex(next.pageIndex ?? 0);
      setPageSize(next.pageSize ?? 12);
    },
    getRowId: (row) => row.id,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
  });

  const headerGroups = table.getHeaderGroups();
  const rowModel = table.getRowModel();

  return (
    <Paper>
      <TableContainer>
        <Table size="medium" stickyHeader>
          <TableHead>
            {headerGroups.map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((header) => {
                  const sorted = header.column.getIsSorted();
                  const width = (header.column.columnDef.meta as any)?.width;
                  const isActions = header.column.id === 'actions';
                  return (
                    <TableCell key={header.id} sx={{ width }}>
                      {!isActions ? (
                        <TableSortLabel
                          active={!!sorted}
                          direction={sorted === 'asc' ? 'asc' : sorted === 'desc' ? 'desc' : 'asc'}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </TableSortLabel>
                      ) : (
                        flexRender(header.column.columnDef.header, header.getContext())
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableHead>
          <TableBody>
            {rowModel.rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center">
                  <Typography variant="body2" color="text.secondary">
                    Nenhum clubinho encontrado.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              rowModel.rows.map((row) => (
                <TableRow key={row.id} hover>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Divider />
      <TablePagination
        component="div"
        count={total}
        page={pageIndex}
        onPageChange={(_, p) => setPageIndex(p)}
        rowsPerPage={pageSize}
        onRowsPerPageChange={(e) => {
          setPageSize(parseInt(e.target.value, 10));
          setPageIndex(0);
        }}
        rowsPerPageOptions={[12, 24, 50]}
        labelRowsPerPage="Linhas por página:"
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
      />
    </Paper>
  );
}
