import React, { useMemo } from "react";
import {
  Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TableSortLabel, Divider, Typography, Chip, Box, TablePagination,
  useTheme, useMediaQuery, Tooltip, IconButton
} from "@mui/material";
import { ColumnDef, flexRender, getCoreRowModel, getPaginationRowModel, SortingState, useReactTable } from "@tanstack/react-table";
import { Visibility, Link as LinkIcon, LinkOff } from "@mui/icons-material";
import { TeacherProfile } from "../types";
import { fmtDate } from "../utils";

type Props = {
  rows: TeacherProfile[];
  total: number;
  pageIndex: number;
  pageSize: number;
  setPageIndex: (n: number) => void;
  setPageSize: (n: number) => void;
  sorting: SortingState;
  setSorting: (s: SortingState) => void;
  onView: (t: TeacherProfile) => void;
  onEditLinks: (t: TeacherProfile) => void;
  onClearClub: (teacherId: string) => void;
};

export default function TeacherTable({
  rows, total, pageIndex, pageSize, setPageIndex, setPageSize,
  sorting, setSorting, onView, onEditLinks, onClearClub,
}: Props) {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));

  const columns = useMemo<ColumnDef<TeacherProfile>[]>(() => [
    {
      id: "teacher",
      header: "Professor",
      cell: ({ row }) => {
        const u = row.original.user;
        return (
          <Box sx={{ display: "flex", flexDirection: "column", minWidth: 190 }}>
            <Typography fontWeight={600} noWrap>{u.name || "—"}</Typography>
            <Typography variant="caption" color="text.secondary" noWrap title={u.email}>{u.email}</Typography>
          </Box>
        );
      },
    },
    {
      id: "club",
      header: "Clubinho",
      cell: ({ row }) => <Chip size="small" label={row.original.club?.number ?? "—"} />,
      meta: { width: 100 },
    },
    {
      id: "coord",
      header: "Coordenador",
      cell: ({ row }) => {
        const c = row.original.club?.coordinator?.user;
        return <Typography noWrap>{c?.name || c?.email || "—"}</Typography>;
      },
      meta: { width: 220 },
    },
    ...(isMdUp ? ([
      {
        accessorKey: "createdAt",
        header: "Criado em",
        cell: ({ getValue }) => <>{fmtDate(String(getValue()))}</>,
        meta: { width: 170 },
      },
      {
        accessorKey: "updatedAt",
        header: "Atualizado em",
        cell: ({ getValue }) => <>{fmtDate(String(getValue()))}</>,
        meta: { width: 170 },
      },
    ] as ColumnDef<TeacherProfile>[]) : []),
    {
      id: "actions",
      header: "Ações",
      enableSorting: false,
      cell: ({ row }) => (
        <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
          <Tooltip title="Detalhes">
            <IconButton size={isXs ? "small" : "medium"} onClick={() => onView(row.original)}>
              <Visibility fontSize="inherit" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Vincular / Alterar clube">
            <IconButton size={isXs ? "small" : "medium"} onClick={() => onEditLinks(row.original)}>
              <LinkIcon fontSize="inherit" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Desvincular clube">
            <IconButton size={isXs ? "small" : "medium"} onClick={() => onClearClub(row.original.id)}>
              <LinkOff fontSize="inherit" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
      meta: { width: isXs ? 160 : 200 },
    },
  ], [isMdUp, isXs, onClearClub, onEditLinks, onView]);

  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting, pagination: { pageIndex, pageSize } },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    manualSorting: true,
    onSortingChange: (u) => {
      const next = typeof u === "function" ? u(sorting) : u;
      setSorting(next);
      setPageIndex(0);
    },
    onPaginationChange: (u) => {
      const next = typeof u === "function" ? u({ pageIndex, pageSize }) : u;
      setPageIndex(next.pageIndex ?? 0);
      setPageSize(next.pageSize ?? 12);
    },
    getRowId: (row) => row.id,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
  });

  return (
    <Paper>
      <TableContainer>
        <Table size={isXs ? "small" : "medium"} stickyHeader>
          <TableHead>
            {table.getHeaderGroups().map(hg => (
              <TableRow key={hg.id}>
                {hg.headers.map(h => {
                  const sorted = h.column.getIsSorted();
                  const width = (h.column.columnDef.meta as any)?.width;
                  const isActions = h.column.id === "actions";
                  return (
                    <TableCell key={h.id} sx={{ width }}>
                      {!isActions ? (
                        <TableSortLabel
                          active={!!sorted}
                          direction={sorted === "asc" ? "asc" : sorted === "desc" ? "desc" : "asc"}
                          onClick={h.column.getToggleSortingHandler()}
                        >
                          {flexRender(h.column.columnDef.header, h.getContext())}
                        </TableSortLabel>
                      ) : (
                        flexRender(h.column.columnDef.header, h.getContext())
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableHead>
          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center">
                  <Typography variant="body2" color="text.secondary">
                    Nenhum professor (com profile) encontrado nesta página.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map(row => (
                <TableRow key={row.id} hover>
                  {row.getVisibleCells().map(cell => (
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
        onRowsPerPageChange={(e) => { setPageSize(parseInt(e.target.value, 10)); setPageIndex(0); }}
        rowsPerPageOptions={isXs ? [6, 12, 24] : [12, 24, 50]}
        labelRowsPerPage={isXs ? "Linhas" : "Linhas por página"}
      />
    </Paper>
  );
}
