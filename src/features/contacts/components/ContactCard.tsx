import React from "react";
import { IconButton, Tooltip, Typography } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead";
import MarkEmailUnreadIcon from "@mui/icons-material/MarkEmailUnread";
import PhoneIcon from "@mui/icons-material/Phone";
import ScheduleIcon from "@mui/icons-material/Schedule";
import VisibilityIcon from "@mui/icons-material/Visibility";

import { ListingCard } from "@/components/common/listing";

import { contactInitials, formatDateTime, formatPhone } from "../utils";
import type { ContactResponse } from "../types";

type Props = {
  contact: ContactResponse;
  onView: () => void;
  onToggleRead: () => void;
  onDelete: () => void;
  disabled?: boolean;
};

const ICON_SX = { fontSize: 16 } as const;

/** Uma mensagem de contato na grade. */
export default function ContactCard({
  contact,
  onView,
  onToggleRead,
  onDelete,
  disabled,
}: Props) {
  return (
    <ListingCard data-testid={`contacts-contact-card-${contact.id}`}
      avatar={contactInitials(contact.name)}
      title={contact.name}
      subtitle={contact.email}
      // Não lido chama atenção; lido descansa em cinza.
      accent={contact.read ? "default" : "warning"}
      onClick={onView}
      badges={[
        contact.read
          ? { label: "Lido", color: "success" }
          : { label: "Não lido", color: "warning" },
      ]}
      excerpt={contact.message}
      meta={[
        {
          icon: <PhoneIcon sx={ICON_SX} />,
          label: formatPhone(contact.phone),
        },
        {
          icon: <ScheduleIcon sx={ICON_SX} />,
          label: formatDateTime(contact.createdAt),
        },
      ]}
      footer={
        <Typography variant="caption" color="text.secondary" noWrap>
          {contact.read ? "Respondido ou arquivado" : "Aguardando resposta"}
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

          <Tooltip title={contact.read ? "Marcar como não lido" : "Marcar como lido"}>
            <span>
              <IconButton
                size="small"
                color={contact.read ? "default" : "success"}
                disabled={disabled}
                aria-label={
                  contact.read ? "Marcar como não lido" : "Marcar como lido"
                }
                onClick={(event) => {
                  event.stopPropagation();
                  onToggleRead();
                }}
              >
                {contact.read ? (
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
