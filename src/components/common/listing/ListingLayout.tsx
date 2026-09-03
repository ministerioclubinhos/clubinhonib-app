import React from "react";
import {
  Alert,
  Box,
  Grid2,
  Paper,
  Skeleton,
  Stack,
  TablePagination,
  Typography,
} from "@mui/material";

import BackHeader from "@/components/common/header/BackHeader";

import type { ListingPagination } from "./types";

type Props = {
  title: string;
  /** Contagem e contexto, exibidos abaixo do título. */
  summary?: React.ReactNode;
  toolbar: React.ReactNode;
  loading: boolean;
  error?: string;
  onDismissError?: () => void;
  /** Quantidade de itens na página atual. */
  itemCount: number;
  emptyTitle: string;
  emptySubtitle: string;
  pagination: ListingPagination;
  pageSizeOptions: number[];
  /** Cards da página; entram como itens da grade. */
  children: React.ReactNode;
  /** Diálogos da tela, fora da grade. */
  overlays?: React.ReactNode;
};

/** Quantos esqueletos aparecem enquanto a primeira página carrega. */
const SKELETON_COUNT = 6;

/**
 * Casca das listagens administrativas.
 *
 * Avaliações, contatos e comentários compartilham este arranjo — cabeçalho,
 * barra de ferramentas, grade de cards e paginação — para que as três telas
 * pareçam a mesma família.
 */
export default function ListingLayout({
  title,
  summary,
  toolbar,
  loading,
  error,
  onDismissError,
  itemCount,
  emptyTitle,
  emptySubtitle,
  pagination,
  pageSizeOptions,
  children,
  overlays,
}: Props) {
  const showSkeletons = loading && itemCount === 0;
  const showEmpty = !loading && !error && itemCount === 0;

  return (
    <Box
      sx={{
        px: { xs: 2, md: 0 },
        pb: 4,
        minHeight: "100vh",
        "@supports (min-height: 100dvh)": { minHeight: "100dvh" },
        bgcolor: "#f9fafb",
      }}
    >
      <BackHeader title={title} mobileFontSize="1.05rem" />

      {summary ? (
        // `div`, e não `p`: o resumo pode ser um texto simples ou um conjunto
        // de selos, e um `<p>` não pode conter `<div>`.
        <Typography
          component="div"
          variant="body2"
          color="text.secondary"
          sx={{ mb: 1.5 }}
        >
          {summary}
        </Typography>
      ) : null}

      {toolbar}

      {error ? (
        <Alert severity="error" sx={{ mb: 2 }} onClose={onDismissError}>
          {error}
        </Alert>
      ) : null}

      {showSkeletons ? (
        <Grid2 container spacing={{ xs: 1.5, md: 2 }}>
          {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
            <Grid2 key={index} size={{ xs: 12, sm: 6, lg: 4 }}>
              <Skeleton variant="rounded" height={196} sx={{ borderRadius: 3 }} />
            </Grid2>
          ))}
        </Grid2>
      ) : null}

      {showEmpty ? (
        <Paper
          elevation={0}
          sx={{
            p: { xs: 4, md: 6 },
            textAlign: "center",
            borderRadius: 3,
            border: 1,
            borderStyle: "dashed",
            borderColor: "divider",
          }}
        >
          <Stack spacing={0.5}>
            <Typography variant="h6" fontWeight={700}>
              {emptyTitle}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {emptySubtitle}
            </Typography>
          </Stack>
        </Paper>
      ) : null}

      {itemCount > 0 ? (
        <Grid2
          container
          spacing={{ xs: 1.5, md: 2 }}
          // Recarregar não deve apagar a grade; só esmaece enquanto vem.
          sx={{ opacity: loading ? 0.6 : 1, transition: "opacity .2s" }}
        >
          {children}
        </Grid2>
      ) : null}

      {overlays}

      {pagination.total > 0 ? (
        <Paper
          elevation={0}
          sx={{ mt: 2, borderRadius: 3, border: 1, borderColor: "divider" }}
        >
          <TablePagination
            component="div"
            count={pagination.total}
            page={Math.max(0, pagination.page - 1)}
            onPageChange={(_, nextPage) => pagination.onPageChange(nextPage + 1)}
            rowsPerPage={pagination.pageSize}
            onRowsPerPageChange={(event) =>
              pagination.onPageSizeChange(Number(event.target.value))
            }
            rowsPerPageOptions={pageSizeOptions}
            labelRowsPerPage="Por página:"
            labelDisplayedRows={({ from, to, count }) =>
              `${from}-${to} de ${count}`
            }
            sx={{
              ".MuiTablePagination-toolbar": {
                px: { xs: 0.5, sm: 2 },
                minHeight: { xs: 52, sm: 52 },
              },
              // "Por página:" não cabe em 320px junto do resto; o seletor
              // sozinho já diz o que faz.
              ".MuiTablePagination-selectLabel": {
                display: { xs: "none", sm: "block" },
                margin: 0,
              },
              ".MuiTablePagination-displayedRows": {
                margin: 0,
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
              },
              ".MuiTablePagination-actions": { ml: { xs: 0.5, sm: 2 } },
              ".MuiTablePagination-actions .MuiIconButton-root": {
                minWidth: { xs: 44, sm: "auto" },
                minHeight: { xs: 44, sm: "auto" },
              },
            }}
          />
        </Paper>
      ) : null}
    </Box>
  );
}
