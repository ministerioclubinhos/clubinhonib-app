import React from "react";
import { Card, CardContent, Typography, IconButton, Tooltip, Box, Button } from "@mui/material";
import { Delete, Edit, Publish, Visibility } from "@mui/icons-material";
import { CommentData } from "store/slices/comment/commentsSlice";

type Props = {
  comment: CommentData;
  onView: (c: CommentData) => void;
  onEdit: (c: CommentData) => void;
  onAskPublish: (c: CommentData) => void;
  onAskDelete: (c: CommentData) => void;
  truncate?: (s: string, len?: number) => string;
};

export default function CommentCard({
  comment, onView, onEdit, onAskPublish, onAskDelete, truncate = (s, l = 80) => (s?.length > l ? s.slice(0, l) + "..." : s),
}: Props) {
  return (
    <Card
      sx={{
        borderRadius: 3,
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        p: 2,
        bgcolor: comment.published ? "#e6f4ea" : "#fff3e0",
        border: comment.published ? "1px solid #4caf50" : "1px solid #ff9800",
        transition: "transform 0.2s, box-shadow 0.2s",
        "&:hover": { transform: "translateY(-4px)", boxShadow: "0 8px 24px rgba(0,0,0,0.15)" },
        position: "relative",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Tooltip title="Excluir Comentário">
        <IconButton
          size="small"
          onClick={() => onAskDelete(comment)}
          sx={{ position: "absolute", top: 8, right: 8, color: "#d32f2f", bgcolor: "rgba(255,255,255,0.8)", "&:hover": { bgcolor: "#ffebee" } }}
        >
          <Delete fontSize="small" />
        </IconButton>
      </Tooltip>

      <CardContent sx={{ flexGrow: 1, pb: 2 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ fontSize: { xs: "1.1rem", md: "1.3rem" }, color: "#1a3c34" }}>
          {comment.name || "Sem Nome"}
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontSize: { xs: "0.85rem", md: "0.95rem" }, lineHeight: 1.5 }}>
          {truncate(comment.comment || "")}
        </Typography>

        <Typography
          variant="caption"
          color={comment.published ? "success.main" : "warning.main"}
          sx={{ fontWeight: "medium", fontSize: { xs: "0.8rem", md: "0.9rem" } }}
        >
          {comment.published ? "Publicado" : "Não Publicado"}
        </Typography>
      </CardContent>

      <Box sx={{ display: "flex", gap: 1, justifyContent: "center", flexWrap: "wrap", p: 2, borderTop: "1px solid #e0e0e0" }}>
        <Tooltip title="Ver detalhes do comentário">
          <Button variant="outlined" size="small" startIcon={<Visibility />} onClick={() => onView(comment)}
            sx={{ flex: 1, minWidth: 100 }} >
            Detalhes
          </Button>
        </Tooltip>
        <Tooltip title="Editar comentário">
          <Button variant="outlined" size="small" startIcon={<Edit />} onClick={() => onEdit(comment)}
            sx={{ flex: 1, minWidth: 100 }} >
            Editar
          </Button>
        </Tooltip>
        {!comment.published && (
          <Tooltip title="Publicar comentário">
            <Button variant="contained" size="small" startIcon={<Publish />} onClick={() => onAskPublish(comment)}
              sx={{ flex: 1, minWidth: 100, bgcolor: "#4caf50", "&:hover": { bgcolor: "#43a047" } }}>
              Publicar
            </Button>
          </Tooltip>
        )}
      </Box>
    </Card>
  );
}
