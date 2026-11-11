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
  /** Os dois rótulos só fazem sentido quando há duas versões sob o cursor. */
  const enhancedMedia = result?.enhancedMedia ?? null;
  return (
    <Stack data-testid="idea-ai-image-compare" spacing={1.5}>
      <IdeaAiChoice
        label={name}
        decision={decision}
        enhanced={Boolean(enhancedMedia)}
        onChange={onChange}
        disabled={disabled}
      />
      {enhancedMedia ? (
        <Stack direction="row" justifyContent="space-between">
          <Typography variant="overline">Original</Typography>
          <Typography variant="overline">Melhorada pela IA</Typography>
        </Stack>
      ) : (
        <Typography variant="overline">Original</Typography>
      )}
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
          sx={{
            width: '100%',
            maxHeight: { xs: 320, md: 480 },
            objectFit: 'contain',
            display: 'block',
          }}
        />
        {enhancedMedia && (
          <Box
            component="img"
            src={enhancedMedia.url}
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
      {enhancedMedia && (
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
