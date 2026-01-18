import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
    Tabs,
    Tab,
    Box,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { CompleteProfileListItem } from '../types';
import PersonalDataForm from './PersonalDataForm';
import PreferencesForm from './PreferencesForm';

interface ProfileAdminEditDialogProps {
    open: boolean;
    onClose: () => void;
    profile: CompleteProfileListItem | null;
    onUpdate: () => void;
}

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`profile-tabpanel-${index}`}
            aria-labelledby={`profile-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
        </div>
    );
}

const ProfileAdminEditDialog: React.FC<ProfileAdminEditDialogProps> = ({
    open,
    onClose,
    profile,
    onUpdate,
}) => {
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
    const [tabValue, setTabValue] = useState(0);
    const [error, setError] = useState<string | null>(null);

    if (!profile) return null;

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
        setError(null);
    };

    const handleError = (msg: string) => {
        setError(msg);
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullScreen={fullScreen}
            maxWidth="md"
            fullWidth
        >
            <DialogTitle sx={{ m: 0, p: 2 }}>
                Editar Perfil: {profile.name}
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: (theme) => theme.palette.grey[500],
                    }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent dividers sx={{ p: 0 }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth">
                        <Tab icon={<PersonIcon />} label="Dados Pessoais" iconPosition="start" />
                        <Tab icon={<FavoriteIcon />} label="Preferências" iconPosition="start" />
                    </Tabs>
                </Box>

                <TabPanel value={tabValue} index={0}>
                    <PersonalDataForm
                        userId={profile.id}
                        personalData={profile.personalData}
                        onUpdate={onUpdate}
                        onError={handleError}
                    />
                </TabPanel>
                <TabPanel value={tabValue} index={1}>
                    <PreferencesForm
                        userId={profile.id}
                        preferences={profile.preferences}
                        onUpdate={onUpdate}
                        onError={handleError}
                    />
                </TabPanel>
            </DialogContent>
        </Dialog>
    );
};

export default ProfileAdminEditDialog;
