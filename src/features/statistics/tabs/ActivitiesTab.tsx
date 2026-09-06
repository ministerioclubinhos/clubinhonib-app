import React from 'react';
import { ActivitiesComparisonChart } from '../components';
import type { PagelasStatsQueryDto } from '../types';

interface ActivitiesTabProps {
	filters: PagelasStatsQueryDto;
}

const ActivitiesTab: React.FC<ActivitiesTabProps> = ({ filters }) => {
	return <ActivitiesComparisonChart data-testid="statistics-tabs-activities-tab" filters={filters} />;
};

export default ActivitiesTab;

