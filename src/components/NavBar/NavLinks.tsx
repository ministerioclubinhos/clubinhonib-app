// src/components/NavLinks.tsx
import React, { Fragment } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Button, Stack } from '@mui/material';
import { RootState } from '@/store/slices';
import { logout, RoleUser } from '@/store/slices/auth/authSlice';
import api from '@/config/axiosConfig';

interface Props {
  closeMenu?: () => void;
  isMobile?: boolean;
}

const NavLinks: React.FC<Props> = ({ closeMenu, isMobile }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const isAdmin = isAuthenticated && user?.role === RoleUser.ADMIN;
  const isTeacher = isAuthenticated && user?.role === RoleUser.TEACHER;
  const isCoordinator = isAuthenticated && user?.role === RoleUser.COORDINATOR;

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
    return (
      <Button
        key={to}
        onClick={() => {
          navigate(to);
          handleClick();
        }}
        variant={active ? 'contained' : 'text'}
        color={active ? 'success' : 'inherit'}
        fullWidth={!!isMobile}
        sx={{
          justifyContent: isMobile ? 'flex-start' : 'center',
          fontWeight: 'bold',
          ...(isMobile ? { color: '#fff' } : {}),
          ...(active && !isMobile ? { boxShadow: 'none' } : null),
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
      spacing={isMobile ? 1.5 : 4}
      alignItems={isMobile ? 'stretch' : 'center'}
      mt={isMobile ? 6 : 0}
      sx={{ width: '100%', maxWidth: '100%', overflowX: 'hidden' }}
    >
      {renderLink('/', 'Início')}
      {renderLink('/feed-clubinho', 'Feed Clubinho')}
      {renderLink('/sobre', 'Sobre')}
      {renderLink('/eventos', 'Eventos')}
      {renderLink('/contato', 'Contato')}
      {isAuthenticated ? (
        <Fragment>
          {renderLink('/area-do-professor', 'Área do Professor')}
          {(isTeacher) && renderLink('/area-das-criancas', 'Área das crianças')}
          {(isAdmin || isCoordinator) && renderLink('/adm', 'Administração')}
          <Button
            onClick={handleLogout}
            variant="contained"
            color="error"
            fullWidth={!!isMobile}
            sx={{ fontWeight: 'bold', minHeight: 44, textTransform: 'none', maxWidth: '100%' }}
          >
            Sair
          </Button>
        </Fragment>
      ) : (
        renderLink('/login', 'Área do Professor')
      )}
    </Stack>
  );
};

export default NavLinks;
