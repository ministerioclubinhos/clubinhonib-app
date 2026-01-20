import React from 'react';
import {
    Box,
    Typography,
    Chip,
    Card,
    CardContent,
    Grid,
    Divider,
    IconButton,
    Dialog,
    DialogContent,
    DialogTitle,
    Slide,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import { motion } from 'framer-motion';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CloseIcon from '@mui/icons-material/Close';
import IdeasDocumentViewer from './IdeasDocumentViewer';
import IdeasImageGalleryView from './IdeasImageGalleryView';
import IdeasVideoPlayerView from './IdeasVideoPlayerView';

interface MediaTypeCardProps {
    type: string;
    icon: React.ReactNode;
    items: any[];
    color: string;
    emoji: string;
    sectionId: string;
    expandedKey: string | null;
    onToggleMediaType: (sectionId: string, mediaType: string) => void;
}

const Transition = React.forwardRef(function Transition(
    props: TransitionProps & {
        children: React.ReactElement<any, any>;
    },
    ref: React.Ref<unknown>,
) {
    return <Slide direction="up" ref={ref} {...props} />;
});

export default function MediaTypeCard({
    type,
    icon,
    items,
    color,
    emoji,
    sectionId,
    expandedKey,
    onToggleMediaType,
}: MediaTypeCardProps) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    if (items.length === 0) return null;

    const key = `${sectionId}-${type}`;
    const isExpanded = expandedKey === key;

    const handleClose = () => {
        if (isExpanded) {
            onToggleMediaType(sectionId, type);
        }
    };

    return (
        <>
            <Card
                sx={{
                    mb: { xs: '5px', sm: 2 },
                    borderRadius: { xs: 1, sm: 2 },
                    boxShadow: '0 1px 6px rgba(0,0,0,0.1)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                        boxShadow: '0 3px 12px rgba(0,0,0,0.15)',
                    },
                }}
            >
                <CardContent sx={{ p: { xs: '5px', sm: 2, md: 3 } }}>
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            cursor: 'pointer',
                            py: { xs: '5px', sm: 1 },
                        }}
                        onClick={() => onToggleMediaType(sectionId, type)}
                    >
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: { xs: 0.75, sm: 2 },
                            }}
                        >
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: { xs: 0.25, sm: 1 },
                                    color: color,
                                }}
                            >
                                {icon}
                                <Typography
                                    variant="h6"
                                    fontWeight="bold"
                                    sx={{
                                        fontSize: { xs: '0.9rem', sm: '1rem', md: '1.2rem' },
                                        color: color,
                                    }}
                                >
                                    {emoji}{' '}
                                    {type === 'videos'
                                        ? 'Vídeos'
                                        : type === 'documents'
                                            ? 'Documentos'
                                            : 'Imagens'}{' '}
                                    ({items.length})
                                </Typography>
                            </Box>
                            <Chip
                                label={items.length}
                                size="small"
                                sx={{
                                    backgroundColor: `${color}20`,
                                    color: color,
                                    fontWeight: 'bold',
                                    fontSize: { xs: '0.7rem', sm: '0.75rem' },
                                    height: { xs: 20, sm: 24 },
                                }}
                            />
                        </Box>
                        <IconButton
                            size="small"
                            sx={{
                                color: color,
                                transform: 'rotate(0deg)',
                                transition: 'transform 0.3s ease',
                                p: { xs: '5px', sm: 1 },
                            }}
                        >
                            <ExpandMoreIcon fontSize="small" />
                        </IconButton>
                    </Box>
                </CardContent>
            </Card>

            <Dialog
                open={isExpanded}
                slots={{ transition: Transition }}
                keepMounted
                onClose={handleClose}
                maxWidth="xl"
                fullWidth
                fullScreen={isMobile}
                slotProps={{
                    paper: {
                        sx: {
                            borderRadius: isMobile ? 0 : { xs: 2, md: 3 },
                            bgcolor: '#f5f5f5',
                            minHeight: '60vh',
                        }
                    }
                }}
            >
                <DialogTitle sx={{
                    m: 0,
                    p: 2,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    bgcolor: 'white',
                    borderBottom: '1px solid #e0e0e0'
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: color }}>
                        {icon}
                        <Typography variant="h6" component="div" fontWeight="bold">
                            {type === 'videos' ? 'Galeria de Vídeos' : type === 'documents' ? 'Galeria de Documentos' : 'Galeria de Imagens'}
                        </Typography>
                    </Box>
                    <IconButton
                        aria-label="close"
                        onClick={handleClose}
                        sx={{
                            color: (theme) => theme.palette.grey[500],
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers sx={{ p: { xs: 1, md: 3 } }}>
                    <Grid
                        container
                        spacing={{ xs: 2, sm: 3 }}
                    >
                        {items.map((item, index) => (
                            <Grid
                                item
                                xs={12}
                                sm={6}
                                md={4}
                                lg={3}
                                key={item.id || index}
                            >
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                >
                                    <Box
                                        sx={{
                                            height: '100%',
                                            borderRadius: { xs: 1.5, sm: 2 },
                                            overflow: 'hidden',
                                            boxShadow: '0 1px 6px rgba(0,0,0,0.1)',
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                                            },
                                            bgcolor: 'white'
                                        }}
                                    >
                                        {type === 'videos' && (
                                            <IdeasVideoPlayerView video={item} />
                                        )}
                                        {type === 'documents' && (
                                            <IdeasDocumentViewer document={item} />
                                        )}
                                        {type === 'images' && (
                                            <IdeasImageGalleryView image={item} />
                                        )}
                                    </Box>
                                </motion.div>
                            </Grid>
                        ))}
                    </Grid>
                </DialogContent>
            </Dialog>
        </>
    );
}
