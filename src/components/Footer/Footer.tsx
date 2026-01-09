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

const Footer: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box
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
          <Link href="/eventos" underline="hover" color="inherit" fontWeight="medium">Eventos</Link>
          <Link href="/contato" underline="hover" color="inherit" fontWeight="medium">Contato</Link>
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
        </Stack>
      </Stack>
    </Box>
  );
};

export default Footer;
