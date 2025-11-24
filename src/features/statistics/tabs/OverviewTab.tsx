import React from 'react';
import { Box } from '@mui/material';
import { WeekMonthSummary, AdvancedPagelasChart, ClubPerformanceChart, TopEngagedChildren } from '../components';
import { StatisticsFilters } from '../api';

interface OverviewTabProps {
	filters: StatisticsFilters;
}

const OverviewTab: React.FC<OverviewTabProps> = ({ filters }) => {
	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
			<WeekMonthSummary />
			<AdvancedPagelasChart filters={filters} />
			<ClubPerformanceChart filters={filters} />
			<TopEngagedChildren filters={filters} />
		</Box>
	);
};

export default OverviewTab;


