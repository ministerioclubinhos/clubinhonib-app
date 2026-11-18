import React from "react";
import { Typography } from "@mui/material";
import GroupsIcon from "@mui/icons-material/Groups";
import LinkOffIcon from "@mui/icons-material/LinkOff";
import PhoneIphoneIcon from "@mui/icons-material/PhoneIphone";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import VisibilityIcon from "@mui/icons-material/Visibility";

import {
  CardActionButton,
  ListingCard,
  type ListingBadge,
} from "@/components/common/listing";

import {
  clubLabel,
  formatPhone,
  teacherCoordinatorName,
  teacherInitials,
  teacherName,
} from "../utils";
import type { TeacherResponse } from "../types";

type Props = {
  teacher: TeacherResponse;
  onView: () => void;
  onEditClub: () => void;
  onUnassignClub: () => void;
  /** Sem permissão, as ações de escrita não aparecem. */
  canManage: boolean;
  disabled?: boolean;
};

const ICON_SX = { fontSize: 16 } as const;

/** Um professor na grade. */
export default function TeacherCard({
  teacher,
  onView,
  onEditClub,
  onUnassignClub,
  canManage,
  disabled,
}: Props) {
  const hasClub = !!teacher.club;
  const name = teacherName(teacher);

  const badges: ListingBadge[] = [
    teacher.active
      ? { label: "Ativo", color: "success" }
      : { label: "Inativo", color: "warning" },
    hasClub
      ? { label: `Clubinho ${teacher.club?.number}`, color: "primary" }
      : { label: "Sem clubinho", color: "default" },
  ];

  return (
    <ListingCard data-testid={`teachers-teacher-card-${teacher.id}`}
      avatar={teacherInitials(name)}
      title={name}
      subtitle={teacher.user?.email}
      accent={hasClub ? "primary" : "default"}
      onClick={onView}
      badges={badges}
      meta={[
        {
          icon: <PhoneIphoneIcon sx={ICON_SX} />,
          label: formatPhone(teacher.user?.phone),
        },
        {
          icon: <GroupsIcon sx={ICON_SX} />,
          label: clubLabel(teacher.club),
        },
        {
          icon: <SupervisorAccountIcon sx={ICON_SX} />,
          label: `Coord.: ${teacherCoordinatorName(teacher.club)}`,
        },
      ]}
      footer={
        <Typography variant="caption" color="text.secondary" noWrap>
          {hasClub ? "Atuando em turma" : "Aguardando vínculo"}
        </Typography>
      }
      actions={
        <>
          <CardActionButton label="Ver detalhes" color="primary" onClick={onView}>
            <VisibilityIcon fontSize="small" />
          </CardActionButton>

          {canManage ? (
            <>
              <CardActionButton
                label={hasClub ? "Trocar clubinho" : "Vincular clubinho"}
                color="info"
                disabled={disabled}
                onClick={onEditClub}
              >
                <SwapHorizIcon fontSize="small" />
              </CardActionButton>

              <CardActionButton
                label="Desvincular clubinho"
                color="warning"
                disabled={disabled || !hasClub}
                onClick={onUnassignClub}
              >
                <LinkOffIcon fontSize="small" />
              </CardActionButton>
            </>
          ) : null}
        </>
      }
    />
  );
}
