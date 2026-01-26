import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Box,
  Paper,
  Typography,
  Avatar,
  CircularProgress,
  Alert,
  useTheme,
  useMediaQuery,
  Chip,
  Stack,
  Grid,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Container,
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  Person as PersonIcon,
  Lock as LockIcon,
  PhotoCamera as PhotoCameraIcon,
  HomeOutlined as HomeOutlinedIcon,
  GroupsOutlined as GroupsOutlinedIcon,
  PlaceOutlined as PlaceOutlinedIcon,
  Badge as BadgeIcon,
  Favorite as FavoriteIcon,
} from '@mui/icons-material';
import { RootState, AppDispatch } from '@/store/slices';
import { useDispatch } from 'react-redux';
import { fetchCurrentUser } from '@/store/slices/auth/authSlice';
import { weekdayLabel } from '@/utils/dateUtils';
import ProfileEditForm from '@/features/profile/components/ProfileEditForm';
import PasswordChangeForm from '@/features/profile/components/PasswordChangeForm';
import ProfileImageUpload from '@/features/profile/components/ProfileImageUpload';
import PersonalDataForm from '@/features/profile/components/PersonalDataForm';
import PreferencesForm from '@/features/profile/components/PreferencesForm';
import { extractErrorMessage } from '@/utils/apiError';

