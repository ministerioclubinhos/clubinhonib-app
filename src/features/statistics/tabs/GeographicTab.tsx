import React from 'react';
import { GeographicChart } from '../components';
import { StatisticsFilters } from '../api';

interface GeographicTabProps {
	filters: StatisticsFilters;
}

const GeographicTab: React.FC<GeographicTabProps> = ({ filters }) => {
	return <GeographicChart filters={filters} />;
};

export default GeographicTab;

