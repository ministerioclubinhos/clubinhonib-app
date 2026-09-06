import React, { useMemo, useState } from "react";
import { Grid2 } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

import {
  ListingLayout,
  ListingToolbar,
  type ListingFilter,
} from "@/components/common/listing";
import DeleteConfirmDialog from "@/components/common/modal/DeleteConfirmDialog";
import { setData } from "@/store/slices/image-section/imageSectionSlice";
import type { SectionData } from "@/store/slices/image-section/imageSectionSlice";
import type {
  MediaPlatform,
  MediaType,
  MediaUploadType,
} from "@/store/slices/types";

import ImageSectionCard from "./components/ImageSectionCard";
import ImageSectionDetailsModal from "./components/ImageSectionDetailsModal";
import { useImageSectionMutations, useImageSections } from "./hooks";
import { IMAGE_SECTIONS_PAGE_SIZE_OPTIONS } from "./constants";
import type { ImageSectionResponse } from "./types";

/** Rota onde a administração revisa as fotos e aprova a publicação. */
const reviewRoute = (id: string) => `/adm/editar-imagens-clubinho/${id}`;

/** Valor usado quando o filtro está sem seleção. */
const ANY = "";

/**
 * Fila de fotos enviadas pelos clubinhos.
 *
 * Quem envia não publica: as fotos chegam aqui e a administração decide o que
 * vai para o feed.
 */
export default function ImageSectionManager() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

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
  } = useImageSections();

  const { actionLoading, actionError, setActionError, remove } =
    useImageSectionMutations(refresh);

  const [viewing, setViewing] = useState<ImageSectionResponse | null>(null);
  const [confirmDelete, setConfirmDelete] =
    useState<ImageSectionResponse | null>(null);

  const toolbarFilters = useMemo<ListingFilter[]>(
    () => [
      {
        id: "approved",
        label: "Situação",
        value: filters.approved === undefined ? ANY : String(filters.approved),
        options: [
          { value: ANY, label: "Todas" },
          { value: "false", label: "Aguardando" },
          { value: "true", label: "No feed" },
        ],
        onChange: (value) =>
          setFilters((current) => ({
            ...current,
            approved: value === ANY ? undefined : value === "true",
          })),
      },
      {
        id: "hasMedia",
        label: "Fotos",
        value: filters.hasMedia === undefined ? ANY : String(filters.hasMedia),
        options: [
          { value: ANY, label: "Todas" },
          { value: "true", label: "Com fotos" },
          { value: "false", label: "Sem fotos" },
        ],
        onChange: (value) =>
          setFilters((current) => ({
            ...current,
            hasMedia: value === ANY ? undefined : value === "true",
          })),
      },
    ],
    [filters, setFilters],
  );

  /** Leva a publicação para a tela de revisão. */
  const handleReview = (section: ImageSectionResponse) => {
    const paraEdicao: SectionData = {
      id: section.id,
      caption: section.caption,
      description: section.description,
      public: section.public,
      createdAt: section.createdAt,
      updatedAt: section.updatedAt,
      mediaItems: section.mediaItems.map((media) => ({
        id: media.id,
        title: media.title ?? "",
        description: media.description ?? "",
        uploadType: media.uploadType as MediaUploadType,
        mediaType: media.mediaType as MediaType,
        isLocalFile: media.isLocalFile,
        url: media.url,
        platformType: (media.platformType as MediaPlatform) || undefined,
        originalName: media.originalName || undefined,
        size: media.size || undefined,
      })),
    };

    dispatch(setData(paraEdicao));
    navigate(reviewRoute(section.id));
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
    <ListingLayout data-testid="image-sections-image-section-manager"
      title="Fotos dos clubinhos"
      summary={
        total > 0
          ? `${total} publicação(ões) encontrada(s)`
          : "Nenhuma publicação para os filtros atuais"
      }
      toolbar={
        <ListingToolbar
          searchValue={search}
          searchPlaceholder="Buscar por legenda ou descrição…"
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
      emptyTitle="Nenhuma publicação encontrada"
      emptySubtitle="Quando um clubinho enviar fotos, elas aparecem aqui para revisão."
      pagination={{
        page,
        pageSize,
        total,
        onPageChange: setPage,
        onPageSizeChange: setPageSize,
      }}
      pageSizeOptions={IMAGE_SECTIONS_PAGE_SIZE_OPTIONS}
      overlays={
        <>
          <ImageSectionDetailsModal
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
            title={confirmDelete ? `publicação "${confirmDelete.caption}"` : ""}
            onClose={() => setConfirmDelete(null)}
            onConfirm={handleDelete}
          />
        </>
      }
    >
      {items.map((section) => (
        <Grid2 key={section.id} size={{ xs: 12, sm: 6, lg: 4 }}>
          <ImageSectionCard
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
