import React, { Suspense } from 'react';
import { Box, Tabs, Tab, Skeleton } from '@mui/material';
import { useSearchParams } from 'react-router-dom';

const WeeklyAttendanceGrid = React.lazy(() =>
	import('../components').then((m) => ({ default: m.WeeklyAttendanceGrid }))
);
const ClubAttendanceTimeline = React.lazy(() =>
	import('../components').then((m) => ({ default: m.ClubAttendanceTimeline }))
);

const FrequencyTab: React.FC = () => {
	const [searchParams, setSearchParams] = useSearchParams();
	const initial = Number(searchParams.get('freq') ?? 0);
	const [subTab, setSubTab] = React.useState(Number.isNaN(initial) ? 0 : initial);

	const handleChange = (_: React.SyntheticEvent, value: number) => {
		setSubTab(value);
		setSearchParams((prev) => {
			const next = new URLSearchParams(prev);
			next.set('freq', String(value));
			return next;
		});
	};

	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
			<Tabs
				value={subTab}
				onChange={handleChange}
				variant="fullWidth"
				aria-label="subtabs de frequência"
			>
				<Tab label="📅 Semana" />
				<Tab label="📈 Timeline" />
			</Tabs>

			<Box role="tabpanel" hidden={subTab !== 0}>
				{subTab === 0 && (
					<Suspense fallback={<Skeleton variant="rounded" height={420} />}>
						<WeeklyAttendanceGrid />
					</Suspense>
				)}
			</Box>

			<Box role="tabpanel" hidden={subTab !== 1}>
				{subTab === 1 && (
					<Suspense fallback={<Skeleton variant="rounded" height={420} />}>
						<ClubAttendanceTimeline />
					</Suspense>
				)}
			</Box>
		</Box>
	);
};

export default FrequencyTab;

