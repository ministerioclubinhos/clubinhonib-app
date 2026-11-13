import { lazyNamedWithRetry, lazyWithRetry } from '@/utils/lazyWithRetry';

/*
 * Telas carregadas sob demanda. A home, o login, a navbar e as páginas de erro
 * continuam no bundle inicial; o resto (painel admin, estatísticas, área do
 * professor, perfil, páginas dinâmicas) só é baixado por quem abre a tela.
 * Um professor no celular deixa de baixar gráficos, calendários e o admin.
 */

// Páginas públicas e da sessão
export const About = lazyWithRetry(() => import('@/pages/About/About'));
export const Contact = lazyWithRetry(() => import('@/pages/Contact/Contact'));
export const EventosPage = lazyWithRetry(() => import('@/pages/Event/EventosPage'));
export const ForgotPassword = lazyWithRetry(() => import('@/pages/ForgotPassword/ForgotPassword'));
export const ResetPassword = lazyWithRetry(() => import('@/pages/ResetPassword/ResetPassword'));
export const Register = lazyWithRetry(() => import('@/pages/Register/Register'));
export const EmailVerificationInstructions = lazyWithRetry(
  () => import('@/pages/EmailVerification/EmailVerificationInstructions')
);
export const UnsubscribePage = lazyWithRetry(
  () => import('@/features/email-preferences/UnsubscribePage')
);
export const SpecialFamilyDayPage = lazyWithRetry(
  () => import('@/pages/SpecialFamiliyDay/SpecialFamilyDayPage')
);
export const ClubinhoFeedView = lazyWithRetry(
  () => import('@/pages/PageView/ClubinhoFeedView/ClubinhoFeedView')
);
export const PageRenderer = lazyWithRetry(() => import('@/components/PageRenderer/PageRenderer'));
export const NotificationsPage = lazyWithRetry(
  () => import('@/pages/Notifications/NotificationsPage')
);
export const ProfilePage = lazyNamedWithRetry(
  () => import('@/features/profile'),
  (module) => module.ProfilePage
);

// Área do professor
export const TeacherArea = lazyWithRetry(() => import('@/pages/TeacherArea/TeacherArea'));
export const ImageSectionPage = lazyWithRetry(
  () => import('@/pages/TeacherArea/ImageSection/ImageSectionPage')
);
export const IdeasSectionPage = lazyWithRetry(
  () => import('@/pages/TeacherArea/IdeasSection/IdeasSectionPage')
);
export const WeekMaterialsList = lazyNamedWithRetry(
  () => import('@/pages/TeacherArea/components'),
  (module) => module.WeekMaterialsList
);
export const SiteFeedbackForm = lazyNamedWithRetry(
  () => import('@/pages/TeacherArea/components'),
  (module) => module.SiteFeedbackForm
);
export const ChildrenBrowserPage = lazyWithRetry(
  () => import('@/features/pagela-teacher/ChildrenBrowserPage')
);
export const ChildPagelasPage = lazyWithRetry(
  () => import('@/features/pagela-teacher/ChildPagelasPage')
);

// Painel admin
export const AdminLayout = lazyWithRetry(() => import('@/components/Adm/AdminLayout/AdminLayout'));
export const AdminDashboardPage = lazyWithRetry(() => import('@/components/Adm/AdminDashboardPage'));
export const SelecPageTemplate = lazyWithRetry(
  () => import('@/components/Adm/PageCreator/SelectPageTemplate/SelecPageTemplate')
);
export const MeditationsManager = lazyWithRetry(
  () => import('@/features/meditations/MeditationsManager')
);
export const CommentModerationPage = lazyWithRetry(
  () => import('@/features/comments/CommentModerationPage')
);
export const DocumentsManager = lazyWithRetry(() => import('@/features/documents/DocumentsManager'));
export const InformativesManager = lazyWithRetry(
  () => import('@/features/informatives/InformativesManager')
);
export const FeedbackManager = lazyWithRetry(() => import('@/features/feedback/FeedbackManager'));
export const ContactsManager = lazyWithRetry(() => import('@/features/contacts/ContactsManager'));
export const WeekMaterialsManager = lazyNamedWithRetry(
  () => import('@/features/week-materials'),
  (module) => module.WeekMaterialsManager
);
export const WeekMaterialPageForm = lazyNamedWithRetry(
  () => import('@/features/week-materials'),
  (module) => module.WeekMaterialPageForm
);
export const ImagePagesManager = lazyWithRetry(
  () => import('@/features/image-pages/ImagePagesManager')
);
export const ImagePageForm = lazyNamedWithRetry(
  () => import('@/features/image-pages'),
  (module) => module.ImagePageForm
);
export const ImageSectionManager = lazyWithRetry(
  () => import('@/features/image-sections/ImageSectionManager')
);
export const ImageSectionEditorAdmin = lazyWithRetry(
  () => import('@/features/image-sections/ImageSectionEditorAdmin')
);
export const IdeasSectionManager = lazyWithRetry(
  () => import('@/features/ideas-sections/IdeasSectionManager')
);
export const IdeasSectionReviewPage = lazyWithRetry(
  () => import('@/features/ideas-sections/IdeasSectionReviewPage')
);
export const VideoPagesManager = lazyWithRetry(
  () => import('@/features/video-pages/VideoPagesManager')
);
export const VideoPageForm = lazyNamedWithRetry(
  () => import('@/features/video-pages'),
  (module) => module.VideoPageForm
);
export const IdeasPagesManager = lazyNamedWithRetry(
  () => import('@/features/ideas-pages'),
  (module) => module.IdeasPagesManager
);
export const IdeasPageForm = lazyNamedWithRetry(
  () => import('@/features/ideas-pages'),
  (module) => module.IdeasPageForm
);
export const MeditationPageForm = lazyNamedWithRetry(
  () => import('@/features/meditations'),
  (module) => module.MeditationPageForm
);
export const UsersManager = lazyWithRetry(() => import('@/features/users/UsersManager'));
export const ProfilesManager = lazyNamedWithRetry(
  () => import('@/features/profile'),
  (module) => module.ProfilesManager
);
export const CoordinatorProfilesManager = lazyWithRetry(
  () => import('@/features/coordinators/CoordinatorProfilesManager')
);
export const TeacherProfilesManager = lazyWithRetry(
  () => import('@/features/teachers/TeacherProfilesManager')
);
export const ChildrenManager = lazyWithRetry(() => import('@/features/children/ChildrenManager'));
export const ClubsManager = lazyWithRetry(() => import('@/features/clubs/ClubsManager'));
export const PagelaClubsManager = lazyWithRetry(
  () => import('@/features/pagela-clubs/PagelaClubsManager')
);
export const ClubWeeklySummaryPage = lazyWithRetry(
  () => import('@/features/club-weekly-summary/ClubWeeklySummaryPage')
);
export const StatisticsPage = lazyWithRetry(() => import('@/features/statistics/StatisticsPage'));
export const ClubControlPage = lazyWithRetry(
  () => import('@/features/club-control/ClubControlPage')
);
export const FeatureFlagsManager = lazyWithRetry(
  () => import('@/features/feature-flags/FeatureFlagsManager')
);
export const ObservabilityAuditPage = lazyNamedWithRetry(
  () => import('@/features/observability-audit'),
  (module) => module.ObservabilityAuditPage
);
