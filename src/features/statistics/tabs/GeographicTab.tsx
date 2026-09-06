import React from 'react';
import { GeographicChart } from '../components';
import type { PagelasStatsQueryDto } from '../types';

interface GeographicTabProps {
	filters: PagelasStatsQueryDto;
}

const GeographicTab: React.FC<GeographicTabProps> = ({ filters }) => {
	return <GeographicChart data-testid="statistics-tabs-geographic-tab" filters={filters} />;
};

export default GeographicTab;

