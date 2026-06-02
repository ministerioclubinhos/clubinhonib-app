import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Typography,
    Box,
    CircularProgress,
    Alert,
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import { AppDispatch } from '@/store/slices';
import { linkTeacherClub } from '@/store/slices/auth/authSlice';

interface LinkClubModalProps {
    open: boolean;
    onClose: () => void;
}

const LinkClubModal: React.FC<LinkClubModalProps> = ({ open, onClose }) => {
    const dispatch = useDispatch<AppDispatch>();
    const [clubNumber, setClubNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async () => {
        const num = parseInt(clubNumber, 10);
        if (!num || num < 1) {
            setError('Informe um número de clubinho válido.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await dispatch(linkTeacherClub(num)).unwrap();
            setClubNumber('');
            onClose();
        } catch (err: any) {
            setError(typeof err === 'string' ? err : 'Erro ao vincular clubinho. Verifique o número e tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (loading) return;
        setClubNumber('');
        setError(null);
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="xs"
            fullWidth
            PaperProps={{ sx: { borderRadius: 3 } }}
        >
            <DialogTitle
                sx={{
                    bgcolor: '#81d742',
                    color: 'white',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    py: 2,
                }}
            >
                <SchoolIcon />
                Vincular ao Clubinho
            </DialogTitle>

            <DialogContent sx={{ pt: 3, pb: 1 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                        De qual clubinho você faz parte?
                    </Typography>

                    <TextField
                        label="Número do Clubinho"
                        type="number"
                        value={clubNumber}
                        onChange={(e) => {
                            setClubNumber(e.target.value);
                            setError(null);
                        }}
                        inputProps={{ min: 1 }}
                        fullWidth
                        autoFocus
                        disabled={loading}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSubmit();
                        }}
                        sx={{
                            '& .MuiOutlinedInput-root.Mui-focused fieldset': {
                                borderColor: '#81d742',
                            },
                            '& label.Mui-focused': {
                                color: '#81d742',
                            },
                        }}
                    />

                    {error && (
                        <Alert severity="error" sx={{ py: 0.5 }}>
                            {error}
                        </Alert>
                    )}
                </Box>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
                <Button
                    onClick={handleClose}
                    disabled={loading}
                    variant="outlined"
                    sx={{
                        borderColor: '#81d742',
                        color: '#81d742',
                        '&:hover': { borderColor: '#6bb83a', color: '#6bb83a', bgcolor: 'transparent' },
                    }}
                >
                    Cancelar
                </Button>
                <Button
                    onClick={handleSubmit}
                    disabled={loading || !clubNumber}
                    variant="contained"
                    sx={{
                        bgcolor: '#81d742',
                        color: 'white',
                        fontWeight: 'bold',
                        '&:hover': { bgcolor: '#6bb83a' },
                        '&.Mui-disabled': { bgcolor: '#c8e6a0', color: 'white' },
                        minWidth: 120,
                    }}
                >
                    {loading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : 'Vincular'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default LinkClubModal;
