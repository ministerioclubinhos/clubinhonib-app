// src/routes/ProtectedRoute.tsx
import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState as RootStateType } from "@/store/slices";
import { Box, CircularProgress, Typography } from "@mui/material";
import { RoleUser } from "@/store/slices/auth/authSlice";

interface ProtectedRouteProps {
  /** Uma role ou várias roles permitidas */
  requiredRole?: RoleUser | RoleUser[];
  /** Para onde redirecionar quando negar acesso (default: "/") */
  redirectTo?: string;
  /** Se true, ADMIN passa mesmo que não esteja em requiredRole (default: true) */
  adminBypass?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  requiredRole,
  redirectTo = "/",
  adminBypass = true,
}) => {
  const location = useLocation();
  const { isAuthenticated, user, loadingUser } = useSelector(
    (state: RootStateType) => state.auth
  );

  if (loadingUser) {
    return (
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
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
    const userRole = user?.role as RoleUser | undefined;

    // ADMIN pode tudo (se habilitado)
    if (adminBypass && userRole === RoleUser.ADMIN) {
      return <Outlet />;
    }

    if (!userRole || !rolesArray.includes(userRole)) {
      return <Navigate to={redirectTo} state={{ error: "Acesso negado" }} replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
