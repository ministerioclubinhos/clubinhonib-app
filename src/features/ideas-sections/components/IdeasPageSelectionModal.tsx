import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  CircularProgress,
  Alert,
  Box,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Close, Check } from '@mui/icons-material';
import { IdeasPage } from '../types';

interface Props {
  open: boolean;
  pages: IdeasPage[];
  loading: boolean;
  error: string;
  onClose: () => void;
  onSelect: (page: IdeasPage) => void;
}

export default function IdeasPageSelectionModal({ 
  open, 
  pages, 
  loading, 
  error, 
  onClose, 
  onSelect 
}: Props) {
  const handleSelect = (page: IdeasPage) => {
    onSelect(page);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      aria-labelledby="page-selection-title"
      sx={{ '& .MuiDialog-paper': { borderRadius: 3 } }}
    >
      <DialogTitle 
        id="page-selection-title"
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          pr: 1 
        }}
      >
        Selecionar Página de Ideias
        <Tooltip title="Fechar">
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Tooltip>
      </DialogTitle>
      
      <DialogContent sx={{ pb: 1 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Escolha a página de ideias onde esta seção será publicada:
        </Typography>
        
        {loading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : pages.length === 0 ? (
          <Alert severity="info">
            Nenhuma página de ideias encontrada.
          </Alert>
        ) : (
          <List sx={{ maxHeight: 400, overflow: 'auto' }}>
            {pages.map((page) => (
              <ListItem key={page.id} disablePadding>
                <ListItemButton
                  onClick={() => handleSelect(page)}
                  sx={{
                    borderRadius: 1,
                    mb: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                    '&:hover': {
                      bgcolor: 'action.hover',
                      borderColor: 'primary.main',
                    },
                  }}
                >
                  <ListItemText
                    primary={page.title}
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {page.subtitle}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {page.sections?.length || 0} seção(ões) • 
                          {page.public ? ' Público' : ' Privado'}
                        </Typography>
                      </Box>
                    }
                  />
                  <Check color="primary" />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
      
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="outlined">
          Cancelar
        </Button>
      </DialogActions>
    </Dialog>
  );
}

