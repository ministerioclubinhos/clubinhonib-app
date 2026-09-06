import React from 'react';
import { EnhancedDecisionsChart } from '../components';
import type { AcceptedChristsStatsQueryDto } from '../types';

interface DecisionsTabProps {
	filters: AcceptedChristsStatsQueryDto;
}

const DecisionsTab: React.FC<DecisionsTabProps> = ({ filters }) => {
	return <EnhancedDecisionsChart data-testid="statistics-tabs-decisions-tab" filters={filters} />;
};

export default DecisionsTab;

