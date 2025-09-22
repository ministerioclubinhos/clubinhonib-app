import { Button, useTheme, useMediaQuery } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';

interface DownloadButtonProps {
  url: string;
  filename?: string;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
}

export default function DownloadButton({ 
  url, 
  filename, 
  disabled, 
  size = 'small',
  fullWidth = false 
}: DownloadButtonProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Button
      variant="contained"
      color="primary"
      startIcon={<DownloadIcon />}
      href={url}
      download={filename}
      target="_blank"
      rel="noopener noreferrer"
      disabled={disabled}
      size={size}
      fullWidth={fullWidth}
      sx={{
        borderRadius: { xs: 1.5, sm: 2 },
        textTransform: 'none',
        fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.8rem' },
        py: { xs: 0.4, sm: 0.5, md: 0.75 },
        minHeight: { xs: 28, sm: 32, md: 36 },
        '&:hover': {
          bgcolor: 'primary.dark',
          transform: 'translateY(-1px)',
        },
        transition: 'all 0.2s ease',
      }}
    >
      Baixar
    </Button>
  );
}
