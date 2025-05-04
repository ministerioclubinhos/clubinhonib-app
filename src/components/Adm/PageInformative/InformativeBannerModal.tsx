import {
    Box,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    FormControlLabel,
    Switch,
} from '@mui/material';
import { useEffect, useState } from 'react';
import api from 'config/axiosConfig';
import { InformativeBannerData } from 'store/slices/informative/informativeBannerSlice';
import { fetchRoutes } from 'store/slices/route/routeSlice';
import { useDispatch } from 'react-redux';
import { AppDispatch } from 'store/slices';

interface InformativeBannerModalProps {
    open: boolean;
    onClose: () => void;
    onSave: () => Promise<void>; // <- onSave agora é assíncrono
    initialData?: InformativeBannerData | null;
}

export default function InformativeBannerModal({
    open,
    onClose,
    onSave,
    initialData,
}: InformativeBannerModalProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isPublic, setIsPublic] = useState(true);
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch<AppDispatch>();

    const isEditing = Boolean(initialData?.id);

    useEffect(() => {
        if (initialData) {
            setTitle(initialData.title);
            setDescription(initialData.description);
            setIsPublic(initialData.public);
        } else {
            setTitle('');
            setDescription('');
            setIsPublic(true);
        }
    }, [initialData]);

    const handleSubmit = async () => {
        if (!title.trim() || !description.trim()) return;
        setLoading(true);
        try {
            const payload = { title, description, public: isPublic };
            if (isEditing && initialData?.id) {
                await api.patch(`/informatives/${initialData.id}`, payload);
            } else {
                await api.post('/informatives', payload);
            }
            await dispatch(fetchRoutes());
            await onSave(); 
            onClose();
        } catch (err) {
            console.error('Erro ao salvar banner', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                {isEditing ? 'Editar Banner Informativo' : 'Criar Banner Informativo'}
            </DialogTitle>
            <DialogContent>
                <Box mt={1}>
                    <TextField
                        fullWidth
                        label="Título"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        fullWidth
                        label="Descrição"
                        multiline
                        rows={3}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        sx={{ mb: 2 }}
                    />
                    <FormControlLabel
                        control={
                            <Switch
                                checked={isPublic}
                                onChange={(e) => setIsPublic(e.target.checked)}
                                color="primary"
                            />
                        }
                        label="Público"
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={loading}>
                    Cancelar
                </Button>
                <Button variant="contained" onClick={handleSubmit} disabled={loading}>
                    {isEditing ? 'Atualizar' : 'Criar'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
