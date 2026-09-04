import React from "react";
import { Typography } from "@mui/material";
import CakeIcon from "@mui/icons-material/Cake";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import GroupsIcon from "@mui/icons-material/Groups";
import PhoneIphoneIcon from "@mui/icons-material/PhoneIphone";
import PlaceIcon from "@mui/icons-material/Place";
import ToggleOffIcon from "@mui/icons-material/ToggleOff";
import ToggleOnIcon from "@mui/icons-material/ToggleOn";
import VisibilityIcon from "@mui/icons-material/Visibility";

import {
  CardActionButton,
  ListingCard,
  type ListingBadge,
} from "@/components/common/listing";

import { Gender } from "../constants";
import {
  ageInYears,
  childInitials,
  cityLabel,
  clubLabel,
  formatDateOnly,
  formatPhone,
  genderLabel,
} from "../utils";
import type { ChildResponse } from "../types";

type Props = {
  child: ChildResponse;
  onView: () => void;
  onEdit: () => void;
  onToggleActive: () => void;
  onDelete: () => void;
  disabled?: boolean;
};

const ICON_SX = { fontSize: 16 } as const;

/** Uma criança na grade. */
export default function ChildCard({
  child,
  onView,
  onEdit,
  onToggleActive,
  onDelete,
  disabled,
}: Props) {
  const age = ageInYears(child.birthDate);

  const badges: ListingBadge[] = [
    child.isActive
      ? { label: "Ativa", color: "success" }
      : { label: "Inativa", color: "warning" },
    {
      label: genderLabel(child.gender),
      color: child.gender === Gender.FEMALE ? "secondary" : "info",
    },
    child.club
      ? { label: clubLabel(child), color: "primary" }
      : { label: "Sem clubinho", color: "default" },
  ];

  return (
    <ListingCard
      avatar={childInitials(child.name)}
      title={child.name}
      subtitle={`Responsável: ${child.guardianName}`}
      accent={
        child.isActive
          ? child.gender === Gender.FEMALE
            ? "secondary"
            : "primary"
          : "default"
      }
      onClick={onView}
      badges={badges}
      meta={[
        {
          icon: <CakeIcon sx={ICON_SX} />,
          label:
            age === null
              ? formatDateOnly(child.birthDate)
              : `${formatDateOnly(child.birthDate)} · ${age} ano(s)`,
        },
        {
          icon: <PhoneIphoneIcon sx={ICON_SX} />,
          label: formatPhone(child.guardianPhone),
        },
        { icon: <PlaceIcon sx={ICON_SX} />, label: cityLabel(child) },
        {
          icon: <GroupsIcon sx={ICON_SX} />,
          label: child.joinedAt
            ? `No clubinho desde ${formatDateOnly(child.joinedAt)}`
            : "Entrada não informada",
        },
      ]}
      footer={
        <Typography variant="caption" color="text.secondary" noWrap>
          {child.isActive ? "Participando" : "Fora das atividades"}
        </Typography>
      }
      actions={
        <>
          <CardActionButton label="Ver detalhes" color="primary" onClick={onView}>
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
            label={child.isActive ? "Inativar" : "Reativar"}
            color={child.isActive ? "warning" : "success"}
            disabled={disabled}
            onClick={onToggleActive}
          >
            {child.isActive ? (
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
