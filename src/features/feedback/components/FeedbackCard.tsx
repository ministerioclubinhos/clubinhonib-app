import React from "react";
import { IconButton, Rating, Tooltip, Typography } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead";
import MarkEmailUnreadIcon from "@mui/icons-material/MarkEmailUnread";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CategoryIcon from "@mui/icons-material/Category";
import ScheduleIcon from "@mui/icons-material/Schedule";

import { ListingCard } from "@/components/common/listing";

import { FEEDBACK_MAX_RATING } from "../constants";
import {
  feedbackCategoryLabel,
  feedbackInitials,
  formatDateTime,
  ratingAccent,
} from "../utils";
import type { FeedbackResponse } from "../types";

type Props = {
  feedback: FeedbackResponse;
  onView: () => void;
  onToggleRead: () => void;
  onDelete: () => void;
  disabled?: boolean;
};

const ICON_SX = { fontSize: 16 } as const;

/** Uma avaliação na grade, no formato compartilhado pelas três listagens. */
export default function FeedbackCard({
  feedback,
  onView,
  onToggleRead,
  onDelete,
  disabled,
}: Props) {
  return (
    <ListingCard data-testid={`feedback-feedback-card-${feedback.id}`}
      avatar={feedbackInitials(feedback.name)}
      title={feedback.name}
      subtitle={feedback.email ?? undefined}
      accent={ratingAccent(feedback.rating)}
      onClick={onView}
      badges={[
        feedback.read
          ? { label: "Lida", color: "success" }
          : { label: "Não lida", color: "warning" },
      ]}
      excerpt={feedback.comment}
      meta={[
        {
          icon: <CategoryIcon sx={ICON_SX} />,
          label: feedbackCategoryLabel(feedback.category),
        },
        {
          icon: <ScheduleIcon sx={ICON_SX} />,
          label: formatDateTime(feedback.createdAt),
        },
      ]}
      footer={
        <Rating
          value={feedback.rating}
          max={FEEDBACK_MAX_RATING}
          readOnly
          size="small"
        />
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

          <Tooltip title={feedback.read ? "Marcar como não lida" : "Marcar como lida"}>
            <span>
              <IconButton
                size="small"
                color={feedback.read ? "default" : "success"}
                disabled={disabled}
                aria-label={
                  feedback.read ? "Marcar como não lida" : "Marcar como lida"
                }
                onClick={(event) => {
                  event.stopPropagation();
                  onToggleRead();
                }}
              >
                {feedback.read ? (
                  <MarkEmailUnreadIcon fontSize="small" />
                ) : (
                  <MarkEmailReadIcon fontSize="small" />
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

/** Nota em texto, para quem usa leitor de tela. */
export function FeedbackRatingLabel({ rating }: { rating: number }) {
  return (
    <Typography data-testid="feedback-feedback-card-feedback-rating-label" variant="caption" color="text.secondary">
      {rating} de {FEEDBACK_MAX_RATING}
    </Typography>
  );
}
