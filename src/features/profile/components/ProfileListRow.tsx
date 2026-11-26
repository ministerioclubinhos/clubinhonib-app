import React from "react";
import { Avatar, Box, Chip, Paper, Stack, Typography, alpha } from "@mui/material";
import CakeIcon from "@mui/icons-material/Cake";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

import type { CompleteProfile } from "../types";
import {
  calculateAge,
  formatBirthDateShort,
  getBirthdayStatus,
  getInitials,
  isProfileIncomplete,
} from "../utils";
import { getGenderStyle, roleConfig } from "./profileStyles";

interface ProfileListRowProps {
  profile: CompleteProfile;
  onClick: () => void;
}

/** A mesma pessoa do card, em uma linha: para varrer muita gente rápido. */
const ProfileListRow: React.FC<ProfileListRowProps> = ({ profile, onClick }) => {
  const roleStyle = roleConfig[profile.role?.toLowerCase()] ?? roleConfig.teacher;
  const genderStyle = getGenderStyle(profile.personalData?.gender);
  const birthDate = profile.personalData?.birthDate;
  const age = calculateAge(birthDate);
  const isBirthdayToday = getBirthdayStatus(birthDate) === "today";
  const incomplete = isProfileIncomplete(profile);

  return (
    <Paper
      data-testid="profile-profile-row"
      elevation={0}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick();
        }
      }}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        px: { xs: 1.5, sm: 2 },
        py: 1.25,
        borderRadius: 3,
        border: 1,
        borderColor: isBirthdayToday ? "#f6416c" : "divider",
        cursor: "pointer",
        transition: "all .2s ease",
        "&:hover, &:focus-visible": {
          outline: "none",
          borderColor: genderStyle.color,
          bgcolor: alpha(genderStyle.color, 0.05),
          boxShadow: `0 6px 18px ${alpha(genderStyle.color, 0.14)}`,
        },
      }}
    >
      <Avatar
        src={profile.image?.url}
        alt={profile.name}
        sx={{
          width: 42,
          height: 42,
          fontWeight: 800,
          background: profile.image?.url ? "transparent" : genderStyle.gradient,
        }}
      >
        {!profile.image?.url && getInitials(profile.name)}
      </Avatar>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="subtitle2" fontWeight={800} noWrap title={profile.name}>
          {profile.name}
        </Typography>
        <Typography variant="caption" color="text.secondary" noWrap sx={{ display: "block" }}>
          {profile.email}
        </Typography>
      </Box>

      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        sx={{ display: { xs: "none", sm: "flex" }, flexShrink: 0 }}
      >
        {birthDate ? (
          <Chip
            size="small"
            icon={<CakeIcon sx={{ fontSize: "14px !important" }} />}
            label={`${formatBirthDateShort(birthDate)}${age !== null ? ` · ${age}` : ""}`}
            sx={{
              height: 24,
              fontWeight: 600,
              bgcolor: isBirthdayToday ? alpha("#f6416c", 0.12) : "action.hover",
              color: isBirthdayToday ? "#f6416c" : "text.secondary",
            }}
          />
        ) : null}
        {incomplete ? (
          <Chip size="small" color="warning" variant="outlined" label="Incompleto" sx={{ height: 24 }} />
        ) : null}
      </Stack>

      <Chip
        size="small"
        label={roleStyle.label}
        sx={{
          height: 24,
          fontWeight: 700,
          color: roleStyle.color,
          bgcolor: roleStyle.bgLight,
          flexShrink: 0,
        }}
      />
      <ChevronRightIcon fontSize="small" sx={{ color: "text.disabled" }} />
    </Paper>
  );
};

export default ProfileListRow;
