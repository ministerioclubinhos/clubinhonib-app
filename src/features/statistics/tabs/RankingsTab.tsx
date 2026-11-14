import React from 'react';
import { Box } from '@mui/material';
import { ClubRankings, TopEngagedChildren } from '../components';
import type { PagelasStatsQueryDto } from '../types';

interface RankingsTabProps {
	filters: PagelasStatsQueryDto;
}

const RankingsTab: React.FC<RankingsTabProps> = ({ filters }) => {
	return (
		<Box data-testid="statistics-tabs-rankings-tab" sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
			<ClubRankings filters={filters} />
			<TopEngagedChildren filters={filters} />
		</Box>
	);
};

export default RankingsTab;

