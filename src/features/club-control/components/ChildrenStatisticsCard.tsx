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
        p: 2.5,
        mb: 3,
        borderRadius: 3,
        border: `1px solid ${theme.palette.divider}`,
        bgcolor: 'background.paper',
      }}
    >
      <Grid container spacing={3}>
        <Grid item xs={12} sm={4}>
          <Box sx={{ textAlign: 'center' }}>
            <Groups sx={{ fontSize: 40, color: theme.palette.primary.main, mb: 1 }} />
            <Typography variant="h4" fontWeight="bold" color="primary">
              {totalChildren}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total de Crianças
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Box sx={{ textAlign: 'center' }}>
            <Assignment sx={{ fontSize: 40, color: theme.palette.success.main, mb: 1 }} />
            <Typography variant="h4" fontWeight="bold" color="success.main">
              {childrenWithPagela}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Com Pagela
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Box sx={{ textAlign: 'center' }}>
            <PersonOff sx={{ fontSize: 40, color: theme.palette.error.main, mb: 1 }} />
            <Typography variant="h4" fontWeight="bold" color="error.main">
              {childrenMissing}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sem Pagela
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

