import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Snackbar,
  Alert,
  CircularProgress,
  TextField,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { useDispatch } from 'react-redux';
import api from '@/config/axiosConfig';
import FeedbackCard from './FeedbackCard';
import FeedbackDetailsModal from './FeedbackDetailsModal';
import FeedbackDeleteConfirmModal from './FeedbackDeleteConfirmModal';
import { setFeedbacks } from '@/store/slices/feedback/feedbackSlice';
import { FeedbackData } from '@/store/slices/feedback/feedbackSlice';

const FeedbackList: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const dispatch = useDispatch();

  const [feedbacks, setLocalFeedbacks] = useState<FeedbackData[]>([]);
  const [filteredFeedbacks, setFilteredFeedbacks] = useState<FeedbackData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackData | null>(null);
  const [feedbackToDelete, setFeedbackToDelete] = useState<FeedbackData | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/site-feedbacks');
      setLocalFeedbacks(data);
      setFilteredFeedbacks(data);
      dispatch(setFeedbacks(data));
    } catch {
      showSnackbar('Erro ao carregar feedbacks', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      const term = searchTerm.toLowerCase();
      const filtered = feedbacks.filter((f) =>
        [f.name, f.email || '', f.comment, f.category].some((field) =>
          field.toLowerCase().includes(term)
        )
      );
      setFilteredFeedbacks(filtered);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, feedbacks]);

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleDelete = async () => {
    if (!feedbackToDelete) return;
    try {
      await api.delete(`/site-feedbacks/${feedbackToDelete.id}`);
      showSnackbar('Feedback excluído com sucesso', 'success');
      fetchFeedbacks();
    } catch {
      showSnackbar('Erro ao excluir feedback', 'error');
    } finally {
      setFeedbackToDelete(null);
    }
  };

  const handleMarkAsRead = async () => {
    if (!selectedFeedback) return;
    try {
      await api.patch(`/site-feedbacks/${selectedFeedback.id}/read`);
      showSnackbar('Feedback marcado como lido', 'success');
      fetchFeedbacks();
    } catch {
      showSnackbar('Erro ao marcar como lido', 'error');
    }
  };

  return (
    <Box sx={{ p: { xs: 0, md: 4 }, mx: 'auto' }}>
      <Typography
        variant="h4"
        mb={4}
        textAlign="center"
        fontWeight="bold"
        sx={{ fontSize: { xs: '1.4rem', md: '2.4rem' } }}
      >
        Feedbacks Recebidos
      </Typography>

      <TextField
        fullWidth
        placeholder="Buscar por nome, email, comentário ou categoria..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{
          mb: 4,
          maxWidth: { xs: '100%', md: '60%' },
          mx: 'auto',
        }}
        size={isMobile ? 'small' : 'medium'}
      />

      {loading ? (
        <Box display="flex" justifyContent="center" mt={6}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredFeedbacks.map((feedback) => (
            <Grid item xs={12} sm={6} md={3} key={feedback.id}>
              <FeedbackCard
                feedback={feedback}
                onView={() => setSelectedFeedback(feedback)}
                onDelete={() => setFeedbackToDelete(feedback)}
              />
            </Grid>
          ))}
        </Grid>
      )}

      <FeedbackDetailsModal
        feedback={selectedFeedback}
        onClose={() => setSelectedFeedback(null)}
        onMarkAsRead={handleMarkAsRead}
        onDelete={() => {
          if (selectedFeedback) setFeedbackToDelete(selectedFeedback);
          setSelectedFeedback(null);
        }}
      />

      <FeedbackDeleteConfirmModal
        feedback={feedbackToDelete}
        onClose={() => setFeedbackToDelete(null)}
        onConfirm={handleDelete}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      >
        <Alert severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default FeedbackList;