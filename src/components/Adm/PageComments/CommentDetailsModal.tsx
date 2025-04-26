import {
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Button,
  Paper,
  Grid,
} from '@mui/material';
import { CommentData } from 'store/slices/comment/commentsSlice';

interface CommentDetailsModalProps {
  comment: CommentData | null;
  open: boolean;
  onClose: () => void;
}

export default function CommentDetailsModal({ comment, open, onClose }: CommentDetailsModalProps) {
  const formatDate = (date?: string | Date) => {
    if (!date) return 'Não disponível';
    return new Date(date).toLocaleString('pt-BR');
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: {
          width: '100%',
          margin: '10px auto',
          padding: '5px',
          borderRadius: 3,
          bgcolor: '#fafafa',
        },
      }}
    >
      <DialogTitle
        textAlign="center"
        fontWeight="bold"
        sx={{ fontSize: '1.5rem', color: '#333', padding: '5px' }}
      >
        Detalhes do Comentário
      </DialogTitle>
      <DialogContent sx={{ padding: '5px', overflowX: 'auto' }}>
        {comment && (
          <Stack spacing={3} sx={{ mt: 2, mx: 'auto', maxWidth: '100%' }}>
            <Paper elevation={1} sx={{ p: '5px', borderRadius: 2, bgcolor: '#fff' }}>
              <Typography variant="h6" fontWeight="bold" color="primary" textAlign="center" mb={2}>
                Informações do Comentário
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  textAlign: 'left',
                  width: '100%',
                  mt: 4,
                }}
              >
                <Grid
                  container
                  spacing={2}
                  sx={{
                    maxWidth: 800,
                    width: '100%',
                    px: { xs: 2, md: 0 },
                  }}
                >
                  <Grid item xs={12} md={6}>
                    <Typography variant="body1" sx={{ color: '#333', wordBreak: 'break-word' }}>
                      <strong>Nome:</strong> {comment.name || 'Sem Nome'}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography
                      variant="body1"
                      sx={{ color: '#333', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
                    >
                      <strong>Comentário:</strong> {comment.comment || 'Sem Comentário'}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="body1" sx={{ color: '#333', wordBreak: 'break-word' }}>
                      <strong>Clubinho:</strong> {comment.clubinho || 'Não informado'}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="body1" sx={{ color: '#333', wordBreak: 'break-word' }}>
                      <strong>Bairro:</strong> {comment.neighborhood || 'Não informado'}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="body1" sx={{ color: '#333', wordBreak: 'break-word' }}>
                      <strong>Status:</strong>{' '}
                      {comment.published !== undefined
                        ? comment.published
                          ? 'Publicado'
                          : 'Não Publicado'
                        : 'Não informado'}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="body1" sx={{ color: '#333', wordBreak: 'break-word' }}>
                      <strong>Criado em:</strong> {formatDate(comment.createdAt)}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="body1" sx={{ color: '#333', wordBreak: 'break-word' }}>
                      <strong>Atualizado em:</strong> {formatDate(comment.updatedAt)}
                    </Typography>
                  </Grid>

                  {comment.id && (
                    <Grid item xs={12} md={6}>
                      <Typography variant="body1" sx={{ color: '#333', wordBreak: 'break-word' }}>
                        <strong>ID:</strong> {comment.id}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </Box>
            </Paper>
          </Stack>
        )}
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', padding: '5px' }}>
        <Button variant="outlined" onClick={onClose} sx={{ minWidth: 100 }}>
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
