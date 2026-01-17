import React, { useState } from 'react';
import {
    Avatar,
    Box,
    IconButton,
    Menu,
    MenuItem,
    Typography,
    Divider,
    ListItemIcon,
    Tooltip,
    Button,
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout, User } from '@/store/slices/auth/authSlice';
import { UserRole } from "@/types/shared";
import api from '@/config/axiosConfig';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PersonIcon from '@mui/icons-material/Person';
import SchoolIcon from '@mui/icons-material/School';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LogoutIcon from '@mui/icons-material/Logout';
import ChildCareIcon from '@mui/icons-material/ChildCare'; // Icon for Children's Area

interface UserMenuProps {
    user: User;
    onCloseMobile?: () => void;
    isMobile?: boolean;
}

const UserMenu: React.FC<UserMenuProps> = ({ user, onCloseMobile, isMobile }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleNavigate = (path: string) => {
        handleClose();
        onCloseMobile?.();
        navigate(path);
    };

    const handleLogout = async () => {
        handleClose();
        try {
            await api.post('/auth/logout');
        } catch (error) {
            console.warn('[Logout] Erro ao fazer logout:', error);
        } finally {
            dispatch(logout());
            navigate('/');
            onCloseMobile?.();
        }
    };

    const isAdmin = user?.role === UserRole.ADMIN;
    const isCoordinator = user?.role === UserRole.COORDINATOR;
    const isTeacher = user?.role === UserRole.TEACHER;

    // Get initials for avatar if no image
    const getInitials = (name: string) => {
        const names = name.split(' ');
        if (names.length === 1) return names[0].charAt(0).toUpperCase();
        return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
    };

    const location = useLocation();

    const isActive = (path: string) => {
        return location.pathname === path || location.pathname.startsWith(path + '/');
    };

    if (isMobile) {
        return (
            <Box sx={{ width: '100%', pt: 2, pl: 2, borderTop: '1px solid rgba(255,255,255,0.2)', mt: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, px: 0 }}>
                    <Avatar
                        sx={{ width: 40, height: 40, bgcolor: 'secondary.main', mr: 2 }}
                        src={user.image?.url}
                        alt={user.name}
                    >
                        {!user.image?.url && getInitials(user.name)}
                    </Avatar>
                    <Typography variant="subtitle1" sx={{ color: '#fff', fontWeight: 'bold' }}>
                        {user.name}
                    </Typography>
                </Box>

                <Button
                    onClick={() => handleNavigate('/meu-perfil')}
                    fullWidth
                    variant={isActive('/meu-perfil') ? "contained" : "text"}
                    color={isActive('/meu-perfil') ? "success" : "inherit"}
                    sx={{
                        justifyContent: 'flex-start',
                        color: isActive('/meu-perfil') ? undefined : '#fff',
                        textTransform: 'none',
                        fontWeight: 'bold',
                        mb: 1,
                        px: isActive('/meu-perfil') ? 2 : 0,
                        backgroundColor: isActive('/meu-perfil') ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                        '&:hover': {
                            backgroundColor: isActive('/meu-perfil') ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)',
                        }
                    }}
                    startIcon={<PersonIcon />}
                >
                    Meu Perfil
                </Button>

                <Button
                    onClick={() => handleNavigate('/area-do-professor')}
                    fullWidth
                    variant={isActive('/area-do-professor') ? "contained" : "text"}
                    color={isActive('/area-do-professor') ? "success" : "inherit"}
                    sx={{
                        justifyContent: 'flex-start',
                        color: isActive('/area-do-professor') ? undefined : '#fff',
                        textTransform: 'none',
                        fontWeight: 'bold',
                        mb: 1,
                        px: isActive('/area-do-professor') ? 2 : 0,
                        backgroundColor: isActive('/area-do-professor') ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                        '&:hover': {
                            backgroundColor: isActive('/area-do-professor') ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)',
                        }
                    }}
                    startIcon={<SchoolIcon />}
                >
                    Área do Professor
                </Button>

                {(isTeacher || isAdmin || isCoordinator) && (
                    <Button
                        onClick={() => handleNavigate('/area-das-criancas')}
                        fullWidth
                        variant={isActive('/area-das-criancas') ? "contained" : "text"}
                        color={isActive('/area-das-criancas') ? "success" : "inherit"}
                        sx={{
                            justifyContent: 'flex-start',
                            color: isActive('/area-das-criancas') ? undefined : '#fff',
                            textTransform: 'none',
                            fontWeight: 'bold',
                            mb: 1,
                            px: isActive('/area-das-criancas') ? 2 : 0,
                            backgroundColor: isActive('/area-das-criancas') ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                            '&:hover': {
                                backgroundColor: isActive('/area-das-criancas') ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)',
                            }
                        }}
                        startIcon={<ChildCareIcon />}
                    >
                        Área das Crianças
                    </Button>
                )}

                {(isAdmin || isCoordinator) && (
                    <Button
                        onClick={() => handleNavigate('/adm')}
                        fullWidth
                        variant={isActive('/adm') ? "contained" : "text"}
                        color={isActive('/adm') ? "success" : "inherit"}
                        sx={{
                            justifyContent: 'flex-start',
                            color: isActive('/adm') ? undefined : '#fff',
                            textTransform: 'none',
                            fontWeight: 'bold',
                            mb: 1,
                            px: isActive('/adm') ? 2 : 0,
                            backgroundColor: isActive('/adm') ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                            '&:hover': {
                                backgroundColor: isActive('/adm') ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)',
                            }
                        }}
                        startIcon={<AdminPanelSettingsIcon />}
                    >
                        Administração
                    </Button>
                )}

                <Button
                    onClick={handleLogout}
                    fullWidth
                    color="error"
                    sx={{ justifyContent: 'flex-start', textTransform: 'none', fontWeight: 'bold', mt: 1, px: 0 }}
                    startIcon={<LogoutIcon />}
                >
                    Sair
                </Button>
            </Box>
        );
    }

    return (
        <React.Fragment>
            <Box sx={{ display: 'flex', alignItems: 'center', textAlign: 'center' }}>
                <Tooltip title="Configurações da conta">
                    <IconButton
                        onClick={handleClick}
                        size="small"
                        sx={{ ml: 2 }}
                        aria-controls={open ? 'account-menu' : undefined}
                        aria-haspopup="true"
                        aria-expanded={open ? 'true' : undefined}
                    >
                        <Avatar
                            sx={{ width: 40, height: 40, bgcolor: 'secondary.main' }}
                            src={user.image?.url} // Assuming user.image has a url property based on types.ts
                            alt={user.name}
                        >
                            {!user.image?.url && getInitials(user.name)}
                        </Avatar>
                    </IconButton>
                </Tooltip>
            </Box>
            <Menu
                anchorEl={anchorEl}
                id="account-menu"
                open={open}
                onClose={handleClose}
                onClick={handleClose}
                slotProps={{
                    paper: {
                        elevation: 0,
                        sx: {
                            overflow: 'visible',
                            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                            mt: 1.5,
                            '& .MuiAvatar-root': {
                                width: 32,
                                height: 32,
                                ml: -0.5,
                                mr: 1,
                            },
                            '&::before': {
                                content: '""',
                                display: 'block',
                                position: 'absolute',
                                top: 0,
                                right: 14,
                                width: 10,
                                height: 10,
                                bgcolor: 'background.paper',
                                transform: 'translateY(-50%) rotate(45deg)',
                                zIndex: 0,
                            },
                        },
                    },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                <MenuItem onClick={() => handleNavigate('/meu-perfil')}>
                    <ListItemIcon>
                        <PersonIcon fontSize="small" />
                    </ListItemIcon>
                    Meu Perfil
                </MenuItem>

                <Divider />

                <MenuItem onClick={() => handleNavigate('/area-do-professor')}>
                    <ListItemIcon>
                        <SchoolIcon fontSize="small" />
                    </ListItemIcon>
                    Área do Professor
                </MenuItem>

                {(isTeacher || isAdmin || isCoordinator) && (
                    <MenuItem onClick={() => handleNavigate('/area-das-criancas')}>
                        <ListItemIcon>
                            <ChildCareIcon fontSize="small" />
                        </ListItemIcon>
                        Área das Crianças
                    </MenuItem>
                )}

                {(isAdmin || isCoordinator) && (
                    <MenuItem onClick={() => handleNavigate('/adm')}>
                        <ListItemIcon>
                            <AdminPanelSettingsIcon fontSize="small" />
                        </ListItemIcon>
                        Administração
                    </MenuItem>
                )}

                <Divider />

                <MenuItem onClick={handleLogout}>
                    <ListItemIcon>
                        <LogoutIcon fontSize="small" />
                    </ListItemIcon>
                    Sair
                </MenuItem>
            </Menu>
        </React.Fragment>
    );
};

export default UserMenu;
