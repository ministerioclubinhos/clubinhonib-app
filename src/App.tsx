import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useQueryClient } from '@tanstack/react-query';
import { Box, CircularProgress, Toolbar, Button, Typography } from '@mui/material';

import './App.css';
import './styles/Global.css';

import Navbar from './components/NavBar/Navbar';
import Footer from './components/Footer/Footer';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import PageRenderer from './components/PageRenderer/PageRenderer';

import Home from './pages/Home/Home';
import About from './pages/About/About';
import Contact from './pages/Contact/Contact';
import EventosPage from './pages/Event/EventosPage';
import Login from './pages/Login/Login';
import TeacherArea from './pages/TeacherArea/TeacherArea';
import ClubinhoFeedView from './pages/PageView/ClubinhoFeedView/ClubinhoFeedView';
import ForgotPassword from './pages/ForgotPassword/ForgotPassword';
import ResetPassword from './pages/ResetPassword/ResetPassword';

import SelecPageTemplate from './components/Adm/PageCreator/SelectPageTemplate/SelecPageTemplate';

import AdminDashboardPage from './components/Adm/AdminDashboardPage';
import AdminLayout from './components/Adm/AdminLayout/AdminLayout';

import { fetchRoutes } from './store/slices/route/routeSlice';
import { initAuth, logout } from './store/slices/auth/authSlice';
import { UserRole } from "@/types/shared";

import type { RouteData as DynamicRouteType } from './store/slices/route/routeSlice';
import type { RootState as RootStateType, AppDispatch as AppDispatchType } from './store/slices';

import { WeekMaterialsList } from './pages/TeacherArea/components';
import ImageSectionPage from './pages/TeacherArea/ImageSection/ImageSectionPage';
import ImageSectionEditorAdmin from './features/image-sections/ImageSectionEditorAdmin';

import { SiteFeedbackForm } from './pages/TeacherArea/components';

import { SnackbarProvider } from 'notistack';
import AppErrorBoundary from './components/AppErrorBoundary';
import GlobalErrorHandler from './components/GlobalErrorHandler';
import NotFoundPage from './pages/Error/NotFoundPage';
import AccessDeniedPage from './pages/Error/AccessDeniedPage';

import CoordinatorProfilesManager from './features/coordinators/CoordinatorProfilesManager';
import TeacherProfilesManager from './features/teachers/TeacherProfilesManager';
import ClubsManager from './features/clubs/ClubsManager';
import ContactsManager from './features/contacts/ContactsManager';
import MeditationsManager from './features/meditations/MeditationsManager';
import ChildrenManager from './features/children/ChildrenManager';
import ChildrenBrowserPage from './features/pagela-teacher/ChildrenBrowserPage';
import ChildPagelasPage from './features/pagela-teacher/ChildPagelasPage';
import Register from './pages/Register/Register';
import PagelaClubsManager from './features/pagela-clubs/PagelaClubsManager';
import CommentsManager from './features/comments/CommentsManager';
import FeedbackManager from './features/feedback/FeedbackManager';
import UsersManager from './features/users/UsersManager';
import UnsubscribePage from './features/email-preferences/UnsubscribePage';
import InformativesManager from './features/informatives/InformativesManager';
import ImageSectionManager from './features/image-sections/ImageSectionManager';
import ImagePagesManager from './features/image-pages/ImagePagesManager';
import IdeasSectionManager from './features/ideas-sections/IdeasSectionManager';
import IdeasSectionPage from './pages/TeacherArea/IdeasSection/IdeasSectionPage';
import IdeasSectionReviewPage from './features/ideas-sections/IdeasSectionReviewPage';
import DocumentsManager from './features/documents/DocumentsManager';
import { IdeasPagesManager, IdeasPageForm } from './features/ideas-pages';
import VideoPagesManager from './features/video-pages/VideoPagesManager';
import {
  WeekMaterialsManager,
  WeekMaterialPageForm,
} from './features/week-materials';
import { MeditationPageForm } from './features/meditations';
import { ImagePageForm } from './features/image-pages';
import { VideoPageForm } from './features/video-pages';
import StatisticsPage from './features/statistics/StatisticsPage';
import ClubControlPage from './features/club-control/ClubControlPage';
import ClubWeeklySummaryPage from './features/club-weekly-summary/ClubWeeklySummaryPage';
import {
  FEATURE,
  FeatureFlagsManager,
  FeatureRoute,
  useVisibleRoutes,
} from './features/feature-flags';
import { ProfilesManager, ProfilePage } from './features/profile';
import { ObservabilityAuditPage } from './features/observability-audit';
import EmailVerificationInstructions from './pages/EmailVerification/EmailVerificationInstructions';
import SpecialFamilyDayPage from './pages/SpecialFamiliyDay/SpecialFamilyDayPage';

