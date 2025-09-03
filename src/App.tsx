import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Box, CircularProgress } from '@mui/material';

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
import { fetchCurrentUser, RoleUser } from './store/slices/auth/authSlice';

import type { RouteData as DynamicRouteType } from './store/slices/route/routeSlice';
import type { RootState as RootStateType, AppDispatch as AppDispatchType } from './store/slices';

import { IdeasMaterialPageCreator } from 'components/Adm/PageCreator/Templates/IdeasMaterialPageCreator/IdeasMaterialPageCreator';
import WeekMaterialsList from 'pages/TeacherArea/WeekMaterialsList';
import ImageSectionPage from './pages/TeacherArea/ImageSection/ImageSectionPage';
import SiteFeedbackForm from './pages/TeacherArea/SiteFeedbackForm';

// -- Área ADM (features)
import CoordinatorProfilesManager from './features/coordinators/CoordinatorProfilesManager';
import TeacherProfilesManager from './features/teachers/TeacherProfilesManager';
import ClubsManager from './features/clubs/ClubsManager';
import CommentsPage from './features/comments/CommentsPage';
import DocumentList from './features/documents/DocumentList';
import ContactList from './features/contacts/ContactList';
import ImagePageListPage from './features/image-pages/ImagePageListPage';
import IdeasPageListPage from './features/ideas-pages/IdeasPageListPage';
import MeditationListPage from './features/meditations/MeditationListPage';
import InformativeBannerListPage from './features/informatives/InformativeBannerListPage';
import WeekMaterialListPage from './features/week-materials/WeekMaterialListPage';
import FeedbackList from './features/feedback/FeedbackList';
import ImageSectionListPage from './features/image-sections/pages/ImageSectionListPage';
import VideoPageListPage from './features/video-pages/VideoPageListPage';
import UsersListPage from './features/users/UsersListPage';
import ChildrenManager from './features/children/ChildrenManager';

// -- Área das crianças
import ChildrenBrowserPage from './features/pagela-teacher/ChildrenBrowserPage';
import ChildPagelasPage from './features/pagela-teacher/ChildPagelasPage';

// -- Rotas extras
import Register from './pages/Register/Register';
// import SpecialFamilyDayPage from './pages/SpecialFamiliyDay/SpecialFamilyDayPage'; // Descomentear quando usar

function App() {
  const dispatch = useDispatch<AppDispatchType>();
  const dynamicRoutes = useSelector((state: RootStateType) => state.routes.routes);
  const { loadingUser, accessToken } = useSelector((state: RootStateType) => state.auth);

  useEffect(() => {
    dispatch(fetchRoutes());
    if (accessToken) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, accessToken]);

  if (loadingUser) {
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
      <Navbar />
      <div className="mainContainer">
        <Routes>
          {/* Públicas */}
          <Route path="/" element={<Home />} />
          <Route path="/sobre" element={<About />} />
          <Route path="/contato" element={<Contact />} />
          <Route path="/eventos" element={<Event />} />
          <Route path="/feed-clubinho" element={<PageGalleryView feed />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cadastrar-google" element={<Register commonUser={false} />} />
          <Route path="/cadastrar" element={<Register commonUser />} />
          <Route path="*" element={<Home />} />

          {/* Protegidas: usuário autenticado */}
          <Route element={<ProtectedRoute />}>
            <Route path="/area-do-professor" element={<TeacherArea />} />
            <Route path="/imagens-clubinho" element={<ImageSectionPage isEditMode={false} />} />
            <Route path="/lista-materias-semanais" element={<WeekMaterialsList />} />
            <Route path="/avaliar-site" element={<SiteFeedbackForm />} />
            <Route path="/area-das-criancas" element={<ChildrenBrowserPage />} />
            <Route path="/area-das-criancas/:childId" element={<ChildPagelasPage />} />
            {/* <Route path="/dia-especial-familia" element={<SpecialFamilyDayPage />} /> */}
          </Route>

          {/* Protegidas: Admin/Coord */}
          <Route element={<ProtectedRoute requiredRole={[RoleUser.ADMIN, RoleUser.COORDINATOR]} />}>
            <Route path="/adm" element={<AdminLayout />}>
              <Route index element={<AdminDashboardPage />} />
              <Route path="meditacoes" element={<MeditationListPage />} />
              <Route path="comentarios" element={<CommentsPage />} />
              <Route path="documentos" element={<DocumentList />} />
              <Route path="informativos" element={<InformativeBannerListPage />} />
              <Route path="feedbacks" element={<FeedbackList />} />
              <Route path="contatos" element={<ContactList />} />
              <Route path="paginas-materiais-semanais" element={<WeekMaterialListPage />} />
              <Route path="paginas-fotos" element={<ImagePageListPage />} />
              <Route path="fotos-clubinhos" element={<ImageSectionListPage />} />
              <Route path="paginas-videos" element={<VideoPageListPage />} />
              <Route path="paginas-ideias" element={<IdeasPageListPage />} />
              <Route path="criar-pagina" element={<SelecPageTemplate />} />
              <Route path="usuarios" element={<UsersListPage />} />
              <Route path="coordenadores" element={<CoordinatorProfilesManager />} />
              <Route path="professores" element={<TeacherProfilesManager />} />
              <Route path="criancas" element={<ChildrenManager />} />
              <Route path="clubinhos" element={<ClubsManager />} />

              {/* Editores (template=false = edição) */}
              <Route path="editar-meditacao" element={<MeditationPageCreator fromTemplatePage={false} />} />
              <Route path="editar-pagina-imagens" element={<ImagePageCreator fromTemplatePage={false} />} />
              <Route path="editar-pagina-videos" element={<VideoPageCreator fromTemplatePage={false} />} />
              <Route path="editar-pagina-semana" element={<WeekMaterialPageCreator fromTemplatePage={false} />} />
              <Route path="editar-pagina-ideias" element={<IdeasMaterialPageCreator fromTemplatePage={false} />} />
              <Route path="editar-imagens-clubinho" element={<ImageSectionPage isEditMode />} />
            </Route>
          </Route>

          {/* Rotas dinâmicas vindas do backend */}
          {dynamicRoutes.map((route: DynamicRouteType) => (
            <Route
              key={route.id}
              path={`/${route.path}`}
              element={<PageRenderer entityType={route.entityType} idToFetch={route.idToFetch} />}
            />
          ))}
        </Routes>
      </div>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
