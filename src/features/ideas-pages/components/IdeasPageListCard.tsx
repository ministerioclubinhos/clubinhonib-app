import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import LinkIcon from '@mui/icons-material/Link';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { IconButton, Tooltip, Typography } from '@mui/material';

import { ListingCard } from '@/components/common/listing';
import type { ListingBadge, ListingMeta } from '@/components/common/listing';

import type { IdeasPageSummary } from '../types';
import { formatDate } from '../utils';

interface Props {
  page: IdeasPageSummary;
  onOpen: (page: IdeasPageSummary) => void;
  onEdit: (page: IdeasPageSummary) => void;
  onDelete: (page: IdeasPageSummary) => void;
}

/** Card de uma página de ideias na listagem do painel. */
export default function IdeasPageListCard({
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
    <ListingCard data-testid={`ideas-pages-ideas-page-list-card-${page.id}`}
      avatar={<LightbulbOutlinedIcon fontSize="small" />}
      title={page.title}
      subtitle={page.subtitle || undefined}
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
          <Tooltip title="Abrir a página">
            {/* O `span` mantém a dica visível quando o botão está desabilitado. */}
            <span>
              <IconButton
                size="small"
                aria-label="Abrir a página"
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
