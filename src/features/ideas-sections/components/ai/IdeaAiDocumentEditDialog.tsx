import { useState } from 'react';
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import { PictureAsPdfOutlined, VisibilityOutlined } from '@mui/icons-material';

import { IdeaDocumentEditor } from '../../document-editor/IdeaDocumentEditor';
import { IdeaAiDocumentSource, type IdeaAiDocumentEditDialogProps } from '../../types';
import { useIdeaAiDocumentEditor } from '../../useIdeaAiDocumentEditor';
import IdeasMediaPreviewDialog from '../IdeasMediaPreviewDialog';

/**
 * Editor tipo Word do documento que a IA melhorou. "Gerar PDF" grava o texto
 * do editor, cria o PDF e o DOCX novos e troca os arquivos da versão da IA.
 *
 * É um editor próprio das ideias, isolado do Estúdio: o que se muda lá não
 * altera esta tela. A IA nunca muda a ideia do professor; aqui quem decide é a
 * administração, por isso o original fica a um clique, ao lado.
 */
export default function IdeaAiDocumentEditDialog({
  open,
  context,
  original,
  onClose,
}: IdeaAiDocumentEditDialogProps) {
  const editor = useIdeaAiDocumentEditor(
    open,
    context.sectionId,
    original.id,
    context.enhancementId
  );
  const [confirmClose, setConfirmClose] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);

  const requestClose = () => {
    if (editor.saving) return;
    if (editor.isDirty) setConfirmClose(true);
    else onClose();
  };

  const handleSave = async () => {
    if (await editor.save()) {
      context.onSaved();
      onClose();
    }
  };

  return (
    <Dialog
      data-testid="idea-ai-document-edit-dialog"
      open={open}
      onClose={requestClose}
      fullScreen
      aria-labelledby="idea-ai-document-edit-title"
    >
      <DialogTitle id="idea-ai-document-edit-title" sx={{ pb: 1 }}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
          alignItems={{ md: 'center' }}
          gap={1.5}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography component="span" variant="h6" fontWeight={800} display="block">
              Editar documento melhorado
            </Typography>
            <Typography
              component="span"
              variant="body2"
              color="text.secondary"
              sx={{ overflowWrap: 'anywhere' }}
              display="block"
            >
              {original.originalName ?? original.title ?? 'Documento'}
            </Typography>
          </Box>
          <Stack direction="row" gap={1} flexWrap="wrap">
            <Button
              type="button"
              data-testid="idea-ai-document-edit-original"
              startIcon={<VisibilityOutlined />}
              onClick={() => setShowOriginal(true)}
              sx={{ minHeight: 44, textTransform: 'none' }}
            >
              Ver original
            </Button>
            <Button
              type="button"
              data-testid="idea-ai-document-edit-cancel"
              onClick={requestClose}
              disabled={editor.saving}
              sx={{ minHeight: 44, textTransform: 'none' }}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              data-testid="idea-ai-document-edit-save"
              variant="contained"
              startIcon={
                editor.saving ? (
                  <CircularProgress size={18} color="inherit" />
                ) : (
                  <PictureAsPdfOutlined />
                )
              }
              onClick={() => void handleSave()}
              disabled={!editor.draft || editor.saving || !editor.isDirty}
              sx={{ minHeight: 44, textTransform: 'none', fontWeight: 700 }}
            >
              {editor.saving ? 'Gerando PDF…' : 'Gerar PDF'}
            </Button>
          </Stack>
        </Stack>
      </DialogTitle>

      <DialogContent dividers sx={{ bgcolor: 'grey.100', p: { xs: 1, md: 2 } }}>
        <Stack spacing={2} sx={{ maxWidth: 1100, mx: 'auto' }}>
          <Alert severity="info" data-testid="idea-ai-document-edit-principle">
            Mantenha a ideia do professor: melhore e documente com clareza, para qualquer professor
            entender e aplicar no seu clubinho, sem trocar etapas, materiais ou objetivos. Compare
            com o original quando precisar.
          </Alert>

          {editor.loaded?.source === IdeaAiDocumentSource.EXTRACTED && (
            <Alert severity="warning" data-testid="idea-ai-document-edit-extracted">
              <AlertTitle>Formatação reconstruída</AlertTitle>
              Esta melhoria foi gerada antes do editor existir. O texto foi extraído do PDF e a
              formatação (negrito, tabelas) precisa ser refeita à mão.
            </Alert>
          )}

          {editor.saveError && (
            <Alert
              severity="error"
              data-testid="idea-ai-document-edit-error"
              onClose={() => editor.setSaveError('')}
            >
              {editor.saveError}
            </Alert>
          )}

          {editor.loading && (
            <Stack
              spacing={1.5}
              aria-busy="true"
              aria-label="Carregando o documento"
              data-testid="idea-ai-document-edit-loading"
            >
              <Skeleton variant="rounded" height={56} />
              <Skeleton variant="rounded" height={420} />
            </Stack>
          )}

          {editor.loadError && (
            <Alert
              severity="error"
              data-testid="idea-ai-document-edit-load-error"
              action={
                <Button color="inherit" onClick={editor.retry} sx={{ minHeight: 44 }}>
                  Tentar novamente
                </Button>
              }
            >
              {editor.loadError}
            </Alert>
          )}

          {editor.loaded && editor.draft && (
            <IdeaDocumentEditor
              initialJson={editor.loaded.document}
              onChange={editor.edit}
              editable={!editor.saving}
            />
          )}
        </Stack>
      </DialogContent>

      <Dialog
        data-testid="idea-ai-document-edit-discard"
        open={confirmClose}
        onClose={() => setConfirmClose(false)}
      >
        <DialogTitle>Descartar as alterações?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Você editou o documento e ainda não gerou o PDF. Se sair agora, a edição se perde.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            type="button"
            data-testid="idea-ai-document-edit-keep"
            onClick={() => setConfirmClose(false)}
            sx={{ minHeight: 44 }}
          >
            Continuar editando
          </Button>
          <Button
            type="button"
            data-testid="idea-ai-document-edit-discard-confirm"
            color="warning"
            onClick={() => {
              setConfirmClose(false);
              onClose();
            }}
            sx={{ minHeight: 44 }}
          >
            Descartar
          </Button>
        </DialogActions>
      </Dialog>

      <IdeasMediaPreviewDialog
        media={showOriginal ? original : null}
        onClose={() => setShowOriginal(false)}
      />
    </Dialog>
  );
}
