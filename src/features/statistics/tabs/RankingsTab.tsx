import React from 'react';
import { Box } from '@mui/material';
import { ClubRankings, TopEngagedChildren } from '../components';
import { StatisticsFilters } from '../api';

interface RankingsTabProps {
  filters: StatisticsFilters;
}

const RankingsTab: React.FC<RankingsTabProps> = ({ filters }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <ClubRankings filters={filters} />
      <TopEngagedChildren filters={filters} />
    </Box>
  );
};

export default RankingsTab;
