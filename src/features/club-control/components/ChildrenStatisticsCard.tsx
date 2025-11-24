import React from 'react';
import {
  Paper,
  Grid,
  Box,
  Typography,
  useTheme,
} from '@mui/material';
import {
  Groups,
  Assignment,
  PersonOff,
} from '@mui/icons-material';

interface ChildrenStatisticsCardProps {
  totalChildren: number;
  childrenWithPagela: number;
  childrenMissing: number;
}

export const ChildrenStatisticsCard: React.FC<ChildrenStatisticsCardProps> = ({
  totalChildren,
  childrenWithPagela,
  childrenMissing,
}) => {
  const theme = useTheme();

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 1.5, sm: 2 },
        mb: { xs: 2, sm: 3 },
        borderRadius: 3,
        border: `1px solid ${theme.palette.divider}`,
        bgcolor: 'background.paper',
      }}
    >
      <Grid container spacing={{ xs: 1, sm: 2 }}>
        <Grid item xs={4} sm={4}>
          <Box sx={{ textAlign: 'center' }}>
            <Groups sx={{ fontSize: { xs: 20, sm: 28 }, color: theme.palette.primary.main, mb: { xs: 0.5, sm: 1 } }} />
            <Typography 
              variant="h5" 
              fontWeight="bold" 
              color="primary"
              sx={{ fontSize: { xs: '1.25rem', sm: '1.75rem' }, mb: { xs: 0.25, sm: 0.5 } }}
            >
              {totalChildren}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' }, lineHeight: { xs: 1.2, sm: 1.5 } }}>
              Total de Crianças
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={4} sm={4}>
          <Box sx={{ textAlign: 'center' }}>
            <Assignment sx={{ fontSize: { xs: 20, sm: 28 }, color: theme.palette.success.main, mb: { xs: 0.5, sm: 1 } }} />
            <Typography 
              variant="h5" 
              fontWeight="bold" 
              color="success.main"
              sx={{ fontSize: { xs: '1.25rem', sm: '1.75rem' }, mb: { xs: 0.25, sm: 0.5 } }}
            >
              {childrenWithPagela}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' }, lineHeight: { xs: 1.2, sm: 1.5 } }}>
              Com Pagela
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={4} sm={4}>
          <Box sx={{ textAlign: 'center' }}>
            <PersonOff sx={{ fontSize: { xs: 20, sm: 28 }, color: theme.palette.error.main, mb: { xs: 0.5, sm: 1 } }} />
            <Typography 
              variant="h5" 
              fontWeight="bold" 
              color="error.main"
              sx={{ fontSize: { xs: '1.25rem', sm: '1.75rem' }, mb: { xs: 0.25, sm: 0.5 } }}
            >
              {childrenMissing}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' }, lineHeight: { xs: 1.2, sm: 1.5 } }}>
              Sem Pagela
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

