import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Box, CircularProgress, Toolbar } from '@mui/material';

import './App.css';
import './styles/Global.css';

import Navbar from './components/NavBar/Navbar';
import Footer from './components/Footer/Footer';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import PageRenderer from './components/PageRenderer/PageRenderer';

import Home from './pages/Home/Home';
import About from './pages/About/About';
import Contact from './pages/Contact/Contact';
import Event from './pages/Event/Event';
import Login from './pages/Login/Login';
import TeacherArea from './pages/TeacherArea/TeacherArea';
import PageGalleryView from './pages/PageView/ImagePageView/ImagePageView';

import MeditationPageCreator from './components/Adm/PageCreator/Templates/MeditationPageCreator/MeditationPageCreator';
import ImagePageCreator from './components/Adm/PageCreator/Templates/ImagePageCreator/ImagePageCreator';
import VideoPageCreator from './components/Adm/PageCreator/Templates/VideoPageCreator/VideoPageCreator';
import WeekMaterialPageCreator from './components/Adm/PageCreator/Templates/WeekMaterialPageCreator/WeekMaterialPageCreator';
import SelecPageTemplate from './components/Adm/PageCreator/SelectPageTemplate/SelecPageTemplate';

import AdminDashboardPage from './components/Adm/AdminDashboardPage';
import AdminLayout from './components/Adm/AdminLayout/AdminLayout';

import { fetchRoutes } from './store/slices/route/routeSlice';
import { RoleUser, initAuth } from './store/slices/auth/authSlice';

import type { RouteData as DynamicRouteType } from './store/slices/route/routeSlice';
import type { RootState as RootStateType, AppDispatch as AppDispatchType } from './store/slices';

import { IdeasMaterialPageCreator } from 'components/Adm/PageCreator/Templates/IdeasMaterialPageCreator/IdeasMaterialPageCreator';
import WeekMaterialsList from 'pages/TeacherArea/WeekMaterialsList';
import ImageSectionPage from './pages/TeacherArea/ImageSection/ImageSectionPage';
import SiteFeedbackForm from './pages/TeacherArea/SiteFeedbackForm';

import CoordinatorProfilesManager from './features/coordinators/CoordinatorProfilesManager';
import TeacherProfilesManager from './features/teachers/TeacherProfilesManager';
import ClubsManager from './features/clubs/ClubsManager';
import ContactsManager from './features/contacts/ContactsManager';
import MeditationManager from './features/meditations/MeditationManager';
import ChildrenManager from './features/children/ChildrenManager';
import ChildrenBrowserPage from './features/pagela-teacher/ChildrenBrowserPage';
import ChildPagelasPage from './features/pagela-teacher/ChildPagelasPage';
import Register from './pages/Register/Register';
import PagelaClubsManager from './features/pagela-clubs/PagelaClubsManager';
import CommentsManager from './features/comments/CommentsManager';
import FeedbackManager from './features/feedback/FeedbackManager';
import UsersManager from './features/users/UsersManager';
import InformativeBannerLManager from './features/informatives/InformativeBannerLManager';
import ImageSectionManager from './features/image-sections/ImageSectionManager';
import ImagePageManager from './features/image-pages/ImagePageManager';
import DocumentsManager from './features/documents/DocumentsManager';
import IdeasManager from './features/ideas-pages/IdeasManager';
import VideosManager from './features/video-pages/VideosManager';
import WeekMaterialManager from './features/week-materials/WeekMaterialManager';

function App() {
  const dispatch = useDispatch<AppDispatchType>();
  const dynamicRoutes = useSelector((state: RootStateType) => state.routes.routes);
  const { initialized, loadingUser } = useSelector((state: RootStateType) => state.auth);

  useEffect(() => {
    dispatch(fetchRoutes());
    dispatch(initAuth());
  }, [dispatch]);

  if (!initialized || loadingUser) {
    return (
      <Box
        sx={{
          height: '100vh',
          width: '100vw',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          bgcolor: '#f0f0f0',
        }}
      >
        <CircularProgress size={48} />
      </Box>
    );
  }

  return (
    <BrowserRouter>
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />

        <Box component="main" sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Toolbar />
          <Box className="mainContainer" sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/sobre" element={<About />} />
              <Route path="/contato" element={<Contact />} />
              <Route path="/eventos" element={<Event />} />
              <Route path="/feed-clubinho" element={<PageGalleryView feed />} />
              <Route path="/login" element={<Login />} />
              <Route path="/cadastrar-google" element={<Register commonUser={false} />} />
              <Route path="/cadastrar" element={<Register commonUser />} />
              <Route path="*" element={<Home />} />

              <Route element={<ProtectedRoute />}>
                <Route path="/area-do-professor" element={<TeacherArea />} />
                <Route path="/imagens-clubinho" element={<ImageSectionPage isEditMode={false} />} />
                <Route path="/lista-materias-semanais" element={<WeekMaterialsList />} />
                <Route path="/avaliar-site" element={<SiteFeedbackForm />} />
                <Route path="/area-das-criancas" element={<ChildrenBrowserPage />} />
                <Route path="/area-das-criancas/:childId" element={<ChildPagelasPage />} />
              </Route>

              <Route element={<ProtectedRoute requiredRole={[RoleUser.ADMIN, RoleUser.COORDINATOR]} />}>
                <Route path="/adm" element={<AdminLayout />}>
                  <Route index element={<AdminDashboardPage />} />
                  <Route path="meditacoes" element={<MeditationManager />} />
                  <Route path="comentarios" element={<CommentsManager />} />
                  <Route path="documentos" element={<DocumentsManager />} />
                  <Route path="informativos" element={<InformativeBannerLManager />} />
                  <Route path="feedbacks" element={<FeedbackManager />} />
                  <Route path="contatos" element={<ContactsManager />} />
                  <Route path="paginas-materiais-semanais" element={<WeekMaterialManager />} />
                  <Route path="paginas-fotos" element={<ImagePageManager />} />
                  <Route path="fotos-clubinhos" element={<ImageSectionManager />} />
                  <Route path="paginas-videos" element={<VideosManager />} />
                  <Route path="paginas-ideias" element={<IdeasManager />} />
                  <Route path="criar-pagina" element={<SelecPageTemplate />} />
                  <Route path="usuarios" element={<UsersManager />} />
                  <Route path="coordenadores" element={<CoordinatorProfilesManager />} />
                  <Route path="professores" element={<TeacherProfilesManager />} />
                  <Route path="criancas" element={<ChildrenManager />} />
                  <Route path="clubinhos" element={<ClubsManager />} />
                  <Route path="pagelas" element={<PagelaClubsManager />} />

                  <Route path="editar-meditacao" element={<MeditationPageCreator fromTemplatePage={false} />} />
                  <Route path="editar-pagina-imagens" element={<ImagePageCreator fromTemplatePage={false} />} />
                  <Route path="editar-pagina-videos" element={<VideoPageCreator fromTemplatePage={false} />} />
                  <Route path="editar-pagina-semana" element={<WeekMaterialPageCreator fromTemplatePage={false} />} />
                  <Route path="editar-pagina-ideias" element={<IdeasMaterialPageCreator fromTemplatePage={false} />} />
                  <Route path="editar-imagens-clubinho" element={<ImageSectionPage isEditMode />} />
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
          </Box>
        </Box>
        <Footer />
      </Box>
    </BrowserRouter>
  );
}

export default App;
