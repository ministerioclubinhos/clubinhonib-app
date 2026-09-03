import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { IconButton, Tooltip, Typography } from '@mui/material';

import { ListingCard } from '@/components/common/listing';
import type { ListingBadge, ListingMeta } from '@/components/common/listing';

import type { DocumentResponse } from '../types';
import {
  documentInitials,
  formatDate,
  formatFileSize,
  uploadTypeLabel,
} from '../utils';

interface Props {
  document: DocumentResponse;
  onOpenDetails: (document: DocumentResponse) => void;
  onPreview: (document: DocumentResponse) => void;
  onEdit: (document: DocumentResponse) => void;
  onDelete: (document: DocumentResponse) => void;
}

/** Card de um documento na listagem do painel. */
export default function DocumentListCard({
  document,
  onOpenDetails,
  onPreview,
  onEdit,
  onDelete,
}: Props) {
  const media = document.media;

  const badges: ListingBadge[] = media
    ? [{ label: uploadTypeLabel(media.uploadType), color: 'info' }]
    : [{ label: 'Sem anexo', color: 'warning' }];

  const meta: ListingMeta[] = [
    {
      icon: <EventOutlinedIcon sx={{ fontSize: 16 }} />,
      label: formatDate(document.createdAt),
    },
  ];

  if (media?.isLocalFile) {
    meta.push({
      icon: <DescriptionOutlinedIcon sx={{ fontSize: 16 }} />,
      label: formatFileSize(media.size),
    });
  }

  return (
    <ListingCard
      avatar={documentInitials(document.name)}
      title={document.name}
      accent={media ? 'primary' : 'warning'}
      badges={badges}
      meta={meta}
      excerpt={document.description ?? undefined}
      onClick={() => onOpenDetails(document)}
      footer={
        <Typography variant="caption" color="text.secondary" noWrap>
          {media?.originalName ?? media?.url ?? 'Nenhum arquivo vinculado'}
        </Typography>
      }
      actions={
        <>
          <Tooltip title="Abrir arquivo">
            {/* O `span` mantém a dica visível quando o botão está desabilitado. */}
            <span>
              <IconButton
                size="small"
                aria-label="Abrir arquivo"
                disabled={!media}
                onClick={(event) => {
                  event.stopPropagation();
                  onPreview(document);
                }}
              >
                <VisibilityOutlinedIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>

          <Tooltip title="Detalhes">
            <IconButton
              size="small"
              aria-label="Detalhes"
              onClick={(event) => {
                event.stopPropagation();
                onOpenDetails(document);
              }}
            >
              <InfoOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Editar">
            <IconButton
              size="small"
              aria-label="Editar"
              onClick={(event) => {
                event.stopPropagation();
                onEdit(document);
              }}
            >
              <EditOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Excluir">
            <IconButton
              size="small"
              color="error"
              aria-label="Excluir"
              onClick={(event) => {
                event.stopPropagation();
                onDelete(document);
              }}
            >
              <DeleteOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </>
      }
    />
  );
}
