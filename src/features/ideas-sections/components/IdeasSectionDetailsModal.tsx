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
  Link,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import DescriptionIcon from "@mui/icons-material/Description";
import ImageIcon from "@mui/icons-material/Image";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import PlaylistAddCheckIcon from "@mui/icons-material/PlaylistAddCheck";
import ScheduleIcon from "@mui/icons-material/Schedule";
import VideocamIcon from "@mui/icons-material/Videocam";

import { EMPTY_VALUE } from "../constants";
import {
  formatDateTime,
  formatFileSize,
  isPending,
  mediaTypeLabel,
} from "../utils";
import type { IdeasSectionMedia, IdeasSectionResponse } from "../types";

type Props = {
  section: IdeasSectionResponse | null;
  open: boolean;
  onClose: () => void;
  onReview: () => void;
  onDelete: () => void;
};

/** Ícone que representa o tipo da mídia. */
function MediaIcon({ mediaType }: { mediaType: string }) {
  if (mediaType === "video") return <VideocamIcon fontSize="small" />;
  if (mediaType === "document") return <DescriptionIcon fontSize="small" />;
  return <ImageIcon fontSize="small" />;
}

/** Uma mídia da ideia, com o link para abri-la. */
function MediaRow({ media }: { media: IdeasSectionMedia }) {
  return (
    <Stack
      direction="row"
      spacing={1.25}
      alignItems="center"
      sx={{ py: 0.75, minWidth: 0 }}
    >
      <Box sx={{ color: "text.secondary", display: "flex" }}>
        <MediaIcon mediaType={media.mediaType} />
      </Box>

      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography variant="body2" noWrap title={media.title ?? undefined}>
          {media.title?.trim() || media.originalName || EMPTY_VALUE}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {mediaTypeLabel(media.mediaType)}
          {media.size ? ` · ${formatFileSize(media.size)}` : ""}
        </Typography>
      </Box>

      {media.url ? (
        <Link
          href={media.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Abrir mídia"
          sx={{ display: "inline-flex", flexShrink: 0 }}
        >
          <OpenInNewIcon fontSize="small" />
        </Link>
      ) : null}
    </Stack>
  );
}

export default function IdeasSectionDetailsModal({
  section,
  open,
  onClose,
  onReview,
  onDelete,
}: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  if (!section) return null;

  const pendente = isPending(section);

  return (
    <Dialog
      open={open}
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
          Detalhes da ideia
        </DialogTitle>
        <IconButton onClick={onClose} aria-label="Fechar">
          <CloseIcon />
        </IconButton>
      </Stack>

      <DialogContent dividers>
        <Stack spacing={2}>
          <Box>
            <Typography variant="h6" fontWeight={700}>
              {section.title}
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
              <Chip
                size="small"
                label={pendente ? "Aguardando decisão" : "Publicada"}
                color={pendente ? "warning" : "success"}
              />
              <Stack direction="row" spacing={0.5} alignItems="center">
                <ScheduleIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                <Typography variant="caption" color="text.secondary">
                  {formatDateTime(section.createdAt)}
                </Typography>
              </Stack>
            </Stack>
          </Box>

          <Box>
            <Typography variant="caption" color="text.secondary">
              Descrição
            </Typography>
            <Typography sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
              {section.description}
            </Typography>
          </Box>

          <Divider />

          <Box>
            <Typography variant="caption" color="text.secondary">
              Mídias ({section.medias.length})
            </Typography>
            {section.medias.length ? (
              <Stack divider={<Divider flexItem />}>
                {section.medias.map((media) => (
                  <MediaRow key={media.id} media={media} />
                ))}
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Esta ideia não tem mídias.
              </Typography>
            )}
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
          onClick={onReview}
          variant="contained"
          color="success"
          fullWidth={isMobile}
          startIcon={<PlaylistAddCheckIcon />}
        >
          {pendente ? "Revisar e publicar" : "Revisar"}
        </Button>

        <Button
          onClick={onDelete}
          variant="outlined"
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
