import React from "react";
import { Typography } from "@mui/material";
import GroupsIcon from "@mui/icons-material/Groups";
import LinkIcon from "@mui/icons-material/Link";
import PhoneIphoneIcon from "@mui/icons-material/PhoneIphone";
import SchoolIcon from "@mui/icons-material/School";
import VisibilityIcon from "@mui/icons-material/Visibility";

import {
  CardActionButton,
  ListingCard,
  type ListingBadge,
} from "@/components/common/listing";

import {
  coordinatorInitials,
  coordinatorName,
  coordinatorTeachers,
  formatPhone,
} from "../utils";
import type { CoordinatorResponse } from "../types";

type Props = {
  coordinator: CoordinatorResponse;
  onView: () => void;
  onManageClubs: () => void;
  /** Sem permissão de escrita, o botão vira consulta. */
  canManage: boolean;
  disabled?: boolean;
};

const ICON_SX = { fontSize: 16 } as const;

/** Quantos clubinhos aparecem como selo antes do resumo numérico. */
const MAX_CLUB_BADGES = 3;

/** Um coordenador na grade. */
export default function CoordinatorCard({
  coordinator,
  onView,
  onManageClubs,
  canManage,
  disabled,
}: Props) {
  const name = coordinatorName(coordinator);
  const clubs = coordinator.clubs ?? [];
  const teacherCount = coordinatorTeachers(coordinator).length;

  const badges: ListingBadge[] = [
    coordinator.active
      ? { label: "Ativo", color: "success" }
      : { label: "Inativo", color: "warning" },
  ];

  if (clubs.length === 0) {
    badges.push({ label: "Sem clubinho", color: "default" });
  } else {
    clubs.slice(0, MAX_CLUB_BADGES).forEach((club) =>
      badges.push({ label: `Clubinho ${club.number}`, color: "secondary" }),
    );

    if (clubs.length > MAX_CLUB_BADGES) {
      badges.push({
        label: `+${clubs.length - MAX_CLUB_BADGES}`,
        color: "default",
      });
    }
  }

  return (
    <ListingCard data-testid={`coordinators-coordinator-card-${coordinator.id}`}
      avatar={coordinatorInitials(name)}
      title={name}
      subtitle={coordinator.user?.email}
      accent={clubs.length > 0 ? "secondary" : "default"}
      onClick={onView}
      badges={badges}
      meta={[
        {
          icon: <PhoneIphoneIcon sx={ICON_SX} />,
          label: formatPhone(coordinator.user?.phone),
        },
        {
          icon: <GroupsIcon sx={ICON_SX} />,
          label: `${clubs.length} clubinho(s)`,
        },
        {
          icon: <SchoolIcon sx={ICON_SX} />,
          label: `${teacherCount} professor(es)`,
        },
      ]}
      footer={
        <Typography variant="caption" color="text.secondary" noWrap>
          {clubs.length > 0
            ? "Responsável por turmas"
            : "Aguardando clubinho"}
        </Typography>
      }
      actions={
        <>
          <CardActionButton label="Ver detalhes" color="primary" onClick={onView}>
            <VisibilityIcon fontSize="small" />
          </CardActionButton>

          <CardActionButton
            label={canManage ? "Gerenciar clubinhos" : "Ver clubinhos"}
            color="info"
            disabled={disabled}
            onClick={onManageClubs}
          >
            <LinkIcon fontSize="small" />
          </CardActionButton>
        </>
      }
    />
  );
}
