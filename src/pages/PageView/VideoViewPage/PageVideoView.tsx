import { Alert, Box, Container, Grid, Paper, Skeleton, Typography } from '@mui/material';
import VideoLibraryOutlinedIcon from '@mui/icons-material/VideoLibraryOutlined';

import TeacherPageCard from '@/pages/TeacherArea/components/Layout/TeacherPageCard';
import { TEACHER_LIST_PATH } from '@/pages/TeacherArea/pagePaths';
import { MediaTargetType } from '@/store/slices/types';
import { PUBLIC_MEDIA_BASE_PATH, PUBLIC_MEDIA_PAGE_WIDTH } from '@/features/public-media/constants';

import VideoCard from './VideoCard';
import { useVideoPage } from './hooks';

interface VideoPageViewProps {
  idToFetch: string;
  variant?: 'teacher' | 'public';
}

const ACCENT = '#dc2626';
const TEST_ID = 'page-view-video-view-page-page-video-view';

/** Página de uma coleção de vídeos, dentro da casca da Área do Professor. */
function VideoPageContent({ idToFetch, variant = 'teacher' }: VideoPageViewProps) {
  const isPublic = variant === 'public';
  const { videoData, loading, error } = useVideoPage(idToFetch);

  const cardProps = {
    testId: TEST_ID,
    icon: <VideoLibraryOutlinedIcon sx={{ fontSize: 22 }} />,
    accent: ACCENT,
    backTo: isPublic ? PUBLIC_MEDIA_BASE_PATH : TEACHER_LIST_PATH[MediaTargetType.VideosPage],
    backLabel: isPublic ? 'Voltar para Fotos e Vídeos' : 'Voltar para Galeria de Vídeos',
  };

  if (loading) {
    return (
      <TeacherPageCard {...cardProps} title="Carregando...">
        <Grid container spacing={{ xs: 1.5, md: 2 }}>
          {[0, 1, 2].map((slot) => (
            <Grid item xs={12} sm={6} lg={4} key={slot}>
              <Skeleton variant="rounded" height={200} />
            </Grid>
          ))}
        </Grid>
      </TeacherPageCard>
    );
  }

  if (error) {
    return (
      <TeacherPageCard {...cardProps} title="Vídeos">
        <Alert severity="error">{error}</Alert>
      </TeacherPageCard>
    );
  }

  if (!videoData) {
    return (
      <TeacherPageCard {...cardProps} title="Vídeos">
        <Alert severity="info">Nenhuma página de vídeos encontrada.</Alert>
      </TeacherPageCard>
    );
  }

  const videos = videoData.videos ?? [];

  return (
    <TeacherPageCard
      {...cardProps}
      title={videoData.title}
      count={videos.length}
    >
      {videoData.description && (
        <Typography
          sx={{ mb: 2.5, maxWidth: 800, color: '#475569', fontSize: { xs: '0.95rem', md: '1rem' }, whiteSpace: 'pre-wrap' }}
        >
          {videoData.description}
        </Typography>
      )}

      {videos.length > 0 ? (
        <Grid container spacing={{ xs: 1.5, md: 2 }}>
          {videos.map((video) => (
            <Grid item xs={12} sm={6} lg={4} key={video.id}>
              <VideoCard video={video} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Paper variant="outlined" sx={{ p: { xs: 3, md: 5 }, textAlign: 'center', borderRadius: 3, borderStyle: 'dashed' }}>
          <Box>
            <Typography variant="body1" color="text.secondary">
              Os vídeos para esta página ainda não foram publicados.
            </Typography>
          </Box>
        </Paper>
      )}
    </TeacherPageCard>
  );
}

/** Na versão pública a página ganha só uma moldura de largura; a casca é a do site. */
export default function PageVideoView(props: VideoPageViewProps) {
  if (props.variant !== 'public') return <VideoPageContent {...props} />;
  return (
    <Box sx={{ bgcolor: '#f4f6f9', py: { xs: 2, md: 4 } }}>
      <Container maxWidth={false} disableGutters sx={{ width: PUBLIC_MEDIA_PAGE_WIDTH }}>
        <VideoPageContent {...props} />
      </Container>
    </Box>
  );
}