const menuItems = [
  { icon: <PersonIcon />, label: 'Informações da Conta', shortLabel: 'Conta' },
  { icon: <BadgeIcon />, label: 'Dados Pessoais', shortLabel: 'Pessoais' },
  { icon: <FavoriteIcon />, label: 'Minhas Preferências', shortLabel: 'Preferências' },
  { icon: <LockIcon />, label: 'Alterar Senha', shortLabel: 'Senha' },
  { icon: <PhotoCameraIcon />, label: 'Foto de Perfil', shortLabel: 'Foto' },
];

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, initialized, user, loadingUser } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initialTab = React.useMemo(() => {
    if (typeof window !== 'undefined') {
      if (window.location.hash === '#foto') return 4;
      if (window.location.hash === '#pessoais') return 1;
      if (window.location.hash === '#preferencias') return 2;
    }
    return 0;
  }, []);
  const [selectedMenu, setSelectedMenu] = useState(initialTab);

  useEffect(() => {
    const onHashChange = () => {
      if (window.location.hash === '#foto') setSelectedMenu(4);
      else if (window.location.hash === '#pessoais') setSelectedMenu(1);
      else if (window.location.hash === '#preferencias') setSelectedMenu(2);
      else setSelectedMenu(0);
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [selectedMenu]);

  useEffect(() => {
    if (initialized && !isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, initialized, navigate]);

  useEffect(() => {
    if (isAuthenticated && !user) {

      dispatch(fetchCurrentUser());
    }
  }, [isAuthenticated, user, dispatch]);

  const profile = user ? {
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone || '',
    cpf: user.cpf,
    role: user.role,
    active: user.active ?? false,
    completed: user.completed ?? false,
    commonUser: user.commonUser ?? false,
    createdAt: user.createdAt || '',
    updatedAt: user.updatedAt || '',
    image: user.image ? {
      id: user.image.id ?? '',
      url: user.image.url,
      title: user.image.title ?? '',
      description: user.image.description ?? '',
      mediaType: user.image.mediaType as string,
      uploadType: user.image.uploadType as string,
      isLocalFile: user.image.isLocalFile ?? false,
      platformType: user.image.platformType ?? null,
      originalName: user.image.originalName ?? '',
      size: user.image.size ?? 0,
      createdAt: user.image.createdAt ?? '',
      updatedAt: user.image.updatedAt ?? '',
    } : null,
  } : null;

  const completeProfile = user ? {
    personalData: user.personalData ? {
      birthDate: user.personalData.birthDate ?? undefined,
      gender: user.personalData.gender ?? undefined,
      gaLeaderName: user.personalData.gaLeaderName ?? undefined,
      gaLeaderContact: user.personalData.gaLeaderContact ?? undefined,
    } : undefined,
    preferences: user.preferences ? {
      loveLanguages: user.preferences.loveLanguages ?? undefined,
      temperaments: user.preferences.temperaments ?? undefined,
      favoriteColor: user.preferences.favoriteColor ?? undefined,
      favoriteFood: user.preferences.favoriteFood ?? undefined,
      favoriteMusic: user.preferences.favoriteMusic ?? undefined,
      whatMakesYouSmile: user.preferences.whatMakesYouSmile ?? undefined,
      skillsAndTalents: user.preferences.skillsAndTalents ?? undefined,
    } : undefined,
  } : null;

  const handleProfileUpdate = async () => {
    try {
      setError(null);
      await dispatch(fetchCurrentUser());
    } catch (err: unknown) {
      setError(extractErrorMessage(err, 'Erro ao atualizar perfil.'));
    }
  };

  const handleMenuClick = (index: number) => {
    setSelectedMenu(index);
  };

  const renderContent = () => {
    switch (selectedMenu) {
      case 0:
        return (
          <ProfileEditForm
            profile={profile}
            onUpdate={handleProfileUpdate}
            onError={setError}
          />
        );
      case 1:
        return (
          <PersonalDataForm
            personalData={completeProfile?.personalData}
            onUpdate={handleProfileUpdate}
            onError={setError}
          />
        );
      case 2:
        return (
          <PreferencesForm
            preferences={completeProfile?.preferences}
            onUpdate={handleProfileUpdate}
            onError={setError}
          />
        );
      case 3:
        return (
          <PasswordChangeForm onError={setError} isCommonUser={profile?.commonUser ?? true} />
        );
      case 4:
        return (
          <ProfileImageUpload
            currentImageUrl={profile?.image?.url}
            onUpdate={handleProfileUpdate}
            onError={setError}
          />
        );
      default:
        return null;
    }
  };

  const isLoading = loadingUser || loading;

  if (!initialized || isLoading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #f5f7fa 0%, #e8f5e9 50%, #ffffff 100%)',
        }}
      >
        <CircularProgress size={48} />
      </Box>
    );
  }

  if (error && !profile) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #e8f5e9 50%, #ffffff 100%)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: { xs: 1.5, md: 2 },
          p: { xs: 1.5, sm: 2, md: 3 },
          maxWidth: 1400,
          mx: 'auto',
          width: '100%',
        }}
      >
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          style={{ display: 'flex', flexDirection: 'column' }}
        >
          <Paper
            elevation={3}
            sx={{
              width: { xs: '100%', md: 240, lg: 260 },
              borderRadius: 3,
              overflow: 'hidden',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 249, 255, 0.98) 100%)',
              border: '1px solid rgba(25, 118, 210, 0.1)',
              flexShrink: 0,
            }}
          >
            <Box
              sx={{
                background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                p: { xs: 1.5, sm: 2 },
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <Avatar
                src={profile?.image?.url}
                sx={{
                  width: { xs: 60, sm: 70, md: 80 },
                  height: { xs: 60, sm: 70, md: 80 },
                  fontSize: { xs: '1.5rem', md: '2rem' },
                  bgcolor: 'rgba(255,255,255,0.2)',
                  border: '3px solid rgba(255,255,255,0.8)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                }}
              >
                {profile?.name?.charAt(0).toUpperCase() || 'U'}
              </Avatar>
              <Box sx={{ textAlign: 'center' }}>
                <Typography
                  variant="subtitle1"
                  fontWeight={700}
                  sx={{
                    color: 'white',
                    fontSize: { xs: '0.9rem', sm: '0.95rem' },
                    textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                    lineHeight: 1.3,
                  }}
                >
                  {profile?.name || 'Carregando...'}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: 'rgba(255,255,255,0.85)',
                    fontSize: '0.7rem',
                    display: 'block',
                    wordBreak: 'break-all',
                  }}
                >
                  {profile?.email}
                </Typography>
              </Box>
            </Box>

            {/* Se for Professor e tiver clubinho vinculado */}
            {user?.teacherProfile?.club && (
              <Box sx={{ px: 2, py: 1.5, bgcolor: 'rgba(25, 118, 210, 0.03)' }}>
                <Typography variant="overline" sx={{ display: 'block', mb: 1, color: 'text.secondary', fontWeight: 700, lineHeight: 1, fontSize: '0.65rem', letterSpacing: 0.5 }}>
                  MEU CLUBINHO
                </Typography>
                <Paper
                  elevation={0}
                  sx={{
                    p: 1.5,
                    bgcolor: 'white',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                  }}
                >
                  <Stack spacing={1}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Box sx={{
                        p: 0.5,
                        borderRadius: 1,
                        bgcolor: 'primary.main',
                        color: 'white',
                        display: 'flex'
                      }}>
                        <HomeOutlinedIcon sx={{ fontSize: 16 }} />
                      </Box>
                      <Typography variant="subtitle2" fontWeight={700} color="text.primary">
                        Clubinho {user.teacherProfile.club.number}
                      </Typography>
                    </Stack>
                    <Box sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      bgcolor: 'action.hover',
                      py: 0.5,
                      px: 1,
                      borderRadius: 1
                    }}>
                      <GroupsOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="caption" fontWeight={600} color="text.secondary">
                        {weekdayLabel(user.teacherProfile.club.weekday)} às {user.teacherProfile.club.time || '00:00'}
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              </Box>
            )}

            {/* Se for Coordenador e tiver clubinhos vinculados */}
            {user?.coordinatorProfile?.clubs && user.coordinatorProfile.clubs.length > 0 && (
              <Box sx={{ px: 2, py: 1.5, bgcolor: 'rgba(25, 118, 210, 0.03)' }}>
                <Typography variant="overline" sx={{ display: 'block', mb: 1, color: 'text.secondary', fontWeight: 700, lineHeight: 1, fontSize: '0.65rem', letterSpacing: 0.5 }}>
                  COORDENAÇÃO
                </Typography>
                <Stack spacing={1.5}>
                  {user.coordinatorProfile.clubs.map((club) => (
                    <Paper
                      key={club.id}
                      elevation={0}
                      sx={{
                        p: 1.5,
                        bgcolor: 'white',
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 2,
                      }}
                    >
                      <Stack spacing={1}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Box sx={{
                            p: 0.5,
                            borderRadius: 1,
                            bgcolor: 'primary.main',
                            color: 'white',
                            display: 'flex'
                          }}>
                            <HomeOutlinedIcon sx={{ fontSize: 16 }} />
                          </Box>
                          <Typography variant="subtitle2" fontWeight={700} color="text.primary">
                            Clubinho {club.number}
                          </Typography>
                        </Stack>
                        <Box sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                          bgcolor: 'action.hover',
                          py: 0.5,
                          px: 1,
                          borderRadius: 1
                        }}>
                          <GroupsOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="caption" fontWeight={600} color="text.secondary">
                            {weekdayLabel(club.weekday)} às {club.time || '00:00'}
                          </Typography>
                        </Box>
                      </Stack>
                    </Paper>
                  ))}
                </Stack>
              </Box>
            )}

            <Divider />

            <List sx={{ p: 0.5 }} dense>
              {menuItems.map((item, index) => (
                <ListItemButton
                  key={index}
                  selected={selectedMenu === index}
                  onClick={() => handleMenuClick(index)}
                  sx={{
                    borderRadius: 1.5,
                    mb: 0.25,
                    py: 0.75,
                    '&.Mui-selected': {
                      bgcolor: 'primary.main',
                      color: 'white',
                      '&:hover': {
                        bgcolor: 'primary.dark',
                      },
                      '& .MuiListItemIcon-root': {
                        color: 'white',
                      },
                    },
                    '&:hover': {
                      bgcolor: 'rgba(25, 118, 210, 0.08)',
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 32,
                      color: selectedMenu === index ? 'white' : 'primary.main',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={isSmall ? item.shortLabel : item.label}
                    primaryTypographyProps={{
                      fontWeight: selectedMenu === index ? 700 : 500,
                      fontSize: '0.8rem',
                    }}
                  />
                </ListItemButton>
              ))}
            </List>
          </Paper>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
        >
          <Paper
            elevation={3}
            sx={{
              borderRadius: 3,
              p: { xs: 2, sm: 2.5 },
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 249, 255, 0.98) 100%)',
              border: '1px solid rgba(25, 118, 210, 0.1)',
            }}
          >
            <Box sx={{ mb: 2, pb: 1.5, borderBottom: '2px solid rgba(25, 118, 210, 0.1)' }}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 1.5,
                    bgcolor: 'primary.main',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {menuItems[selectedMenu].icon}
                </Box>
                <Typography variant="h6" fontWeight={700} color="primary.main">
                  {menuItems[selectedMenu].label}
                </Typography>
              </Stack>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            <Box>
              {renderContent()}
            </Box>
          </Paper>
        </motion.div>
      </Box>
    </Box>
  );
};

export default ProfilePage;
