import { useState } from 'react';
import { Box, Slider, Stack, Typography } from '@mui/material';
import type { IdeaAiMediaCompareProps } from '../../types';
import IdeaAiChoice from './IdeaAiChoice';
export default function IdeaAiImageCompare({
  original,
  result,
  decision,
  onChange,
  disabled,
}: IdeaAiMediaCompareProps) {
  const [position, setPosition] = useState(50);
  const name = original.originalName ?? 'Imagem da ideia';
  return (
    <Stack data-testid="idea-ai-image-compare" spacing={1.5}>
      <IdeaAiChoice
        label={name}
        decision={decision}
        enhanced={Boolean(result?.enhancedMedia)}
        onChange={onChange}
        disabled={disabled}
      />
      <Stack direction="row" justifyContent="space-between">
        <Typography variant="overline">Original</Typography>
        <Typography variant="overline">Melhorada pela IA</Typography>
      </Stack>
      <Box
        sx={{
          position: 'relative',
          bgcolor: 'action.hover',
          borderRadius: 2,
          overflow: 'hidden',
          textAlign: 'center',
        }}
      >
        <Box
          component="img"
          src={original.url}
          alt={`Original: ${name}`}
          sx={{ width: '100%', maxHeight: 480, objectFit: 'contain', display: 'block' }}
        />
        {result?.enhancedMedia && (
          <Box
            component="img"
            src={result.enhancedMedia.url}
            alt={`Melhorada: ${name}`}
            sx={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              clipPath: `inset(0 0 0 ${position}%)`,
            }}
          />
        )}
      </Box>
      {result?.enhancedMedia && (
        <Slider
          data-testid="idea-ai-image-slider"
          value={position}
          onChange={(_event, value) => setPosition(Number(value))}
          aria-label={`Comparar original e melhoria de ${name}`}
          valueLabelDisplay="auto"
          sx={{ mx: 1, width: 'calc(100% - 16px)' }}
        />
      )}
    </Stack>
  );
}
