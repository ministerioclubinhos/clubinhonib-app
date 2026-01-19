import React, { Fragment } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Button, Stack } from '@mui/material';
import { RootState } from '@/store/slices';
import { logout } from '@/store/slices/auth/authSlice';
import { UserRole } from "@/types/shared";
import api from '@/config/axiosConfig';
import UserMenu from './UserMenu';
import CompleteProfileAlert from './CompleteProfileAlert';
import { useProfileAlerts } from '@/features/profile/hooks/useProfileAlerts';

interface Props {
  closeMenu?: () => void;
  isMobile?: boolean;
}

const NavLinks: React.FC<Props> = ({ closeMenu, isMobile }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const profileAlerts = useProfileAlerts();

  const isAdmin = isAuthenticated && user?.role === UserRole.ADMIN;

  const isTeacher = isAuthenticated && user?.role === UserRole.TEACHER;
  const isCoordinator = isAuthenticated && user?.role === UserRole.COORDINATOR;

  const handleClick = () => closeMenu?.();

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.warn('[Logout] Erro ao fazer logout:', error);
    } finally {
      dispatch(logout());
      navigate('/');
      closeMenu?.();
    }
  };

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
        {renderLink('/feed-clubinho', 'Feed Clubinho')}
        {renderLink('/sobre', 'Sobre')}
        {renderLink('/eventos', 'Eventos')}
        {renderLink('/contato', 'Contato')}
      </Stack>

      {/* User Actions Group */}
      {isAuthenticated && user ? (
        <Stack
          direction={isMobile ? 'column' : 'row'}
          spacing={1}
          alignItems="center"
          sx={!isMobile ? { ml: 4 } : {}} // Add some margin from links on desktop if needed
        >
          {!isMobile && <CompleteProfileAlert alerts={profileAlerts} />}
          <UserMenu user={user} onCloseMobile={handleClick} isMobile={isMobile} />
        </Stack>
      ) : (
        renderLink('/login', 'Entrar')
      )}
    </Stack>
  );
};


export default NavLinks;
