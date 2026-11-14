import { Alert, Box, Paper, Typography } from '@mui/material';
import {
  MANUAL_WORK_ART_ASPECT_RATIO,
  MANUAL_WORK_COPY_IDS,
  MANUAL_WORK_PAGE_WIDTH,
} from './constants';
import { ManualWorkPreviewProps } from './types';
import { manualWorkPreviewData } from './utils';

export function ManualWorkPreview({ structuredData }: ManualWorkPreviewProps) {
  const { imageUrl, verse } = manualWorkPreviewData(structuredData);
  if (!imageUrl)
    return (
      <Alert data-testid="manual-work-preview-empty" severity="info">
        O desenho do trabalho manual ainda não está disponível.
      </Alert>
    );

  return (
    <Paper
      data-testid="manual-work-preview"
      variant="outlined"
      sx={{
        bgcolor: 'white',
        color: 'black',
        maxWidth: MANUAL_WORK_PAGE_WIDTH,
        mx: 'auto',
        p: { xs: 1, sm: 2 },
        mb: 3,
      }}
    >
      {MANUAL_WORK_COPY_IDS.map((copy) => (
        <Box
          key={copy}
          data-testid={`manual-work-copy-${copy}`}
          sx={{ border: '3px solid #000', p: 1, mt: copy === 'lower' ? 2 : 0 }}
        >
          {/* As in the PDF: logo on the left, black band at the centre. */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
            <Box sx={{ flex: 1 }}>
              <Box
                component="img"
                data-testid={`manual-work-logo-${copy}`}
                src="/header_direito.png"
                alt="Clubinho Bíblico"
                sx={{ display: 'block', width: 70, height: 35, objectFit: 'contain' }}
              />
            </Box>
            <Typography
              data-testid={`manual-work-title-${copy}`}
              align="center"
              sx={{
                bgcolor: '#000',
                color: '#fff',
                fontSize: '10pt',
                fontWeight: 700,
                px: { xs: 2, sm: 6 },
                py: 0.5,
              }}
            >
              TRABALHO MANUAL
            </Typography>
            <Box sx={{ flex: 1 }} />
          </Box>
          <Typography
            data-testid={`manual-work-verse-${copy}`}
            align="center"
            sx={{ fontSize: '10pt', fontWeight: 700, lineHeight: 1.25, mb: 0.5 }}
          >
            {verse.toLocaleUpperCase('pt-BR')}
          </Typography>
          <Box
            component="img"
            data-testid={`manual-work-image-${copy}`}
            src={imageUrl}
            alt="Desenho do trabalho manual para pintar"
            sx={{
              display: 'block',
              width: '100%',
              // The art spans the whole frame, as in the PDF.
              aspectRatio: String(MANUAL_WORK_ART_ASPECT_RATIO),
              objectFit: 'cover',
              objectPosition: 'center 20%',
            }}
          />
        </Box>
      ))}
    </Paper>
  );
}
