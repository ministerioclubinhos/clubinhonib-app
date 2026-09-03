import React, { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Button, Stack } from '@mui/material';
import { RootState } from '@/store/slices';
import UserMenu from './UserMenu';
import CompleteProfileAlert from './CompleteProfileAlert';
import { useProfileAlerts } from '@/features/profile/hooks';
import { FEATURE } from '@/features/feature-flags';
import { useFeatureFlags } from '@/hooks';
import LinkClubModal from '@/features/auth/components/LinkClubModal';

interface Props {
  closeMenu?: () => void;
  isMobile?: boolean;
}

const NavLinks: React.FC<Props> = ({ closeMenu, isMobile }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const { flags } = useFeatureFlags();
  const profileAlerts = useProfileAlerts();
  const [linkClubOpen, setLinkClubOpen] = useState(false);

  // O convite para se vincular só existe enquanto o pedido de vínculo existe.
  const needsClubLink = useMemo(
    () =>
      flags[FEATURE.CLUB_LINK_REQUEST] &&
      user?.role === 'teacher' &&
      (!user?.teacherProfile || !user?.teacherProfile?.club),
    [flags, user],
  );

  const allAlerts = useMemo(() => {
    if (!needsClubLink) return profileAlerts;
    return [
      {
        id: 'link-club',
        message: 'De qual clubinho você faz parte?',
        action: () => setLinkClubOpen(true),
      },
      ...profileAlerts,
    ];
  }, [profileAlerts, needsClubLink]);



  const handleClick = () => closeMenu?.();

  const renderLink = (to: string, label: string) => {
    const active = location.pathname === to || location.pathname.startsWith(to + '/');
    const isLogin = to === '/login';

    return (
      <Button
        key={to}
        onClick={() => {
          navigate(to);
          handleClick();
        }}
        variant={active ? 'contained' : (isLogin ? 'outlined' : 'text')}
        color={active ? 'success' : 'inherit'}
        fullWidth={!!isMobile}
        sx={{
          justifyContent: isMobile ? 'flex-start' : 'center',
          fontWeight: 'bold',
          ...(isMobile ? { color: '#fff' } : {}),
          ...(active && !isMobile ? { boxShadow: 'none' } : null),
          ...(isLogin && !active && !isMobile ? {
            borderColor: 'rgba(255,255,255,0.5)',
            '&:hover': {
              borderColor: '#fff',
              backgroundColor: 'rgba(255,255,255,0.1)'
            }
          } : {}),
          minHeight: 44,
          textTransform: 'none',
          maxWidth: '100%',
        }}
      >
        {label}
      </Button>
    );
  };

  return (
    <Stack
      direction={isMobile ? 'column' : 'row'}
      spacing={isMobile ? 1.5 : 4} // Standard spacing for links
      alignItems={isMobile ? 'stretch' : 'center'}
      mt={isMobile ? 6 : 0}
      sx={{
        width: '100%',
        maxWidth: '100%',
        overflowX: 'hidden',
        position: 'relative' // Needed if we want absolute positioning, but flex is better
      }}
    >
      {/* Navigation Links Group */}
      <Stack
        direction={isMobile ? 'column' : 'row'}
        spacing={isMobile ? 1.5 : 4}
        alignItems={isMobile ? 'stretch' : 'center'}
        sx={{ flexGrow: 1, justifyContent: isMobile ? 'flex-start' : 'center' }}
      >
        {renderLink('/', 'Início')}
        {/*
          O link some junto com a rota: com a flag desligada, clicar aqui só
          levaria a um redirecionamento de volta.
        */}
        {flags[FEATURE.CLUBINHO_FEED] && renderLink('/feed-clubinho', 'Feed Clubinho')}
        {renderLink('/sobre', 'Sobre')}
        {flags[FEATURE.EVENTS_SECTION] && renderLink('/eventos', 'Eventos')}
        {flags[FEATURE.CONTACT_FORM] && renderLink('/contato', 'Contato')}
      </Stack>

      {/* User Actions Group */}
      {isAuthenticated && user ? (
        <Stack
          direction={isMobile ? 'column' : 'row'}
          spacing={1}
          alignItems="center"
          sx={!isMobile ? { ml: 4 } : {}} // Add some margin from links on desktop if needed
        >
          {!isMobile && <CompleteProfileAlert alerts={allAlerts} />}
          <UserMenu user={user} onCloseMobile={handleClick} isMobile={isMobile} />
        </Stack>
      ) : (
        renderLink('/login', 'Entrar')
      )}

      {flags[FEATURE.CLUB_LINK_REQUEST] && (
        <LinkClubModal open={linkClubOpen} onClose={() => setLinkClubOpen(false)} />
      )}
    </Stack>
  );
};


export default NavLinks;
