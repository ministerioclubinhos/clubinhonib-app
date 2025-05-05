import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Chip,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';

interface Props {
  contact: {
    id: string;
    name: string;
    phone: string;
    read: boolean;
  };
  onView: () => void;
  onDelete: () => void;
}

const ContactCard: React.FC<Props> = ({ contact, onView, onDelete }) => {
  const bgColor = contact.read ? '#e3fce3' : '#fff3e0';
  const statusLabel = contact.read ? 'Lido' : 'Não lido';
  const statusColor = contact.read ? 'success' : 'warning';

  return (
    <Card sx={{ p: 2, backgroundColor: bgColor }}>
      <CardContent sx={{ pb: 1 }}>
        <Typography variant="h6" fontWeight="bold">
          {contact.name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {contact.phone}
        </Typography>
        <Chip
          label={statusLabel}
          color={statusColor}
          size="small"
          sx={{ mt: 1 }}
        />
      </CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 1 }}>
        <IconButton onClick={onView} color="primary">
          <VisibilityIcon />
        </IconButton>
        <IconButton onClick={onDelete} color="error">
          <DeleteIcon />
        </IconButton>
      </Box>
    </Card>
  );
};

export default ContactCard;
