import { useState } from 'react';
import {
  Box,
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
import { Delete } from '@mui/icons-material';

import { IdeasSectionDraft } from '../types';
import IdeasSectionFields from './IdeasSectionFields';

interface IdeasSectionEditorProps {
  section: IdeasSectionDraft;
  index: number;
  onChange: (section: IdeasSectionDraft) => void;
  onRemove: () => void;
  /** Marca o título como pendente depois de uma tentativa de salvar. */
  titleError?: boolean;
  /**
   * Informa ao formulário que há uma mídia em edição nesta seção, para que ele
   * possa avisar antes de descartá-la.
   */
  onDraftChange?: (hasDraft: boolean) => void;
}

/** Uma seção da página de ideias: dados, visibilidade e suas mídias. */
export default function IdeasSectionEditor({
  section,
  index,
  onChange,
  onRemove,
  titleError = false,
  onDraftChange,
}: IdeasSectionEditorProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [confirmRemove, setConfirmRemove] = useState(false);

  return (
    <Paper data-testid="ideas-pages-ideas-section-editor" variant="outlined" sx={{ p: { xs: 2, md: 2.5 }, borderRadius: 2 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
          mb: 2,
        }}
      >
        <Typography variant="subtitle2" fontWeight={700}>
          {section.title.trim() || `Seção ${index + 1}`}
        </Typography>

        <Tooltip title="Remover seção">
          <IconButton
            color="error"
            aria-label={`Remover seção ${index + 1}`}
            onClick={() => setConfirmRemove(true)}
            sx={{ width: 44, height: 44 }}
          >
            <Delete fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      <IdeasSectionFields
        section={section}
        onUpdate={onChange}
        titleError={titleError}
        onDraftChange={onDraftChange}
      />

      <FormControlLabel
        sx={{ mt: 1 }}
        control={
          <Switch
            checked={section.public}
            onChange={(event) =>
              onChange({ ...section, public: event.target.checked })
            }
          />
        }
        label={section.public ? 'Seção pública' : 'Seção restrita'}
      />

      <Dialog open={confirmRemove} onClose={() => setConfirmRemove(false)}>
        <DialogTitle>Remover seção</DialogTitle>
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
