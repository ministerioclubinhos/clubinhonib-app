import React from "react";
import {
  Box,
  Typography,
  IconButton,
  Link,
  Stack,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import YouTubeIcon from "@mui/icons-material/YouTube";
import FlagIcon from "@mui/icons-material/Flag";
import MonitorHeartIcon from "@mui/icons-material/MonitorHeart";

import { useSelector } from "react-redux";
import { Link as RouterLink } from "react-router-dom";
import { RootState } from "@/store/slices";
import { UserRole } from "@/types/shared";
import { FEATURE } from "@/features/feature-flags";
import { OBSERVABILITY_AUDIT_ROUTE, OBSERVABILITY_AUDIT_TEST_IDS } from "@/features/observability-audit/constants";
import { useFeatureFlags } from "@/hooks";

const Footer: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const { flags } = useFeatureFlags();
  const isAdmin = !!isAuthenticated && user?.role === UserRole.ADMIN;

  return (
    <Box data-testid="footer"
      component="footer"
      sx={{
        position: "relative",
        zIndex: 1220,
        backgroundColor: "#81d742",
        color: "white",
        px: { xs: 2, sm: 3 },
        py: { xs: 3, sm: 4 },
        textAlign: "center",
        width: "100%",
        mt: "auto",
      }}
    >
      <Stack
        direction={isMobile ? "column" : "row"}
        spacing={isMobile ? 3 : 6}
        alignItems="center"
        justifyContent="center"
        flexWrap="wrap"
        textAlign="center"
      >
        <Stack direction="row" spacing={3} justifyContent="center" flexWrap="wrap">
          <Link href="/" underline="hover" color="inherit" fontWeight="medium">Início</Link>
          <Link href="/sobre" underline="hover" color="inherit" fontWeight="medium">Sobre</Link>
          {flags[FEATURE.EVENTS_SECTION] && (
            <Link href="/eventos" underline="hover" color="inherit" fontWeight="medium">Eventos</Link>
          )}
          {flags[FEATURE.CONTACT_FORM] && (
            <Link href="/contato" underline="hover" color="inherit" fontWeight="medium">Contato</Link>
          )}
        </Stack>

        <Stack direction="row" spacing={2} justifyContent="center">
          <IconButton aria-label="Facebook" component="a" href="https://facebook.com/novaigrejabatista/" target="_blank" rel="noopener noreferrer" color="inherit">
            <FacebookIcon fontSize="small" />
          </IconButton>
          <IconButton aria-label="Instagram" component="a" href="https://instagram.com/novaigrejabatista/" target="_blank" rel="noopener noreferrer" color="inherit">
            <InstagramIcon fontSize="small" />
          </IconButton>
          <IconButton aria-label="YouTube" component="a" href="https://youtube.com/@novaigrejabatista" target="_blank" rel="noopener noreferrer" color="inherit">
            <YouTubeIcon fontSize="small" />
          </IconButton>
        </Stack>

        <Stack spacing={0.5} alignItems="center">
          <Typography variant="body2" sx={{ fontSize: "0.85rem" }}>
            © 2025 NIB - Nova Igreja Batista. Todos os direitos reservados.
          </Typography>
          <Typography variant="body2" sx={{ fontSize: "0.85rem" }}>
            Desenvolvido por{" "}
            <Link href="https://rodolfo-silva.com" target="_blank" rel="noopener noreferrer" color="inherit" fontWeight="bold" underline="hover">
              Diego Seven System
            </Link>
          </Typography>

          {isAdmin && (
            <Stack
              direction="row"
              spacing={2}
              justifyContent="center"
              flexWrap="wrap"
              useFlexGap
              sx={{ mt: 0.5, opacity: 0.45, transition: "opacity 0.2s ease", "&:hover, &:focus-within": { opacity: 1 } }}
            >
              <Link
                component={RouterLink}
                to="/adm/feature-flags"
                color="inherit"
                underline="hover"
                sx={{
                  fontSize: "0.75rem",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 0.5,
                  minHeight: 44,
                  color: "rgba(255, 255, 255, 0.9)",
                }}
              >
                <FlagIcon sx={{ fontSize: "0.85rem" }} />
                <span>Feature Flags</span>
              </Link>
              <Link
                data-testid={OBSERVABILITY_AUDIT_TEST_IDS.footerLink}
                component={RouterLink}
                to={OBSERVABILITY_AUDIT_ROUTE}
                color="inherit"
                underline="hover"
                sx={{
                  fontSize: "0.75rem",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 0.5,
                  minHeight: 44,
                  color: "rgba(255, 255, 255, 0.9)",
                }}
              >
                <MonitorHeartIcon sx={{ fontSize: "0.85rem" }} />
                <span>Observabilidade e auditoria</span>
              </Link>
            </Stack>
          )}
        </Stack>
      </Stack>
    </Box>
  );
};

export default Footer;
