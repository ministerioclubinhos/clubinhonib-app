import { useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid2,
  IconButton,
  Stack,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';

import DeleteConfirmDialog from '@/components/common/modal/DeleteConfirmDialog';

import { EMPTY_VALUE, OBSERVABILITY_AUDIT_MESSAGES, OBSERVABILITY_AUDIT_TEST_IDS } from '../constants';
import { RecordType } from '../types';
import type { DetailField, SelectedRecord } from '../types';
import {
  auditDetailFields,
  levelColor,
  levelLabel,
  observabilityDetailFields,
  outcomeColor,
  outcomeLabel,
} from '../utils';

interface RecordDetailsDialogProps {
  selected: SelectedRecord | null;
  onClose: () => void;
  onCopy: (value: string) => void;
  /** Exclui o registro aberto; resolve quando a API respondeu (sucesso ou não). */
  onDelete: (selected: SelectedRecord) => Promise<void>;
  deleting: boolean;
}

const TITLE_ID = 'record-details-title';

/**
 * Detalhes de uma linha, somente leitura.
 *
 * Mostra apenas os campos do DTO público da API — nada é buscado a mais, e
 * stack, metadata ou corpo não existem no contrato. No celular ocupa a tela.
 */
export default function RecordDetailsDialog({ selected, onClose, onCopy, onDelete, deleting }: RecordDetailsDialogProps) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [confirming, setConfirming] = useState(false);

  const confirmDelete = async () => {
    if (!selected) return;
    await onDelete(selected);
    setConfirming(false);
  };

  const isObservability = selected?.kind === RecordType.Observability;
  const fields: DetailField[] = selected
    ? isObservability
      ? observabilityDetailFields(selected.item)
      : auditDetailFields(selected.item)
    : [];
  const title = isObservability
    ? OBSERVABILITY_AUDIT_MESSAGES.detailsTitleObservability
    : OBSERVABILITY_AUDIT_MESSAGES.detailsTitleAudit;
  const chip = selected
    ? isObservability
      ? { label: levelLabel(selected.item.level), color: levelColor(selected.item.level) }
      : { label: outcomeLabel(selected.item.outcome), color: outcomeColor(selected.item.outcome) }
    : null;

  return (
    <Dialog
      data-testid={OBSERVABILITY_AUDIT_TEST_IDS.detailsDialog}
      open={selected !== null}
      onClose={onClose}
      fullScreen={fullScreen}
      fullWidth
      maxWidth="md"
      aria-labelledby={TITLE_ID}
      scroll="paper"
    >
      <DialogTitle id={TITLE_ID} sx={{ pr: 7 }}>
        <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap>
          <span>{title}</span>
          {chip && <Chip size="small" label={chip.label} color={chip.color} />}
        </Stack>
        <IconButton
          data-testid={OBSERVABILITY_AUDIT_TEST_IDS.detailsClose}
          aria-label={OBSERVABILITY_AUDIT_MESSAGES.close}
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8, minWidth: 44, minHeight: 44 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ p: { xs: 1.5, sm: 3 } }}>
        <Grid2 container spacing={2} component="dl" sx={{ m: 0 }}>
          {fields.map((item) => (
            <Grid2 key={item.key} size={{ xs: 12, sm: item.wide ? 12 : 6 }} sx={{ minWidth: 0 }}>
              <Box data-testid={`${OBSERVABILITY_AUDIT_TEST_IDS.detailsField}-${item.key}`}>
                <Typography component="dt" variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  {item.label}
                </Typography>
                <Stack component="dd" direction="row" alignItems="flex-start" spacing={0.5} sx={{ m: 0, minWidth: 0 }}>
                  <Typography
                    component="span"
                    variant="body2"
                    fontFamily={item.monospace ? 'monospace' : undefined}
                    sx={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}
                  >
                    {item.value}
                  </Typography>
                  {item.copyable && item.value !== EMPTY_VALUE && (
                    <Tooltip title={`Copiar ${item.label.toLowerCase()}`}>
                      <IconButton
                        size="small"
                        aria-label={`Copiar ${item.label.toLowerCase()}`}
                        onClick={() => onCopy(item.value)}
                        sx={{ p: 0.5, mt: -0.5 }}
                      >
                        <ContentCopyIcon sx={{ fontSize: '0.9rem' }} />
                      </IconButton>
                    </Tooltip>
                  )}
                </Stack>
              </Box>
            </Grid2>
          ))}
        </Grid2>
      </DialogContent>
      <DialogActions sx={{ px: { xs: 1.5, sm: 3 }, py: 1.5, flexDirection: { xs: 'column-reverse', sm: 'row' }, gap: 1 }}>
        <Button onClick={onClose} fullWidth={fullScreen} sx={{ minHeight: 44 }}>
          {OBSERVABILITY_AUDIT_MESSAGES.close}
        </Button>
        <Button
          data-testid={OBSERVABILITY_AUDIT_TEST_IDS.detailsDelete}
          color="error"
          variant="outlined"
          startIcon={<DeleteOutlineIcon />}
          onClick={() => setConfirming(true)}
          disabled={deleting}
          fullWidth={fullScreen}
          sx={{ minHeight: 44 }}
        >
          {OBSERVABILITY_AUDIT_MESSAGES.deleteRecord}
        </Button>
      </DialogActions>
      <DeleteConfirmDialog
        open={confirming}
        title={OBSERVABILITY_AUDIT_MESSAGES.deleteRecordTitle}
        loading={deleting}
        onClose={() => setConfirming(false)}
        onConfirm={confirmDelete}
      />
    </Dialog>
  );
}
