import React from "react";
import { Box, Paper, Skeleton, Typography, alpha } from "@mui/material";
import BadgeIcon from "@mui/icons-material/Badge";
import CakeIcon from "@mui/icons-material/Cake";
import GroupsIcon from "@mui/icons-material/Groups";
import PendingActionsIcon from "@mui/icons-material/PendingActions";

import { UserRole } from "@/types/shared";

import type { ProfilesSummary } from "../types";
import { roleConfig } from "./profileStyles";

interface StatCard {
  id: string;
  label: string;
  value: number;
  color: string;
  icon: React.ReactElement;
  /** Quando existe, o cartão vira um atalho de filtro. */
  onClick?: () => void;
  active?: boolean;
  hint?: string;
}

interface ProfilesStatsProps {
  summary: ProfilesSummary | null;
  loading: boolean;
  /** O coordenador só enxerga professores: não há o que separar por papel. */
  showRoleBreakdown: boolean;
  activeRole?: string;
  birthdayFilterActive: boolean;
  onSelectRole: (role: UserRole | undefined) => void;
  onToggleBirthdays: () => void;
}

const ProfilesStats: React.FC<ProfilesStatsProps> = ({
  summary,
  loading,
  showRoleBreakdown,
  activeRole,
  birthdayFilterActive,
  onSelectRole,
  onToggleBirthdays,
}) => {
  if (!loading && !summary) return null;

  const cards: StatCard[] = [
    {
      id: "total",
      label: "Pessoas",
      value: summary?.total ?? 0,
      color: "#667eea",
      icon: <GroupsIcon />,
      onClick: showRoleBreakdown ? () => onSelectRole(undefined) : undefined,
      active: showRoleBreakdown && !activeRole && !birthdayFilterActive,
    },
    ...(showRoleBreakdown
      ? [UserRole.TEACHER, UserRole.COORDINATOR, UserRole.ADMIN].map(
          (role): StatCard => {
            const config = roleConfig[role];
            const value =
              role === UserRole.TEACHER
                ? summary?.teachers
                : role === UserRole.COORDINATOR
                  ? summary?.coordinators
                  : summary?.admins;

            return {
              id: role,
              label: config.pluralLabel,
              value: value ?? 0,
              color: config.color,
              icon: <BadgeIcon />,
              onClick: () => onSelectRole(role),
              active: activeRole === role,
            };
          },
        )
      : []),
    {
      id: "birthdays",
      label: "Aniversários do mês",
      value: summary?.birthdaysThisMonth ?? 0,
      color: "#f6416c",
      icon: <CakeIcon />,
      onClick: onToggleBirthdays,
      active: birthdayFilterActive,
    },
    {
      id: "incomplete",
      label: "Perfis incompletos",
      value: summary?.incomplete ?? 0,
      color: "#ed6c02",
      icon: <PendingActionsIcon />,
      hint: "Sem data de nascimento ou preferências",
    },
  ];

  return (
    <Box
      data-testid="profile-profiles-stats"
      sx={{
        display: "grid",
        gap: { xs: 1, sm: 1.5 },
        mb: 2,
        gridTemplateColumns: {
          xs: "repeat(2, minmax(0, 1fr))",
          md: `repeat(${cards.length}, minmax(0, 1fr))`,
        },
      }}
    >
      {cards.map((card) => {
        const interactive = Boolean(card.onClick);

        return (
          <Paper
            key={card.id}
            elevation={0}
            component={interactive ? "button" : "div"}
            type={interactive ? "button" : undefined}
            onClick={card.onClick}
            aria-pressed={interactive ? card.active : undefined}
            title={card.hint}
            sx={{
              p: { xs: 1.25, sm: 1.5 },
              borderRadius: 3,
              border: 1,
              borderColor: card.active ? card.color : "divider",
              bgcolor: card.active ? alpha(card.color, 0.08) : "background.paper",
              display: "flex",
              alignItems: "center",
              gap: 1,
              textAlign: "left",
              font: "inherit",
              color: "inherit",
              cursor: interactive ? "pointer" : "default",
              transition: "all .2s ease",
              "&:hover": interactive
                ? {
                    borderColor: card.color,
                    transform: "translateY(-2px)",
                    boxShadow: `0 8px 20px ${alpha(card.color, 0.16)}`,
                  }
                : undefined,
              "&:focus-visible": {
                outline: `2px solid ${card.color}`,
                outlineOffset: 2,
              },
            }}
          >
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 2,
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: card.color,
                bgcolor: alpha(card.color, 0.12),
              }}
            >
              {card.icon}
            </Box>
            <Box sx={{ minWidth: 0 }}>
              {loading ? (
                <Skeleton width={36} height={30} />
              ) : (
                <Typography variant="h5" fontWeight={800} lineHeight={1.1}>
                  {card.value}
                </Typography>
              )}
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", lineHeight: 1.2, overflowWrap: "normal" }}
              >
                {card.label}
              </Typography>
            </Box>
          </Paper>
        );
      })}
    </Box>
  );
};

export default ProfilesStats;
