import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import LinkIcon from '@mui/icons-material/Link';
import { IconButton, Tooltip, Typography } from '@mui/material';

import { ListingCard } from '@/components/common/listing';
import type { ListingBadge, ListingMeta } from '@/components/common/listing';

import type { InformativeResponse } from '../types';
import { formatDate, informativeInitials } from '../utils';

interface Props {
  informative: InformativeResponse;
  onEdit: (informative: InformativeResponse) => void;
  onDelete: (informative: InformativeResponse) => void;
}

/** Card de um informativo na listagem do painel. */
export default function InformativeListCard({
  informative,
  onEdit,
  onDelete,
}: Props) {
  const badges: ListingBadge[] = [
    informative.public
      ? { label: 'Publicado', color: 'success' }
      : { label: 'Rascunho', color: 'default' },
  ];

  const meta: ListingMeta[] = [
    {
      icon: <EventOutlinedIcon sx={{ fontSize: 16 }} />,
      label: formatDate(informative.createdAt),
    },
  ];

  if (informative.routePath) {
    meta.push({
      icon: <LinkIcon sx={{ fontSize: 16 }} />,
      label: informative.routePath,
    });
  }

  return (
    <ListingCard data-testid={`informatives-informative-list-card-${informative.id}`}
      avatar={informativeInitials(informative.title)}
      title={informative.title}
      accent={informative.public ? 'success' : 'default'}
      badges={badges}
      meta={meta}
      excerpt={informative.description}
      onClick={() => onEdit(informative)}
      footer={
        <Typography variant="caption" color="text.secondary" noWrap>
          Atualizado em {formatDate(informative.updatedAt)}
        </Typography>
      }
      actions={
        <>
          <Tooltip title="Editar">
            <IconButton
              size="small"
              aria-label="Editar"
              onClick={(event) => {
                event.stopPropagation();
                onEdit(informative);
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
                onDelete(informative);
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
