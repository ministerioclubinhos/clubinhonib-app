import React, { useMemo, useState } from "react";
import { Grid2 } from "@mui/material";

import {
  ListingLayout,
  ListingToolbar,
  type ListingFilter,
} from "@/components/common/listing";
import DeleteConfirmDialog from "@/components/common/modal/DeleteConfirmDialog";
import { FeedbackCategory, FeedbackCategoryLabels } from "@/store/slices/types";

import FeedbackCard from "./components/FeedbackCard";
import FeedbackDetailsModal from "./components/FeedbackDetailsModal";
import { useFeedbackMutations, useFeedbacks } from "./hooks";
import {
  FEEDBACKS_PAGE_SIZE_OPTIONS,
  FEEDBACK_MAX_RATING,
  FEEDBACK_MIN_RATING,
} from "./constants";
import type { FeedbackResponse } from "./types";

/** Valor usado quando o filtro está sem seleção. */
const ANY = "";

export default function FeedbackManager() {
  const {
    items,
    total,
    page,
    setPage,
    pageSize,
    setPageSize,
    search,
    setSearch,
    filters,
    setFilters,
    loading,
    error,
    setError,
    refresh,
  } = useFeedbacks();

  const { actionLoading, actionError, setActionError, setRead, remove } =
    useFeedbackMutations(refresh);

  const [viewing, setViewing] = useState<FeedbackResponse | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<FeedbackResponse | null>(
    null,
  );

  const toolbarFilters = useMemo<ListingFilter[]>(
    () => [
      {
        id: "read",
        label: "Situação",
        value: filters.read === undefined ? ANY : String(filters.read),
        options: [
          { value: ANY, label: "Todas" },
          { value: "false", label: "Não lidas" },
          { value: "true", label: "Lidas" },
        ],
        onChange: (value) =>
          setFilters((current) => ({
            ...current,
            read: value === ANY ? undefined : value === "true",
          })),
      },
      {
        id: "category",
        label: "Categoria",
        value: filters.category ?? ANY,
        options: [
          { value: ANY, label: "Todas" },
          ...Object.values(FeedbackCategory).map((category) => ({
            value: category,
            label: FeedbackCategoryLabels[category],
          })),
        ],
        onChange: (value) =>
          setFilters((current) => ({
            ...current,
            category: value === ANY ? undefined : (value as FeedbackCategory),
          })),
      },
      {
        id: "rating",
        label: "Nota",
        value: filters.rating ? String(filters.rating) : ANY,
        options: [
          { value: ANY, label: "Todas" },
          ...Array.from(
            { length: FEEDBACK_MAX_RATING - FEEDBACK_MIN_RATING + 1 },
            (_, index) => {
              const rating = FEEDBACK_MAX_RATING - index;
              return { value: String(rating), label: `${rating} estrelas` };
            },
          ),
        ],
        onChange: (value) =>
          setFilters((current) => ({
            ...current,
            rating: value === ANY ? undefined : Number(value),
          })),
      },
    ],
    [filters, setFilters],
  );

  const handleToggleRead = async (feedback: FeedbackResponse) => {
    const ok = await setRead(feedback.id, !feedback.read);
    if (ok && viewing?.id === feedback.id) setViewing(null);
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;

    const ok = await remove(confirmDelete.id);
    if (ok) {
      setConfirmDelete(null);
      setViewing(null);
    }
  };

  return (
    <ListingLayout data-testid="feedback-feedback-manager"
      title="Avaliações do site"
      summary={
        total > 0
          ? `${total} avaliação(ões) encontrada(s)`
          : "Nenhuma avaliação para os filtros atuais"
      }
      toolbar={
        <ListingToolbar
          searchValue={search}
          searchPlaceholder="Buscar por nome, e-mail ou comentário…"
          onSearchChange={setSearch}
          filters={toolbarFilters}
          onRefresh={refresh}
        />
      }
      loading={loading}
      error={error || actionError}
      onDismissError={() => {
        setError("");
        setActionError("");
      }}
      itemCount={items.length}
      emptyTitle="Nenhuma avaliação encontrada"
      emptySubtitle="Ajuste a busca ou os filtros para ver outros resultados."
      pagination={{
        page,
        pageSize,
        total,
        onPageChange: setPage,
        onPageSizeChange: setPageSize,
      }}
      pageSizeOptions={FEEDBACKS_PAGE_SIZE_OPTIONS}
      overlays={
        <>
      <FeedbackDetailsModal
        feedback={viewing}
        onClose={() => setViewing(null)}
        onToggleRead={() => viewing && void handleToggleRead(viewing)}
        onDelete={() => {
          if (viewing) setConfirmDelete(viewing);
        }}
      />

      <DeleteConfirmDialog
        open={!!confirmDelete}
        title={confirmDelete ? `avaliação de ${confirmDelete.name}` : ""}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDelete}
      />
        </>
      }
    >
      {items.map((feedback) => (
        <Grid2 key={feedback.id} size={{ xs: 12, sm: 6, lg: 4 }}>
          <FeedbackCard
            feedback={feedback}
            disabled={actionLoading}
            onView={() => setViewing(feedback)}
            onToggleRead={() => void handleToggleRead(feedback)}
            onDelete={() => setConfirmDelete(feedback)}
          />
        </Grid2>
      ))}

    </ListingLayout>
  );
}
