import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  IconButton,
  Box,
  Divider,
  Chip,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import PersonIcon from '@mui/icons-material/Person';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import DeleteIcon from '@mui/icons-material/Delete';

interface Props {
  contact: any | null;
  onClose: () => void;
  onMarkAsRead: () => void;
  onDelete: () => void;
}

const ContactDetailsModal: React.FC<Props> = ({
  contact,
  onClose,
  onMarkAsRead,
  onDelete,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  if (!contact) return null;

  const handleMarkAsRead = () => {
    onMarkAsRead();
    onClose();
  };

  return (
    <Dialog
      open={!!contact}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3, width: isMobile ? '98%' : 'auto' } }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 2,
          pb: 0,
        }}
      >
        <DialogTitle
          sx={{ p: 0, display: 'flex', alignItems: 'center', gap: 1, fontSize: { xs: '.9rem', md: '1.1rem' }}}
        >
          <MarkEmailReadIcon color="primary" />
          Detalhes do Contato
        </DialogTitle>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>

      <DialogContent sx={{ mt: 2, px: isMobile ? 2 : 3 }}>
        <Box display="flex" alignItems="center" mb={1}>
          <PersonIcon sx={{ mr: 1 }} />
          <Typography>
            <strong>Nome:</strong> {contact.name}
          </Typography>
        </Box>

        <Box display="flex" alignItems="center" mb={1}>
          <EmailIcon sx={{ mr: 1 }} />
          <Typography>
            <strong>Email:</strong> {contact.email}
          </Typography>
        </Box>

        <Box display="flex" alignItems="center" mb={1}>
          <PhoneIcon sx={{ mr: 1 }} />
          <Typography>
            <strong>Telefone:</strong> {contact.phone}
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" gutterBottom>
          <strong>Mensagem:</strong>
        </Typography>
        <Typography
          variant="body2"
          sx={{ whiteSpace: 'pre-wrap', mb: 2 }}
        >
          {contact.message}
        </Typography>

        <Chip
          label={contact.read ? 'Lido' : 'Não lido'}
          color={contact.read ? 'success' : 'warning'}
          size="small"
        />
      </DialogContent>

      <DialogActions sx={{ p: 2, flexDirection: isMobile ? 'column' : 'row', gap: 1 }}>
        <Button
          onClick={onClose}
          fullWidth={isMobile}
          size={isMobile ? 'small' : 'medium'}
        >
          Fechar
        </Button>

        {!contact.read ? (
          <Button
            onClick={handleMarkAsRead}
            variant="contained"
            color="primary"
            fullWidth={isMobile}
            size={isMobile ? 'small' : 'medium'}
          >
            Marcar como lido
          </Button>
        ) : (
          <Button
            onClick={onDelete}
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
            fullWidth={isMobile}
            size={isMobile ? 'small' : 'medium'}
          >
            Excluir
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ContactDetailsModal;
