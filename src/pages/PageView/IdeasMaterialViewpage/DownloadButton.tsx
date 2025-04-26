import { Button } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';

interface DownloadButtonProps {
  url: string;
  filename?: string;
  disabled?: boolean;
}

export default function DownloadButton({ url, filename, disabled }: DownloadButtonProps) {
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
      size="small"
      sx={{
        mt: 1,
        borderRadius: 2,
        textTransform: 'none',
        '&:hover': {
          bgcolor: 'primary.dark',
        },
      }}
    >
      Baixar
    </Button>
  );
}
