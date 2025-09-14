import React from "react";
import { Card, CardContent, Typography, Box, IconButton, Chip } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { FeedbackData } from "@/store/slices/feedback/feedbackSlice";
import { FeedbackCategory, FeedbackCategoryLabels } from "@/store/slices/types";

type Props = {
  feedback: FeedbackData;
  onView: () => void;
  onDelete: () => void;
};

const FeedbackCard: React.FC<Props> = ({ feedback, onView, onDelete }) => {
  const bgColor = feedback.read ? "#e3fce3" : "#fff3e0";
  const statusLabel = feedback.read ? "Lido" : "Não lido";
  const statusColor: any = feedback.read ? "success" : "warning";

  const categoryLabel =
    FeedbackCategoryLabels[feedback.category as FeedbackCategory] || feedback.category;

  return (
    <Card sx={{ p: 2, backgroundColor: bgColor }}>
      <CardContent sx={{ pb: 1 }}>
        <Typography variant="h6" fontWeight="bold">{feedback.name}</Typography>
        <Typography variant="body2" color="text.secondary">Nota: {feedback.rating}/5</Typography>
        <Typography variant="body2" color="text.secondary">Categoria: {categoryLabel}</Typography>
        <Chip label={statusLabel} color={statusColor} size="small" sx={{ mt: 1 }} />
      </CardContent>
      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 1 }}>
        <IconButton onClick={onView} color="primary" aria-label="Ver detalhes">
          <VisibilityIcon />
        </IconButton>
        <IconButton onClick={onDelete} color="error" aria-label="Excluir">
          <DeleteIcon />
        </IconButton>
      </Box>
    </Card>
  );
};

export default FeedbackCard;
