import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import LinkIcon from '@mui/icons-material/Link';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import VideoLibraryOutlinedIcon from '@mui/icons-material/VideoLibraryOutlined';
import { IconButton, Tooltip, Typography } from '@mui/material';

import { ListingCard } from '@/components/common/listing';
import type { ListingBadge, ListingMeta } from '@/components/common/listing';

import type { VideoPageSummary } from '../types';
import { formatDate } from '../utils';

interface Props {
  page: VideoPageSummary;
  onOpen: (page: VideoPageSummary) => void;
  onEdit: (page: VideoPageSummary) => void;
  onDelete: (page: VideoPageSummary) => void;
}

/** Card de uma página de vídeos na listagem do painel. */
export default function VideoPageListCard({
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
      label: `${page.videoCount} ${page.videoCount === 1 ? 'vídeo' : 'vídeos'}`,
      color: 'info',
    },
  ];

  if (!page.routePath) {
    // Sem rota a página não abre no site; o aviso deixa o problema visível.
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
    <ListingCard data-testid={`video-pages-video-page-list-card-${page.id}`}
      avatar={<VideoLibraryOutlinedIcon fontSize="small" />}
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
