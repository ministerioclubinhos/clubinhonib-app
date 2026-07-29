import React from 'react';
import {
  Paper,
  Box,
  Typography,
  IconButton,
  Stack,
  Tooltip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import { DocumentItem } from '../types';

export interface DocumentCardProps {
  document: DocumentItem;
  onPreviewFile: (doc: DocumentItem) => void;
  onViewDetails: (doc: DocumentItem) => void;
  onEdit: (doc: DocumentItem) => void;
  onDelete: (doc: DocumentItem) => void;
}

const DocumentCard: React.FC<DocumentCardProps> = ({
  document,
  onPreviewFile,
  onViewDetails,
  onEdit,
  onDelete,
}) => {
  const theme = useTheme();
  const isSm = useMediaQuery(theme.breakpoints.up('sm'));

  return (
    <Paper
      elevation={0}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2.5,
        border: '1px solid',
        borderColor: 'divider',
        overflow: 'hidden',
        transition: 'all 0.2s ease',
        '&:hover': {
          borderColor: 'primary.main',
          boxShadow: 2,
          '& .doc-card-actions': { opacity: 1 },
        },
      }}
    >
      <Box sx={{ p: 2.5, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 2,
            bgcolor: '#81d742',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 1.5,
          }}
        >
          <DescriptionOutlinedIcon sx={{ fontSize: 28 }} />
        </Box>
        <Typography
          variant="subtitle1"
          fontWeight={700}
          sx={{
            color: '#2d5016',
            lineHeight: 1.3,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {document.name}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mt: 0.75,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            flex: 1,
          }}
          title={document.description}
        >
          {document.description || 'Sem descrição'}
        </Typography>
      </Box>

      <Stack
        className="doc-card-actions"
        direction="row"
        spacing={0.5}
        sx={{
          p: 1.5,
          borderTop: '1px solid',
          borderColor: 'divider',
          bgcolor: 'grey.50',
          opacity: isSm ? 0.9 : 1,
          transition: 'opacity 0.2s ease',
        }}
      >
        <Tooltip title="Visualizar">
          <IconButton size="small" color="primary" onClick={() => onPreviewFile(document)} sx={{ borderRadius: 1 }}>
            <VisibilityOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Detalhes">
          <IconButton size="small" onClick={() => onViewDetails(document)} sx={{ borderRadius: 1, color: 'text.secondary' }}>
            <InfoOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Editar">
          <IconButton size="small" onClick={() => onEdit(document)} sx={{ borderRadius: 1, color: 'warning.main' }}>
            <EditOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Excluir">
          <IconButton size="small" color="error" onClick={() => onDelete(document)} sx={{ borderRadius: 1 }}>
            <DeleteOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>
    </Paper>
  );
};

export default DocumentCard;
