import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import FilterAltOffOutlinedIcon from '@mui/icons-material/FilterAltOffOutlined';

import {
  type ActiveLightboxState,
  type ClubinhoFeedViewProps,
  FEED_CONTAINER_WIDTH,
  FEED_CONTENT_MAX_WIDTH,
  FEED_COPY_FEEDBACK_DURATION_MS,
  FEED_MESSAGES,
  FEED_PALETTE,
  FEED_ROUTES,
  FEED_TEST_IDS,
  FEED_TOUCH_TARGET_PX,
  FeedBentoMural,
  FeedControlBar,
  FeedEmptyState,
  FeedErrorState,
  FeedHeroBanner,
  FeedLightboxDialog,
  FeedLoadingSkeleton,
  type FeedPhotoWallItem,
  FeedPhotoWall,
  FeedPostCard,
  type FeedSectionViewModel,
  FeedTimelineRail,
  FeedViewMode,
  filterFeedSections,
  flattenFeedPhotos,
  shareFeedSection,
  ShareResultKind,
  useClubinhoFeed,
  useFeedCelebrations,
} from '@/features/clubinho-feed';
import { FEATURE } from '@/features/feature-flags';
import { useFeatureFlags } from '@/hooks';
import type { RootState } from '@/store/slices';
import { UserRole } from '@/types/shared';
import { apiToggleFeedCelebration } from '@/features/clubinho-feed/api';

