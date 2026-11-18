import { useMemo, useState } from 'react';
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  Stack,
  TextField,
  Typography,
  alpha,
} from '@mui/material';
import {
  Close as CloseIcon,
  EditOutlined as EditIcon,
  MenuBook as VerseIcon,
} from '@mui/icons-material';
import { extractErrorMessage } from '@/utils/apiError';
import { useChangeMemoryVerse } from '../../hooks';
import { LESSON_VERSE_TEXTS, VERSE_FIELD_LIMITS } from '../../production.constants';
import { lessonStageLabel } from '../../presentation.utils';
import { LessonStageType, type Lesson } from '../../types';
import {
  isSameVerse,
  isVerseLocked,
  itemsOutdatedByVerse,
  verseChangeNeedsAcknowledgement,
  verseReferenceError,
  verseTextError,
} from '../../verse.utils';

interface LessonVerseToolProps {
  lesson: Lesson;
  verse: { reference: string; text: string };
  /** The selected item has an edit that was not saved. */
  unsaved: boolean;
  /** A generation is running. */
  busy: boolean;
  /** Called with the new verse once the API accepted it, so the screen can go back to item 1. */
  onChanged: (verse: { reference: string; text: string }, outdated: LessonStageType[]) => void;
}

/**
 * Changing the memory verse is a lesson-wide act, so it lives in its own tool:
 * a quiet line with the current verse and a dialog that says plainly what the
 * change costs before it is confirmed.
 */
