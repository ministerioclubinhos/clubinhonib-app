import React from 'react';
import {
    Dialog,
    Box,
    IconButton,
    Fade,
    Backdrop,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

interface ImagePreviewModalProps {
    open: boolean;
    onClose: () => void;
    imageUrl?: string;
    name?: string;
}

const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({ open, onClose, imageUrl, name }) => {
    if (!imageUrl) return null;

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            slots={{ transition: Fade, backdrop: Backdrop }}
            slotProps={{
                backdrop: {
                    sx: {
                        backdropFilter: 'blur(8px)',
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    },
                },
                paper: {
                    sx: {
                        borderRadius: 2,
                        overflow: 'hidden',
                        bgcolor: 'transparent',
                        boxShadow: 'none',
                    },
                },
            }}
        >
            <Box sx={{ position: 'relative' }}>
                <IconButton
                    onClick={onClose}
                    size="small"
                    sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        zIndex: 10,
                        color: 'white',
                        bgcolor: 'rgba(0,0,0,0.5)',
                        '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
                    }}
                >
                    <CloseIcon />
                </IconButton>
                <Box
                    component="img"
                    src={imageUrl}
                    alt={name || 'Profile'}
                    sx={{
                        width: '100%',
                        height: 'auto',
                        maxHeight: '90vh',
                        objectFit: 'contain',
                        display: 'block',
                    }}
                />
            </Box>
        </Dialog>
    );
};

export default ImagePreviewModal;
