import React from "react";
import { IconButton, Tooltip, Typography } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import PermMediaIcon from "@mui/icons-material/PermMedia";
import PlaylistAddCheckIcon from "@mui/icons-material/PlaylistAddCheck";
import ScheduleIcon from "@mui/icons-material/Schedule";
import VisibilityIcon from "@mui/icons-material/Visibility";

import { ListingCard } from "@/components/common/listing";

import { formatDateTime, isPending, mediaSummary } from "../utils";
import type { IdeasSectionResponse } from "../types";

type Props = {
  section: IdeasSectionResponse;
  onView: () => void;
  onReview: () => void;
  onDelete: () => void;
  disabled?: boolean;
};

const ICON_SX = { fontSize: 16 } as const;

/** Uma ideia compartilhada na fila da administração. */
export default function IdeasSectionCard({
  section,
  onView,
  onReview,
  onDelete,
  disabled,
}: Props) {
  const pendente = isPending(section);

  return (
    <ListingCard
      avatar={<PermMediaIcon />}
      title={section.title}
      subtitle={mediaSummary(section)}
      // Pendente chama atenção; já publicada descansa em verde.
      accent={pendente ? "warning" : "success"}
      onClick={onView}
      badges={[
        pendente
          ? { label: "Aguardando decisão", color: "warning" }
          : { label: "Publicada", color: "success" },
      ]}
      excerpt={section.description}
      meta={[
        {
          icon: <PermMediaIcon sx={ICON_SX} />,
          label: mediaSummary(section),
        },
        {
          icon: <ScheduleIcon sx={ICON_SX} />,
          label: formatDateTime(section.createdAt),
        },
      ]}
      footer={
        <Typography variant="caption" color="text.secondary" noWrap>
          {pendente ? "Fora do site" : "Visível no site"}
        </Typography>
      }
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

          <Tooltip title={pendente ? "Revisar e publicar" : "Revisar"}>
            <span>
              <IconButton
                size="small"
                color="success"
                disabled={disabled}
                aria-label={pendente ? "Revisar e publicar" : "Revisar"}
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
