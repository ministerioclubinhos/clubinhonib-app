import React from "react";
import { Grid, Alert, Box, CircularProgress } from "@mui/material";
import { CommentData } from "store/slices/comment/commentsSlice";
import CommentCard from "./CommentCard";

type Props = {
  comments: CommentData[];
  loading: boolean;
  error: string;
  onView: (c: CommentData) => void;
  onEdit: (c: CommentData) => void;
  onAskPublish: (c: CommentData) => void;
  onAskDelete: (c: CommentData) => void;
};

export default function CommentsGrid({
  comments, loading, error, onView, onEdit, onAskPublish, onAskDelete,
}: Props) {
  if (loading)
    return (<Box textAlign="center" mt={10}><CircularProgress /></Box>);
  if (error)
    return (<Box textAlign="center" mt={10}><Alert severity="error">{error}</Alert></Box>);
  if (!comments || comments.length === 0)
    return (<Box textAlign="center" mt={10}><Alert severity="info">Nenhum comentário encontrado.</Alert></Box>);

  return (
    <Grid container spacing={3} justifyContent="center">
      {comments.map((comment) => (
        <Grid item key={comment.id || `${comment.createdAt}-${comment.name}`} xs={12} sm={6} md={4} lg={3}>
          <CommentCard
            comment={comment}
            onView={onView}
            onEdit={onEdit}
            onAskPublish={onAskPublish}
            onAskDelete={onAskDelete}
          />
        </Grid>
      ))}
    </Grid>
  );
}
