import React, { useState } from "react";
import { Grid2 } from "@mui/material";
import { useNavigate } from "react-router-dom";

import { ListingLayout, ListingToolbar } from "@/components/common/listing";
import type { ListingFilter } from "@/components/common/listing";
import DeleteConfirmDialog from "@/components/common/modal/DeleteConfirmDialog";

import IdeasSectionCard from "./components/IdeasSectionCard";
import IdeasSectionDetailsModal from "./components/IdeasSectionDetailsModal";
import { useIdeasSectionMutations, useIdeasSections } from "./hooks";
import {
  IDEAS_SECTIONS_PAGE_SIZE_OPTIONS,
  IDEAS_SECTION_SORT_OPTIONS,
  ideasSectionReviewPath,
} from "./constants";
import type { IdeasSectionResponse } from "./types";
import { parseSortOption } from "./utils";

/**
 * Fila de ideias compartilhadas pela base.
 *
 * Quem envia uma ideia não a publica: ela chega aqui e a administração decide
 * se e em qual página ela entra.
 */
export default function IdeasSectionManager() {
  const navigate = useNavigate();

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
  } = useIdeasSections();

  const { actionLoading, actionError, setActionError, remove } =
    useIdeasSectionMutations(refresh);

  const [viewing, setViewing] = useState<IdeasSectionResponse | null>(null);
  const [confirmDelete, setConfirmDelete] =
    useState<IdeasSectionResponse | null>(null);

  /** Leva a ideia para a tela de revisão, onde a página é escolhida. */
  const handleReview = (section: IdeasSectionResponse) => {
    // O id vai na URL: a tela de revisão carrega a ideia por conta própria, e
    // um F5 lá não perde mais o que estava sendo revisado.
    navigate(ideasSectionReviewPath(section.id));
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;

    const ok = await remove(confirmDelete.id);
    if (ok) {
      setConfirmDelete(null);
      setViewing(null);
    }
  };

  const listingFilters: ListingFilter[] = [
    {
      id: "sort",
      label: "Ordenar por",
      value: `${filters.sort}:${filters.order}`,
      options: [...IDEAS_SECTION_SORT_OPTIONS],
      onChange: (value) =>
        setFilters((previous) => ({ ...previous, ...parseSortOption(value) })),
    },
  ];

  return (
    <ListingLayout data-testid="ideas-sections-ideas-section-manager"
      title="Ideias compartilhadas"
      summary={
        total > 0
          ? `${total} ideia(s) aguardando decisão`
          : "Nenhuma ideia para os filtros atuais"
      }
      toolbar={
        <ListingToolbar
          searchValue={search}
          searchPlaceholder="Buscar por título ou descrição…"
          onSearchChange={setSearch}
          filters={listingFilters}
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
      emptyTitle="Nenhuma ideia na fila"
      emptySubtitle="Quando alguém compartilhar uma ideia, ela aparece aqui para revisão."
      pagination={{
        page,
        pageSize,
        total,
        onPageChange: setPage,
        onPageSizeChange: setPageSize,
      }}
      pageSizeOptions={IDEAS_SECTIONS_PAGE_SIZE_OPTIONS}
      overlays={
        <>
          <IdeasSectionDetailsModal
            section={viewing}
            open={!!viewing}
            onClose={() => setViewing(null)}
            onReview={() => {
              if (viewing) handleReview(viewing);
            }}
            onDelete={() => {
              if (viewing) setConfirmDelete(viewing);
            }}
          />

          <DeleteConfirmDialog
            open={!!confirmDelete}
            title={confirmDelete ? `ideia "${confirmDelete.title}"` : ""}
            onClose={() => setConfirmDelete(null)}
            onConfirm={handleDelete}
          />
        </>
      }
    >
      {items.map((section) => (
        <Grid2 key={section.id} size={{ xs: 12, sm: 6, lg: 4 }}>
          <IdeasSectionCard
            section={section}
            disabled={actionLoading}
            onView={() => setViewing(section)}
            onReview={() => handleReview(section)}
            onDelete={() => setConfirmDelete(section)}
          />
        </Grid2>
      ))}
    </ListingLayout>
  );
}
