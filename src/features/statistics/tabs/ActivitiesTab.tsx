import React from 'react';
import { ActivitiesComparisonChart } from '../components';
import { PagelasStatsQueryDto } from '../api';

interface ActivitiesTabProps {
	filters: PagelasStatsQueryDto;
}

const ActivitiesTab: React.FC<ActivitiesTabProps> = ({ filters }) => {
	return <ActivitiesComparisonChart filters={filters} />;
};

export default ActivitiesTab;

