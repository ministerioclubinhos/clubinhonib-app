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
    FormHelperText,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setFeedbacks } from '@/store/slices/feedback/feedbackSlice';
import { FeedbackCategory, FeedbackCategoryLabels } from '@/store/slices/types';
import { RootState } from '@/store/slices';
import {
    apiCreateFeedback,
    buildFeedbackRequest,
    FeedbackFormErrors,
    validateFeedbackForm,
} from '@/features/feedback';
import { GENERIC_ERROR_MESSAGES, FORM_VALIDATION_MESSAGES } from '@/constants/errorMessages';


const SiteFeedbackForm: React.FC = () => {
    // Quem avalia já está autenticado: o nome vem do perfil e a API assina a
    // avaliação com ele, então o formulário não pergunta.
    const user = useSelector((state: RootState) => state.auth.user);
    const [rating, setRating] = useState<number | null>(null);
    const [comment, setComment] = useState('');
    const [category, setCategory] = useState('');
    const [errors, setErrors] = useState<FeedbackFormErrors>({
        rating: false,
        comment: false,
        category: false,
    });
    const [submitted, setSubmitted] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();

        const values = {
            rating,
            comment,
            category: category as FeedbackCategory | '',
        };
        const newErrors = validateFeedbackForm(values);

        setErrors(newErrors);

        if (Object.values(newErrors).some((error) => error)) {
            return;
        }

        try {
            // Só os campos preenchidos vão no corpo: id, datas e `read` são do
            // servidor, e a API recusa a requisição inteira se eles chegarem.
            const created = await apiCreateFeedback(buildFeedbackRequest(values));
            dispatch(setFeedbacks([created]));
            setSubmitted(true);
            resetForm();
            setTimeout(() => {
                navigate('/area-do-professor');
            }, 2000);

        } catch (error) {
            setErrorMessage(GENERIC_ERROR_MESSAGES.TRY_AGAIN);
            console.error('Erro ao enviar feedback:', error);
        }
    };

    const resetForm = () => {
        setRating(null);
        setComment('');
        setCategory('');
        setErrors({
            rating: false,
            comment: false,
            category: false,
        });
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

            <Typography variant="body2" color="text.secondary" mb={2}>
                Avaliando como <strong>{user?.name ?? 'sua conta'}</strong>
                {user?.email ? ` (${user.email})` : ''}.
            </Typography>

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
                    {FORM_VALIDATION_MESSAGES.REQUIRED_FIELD}
                </Typography>
            )}

            <FormControl fullWidth sx={{ mb: 2 }} error={errors.category}>
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
                {errors.category && (
                    <FormHelperText>
                        {FORM_VALIDATION_MESSAGES.REQUIRED_FIELD}
                    </FormHelperText>
                )}
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
                helperText={errors.comment ? FORM_VALIDATION_MESSAGES.REQUIRED_FIELD : ''}
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
