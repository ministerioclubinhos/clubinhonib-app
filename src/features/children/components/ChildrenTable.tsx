import React, { useMemo } from "react";
import {
  Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TableSortLabel, Divider, Typography, Box, Chip, useTheme, useMediaQuery, TablePagination
} from "@mui/material";
import {
  ColumnDef, flexRender, getCoreRowModel, getPaginationRowModel,
  SortingState, useReactTable
} from "@tanstack/react-table";
import { Visibility, Edit, Delete, ToggleOn, ToggleOff } from "@mui/icons-material";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { ChildResponseDto } from "../types";
import ChildrenCards from "./ChildrenCards";

type Props = {
  rows: ChildResponseDto[];
  total: number;
  pageIndex: number;
  pageSize: number;
  setPageIndex: (n: number) => void;
  setPageSize: (n: number) => void;
  sorting: SortingState;
  setSorting: (s: SortingState) => void;
  onOpenView: (row: ChildResponseDto) => void;
  onStartEdit: (row: ChildResponseDto) => void;
  onAskDelete: (row: ChildResponseDto) => void;
  onToggleActive: (row: ChildResponseDto) => void;
};

import { formatDate, gLabel } from "@/utils/dateUtils";

export default function ChildrenTable(props: Props) {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"), { noSsr: true });

  return isXs ? <ChildrenCards {...props} /> : <ChildrenTableDesktop {...props} />;
}

function ChildrenTableDesktop(props: Props) {
  const {
    rows, total, pageIndex, pageSize, setPageIndex, setPageSize,
    sorting, setSorting, onOpenView, onStartEdit, onAskDelete, onToggleActive,
  } = props;
  
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));

  const columns = useMemo<ColumnDef<ChildResponseDto>[]>(() => ([
    {
      accessorKey: "name",
      header: "Nome da Criança",
      cell: ({ getValue }) => <Typography fontWeight={700}>{String(getValue())}</Typography>,
      meta: { width: 220 },
    },
    {
      accessorKey: "gender",
      header: "Gênero",
      cell: ({ getValue }) => <Typography>{gLabel(getValue() as any)}</Typography>,
      meta: { width: 110 },
    },
    {
      accessorKey: "guardianName",
      header: "Nome do Responsável",
      cell: ({ getValue }) => <Typography noWrap>{String(getValue() ?? "—")}</Typography>,
      meta: { width: 220 },
    },
    {
      id: "guardianPhone",
      header: "Telefone do Responsável",
      cell: ({ row }) => row.original.guardianPhone ?? "—",
      meta: { width: 140 },
    },
    {
      id: "clubNumber",
      header: "Clubinho",
      cell: ({ row }) => row.original.club?.number ?? <Chip size="small" label="—" />,
      meta: { width: 100 },
    },
    {
      accessorKey: "birthDate",
      header: "Nascimento",
      cell: ({ getValue }) => formatDate(getValue() as any),
      meta: { width: 140 },
    },
    {
      accessorKey: "joinedAt",
      header: "No clubinho desde",
      cell: ({ getValue }) => formatDate(getValue() as any),
      meta: { width: 160 },
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ getValue }) => {
        const active = getValue() as boolean;
        return (
          <Chip
            size="small"
            label={active ? "Ativo" : "Inativo"}
            color={active ? "success" : "default"}
            variant={active ? "filled" : "outlined"}
          />
        );
      },
      meta: { width: 100 },
    },
    {
      accessorKey: "createdAt",
      header: "Criado em",
      cell: ({ getValue }) => formatDate(getValue() as any, true),
      meta: { width: 180 },
    },
    {
      accessorKey: "updatedAt",
      header: "Atualizado em",
      cell: ({ getValue }) => formatDate(getValue() as any, true),
      meta: { width: 180 },
    },
    {
      id: "actions",
      header: "Ações",
      enableSorting: false,
      cell: ({ row }) => (
        <Box sx={{ display: "flex", gap: 0.5 }}>
          <Tooltip title="Detalhes"><IconButton onClick={() => onOpenView(row.original)}><Visibility /></IconButton></Tooltip>
          <Tooltip title="Editar"><IconButton onClick={() => onStartEdit(row.original)}><Edit /></IconButton></Tooltip>
          <Tooltip title={row.original.isActive ? "Desativar" : "Ativar"}>
            <IconButton 
              color={row.original.isActive ? "success" : "default"}
              onClick={() => onToggleActive(row.original)}
            >
              {row.original.isActive ? <ToggleOn /> : <ToggleOff />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Excluir"><IconButton color="error" onClick={() => onAskDelete(row.original)}><Delete /></IconButton></Tooltip>
        </Box>
      ),
      meta: { width: 200 },
    },
  ]), [onAskDelete, onOpenView, onStartEdit, onToggleActive]);

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
    getRowId: (r) => r.id,
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
                  <Typography variant="body2" color="text.secondary">Nenhuma criança encontrada.</Typography>
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map(r => (
                <TableRow key={r.id} hover>
                  {r.getVisibleCells().map(c => (
                    <TableCell key={c.id}>
                      {flexRender(c.column.columnDef.cell, c.getContext())}
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
        onPageChange={(_, p) => props.setPageIndex(p)}
        rowsPerPage={pageSize}
        onRowsPerPageChange={(e) => { props.setPageSize(parseInt(e.target.value, 10)); props.setPageIndex(0); }}
        rowsPerPageOptions={[12, 24, 50]}
        labelRowsPerPage="Linhas por página"
      />
    </Paper>
  );
}