const AiProvidersConfigPage = lazy(() =>
  import('./features/ai-providers/AiProvidersConfigPage').then((module) => ({
    default: module.AiProvidersConfigPage,
  }))
);
const AiLessonsListPage = lazy(() =>
  import('./pages/admin/ai-lessons/AiLessonsListPage').then((module) => ({
    default: module.AiLessonsListPage,
  }))
);
const LessonDraftDetailPage = lazy(() =>
  import('./pages/admin/ai-lessons/LessonDraftDetailPage').then((module) => ({
    default: module.LessonDraftDetailPage,
  }))
);
const AiLessonsHubPage = lazy(() =>
  import('./pages/admin/ai-lessons/AiLessonsHubPage').then((module) => ({
    default: module.AiLessonsHubPage,
  }))
);
const AdminPromptSettingsPage = lazy(() =>
  import('./pages/admin/ai-lessons/AdminPromptSettingsPage').then((module) => ({
    default: module.AdminPromptSettingsPage,
  }))
);
const AiLessonsReviewListPage = lazy(() =>
  import('./pages/admin/ai-lessons/AiLessonsReviewListPage').then((module) => ({
    default: module.AiLessonsReviewListPage,
  }))
);
const LessonReviewDetailPage = lazy(() =>
  import('./pages/admin/ai-lessons/LessonReviewDetailPage').then((module) => ({
    default: module.LessonReviewDetailPage,
  }))
);

