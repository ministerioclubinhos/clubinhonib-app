
import React from 'react';
import { Box, Grid } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { StatCard } from '../ui/StatCard';

const MotionGrid = motion.create(Grid);

interface KPICardsGridProps {
    activeKPIs: any[];
    isLoading: boolean;
    isMobile: boolean;
    activeCategory: string;
}

export const KPICardsGrid: React.FC<KPICardsGridProps> = ({
    activeKPIs,
    isLoading,
    isMobile,
    activeCategory,
}) => {
    return (
        <Box sx={{ p: { xs: 2, md: 3 } }}>
            <AnimatePresence mode="wait">
                <MotionGrid
                    key={activeCategory}
                    container
                    spacing={{ xs: 1.5, md: 2 }}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                >
                    {activeKPIs.map((kpi, index) => (
                        <Grid item xs={6} sm={6} md={3} key={kpi.title}>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <StatCard
                                    {...kpi}
                                    loading={isLoading}
                                    compact={isMobile}
                                />
                            </motion.div>
                        </Grid>
                    ))}
                </MotionGrid>
            </AnimatePresence>
        </Box>
    );
};
