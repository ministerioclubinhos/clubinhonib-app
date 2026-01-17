import React from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Box,
  Typography,
} from '@mui/material';
import { CalendarToday } from '@mui/icons-material';

interface YearSelectorProps {
  selectedYear: number;
  onYearChange: (year: number) => void;
  yearsRange?: number; 
  showLabel?: boolean;
}

export const YearSelector: React.FC<YearSelectorProps> = ({
  selectedYear,
  onYearChange,
  yearsRange = 3,
  showLabel = true,
}) => {
  const currentYear = new Date().getFullYear();

  const years = Array.from({ length: yearsRange }, (_, i) => currentYear - i);

  const handleChange = (event: SelectChangeEvent<number>) => {
    onYearChange(Number(event.target.value));
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {showLabel && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <CalendarToday fontSize="small" color="action" />
          <Typography variant="body2" color="text.secondary">
            Ano:
          </Typography>
        </Box>
      )}
      <FormControl size="small" sx={{ minWidth: 120 }}>
        <InputLabel id="year-selector-label">Ano</InputLabel>
        <Select
          labelId="year-selector-label"
          id="year-selector"
          value={selectedYear}
          label="Ano"
          onChange={handleChange}
        >
          {years.map((year) => (
            <MenuItem key={year} value={year}>
              {year}
              {year === currentYear && ' (Atual)'}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export const useYearSelection = (initialYear?: number) => {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = React.useState<number>(
    initialYear || currentYear
  );

  return {
    selectedYear,
    setSelectedYear,
    isCurrentYear: selectedYear === currentYear,
  };
};
