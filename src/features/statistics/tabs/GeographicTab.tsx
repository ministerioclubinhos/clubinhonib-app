import React from 'react';
import { GeographicChart } from '../components';
import { PagelasStatsQueryDto } from '../api';

interface GeographicTabProps {
	filters: PagelasStatsQueryDto;
}

const GeographicTab: React.FC<GeographicTabProps> = ({ filters }) => {
	return <GeographicChart filters={filters} />;
};

export default GeographicTab;

