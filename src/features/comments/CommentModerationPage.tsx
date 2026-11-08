import { useSearchParams } from 'react-router-dom';
import { Box, Tab, Tabs } from '@mui/material';
import { CommentModerationTab, PhotoCommentsManager } from '@/features/feed-photo-comments';
import CommentsManager from './CommentsManager';

export default function CommentModerationPage() {
  const [params, setParams] = useSearchParams();
  const tab =
    params.get('tab') === CommentModerationTab.PHOTOS
      ? CommentModerationTab.PHOTOS
      : CommentModerationTab.TESTIMONIALS;
  return (
    <Box data-testid="comment-moderation-page">
      <Tabs
        value={tab}
        onChange={(_, value: CommentModerationTab) => setParams({ tab: value })}
        aria-label="Tipo de comentário"
        variant="scrollable"
        scrollButtons="auto"
        sx={{ px: { xs: 1, sm: 3 }, borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab
          value={CommentModerationTab.TESTIMONIALS}
          label="Depoimentos"
          sx={{ textTransform: 'none' }}
        />
        <Tab
          data-testid="comment-moderation-photos-tab"
          value={CommentModerationTab.PHOTOS}
          label="Fotos e vídeos"
          sx={{ textTransform: 'none' }}
        />
      </Tabs>
      {tab === CommentModerationTab.PHOTOS ? <PhotoCommentsManager /> : <CommentsManager />}
    </Box>
  );
}
