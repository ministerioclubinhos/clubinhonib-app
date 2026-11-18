import React, { useEffect, useRef, useState } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { CheckCircle, ContentCopy, ExpandMore, Gavel, Visibility } from '@mui/icons-material';

import { PROMPT_COPY_FEEDBACK_MS } from '../../constants';
import { PROMPT_TEXTS } from '../../promptConstants';

interface Props {
  basePrompt: string;
  effectivePreview: string;
  /** Muda a cada etapa: as duas seções voltam a ficar recolhidas. */
  resetKey: string;
}

const readOnlyInputSx = {
  fontFamily: 'monospace',
  fontSize: '0.825rem',
  bgcolor: 'background.paper',
  borderRadius: 2,
} as const;

const accordionSx = {
  border: '1px solid',
  borderColor: 'divider',
  borderRadius: '12px !important',
  '&:before': { display: 'none' },
} as const;

/**
 * O que a IA recebe além da orientação do usuário, para consulta.
 *
 * Fica recolhido e depois do campo de edição: é referência, e quem chega à
 * tela quer primeiro escrever.
 */
export const PromptReference: React.FC<Props> = ({ basePrompt, effectivePreview, resetKey }) => {
  const [baseOpen, setBaseOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    setBaseOpen(false);
    setPreviewOpen(false);
  }, [resetKey]);
  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = () => {
    void navigator.clipboard.writeText(basePrompt);
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), PROMPT_COPY_FEEDBACK_MS);
  };

  return (
    <Stack gap={1.25} data-testid="admin-prompts-reference">
      <Accordion
        expanded={previewOpen}
        onChange={(_, expanded) => setPreviewOpen(expanded)}
        elevation={0}
        disableGutters
        sx={accordionSx}
      >
        <AccordionSummary expandIcon={<ExpandMore />} sx={{ minHeight: 52 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Visibility color="primary" fontSize="small" />
            <Typography fontWeight={700} variant="subtitle2">
              {PROMPT_TEXTS.previewTitle}
            </Typography>
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          <TextField
            data-testid="admin-prompts-effective-preview"
            value={effectivePreview}
            multiline
            minRows={4}
            maxRows={14}
            fullWidth
            helperText={PROMPT_TEXTS.previewHelper}
            slotProps={{ input: { readOnly: true, sx: readOnlyInputSx } }}
          />
        </AccordionDetails>
      </Accordion>

      <Accordion
        expanded={baseOpen}
        onChange={(_, expanded) => setBaseOpen(expanded)}
        elevation={0}
        disableGutters
        sx={accordionSx}
      >
        <AccordionSummary expandIcon={<ExpandMore />} sx={{ minHeight: 52 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Gavel color="action" fontSize="small" />
            <Typography fontWeight={700} variant="subtitle2">
              {PROMPT_TEXTS.baseTitle}
            </Typography>
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ position: 'relative' }}>
            <Tooltip title={copied ? 'Copiado!' : 'Copiar as regras oficiais'}>
              <IconButton
                data-testid="admin-prompts-copy-base"
                aria-label="Copiar as regras oficiais"
                size="small"
                onClick={copy}
                sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1, minWidth: 44, minHeight: 44 }}
              >
                {copied ? <CheckCircle color="success" fontSize="small" /> : <ContentCopy fontSize="small" />}
              </IconButton>
            </Tooltip>
            <TextField
              data-testid="admin-prompts-base"
              value={basePrompt}
              multiline
              minRows={4}
              maxRows={14}
              fullWidth
              helperText={PROMPT_TEXTS.baseHelper}
              slotProps={{ input: { readOnly: true, sx: readOnlyInputSx } }}
            />
          </Box>
        </AccordionDetails>
      </Accordion>
    </Stack>
  );
};
