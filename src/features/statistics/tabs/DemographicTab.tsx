import React from 'react';
import { Box } from '@mui/material';
import { RadarComparisonChart, DemographicCharts } from '../components';
import type { PagelasStatsQueryDto } from '../types';

interface DemographicTabProps {
	filters: PagelasStatsQueryDto;
}

const DemographicTab: React.FC<DemographicTabProps> = ({ filters }) => {
	return (
		<Box data-testid="statistics-tabs-demographic-tab" sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
			<RadarComparisonChart filters={filters} />
			<DemographicCharts filters={filters} />
		</Box>
	);
};

export default DemographicTab;

