import React from 'react';
import { Box } from '@mui/material';
import { RadarComparisonChart, DemographicCharts } from '../components';
import { StatisticsFilters } from '../api';

interface DemographicTabProps {
	filters: StatisticsFilters;
}

const DemographicTab: React.FC<DemographicTabProps> = ({ filters }) => {
	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
			<RadarComparisonChart filters={filters} />
			<DemographicCharts filters={filters} />
		</Box>
	);
};

export default DemographicTab;

