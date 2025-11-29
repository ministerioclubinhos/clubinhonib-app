import React from 'react';
import { Box } from '@mui/material';
import { WeekMonthSummary, AdvancedPagelasChart, ClubPerformanceChart, TopEngagedChildren } from '../components';
import { StatisticsFilters } from '../api';

interface OverviewTabProps {
	filters: StatisticsFilters;
}

const OverviewTab: React.FC<OverviewTabProps> = ({ filters }) => {
	return (
		<Box sx={{ 
			display: 'flex', 
			flexDirection: 'column', 
			alignItems: 'center',
			gap: { xs: 2, sm: 3 },
			width: '100%',
			maxWidth: '100%',
			overflowX: 'hidden',
		}}>
			<Box sx={{ width: '98%', maxWidth: '98%' }}>
				<WeekMonthSummary />
			</Box>
			<Box sx={{ width: '98%', maxWidth: '98%' }}>
				<AdvancedPagelasChart filters={filters} />
			</Box>
			<Box sx={{ width: '98%', maxWidth: '98%' }}>
				<ClubPerformanceChart filters={filters} />
			</Box>
			<Box sx={{ width: '98%', maxWidth: '98%' }}>
				<TopEngagedChildren filters={filters} />
			</Box>
		</Box>
	);
};

export default OverviewTab;


