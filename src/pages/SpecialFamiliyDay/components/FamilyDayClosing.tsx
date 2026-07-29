import { Box, Container, Typography } from "@mui/material";
import FamilyRestroomRoundedIcon from "@mui/icons-material/FamilyRestroomRounded";

import { FAMILY_COLORS, sectionWidthSx } from "./familyDayTheme";

export const FamilyDayClosing = () => (
  <Box
    component="section"
    sx={{
      px: 2,
      pb: { xs: 7, md: 10 },
      backgroundColor: FAMILY_COLORS.cream,
    }}
  >
    <Container maxWidth={false} sx={sectionWidthSx}>
      <Box
        sx={{
          position: "relative",
          width: "100%",
          mx: "auto",
          px: { xs: 2.4, sm: 5, md: 8 },
          py: { xs: 4.5, sm: 5.5, md: 6.5 },
          borderRadius: { xs: "34px", md: "48px" },
          color: FAMILY_COLORS.paper,
          backgroundColor: FAMILY_COLORS.terracotta,
          textAlign: "center",
          overflow: "hidden",
          boxShadow: "0 24px 65px rgba(169,63,43,.22)",
        }}
      >
        <Box
          aria-hidden="true"
          sx={{
            position: "absolute",
            width: 180,
            height: 180,
            borderRadius: "50%",
            left: -90,
            top: -90,
            border: "34px solid rgba(255,255,255,.13)",
          }}
        />
        <Box
          aria-hidden="true"
          sx={{
            position: "absolute",
            width: 150,
            height: 150,
            borderRadius: "42% 58% 63% 37%",
            right: -65,
            bottom: -80,
            backgroundColor: FAMILY_COLORS.sun,
            transform: "rotate(28deg)",
          }}
        />
        <FamilyRestroomRoundedIcon
          sx={{
            position: "relative",
            fontSize: { xs: 40, sm: 48 },
            color: "#FFD77E",
          }}
        />
        <Typography
          component="blockquote"
          sx={{
            position: "relative",
            maxWidth: 820,
            mx: "auto",
            mt: 1.5,
            fontSize: { xs: "1.3rem", sm: "1.7rem", md: "2rem" },
            lineHeight: 1.35,
            fontWeight: 800,
            letterSpacing: "-0.025em",
          }}
        >
          “Eu e minha casa serviremos ao Senhor.”
        </Typography>
        <Typography
          sx={{
            position: "relative",
            mt: 1.1,
            color: "rgba(255,255,255,.72)",
            fontSize: "0.74rem",
            fontWeight: 800,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
          }}
        >
          Josué 24:15
        </Typography>
      </Box>
    </Container>
  </Box>
);
