import { Box, Button, Checkbox, FormControlLabel, Stack, TextField, Typography } from '@mui/material';
import ImageIcon from '@mui/icons-material/Image';

import { PLAY_MAX_POSITION, PLAY_SCOPE } from '@/features/play/constants';
import type { PlayScope } from '@/features/play/types';
import { formatDuration } from '@/features/play/utils';
import type { VideoDraft, VideoPlayAttributes } from '../types';

interface VideoPlayControlsProps {
  video: VideoDraft;
  scope: PlayScope;
  onChange: (changes: VideoPlayAttributes) => void;
}

/** Controles do Play de um vídeo: "No Play", destaque, posição e miniatura. */
export default function VideoPlayControls({ video, scope, onChange }: VideoPlayControlsProps) {
  if (scope === PLAY_SCOPE.NONE) return null;

  const inPlay = scope === PLAY_SCOPE.ALL || Boolean(video.inPlay);
  const duration = formatDuration(video.durationSeconds);

  return (
    <Stack
      data-testid="video-play-controls"
      direction={{ xs: 'column', sm: 'row' }}
      spacing={{ xs: 0, sm: 2 }}
      alignItems={{ sm: 'center' }}
      sx={{ px: 1, pt: 0.5, flexWrap: 'wrap' }}
    >
      {scope === PLAY_SCOPE.SELECTED && (
        <FormControlLabel
          control={
            <Checkbox
              checked={Boolean(video.inPlay)}
              onChange={(event) => onChange({ inPlay: event.target.checked })}
              inputProps={{ 'aria-label': 'No Play' }}
            />
          }
          label="No Play"
        />
      )}
      {inPlay && (
        <>
          <FormControlLabel
            control={
              <Checkbox
                checked={Boolean(video.featured)}
                onChange={(event) => onChange({ featured: event.target.checked })}
                inputProps={{ 'aria-label': 'Destaque' }}
              />
            }
            label="Destaque"
          />
          <TextField
            size="small"
            type="number"
            label="Posição"
            value={video.position ?? ''}
            onChange={(event) => {
              const raw = event.target.value;
              onChange({ position: raw === '' ? null : Number(raw) });
            }}
            inputProps={{ min: 0, max: PLAY_MAX_POSITION, step: 1 }}
            sx={{ width: { xs: '100%', sm: 110 }, my: 0.5 }}
          />
          <Stack direction="row" spacing={1} alignItems="center" sx={{ my: 0.5 }}>
            <Box
              sx={{
                width: 80,
                aspectRatio: '16 / 9',
                borderRadius: 1,
                overflow: 'hidden',
                bgcolor: 'action.hover',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              {video.thumbnailUrl ? (
                <Box
                  component="img"
                  src={video.thumbnailUrl}
                  alt="Miniatura"
                  sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <ImageIcon fontSize="small" color="disabled" />
              )}
            </Box>
            <Button component="label" size="small" variant="outlined">
              {video.thumbnailUrl ? 'Trocar miniatura' : 'Miniatura'}
              <input
                hidden
                type="file"
                accept="image/*"
                data-testid="video-thumbnail-input"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) {
                    onChange({ thumbnailFile: file, thumbnailUrl: URL.createObjectURL(file) });
                  }
                  event.target.value = '';
                }}
              />
            </Button>
            {duration && (
              <Typography variant="caption" color="text.secondary">
                {duration}
              </Typography>
            )}
          </Stack>
        </>
      )}
    </Stack>
  );
}
