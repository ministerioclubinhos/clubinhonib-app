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
} from '@mui/material';
import { RootState } from 'store/slices';
import { MediaTargetType } from 'store/slices/types';

const WeekMaterialsList = () => {
    const routes = useSelector((state: RootState) => state.routes.routes);
    const loading = useSelector((state: RootState) => state.routes.loading);
    const weekMaterialsRoutes = routes.filter(
        (route) => route.entityType === MediaTargetType.WeekMaterialsPage && route.public
    );

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

    return (
        <Box
            sx={{
                padding: 4,
                backgroundColor: '#f5f5f5',
                minHeight: '100vh',
                marginTop: { xs: 4, md: 8 }, // mobile: 2, desktop: 4
                marginBottom: { xs: 2, md: 4 } // mobile: 2, desktop: 4
            }}
        >

            <Typography
                variant="h4"
                align="center"
                gutterBottom
                sx={{
                    fontSize: { xs: '1.5rem', md: '2rem' }
                }}
            >                Materiais Semanais
            </Typography>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: 2,
                    alignItems: 'center',
                    marginBottom: 4,
                }}
            >
                <TextField
                    label="Título, subtítulo ou descrição"
                    variant="outlined"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    sx={{
                        width: { xs: '100%', md: '90%' },
                        height: { xs: 48, md: 56 },
                    }}
                />
                <Button
                    variant="contained"
                    color="secondary"
                    component={Link}
                    to="/area-do-professor"
                    sx={{
                        width: { xs: '100%', sm: '10%' },
                        height: { xs: 40, sm: 56 },
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        px: { sm: 3 },
                    }}
                >
                    Área do Professor
                </Button>
            </Box>


            <Grid container spacing={4} justifyContent="center">
                {filteredRoutes.map((route) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={route.id}>
                        <Card
                            sx={{
                                maxWidth: 345,
                                margin: 'auto',
                                boxShadow: 3,
                                transition: 'transform 0.3s, box-shadow 0.3s',
                                '&:hover': {
                                    transform: 'scale(1.05)',
                                    boxShadow: 6,
                                },
                            }}
                        >
                            <CardMedia
                                component="img"
                                height="140"
                                image={route.image ?? undefined} // Correção aplicada aqui
                                alt={route.title}
                            />
                            <CardContent>
                                <Typography variant="h6" component="div">
                                    {route.title}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {route.subtitle}
                                </Typography>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                    }}
                                >
                                    {route.description}
                                </Typography>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    component={Link}
                                    to={`/${route.path}`}
                                    sx={{ marginTop: 2 }}
                                >
                                    Mais Detalhes
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default WeekMaterialsList;