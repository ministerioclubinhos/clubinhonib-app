import { Alert, Box, Paper, Typography } from '@mui/material';
import { MANUAL_WORK_COPY_IDS, MANUAL_WORK_PAGE_WIDTH } from './constants';
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
          <Box
            component="img"
            data-testid={`manual-work-logo-${copy}`}
            src="/header_direito.png"
            alt="Clubinho Bíblico"
            sx={{ display: 'block', width: 86, height: 43, objectFit: 'contain', mx: 'auto' }}
          />
          <Typography
            data-testid={`manual-work-title-${copy}`}
            align="center"
            sx={{ fontSize: '10pt', fontWeight: 700 }}
          >
            TRABALHO MANUAL
          </Typography>
          <Typography
            data-testid={`manual-work-verse-${copy}`}
            align="center"
            sx={{ fontSize: '9pt', lineHeight: 1.25, mb: 0.5 }}
          >
            {verse}
          </Typography>
          <Box
            component="img"
            data-testid={`manual-work-image-${copy}`}
            src={imageUrl}
            alt="Desenho do trabalho manual para pintar"
            sx={{
              display: 'block',
              width: '100%',
              height: { xs: 230, sm: 340 },
              objectFit: 'contain',
            }}
          />
        </Box>
      ))}
    </Paper>
  );
}
