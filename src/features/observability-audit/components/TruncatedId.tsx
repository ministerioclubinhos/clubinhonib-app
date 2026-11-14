import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { IconButton, Stack, Tooltip, Typography } from '@mui/material';

import { EMPTY_VALUE } from '../constants';
import { truncateId } from '../utils';

interface TruncatedIdProps {
  value: string | null;
  /** O que o id identifica, para o nome acessível: "requisição", "ator"... */
  kind: string;
  onCopy?: (value: string) => void;
}

/**
 * Um identificador longo, visível pelo começo e íntegro para leitores de
 * tela e para a área de transferência.
 */
export default function TruncatedId({ value, kind, onCopy }: TruncatedIdProps) {
  if (!value) {
    return <span data-testid="truncated-id-empty">{EMPTY_VALUE}</span>;
  }

  return (
    <Stack data-testid="truncated-id" direction="row" alignItems="center" spacing={0.25} sx={{ whiteSpace: 'nowrap' }}>
      <Tooltip title={value}>
        <Typography component="span" variant="body2" fontFamily="monospace" aria-label={`${kind} ${value}`}>
          {truncateId(value)}
        </Typography>
      </Tooltip>
      {onCopy && (
        <IconButton
          size="small"
          aria-label={`Copiar identificador de ${kind}`}
          onClick={(event) => {
            // A linha inteira abre o modal; copiar não deve abri-lo.
            event.stopPropagation();
            onCopy(value);
          }}
          sx={{ p: 0.5 }}
        >
          <ContentCopyIcon sx={{ fontSize: '0.9rem' }} />
        </IconButton>
      )}
    </Stack>
  );
}