export default function ClubinhoFeedView(_props: ClubinhoFeedViewProps) {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const { flags } = useFeatureFlags();

  const {
    feedPageId,
    isMissingConfig,
    pageMeta,
    sections,
    totalSections,
    isInitialLoading,
    isRefreshing,
    isFetchingNextPage,
    hasNextPage,
    initialErrorMessage,
    nextPageErrorMessage,
    loadNextPage,
    refreshFeed,
  } = useClubinhoFeed();

  const { isCelebrated, toggleCelebration, markStoryViewed } = useFeedCelebrations();
  const handleCelebrate = useCallback(async (sectionId: string) => {
    if (!isAuthenticated || !feedPageId) return;
    try {
      await apiToggleFeedCelebration(feedPageId, sectionId);
      toggleCelebration(sectionId);
      // Refresh obtains the server-authoritative names and total.
      await refreshFeed();
    } catch { /* Keep current state if the request fails. */ }
  }, [feedPageId, isAuthenticated, refreshFeed, toggleCelebration]);

  const [viewMode, setViewMode] = useState<FeedViewMode>(FeedViewMode.TIMELINE);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeLightbox, setActiveLightbox] = useState<ActiveLightboxState | null>(null);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [copiedSectionId, setCopiedSectionId] = useState<string | null>(null);

  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const paginationObserverRef = useRef<IntersectionObserver | null>(null);
  const initialHashHandledRef = useRef(false);

  const canUploadPhotos = Boolean(isAuthenticated && flags[FEATURE.CLUB_PHOTO_UPLOAD]);
  const canManageFeed = Boolean(
    isAuthenticated && user?.role === UserRole.ADMIN && flags[FEATURE.PHOTO_MODERATION]
  );
  const hasSearchFilter = searchQuery.trim().length > 0;

  const visibleSections = useMemo(
    () => filterFeedSections(sections, searchQuery),
    [sections, searchQuery]
  );

  const visiblePhotos = useMemo(() => flattenFeedPhotos(visibleSections), [visibleSections]);

  const sectionsById = useMemo(
    () => new Map(sections.map((section) => [section.id, section])),
    [sections]
  );

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) {
        clearTimeout(copyTimerRef.current);
      }
      if (paginationObserverRef.current) {
        paginationObserverRef.current.disconnect();
      }
    };
  }, []);

  // Rolagem automática caso a URL contenha âncora direta (#publicacao-feed-...)
  useEffect(() => {
    if (initialHashHandledRef.current || sections.length === 0) return;
    const rawHash = window.location.hash.replace(/^#/, '');
    if (!rawHash) return;

    const target = document.getElementById(rawHash);
    if (target) {
      initialHashHandledRef.current = true;
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [sections]);

  // Observa qual publicação está visível para destacar no índice lateral
  useEffect(() => {
    if (viewMode !== FeedViewMode.TIMELINE || visibleSections.length === 0) return;

    const articleElements = visibleSections
      .map((section) => document.getElementById(section.anchorId))
      .filter((element): element is HTMLElement => Boolean(element));

    if (articleElements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries.find((entry) => entry.isIntersecting);
        if (!visibleEntry) return;
        const matched = visibleSections.find(
          (section) => section.anchorId === visibleEntry.target.id
        );
        if (matched) {
          setActiveSectionId(matched.id);
        }
      },
      { rootMargin: '-20% 0px -60% 0px', threshold: 0.05 }
    );

    articleElements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [viewMode, visibleSections]);

  // Sentinela de paginação infinita automática
  const sentinelRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (paginationObserverRef.current) {
        paginationObserverRef.current.disconnect();
      }
      if (
        !node ||
        hasSearchFilter ||
        !hasNextPage ||
        isFetchingNextPage ||
        Boolean(nextPageErrorMessage)
      ) {
        return;
      }

      paginationObserverRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0]?.isIntersecting) {
            loadNextPage();
          }
        },
        { rootMargin: '280px 0px' }
      );

      paginationObserverRef.current.observe(node);
    },
    [hasSearchFilter, hasNextPage, isFetchingNextPage, nextPageErrorMessage, loadNextPage]
  );

  const handleOpenLightbox = useCallback(
    (section: FeedSectionViewModel, mediaIndex: number = 0) => {
      markStoryViewed(section.id);
      if (section.mediaCount === 0) return;
      setActiveLightbox({ section, initialIndex: mediaIndex });
    },
    [markStoryViewed]
  );

  const handleSelectPhotoWallItem = useCallback(
    (photo: FeedPhotoWallItem) => {
      const parentSection = sectionsById.get(photo.sectionId);
      if (!parentSection) return;
      handleOpenLightbox(parentSection, photo.mediaIndex);
    },
    [sectionsById, handleOpenLightbox]
  );

  const handleJumpToSection = useCallback((section: FeedSectionViewModel) => {
    setActiveSectionId(section.id);
    const element = document.getElementById(section.anchorId);
    element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const handleShareSection = useCallback(async (section: FeedSectionViewModel) => {
    const result = await shareFeedSection(section);
    if (result === ShareResultKind.COPIED_LINK) {
      setCopiedSectionId(section.id);
      if (copyTimerRef.current) {
        clearTimeout(copyTimerRef.current);
      }
      copyTimerRef.current = setTimeout(() => {
        setCopiedSectionId(null);
      }, FEED_COPY_FEEDBACK_DURATION_MS);
    }
  }, []);

  const handleScrollTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  if (isInitialLoading) {
    return (
      <Box
        data-testid={FEED_TEST_IDS.PAGE_ROOT}
        sx={{ minHeight: '100vh', bgcolor: FEED_PALETTE.canvas }}
      >
        <FeedLoadingSkeleton />
      </Box>
    );
  }

  if (isMissingConfig || initialErrorMessage) {
    return (
      <Box
        data-testid={FEED_TEST_IDS.PAGE_ROOT}
        sx={{ minHeight: '100vh', bgcolor: FEED_PALETTE.canvas }}
      >
        <FeedErrorState
          message={
            isMissingConfig
              ? FEED_MESSAGES.MISSING_CONFIG
              : (initialErrorMessage ?? FEED_MESSAGES.LOAD_ERROR)
          }
          isRetrying={isRefreshing}
          onRetry={() => {
            void refreshFeed();
          }}
          onNavigateHome={() => navigate(FEED_ROUTES.HOME)}
        />
      </Box>
    );
  }

  return (
    <Box
      data-testid={FEED_TEST_IDS.PAGE_ROOT}
      sx={{
        minHeight: '100vh',
        bgcolor: FEED_PALETTE.canvas,
        pb: { xs: 5, md: 8 },
      }}
    >
      <FeedHeroBanner
        title={FEED_MESSAGES.DEFAULT_TITLE}
        description={pageMeta?.description ?? FEED_MESSAGES.DEFAULT_SUBTITLE}
        totalSections={totalSections}
        canUploadPhotos={canUploadPhotos}
        canManageFeed={canManageFeed}
        isRefreshing={isRefreshing}
        onNavigateHome={() => navigate(FEED_ROUTES.HOME)}
        onNavigateUpload={() => navigate(FEED_ROUTES.UPLOAD_PHOTOS)}
        onNavigateManage={() => navigate(FEED_ROUTES.ADMIN_MEDIA)}
        onRefresh={() => {
          void refreshFeed();
        }}
      />

      <Container
        data-testid="clubinho-feed-content"
        maxWidth={false}
        disableGutters
        sx={{ width: FEED_CONTAINER_WIDTH, maxWidth: FEED_CONTENT_MAX_WIDTH, mx: 'auto' }}
      >
        {sections.length === 0 ? (
          <Box sx={{ pt: { xs: 4, md: 6 } }}>
            <FeedEmptyState
              canUploadPhotos={canUploadPhotos}
              isRefreshing={isRefreshing}
              onRefresh={() => {
                void refreshFeed();
              }}
              onNavigateUpload={() => navigate(FEED_ROUTES.UPLOAD_PHOTOS)}
            />
          </Box>
        ) : (
          <>
            <FeedControlBar
              viewMode={viewMode}
              searchQuery={searchQuery}
              visibleCount={visibleSections.length}
              loadedCount={sections.length}
              totalPhotosCount={visiblePhotos.length}
              onViewModeChange={setViewMode}
              onSearchChange={setSearchQuery}
              onClearSearch={() => setSearchQuery('')}
            />

            {visibleSections.length === 0 ? (
              <Paper
                data-testid={FEED_TEST_IDS.FILTER_EMPTY_STATE}
                elevation={0}
                sx={{
                  maxWidth: 620,
                  mx: 'auto',
                  my: { xs: 3, md: 5 },
                  p: { xs: 3.5, sm: 5 },
                  textAlign: 'center',
                  borderRadius: 4,
                  bgcolor: '#ffffff',
                  border: `1px dashed ${FEED_PALETTE.borderStrong}`,
                }}
              >
                <FilterAltOffOutlinedIcon
                  sx={{ fontSize: 40, color: FEED_PALETTE.inkMuted, mb: 1 }}
                />
                <Typography
                  component="h2"
                  sx={{
                    fontSize: '1.2rem',
                    fontWeight: 800,
                    color: FEED_PALETTE.inkPrimary,
                    mb: 0.75,
                  }}
                >
                  {FEED_MESSAGES.FILTER_EMPTY_TITLE}
                </Typography>
                <Typography sx={{ color: FEED_PALETTE.inkSecondary, mb: 2.5 }}>
                  {FEED_MESSAGES.FILTER_EMPTY_DESCRIPTION}
                </Typography>
                <Button
                  type="button"
                  variant="contained"
                  onClick={() => setSearchQuery('')}
                  sx={{
                    minHeight: FEED_TOUCH_TARGET_PX,
                    px: 3,
                    borderRadius: 99,
                    textTransform: 'none',
                    fontWeight: 700,
                    bgcolor: FEED_PALETTE.brandForest,
                    color: '#ffffff',
                    '&:hover': {
                      bgcolor: FEED_PALETTE.brandForestDeep,
                    },
                  }}
                >
                  Limpar filtro
                </Button>
              </Paper>
            ) : viewMode === FeedViewMode.TIMELINE ? (
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    md: 'minmax(0, 1fr) 290px',
                  },
                  gap: { xs: 2.5, md: 3 },
                  alignItems: 'start',
                }}
              >
                <Stack
                  data-testid={FEED_TEST_IDS.TIMELINE_STREAM}
                  spacing={{ xs: 2.5, sm: 3.5 }}
                  sx={{ minWidth: 0 }}
                >
                  {visibleSections.map((section) => (
                    <FeedPostCard
                      key={section.id}
                      section={section}
                      isCelebrated={isCelebrated(section.id)}
                      isCopied={copiedSectionId === section.id}
                      onToggleCelebrate={handleCelebrate}
                      onShare={(targetSection) => {
                        void handleShareSection(targetSection);
                      }}
                      onOpenLightbox={handleOpenLightbox}
                    />
                  ))}
                </Stack>

                <FeedTimelineRail
                  sections={visibleSections}
                  activeSectionId={activeSectionId}
                  canUploadPhotos={canUploadPhotos}
                  onJumpToSection={handleJumpToSection}
                  onNavigateUpload={() => navigate(FEED_ROUTES.UPLOAD_PHOTOS)}
                  onScrollTop={handleScrollTop}
                />
              </Box>
            ) : viewMode === FeedViewMode.BENTO ? (
              <FeedBentoMural
                sections={visibleSections}
                isCelebrated={isCelebrated}
                onToggleCelebrate={handleCelebrate}
                onOpenLightbox={handleOpenLightbox}
              />
            ) : (
              <FeedPhotoWall photos={visiblePhotos} onSelectPhoto={handleSelectPhotoWallItem} />
            )}

            {/* Rodapé de paginação progressiva */}
            <Box sx={{ mt: { xs: 4, md: 5 } }}>
              {nextPageErrorMessage && (
                <Alert
                  severity="warning"
                  sx={{ maxWidth: 640, mx: 'auto', mb: 2, borderRadius: 3 }}
                  action={
                    <Button
                      type="button"
                      color="inherit"
                      size="small"
                      onClick={loadNextPage}
                      sx={{
                        minHeight: FEED_TOUCH_TARGET_PX,
                        fontWeight: 700,
                        textTransform: 'none',
                      }}
                    >
                      Tentar novamente
                    </Button>
                  }
                >
                  {nextPageErrorMessage}
                </Alert>
              )}

              {hasNextPage && (
                <Stack alignItems="center" spacing={1.5}>
                  <Box ref={sentinelRef} sx={{ width: '100%', height: 4 }} />
                  <Button
                    data-testid={FEED_TEST_IDS.LOAD_MORE_BUTTON}
                    type="button"
                    variant="outlined"
                    disabled={isFetchingNextPage}
                    onClick={loadNextPage}
                    startIcon={
                      isFetchingNextPage ? (
                        <CircularProgress size={18} color="inherit" />
                      ) : (
                        <ExpandMoreRoundedIcon />
                      )
                    }
                    sx={{
                      minHeight: 48,
                      px: 3.5,
                      borderRadius: 99,
                      textTransform: 'none',
                      fontWeight: 700,
                      color: FEED_PALETTE.brandForest,
                      borderColor: FEED_PALETTE.borderStrong,
                      bgcolor: '#ffffff',
                      '&:hover': {
                        bgcolor: 'rgba(129, 215, 66, 0.1)',
                        borderColor: FEED_PALETTE.brandForest,
                      },
                    }}
                  >
                    {isFetchingNextPage ? 'Carregando publicações...' : 'Carregar mais publicações'}
                  </Button>
                </Stack>
              )}

              {!hasNextPage && !hasSearchFilter && visibleSections.length > 0 && (
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="center"
                  spacing={2}
                  sx={{ py: 2, opacity: 0.8 }}
                >
                  <Box sx={{ width: 48, height: 1, bgcolor: FEED_PALETTE.borderStrong }} />
                  <Typography
                    variant="caption"
                    sx={{ fontWeight: 700, color: FEED_PALETTE.inkMuted }}
                  >
                    {FEED_MESSAGES.END_OF_FEED}
                  </Typography>
                  <Box sx={{ width: 48, height: 1, bgcolor: FEED_PALETTE.borderStrong }} />
                </Stack>
              )}
            </Box>
          </>
        )}
      </Container>

      <FeedLightboxDialog activeState={activeLightbox} onClose={() => setActiveLightbox(null)} />
    </Box>
  );
}
