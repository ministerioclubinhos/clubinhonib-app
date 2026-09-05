import React from 'react';
import { ActivitiesComparisonChart } from '../components';
import type { PagelasStatsQueryDto } from '../types';

interface ActivitiesTabProps {
	filters: PagelasStatsQueryDto;
}

const ActivitiesTab: React.FC<ActivitiesTabProps> = ({ filters }) => {
	return <ActivitiesComparisonChart filters={filters} />;
};

export default ActivitiesTab;

