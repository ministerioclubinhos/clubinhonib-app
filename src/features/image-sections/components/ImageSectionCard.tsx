import React from "react";
import { Box, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import CollectionsIcon from "@mui/icons-material/Collections";
import DeleteIcon from "@mui/icons-material/Delete";
import PlaylistAddCheckIcon from "@mui/icons-material/PlaylistAddCheck";
import ScheduleIcon from "@mui/icons-material/Schedule";
import VisibilityIcon from "@mui/icons-material/Visibility";

import { ListingCard } from "@/components/common/listing";

import { CARD_THUMBNAIL_LIMIT } from "../constants";
import { formatDateTime, imageMedias, isPending, mediaSummary } from "../utils";
import type { ImageSectionResponse } from "../types";

type Props = {
  section: ImageSectionResponse;
  onView: () => void;
  onReview: () => void;
  onDelete: () => void;
  disabled?: boolean;
};

const ICON_SX = { fontSize: 16 } as const;

/**
 * Tira de miniaturas do card.
 *
 * A publicação é sobre fotos: o card mostra algumas, e não só o texto, para a
 * revisão acontecer sem precisar abrir cada uma.
 */
function ThumbnailStrip({ section }: { section: ImageSectionResponse }) {
  const fotos = imageMedias(section);
  if (!fotos.length) return null;

  const visiveis = fotos.slice(0, CARD_THUMBNAIL_LIMIT);
  const restantes = fotos.length - visiveis.length;

  return (
    <Stack direction="row" spacing={0.75} sx={{ mt: 0.5 }}>
      {visiveis.map((media) => (
        <Box
          key={media.id}
          component="img"
          src={media.url}
          alt={media.title ?? section.caption}
          loading="lazy"
          sx={{
            width: 56,
            height: 56,
            flexShrink: 0,
            objectFit: "cover",
            borderRadius: 1.5,
            border: 1,
            borderColor: "divider",
            bgcolor: "action.hover",
          }}
        />
      ))}

      {restantes > 0 ? (
        <Box
          sx={{
            width: 56,
            height: 56,
            flexShrink: 0,
            borderRadius: 1.5,
            border: 1,
            borderStyle: "dashed",
            borderColor: "divider",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography variant="caption" color="text.secondary">
            +{restantes}
          </Typography>
        </Box>
      ) : null}
    </Stack>
  );
}

/** Uma publicação de fotos na fila de revisão. */
export default function ImageSectionCard({
  section,
  onView,
  onReview,
  onDelete,
  disabled,
}: Props) {
  const pendente = isPending(section);

  return (
    <ListingCard
      avatar={<CollectionsIcon />}
      title={section.caption}
      subtitle={mediaSummary(section)}
      accent={pendente ? "warning" : "success"}
      onClick={onView}
      badges={[
        pendente
          ? { label: "Aguardando aprovação", color: "warning" }
          : { label: "No feed", color: "success" },
        ...(section.mediaItems.length === 0
          ? [{ label: "Sem fotos", color: "error" as const }]
          : []),
      ]}
      excerpt={section.description}
      meta={[
        {
          icon: <ScheduleIcon sx={ICON_SX} />,
          label: formatDateTime(section.createdAt),
        },
      ]}
      footer={<ThumbnailStrip section={section} />}
      actions={
        <>
          <Tooltip title="Ver detalhes">
            <IconButton
              size="small"
              color="primary"
              aria-label="Ver detalhes"
              onClick={(event) => {
                event.stopPropagation();
                onView();
              }}
            >
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title={pendente ? "Revisar e aprovar" : "Revisar"}>
            <span>
              <IconButton
                size="small"
                color="success"
                disabled={disabled}
                aria-label={pendente ? "Revisar e aprovar" : "Revisar"}
                onClick={(event) => {
                  event.stopPropagation();
                  onReview();
                }}
              >
                <PlaylistAddCheckIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>

          <Tooltip title="Excluir">
            <span>
              <IconButton
                size="small"
                color="error"
                disabled={disabled}
                aria-label="Excluir"
                onClick={(event) => {
                  event.stopPropagation();
                  onDelete();
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </>
      }
    />
  );
}