export function LessonVerseTool({ lesson, verse, unsaved, busy, onChanged }: LessonVerseToolProps) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(verse.text);
  const [reference, setReference] = useState(verse.reference);
  const [acknowledged, setAcknowledged] = useState(false);
  const change = useChangeMemoryVerse();

  const base = lesson.stages.find((stage) => stage.type === LessonStageType.LESSON);
  const outdated = useMemo(() => itemsOutdatedByVerse(lesson), [lesson]);
  const needsAcknowledgement = verseChangeNeedsAcknowledgement(lesson);
  const locked = isVerseLocked(lesson.status);
  const blockedReason = locked
    ? LESSON_VERSE_TEXTS.published
    : busy
      ? LESSON_VERSE_TEXTS.busy
      : unsaved
        ? LESSON_VERSE_TEXTS.unsaved
        : null;

  const trimmedText = text.trim();
  const trimmedReference = reference.trim();
  const textError = verseTextError(text);
  const referenceError = verseReferenceError(reference);
  const unchanged = isSameVerse({ text, reference }, verse);
  const canSubmit =
    !textError &&
    !referenceError &&
    !unchanged &&
    (!needsAcknowledgement || acknowledged) &&
    !change.isPending;

  const openDialog = () => {
    setText(verse.text);
    setReference(verse.reference);
    setAcknowledged(false);
    change.reset();
    setOpen(true);
  };
  const close = () => {
    if (!change.isPending) setOpen(false);
  };
  const submit = () => {
    if (!base || !canSubmit) return;
    change.mutate(
      {
        id: lesson.id,
        payload: {
          text: trimmedText,
          reference: trimmedReference,
          lockVersion: base.lockVersion,
          acknowledgeImpact: needsAcknowledgement ? acknowledged : undefined,
        },
      },
      {
        onSuccess: () => {
          setOpen(false);
          onChanged({ text: trimmedText, reference: trimmedReference }, outdated);
        },
      }
    );
  };

  return (
    <>
      <Box
        data-testid="ai-lesson-verse-tool"
        sx={(theme) => ({
          minWidth: 0,
          p: 1.5,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          borderRadius: 3,
          border: '1px solid',
          borderColor: alpha(theme.palette.primary.main, 0.35),
          bgcolor: alpha(theme.palette.primary.main, 0.05),
        })}
      >
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
          <VerseIcon fontSize="small" color="primary" aria-hidden />
          <Typography variant="overline" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
            {LESSON_VERSE_TEXTS.label}
          </Typography>
          <Chip size="small" color="primary" label={verse.reference} sx={{ fontWeight: 700 }} />
        </Stack>
        <Typography
          data-testid="ai-lesson-verse-current"
          variant="body2"
          sx={{
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            lineHeight: 1.5,
          }}
        >
          “{verse.text}” — {verse.reference}
        </Typography>
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          justifyContent="space-between"
          flexWrap="wrap"
          useFlexGap
        >
          {blockedReason ? (
            <Typography
              data-testid="ai-lesson-verse-blocked"
              variant="caption"
              color="text.secondary"
              sx={{ flex: 1, minWidth: 140 }}
            >
              {blockedReason}
            </Typography>
          ) : (
            <Box sx={{ flex: 1 }} />
          )}
          <Button
            data-testid="ai-lesson-verse-change"
            size="small"
            variant="outlined"
            startIcon={<EditIcon fontSize="small" />}
            aria-label={LESSON_VERSE_TEXTS.changeLabel}
            disabled={Boolean(blockedReason)}
            onClick={openDialog}
            sx={{ textTransform: 'none', fontWeight: 700, minHeight: 36 }}
          >
            {LESSON_VERSE_TEXTS.change}
          </Button>
        </Stack>
      </Box>

      <Dialog
        data-testid="ai-lesson-verse-dialog"
        open={open}
        onClose={close}
        fullWidth
        maxWidth="sm"
        slotProps={{ paper: { sx: { borderRadius: 3, m: { xs: 1.5, sm: 3 } } } }}
      >
        <DialogTitle sx={{ pr: 6, fontWeight: 800 }}>
          {LESSON_VERSE_TEXTS.dialogTitle}
          <IconButton
            aria-label={LESSON_VERSE_TEXTS.cancel}
            onClick={close}
            disabled={change.isPending}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Alert data-testid="ai-lesson-verse-warning" severity="warning" sx={{ mb: 2 }}>
            <AlertTitle sx={{ fontWeight: 800 }}>{LESSON_VERSE_TEXTS.warningTitle}</AlertTitle>
            <Typography variant="body2">{LESSON_VERSE_TEXTS.warningBody}</Typography>
            {outdated.length > 0 ? (
              <>
                <Typography variant="body2" sx={{ mt: 1, fontWeight: 700 }}>
                  {LESSON_VERSE_TEXTS.impactTitle}
                </Typography>
                <Box component="ul" data-testid="ai-lesson-verse-impact" sx={{ pl: 2.5, my: 0.5 }}>
                  {outdated.map((type) => (
                    <Typography component="li" variant="body2" key={type}>
                      {lessonStageLabel(type, lesson.category)}
                    </Typography>
                  ))}
                </Box>
              </>
            ) : (
              <Typography variant="body2" sx={{ mt: 1 }} data-testid="ai-lesson-verse-no-impact">
                {LESSON_VERSE_TEXTS.noImpact}
              </Typography>
            )}
          </Alert>

          <Stack spacing={2}>
            <TextField
              label={LESSON_VERSE_TEXTS.textLabel}
              value={text}
              onChange={(event) => setText(event.target.value)}
              multiline
              minRows={3}
              fullWidth
              error={Boolean(textError)}
              helperText={textError ?? `${trimmedText.length}/${VERSE_FIELD_LIMITS.textMax}`}
              slotProps={{
                htmlInput: {
                  maxLength: VERSE_FIELD_LIMITS.textMax + 50,
                  'data-testid': 'ai-lesson-verse-text',
                },
              }}
            />
            <Stack direction="row" spacing={1} alignItems="flex-start">
              <TextField
                label={LESSON_VERSE_TEXTS.referenceLabel}
                value={reference}
                onChange={(event) => setReference(event.target.value)}
                fullWidth
                error={Boolean(referenceError)}
                helperText={referenceError ?? LESSON_VERSE_TEXTS.referenceHelper}
                slotProps={{
                  htmlInput: {
                    maxLength: VERSE_FIELD_LIMITS.referenceMax,
                    'data-testid': 'ai-lesson-verse-reference',
                  },
                }}
              />
              <Chip
                label={LESSON_VERSE_TEXTS.versionChip}
                size="small"
                sx={{ mt: 1.75, fontWeight: 700 }}
              />
            </Stack>
          </Stack>

          {needsAcknowledgement && (
            <FormControlLabel
              sx={{ mt: 1.5, alignItems: 'flex-start' }}
              control={
                <Checkbox
                  data-testid="ai-lesson-verse-acknowledge"
                  checked={acknowledged}
                  onChange={(event) => setAcknowledged(event.target.checked)}
                />
              }
              label={<Typography variant="body2">{LESSON_VERSE_TEXTS.acknowledge}</Typography>}
            />
          )}
          {unchanged && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
              {LESSON_VERSE_TEXTS.unchanged}
            </Typography>
          )}
          {change.isError && (
            <Alert
              data-testid="ai-lesson-verse-error"
              severity="error"
              sx={{ mt: 1.5 }}
              onClose={() => change.reset()}
            >
              {extractErrorMessage(change.error, LESSON_VERSE_TEXTS.error)}
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, flexWrap: 'wrap', gap: 1 }}>
          <Button
            onClick={close}
            color="inherit"
            disabled={change.isPending}
            sx={{ textTransform: 'none' }}
          >
            {LESSON_VERSE_TEXTS.cancel}
          </Button>
          <Button
            data-testid="ai-lesson-verse-confirm"
            variant="contained"
            color="warning"
            disabled={!canSubmit}
            onClick={submit}
            startIcon={
              change.isPending ? <CircularProgress size={16} color="inherit" /> : undefined
            }
            sx={{ minHeight: 44, fontWeight: 700, textTransform: 'none' }}
          >
            {change.isPending ? LESSON_VERSE_TEXTS.saving : LESSON_VERSE_TEXTS.confirm}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
