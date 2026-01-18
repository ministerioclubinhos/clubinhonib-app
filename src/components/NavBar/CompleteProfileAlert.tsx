import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    IconButton,
    Tooltip,
    Badge,
    Menu,
    MenuItem,
    ListItemText,
    Typography,
    Box,
} from '@mui/material';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import { ProfileAlert } from '@/features/profile/hooks/useProfileAlerts';

export interface CompleteProfileAlertProps {
    alerts: ProfileAlert[];
    onAlertClick?: () => void;
}

const CompleteProfileAlert: React.FC<CompleteProfileAlertProps> = ({
    alerts,
    onAlertClick
}) => {
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleAlertClick = (to?: string) => {
        handleClose();
        if (onAlertClick) onAlertClick();
        if (to) navigate(to);
    };

    if (!alerts || alerts.length === 0) return null;

    return (
        <>
            <Tooltip title="Notificações" arrow>
                <IconButton
                    onClick={handleClick}
                    sx={{ ml: 1, p: 0.5, color: '#fff' }}
                >
                    <Badge color="error" overlap="circular" badgeContent={alerts.length}>
                        <NotificationsActiveIcon sx={{ fontSize: 26 }} />
                    </Badge>
                </IconButton>
            </Tooltip>
            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                PaperProps={{
                    elevation: 4,
                    sx: {
                        mt: 1.5,
                        minWidth: 320,
                        maxWidth: 380,
                        maxHeight: '75vh',
                        borderRadius: 2,
                        overflow: 'hidden',
                    },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                <Box
                    sx={{
                        px: 2,
                        py: 1.5,
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        bgcolor: 'grey.50',
                    }}
                >
                    <Typography
                        variant="subtitle2"
                        sx={{
                            fontWeight: 'bold',
                            fontSize: '0.875rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            color: 'text.secondary',
                        }}
                    >
                        Notificações
                    </Typography>
                </Box>

                <Box
                    sx={{
                        maxHeight: 'calc(75vh - 60px)',
                        overflowY: 'auto',
                    }}
                >
                    {alerts.map((alert) => (
                        <MenuItem
                            key={alert.id}
                            onClick={() => handleAlertClick(alert.to)}
                            sx={{
                                px: 2,
                                py: 1.5,
                                whiteSpace: 'normal',
                                borderLeft: '4px solid transparent',
                                '&:hover': {
                                    bgcolor: 'action.hover',
                                    borderLeftColor: 'primary.main',
                                },
                            }}
                        >
                            <ListItemText
                                sx={{ m: 0 }}
                                primary={
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            fontWeight: 500,
                                            color: 'text.primary',
                                        }}
                                    >
                                        {alert.message}
                                    </Typography>
                                }
                            />
                        </MenuItem>
                    ))}
                </Box>
            </Menu>
        </>
    );
};

export default CompleteProfileAlert;
