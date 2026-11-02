import React from 'react';
import {
  Alert,
  alpha,
  Box,
  Button,
  Card,
  CardContent,
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
import {
  LessonStageType,
  LessonVisualOrientation,
  type LessonStageContentViewerProps,
} from '../types';
import { hasCompleteStageAssets, objectValue, visualAssets } from '../utils';
import { StoryVisualCarousel } from './StoryVisualCarousel';

const IMAGE_ONLY_STAGES = [
  LessonStageType.LESSON_VISUALS,
  LessonStageType.VERSE_VISUALS,
  LessonStageType.MANUAL_WORK,
];

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
}) => {
  const theme = useTheme();
  const assets = visualAssets(structuredData, stage.type);
  const assetsComplete = hasCompleteStageAssets(stage.type, structuredData);
  const resolvedOrientation =
    visualOrientation ||
    (objectValue(structuredData.visualConfig).orientation === LessonVisualOrientation.PORTRAIT
      ? LessonVisualOrientation.PORTRAIT
      : LessonVisualOrientation.LANDSCAPE);

  return (
    <Box data-testid={`ai-lesson-stage-viewer-${stage.type}`}>
      {version && !assetsComplete && (
        <Alert
          data-testid="ai-lesson-stage-incomplete-assets"
          severity="warning"
          sx={{ mb: 2.5, borderRadius: 2.5 }}
        >
          Este item possui ilustrações ou artes obrigatórias ausentes. Gere ou atualize a etapa
          antes de aprovar.
        </Alert>
      )}

      {!IMAGE_ONLY_STAGES.includes(stage.type) && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 1.5 }}>
            Editor de Conteúdo da Lição
          </Typography>

          {version ? (
            stage.type === LessonStageType.MEDITATION_YOUNGER ? (
              <YoungerMeditationEditor
                initialJson={document}
                structuredData={structuredData}
                editable={editable}
                onChange={onChangeDocument}
              />
            ) : stage.type === LessonStageType.MEDITATION_OLDER ? (
              <OlderMeditationEditor
                initialJson={document}
                structuredData={structuredData}
                editable={editable}
                onChange={onChangeDocument}
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
                Gere esta etapa para iniciar a revisão e visualização do conteúdo.
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

      {assets.length > 0 &&
        stage.type !== LessonStageType.MANUAL_WORK &&
        stage.type !== LessonStageType.LESSON_VISUALS &&
        stage.type !== LessonStageType.STANDARD_GAME &&
        stage.type !== LessonStageType.VERSE_FIXATION &&
        stage.type !== LessonStageType.VERSE_VISUALS &&
        stage.type !== LessonStageType.MEDITATION_YOUNGER &&
        stage.type !== LessonStageType.MEDITATION_OLDER && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" fontWeight={800} gutterBottom>
              Ilustrações das atividades
            </Typography>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
                gap: 2.5,
                mt: 2,
              }}
            >
              {assets.map((asset, index) => (
                <Card
                  key={asset.id ?? index}
                  elevation={0}
                  sx={{
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    component="img"
                    src={asset.url}
                    alt={asset.altText ?? asset.purpose ?? `Visual ${index + 1}`}
                    sx={{
                      display: 'block',
                      width: '100%',
                      aspectRatio: '3 / 2',
                      objectFit: 'contain',
                      bgcolor: 'grey.50',
                    }}
                  />
                  <CardContent sx={{ p: 2 }}>
                    <Typography fontWeight={700}>
                      {asset.purpose ?? `Visual ${index + 1}`}
                    </Typography>
                    {asset.displayText && (
                      <Typography
                        sx={{ mt: 0.75, fontWeight: 600 }}
                        color="primary.main"
                        variant="body2"
                      >
                        {asset.displayText}
                      </Typography>
                    )}
                    {asset.altText && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        {asset.altText}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Box>
        )}
    </Box>
  );
};
