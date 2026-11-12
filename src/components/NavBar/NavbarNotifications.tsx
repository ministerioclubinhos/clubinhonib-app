import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Box } from '@mui/material';
import type { RootState } from '@/store/slices';
import { UserRole } from '@/types/shared';
import { useProfileAlerts } from '@/features/profile/hooks';
import { FEATURE } from '@/features/feature-flags';
import { useFeatureFlags } from '@/hooks';
import LinkClubModal from '@/features/auth/components/LinkClubModal';
import { NotificationBell } from '@/features/notifications';
import CompleteProfileAlert from './CompleteProfileAlert';
import type { TestIdProps } from './types';

/**
 * Com `notification_center_v2` ligada, o sino é o da central nova (estado no
 * `NotificationProvider`). Desligada, volta o sininho anterior — é o rollback
 * da liberação, sem perder avisos nem leituras.
 */
export default function NavbarNotifications() {
  const { flags } = useFeatureFlags();
  if (flags[FEATURE.NOTIFICATION_CENTER_V2])
    return <NotificationBell data-testid="nav-bar-notification-center-bell" />;
  return <LegacyNavbarNotifications data-testid="nav-bar-legacy-notifications" />;
}

function LegacyNavbarNotifications(_props: TestIdProps) {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { flags } = useFeatureFlags();
  const profileAlerts = useProfileAlerts();
  const [linkClubOpen, setLinkClubOpen] = useState(false);
  if (!isAuthenticated || !user) return null;
  const needsClubLink =
    flags[FEATURE.CLUB_LINK_REQUEST] &&
    user.role === UserRole.TEACHER &&
    !user.teacherProfile?.club;
  const alerts = needsClubLink
    ? [
        {
          id: 'link-club',
          message: 'De qual clubinho você faz parte?',
          action: () => setLinkClubOpen(true),
        },
        ...profileAlerts,
      ]
    : profileAlerts;
  return (
    <Box data-testid="nav-bar-notifications" sx={{ display: 'flex', alignItems: 'center' }}>
      <CompleteProfileAlert
        key={user.id}
        alerts={alerts}
        userId={user.id}
        photoNotificationsEnabled={Boolean(user.active && flags[FEATURE.CLUBINHO_FEED])}
      />
      {flags[FEATURE.CLUB_LINK_REQUEST] && (
        <LinkClubModal open={linkClubOpen} onClose={() => setLinkClubOpen(false)} />
      )}
    </Box>
  );
}
