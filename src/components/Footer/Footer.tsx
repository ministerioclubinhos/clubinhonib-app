import React from 'react';
import {
  Box,
  Typography,
  IconButton,
  Link,
  Stack,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import YouTubeIcon from '@mui/icons-material/YouTube';

const Footer: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: '#81d742',
        color: 'white',
        px: 3,
        py: 4,
        textAlign: 'center',
        width: '100%',
        mt: { xs: 0, md: 0 },
      }}
    >
      <Stack
        direction={isMobile ? 'column' : 'row'}
        spacing={isMobile ? 3 : 6}
        alignItems="center"
        justifyContent="center"
        flexWrap="wrap"
        textAlign="center"
      >
        {/* Navegação */}
        <Stack direction="row" spacing={3} justifyContent="center" flexWrap="wrap">
          <Link href="/" underline="hover" color="inherit" fontWeight="medium">
            Início
          </Link>
          <Link href="/sobre" underline="hover" color="inherit" fontWeight="medium">
            Sobre
          </Link>
          <Link href="/eventos" underline="hover" color="inherit" fontWeight="medium">
            Eventos
          </Link>
          <Link href="/contato" underline="hover" color="inherit" fontWeight="medium">
            Contato
          </Link>
        </Stack>

        {/* Redes sociais */}
        <Stack direction="row" spacing={2} justifyContent="center">
          <IconButton
            component="a"
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            color="inherit"
          >
            <FacebookIcon fontSize="small" />
          </IconButton>
          <IconButton
            component="a"
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            color="inherit"
          >
            <InstagramIcon fontSize="small" />
          </IconButton>
          <IconButton
            component="a"
            href="https://youtube.com"
            target="_blank"
            rel="noopener noreferrer"
            color="inherit"
          >
            <YouTubeIcon fontSize="small" />
          </IconButton>
        </Stack>

        {/* Direitos + Créditos */}
        <Stack spacing={0.5} alignItems="center">
          <Typography variant="body2" sx={{ fontSize: '0.85rem', textAlign: 'center' }}>
            © 2025 NIB - Nova Igreja Batista. Todos os direitos reservados.
          </Typography>
          <Typography variant="body2" sx={{ fontSize: '0.85rem', textAlign: 'center' }}>
            Desenvolvido por{' '}
            <Link
              href="https://rodolfo-silva.com"
              target="_blank"
              rel="noopener noreferrer"
              color="inherit"
              fontWeight="bold"
              underline="hover"
            >
              Diego Seven System
            </Link>
          </Typography>
        </Stack>
      </Stack>
    </Box>
  );
};

export default Footer;
