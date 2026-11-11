import { useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import {
  alpha,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';

import DeleteConfirmDialog from '@/components/common/modal/DeleteConfirmDialog';

import {
  DETAIL_SECTION_ORDER,
  DETAIL_SECTION_TITLES,
  OBSERVABILITY_AUDIT_MESSAGES,
  OBSERVABILITY_AUDIT_TEST_IDS,
} from '../constants';
import { RecordType } from '../types';
import type { DetailField, SelectedRecord } from '../types';
import {
  auditDetailFields,
  detailFieldsOf,
  formatDateTime,
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

  const accent = chip && chip.color !== 'default' ? theme.palette[chip.color].main : theme.palette.text.secondary;
  const headline = selected ? (isObservability ? selected.item.message : selected.item.actionName) : '';
  const actorName = selected && !isObservability ? selected.item.actorName : null;
  // O destaque já mostra a mensagem/ação; não repete o mesmo texto logo abaixo.
  const headlineKey = isObservability ? 'message' : 'action-name';

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
      slotProps={{ paper: { sx: { borderRadius: { xs: 0, sm: 3 }, borderTop: `4px solid ${accent}` } } }}
    >
      <DialogTitle id={TITLE_ID} sx={{ pr: 7, pb: 1.5, px: { xs: 2, sm: 3 } }}>
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
          <Typography component="span" variant="h6" fontWeight={800} sx={{ fontSize: { xs: '1.05rem', sm: '1.25rem' } }}>
            {title}
          </Typography>
          {chip && <Chip size="small" label={chip.label} color={chip.color} sx={{ fontWeight: 700 }} />}
        </Stack>
        {selected && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
            {formatDateTime(selected.item.occurredAt)}
            {actorName ? ` · ${actorName}` : ''}
          </Typography>
        )}
        <IconButton
          data-testid={OBSERVABILITY_AUDIT_TEST_IDS.detailsClose}
          aria-label={OBSERVABILITY_AUDIT_MESSAGES.close}
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8, minWidth: 44, minHeight: 44 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ p: { xs: 1.5, sm: 3 }, bgcolor: alpha(theme.palette.action.hover, 0.35) }}>
        <Stack spacing={1.5}>
          {DETAIL_SECTION_ORDER.map((section) => {
            const items = detailFieldsOf(fields, section);
            if (items.length === 0) return null;
            return (
              <Box
                key={section}
                component="section"
                data-testid={`${OBSERVABILITY_AUDIT_TEST_IDS.detailsDialog}-section-${section}`}
                sx={{
                  p: { xs: 1.5, sm: 2 },
                  borderRadius: 2.5,
                  bgcolor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                  minWidth: 0,
                }}
              >
                <Typography
                  component="h3"
                  variant="overline"
                  sx={{ display: 'block', fontWeight: 800, letterSpacing: 0.6, color: 'text.secondary', lineHeight: 1.6, mb: 1 }}
                >
                  {DETAIL_SECTION_TITLES[section]}
                </Typography>
                <Box
                  component="dl"
                  sx={{
                    m: 0,
                    display: 'grid',
                    gap: 1.5,
                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
                  }}
                >
                  {items.map((item) => {
                    const isHeadline = item.key === headlineKey;
                    return (
                      <Box
                        key={item.key}
                        data-testid={`${OBSERVABILITY_AUDIT_TEST_IDS.detailsField}-${item.key}`}
                        sx={{
                          minWidth: 0,
                          gridColumn: item.wide ? '1 / -1' : undefined,
                          ...(isHeadline
                            ? { p: 1.25, borderRadius: 2, bgcolor: alpha(accent, 0.08), borderLeft: `3px solid ${accent}` }
                            : {}),
                        }}
                      >
                        <Typography component="dt" variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600 }}>
                          {item.label}
                        </Typography>
                        <Stack component="dd" direction="row" alignItems="center" spacing={0.5} sx={{ m: 0, minWidth: 0 }}>
                          <Typography
                            component="span"
                            variant="body2"
                            fontFamily={item.monospace ? 'monospace' : undefined}
                            fontWeight={isHeadline ? 700 : undefined}
                            sx={{ wordBreak: 'break-word', overflowWrap: 'anywhere', whiteSpace: 'pre-wrap', minWidth: 0 }}
                          >
                            {isHeadline ? headline : item.value}
                          </Typography>
                          {item.copyable && (
                            <Tooltip title={`Copiar ${item.label.toLowerCase()}`}>
                              <IconButton
                                size="small"
                                aria-label={`Copiar ${item.label.toLowerCase()}`}
                                onClick={() => onCopy(item.value)}
                                sx={{ minWidth: 44, minHeight: 44, my: -1, flexShrink: 0 }}
                              >
                                <ContentCopyIcon sx={{ fontSize: '1rem' }} />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Stack>
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            );
          })}
        </Stack>
      </DialogContent>
      <DialogActions
        sx={{
          px: { xs: 1.5, sm: 3 },
          py: 1.5,
          flexDirection: { xs: 'column-reverse', sm: 'row' },
          gap: 1,
          '& > :not(style) ~ :not(style)': { ml: { xs: 0, sm: 1 } },
        }}
      >
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