function App() {
  const dispatch = useDispatch<AppDispatchType>();
  const queryClient = useQueryClient();
  // Uma página cujo recurso está desligado não chega a virar rota.
  const dynamicRoutes = useVisibleRoutes();
  const { initialized, loadingUser, user } = useSelector((state: RootStateType) => state.auth);
  const [forceReady, setForceReady] = useState(false);
  const previousUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const currentUserId = user?.id ?? null;
    if (previousUserIdRef.current !== undefined && previousUserIdRef.current !== currentUserId) {
      void queryClient.cancelQueries({ queryKey: ['ai-lessons'] });
      void queryClient.cancelQueries({ queryKey: ['ai-providers'] });
      queryClient.removeQueries({ queryKey: ['ai-lessons'] });
      queryClient.removeQueries({ queryKey: ['ai-providers'] });
    }
    previousUserIdRef.current = currentUserId;
  }, [queryClient, user?.id]);

  useEffect(() => {
    dispatch(fetchRoutes());
    dispatch(initAuth());

    const fallbackTimeout = setTimeout(() => {
      setForceReady(true);
    }, 15000);

    return () => clearTimeout(fallbackTimeout);
  }, [dispatch]);

  const handleLogout = () => {
    void queryClient.cancelQueries({ queryKey: ['ai-lessons'] });
    void queryClient.cancelQueries({ queryKey: ['ai-providers'] });
    queryClient.removeQueries({ queryKey: ['ai-lessons'] });
    queryClient.removeQueries({ queryKey: ['ai-providers'] });
    dispatch(logout());
    setForceReady(true);
    window.location.href = '/login';
  };



  if (!forceReady && (!initialized || loadingUser)) {
    return (
      <Box data-testid="app"
        sx={{
          height: '100vh',
          width: '100vw',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #E8F5E9 0%, #FFFFFF 100%)',
          backgroundAttachment: 'fixed',
          gap: 3,
          px: 2,
        }}
      >
        <CircularProgress size={48} />
        <Typography variant="body1" color="text.secondary">
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

  return (
    <AppErrorBoundary data-testid="app">
      <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <GlobalErrorHandler />
        <BrowserRouter>
          <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar />

            <Box component="main" sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Toolbar />
              <Box className="mainContainer" sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Suspense
                  fallback={
                    <Box sx={{ display: 'grid', placeItems: 'center', py: 12 }}>
                      <CircularProgress size={44} thickness={4} />
                    </Box>
                  }
                >
                  <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/sobre" element={<About />} />
                  <Route element={<FeatureRoute flag={FEATURE.CONTACT_FORM} />}>
                    <Route path="/contato" element={<Contact />} />
                  </Route>
                  <Route element={<FeatureRoute flag={FEATURE.EVENTS_SECTION} />}>
                    <Route path="/eventos" element={<EventosPage />} />
                  </Route>
                  <Route element={<FeatureRoute flag={FEATURE.CLUBINHO_FEED} />}>
                    <Route path="/feed-clubinho" element={<ClubinhoFeedView feed />} />
                  </Route>
                  <Route path="/login" element={<Login />} />
                  {/*
                    Sem recuperação de senha, quem esqueceu precisa falar com a
                    administração; por isso as três rotas caem juntas.
                  */}
                  <Route element={<FeatureRoute flag={FEATURE.PASSWORD_RECOVERY} redirectTo="/login" />}>
                    <Route path="/esqueci-senha" element={<ForgotPassword />} />
                    <Route path="/redefinir-senha" element={<ResetPassword />} />
                    <Route path="/recuperar-senha/:token" element={<ResetPassword />} />
                  </Route>
                  <Route path="/verificar-email" element={<EmailVerificationInstructions />} />
                  {/* Chegada do link no rodapé dos e-mails; sem sessão, porque
                      quem clica num e-mail antigo não está logado. */}
                  <Route path="/descadastrar" element={<UnsubscribePage />} />
                  <Route element={<FeatureRoute flag={FEATURE.PUBLIC_REGISTRATION} redirectTo="/login" />}>
                    <Route path="/cadastrar" element={<Register commonUser />} />
                    {/*
                      O cadastro por Google exige as duas: a porta de entrada e
                      o provedor.
                    */}
                    <Route element={<FeatureRoute flag={FEATURE.GOOGLE_LOGIN} redirectTo="/cadastrar" />}>
                      <Route path="/cadastrar-google" element={<Register commonUser={false} />} />
                    </Route>
                  </Route>
                  <Route element={<FeatureRoute flag={FEATURE.SPECIAL_FAMILY_DAY} />}>
                    <Route path="/dia-especial-familia" element={<SpecialFamilyDayPage />} />
                  </Route>

                  <Route path="/acesso-negado" element={<AccessDeniedPage />} />
                  <Route path="*" element={<NotFoundPage />} />

                  <Route element={<ProtectedRoute />}>
                    <Route path="/area-do-professor" element={<TeacherArea />} />
                    <Route path="/meu-perfil" element={<ProfilePage />} />

                    {/*
                      Cada recurso abaixo tem uma flag própria: com ela
                      desligada a rota deixa de existir, e o atalho que leva
                      até ela também some da tela.
                    */}
                    <Route element={<FeatureRoute flag={FEATURE.CLUB_PHOTO_UPLOAD} redirectTo="/area-do-professor" />}>
                      <Route path="/imagens-clubinho" element={<ImageSectionPage />} />
                    </Route>
                    <Route element={<FeatureRoute flag={FEATURE.WEEKLY_MATERIALS} redirectTo="/area-do-professor" />}>
                      <Route path="/lista-materias-semanais" element={<WeekMaterialsList />} />
                    </Route>
                    <Route element={<FeatureRoute flag={FEATURE.SITE_FEEDBACK} redirectTo="/area-do-professor" />}>
                      <Route path="/avaliar-site" element={<SiteFeedbackForm />} />
                    </Route>
                    <Route element={<FeatureRoute flag={FEATURE.IDEA_SUBMISSION} redirectTo="/area-do-professor" />}>
                      <Route path="/compartilhar-ideia" element={<IdeasSectionPage />} />
                    </Route>
                  </Route>

                  {/*
                    Quem entra na Área das Crianças é decidido pelos perfis
                    alvo da própria flag: o mapa já responde `false` para um
                    perfil que ela não alcança. A rota só exige a sessão.
                  */}
                  <Route element={<ProtectedRoute />}>
                    <Route element={<FeatureRoute flag={FEATURE.CHILDREN_AREA} />}>
                      <Route path="/area-das-criancas" element={<ChildrenBrowserPage />} />
                      <Route path="/area-das-criancas/:childId" element={<ChildPagelasPage />} />
                    </Route>
                  </Route>

                  <Route element={<ProtectedRoute requiredRole={[UserRole.ADMIN, UserRole.COORDINATOR]} />}>
                    <Route path="/adm" element={<AdminLayout />}>
                      <Route index element={<AdminDashboardPage />} />
                      <Route path="meditacoes" element={<MeditationsManager />} />
                      <Route element={<FeatureRoute flag={FEATURE.COMMENT_MODERATION} redirectTo="/adm" />}>
                        <Route path="comentarios" element={<CommentsManager />} />
                      </Route>
                      <Route path="documentos" element={<DocumentsManager />} />
                      <Route path="informativos" element={<InformativesManager />} />
                      <Route path="feedbacks" element={<FeedbackManager />} />
                      <Route path="contatos" element={<ContactsManager />} />
                      <Route path="paginas-materiais-semanais" element={<WeekMaterialsManager />} />
                      <Route path="paginas-fotos" element={<ImagePagesManager />} />
                      <Route element={<FeatureRoute flag={FEATURE.PHOTO_MODERATION} redirectTo="/adm" />}>
                        <Route path="fotos-clubinhos" element={<ImageSectionManager />} />
                      </Route>
                      <Route element={<FeatureRoute flag={FEATURE.IDEA_MODERATION} redirectTo="/adm" />}>
                        <Route path="ideias-compartilhadas" element={<IdeasSectionManager />} />
                      </Route>
                      <Route path="paginas-videos" element={<VideoPagesManager />} />
                      <Route path="paginas-ideias" element={<IdeasPagesManager />} />
                      <Route path="criar-pagina" element={<SelecPageTemplate />} />
                      <Route path="usuarios" element={<UsersManager />} />
                      <Route path="perfis" element={<ProfilesManager />} />
                      <Route path="coordenadores" element={<CoordinatorProfilesManager />} />
                      <Route path="professores" element={<TeacherProfilesManager />} />
                      <Route path="criancas" element={<ChildrenManager />} />
                      <Route path="clubinhos" element={<ClubsManager />} />
                      <Route element={<FeatureRoute flag={FEATURE.PAGELAS} redirectTo="/adm" />}>
                        <Route path="pagelas" element={<PagelaClubsManager />} />
                      </Route>
                      {/*
                        O resumo semanal é do coordenador tanto quanto do
                        administrador: é a tela que o e-mail de segunda-feira
                        abre. Por isso fica fora do bloco exclusivo do
                        administrador, logo abaixo — quem enxerga o quê é
                        decidido pelos perfis alvo da flag e pelo recorte que a
                        API aplica.
                      */}
                      <Route element={<FeatureRoute flag={FEATURE.CLUB_WEEKLY_SUMMARY} redirectTo="/adm" />}>
                        <Route path="resumo-semanal" element={<ClubWeeklySummaryPage />} />
                      </Route>
                      <Route element={<ProtectedRoute requiredRole={[UserRole.ADMIN]} />}>
                        <Route element={<FeatureRoute flag={FEATURE.STATISTICS} redirectTo="/adm" />}>
                          <Route path="estatisticas" element={<StatisticsPage />} />
                        </Route>
                        <Route element={<FeatureRoute flag={FEATURE.CLUB_CONTROL} redirectTo="/adm" />}>
                          <Route path="controle-clubinhos" element={<ClubControlPage />} />
                        </Route>
                        {/*
                          O painel de flags não passa por FeatureRoute: ele é a
                          própria chave de casa, e desligar uma flag não pode
                          trancar quem precisa religá-la.
                        */}
                        <Route path="feature-flags" element={<FeatureFlagsManager />} />
                        {/*
                          Consulta somente leitura dos registros técnicos e de
                          auditoria. Como as flags, não entra no menu nem no
                          painel: o atalho é o link discreto do rodapé, e a
                          API exige o papel de administrador de qualquer jeito.
                        */}
                        <Route path="observabilidade-auditoria" element={<ObservabilityAuditPage />} />
                        {/*
                          Painel escondido de configuração de Provedores e Modelos de IA (OpenAI / Gemini).
                          Assim como Feature Flags e Observabilidade, é acessado pelo atalho no rodapé.
                        */}
                        <Route path="config-provedores-ia" element={<AiProvidersConfigPage />} />
                        <Route path="provedores-ia" element={<Navigate to="/adm/config-provedores-ia" replace />} />
                        <Route path="estudio/config" element={<Navigate to="/adm/config-provedores-ia" replace />} />
                        <Route path="estudio" element={<AiLessonsHubPage />} />
                        <Route path="estudio/licoes" element={<AiLessonsListPage />} />
                        <Route path="estudio/licoes/:id" element={<LessonDraftDetailPage />} />
                        <Route path="estudio/revisao" element={<AiLessonsReviewListPage />} />
                        <Route path="estudio/revisao/:id" element={<LessonReviewDetailPage />} />
                        <Route path="estudio/orientacoes" element={<AdminPromptSettingsPage />} />
                        <Route path="ia" element={<Navigate to="/adm/estudio" replace />} />
                        <Route path="ia/licoes" element={<Navigate to="/adm/estudio/licoes" replace />} />
                        <Route path="ia/prompts" element={<Navigate to="/adm/estudio/orientacoes" replace />} />
                        <Route path="licoes-ia" element={<Navigate to="/adm/estudio/licoes" replace />} />
                        <Route path="licoes-ia/:id" element={<Navigate to="/adm/estudio/licoes" replace />} />
                      </Route>

                      <Route path="editar-meditacao/:id" element={<MeditationPageForm fromTemplatePage={false} />} />
                      <Route path="editar-pagina-imagens/:id" element={<ImagePageForm fromTemplatePage={false} />} />
                      <Route path="editar-pagina-videos/:id" element={<VideoPageForm fromTemplatePage={false} />} />
                      <Route path="editar-pagina-semana/:id" element={<WeekMaterialPageForm fromTemplatePage={false} />} />
                      <Route path="editar-pagina-ideias/:id" element={<IdeasPageForm fromTemplatePage={false} />} />
                      {/* Com o id na rota, recarregar a página não perde a revisão. */}
                      {/* A revisão acompanha a fila que a originou. */}
                      <Route element={<FeatureRoute flag={FEATURE.PHOTO_MODERATION} redirectTo="/adm" />}>
                        <Route path="editar-imagens-clubinho/:id" element={<ImageSectionEditorAdmin />} />
                        <Route path="editar-imagens-clubinho" element={<ImageSectionEditorAdmin />} />
                      </Route>
                      <Route element={<FeatureRoute flag={FEATURE.IDEA_MODERATION} redirectTo="/adm" />}>
                        <Route path="editar-ideias-compartilhadas/:id" element={<IdeasSectionReviewPage />} />
                      </Route>
                    </Route>
                  </Route>

                  {dynamicRoutes.map((route: DynamicRouteType) => (
                    <Route
                      key={route.id}
                      path={`/${route.path}`}
                      element={<PageRenderer entityType={route.entityType} idToFetch={route.idToFetch} />}
                    />
                  ))}
                  </Routes>
                </Suspense>
              </Box>
            </Box>
            <Footer />
          </Box>
        </BrowserRouter>
      </SnackbarProvider>
    </AppErrorBoundary>
  );
}

export default App;
