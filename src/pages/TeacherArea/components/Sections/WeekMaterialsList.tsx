import { Box } from '@mui/material';

import { WeekMaterialsGallery } from '@/features/week-materials';

export default function WeekMaterialsList() {
  return (
    <Box data-testid="teacher-area-sections-week-materials-list">
      <WeekMaterialsGallery />
    </Box>
  );
}
