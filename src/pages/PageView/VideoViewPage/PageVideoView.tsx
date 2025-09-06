import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Container, Paper, Typography, Grid, Alert, Skeleton, Tooltip, Fab } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VideoCard from "./VideoCard";
import { useAuthRole } from "@/utils/useAuthRole";
import { useVideoPage } from "./hooks";
import DeleteConfirmDialog from "@/components/common/modal/DeleteConfirmDialog";

interface VideoPageViewProps { idToFetch: string }

export default function PageVideoView({ idToFetch }: VideoPageViewProps) {
  const navigate = useNavigate();
  const { isAdmin } = useAuthRole();
  const { videoData, loading, error, isDeleting, deletePage } = useVideoPage(idToFetch);
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (loading) {
    return (
      <Container sx={{ py: 8 }}>
        <Skeleton variant="rectangular" width="100%" height={220} sx={{ borderRadius: 3, mb: 4 }} />
        <Grid container spacing={4}>
          {[...Array(6)].map((_, i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Skeleton variant="rectangular" width="100%" height={220} sx={{ borderRadius: 3 }} />
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 10 }}>
        <Alert severity="error" sx={{ borderRadius: 2, boxShadow: 3 }}>{error}</Alert>
      </Container>
    );
  }

  if (!videoData) {
    return (
      <Container sx={{ mt: 10 }}>
        <Typography align="center" variant="h5" color="text.secondary">Nenhuma página de vídeos encontrada.</Typography>
      </Container>
    );
  }

  return (
    <Box sx={{ bgcolor: (t) => t.palette.mode === 'dark' ? 'background.default' : '#f6f7fb', minHeight: '100vh', pt: { xs: 4, md: 8 }, pb: { xs: 6, md: 8 } }}>
      <Container maxWidth="lg">
        {/* Hero */}
        <Paper elevation={0} sx={{ p: { xs: 3, md: 5 }, mb: 4, borderRadius: 3, background: (t) => t.palette.mode === 'dark' ? t.palette.background.paper : 'linear-gradient(180deg, #ffffff 0%, #f2f4f8 100%)', border: (t) => `1px solid ${t.palette.divider}` }}>
          <Typography variant="h3" fontWeight={800} sx={{ fontSize: { xs: '1.875rem', md: '2.75rem' }, mb: 1 }}>{videoData.title}</Typography>
          {videoData.description && (
            <Typography variant="subtitle1" color="text.secondary" sx={{ maxWidth: 920 }}>{videoData.description}</Typography>
          )}

          {isAdmin && (
            <Box sx={{ position: 'fixed', bottom: 24, right: 24, display: 'flex', flexDirection: 'column', gap: 2, zIndex: 1300 }}>
              <Tooltip title="Editar página de vídeos">
                <Fab color="warning" onClick={() => navigate('/adm/editar-pagina-videos', { state: { fromTemplatePage: false } })} disabled={isDeleting}><EditIcon /></Fab>
              </Tooltip>
              <Tooltip title="Excluir página de vídeos">
                <Fab color="error" onClick={() => setConfirmOpen(true)} disabled={isDeleting}><DeleteIcon /></Fab>
              </Tooltip>
            </Box>
          )}
        </Paper>

        <Grid container spacing={3}>
          {videoData.videos?.map((v: any) => (
            <Grid item xs={12} sm={6} md={4} key={v.id}>
              <VideoCard video={v} />
            </Grid>
          ))}
        </Grid>

        <DeleteConfirmDialog
          open={confirmOpen}
          title={videoData.title}
          onClose={() => !isDeleting && setConfirmOpen(false)}
          onConfirm={async () => {
            if (isDeleting) return;
            await deletePage(() => navigate("/"));
            setConfirmOpen(false);
          }}
        />

      </Container>
    </Box>
  );
}