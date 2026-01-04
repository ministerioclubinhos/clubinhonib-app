import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
    Grid,
    Card,
    CardContent,
    CardMedia,
    Typography,
    Button,
    Box,
    CircularProgress,
    TextField,
    IconButton,
    Paper,
    useTheme,
    useMediaQuery,
    Container,
} from '@mui/material';
import { ArrowBack, Search, Clear } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { RootState } from 'store/slices';
import { MediaTargetType } from 'store/slices/types';
import { FofinhoButton } from '../Buttons';


const WeekMaterialsList = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const routes = useSelector((state: RootState) => state.routes.routes);
    const loading = useSelector((state: RootState) => state.routes.loading);
    const weekMaterialsRoutes = routes
        .filter(
            (route) =>
                route.entityType === MediaTargetType.WeekMaterialsPage && route.public
        )
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());


    const [filter, setFilter] = useState('');
    const [filteredRoutes, setFilteredRoutes] = useState(weekMaterialsRoutes);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            const lowercasedFilter = filter.toLowerCase();
            const filtered = weekMaterialsRoutes.filter(
                (route) =>
                    route.title.toLowerCase().includes(lowercasedFilter) ||
                    route.subtitle.toLowerCase().includes(lowercasedFilter) ||
                    route.description.toLowerCase().includes(lowercasedFilter)
            );
            setFilteredRoutes(filtered);
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [filter, weekMaterialsRoutes]);

    if (loading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '100vh',
                }}
            >
                <CircularProgress />
            </Box>
        );
    }

    const handleBack = () => {
        navigate('/area-do-professor');
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                py: { xs: 2, md: 4 },
                px: { xs: 0, md: 0 },
            }}
        >
            <Container maxWidth={false} sx={{ px: { xs: 2, md: 3 } }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <Box
                        sx={{
                            position: 'relative',
                            mb: 3,
                            overflow: 'hidden',
                        }}
                    >
                        <Box
                            sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                zIndex: 10,
                            }}
                        >
                            <IconButton
                                onClick={handleBack}
                                sx={{
                                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                                    backdropFilter: 'blur(10px)',
                                    border: '1px solid rgba(255, 255, 255, 0.3)',
                                    color: 'white',
                                    '&:hover': {
                                        bgcolor: 'rgba(255, 255, 255, 0.3)',
                                        transform: 'scale(1.1)',
                                    },
                                    transition: 'all 0.2s ease',
                                }}
                                size={isMobile ? "medium" : "large"}
                            >
                                <ArrowBack fontSize={isMobile ? "medium" : "large"} />
                            </IconButton>
                        </Box>

                        <Box
                            sx={{
                                position: 'absolute',
                                top: -50,
                                right: -50,
                                width: 100,
                                height: 100,
                                background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)',
                                borderRadius: '50%',
                                opacity: 0.1,
                                filter: 'blur(20px)',
                            }}
                        />
                        <Box
                            sx={{
                                position: 'absolute',
                                bottom: -30,
                                left: -30,
                                width: 60,
                                height: 60,
                                background: 'linear-gradient(45deg, #4ecdc4, #44a08d)',
                                borderRadius: '50%',
                                opacity: 0.1,
                                filter: 'blur(15px)',
                            }}
                        />

                        <Box
                            sx={{
                                textAlign: 'center',
                                py: { xs: 4, md: 6 },
                                px: { xs: 2, md: 4 },
                                position: 'relative',
                                zIndex: 1,
                            }}
                        >
                            <Typography
                                variant="h3"
                                fontWeight="bold"
                                sx={{
                                    fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
                                    background: 'linear-gradient(45deg, #ffffff, #f0f8ff)',
                                    backgroundClip: 'text',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    mb: 1,
                                }}
                            >
                                📚 Materiais Semanais
                            </Typography>

                            <Typography
                                variant="body1"
                                sx={{
                                    color: 'rgba(255, 255, 255, 0.9)',
                                    fontSize: { xs: '0.9rem', md: '1rem' },
                                    maxWidth: 600,
                                    mx: 'auto',
                                }}
                            >
                                Explore materiais atualizados semanalmente para enriquecer suas aulas e atividades do Clubinho
                            </Typography>
                        </Box>

                        <Box
                            sx={{
                                position: 'relative',
                                height: 60,
                                '&::before': {
                                    content: '""',
                                    position: 'absolute',
                                    bottom: 0,
                                    left: 0,
                                    right: 0,
                                    height: '100%',
                                    background: 'linear-gradient(to bottom, transparent, rgba(255, 255, 255, 0.1))',
                                    borderRadius: '50% 50% 0 0 / 100% 100% 0 0',
                                },
                                '&::after': {
                                    content: '""',
                                    position: 'absolute',
                                    bottom: 0,
                                    left: 0,
                                    right: 0,
                                    height: '50%',
                                    background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.3))',
                                    borderRadius: '50% 50% 0 0 / 100% 100% 0 0',
                                },
                            }}
                        />
                    </Box>

                    <Paper
                        elevation={8}
                        sx={{
                            borderRadius: 4,
                            background: 'rgba(255, 255, 255, 0.95)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            p: { xs: 2, md: 4 },
                        }}
                    >
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: { xs: 'column', sm: 'row' },
                                gap: 2,
                                alignItems: 'center',
                                mb: { xs: 3, md: 4 },
                            }}
                        >
                            <TextField
                                label="Buscar materiais..."
                                variant="outlined"
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                size={isMobile ? "small" : "medium"}
                                InputProps={{
                                    startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
                                    endAdornment: filter && (
                                        <IconButton
                                            size="small"
                                            onClick={() => setFilter('')}
                                            sx={{ mr: -1 }}
                                        >
                                            <Clear fontSize="small" />
                                        </IconButton>
                                    ),
                                }}
                                sx={{
                                    flex: 1,
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 3,
                                    },
                                }}
                            />
                            <FofinhoButton references={['teacherArea']} />
                        </Box>


                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }}>
                                {filteredRoutes.map((route, index) => (
                                    <Grid item xs={12} sm={6} md={4} lg={3} xl={2.4} key={route.id}>
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.4, delay: index * 0.1 }}
                                            whileHover={{ y: -4 }}
                                            style={{ height: '100%' }} 
                                        >
                                            <Card
                                                sx={{
                                                    height: '100%',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    borderRadius: 3,
                                                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
                                                    border: '1px solid #e5e7eb',
                                                    transition: 'all 0.3s ease',
                                                    '&:hover': {
                                                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
                                                        borderColor: '#3b82f6',
                                                    },
                                                }}
                                            >
                                                <CardMedia
                                                    component="img"
                                                    height="160"
                                                    image={route.image ?? undefined}
                                                    alt={route.title}
                                                    sx={{
                                                        objectFit: 'cover',
                                                        borderTopLeftRadius: 12,
                                                        borderTopRightRadius: 12,
                                                    }}
                                                />
                                                <CardContent sx={{ flexGrow: 1, p: { xs: 2, md: 2.5 } }}>
                                                    <Typography
                                                        variant="h6"
                                                        component="div"
                                                        sx={{
                                                            fontWeight: 600,
                                                            fontSize: { xs: '1rem', md: '1.1rem' },
                                                            mb: 1,
                                                            lineHeight: 1.3,
                                                        }}
                                                    >
                                                        {route.title}
                                                    </Typography>
                                                    <Typography
                                                        variant="body2"
                                                        color="text.secondary"
                                                        sx={{
                                                            fontWeight: 500,
                                                            fontSize: { xs: '0.85rem', md: '0.9rem' },
                                                            mb: 1,
                                                        }}
                                                    >
                                                        {route.subtitle}
                                                    </Typography>
                                                    <Typography
                                                        variant="body2"
                                                        color="text.secondary"
                                                        sx={{
                                                            display: '-webkit-box',
                                                            WebkitLineClamp: 3,
                                                            WebkitBoxOrient: 'vertical',
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            fontSize: { xs: '0.8rem', md: '0.85rem' },
                                                            lineHeight: 1.4,
                                                        }}
                                                    >
                                                        {route.description}
                                                    </Typography>
                                                </CardContent>
                                                <Box sx={{ p: { xs: 2, md: 2.5 }, pt: 0 }}>
                                                    <Button
                                                        variant="contained"
                                                        component={Link}
                                                        to={`/${route.path}`}
                                                        fullWidth
                                                        size={isMobile ? "medium" : "small"}
                                                        sx={{
                                                            borderRadius: 2,
                                                            fontWeight: 600,
                                                            fontSize: { xs: '0.9rem', md: '0.85rem' },
                                                            background: 'linear-gradient(45deg, #3b82f6, #1d4ed8)',
                                                            boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
                                                            '&:hover': {
                                                                background: 'linear-gradient(45deg, #2563eb, #1e40af)',
                                                                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
                                                                transform: 'translateY(-1px)',
                                                            },
                                                            transition: 'all 0.2s ease',
                                                        }}
                                                    >
                                                        {isMobile ? '📖 Ver Material' : 'Ver Material'}
                                                    </Button>
                                                </Box>
                                            </Card>
                                        </motion.div>
                                    </Grid>
                                ))}
                            </Grid>
                        </motion.div>
                    </Paper>
                </motion.div>
            </Container>
        </Box>
    );
};

export default WeekMaterialsList;
