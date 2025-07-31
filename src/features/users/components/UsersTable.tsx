// src/modules/users/components/UsersTable.tsx
import React, { useMemo } from "react";
import {
  Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TableSortLabel, Divider, Typography, Chip, Box, TablePagination,
  useMediaQuery, useTheme, Tooltip, IconButton
} from "@mui/material";
import {
  ColumnDef, flexRender, getCoreRowModel, getPaginationRowModel, SortingState, useReactTable
} from "@tanstack/react-table";
import { Visibility, Edit, Delete } from "@mui/icons-material";
import { UserRow } from "../types";
import { fmtDate } from "@/utils/dates";
import { RoleUser } from "@/store/slices/auth/authSlice";
import UsersCards from "./UsersCards";

type Props = {
  rows: UserRow[];
  total: number;
  pageIndex: number;
  pageSize: number;
  setPageIndex: (n: number) => void;
  setPageSize: (n: number) => void;
  sorting: SortingState;
  setSorting: (s: SortingState) => void;
  onView: (u: UserRow) => void;
  onEdit: (u: UserRow) => void;
  onDelete: (u: UserRow) => void;
};

/** Wrapper responsivo: cards no XS, tabela no restante */
export default function UsersTable(props: Props) {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"), { noSsr: true });
  return isXs ? <UsersCards {...props} /> : <UsersTableDesktop {...props} />;
}

/** Tabela desktop */
function UsersTableDesktop({
  rows, total, pageIndex, pageSize, setPageIndex, setPageSize,
  sorting, setSorting, onView, onEdit, onDelete,
}: Props) {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));

  const columns = useMemo<ColumnDef<UserRow>[]>(() => [
    {
      accessorKey: "name",
      header: "Nome",
      cell: ({ row }) => (
        <Box sx={{ display: "flex", flexDirection: "column", minWidth: 160 }}>
          <Typography fontWeight={600} noWrap>{row.original.name || "—"}</Typography>
          <Typography variant="caption" color="text.secondary" noWrap title={row.original.email}>
            {row.original.email}
          </Typography>
        </Box>
      ),
      meta: { width: 260 },
    },
    {
      accessorKey: "role",
      header: "Papel",
      cell: ({ getValue }) => (
        <Chip
          size="small"
          label={String(getValue() || "user")}
          variant="outlined"
          color={String(getValue()).toLowerCase() === RoleUser.ADMIN ? "secondary" : "default"}
        />
      ),
      meta: { width: 110 },
    },
    {
      accessorKey: "active",
      header: "Ativo",
      cell: ({ getValue }) => (
        <Chip size="small" label={getValue() ? "Sim" : "Não"} color={getValue() ? "success" : "default"} />
      ),
      meta: { width: 90 },
    },
    {
      accessorKey: "completed",
      header: "Completo",
      cell: ({ getValue }) => (
        <Chip size="small" label={getValue() ? "Sim" : "Não"} color={getValue() ? "success" : "default"} />
      ),
      meta: { width: 110 },
    },
    {
      accessorKey: "phone",
      header: "Telefone",
      cell: ({ getValue }) => <Typography noWrap>{String(getValue() || "—")}</Typography>,
      meta: { width: 150 },
    },
    ...(isMdUp ? ([{
      accessorKey: "createdAt",
      header: "Criado em",
      cell: ({ getValue }) => <>{fmtDate(String(getValue()))}</>,
      meta: { width: 170 },
    }, {
      accessorKey: "updatedAt",
      header: "Atualizado em",
      cell: ({ getValue }) => <>{fmtDate(String(getValue()))}</>,
      meta: { width: 170 },
    }] as ColumnDef<UserRow>[]) : []),
    {
      id: "actions",
      header: "Ações",
      enableSorting: false,
      cell: ({ row }) => (
        <Box sx={{ display: "flex", gap: 0.5 }}>
          <Tooltip title="Detalhes">
            <IconButton onClick={() => onView(row.original)}><Visibility /></IconButton>
          </Tooltip>
          <Tooltip title="Editar">
            <IconButton onClick={() => onEdit(row.original)}><Edit /></IconButton>
          </Tooltip>
          <Tooltip title="Excluir">
            <IconButton color="error" onClick={() => onDelete(row.original)}><Delete /></IconButton>
          </Tooltip>
        </Box>
      ),
      meta: { width: 150 },
    },
  ], [isMdUp, onDelete, onEdit, onView]);

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
        <Table size="medium" stickyHeader>
          <TableHead>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((h) => {
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
                <TableCell colSpan={table.getAllColumns().length} align="center">
                  <Typography variant="body2" color="text.secondary">Nenhum usuário encontrado.</Typography>
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} hover>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
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
        rowsPerPageOptions={[12, 24, 50]}
        labelRowsPerPage="Linhas por página"
      />
    </Paper>
  );
}
