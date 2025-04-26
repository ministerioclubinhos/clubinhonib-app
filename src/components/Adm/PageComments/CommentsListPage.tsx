import { useEffect, useState, useMemo, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Alert,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { Visibility, Delete, Edit, Publish } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import api from '../../../config/axiosConfig';
import { AppDispatch, RootState } from '../../../store/slices';
import { CommentData, setComments } from 'store/slices/comment/commentsSlice';
import CommentDetailsModal from './CommentDetailsModal';

const debounce = <T extends (...args: any[]) => void>(func: T, delay: number) => {
  let timeoutId: NodeJS.Timeout | undefined;

  const debounced = (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };

  debounced.cancel = () => {
    clearTimeout(timeoutId);
    timeoutId = undefined;
  };

  return debounced as T & { cancel: () => void };
};

export default function CommentsListPage() {
  const [filteredComments, setFilteredComments] = useState<CommentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFiltering, setIsFiltering] = useState(false);
  const [error, setError] = useState('');
  const [commentToDelete, setCommentToDelete] = useState<CommentData | null>(null);
  const [commentToPublish, setCommentToPublish] = useState<CommentData | null>(null);
  const [commentToEdit, setCommentToEdit] = useState<CommentData | null>(null);
  const [selectedComment, setSelectedComment] = useState<CommentData | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    comment: '',
    clubinho: '',
    neighborhood: '',
  });
  const [editErrors, setEditErrors] = useState({
    comment: false,
    clubinho: false,
    neighborhood: false,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [publishFilter, setPublishFilter] = useState('all');

  const dispatch = useDispatch<AppDispatch>();
  const comments = useSelector((state: RootState) => state.comments.comments);

  const fetchComments = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/comments');
      dispatch(setComments(response.data));
      setFilteredComments(response.data);
    } catch (err) {
      console.error('Erro ao buscar comentários:', err);
      setError('Erro ao buscar comentários');
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const filterComments = useCallback(
    (term: string, status: string) => {
      let result = comments || [];

      if (term.trim()) {
        const lowerSearch = term.toLowerCase();
        result = result.filter(
          (comment) =>
            (comment.name || '').toLowerCase().includes(lowerSearch) ||
            (comment.clubinho || '').toLowerCase().includes(lowerSearch) ||
            (comment.neighborhood || '').toLowerCase().includes(lowerSearch)
        );
      }

      if (status === 'published') {
        result = result.filter((comment) => comment.published);
      } else if (status === 'unpublished') {
        result = result.filter((comment) => !comment.published);
      }

      setFilteredComments(result);
      setIsFiltering(false);
    },
    [comments]
  );

  const debouncedFilter = useMemo(
    () =>
      debounce((term: string) => {
        filterComments(term, publishFilter);
      }, 300),
    [filterComments, publishFilter]
  );

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setIsFiltering(true);
    debouncedFilter(term);
  };

  useEffect(() => {
    filterComments(searchTerm, publishFilter);
  }, [filterComments, searchTerm, publishFilter]);

  useEffect(() => {
    return () => {
      debouncedFilter.cancel();
    };
  }, [debouncedFilter]);

  const truncateDescription = (description: string, length: number = 80) => {
    return description.length > length ? description.substring(0, length) + '...' : description;
  };

  const handlePublish = async () => {
    if (!commentToPublish || !commentToPublish.id) return;

    setLoading(true);
    try {
      await api.put(`/comments/${commentToPublish.id}`, {
        name: commentToPublish.name,
        comment: commentToPublish.comment,
        clubinho: commentToPublish.clubinho,
        neighborhood: commentToPublish.neighborhood,
        published: true,
      });
      setCommentToPublish(null);
      await fetchComments();
    } catch (error) {
      console.error('Erro ao publicar comentário:', error);
      setError('Erro ao publicar comentário');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!commentToDelete || !commentToDelete.id) return;

    setLoading(true);
    try {
      await api.delete(`/comments/${commentToDelete.id}`);
      setCommentToDelete(null);
      await fetchComments();
    } catch (error) {
      console.error('Erro ao deletar comentário:', error);
      setError('Erro ao deletar comentário');
    } finally {
      setLoading(false);
    }
  };

  const handleEditOpen = (comment: CommentData) => {
    setCommentToEdit(comment);
    setEditFormData({
      name: comment.name,
      comment: comment.comment,
      clubinho: comment.clubinho,
      neighborhood: comment.neighborhood,
    });
    setEditErrors({ comment: false, clubinho: false, neighborhood: false });
  };

  const handleEditSave = async () => {
    if (!commentToEdit || !commentToEdit.id) return;

    const newErrors = {
      comment: !editFormData.comment.trim(),
      clubinho: !editFormData.clubinho.trim(),
      neighborhood: !editFormData.neighborhood.trim(),
    };
    setEditErrors(newErrors);

    if (Object.values(newErrors).some(Boolean)) return;

    setLoading(true);
    try {
      await api.put(`/comments/${commentToEdit.id}`, {
        name: editFormData.name,
        comment: editFormData.comment,
        clubinho: editFormData.clubinho,
        neighborhood: editFormData.neighborhood,
        published: true,
      });
      setCommentToEdit(null);
      await fetchComments();
    } catch (error) {
      console.error('Erro ao salvar comentário:', error);
      setError('Erro ao salvar comentário');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        px: { xs: 2, md: 4 },
        py: { xs: 2, md: 3 },
        mt: { xs: 0, md: 2 },
        bgcolor: '#f9fafb',
        minHeight: '100vh',
      }}
    >
      <Typography
        variant="h4"
        fontWeight="bold"
        textAlign="center"
        sx={{
          mt: 0,
          mb: { xs: 3, md: 4 },
          fontSize: { xs: '1.8rem', md: '2.5rem' },
          color: '#1a3c34',
        }}
      >
        Gerenciamento de Comentários
      </Typography>

      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2,
          mb: 4,
          alignItems: { sm: 'center' },
          position: 'relative',
        }}
      >
        <Box sx={{ flex: 1, position: 'relative' }}>
          <TextField
            fullWidth
            label="Buscar por nome, clubinho ou bairro"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            sx={{ maxWidth: { sm: 400 } }}
          />
          {isFiltering && (
            <CircularProgress
              size={20}
              sx={{
                position: 'absolute',
                right: 10,
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#1976d2',
              }}
            />
          )}
        </Box>
        <FormControl sx={{ minWidth: 160 }} size="small">
          <InputLabel>Status</InputLabel>
          <Select
            value={publishFilter}
            onChange={(e) => setPublishFilter(e.target.value)}
            label="Status"
          >
            <MenuItem value="all">Todos</MenuItem>
            <MenuItem value="published">Publicado</MenuItem>
            <MenuItem value="unpublished">Não Publicado</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {loading ? (
        <Box textAlign="center" mt={10}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box textAlign="center" mt={10}>
          <Alert severity="error">{error}</Alert>
        </Box>
      ) : !comments || comments.length === 0 ? (
        <Box textAlign="center" mt={10}>
          <Alert severity="info">Nenhum comentário encontrado.</Alert>
        </Box>
      ) : filteredComments.length === 0 ? (
        <Box textAlign="center" mt={10}>
          <Alert severity="info">Nenhum comentário corresponde aos filtros.</Alert>
        </Box>
      ) : (
        <Grid container spacing={3} justifyContent="center">
          {filteredComments.map((comment) => (
            <Grid
              item
              key={comment.id || `${comment.createdAt}-${comment.name}`}
              xs={12}
              sm={6}
              md={4}
              lg={3}
            >
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  p: 2,
                  bgcolor: comment.published ? '#e6f4ea' : '#fff3e0',
                  border: comment.published ? '1px solid #4caf50' : '1px solid #ff9800',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                  },
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <Tooltip title="Excluir Comentário">
                  <IconButton
                    size="small"
                    onClick={() => setCommentToDelete(comment)}
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      color: '#d32f2f',
                      bgcolor: 'rgba(255,255,255,0.8)',
                      '&:hover': { bgcolor: '#ffebee' },
                    }}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </Tooltip>

                <CardContent sx={{ flexGrow: 1, pb: 2 }}>
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    textAlign="left"
                    gutterBottom
                    sx={{
                      fontSize: { xs: '1.1rem', md: '1.3rem' },
                      color: '#1a3c34',
                    }}
                  >
                    {comment.name || 'Sem Nome'}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    textAlign="left"
                    sx={{
                      mb: 2,
                      fontSize: { xs: '0.85rem', md: '0.95rem' },
                      lineHeight: 1.5,
                    }}
                  >
                    {truncateDescription(comment.comment)}
                  </Typography>

                  <Typography
                    variant="caption"
                    color={comment.published ? 'success.main' : 'warning.main'}
                    textAlign="left"
                    sx={{
                      fontWeight: 'medium',
                      fontSize: { xs: '0.8rem', md: '0.9rem' },
                    }}
                  >
                    {comment.published !== undefined
                      ? comment.published
                        ? 'Publicado'
                        : 'Não Publicado'
                      : 'Não informado'}
                  </Typography>
                </CardContent>

                <Box
                  sx={{
                    display: 'flex',
                    gap: 1,
                    justifyContent: 'center',
                    flexWrap: 'wrap',
                    p: 2,
                    borderTop: '1px solid #e0e0e0',
                  }}
                >
                  <Tooltip title="Ver detalhes do comentário">
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Visibility />}
                      onClick={() => setSelectedComment(comment)}
                      sx={{
                        flex: 1,
                        minWidth: 100,
                        borderColor: '#1976d2',
                        color: '#1976d2',
                        fontSize: { xs: '0.75rem', md: '0.85rem' },
                        transition: 'all 0.2s',
                        '&:hover': {
                          borderColor: '#1565c0',
                          bgcolor: '#e3f2fd',
                        },
                      }}
                    >
                      Detalhes
                    </Button>
                  </Tooltip>
                  <Tooltip title="Editar comentário">
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Edit />}
                      onClick={() => handleEditOpen(comment)}
                      sx={{
                        flex: 1,
                        minWidth: 100,
                        borderColor: '#0288d1',
                        color: '#0288d1',
                        fontSize: { xs: '0.75rem', md: '0.85rem' },
                        transition: 'all 0.2s',
                        '&:hover': {
                          borderColor: '#0277bd',
                          bgcolor: '#e1f5fe',
                        },
                      }}
                    >
                      Editar
                    </Button>
                  </Tooltip>
                  {comment.published !== undefined && !comment.published && (
                    <Tooltip title="Publicar comentário">
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<Publish />}
                        onClick={() => setCommentToPublish(comment)}
                        sx={{
                          flex: 1,
                          minWidth: 100,
                          bgcolor: '#4caf50',
                          fontSize: { xs: '0.75rem', md: '0.85rem' },
                          transition: 'all 0.2s',
                          '&:hover': {
                            bgcolor: '#43a047',
                          },
                        }}
                      >
                        Publicar
                      </Button>
                    </Tooltip>
                  )}
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog
        open={!!commentToDelete}
        onClose={() => setCommentToDelete(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja excluir o comentário de{' '}
            <strong>{commentToDelete?.name || 'Sem Nome'}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCommentToDelete(null)} sx={{ color: '#757575' }}>
            Cancelar
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleDelete}
            sx={{ bgcolor: '#d32f2f', '&:hover': { bgcolor: '#b71c1c' } }}
          >
            Excluir
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={!!commentToPublish}
        onClose={() => setCommentToPublish(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Confirmar Publicação</DialogTitle>
        <DialogContent>
          <Typography>
            Deseja publicar o comentário de <strong>{commentToPublish?.name || 'Sem Nome'}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCommentToPublish(null)} sx={{ color: '#757575' }}>
            Cancelar
          </Button>
          <Button
            color="success"
            variant="contained"
            onClick={handlePublish}
            sx={{ bgcolor: '#4caf50', '&:hover': { bgcolor: '#43a047' } }}
          >
            Publicar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!commentToEdit} onClose={() => setCommentToEdit(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Editar Comentário</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {['name', 'comment', 'clubinho', 'neighborhood'].map((field) => (
              <TextField
                key={field}
                fullWidth
                required={field !== 'name'}
                label={`${field.charAt(0).toUpperCase() + field.slice(1)}${field !== 'name' ? ' (Obrigatório)' : ''}`}
                variant="outlined"
                size="small"
                sx={{ mb: 2 }}
                multiline={field === 'comment'}
                rows={field === 'comment' ? 3 : 1}
                value={editFormData[field as keyof typeof editFormData]}
                onChange={(e) => setEditFormData({ ...editFormData, [field]: e.target.value })}
                error={editErrors[field as keyof typeof editErrors]}
                helperText={
                  editErrors[field as keyof typeof editErrors]
                    ? `${field.charAt(0).toUpperCase() + field.slice(1)} é obrigatório`
                    : ''
                }
              />
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCommentToEdit(null)} sx={{ color: '#757575' }}>
            Cancelar
          </Button>
          <Button
            color="primary"
            variant="contained"
            onClick={handleEditSave}
            disabled={loading}
            sx={{ bgcolor: '#1976d2', '&:hover': { bgcolor: '#1565c0' } }}
          >
            Salvar e Publicar
          </Button>
        </DialogActions>
      </Dialog>

      <CommentDetailsModal
        comment={selectedComment}
        open={!!selectedComment}
        onClose={() => setSelectedComment(null)}
      />
    </Box>
  );
}
