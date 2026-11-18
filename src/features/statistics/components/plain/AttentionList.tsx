import React from 'react';
import { Accordion, AccordionDetails, AccordionSummary, Alert, Box, Button, Chip, Typography } from '@mui/material';
import ErrorIcon from '@mui/icons-material/Error';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import InfoIcon from '@mui/icons-material/Info';
import WarningIcon from '@mui/icons-material/Warning';
import { ALERT_NAMES_SHOWN, Tone } from '../../constants';
import type { AttentionItem } from '../../types';
import { useTone } from './useTone';

interface AttentionListProps {
  items: AttentionItem[];
  allGoodText: string;
}

const SEVERITY_TONE = { error: Tone.Error, warning: Tone.Warning, info: Tone.Info } as const;
const SEVERITY_ICON = { error: ErrorIcon, warning: WarningIcon, info: InfoIcon } as const;

/**
 * Um aviso numa linha só, fechada: ícone colorido, o recado e quantos são.
 * Ao tocar, abre quem está na situação e o botão de ação.
 */
const AttentionRow: React.FC<{ item: AttentionItem }> = ({ item }) => {
  const severity = item.severity ?? 'warning';
  const color = useTone(SEVERITY_TONE[severity]);
  const Icon = SEVERITY_ICON[severity];
  const names = item.names ?? [];
  const shown = names.slice(0, ALERT_NAMES_SHOWN);
  const hidden = names.length - shown.length;

  return (
    <Accordion
      data-testid="statistics-plain-attention-item"
      data-severity={severity}
      disableGutters
      elevation={0}
      sx={{
        bgcolor: color.soft,
        border: 1,
        borderColor: color.border,
        borderLeftWidth: 5,
        borderLeftColor: color.main,
        borderRadius: '8px !important',
        '&::before': { display: 'none' },
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon sx={{ color: color.text }} />}
        sx={{ minHeight: 48, px: 1.5, '& .MuiAccordionSummary-content': { alignItems: 'center', gap: 1, my: 1 } }}
      >
        <Icon sx={{ color: color.main, fontSize: 22, flexShrink: 0 }} aria-hidden />
        <Typography variant="body2" fontWeight={800} sx={{ color: color.text, minWidth: 0 }}>
          {item.title}
        </Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ px: 1.5, pt: 0, pb: 1.5 }}>
        {item.detail && (
          <Typography variant="body2" sx={{ mb: shown.length ? 1 : 0 }}>
            {item.detail}
          </Typography>
        )}
        {shown.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
            {shown.map((name) => (
              <Chip key={name} size="small" color={severity} label={name} sx={{ fontWeight: 700 }} />
            ))}
            {hidden > 0 && <Chip size="small" variant="outlined" color={severity} label={`e mais ${hidden}`} />}
          </Box>
        )}
        {item.onAction && item.actionLabel && (
          <Button
            onClick={item.onAction}
            variant="contained"
            color={severity}
            disableElevation
            sx={{ mt: 1.5, minHeight: 44, fontWeight: 800, width: { xs: '100%', sm: 'auto' } }}
          >
            {item.actionLabel}
          </Button>
        )}
      </AccordionDetails>
    </Accordion>
  );
};

/** Os avisos, todos fechados: cada um ocupa uma linha até alguém querer ver os detalhes. */
export const AttentionList: React.FC<AttentionListProps> = ({ items, allGoodText }) => {
  if (items.length === 0) {
    return (
      <Alert
        data-testid="statistics-plain-attention-list-ok"
        severity="success"
        variant="filled"
        sx={{ borderRadius: 2, fontWeight: 700 }}
      >
        {allGoodText}
      </Alert>
    );
  }

  return (
    <Box data-testid="statistics-plain-attention-list" sx={{ display: 'grid', gap: 1 }}>
      {items.map((item) => (
        <AttentionRow key={item.key} item={item} />
      ))}
    </Box>
  );
};
