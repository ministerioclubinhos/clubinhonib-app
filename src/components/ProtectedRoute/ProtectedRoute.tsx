import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { RootState as RootStateType } from "@/store/slices";
import { logout } from "@/store/slices/auth/authSlice";
import { Box, CircularProgress, Typography, Button } from "@mui/material";
import { UserRole } from "@/types/shared";

interface ProtectedRouteProps {
  requiredRole?: UserRole | UserRole[];
  redirectTo?: string;
  adminBypass?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  requiredRole,
  redirectTo = "/",
  adminBypass = true,
}) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const { isAuthenticated, user, loadingUser, initialized, accessToken } = useSelector(
    (state: RootStateType) => state.auth
  );

  const handleLogout = () => {
    dispatch(logout());
    window.location.href = '/login';
  };

  if (!initialized || loadingUser || (accessToken && !user)) {
    return (
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: 3,
          px: 2,
        }}
      >
        <CircularProgress aria-label="Carregando autenticação" />
        <Typography variant="body2" color="text.secondary">
          Verificando autenticação...
        </Typography>
        <Button
          variant="outlined"
          color="error"
          onClick={handleLogout}
          sx={{
            mt: 2,
            borderWidth: 2,
            '&:hover': {
              borderWidth: 2,
              bgcolor: 'rgba(211, 47, 47, 0.04)',
            }
          }}
        >
          Sair
        </Button>
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole) {
    const rolesArray = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    const userRole = user?.role as UserRole | undefined;

    if (adminBypass && userRole === UserRole.ADMIN) {
      return <Outlet />;
    }

    if (!userRole || !rolesArray.includes(userRole)) {
      return <Navigate to={redirectTo} state={{ error: "Acesso negado" }} replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
