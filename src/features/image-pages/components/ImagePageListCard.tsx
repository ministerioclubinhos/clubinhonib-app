import CollectionsOutlinedIcon from '@mui/icons-material/CollectionsOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import LinkIcon from '@mui/icons-material/Link';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { IconButton, Tooltip, Typography } from '@mui/material';

import { ListingCard } from '@/components/common/listing';
import type { ListingBadge, ListingMeta } from '@/components/common/listing';

import type { ImagePageSummary } from '../types';
import { formatDate } from '../utils';

interface Props {
  page: ImagePageSummary;
  onOpen: (page: ImagePageSummary) => void;
  onEdit: (page: ImagePageSummary) => void;
  onDelete: (page: ImagePageSummary) => void;
}

/** Card de uma galeria de fotos na listagem do painel. */
export default function ImagePageListCard({
  page,
  onOpen,
  onEdit,
  onDelete,
}: Props) {
  const badges: ListingBadge[] = [
    page.public
      ? { label: 'Publicada', color: 'success' }
      : { label: 'Rascunho', color: 'default' },
    {
      label: `${page.sectionCount} ${page.sectionCount === 1 ? 'seção' : 'seções'}`,
      color: 'info',
    },
  ];

  if (!page.routePath) {
    // Sem rota a galeria não abre no site; o aviso deixa o problema visível.
    badges.push({ label: 'Sem rota', color: 'error' });
  }

  const meta: ListingMeta[] = [
    {
      icon: <EventOutlinedIcon sx={{ fontSize: 16 }} />,
      label: formatDate(page.createdAt),
    },
  ];

  if (page.routePath) {
    meta.push({
      icon: <LinkIcon sx={{ fontSize: 16 }} />,
      label: page.routePath,
    });
  }

  return (
    <ListingCard
      avatar={<CollectionsOutlinedIcon fontSize="small" />}
      title={page.title}
      accent={page.public ? 'success' : 'default'}
      badges={badges}
      meta={meta}
      excerpt={page.description}
      onClick={() => onEdit(page)}
      footer={
        <Typography variant="caption" color="text.secondary" noWrap>
          Atualizada em {formatDate(page.updatedAt)}
        </Typography>
      }
      actions={
        <>
          <Tooltip title="Abrir no site">
            {/* O `span` mantém a dica visível quando o botão está desabilitado. */}
            <span>
              <IconButton
                size="small"
                aria-label="Abrir no site"
                disabled={!page.routePath}
                onClick={(event) => {
                  event.stopPropagation();
                  onOpen(page);
                }}
              >
                <OpenInNewIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>

          <Tooltip title="Editar">
            <IconButton
              size="small"
              aria-label="Editar"
              onClick={(event) => {
                event.stopPropagation();
                onEdit(page);
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
                onDelete(page);
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
