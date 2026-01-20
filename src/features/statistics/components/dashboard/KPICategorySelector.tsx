
import React from 'react';
import { Box, Grid, Paper, Typography, Tabs, Tab, useTheme, alpha } from '@mui/material';
import { KPICategory } from './useKPIData';

interface KPICategorySelectorProps {
    categories: KPICategory[];
    activeCategory: string;
    activeColor: string;
    isMobile: boolean;
    onCategoryChange: (category: string) => void;
}

export const KPICategorySelector: React.FC<KPICategorySelectorProps> = ({
    categories,
    activeCategory,
    activeColor,
    isMobile,
    onCategoryChange,
}) => {
    const theme = useTheme();

    return (
        <Box sx={{ px: { xs: 0, md: 2 }, pt: { xs: 0, md: 2 } }}>
            {isMobile ? (
                <Grid container spacing={1} sx={{ px: 1.5, pb: 0.5, mt: 1 }}>
                    {categories.map((cat) => {
                        const isActive = activeCategory === cat.id;
                        return (
                            <Grid item xs={6} key={cat.id}>
                                <Paper
                                    elevation={0}
                                    onClick={() => onCategoryChange(cat.id)}
                                    sx={{
                                        p: 1,
                                        borderRadius: 2,
                                        cursor: 'pointer',
                                        bgcolor: isActive ? alpha(cat.color, 0.1) : 'transparent',
                                        border: `1px solid ${isActive ? alpha(cat.color, 0.3) : theme.palette.divider}`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1,
                                        transition: 'all 0.2s',
                                        height: '100%',
                                    }}
                                >
                                    <Box sx={{
                                        color: isActive ? cat.color : 'text.secondary',
                                        display: 'flex',
                                        '& svg': { fontSize: 18 }
                                    }}>
                                        {cat.icon}
                                    </Box>
                                    <Typography
                                        variant="body2"
                                        fontWeight={600}
                                        sx={{
                                            color: isActive ? cat.color : 'text.secondary',
                                            fontSize: '0.75rem',
                                            lineHeight: 1.2,
                                        }}
                                    >
                                        {cat.label}
                                    </Typography>
                                </Paper>
                            </Grid>
                        );
                    })}
                </Grid>
            ) : (
                <Tabs
                    value={activeCategory}
                    onChange={(_, v) => onCategoryChange(v)}
                    variant="fullWidth"
                    sx={{
                        '& .MuiTab-root': {
                            textTransform: 'none',
                            fontWeight: 600,
                            minHeight: 48,
                            fontSize: '0.875rem',
                        },
                        '& .MuiTabs-indicator': {
                            height: 3,
                            borderRadius: '3px 3px 0 0',
                            bgcolor: activeColor,
                        },
                    }}
                >
                    {categories.map((cat) => (
                        <Tab
                            key={cat.id}
                            value={cat.id}
                            icon={cat.icon as React.ReactElement}
                            iconPosition="start"
                            label={cat.label}
                            sx={{
                                '&.Mui-selected': {
                                    color: cat.color,
                                },
                            }}
                        />
                    ))}
                </Tabs>
            )}
        </Box>
    );
};
