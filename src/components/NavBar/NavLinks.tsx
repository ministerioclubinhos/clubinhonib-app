import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Button, Stack } from '@mui/material';
import { RootState } from '@/store/slices';
import { logout } from '@/store/slices/auth/authSlice';
import api from '@/config/axiosConfig';

interface Props {
  closeMenu?: () => void;
  isMobile?: boolean;
}

const NavLinks: React.FC<Props> = ({ closeMenu, isMobile }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const isAdmin = isAuthenticated && user?.role === 'admin';

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

  const renderLink = (to: string, label: string) => (
    <Button
      key={to}
      onClick={() => {
        navigate(to);
        handleClick();
      }}
      sx={{
        color: isMobile ? '#fff' : 'inherit',
        fontWeight: 'bold',
        justifyContent: isMobile ? 'flex-start' : 'center',
      }}
    >
      {label}
    </Button>
  );

  return (
    <Stack
      direction={isMobile ? 'column' : 'row'}
      spacing={isMobile ? 2 : 4}
      alignItems={isMobile ? 'flex-start' : 'center'}
      sx={{ width: '100%' }}
    >
      {renderLink('/', 'Início')}
      {renderLink('/feed-clubinho', 'Feed Clubinho')}
      {renderLink('/sobre', 'Sobre')}
      {renderLink('/eventos', 'Eventos')}
      {renderLink('/contato', 'Contato')}

      {isAdmin && renderLink('/adm', 'Administração')}

      {isAuthenticated ? (
        <>
          {renderLink('/area-do-professor', 'Área do Professor')}
          <Button
            onClick={handleLogout}
            variant="contained"
            color="error"
            sx={{ fontWeight: 'bold' }}
          >
            Sair
          </Button>
        </>
      ) : (
        renderLink('/login', 'Área do Professor')
      )}
    </Stack>
  );
};

export default NavLinks;
