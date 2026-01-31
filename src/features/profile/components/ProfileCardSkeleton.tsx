import React from 'react';
import {
    Paper,
    Skeleton,
    Stack,
    Box,
} from '@mui/material';

const ProfileCardSkeleton: React.FC = () => (
    <Paper
        elevation={0}
        sx={{ borderRadius: 3, border: '1px solid rgba(0,0,0,0.06)', p: 2 }}
    >
        <Stack direction="row" spacing={1.5} alignItems="center">
            <Skeleton variant="circular" width={48} height={48} />
            <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width="70%" height={20} />
                <Skeleton variant="text" width="40%" height={16} />
            </Box>
        </Stack>
        <Stack spacing={0.5} sx={{ mt: 1.5 }}>
            <Skeleton variant="text" width="90%" height={14} />
            <Skeleton variant="text" width="50%" height={14} />
        </Stack>
    </Paper>
);

export default ProfileCardSkeleton;
