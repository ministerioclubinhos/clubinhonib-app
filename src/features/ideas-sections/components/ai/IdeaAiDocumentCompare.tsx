import { useState } from 'react';
import { Alert, Box, Button, Chip, Paper, Stack, Typography } from '@mui/material';
import { EditOutlined } from '@mui/icons-material';
import type { IdeaAiMediaCompareProps, IdeasSectionMedia } from '../../types';
import { IDEA_AI_COMPARE_COLUMNS } from '../../ai-constants';
import IdeaAiChoice from './IdeaAiChoice';
import IdeasMediaPreviewDialog from '../IdeasMediaPreviewDialog';
import IdeaAiDocumentEditDialog from './IdeaAiDocumentEditDialog';
export default function IdeaAiDocumentCompare({
  original,
  result,
  decision,
  onChange,
  disabled,
  documentEdit,
}: IdeaAiMediaCompareProps) {
  const [preview, setPreview] = useState<IdeasSectionMedia | null>(null);
  const [editing, setEditing] = useState(false);
  /** Sem versão da IA não há o que comparar: uma coluna só, sem cartão vazio. */
  const enhancedMedia = result?.enhancedMedia ?? null;
  const columns: IdeasSectionMedia[] = enhancedMedia ? [original, enhancedMedia] : [original];
  return (
    <Stack data-testid="idea-ai-document-compare" spacing={1.5}>
      {/* Sem versão da IA não há o que escolher: o seletor só confundia. */}
      {enhancedMedia && (
        <IdeaAiChoice
          label={original.originalName ?? 'documento'}
          decision={decision}
          enhanced={Boolean(enhancedMedia)}
          onChange={onChange}
          disabled={disabled}
        />
      )}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: enhancedMedia ? IDEA_AI_COMPARE_COLUMNS : 'minmax(0, 1fr)',
          gap: 2,
        }}
      >
        {columns.map((media, index) => (
          <Paper variant="outlined" key={index} sx={{ p: 2, minWidth: 0 }}>
            <Typography variant="overline">
              {index === 0 ? 'Original' : 'Melhorada pela IA'}
            </Typography>
            <Stack spacing={1} alignItems="flex-start">
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
              {index === 1 && result?.documentEditedAt && (
                <Chip
                  size="small"
                  color="info"
                  variant="outlined"
                  data-testid="idea-ai-document-edited"
                  label="Editado manualmente"
                />
              )}
              {index === 1 && documentEdit && (
                <Button
                  type="button"
                  data-testid="idea-ai-document-edit"
                  startIcon={<EditOutlined />}
                  onClick={() => setEditing(true)}
                  disabled={disabled}
                  sx={{ minHeight: 44 }}
                >
                  Editar documento
                </Button>
              )}
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
          </Paper>
        ))}
      </Box>
      {enhancedMedia && result?.editableMedia && (
        <Alert data-testid="idea-ai-document-text-only" severity="warning">
          A versão da IA é só texto: imagens pequenas ou decorativas do original não são incluídas.
          Abra os dois arquivos e confira antes de escolher.
        </Alert>
      )}
      {enhancedMedia && !result?.editableMedia && (
        <Alert data-testid="idea-ai-document-image-cleaned" severity="info">
          Mesmo desenho do original, com nitidez e níveis ajustados. Feito sem IA e sem alterar o
          conteúdo.
        </Alert>
      )}
      <IdeasMediaPreviewDialog media={preview} onClose={() => setPreview(null)} />
      {documentEdit && enhancedMedia && (
        <IdeaAiDocumentEditDialog
          open={editing}
          context={documentEdit}
          original={original}
          onClose={() => setEditing(false)}
        />
      )}
    </Stack>
  );
}
