import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Box, CircularProgress } from '@mui/material';

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

import MeditationListPage from './components/Adm/PageMeditadion/MeditationListPage';
import MeditationPageCreator from './components/Adm/PageCreator/Templates/MeditationPageCreator/MeditationPageCreator';
import ImagePageCreator from './components/Adm/PageCreator/Templates/ImagePageCreator/ImagePageCreator';
import VideoPageCreator from './components/Adm/PageCreator/Templates/VideoPageCreator/VideoPageCreator';
import WeekMaterialPageCreator from './components/Adm/PageCreator/Templates/WeekMaterialPageCreator/WeekMaterialPageCreator';
import SelecPageTemplate from './components/Adm/PageCreator/SelectPageTemplate/SelecPageTemplate';

import AdminDashboardPage from './components/Adm/AdminDashboardPage';
import AdminLayout from './components/Adm/AdminLayout/AdminLayout';

import { fetchRoutes, RouteData as DynamicRouteType } from './store/slices/route/routeSlice';
import { fetchCurrentUser } from './store/slices/auth/authSlice';
import { RootState as RootStateType, AppDispatch as AppDispatchType } from './store/slices';

import './styles/Global.css';
import WeekMaterialListPage from 'components/Adm/PageWeekMaterial/WeekMaterialListPage';
import ImagePageListPage from 'components/Adm/PageImage/ImagePageListPage';
import VideoPageListPage from 'components/Adm/PageVideos/VideoPageListPage';
import CommentsListPage from 'components/Adm/PageComments/CommentsListPage';
import DocumentList from 'components/Adm/PageDocuments/DocumentList';
import IdeasPageListPage from 'components/Adm/PageIdeasMaterial/IdeasPageListPage';
import { IdeasMaterialPageCreator } from 'components/Adm/PageCreator/Templates/IdeasMaterialPageCreator/IdeasMaterialPageCreator';
import WeekMaterialsList from 'pages/TeacherArea/WeekMaterialsList';
import InformativeBannerListPage from 'components/Adm/PageInformative/InformativeBannerListPage';
import ContactList from 'components/Adm/PageContact/ContactList';
import ImageSectionPage from './pages/TeacherArea/ImageSection/ImageSectionPage';
import ImageSectionListPage from './components/Adm/PageImageSection/ImageSectionListPage';
import SiteFeedbackForm from './pages/TeacherArea/SiteFeedbackForm';
import FeedbackList from './components/Adm/PageSiteFeedBack/FeedbackList';

const App: React.FC = () => {
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
          <Route path="/" element={<Home />} />
          <Route path="/sobre" element={<About />} />
          <Route path="/contato" element={<Contact />} />
          <Route path="/eventos" element={<Event />} />
          <Route path="/feed-clubinho" element={<PageGalleryView feed={true} />} />
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Home />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/area-do-professor" element={<TeacherArea />} />
            <Route path="/imagens-clubinho" element={<ImageSectionPage isEditMode={false} />} />
            <Route path="/lista-materias-semanais" element={<WeekMaterialsList />} />
            <Route path="/avaliar-site" element={<SiteFeedbackForm />} />
          </Route>

          <Route element={<ProtectedRoute requiredRole="admin" />}>
            <Route path="/adm" element={<AdminLayout />}>
              <Route index element={<AdminDashboardPage />} />
              <Route path="meditacoes" element={<MeditationListPage />} />
              <Route path="comentarios" element={<CommentsListPage />} />
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
              <Route
                path="editar-meditacao"
                element={<MeditationPageCreator fromTemplatePage={false} />}
              />
              <Route
                path="editar-pagina-imagens"
                element={<ImagePageCreator fromTemplatePage={false} />}
              />
              <Route
                path="editar-pagina-videos"
                element={<VideoPageCreator fromTemplatePage={false} />}
              />
              <Route
                path="editar-pagina-semana"
                element={<WeekMaterialPageCreator fromTemplatePage={false} />}
              />
              <Route
                path="editar-pagina-ideias"
                element={<IdeasMaterialPageCreator fromTemplatePage={false} />}
              />
              <Route path="editar-imagens-clubinho" element={<ImageSectionPage isEditMode={true} />} />
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
      </div>
      <Footer />
    </BrowserRouter>
  );
};

export default App;
