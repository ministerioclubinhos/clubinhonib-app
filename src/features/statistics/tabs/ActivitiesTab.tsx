import React from 'react';
import { ActivitiesComparisonChart } from '../components';
import { StatisticsFilters } from '../api';

interface ActivitiesTabProps {
  filters: StatisticsFilters;
}

const ActivitiesTab: React.FC<ActivitiesTabProps> = ({ filters }) => {
  return <ActivitiesComparisonChart filters={filters} />;
};

export default ActivitiesTab;
