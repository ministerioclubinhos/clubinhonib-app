import React from 'react';
import { Paper, Box, Typography, IconButton, Stack, Tooltip } from '@mui/material';
import { Eye, Pencil, Trash2, Info } from 'lucide-react';
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
  return (
    <Paper
      elevation={3}
      sx={{
        p: 2,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        borderRadius: 2,
      }}
    >
      <Box>
        <Typography variant="h6" fontWeight="bold" gutterBottom noWrap>
          {document.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" noWrap title={document.description}>
          {document.description || 'Sem descrição'}
        </Typography>
      </Box>

      <Stack direction="row" spacing={1} mt={2} justifyContent="flex-end">
        <Tooltip title="Visualizar Documento">
          <IconButton color="primary" onClick={() => onPreviewFile(document)}>
            <Eye size={22} />
          </IconButton>
        </Tooltip>

        <Tooltip title="Ver Detalhes">
          <IconButton color="info" onClick={() => onViewDetails(document)}>
            <Info size={22} />
          </IconButton>
        </Tooltip>

        <Tooltip title="Editar Documento">
          <IconButton color="warning" onClick={() => onEdit(document)}>
            <Pencil size={22} />
          </IconButton>
        </Tooltip>

        <Tooltip title="Excluir Documento">
          <IconButton color="error" onClick={() => onDelete(document)}>
            <Trash2 size={22} />
          </IconButton>
        </Tooltip>
      </Stack>
    </Paper>
  );
};

export default DocumentCard;
