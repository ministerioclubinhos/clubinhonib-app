import React from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Chip,
  Stack,
  Typography,
} from '@mui/material';
import { ExpandMore, MenuBook } from '@mui/icons-material';

import { STUDIO_HUB_FLOW_STEPS, STUDIO_HUB_STANDARDS, STUDIO_HUB_TEXTS } from '../../hub.constants';

/**
 * The editorial flow and the Studio's standards, for whoever needs a reminder.
 *
 * It never changes, so it stays folded: the dashboard's space belongs to what
 * is waiting to be done.
 */
export const HubReference: React.FC = () => (
  <Accordion
    disableGutters
    elevation={0}
    data-testid="ai-lessons-hub-reference"
    sx={{
      borderRadius: '16px !important',
      border: '1px solid',
      borderColor: 'divider',
      '&::before': { display: 'none' },
      overflow: 'hidden',
    }}
  >
    <AccordionSummary expandIcon={<ExpandMore />} sx={{ minHeight: 56 }}>
      <Stack direction="row" alignItems="center" spacing={1}>
        <MenuBook color="primary" fontSize="small" />
        <Typography fontWeight={700}>{STUDIO_HUB_TEXTS.referenceTitle}</Typography>
      </Stack>
    </AccordionSummary>
    <AccordionDetails sx={{ pt: 0 }}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
        {STUDIO_HUB_TEXTS.referenceText}
      </Typography>
      <Stack direction="row" flexWrap="wrap" gap={0.75} sx={{ mb: 2 }}>
        {STUDIO_HUB_STANDARDS.map((label) => (
          <Chip key={label} size="small" variant="outlined" color="primary" label={label} />
        ))}
      </Stack>
      <Box component="ol" sx={{ m: 0, p: 0, listStyle: 'none', display: 'grid', gap: 1 }}>
        {STUDIO_HUB_FLOW_STEPS.map((step) => (
          <Box component="li" key={step.name} sx={{ minWidth: 0 }}>
            <Typography variant="body2" fontWeight={700}>
              {step.name}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ overflowWrap: 'anywhere' }}>
              {step.description}
            </Typography>
          </Box>
        ))}
      </Box>
    </AccordionDetails>
  </Accordion>
);
