import React from "react";
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useMediaQuery, useTheme } from "@mui/material";

import { CommentData } from "store/slices/comment/commentsSlice";
import { useCommentActions, useCommentsData, useCommentsFilter } from "./hooks";
import CommentsToolbar from "./components/CommentsToolbar";
import CommentsGrid from "./components/CommentsGrid";
import EditCommentDialog, { EditState } from "./components/EditCommentDialog";
import CommentDetailsModal from "./components/CommentDetailsModal";
import ConfirmDialog from "@/components/common/modal/ConfirmDialog";
import BackHeader from "@/components/common/header/BackHeader";

export default function CommentsPage() {
  const { comments, loading, error, setError, fetchComments } = useCommentsData();
  const { filtered, search, onSearchChange, status, setStatus, isFiltering } = useCommentsFilter(comments);
  const { actionLoading, actionError, setActionError, publish, remove, update } = useCommentActions(fetchComments);

  const [selected, setSelected] = React.useState<CommentData | null>(null);
  const [toDelete, setToDelete] = React.useState<CommentData | null>(null);
  const [toPublish, setToPublish] = React.useState<CommentData | null>(null);
  const [toEdit, setToEdit] = React.useState<CommentData | null>(null);

  const [editValue, setEditValue] = React.useState<EditState>({ name: "", comment: "", clubinho: "", neighborhood: "" });
  const [editErrors, setEditErrors] = React.useState({ comment: false, clubinho: false, neighborhood: false });

  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();

  const openEdit = (c: CommentData) => {
    setToEdit(c);
    setEditValue({
      name: c.name || "",
      comment: c.comment || "",
      clubinho: c.clubinho || "",
      neighborhood: c.neighborhood || "",
    });
    setEditErrors({ comment: false, clubinho: false, neighborhood: false });
  };

  const onSaveEdit = async () => {
    if (!toEdit) return;
    const errs = {
      comment: !editValue.comment.trim(),
      clubinho: !editValue.clubinho.trim(),
      neighborhood: !editValue.neighborhood.trim(),
    };
    setEditErrors(errs);
    if (Object.values(errs).some(Boolean)) return;
    await update(toEdit, { ...editValue, published: true });
    setToEdit(null);
  };

  return (
    <Box sx={{ px: { xs: 2, md: 4 }, py: { xs: 2, md: 3 }, mt: { xs: 0, md: 2 }, bgcolor: "#f9fafb", minHeight: "100vh" }}>
      <BackHeader title="Gerenciar Comentários" />

      <CommentsToolbar
        search={search}
        onSearchChange={onSearchChange}
        status={status}
        setStatus={setStatus}
        isFiltering={isFiltering}
      />

      <CommentsGrid
        comments={filtered}
        loading={loading}
        error={error}
        onView={(c) => setSelected(c)}
        onEdit={openEdit}
        onAskPublish={(c) => setToPublish(c)}
        onAskDelete={(c) => setToDelete(c)}
      />

      {/* Confirm Delete */}
      <ConfirmDialog
        open={!!toDelete}
        title="Confirmar Exclusão"
        content={<>Tem certeza que deseja excluir o comentário de <strong>{toDelete?.name || "Sem Nome"}</strong>?</>}
        confirmText="Excluir"
        confirmColor="error"
        onClose={() => setToDelete(null)}
        onConfirm={async () => {
          if (!toDelete) return;
          await remove(toDelete); // sua action que retorna Promise
        }}
      />

      {/* Confirm Publish */}
      <ConfirmDialog
        open={!!toPublish}
        title="Confirmar Publicação"
        content={<>Deseja publicar o comentário de <strong>{toPublish?.name || "Sem Nome"}</strong>?</>}
        confirmText="Publicar"
        confirmColor="success"
        loading={actionLoading}
        onClose={() => setToPublish(null)}
        onConfirm={async () => {
          if (!toPublish) return;
          await publish(toPublish);
          setToPublish(null);
        }}
      />

      {/* Edit */}
      <EditCommentDialog
        open={!!toEdit}
        value={editValue}
        setValue={setEditValue}
        errors={editErrors}
        loading={actionLoading}
        error={actionError}
        onCancel={() => { setToEdit(null); setActionError(""); }}
        onSave={onSaveEdit}
      />

      {/* Details */}
      <CommentDetailsModal
        comment={selected}
        open={!!selected}
        onClose={() => setSelected(null)}
      />
    </Box>
  );
}
