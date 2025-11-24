import React from 'react';
import { EnhancedDecisionsChart } from '../components';
import { StatisticsFilters } from '../api';

interface DecisionsTabProps {
	filters: StatisticsFilters;
}

const DecisionsTab: React.FC<DecisionsTabProps> = ({ filters }) => {
	return <EnhancedDecisionsChart filters={filters} />;
};

export default DecisionsTab;


