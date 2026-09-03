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
  Stack,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Container,
  Button,
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  Person as PersonIcon,
  Lock as LockIcon,
  PhotoCamera as PhotoCameraIcon,
  HomeOutlined as HomeOutlinedIcon,
  GroupsOutlined as GroupsOutlinedIcon,
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
import { PROFILE_TABS, profileTabIndexFromHash } from './constants';
import LinkClubModal from '@/features/auth/components/LinkClubModal';
import { FEATURE } from '@/features/feature-flags';
import { useFeatureFlags } from '@/hooks';
import SchoolIcon from '@mui/icons-material/School';

/** Ícone de cada aba, na ordem de `PROFILE_TABS`. */
const TAB_ICONS = [
  <PersonIcon key="account" />,
  <BadgeIcon key="personal" />,
  <FavoriteIcon key="preferences" />,
  <LockIcon key="password" />,
  <PhotoCameraIcon key="photo" />,
];

const menuItems = PROFILE_TABS.map((tab, index) => ({
  ...tab,
  icon: TAB_ICONS[index],
}));

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, initialized, user, loadingUser } = useSelector((state: RootState) => state.auth);
  const [error, setError] = useState<string | null>(null);
  const [linkClubOpen, setLinkClubOpen] = useState(false);
  const { flags } = useFeatureFlags();

  const initialTab = React.useMemo(
    () =>
      typeof window === 'undefined'
        ? 0
        : profileTabIndexFromHash(window.location.hash),
    [],
  );
  const [selectedMenu, setSelectedMenu] = useState(initialTab);

  useEffect(() => {
    const onHashChange = () =>
      setSelectedMenu(profileTabIndexFromHash(window.location.hash));
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

  // `user` já é o contrato de `/auth/me`: as telas o recebem direto, sem
  // remontagem. A versão anterior copiava campo a campo e, no caminho,
  // inventava valores para o que `/auth/me` não mandava.
  const profile = user;
  const personalData = user?.personalData;
  const preferences = user?.preferences;

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
            personalData={personalData}
            onUpdate={handleProfileUpdate}
            onError={setError}
          />
        );
      case 2:
        return (
          <PreferencesForm
            preferences={preferences}
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

  const isLoading = loadingUser;

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

            {/* Professor sem clubinho vinculado, enquanto o pedido existir */}
            {flags[FEATURE.CLUB_LINK_REQUEST] &&
              user?.role === 'teacher' &&
              !user?.teacherProfile?.club && (
              <Box sx={{ px: 2, py: 1.5, bgcolor: 'rgba(129, 215, 66, 0.05)' }}>
                <Typography variant="overline" sx={{ display: 'block', mb: 1, color: 'text.secondary', fontWeight: 700, lineHeight: 1, fontSize: '0.65rem', letterSpacing: 0.5 }}>
                  MEU CLUBINHO
                </Typography>
                <Paper
                  elevation={0}
                  sx={{
                    p: 1.5,
                    bgcolor: 'white',
                    border: '1px dashed',
                    borderColor: '#81d742',
                    borderRadius: 2,
                    textAlign: 'center',
                  }}
                >
                  <SchoolIcon sx={{ color: '#81d742', mb: 0.5, fontSize: 28 }} />
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                    De qual clubinho você faz parte?
                  </Typography>
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => setLinkClubOpen(true)}
                    sx={{
                      bgcolor: '#81d742',
                      color: 'white',
                      fontWeight: 700,
                      fontSize: '0.7rem',
                      '&:hover': { bgcolor: '#6bb83a' },
                    }}
                  >
                    Informar meu clubinho
                  </Button>
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
      <LinkClubModal
        open={linkClubOpen && flags[FEATURE.CLUB_LINK_REQUEST]}
        onClose={() => {
          setLinkClubOpen(false);
          dispatch(fetchCurrentUser());
        }}
      />
    </Box>
  );
};

export default ProfilePage;
