import AudiotrackOutlinedIcon from '@mui/icons-material/AudiotrackOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import EventNoteOutlinedIcon from '@mui/icons-material/EventNoteOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined';
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined';
import { IconButton, Tooltip, Typography } from '@mui/material';

import { ListingCard } from '@/components/common/listing';
import type { ListingBadge, ListingMeta } from '@/components/common/listing';

import type { WeekMaterialSummary } from '../types';
import { formatDate, isSpecialMaterialDescription, cleanMaterialDescription, totalMediaCount } from '../utils';

interface Props {
  material: WeekMaterialSummary;
  onOpenDetails: (material: WeekMaterialSummary) => void;
  onEdit: (material: WeekMaterialSummary) => void;
  onSetAsCurrent: (material: WeekMaterialSummary) => void;
  onDelete: (material: WeekMaterialSummary) => void;
}

/** Card de uma página de materiais semanais na listagem do painel. */
export default function WeekMaterialListCard({
  material,
  onOpenDetails,
  onEdit,
  onSetAsCurrent,
  onDelete,
}: Props) {
  const badges: ListingBadge[] = [];

  if (isSpecialMaterialDescription(material.description)) {
    badges.push({ label: 'Material Especial', color: 'secondary' });
  }

  if (material.currentWeek) {
    badges.push({ label: 'Material da semana', color: 'success' });
  }

  if (!material.routePath) {
    // Sem rota a página não abre no site; o aviso deixa o problema visível.
    badges.push({ label: 'Sem rota', color: 'error' });
  }

  if (totalMediaCount(material) === 0) {
    badges.push({ label: 'Sem material', color: 'warning' });
  }

  const meta: ListingMeta[] = [
    {
      icon: <VideocamOutlinedIcon sx={{ fontSize: 16 }} />,
      label: `${material.videoCount} vídeo(s)`,
    },
    {
      icon: <DescriptionOutlinedIcon sx={{ fontSize: 16 }} />,
      label: `${material.documentCount} doc(s)`,
    },
    {
      icon: <ImageOutlinedIcon sx={{ fontSize: 16 }} />,
      label: `${material.imageCount} imagem(ns)`,
    },
    {
      icon: <AudiotrackOutlinedIcon sx={{ fontSize: 16 }} />,
      label: `${material.audioCount} áudio(s)`,
    },
  ];

  return (
    <ListingCard data-testid={`week-materials-week-material-list-card-${material.id}`}
      avatar={<EventNoteOutlinedIcon fontSize="small" />}
      title={material.title}
      subtitle={material.subtitle || undefined}
      accent={material.currentWeek ? 'success' : 'primary'}
      badges={badges}
      meta={meta}
      excerpt={cleanMaterialDescription(material.description)}
      onClick={() => onOpenDetails(material)}
      footer={
        <Typography variant="caption" color="text.secondary" noWrap>
          Criada em {formatDate(material.createdAt)}
        </Typography>
      }
      actions={
        <>
          <Tooltip title="Detalhes">
            <IconButton
              size="small"
              aria-label="Detalhes"
              onClick={(event) => {
                event.stopPropagation();
                onOpenDetails(material);
              }}
            >
              <InfoOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip
            title={
              material.currentWeek
                ? 'Já é o material da semana'
                : 'Publicar como material da semana'
            }
          >
            {/* O `span` mantém a dica visível quando o botão está desabilitado. */}
            <span>
              <IconButton
                size="small"
                aria-label="Publicar como material da semana"
                color={material.currentWeek ? 'success' : 'default'}
                disabled={material.currentWeek}
                onClick={(event) => {
                  event.stopPropagation();
                  onSetAsCurrent(material);
                }}
              >
                <PushPinOutlinedIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>

          <Tooltip title="Editar">
            <IconButton
              size="small"
              aria-label="Editar"
              onClick={(event) => {
                event.stopPropagation();
                onEdit(material);
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
                onDelete(material);
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
