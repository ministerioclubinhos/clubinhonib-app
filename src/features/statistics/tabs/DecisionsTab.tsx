import React from 'react';
import { EnhancedDecisionsChart } from '../components';
import { AcceptedChristsStatsQueryDto } from '../api';

interface DecisionsTabProps {
	filters: AcceptedChristsStatsQueryDto;
}

const DecisionsTab: React.FC<DecisionsTabProps> = ({ filters }) => {
	return <EnhancedDecisionsChart filters={filters} />;
};

export default DecisionsTab;

