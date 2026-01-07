import { Button, useTheme, useMediaQuery } from '@mui/material';
import { motion } from 'framer-motion';
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
  disabled = false, 
  size = 'medium',
  fullWidth = false 
}: DownloadButtonProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          py: { xs: 0.5, md: 0.75 },
          px: { xs: 1.5, md: 2 },
          fontSize: { xs: '0.75rem', md: '0.8rem' },
          minHeight: { xs: 32, md: 36 },
        };
      case 'large':
        return {
          py: { xs: 1.5, md: 2 },
          px: { xs: 3, md: 4 },
          fontSize: { xs: '1rem', md: '1.1rem' },
          minHeight: { xs: 44, md: 48 },
        };
      default: 
        return {
          py: { xs: 1, md: 1.25 },
          px: { xs: 2, md: 2.5 },
          fontSize: { xs: '0.9rem', md: '1rem' },
          minHeight: { xs: 40, md: 44 },
        };
    }
  };

  return (
    <motion.div
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
    >
      <Button
        variant="contained"
        color="primary"
        startIcon={<DownloadIcon sx={{ fontSize: { xs: '1rem', md: '1.2rem' } }} />}
        href={url}
        download={filename}
        target="_blank"
        rel="noopener noreferrer"
        disabled={disabled}
        fullWidth={fullWidth}
        sx={{
          ...getSizeStyles(),
          borderRadius: 3,
          textTransform: 'none',
          fontWeight: 'bold',
          background: disabled 
            ? 'linear-gradient(135deg, #e0e0e0 0%, #bdbdbd 100%)'
            : 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
          color: disabled ? 'grey.500' : 'white',
          boxShadow: disabled 
            ? 'none'
            : '0 4px 16px rgba(33, 150, 243, 0.3)',
          transition: 'all 0.3s ease',
          '&:hover': {
            background: disabled 
              ? 'linear-gradient(135deg, #e0e0e0 0%, #bdbdbd 100%)'
              : 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
            transform: 'translateY(-2px)',
            boxShadow: disabled 
              ? 'none'
              : '0 6px 20px rgba(33, 150, 243, 0.4)',
          },
          '&:active': {
            transform: 'translateY(0px)',
            boxShadow: disabled 
              ? 'none'
              : '0 2px 8px rgba(33, 150, 243, 0.3)',
          },
          '&.Mui-disabled': {
            background: 'linear-gradient(135deg, #e0e0e0 0%, #bdbdbd 100%)',
            color: 'grey.500',
          },
        }}
      >
        Baixar
      </Button>
    </motion.div>
  );
}