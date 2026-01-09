import React from 'react';
import {
  Box,
  Grid,
  Snackbar,
  Alert,
  CircularProgress,
  TextField,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import FeedbackCard from './components/FeedbackCard';
import FeedbackDetailsModal from './components/FeedbackDetailsModal';
import DeleteConfirmDialog from '@/components/common/modal/DeleteConfirmDialog';
import { useFeedbackList, useFeedbackMutations, useFeedbackSearch } from './hooks';
import { FeedbackData } from '@/store/slices/feedback/feedbackSlice';
import BackHeader from '@/components/common/header/BackHeader';

const FeedbackManager: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { items, loading, error, setError, refresh } = useFeedbackList();
  const { search, setSearch, filtered } = useFeedbackSearch(items);
  const { mLoading, mError, setMError, deleteOne, markAsRead } = useFeedbackMutations(refresh);
  const [selected, setSelected] = React.useState<FeedbackData | null>(null);
  const [toDelete, setToDelete] = React.useState<FeedbackData | null>(null);
  const [snackbar, setSnackbar] = React.useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  const showSnackbar = (message: string, severity: 'success' | 'error') =>
    setSnackbar({ open: true, message, severity });

  const handleDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteOne(toDelete.id || '');
      showSnackbar('Feedback excluído com sucesso', 'success');
    } catch {
      showSnackbar('Erro ao excluir feedback', 'error');
    } finally {
      setToDelete(null);
    }
  };

  const handleMarkAsRead = async () => {
    if (!selected) return;
    try {
      await markAsRead(selected.id || '');
      showSnackbar('Feedback marcado como lido', 'success');
    } catch {
      showSnackbar('Erro ao marcar como lido', 'error');
    }
  };

  return (
    <Box sx={{ px: { xs: 2, sm: 2, md: 4 } }}>
      <BackHeader title="Feedbacks Recebidos" />

      <TextField
        fullWidth
        placeholder="Buscar por nome, email, comentário ou categoria..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 4, maxWidth: { xs: '100%', md: '60%' }, mx: 'auto' }}
        size={isMobile ? 'small' : 'medium'}
      />

      {(loading || mLoading) && !items.length ? (
        <Box display="flex" justifyContent="center" mt={6}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filtered.map((feedback) => (
            <Grid item xs={12} sm={6} md={3} key={feedback.id}>
              <FeedbackCard
                feedback={feedback}
                onView={() => setSelected(feedback)}
                onDelete={() => setToDelete(feedback)}
              />
            </Grid>
          ))}
        </Grid>
      )}

      <FeedbackDetailsModal
        feedback={selected}
        onClose={() => setSelected(null)}
        onMarkAsRead={handleMarkAsRead}
        onDelete={() => {
          if (selected) setToDelete(selected);
          setSelected(null);
        }}
      />

      <DeleteConfirmDialog
        open={!!toDelete}
        title={toDelete?.name || ''}
        onClose={() => setToDelete(null)}
        onConfirm={handleDelete}
      />

      {(error || mError) && (
        <Box mt={2}>
          <Alert
            severity="error"
            onClose={() => {
              if (error) setError('');
              if (mError) setMError('');
            }}
          >
            {error || mError}
          </Alert>
        </Box>
      )}

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

export default FeedbackManager;
