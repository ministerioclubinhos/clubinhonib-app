import React, { useMemo, useState } from "react";
import { Grid2 } from "@mui/material";

import {
  ListingLayout,
  ListingToolbar,
  type ListingFilter,
} from "@/components/common/listing";
import DeleteConfirmDialog from "@/components/common/modal/DeleteConfirmDialog";

import CommentCard from "./components/CommentCard";
import CommentDetailsModal from "./components/CommentDetailsModal";
import EditCommentDialog from "./components/EditCommentDialog";
import { useCommentMutations, useComments } from "./hooks";
import { COMMENTS_PAGE_SIZE_OPTIONS } from "./constants";
import {
  buildUpdateCommentRequest,
  toCommentFormValues,
  validateCommentForm,
} from "./utils";
import type { CommentFormValues, CommentResponse } from "./types";

/** Valor usado quando o filtro está sem seleção. */
const ANY = "";

export default function CommentsManager() {
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
  } = useComments();

  const {
    actionLoading,
    actionError,
    setActionError,
    setPublished,
    update,
    remove,
  } = useCommentMutations(refresh);

  const [viewing, setViewing] = useState<CommentResponse | null>(null);
  const [editing, setEditing] = useState<
    { comment: CommentResponse; values: CommentFormValues } | null
  >(null);
  const [confirmDelete, setConfirmDelete] = useState<CommentResponse | null>(
    null,
  );

  const toolbarFilters = useMemo<ListingFilter[]>(
    () => [
      {
        id: "published",
        label: "Publicação",
        value: filters.published === undefined ? ANY : String(filters.published),
        options: [
          { value: ANY, label: "Todos" },
          { value: "false", label: "Aguardando" },
          { value: "true", label: "Publicados" },
        ],
        onChange: (value) =>
          setFilters((current) => ({
            ...current,
            published: value === ANY ? undefined : value === "true",
          })),
      },
    ],
    [filters, setFilters],
  );

  const editErrors = editing
    ? validateCommentForm(editing.values)
    : { name: false, comment: false, clubinho: false, neighborhood: false };

  const handleTogglePublished = async (comment: CommentResponse) => {
    const ok = await setPublished(comment.id, !comment.published);
    if (ok && viewing?.id === comment.id) setViewing(null);
  };

  const handleSaveEdit = async () => {
    if (!editing) return;
    if (Object.values(validateCommentForm(editing.values)).some(Boolean)) return;

    // Só os campos alterados vão adiante, e a publicação fica de fora: salvar
    // uma edição não deve publicar o comentário sem querer.
    const payload = buildUpdateCommentRequest(editing.values, editing.comment);
    const ok = await update(editing.comment.id, payload);
    if (ok) {
      setEditing(null);
      setViewing(null);
    }
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
    <ListingLayout
      title="Comentários"
      summary={
        total > 0
          ? `${total} comentário(s) encontrado(s)`
          : "Nenhum comentário para os filtros atuais"
      }
      toolbar={
        <ListingToolbar
          searchValue={search}
          searchPlaceholder="Buscar por nome, clubinho, bairro ou texto…"
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
      emptyTitle="Nenhum comentário encontrado"
      emptySubtitle="Ajuste a busca ou os filtros para ver outros resultados."
      pagination={{
        page,
        pageSize,
        total,
        onPageChange: setPage,
        onPageSizeChange: setPageSize,
      }}
      pageSizeOptions={COMMENTS_PAGE_SIZE_OPTIONS}
      overlays={
        <>
          <CommentDetailsModal
            comment={viewing}
            onClose={() => setViewing(null)}
            onEdit={() => {
              if (!viewing) return;
              setEditing({
                comment: viewing,
                values: toCommentFormValues(viewing),
              });
            }}
            onTogglePublished={() =>
              viewing && void handleTogglePublished(viewing)
            }
            onDelete={() => {
              if (viewing) setConfirmDelete(viewing);
            }}
          />

          <EditCommentDialog
            open={!!editing}
            value={
              editing?.values ?? {
                name: "",
                comment: "",
                clubinho: "",
                neighborhood: "",
              }
            }
            onChange={(values) =>
              setEditing((current) => (current ? { ...current, values } : current))
            }
            errors={editErrors}
            loading={actionLoading}
            error={actionError}
            onCancel={() => {
              setEditing(null);
              setActionError("");
            }}
            onSave={handleSaveEdit}
          />

          <DeleteConfirmDialog
            open={!!confirmDelete}
            title={confirmDelete ? `comentário de ${confirmDelete.name}` : ""}
            onClose={() => setConfirmDelete(null)}
            onConfirm={handleDelete}
          />
        </>
      }
    >
      {items.map((comment) => (
        <Grid2 key={comment.id} size={{ xs: 12, sm: 6, lg: 4 }}>
          <CommentCard
            comment={comment}
            disabled={actionLoading}
            onView={() => setViewing(comment)}
            onEdit={() =>
              setEditing({ comment, values: toCommentFormValues(comment) })
            }
            onTogglePublished={() => void handleTogglePublished(comment)}
            onDelete={() => setConfirmDelete(comment)}
          />
        </Grid2>
      ))}
    </ListingLayout>
  );
}
