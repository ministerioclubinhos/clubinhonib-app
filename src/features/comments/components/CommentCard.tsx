import React from "react";
import { IconButton, Tooltip, Typography } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import HomeWorkIcon from "@mui/icons-material/HomeWork";
import PublicIcon from "@mui/icons-material/Public";
import PublicOffIcon from "@mui/icons-material/PublicOff";
import ScheduleIcon from "@mui/icons-material/Schedule";
import VisibilityIcon from "@mui/icons-material/Visibility";

import { ListingCard } from "@/components/common/listing";

import { commentInitials, formatDateTime } from "../utils";
import type { CommentResponse } from "../types";

type Props = {
  comment: CommentResponse;
  onView: () => void;
  onEdit: () => void;
  onTogglePublished: () => void;
  onDelete: () => void;
  disabled?: boolean;
};

const ICON_SX = { fontSize: 16 } as const;

/** Um comentário na grade. */
export default function CommentCard({
  comment,
  onView,
  onEdit,
  onTogglePublished,
  onDelete,
  disabled,
}: Props) {
  return (
    <ListingCard
      avatar={commentInitials(comment.name)}
      title={comment.name}
      subtitle={`Clubinho ${comment.clubinho}`}
      // Publicado descansa em verde; pendente chama atenção.
      accent={comment.published ? "success" : "warning"}
      onClick={onView}
      badges={[
        comment.published
          ? { label: "Publicado", color: "success" }
          : { label: "Aguardando publicação", color: "warning" },
      ]}
      excerpt={comment.comment}
      meta={[
        {
          icon: <HomeWorkIcon sx={ICON_SX} />,
          label: comment.neighborhood,
        },
        {
          icon: <ScheduleIcon sx={ICON_SX} />,
          label: formatDateTime(comment.createdAt),
        },
      ]}
      footer={
        <Typography variant="caption" color="text.secondary" noWrap>
          {comment.published ? "Visível no site" : "Fora do site"}
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

          <Tooltip title="Editar">
            <span>
              <IconButton
                size="small"
                color="info"
                disabled={disabled}
                aria-label="Editar"
                onClick={(event) => {
                  event.stopPropagation();
                  onEdit();
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>

          <Tooltip title={comment.published ? "Despublicar" : "Publicar"}>
            <span>
              <IconButton
                size="small"
                color={comment.published ? "default" : "success"}
                disabled={disabled}
                aria-label={comment.published ? "Despublicar" : "Publicar"}
                onClick={(event) => {
                  event.stopPropagation();
                  onTogglePublished();
                }}
              >
                {comment.published ? (
                  <PublicOffIcon fontSize="small" />
                ) : (
                  <PublicIcon fontSize="small" />
                )}
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
