import React, { useState } from "react";
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
  ImageList,
  ImageListItem,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import PlaylistAddCheckIcon from "@mui/icons-material/PlaylistAddCheck";
import ScheduleIcon from "@mui/icons-material/Schedule";

import { formatDateTime, imageMedias, isPending } from "../utils";
import type { ImageSectionResponse } from "../types";

type Props = {
  section: ImageSectionResponse | null;
  open: boolean;
  onClose: () => void;
  onReview: () => void;
  onDelete: () => void;
};

export default function ImageSectionDetailsModal({
  section,
  open,
  onClose,
  onReview,
  onDelete,
}: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [ampliada, setAmpliada] = useState<string | null>(null);

  if (!section) return null;

  const fotos = imageMedias(section);
  const pendente = isPending(section);

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
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
            Detalhes da publicação
          </DialogTitle>
          <IconButton onClick={onClose} aria-label="Fechar">
            <CloseIcon />
          </IconButton>
        </Stack>

        <DialogContent dividers>
          <Stack spacing={2}>
            <Box>
              <Typography variant="h6" fontWeight={700}>
                {section.caption}
              </Typography>
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{ mt: 0.5 }}
              >
                <Chip
                  size="small"
                  label={pendente ? "Aguardando aprovação" : "No feed"}
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

            {section.description ? (
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Descrição
                </Typography>
                <Typography
                  sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
                >
                  {section.description}
                </Typography>
              </Box>
            ) : null}

            <Divider />

            <Box>
              <Typography variant="caption" color="text.secondary">
                Fotos ({fotos.length})
              </Typography>

              {fotos.length ? (
                <ImageList
                  cols={isMobile ? 2 : 3}
                  gap={8}
                  sx={{ mt: 1, mb: 0, overflow: "visible" }}
                >
                  {fotos.map((media) => (
                    <ImageListItem
                      key={media.id}
                      onClick={() => setAmpliada(media.url)}
                      sx={{
                        cursor: "zoom-in",
                        borderRadius: 2,
                        overflow: "hidden",
                        border: 1,
                        borderColor: "divider",
                      }}
                    >
                      <img
                        src={media.url}
                        alt={media.title ?? section.caption}
                        loading="lazy"
                        style={{
                          width: "100%",
                          aspectRatio: "1 / 1",
                          objectFit: "cover",
                          display: "block",
                        }}
                      />
                    </ImageListItem>
                  ))}
                </ImageList>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Esta publicação está sem fotos.
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
            {pendente ? "Revisar e aprovar" : "Revisar"}
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

      {/* Revisar foto é olhar de perto: um toque amplia sem sair da tela. */}
      <Dialog
        open={!!ampliada}
        onClose={() => setAmpliada(null)}
        maxWidth="lg"
        onClick={() => setAmpliada(null)}
        PaperProps={{ sx: { bgcolor: "transparent", boxShadow: "none" } }}
      >
        {ampliada ? (
          <Box
            component="img"
            src={ampliada}
            alt="Foto ampliada"
            sx={{
              maxWidth: "100%",
              maxHeight: "85dvh",
              borderRadius: 2,
              display: "block",
            }}
          />
        ) : null}
      </Dialog>
    </>
  );
}
