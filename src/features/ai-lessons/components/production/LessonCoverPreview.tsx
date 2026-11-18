import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  ButtonBase,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Link,
  Stack,
  Typography,
} from '@mui/material';
import {
  AutoAwesome as GenerateIcon,
  Close as CloseIcon,
  ImageOutlined as EmptyIcon,
  ZoomIn as ZoomIcon,
} from '@mui/icons-material';
import { extractErrorMessage } from '@/utils/apiError';
import { useRegenerateLessonCover } from '../../hooks';
import { LESSON_COVER_TEXTS } from '../../production.constants';

interface LessonCoverPreviewProps {
  lessonId: string;
  coverImageUrl?: string | null;
  /** The route of a published lesson already shows its image. */
  locked: boolean;
  /** A generation is running: the image waits for it. */
  busy: boolean;
}

/**
 * The presentation image of the lesson, kept out of the way: a small
 * thumbnail beside item 1 that opens the full image, where it can be redrawn.
 */
export function LessonCoverPreview({
  lessonId,
  coverImageUrl,
  locked,
  busy,
}: LessonCoverPreviewProps) {
  const [open, setOpen] = useState(false);
  const regenerate = useRegenerateLessonCover();
  const generating = regenerate.isPending;
  const disabled = locked || busy || generating;
  const hint = locked ? LESSON_COVER_TEXTS.published : busy ? LESSON_COVER_TEXTS.busy : null;
  const close = () => {
    // The request keeps running; closing only hides the dialog.
    setOpen(false);
    if (!generating) regenerate.reset();
  };

  return (
    <>
      <Box
        data-testid="ai-lesson-cover-preview"
        sx={{
          minWidth: 0,
          p: 1.5,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <ButtonBase
          data-testid="ai-lesson-cover-thumbnail"
          aria-label={LESSON_COVER_TEXTS.viewLabel}
          onClick={() => setOpen(true)}
          sx={{
            width: { xs: 88, sm: 104 },
            flexShrink: 0,
            aspectRatio: '3 / 2',
            borderRadius: 2,
            overflow: 'hidden',
            border: '1px solid',
            borderColor: 'divider',
            borderStyle: coverImageUrl ? 'solid' : 'dashed',
            bgcolor: 'action.hover',
            color: 'text.disabled',
            position: 'relative',
            boxShadow: coverImageUrl ? 1 : 0,
            transition: 'box-shadow .2s, transform .2s',
            '&:hover': { boxShadow: 3, transform: 'translateY(-1px)' },
            '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main' },
          }}
        >
          {coverImageUrl ? (
            <Box
              component="img"
              src={coverImageUrl}
              alt=""
              loading="lazy"
              sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          ) : (
            <EmptyIcon />
          )}
          {generating && (
            <CircularProgress
              size={22}
              aria-hidden
              sx={{ position: 'absolute', top: 'calc(50% - 11px)', left: 'calc(50% - 11px)' }}
            />
          )}
        </ButtonBase>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            variant="overline"
            sx={{ fontWeight: 800, lineHeight: 1.2, display: 'block' }}
          >
            {LESSON_COVER_TEXTS.title}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
            {generating
              ? LESSON_COVER_TEXTS.generating
              : coverImageUrl
                ? LESSON_COVER_TEXTS.caption
                : LESSON_COVER_TEXTS.empty}
          </Typography>
          <Button
            size="small"
            variant="outlined"
            startIcon={
              coverImageUrl ? <ZoomIcon fontSize="small" /> : <GenerateIcon fontSize="small" />
            }
            onClick={() => setOpen(true)}
            sx={{ textTransform: 'none', fontWeight: 700, minHeight: 36, whiteSpace: 'nowrap' }}
          >
            {coverImageUrl ? LESSON_COVER_TEXTS.view : LESSON_COVER_TEXTS.generate}
          </Button>
        </Box>
      </Box>

      <Dialog
        data-testid="ai-lesson-cover-dialog"
        open={open}
        onClose={close}
        fullWidth
        maxWidth="md"
        slotProps={{ paper: { sx: { borderRadius: 3, m: { xs: 1.5, sm: 3 } } } }}
      >
        <DialogTitle sx={{ pr: 6, fontWeight: 800 }}>
          {LESSON_COVER_TEXTS.title}
          <IconButton
            aria-label={LESSON_COVER_TEXTS.close}
            onClick={close}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              aspectRatio: '3 / 2',
              borderRadius: 2,
              overflow: 'hidden',
              bgcolor: 'action.hover',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {coverImageUrl ? (
              <Box
                component="img"
                src={coverImageUrl}
                alt={LESSON_COVER_TEXTS.alt}
                data-testid="ai-lesson-cover-image"
                sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            ) : (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ px: 2, textAlign: 'center' }}
              >
                {LESSON_COVER_TEXTS.empty}
              </Typography>
            )}
            {generating && (
              <Stack
                role="status"
                spacing={1}
                alignItems="center"
                justifyContent="center"
                sx={{
                  position: 'absolute',
                  inset: 0,
                  bgcolor: 'rgba(255,255,255,0.78)',
                  px: 2,
                  textAlign: 'center',
                }}
              >
                <CircularProgress size={32} />
                <Typography variant="body2" fontWeight={700}>
                  {LESSON_COVER_TEXTS.generating}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {LESSON_COVER_TEXTS.generatingHint}
                </Typography>
              </Stack>
            )}
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
            {LESSON_COVER_TEXTS.description}
          </Typography>
          {coverImageUrl && (
            <Link
              href={coverImageUrl}
              target="_blank"
              rel="noopener noreferrer"
              variant="body2"
              sx={{ display: 'inline-block', mt: 1 }}
            >
              {LESSON_COVER_TEXTS.openOriginal}
            </Link>
          )}
          {hint && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
              {hint}
            </Typography>
          )}
          {regenerate.isError && (
            <Alert severity="error" sx={{ mt: 1.5 }} onClose={() => regenerate.reset()}>
              {extractErrorMessage(regenerate.error, LESSON_COVER_TEXTS.error)}
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, flexWrap: 'wrap', gap: 1 }}>
          <Button onClick={close} color="inherit" sx={{ textTransform: 'none' }}>
            {LESSON_COVER_TEXTS.close}
          </Button>
          <Button
            data-testid="ai-lesson-cover-regenerate"
            variant="contained"
            disabled={disabled}
            startIcon={
              generating ? <CircularProgress size={16} color="inherit" /> : <GenerateIcon />
            }
            onClick={() => regenerate.mutate(lessonId)}
            sx={{ minHeight: 44, fontWeight: 700, textTransform: 'none' }}
          >
            {generating
              ? LESSON_COVER_TEXTS.generating
              : coverImageUrl
                ? LESSON_COVER_TEXTS.regenerate
                : LESSON_COVER_TEXTS.generate}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
