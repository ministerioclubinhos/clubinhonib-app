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
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import HomeWorkIcon from "@mui/icons-material/HomeWork";
import PersonIcon from "@mui/icons-material/Person";
import PublicIcon from "@mui/icons-material/Public";
import PublicOffIcon from "@mui/icons-material/PublicOff";
import ScheduleIcon from "@mui/icons-material/Schedule";

import { formatDateTime } from "../utils";
import type { CommentResponse } from "../types";

type Props = {
  comment: CommentResponse | null;
  onClose: () => void;
  onEdit: () => void;
  onTogglePublished: () => void;
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

export default function CommentDetailsModal({
  comment,
  onClose,
  onEdit,
  onTogglePublished,
  onDelete,
}: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  if (!comment) return null;

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
          Detalhes do comentário
        </DialogTitle>
        <IconButton onClick={onClose} aria-label="Fechar">
          <CloseIcon />
        </IconButton>
      </Stack>

      <DialogContent dividers>
        <Stack spacing={2}>
          <DetailRow icon={<PersonIcon fontSize="small" />} label="Quem comentou">
            <Typography>{comment.name}</Typography>
          </DetailRow>

          <DetailRow icon={<HomeWorkIcon fontSize="small" />} label="Clubinho e bairro">
            <Typography>
              Clubinho {comment.clubinho} · {comment.neighborhood}
            </Typography>
          </DetailRow>

          <DetailRow icon={<ScheduleIcon fontSize="small" />} label="Enviado em">
            <Typography>{formatDateTime(comment.createdAt)}</Typography>
          </DetailRow>

          <Chip
            size="small"
            label={comment.published ? "Publicado" : "Aguardando publicação"}
            color={comment.published ? "success" : "warning"}
            sx={{ alignSelf: "flex-start" }}
          />

          <Divider />

          <Box>
            <Typography variant="caption" color="text.secondary">
              Comentário
            </Typography>
            <Typography sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
              {comment.comment}
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
          onClick={onEdit}
          variant="outlined"
          fullWidth={isMobile}
          startIcon={<EditIcon />}
        >
          Editar
        </Button>

        <Button
          onClick={onTogglePublished}
          variant="outlined"
          color={comment.published ? "inherit" : "success"}
          fullWidth={isMobile}
          startIcon={comment.published ? <PublicOffIcon /> : <PublicIcon />}
        >
          {comment.published ? "Despublicar" : "Publicar"}
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
