import React from "react";
import { Typography } from "@mui/material";
import AlternateEmailIcon from "@mui/icons-material/AlternateEmail";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import PhoneIphoneIcon from "@mui/icons-material/PhoneIphone";
import ScheduleIcon from "@mui/icons-material/Schedule";
import VisibilityIcon from "@mui/icons-material/Visibility";

import {
  CardActionButton,
  ListingCard,
  type ListingBadge,
} from "@/components/common/listing";
import { UserRole } from "@/types/shared";

import { formatDate, formatPhone, userInitials, userRoleLabel } from "../utils";
import type { UserResponse } from "../types";

type Props = {
  user: UserResponse;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  disabled?: boolean;
};

const ICON_SX = { fontSize: 16 } as const;

/** Cor da faixa lateral por papel. */
const ROLE_ACCENT: Record<UserRole, ListingBadge["color"]> = {
  [UserRole.ADMIN]: "error",
  [UserRole.COORDINATOR]: "secondary",
  [UserRole.TEACHER]: "primary",
};

/** Um usuário na grade. */
export default function UserCard({
  user,
  onView,
  onEdit,
  onDelete,
  disabled,
}: Props) {
  const badges: ListingBadge[] = [
    { label: userRoleLabel(user.role), color: ROLE_ACCENT[user.role] ?? "default" },
    user.active
      ? { label: "Ativo", color: "success" }
      : { label: "Inativo", color: "warning" },
  ];

  if (!user.completed) {
    badges.push({ label: "Cadastro incompleto", color: "default" });
  }

  return (
    <ListingCard
      avatar={userInitials(user.name)}
      title={user.name}
      subtitle={user.email}
      accent={user.active ? ROLE_ACCENT[user.role] ?? "default" : "default"}
      onClick={onView}
      badges={badges}
      meta={[
        {
          icon: <PhoneIphoneIcon sx={ICON_SX} />,
          label: formatPhone(user.phone),
        },
        {
          icon: <AlternateEmailIcon sx={ICON_SX} />,
          label: user.commonUser ? "Conta comum" : "Conta do ministério",
        },
        {
          icon: <ScheduleIcon sx={ICON_SX} />,
          label: `Atualizado em ${formatDate(user.updatedAt)}`,
        },
      ]}
      footer={
        <Typography variant="caption" color="text.secondary" noWrap>
          {user.active
            ? "Acessa o sistema normalmente"
            : "Sem acesso até ser reativado"}
        </Typography>
      }
      actions={
        <>
          <CardActionButton
            label="Ver detalhes"
            color="primary"
            onClick={onView}
          >
            <VisibilityIcon fontSize="small" />
          </CardActionButton>

          <CardActionButton
            label="Editar"
            color="info"
            disabled={disabled}
            onClick={onEdit}
          >
            <EditIcon fontSize="small" />
          </CardActionButton>

          <CardActionButton
            label="Excluir"
            color="error"
            disabled={disabled}
            onClick={onDelete}
          >
            <DeleteIcon fontSize="small" />
          </CardActionButton>
        </>
      }
    />
  );
}
