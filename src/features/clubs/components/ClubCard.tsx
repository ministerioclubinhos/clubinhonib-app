import React from "react";
import { Typography } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import EventIcon from "@mui/icons-material/Event";
import GroupsIcon from "@mui/icons-material/Groups";
import PersonIcon from "@mui/icons-material/Person";
import PlaceIcon from "@mui/icons-material/Place";
import ScheduleIcon from "@mui/icons-material/Schedule";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import ToggleOffIcon from "@mui/icons-material/ToggleOff";
import ToggleOnIcon from "@mui/icons-material/ToggleOn";
import VisibilityIcon from "@mui/icons-material/Visibility";

import {
  CardActionButton,
  ListingCard,
  type ListingBadge,
} from "@/components/common/listing";

import {
  formatClubAddress,
  formatClubTime,
  formatUserLabel,
  formatWeekday,
} from "../utils";
import type { ClubResponse } from "../types";

type Props = {
  club: ClubResponse;
  onView: () => void;
  onEdit: () => void;
  onToggleActive: () => void;
  onDelete: () => void;
  /** Só administração vincula coordenador; ver `utils/clubLinkPermissions`. */
  canManageCoordinator: boolean;
  onManageTeachers: () => void;
  onManageCoordinator: () => void;
  disabled?: boolean;
};

const ICON_SX = { fontSize: 16 } as const;

/** Um clubinho na grade. */
export default function ClubCard({
  club,
  onView,
  onEdit,
  onToggleActive,
  onDelete,
  canManageCoordinator,
  onManageTeachers,
  onManageCoordinator,
  disabled,
}: Props) {
  const badges: ListingBadge[] = [
    club.isActive
      ? { label: "Ativo", color: "success" }
      : { label: "Inativo", color: "warning" },
    club.coordinator
      ? { label: "Com coordenador", color: "primary" }
      : { label: "Sem coordenador", color: "default" },
    {
      label: `${club.teachers.length} professor(es)`,
      color: club.teachers.length > 0 ? "info" : "default",
    },
  ];

  return (
    <ListingCard
      avatar={String(club.number)}
      title={`Clubinho ${club.number}`}
      subtitle={formatClubAddress(club.address)}
      accent={club.isActive ? "primary" : "default"}
      onClick={onView}
      badges={badges}
      meta={[
        {
          icon: <EventIcon sx={ICON_SX} />,
          label: formatWeekday(club.weekday),
        },
        {
          icon: <ScheduleIcon sx={ICON_SX} />,
          label: formatClubTime(club.time),
        },
        {
          icon: <PlaceIcon sx={ICON_SX} />,
          label: club.address?.city ?? "Cidade não informada",
        },
        {
          icon: <SupervisorAccountIcon sx={ICON_SX} />,
          label: club.coordinator
            ? formatUserLabel(club.coordinator.user)
            : "Sem coordenador",
        },
      ]}
      footer={
        <Typography variant="caption" color="text.secondary" noWrap>
          {club.isActive ? "Em funcionamento" : "Fora das atividades"}
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
            label="Professores"
            color="info"
            disabled={disabled}
            onClick={onManageTeachers}
          >
            <GroupsIcon fontSize="small" />
          </CardActionButton>

          {canManageCoordinator && (
            <CardActionButton
              label="Coordenador"
              color="secondary"
              disabled={disabled}
              onClick={onManageCoordinator}
            >
              <PersonIcon fontSize="small" />
            </CardActionButton>
          )}

          <CardActionButton
            label="Editar"
            color="info"
            disabled={disabled}
            onClick={onEdit}
          >
            <EditIcon fontSize="small" />
          </CardActionButton>

          <CardActionButton
            label={club.isActive ? "Inativar" : "Reativar"}
            color={club.isActive ? "warning" : "success"}
            disabled={disabled}
            onClick={onToggleActive}
          >
            {club.isActive ? (
              <ToggleOnIcon fontSize="small" />
            ) : (
              <ToggleOffIcon fontSize="small" />
            )}
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
