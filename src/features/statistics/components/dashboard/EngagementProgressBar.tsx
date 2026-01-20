
import React from 'react';
import { Box, Paper, Typography, Chip, LinearProgress, useTheme, alpha } from '@mui/material';

interface EngagementProgressBarProps {
    engagementRate: number;
    activeChildren: number;
    totalChildren: number;
    isLoading: boolean;
}

export const EngagementProgressBar: React.FC<EngagementProgressBarProps> = ({
    engagementRate,
    activeChildren,
    totalChildren,
    isLoading,
}) => {
    const theme = useTheme();

    return (
        <Box sx={{ px: { xs: 2, md: 3 }, pb: 3 }}>
            <Paper
                elevation={0}
                sx={{
                    p: { xs: 2, md: 3 },
                    borderRadius: 3,
                    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.04)} 0%, ${alpha(theme.palette.secondary.main, 0.04)} 100%)`,
                    border: `1px solid ${theme.palette.divider}`,
                }}
            >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box>
                        <Typography variant="subtitle2" fontWeight={700}>
                            Taxa de Engajamento Mensal
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {activeChildren} de {totalChildren} criancas ativas
                        </Typography>
                    </Box>
                    <Chip
                        label={`${engagementRate.toFixed(1)}%`}
                        color={engagementRate >= 80 ? 'success' : engagementRate >= 60 ? 'warning' : 'error'}
                        size="small"
                        sx={{ fontWeight: 700 }}
                    />
                </Box>

                <Box sx={{ position: 'relative' }}>
                    <LinearProgress
                        variant="determinate"
                        value={isLoading ? 0 : engagementRate}
                        sx={{
                            height: 12,
                            borderRadius: 6,
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            '& .MuiLinearProgress-bar': {
                                borderRadius: 6,
                                background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                            },
                        }}
                    />

                    {/* Milestone markers */}
                    {[25, 50, 75].map((milestone) => (
                        <Box
                            key={milestone}
                            sx={{
                                position: 'absolute',
                                left: `${milestone}%`,
                                top: 0,
                                bottom: 0,
                                width: 2,
                                bgcolor: alpha(theme.palette.common.white, 0.5),
                            }}
                        />
                    ))}
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                    <Typography variant="caption" color="text.secondary">0%</Typography>
                    <Typography variant="caption" color="text.secondary">50%</Typography>
                    <Typography variant="caption" color="text.secondary">100%</Typography>
                </Box>
            </Paper>
        </Box>
    );
};
