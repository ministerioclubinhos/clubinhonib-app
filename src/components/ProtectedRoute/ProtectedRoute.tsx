import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState as RootStateType } from '@/store/slices';
import { Box, CircularProgress, Typography } from '@mui/material';

interface ProtectedRouteProps {
  requiredRole?: string | string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requiredRole }) => {
  const location = useLocation();
  const { isAuthenticated, user, loadingUser } = useSelector((state: RootStateType) => state.auth);

  if (loadingUser) {
    return (
      <Box
        sx={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <CircularProgress aria-label="Carregando autenticação" />
        <Typography variant="body2" color="text.secondary">
          Verificando autenticação...
        </Typography>
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole) {
    const rolesArray = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    const userRole = user?.role;

    if (!userRole || !rolesArray.includes(userRole)) {
      return <Navigate to="/" state={{ error: 'Acesso negado' }} replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
