import React from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, IconButton, Box, Divider, Chip,
  useMediaQuery, useTheme
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import EmailIcon from "@mui/icons-material/Email";
import StarIcon from "@mui/icons-material/Star";
import CommentIcon from "@mui/icons-material/Comment";
import CategoryIcon from "@mui/icons-material/Category";
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead";
import DeleteIcon from "@mui/icons-material/Delete";
import { FeedbackData } from "@/store/slices/feedback/feedbackSlice";
import { FeedbackCategory, FeedbackCategoryLabels } from "@/store/slices/types";

type Props = {
  feedback: FeedbackData | null;
  onClose: () => void;
  onMarkAsRead: () => void;
  onDelete: () => void;
};

const FeedbackDetailsModal: React.FC<Props> = ({ feedback, onClose, onMarkAsRead, onDelete }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  if (!feedback) return null;

  const categoryLabel =
    FeedbackCategoryLabels[feedback.category as FeedbackCategory] || feedback.category;

  const handleMarkAsRead = () => {
    onMarkAsRead();
    onClose();
  };

  return (
    <Dialog
      open={!!feedback}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3, width: isMobile ? "98%" : "auto" } }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: 2, pb: 0 }}>
        <DialogTitle
          sx={{ p: 0, display: "flex", alignItems: "center", gap: 1, fontSize: { xs: ".9rem", md: "1.1rem" } }}
        >
          <MarkEmailReadIcon color="primary" />
          Detalhes do Feedback
        </DialogTitle>
        <IconButton onClick={onClose} aria-label="Fechar">
          <CloseIcon />
        </IconButton>
      </Box>

      <DialogContent sx={{ mt: 2, px: isMobile ? 2 : 3 }}>
        <Box display="flex" alignItems="center" mb={1}>
          <CommentIcon sx={{ mr: 1 }} />
          <Typography><strong>Nome:</strong> {feedback.name}</Typography>
        </Box>

        <Box display="flex" alignItems="center" mb={1}>
          <EmailIcon sx={{ mr: 1 }} />
          <Typography><strong>Email:</strong> {feedback.email || "Não informado"}</Typography>
        </Box>

        <Box display="flex" alignItems="center" mb={1}>
          <StarIcon sx={{ mr: 1 }} />
          <Typography><strong>Nota:</strong> {feedback.rating}/5</Typography>
        </Box>

        <Box display="flex" alignItems="center" mb={1}>
          <CategoryIcon sx={{ mr: 1 }} />
          <Typography><strong>Categoria:</strong> {categoryLabel}</Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" gutterBottom><strong>Comentário:</strong></Typography>
        <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", mb: 2 }}>
          {feedback.comment}
        </Typography>

        <Chip
          label={feedback.read ? "Lido" : "Não lido"}
          color={feedback.read ? "success" : "warning"}
          size="small"
        />
      </DialogContent>

      <DialogActions sx={{ p: 2, flexDirection: isMobile ? "column" : "row", gap: 1 }}>
        <Button onClick={onClose} fullWidth={isMobile} size={isMobile ? "small" : "medium"}>
          Fechar
        </Button>

        {!feedback.read ? (
          <Button
            onClick={handleMarkAsRead}
            variant="contained"
            color="primary"
            fullWidth={isMobile}
            size={isMobile ? "small" : "medium"}
          >
            Marcar como lido
          </Button>
        ) : (
          <Button
            onClick={onDelete}
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
            fullWidth={isMobile}
            size={isMobile ? "small" : "medium"}
          >
            Excluir
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default FeedbackDetailsModal;
