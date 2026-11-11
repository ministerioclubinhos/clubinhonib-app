import React, { useMemo } from 'react';
import {
  Alert,
  alpha,
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { PictureAsPdf } from '@mui/icons-material';
import { LibreOfficeDocEditor } from '@/components/ai-lessons/LibreOfficeDocEditor';
import { ManualWorkPreview } from '@/features/ai-lessons/manual-work-preview/ManualWorkPreview';
import { OlderMeditationEditor } from '@/features/ai-lessons/older-meditation-editor';
import { YoungerMeditationEditor } from '@/features/ai-lessons/younger-meditation-editor';
import { IMAGE_ONLY_STAGES } from '../presentation.constants';
import {
  LessonStageType,
  LessonVisualOrientation,
  StageAssetIssue,
  type LessonStageContentViewerProps,
} from '../types';
import { objectValue, resolveStageAssetIssue, visualAssets } from '../utils';
import { StoryVisualCarousel } from './StoryVisualCarousel';

export const LessonStageContentViewer: React.FC<LessonStageContentViewerProps> = ({
  stage,
  version,
  document,
  structuredData,
  visualOrientation = '',
  editable = false,
  onChangeDocument,
  onOpenPdfPreview,
  pdfPreviewLoading = false,
  pdfPreviewDisabled = false,
  pdfPreviewLabel,
  assetIssue,
  readOnly = false,
  onLayoutOverflowChange,
}) => {
  const theme = useTheme();
  // A stable array keeps the carousel from resetting on every keystroke of the parent.
  const assets = useMemo(
    () => visualAssets(structuredData, stage.type),
    [structuredData, stage.type]
  );
  const issue = assetIssue ?? resolveStageAssetIssue(stage.type, structuredData);
  const resolvedOrientation =
    visualOrientation ||
    (objectValue(structuredData.visualConfig).orientation === LessonVisualOrientation.PORTRAIT
      ? LessonVisualOrientation.PORTRAIT
      : LessonVisualOrientation.LANDSCAPE);

  return (
    <Box data-testid={`ai-lesson-stage-viewer-${stage.type}`}>
      {version && issue !== StageAssetIssue.NONE && (
        <Alert
          data-testid="ai-lesson-stage-incomplete-assets"
          data-asset-issue={issue}
          severity="warning"
          sx={{ mb: 2.5, borderRadius: 2.5 }}
        >
          {issue === StageAssetIssue.BROKEN
            ? 'Uma ou mais imagens deste item não carregaram. Gere a etapa novamente ou recarregue a página antes de aprovar.'
            : 'Este item possui ilustrações ou artes obrigatórias ausentes. Gere ou atualize a etapa antes de aprovar.'}
        </Alert>
      )}
      {!version && IMAGE_ONLY_STAGES.includes(stage.type) && (
        <Paper
          data-testid="ai-lesson-stage-empty"
          elevation={0}
          sx={{
            p: 4,
            textAlign: 'center',
            borderRadius: 3,
            border: '1px dashed',
            borderColor: 'divider',
            bgcolor: alpha(theme.palette.primary.main, 0.02),
          }}
        >
          <Typography color="text.secondary" fontWeight={500}>
            {readOnly
              ? 'Este item ainda não possui conteúdo gerado.'
              : 'Gere esta etapa para visualizar as artes do item.'}
          </Typography>
        </Paper>
      )}

      {!IMAGE_ONLY_STAGES.includes(stage.type) && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" component="h3" fontWeight={800} sx={{ mb: 1.5 }}>
            {readOnly ? 'Conteúdo do item' : 'Editor de conteúdo do item'}
          </Typography>

          {version ? (
            stage.type === LessonStageType.MEDITATION_YOUNGER ? (
              <YoungerMeditationEditor
                initialJson={document}
                structuredData={structuredData}
                editable={editable}
                onChange={onChangeDocument}
                onOverflowChange={onLayoutOverflowChange}
              />
            ) : stage.type === LessonStageType.MEDITATION_OLDER ? (
              <OlderMeditationEditor
                initialJson={document}
                structuredData={structuredData}
                editable={editable}
                onChange={onChangeDocument}
                onOverflowChange={onLayoutOverflowChange}
              />
            ) : (
              <LibreOfficeDocEditor
                initialJson={document}
                editable={editable}
                onChange={onChangeDocument}
              />
            )
          ) : (
            <Paper
              elevation={0}
              sx={{
                p: 4,
                textAlign: 'center',
                borderRadius: 3,
                border: '1px dashed',
                borderColor: 'divider',
                bgcolor: alpha(theme.palette.primary.main, 0.02),
              }}
            >
              <Typography color="text.secondary" fontWeight={500}>
                {readOnly
                  ? 'Este item ainda não possui conteúdo gerado.'
                  : 'Gere esta etapa para iniciar a revisão e visualização do conteúdo.'}
              </Typography>
            </Paper>
          )}
        </Box>
      )}

      {stage.type === LessonStageType.MANUAL_WORK && version && (
        <ManualWorkPreview structuredData={structuredData} />
      )}

      {stage.type === LessonStageType.LESSON_VISUALS && (
        <StoryVisualCarousel assets={assets} orientation={resolvedOrientation} />
      )}

      {[LessonStageType.STANDARD_GAME, LessonStageType.VERSE_FIXATION].includes(stage.type) && (
        <Box data-testid="ai-game-instruction-preview-area">
          <StoryVisualCarousel
            assets={assets}
            orientation={LessonVisualOrientation.LANDSCAPE}
            title={
              stage.type === LessonStageType.VERSE_FIXATION
                ? 'Como fixar o versículo — passo a passo visual'
                : 'Como brincar — passo a passo visual'
            }
            ariaLabel={
              stage.type === LessonStageType.VERSE_FIXATION
                ? 'Instruções visuais da fixação do versículo'
                : 'Instruções visuais da brincadeira'
            }
            testIdPrefix={
              stage.type === LessonStageType.VERSE_FIXATION
                ? 'ai-verse-fixation-instruction'
                : 'ai-game-instruction'
            }
          />
          {onOpenPdfPreview && (
            <Stack direction="row" justifyContent="center" sx={{ mt: 2 }}>
              <Button
                data-testid="ai-game-instruction-pdf-preview"
                variant="contained"
                color="secondary"
                startIcon={
                  pdfPreviewLoading ? (
                    <CircularProgress size={18} color="inherit" />
                  ) : (
                    <PictureAsPdf />
                  )
                }
                disabled={pdfPreviewDisabled || pdfPreviewLoading}
                onClick={onOpenPdfPreview}
                sx={{ minHeight: 44, borderRadius: 2.5, width: { xs: '100%', sm: 'auto' } }}
              >
                {pdfPreviewLabel ??
                  (stage.type === LessonStageType.VERSE_FIXATION
                    ? 'Visualizar preview do PDF da fixação'
                    : 'Visualizar preview do PDF da brincadeira')}
              </Button>
            </Stack>
          )}
        </Box>
      )}

      {stage.type === LessonStageType.VERSE_VISUALS && (
        <StoryVisualCarousel
          assets={assets}
          orientation={LessonVisualOrientation.LANDSCAPE}
          title="Versículo — sequência visual"
          ariaLabel="Visuais do versículo"
          testIdPrefix="ai-verse-visual"
        />
      )}

    </Box>
  );
};
