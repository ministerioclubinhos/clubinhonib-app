import React from "react";
import { Box, Stack, Typography } from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";

import { FAMILY_COLORS } from "./familyDayTheme";

export const SectionEyebrow = ({
  icon,
  children,
  color = FAMILY_COLORS.terracotta,
  background = "#FCE9E3",
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
  color?: string;
  background?: string;
}) => (
  <Stack
    direction="row"
    spacing={0.7}
    alignItems="center"
    sx={{
      width: "fit-content",
      px: 1.25,
      py: 0.65,
      borderRadius: 999,
      color,
      backgroundColor: background,
      "& .MuiSvgIcon-root": { fontSize: 18 },
    }}
  >
    {icon}
    <Typography
      component="span"
      sx={{
        fontSize: "0.72rem",
        lineHeight: 1,
        fontWeight: 850,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
      }}
    >
      {children}
    </Typography>
  </Stack>
);

export const CarouselArrow = ({
  direction,
  onClick,
  light = false,
}: {
  direction: "previous" | "next";
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  light?: boolean;
}) => {
  const isNext = direction === "next";

  return (
    <Box
      component="button"
      type="button"
      aria-label={isNext ? "Próximo item" : "Item anterior"}
      onClick={onClick}
      sx={{
        position: "absolute",
        top: "50%",
        [isNext ? "right" : "left"]: { xs: 8, sm: 16 },
        transform: "translateY(-50%)",
        zIndex: 4,
        width: { xs: 42, sm: 48 },
        height: { xs: 42, sm: 48 },
        p: 0,
        display: "grid",
        placeItems: "center",
        border: light
          ? "1px solid rgba(255,255,255,0.45)"
          : `1px solid ${FAMILY_COLORS.line}`,
        borderRadius: "50%",
        color: light ? FAMILY_COLORS.ink : FAMILY_COLORS.terracotta,
        backgroundColor: light
          ? "rgba(255,255,255,0.94)"
          : FAMILY_COLORS.paper,
        boxShadow: "0 12px 26px rgba(52, 43, 39, 0.18)",
        cursor: "pointer",
        transition: "transform .2s ease, background-color .2s ease",
        "&:hover": {
          transform: "translateY(-50%) scale(1.06)",
          backgroundColor: light ? FAMILY_COLORS.cream : "#FFF3EA",
        },
        "& .MuiSvgIcon-root": { fontSize: 24 },
      }}
    >
      {isNext ? <ArrowForwardRoundedIcon /> : <ArrowBackRoundedIcon />}
    </Box>
  );
};
