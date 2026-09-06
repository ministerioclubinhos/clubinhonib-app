import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import { IconButton, Switch, Tooltip } from '@mui/material';

import { ListingCard } from '@/components/common/listing';
import type { ListingBadge, ListingMeta } from '@/components/common/listing';

import type { FeatureFlagResponse } from '../types';
import { audienceInfo, flagInitials, formatDate } from '../utils';

interface Props {
  flag: FeatureFlagResponse;
  disabled?: boolean;
  onToggle: (flag: FeatureFlagResponse) => void;
  onEdit: (flag: FeatureFlagResponse) => void;
  onCopyKey: (flag: FeatureFlagResponse) => void;
  onDelete: (flag: FeatureFlagResponse) => void;
}

/** Card de uma feature flag na listagem do painel. */
export default function FeatureFlagListCard({
  flag,
  disabled,
  onToggle,
  onEdit,
  onCopyKey,
  onDelete,
}: Props) {
  const audience = audienceInfo(flag.audience);

  const badges: ListingBadge[] = [
    flag.enabled
      ? { label: 'Ligada', color: 'success' }
      : { label: 'Desligada', color: 'default' },
    { label: audience.label, color: audience.color },
  ];

  const meta: ListingMeta[] = [
    {
      icon: <EventOutlinedIcon sx={{ fontSize: 16 }} />,
      label: `Alterada em ${formatDate(flag.updatedAt)}`,
    },
  ];

  return (
    <ListingCard data-testid={`feature-flags-feature-flag-list-card-${flag.id}`}
      avatar={flagInitials(flag.key)}
      title={flag.name}
      subtitle={flag.key}
      accent={flag.enabled ? 'success' : 'default'}
      badges={badges}
      meta={meta}
      excerpt={flag.description ?? audience.description}
      onClick={() => onEdit(flag)}
      footer={
        <Tooltip title={flag.enabled ? 'Desligar' : 'Ligar'}>
          <Switch
            checked={flag.enabled}
            disabled={disabled}
            inputProps={{ 'aria-label': `Alternar ${flag.name}` }}
            onClick={(event) => event.stopPropagation()}
            onChange={() => onToggle(flag)}
            // O dedo precisa de mais alvo que o mouse: o interruptor pequeno
            // dava pouco mais de 30px de altura no celular.
            sx={{
              '& .MuiSwitch-switchBase': {
                minWidth: { xs: 44, sm: 'auto' },
                minHeight: { xs: 44, sm: 'auto' },
              },
            }}
          />
        </Tooltip>
      }
      actions={
        <>
          <Tooltip title="Copiar a chave">
            <IconButton
              size="small"
              aria-label="Copiar a chave"
              onClick={(event) => {
                event.stopPropagation();
                onCopyKey(flag);
              }}
            >
              <ContentCopyIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Editar">
            <IconButton
              size="small"
              aria-label="Editar"
              onClick={(event) => {
                event.stopPropagation();
                onEdit(flag);
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
                onDelete(flag);
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
