import React from "react";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Rating,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CategoryIcon from "@mui/icons-material/Category";
import DeleteIcon from "@mui/icons-material/Delete";
import EmailIcon from "@mui/icons-material/Email";
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead";
import MarkEmailUnreadIcon from "@mui/icons-material/MarkEmailUnread";
import PersonIcon from "@mui/icons-material/Person";
import ScheduleIcon from "@mui/icons-material/Schedule";

import { EMPTY_VALUE, FEEDBACK_MAX_RATING } from "../constants";
import { feedbackCategoryLabel, formatDateTime } from "../utils";
import type { FeedbackResponse } from "../types";

type Props = {
  feedback: FeedbackResponse | null;
  onClose: () => void;
  onToggleRead: () => void;
  onDelete: () => void;
};

/** Uma linha de dado do detalhe. */
function DetailRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Stack direction="row" spacing={1.25} alignItems="flex-start">
      <Box sx={{ color: "text.secondary", mt: 0.25 }}>{icon}</Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>
        <Box sx={{ wordBreak: "break-word" }}>{children}</Box>
      </Box>
    </Stack>
  );
}

export default function FeedbackDetailsModal({
  feedback,
  onClose,
  onToggleRead,
  onDelete,
}: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  if (!feedback) return null;

  return (
    <Dialog
      open
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{ sx: { borderRadius: { xs: 0, sm: 3 } } }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ p: 2, pb: 1 }}
      >
        <DialogTitle sx={{ p: 0, fontSize: { xs: "1rem", md: "1.15rem" } }}>
          Detalhes da avaliação
        </DialogTitle>
        <IconButton onClick={onClose} aria-label="Fechar">
          <CloseIcon />
        </IconButton>
      </Stack>

      <DialogContent dividers>
        <Stack spacing={2}>
          <DetailRow icon={<PersonIcon fontSize="small" />} label="Quem avaliou">
            <Typography>{feedback.name}</Typography>
          </DetailRow>

          <DetailRow icon={<EmailIcon fontSize="small" />} label="E-mail">
            <Typography>{feedback.email ?? EMPTY_VALUE}</Typography>
          </DetailRow>

          <DetailRow icon={<CategoryIcon fontSize="small" />} label="Categoria">
            <Typography>{feedbackCategoryLabel(feedback.category)}</Typography>
          </DetailRow>

          <DetailRow icon={<ScheduleIcon fontSize="small" />} label="Enviada em">
            <Typography>{formatDateTime(feedback.createdAt)}</Typography>
          </DetailRow>

          <Stack direction="row" spacing={1.5} alignItems="center">
            <Rating
              value={feedback.rating}
              max={FEEDBACK_MAX_RATING}
              readOnly
              size="small"
            />
            <Typography variant="body2" color="text.secondary">
              {feedback.rating} de {FEEDBACK_MAX_RATING}
            </Typography>
            <Chip
              size="small"
              label={feedback.read ? "Lida" : "Não lida"}
              color={feedback.read ? "success" : "warning"}
            />
          </Stack>

          <Divider />

          <Box>
            <Typography variant="caption" color="text.secondary">
              Comentário
            </Typography>
            <Typography sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
              {feedback.comment}
            </Typography>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions
        sx={{
          p: 2,
          gap: 1,
          flexDirection: { xs: "column-reverse", sm: "row" },
          alignItems: { xs: "stretch", sm: "center" },
        }}
      >
        <Button onClick={onClose} fullWidth={isMobile}>
          Fechar
        </Button>

        <Button
          onClick={onToggleRead}
          variant="outlined"
          fullWidth={isMobile}
          startIcon={
            feedback.read ? <MarkEmailUnreadIcon /> : <MarkEmailReadIcon />
          }
        >
          {feedback.read ? "Marcar como não lida" : "Marcar como lida"}
        </Button>

        <Button
          onClick={onDelete}
          variant="contained"
          color="error"
          fullWidth={isMobile}
          startIcon={<DeleteIcon />}
        >
          Excluir
        </Button>
      </DialogActions>
    </Dialog>
  );
}
