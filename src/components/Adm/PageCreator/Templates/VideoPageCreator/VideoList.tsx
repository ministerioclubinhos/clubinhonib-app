import { Box, Card, Grid, IconButton, Typography } from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import { MediaItem, MediaUploadType } from 'store/slices/types';

interface VideoListProps {
  videos: MediaItem[];
  handleRemoveVideo: (index: number) => void;
  handleEditVideo: (index: number) => void;
}

export default function VideoList({ videos, handleRemoveVideo, handleEditVideo }: VideoListProps) {
  return (
    <Grid container spacing={4} justifyContent="center">
      {videos.map((video, index) => (
        <Grid item xs={12} sm={6} md={4} key={index}>
          <Card sx={{ p: 2, boxShadow: 3, borderRadius: 2 }}>
            <Typography variant="h6" fontWeight="bold">
              {video.title}
            </Typography>
            <Typography variant="body2" mb={2}>
              {video.description}
            </Typography>

            {video.uploadType === MediaUploadType.LINK ? (
              <Box
                sx={{
                  width: '100%',
                  aspectRatio: '16/9',
                  mb: 2,
                  iframe: { width: '100%', height: '100%', border: 0 },
                }}
              >
                <iframe src={video.url} title={`Vídeo ${index + 1}`} allowFullScreen />
              </Box>
            ) : (
              <video controls style={{ width: '100%', marginBottom: '16px' }}>
                <source src={video.url} />
                Seu navegador não suporta vídeo.
              </video>
            )}

            <Box mt={1} display="flex" justifyContent="flex-end">
              <IconButton
                onClick={() => handleEditVideo(index)}
                size="small"
                color="primary"
                sx={{ mr: 1 }}
              >
                <Edit fontSize="small" />
              </IconButton>
              <IconButton onClick={() => handleRemoveVideo(index)} size="small" color="error">
                <Delete fontSize="small" />
              </IconButton>
            </Box>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
