import { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import type { IdeaAiMediaCompareProps, IdeasSectionMedia } from '../../types';
import { IDEA_AI_COMPARE_COLUMNS } from '../../ai-constants';
import IdeaAiChoice from './IdeaAiChoice';
export default function IdeaAiDocumentCompare({
  original,
  result,
  decision,
  onChange,
  disabled,
}: IdeaAiMediaCompareProps) {
  const [preview, setPreview] = useState<IdeasSectionMedia | null>(null);
  return (
    <Stack data-testid="idea-ai-document-compare" spacing={1.5}>
      <IdeaAiChoice
        label={original.originalName ?? 'documento'}
        decision={decision}
        enhanced={Boolean(result?.enhancedMedia)}
        onChange={onChange}
        disabled={disabled}
      />
      <Box sx={{ display: 'grid', gridTemplateColumns: IDEA_AI_COMPARE_COLUMNS, gap: 2 }}>
        {[original, result?.enhancedMedia].map((media, index) => (
          <Paper variant="outlined" key={index} sx={{ p: 2, minWidth: 0 }}>
            <Typography variant="overline">
              {index === 0 ? 'Original' : 'Melhorada pela IA'}
            </Typography>
            {media ? (
              <Stack spacing={1}>
                <Typography sx={{ overflowWrap: 'anywhere' }}>
                  {media.originalName ?? 'Documento'}
                </Typography>
                {(media.originalName ?? media.url).toLowerCase().endsWith('.pdf') && (
                  <Button
                    type="button"
                    data-testid="idea-ai-document-preview"
                    onClick={() => setPreview(media)}
                    sx={{ minHeight: 44 }}
                  >
                    Visualizar PDF
                  </Button>
                )}
                <Button
                  component="a"
                  href={media.url}
                  target="_blank"
                  rel="noreferrer"
                  sx={{ minHeight: 44 }}
                >
                  Baixar arquivo
                </Button>
                {index === 1 && result?.editableMedia && (
                  <Button
                    component="a"
                    data-testid="idea-ai-document-docx"
                    href={result.editableMedia.url}
                    target="_blank"
                    rel="noreferrer"
                    sx={{ minHeight: 44 }}
                  >
                    Baixar DOCX editável
                  </Button>
                )}
              </Stack>
            ) : (
              <Typography color="text.secondary">Original mantido.</Typography>
            )}
          </Paper>
        ))}
      </Box>
      <Dialog
        data-testid="idea-ai-document-dialog"
        open={Boolean(preview)}
        onClose={() => setPreview(null)}
        fullWidth
        maxWidth="lg"
      >
        <DialogTitle>{preview?.originalName ?? 'Documento'}</DialogTitle>
        <DialogContent>
          {preview && (
            <Box
              component="iframe"
              src={preview.url}
              title={`PDF: ${preview.originalName ?? 'ideia'}`}
              sx={{ width: '100%', height: '70vh', border: 0 }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button type="button" onClick={() => setPreview(null)}>
            Fechar
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
