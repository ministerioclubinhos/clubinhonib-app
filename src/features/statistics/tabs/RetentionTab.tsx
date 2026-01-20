import React from 'react';
import { Box } from '@mui/material';
import { RetentionFunnelChart, DemographicCharts } from '../components';
import { PagelasStatsQueryDto } from '../api';

interface RetentionTabProps {
	filters: PagelasStatsQueryDto;
}

const RetentionTab: React.FC<RetentionTabProps> = ({ filters }) => {
	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
			<RetentionFunnelChart filters={filters} />
			<DemographicCharts filters={filters} />
		</Box>
	);
};

export default RetentionTab;

