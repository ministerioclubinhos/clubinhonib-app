import React, { useState } from 'react';
import {
  Box,
  Button,
  Rating,
  TextField,
  Typography,
  Snackbar,
  Alert,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from '@mui/material';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setFeedbacks } from '@/store/slices/feedback/feedbackSlice';
import api from '@/config/axiosConfig';
import { FeedbackCategory, FeedbackCategoryLabels } from '@/store/slices/types';

export interface FeedbackData {
  id?: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  email?: string;
  rating: number;
  comment: string;
  category: string;
  published?: boolean;
}

const SiteFeedbackForm: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [category, setCategory] = useState('');
  const [errors, setErrors] = useState({
    name: false,
    rating: false,
    comment: false,
    email: false,
  });
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return email === '' || emailRegex.test(email);
  };

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    const newErrors = {
      name: name.trim() === '',
      rating: rating === null,
      comment: comment.trim() === '',
      email: !validateEmail(email),
    };

    setErrors(newErrors);

    if (Object.values(newErrors).some((error) => error)) {
      return;
    }

    const newFeedback: FeedbackData = {
      name,
      email: email || undefined,
      rating: rating!,
      comment,
      category,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      published: false,
    };

    try {
      const response = await api.post('/site-feedbacks', newFeedback);
      dispatch(setFeedbacks([response.data]));
      setSubmitted(true);
      resetForm();
      setTimeout(() => {
        navigate('/area-do-professor');
      }, 2000);
    } catch (error) {
      setErrorMessage('Erro ao enviar feedback. Tente novamente.');
      console.error('Erro ao enviar feedback:', error);
    }
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setRating(null);
    setComment('');
    setCategory('');
    setErrors({ name: false, rating: false, comment: false, email: false });
  };

  const handleCancel = () => {
    resetForm();
    navigate('/area-do-professor');
  };

  return (
    <Box
      sx={{
        maxWidth: 500,
        mx: 'auto',
        mt: 10,
        p: 3,
        boxShadow: 3,
        borderRadius: 2,
        backgroundColor: 'background.paper',
      }}
      role="form"
      aria-labelledby="feedback-title"
    >
      <Typography id="feedback-title" variant="h5" mb={2} textAlign="center">
        Avalie nosso site
      </Typography>

      <TextField
        label="Seu nome"
        variant="outlined"
        fullWidth
        value={name}
        onChange={(e) => setName(e.target.value)}
        sx={{ mb: 2 }}
        error={errors.name}
        helperText={errors.name ? 'Nome é obrigatório' : ''}
        required
        inputProps={{ 'aria-label': 'Seu nome' }}
      />

      <TextField
        label="E-mail (opcional)"
        variant="outlined"
        fullWidth
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        sx={{ mb: 2 }}
        error={errors.email}
        helperText={errors.email ? 'E-mail inválido' : ''}
        inputProps={{ 'aria-label': 'E-mail (opcional)' }}
      />

      <Typography gutterBottom component="legend">
        Nota:
      </Typography>
      <Rating
        name="site-rating"
        value={rating}
        onChange={(_, newValue) => setRating(newValue)}
        sx={{ mb: 2 }}
        aria-label="Nota do site"
      />
      {errors.rating && (
        <Typography color="error" variant="body2">
          Nota é obrigatória
        </Typography>
      )}

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel id="category-label">Sobre o que é seu feedback?</InputLabel>
        <Select
          labelId="category-label"
          value={category}
          onChange={(e) => setCategory(e.target.value as FeedbackCategory)}
          label="Sobre o que é seu feedback?"
          required
          aria-label="Categoria do feedback"
        >
          {Object.entries(FeedbackCategoryLabels).map(([key, label]) => (
            <MenuItem key={key} value={key}>
              {label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        label="Comentário"
        variant="outlined"
        multiline
        rows={4}
        fullWidth
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        sx={{ mb: 2 }}
        error={errors.comment}
        helperText={errors.comment ? 'Comentário é obrigatório' : ''}
        required
        inputProps={{ 'aria-label': 'Comentário' }}
      />

      {errorMessage && (
        <Alert severity="error" variant="filled" onClose={() => setErrorMessage('')} sx={{ mb: 2 }}>
          {errorMessage}
        </Alert>
      )}

      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          fullWidth
          aria-label="Enviar avaliação"
        >
          Enviar Avaliação
        </Button>
        <Button
          onClick={handleCancel}
          variant="outlined"
          color="secondary"
          fullWidth
          aria-label="Cancelar"
        >
          Cancelar
        </Button>
      </Box>

      <Snackbar
        open={submitted}
        autoHideDuration={4000}
        onClose={() => setSubmitted(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" variant="filled" onClose={() => setSubmitted(false)}>
          Obrigado pela sua avaliação!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SiteFeedbackForm;
