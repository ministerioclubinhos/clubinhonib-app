import { Box, Typography } from '@mui/material';

import type { PlayHomeSection, PlayVideo } from '../types';
import PlayVideoCard from './PlayVideoCard';

interface PlayRowProps {
  section: PlayHomeSection;
  onToggleFavorite: (video: PlayVideo) => void;
}

/** Fileira horizontal de vídeos, com rolagem por toque e encaixe (mobile first). */
export default function PlayRow({ section, onToggleFavorite }: PlayRowProps) {
  return (
    <Box component="section" data-testid={`play-row-${section.id}`} sx={{ mb: 3 }}>
      <Typography component="h2" variant="h6" fontWeight={800} sx={{ mb: 1 }}>
        {section.title}
      </Typography>
      <Box
        sx={{
          display: 'flex',
          gap: 1.5,
          overflowX: 'auto',
          scrollSnapType: 'x proximity',
          pb: 1,
          mx: { xs: -1.5, md: 0 },
          px: { xs: 1.5, md: 0 },
          '&::-webkit-scrollbar': { height: 6 },
          '&::-webkit-scrollbar-thumb': { bgcolor: 'divider', borderRadius: 3 },
        }}
      >
        {section.videos.map((video) => (
          <Box
            key={video.id}
            sx={{
              flex: '0 0 auto',
              width: { xs: '72%', sm: 260, md: 280 },
              scrollSnapAlign: 'start',
            }}
          >
            <PlayVideoCard video={video} onToggleFavorite={onToggleFavorite} />
          </Box>
        ))}
      </Box>
    </Box>
  );
}
