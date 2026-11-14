import { useEffect, useId, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Chip,
  Collapse,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  FormControlLabel,
  DialogTitle,
  IconButton,
  Paper,
  Stack,
  Switch,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Delete, ExpandMore } from '@mui/icons-material';

import type { IdeasSectionEditorProps } from '../types';
import { mediaCountsOf } from '../utils';
import IdeasSectionFields from './IdeasSectionFields';

/** Uma seção da página de ideias: dados, visibilidade e suas mídias. */
export default function IdeasSectionEditor({
  section,
  index,
  onChange,
  onRemove,
  titleError = false,
  apiErrors,
  expanded,
  onExpandedChange,
  onDraftChange,
  focusRequest,
}: IdeasSectionEditorProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const panelId = useId();
  const hasApiErrors = Boolean(apiErrors?.length);
  const counts = mediaCountsOf(section);
  const open = expanded || titleError || hasApiErrors;
  const [confirmRemove, setConfirmRemove] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!focusRequest) return;
    onExpandedChange(true);
    toggleRef.current?.focus({ preventScroll: true });
    toggleRef.current?.scrollIntoView({ block: 'start' });
  }, [focusRequest]);

  return (
    <Paper
      data-testid="ideas-pages-ideas-section-editor"
      variant="outlined"
      sx={{ p: { xs: 1.5, md: open ? 2.5 : 1 }, borderRadius: 3, overflow: 'hidden' }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
          mb: open ? 2 : 0,
        }}
      >
        <Button
          data-testid="ideas-section-toggle"
          ref={toggleRef}
          type="button"
          color="inherit"
          onClick={() => onExpandedChange(!expanded)}
          aria-expanded={open}
          aria-controls={panelId}
          startIcon={<ExpandMore sx={{ transform: open ? 'rotate(180deg)' : undefined }} />}
          sx={{
            minHeight: 44,
            minWidth: 0,
            flex: 1,
            justifyContent: 'flex-start',
            textAlign: 'left',
            textTransform: 'none',
            scrollMarginTop: 96,
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography
              component="h3"
              variant="subtitle1"
              fontWeight={700}
              sx={{ overflowWrap: 'anywhere' }}
            >
              {section.title.trim() || `Seção ${index + 1}`}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {section.public ? 'Pública' : 'Restrita'}
              {counts.length
                ? ` · ${counts.map((item) => `${item.count} ${item.label.toLowerCase()}`).join(', ')}`
                : ' · sem materiais'}
            </Typography>
          </Box>
        </Button>
        {titleError && <Chip size="small" color="error" label="Revise o título" />}
        {hasApiErrors && <Chip size="small" color="error" label="Recusada ao salvar" />}

        <Tooltip title="Remover seção">
          <IconButton
            data-testid="ideas-section-remove"
            color="error"
            aria-label={`Remover seção ${index + 1}`}
            onClick={() => setConfirmRemove(true)}
            sx={{ width: 44, height: 44 }}
          >
            <Delete fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      <Collapse in={open}>
        <Box id={panelId}>
          {hasApiErrors && (
            <Alert data-testid="ideas-section-api-errors" severity="error" sx={{ mb: 2 }}>
              <Stack component="ul" sx={{ m: 0, pl: 2 }}>
                {apiErrors?.map((message) => (
                  <li key={message}>{message}</li>
                ))}
              </Stack>
            </Alert>
          )}
          <IdeasSectionFields
            section={section}
            onUpdate={onChange}
            titleError={titleError}
            onDraftChange={onDraftChange}
            focusRequest={focusRequest}
          />

          <FormControlLabel
            sx={{ mt: 1 }}
            control={
              <Switch
                checked={section.public}
                onChange={(event) => onChange({ ...section, public: event.target.checked })}
              />
            }
            label={section.public ? 'Seção pública' : 'Seção restrita'}
          />
        </Box>
      </Collapse>

      <Dialog
        data-testid="ideas-section-remove-dialog"
        aria-labelledby={`${panelId}-remove-title`}
        open={confirmRemove}
        onClose={() => setConfirmRemove(false)}
      >
        <DialogTitle id={`${panelId}-remove-title`}>Remover seção</DialogTitle>
        <DialogContent>
          <DialogContentText>
            A seção e todas as mídias dela saem da página quando você salvar.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Stack
            direction={{ xs: 'column-reverse', sm: 'row' }}
            spacing={1}
            sx={{ width: '100%' }}
            justifyContent="flex-end"
          >
            <Button
              type="button"
              onClick={() => setConfirmRemove(false)}
              fullWidth={isMobile}
              sx={{ minHeight: 44, textTransform: 'none' }}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              color="error"
              variant="contained"
              onClick={() => {
                setConfirmRemove(false);
                onRemove();
              }}
              fullWidth={isMobile}
              sx={{ minHeight: 44, textTransform: 'none' }}
            >
              Remover
            </Button>
          </Stack>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
