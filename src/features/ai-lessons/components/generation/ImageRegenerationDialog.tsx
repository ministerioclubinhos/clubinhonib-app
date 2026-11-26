import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  ButtonBase,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  AutoAwesome,
  CheckCircle,
  Close,
  EditOutlined,
  RadioButtonUnchecked,
  Replay,
} from '@mui/icons-material';
import {
  IMAGE_REGENERATION_INSTRUCTIONS_MAX_LENGTH,
  IMAGE_REGENERATION_TEXTS as TEXTS,
} from '../../image-regeneration.constants';
import {
  imageBriefOutcome,
  imageSelectionSummary,
  showsFirstImageNote,
  toggleImageSelection,
} from '../../image-regeneration.utils';
import type { ImageRegenerationDialogProps } from '../../production.types';

const ACTION_SX = { minHeight: 48, fontWeight: 700, textTransform: 'none', borderRadius: 2.5 };

/**
 * The single place to redo images of an item: pick one, some or all — text and
 * the others are kept — or, where the item has its own choices (story visuals),
 * redo the whole thing. On a phone it takes the full screen, with the actions
 * always within reach of the thumb.
 */
export function ImageRegenerationDialog({
  regeneration,
  stageLabel,
  fullRegeneration,
}: ImageRegenerationDialogProps) {
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { images, brief, setOnly, open, pending, error, blockedReason } = regeneration;
  const allIds = images.map((image) => image.id);
  const [selected, setSelected] = useState<string[]>([]);
  const [instructions, setInstructions] = useState('');
  const [briefOpen, setBriefOpen] = useState(false);

  // Every opening starts clean: a previous choice must never be sent by accident.
  useEffect(() => {
    if (!open) return;
    setSelected(setOnly && !blockedReason ? allIds : []);
    setInstructions('');
    setBriefOpen(false);
    // `allIds` is derived from `images`; reacting to it would reset the choice on every render.
  }, [open, setOnly, blockedReason]);

  const toggle = (id: string) =>
    setSelected((current) => toggleImageSelection(current, id, allIds, setOnly));
  const everySelected = selected.length === allIds.length;
  const selectable = !blockedReason && images.length > 0;

  return (
    <Dialog
      data-testid="ai-lesson-image-regeneration-dialog"
      open={open}
      onClose={regeneration.close}
      fullWidth
      fullScreen={mobile}
      maxWidth="md"
      aria-labelledby="image-regeneration-title"
    >
      <DialogTitle
        id="image-regeneration-title"
        component="div"
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 1,
          px: { xs: 2, sm: 3 },
          py: { xs: 1.5, sm: 2 },
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography component="h2" variant="h6" fontWeight={800}>
            {TEXTS.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ overflowWrap: 'anywhere' }}>
            {stageLabel}
          </Typography>
        </Box>
        <IconButton
          aria-label={TEXTS.close}
          onClick={regeneration.close}
          disabled={pending}
          edge="end"
          sx={{ width: 44, height: 44 }}
        >
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 2.5 } }}>
        {fullRegeneration && (
          <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 0.5 }}>
            {TEXTS.someTitle}
          </Typography>
        )}

        {selectable ? (
          <>
            <Typography variant="body2" sx={{ mb: 1.5 }}>
              {setOnly ? TEXTS.setOnly : TEXTS.intro}
            </Typography>

            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              gap={1}
              sx={{ mb: 1 }}
            >
              <Typography
                data-testid="ai-lesson-image-regeneration-summary"
                variant="body2"
                fontWeight={700}
                role="status"
                sx={{ minWidth: 0 }}
              >
                {imageSelectionSummary(selected.length, images.length)}
              </Typography>
              {!setOnly && (
                <Button
                  data-testid="ai-lesson-image-regeneration-select-all"
                  size="small"
                  disabled={pending}
                  onClick={() => setSelected(everySelected ? [] : allIds)}
                  sx={{ minHeight: 44, flexShrink: 0, textTransform: 'none', fontWeight: 700 }}
                >
                  {everySelected ? TEXTS.clear : TEXTS.selectAll}
                </Button>
              )}
            </Stack>

            <Box
              sx={{
                display: 'grid',
                gap: { xs: 1, sm: 1.5 },
                gridTemplateColumns: {
                  xs: 'repeat(2, minmax(0, 1fr))',
                  sm: 'repeat(3, minmax(0, 1fr))',
                  md: 'repeat(4, minmax(0, 1fr))',
                },
              }}
            >
              {images.map((image) => {
                const checked = selected.includes(image.id);
                return (
                  <ButtonBase
                    key={image.id}
                    data-testid={`ai-lesson-image-regeneration-option-${image.id}`}
                    role="checkbox"
                    aria-checked={checked}
                    aria-label={image.label}
                    disabled={pending}
                    onClick={() => toggle(image.id)}
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'stretch',
                      justifyContent: 'flex-start',
                      textAlign: 'left',
                      borderRadius: 2.5,
                      border: '2px solid',
                      borderColor: checked ? 'warning.main' : 'divider',
                      bgcolor: checked ? 'action.selected' : 'background.paper',
                      overflow: 'hidden',
                      '&:focus-visible': { outline: '3px solid', outlineColor: 'primary.main' },
                    }}
                  >
                    <Box
                      sx={{ position: 'relative', bgcolor: 'action.hover', aspectRatio: '1 / 1' }}
                    >
                      <Box
                        component="img"
                        src={image.url}
                        alt=""
                        loading="lazy"
                        sx={{
                          display: 'block',
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain',
                          opacity: checked ? 0.6 : 1,
                        }}
                      />
                      <Box
                        aria-hidden
                        sx={{
                          position: 'absolute',
                          top: 6,
                          left: 6,
                          display: 'flex',
                          bgcolor: 'background.paper',
                          borderRadius: '50%',
                          boxShadow: 1,
                        }}
                      >
                        {checked ? (
                          <CheckCircle color="warning" sx={{ fontSize: 30 }} />
                        ) : (
                          <RadioButtonUnchecked color="action" sx={{ fontSize: 30 }} />
                        )}
                      </Box>
                    </Box>
                    <Typography
                      variant="caption"
                      fontWeight={checked ? 700 : 500}
                      sx={{ p: 1, lineHeight: 1.3, overflowWrap: 'anywhere' }}
                    >
                      {image.label}
                    </Typography>
                  </ButtonBase>
                );
              })}
            </Box>

            {selected.length > 0 && selected.length < images.length && (
              <Alert
                data-testid="ai-lesson-image-regeneration-continuity"
                severity="success"
                icon={false}
                sx={{ mt: 2, borderRadius: 2 }}
              >
                {TEXTS.continuityNote}
              </Alert>
            )}

            {showsFirstImageNote(images, selected) && (
              <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>
                {TEXTS.firstImageNote}
              </Alert>
            )}

            <TextField
              label={TEXTS.instructionsLabel}
              helperText={`${TEXTS.instructionsHelp} ${instructions.length}/${IMAGE_REGENERATION_INSTRUCTIONS_MAX_LENGTH}`}
              value={instructions}
              onChange={(event) =>
                setInstructions(
                  event.target.value.slice(0, IMAGE_REGENERATION_INSTRUCTIONS_MAX_LENGTH)
                )
              }
              disabled={pending}
              multiline
              minRows={2}
              fullWidth
              sx={{ mt: 2 }}
              slotProps={{
                htmlInput: { 'data-testid': 'ai-lesson-image-regeneration-instructions' },
              }}
            />

            <Paper
              data-testid="ai-lesson-image-brief"
              variant="outlined"
              sx={{ mt: 2, p: { xs: 1.5, sm: 2 }, borderRadius: 3 }}
            >
              <Typography variant="subtitle2" fontWeight={800}>
                {TEXTS.brief.title}
              </Typography>
              <Typography
                data-testid="ai-lesson-image-brief-outcome"
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                {imageBriefOutcome(brief, selected.length, images.length)}
              </Typography>
              {brief && (
                <>
                  <Button
                    data-testid="ai-lesson-image-brief-toggle"
                    size="small"
                    aria-expanded={briefOpen}
                    onClick={() => setBriefOpen((current) => !current)}
                    sx={{
                      mt: 0.5,
                      ml: -0.5,
                      minHeight: 44,
                      textTransform: 'none',
                      fontWeight: 700,
                    }}
                  >
                    {briefOpen ? TEXTS.brief.hide : TEXTS.brief.show}
                  </Button>
                  <Collapse in={briefOpen} unmountOnExit>
                    <Typography variant="caption" fontWeight={800} sx={{ display: 'block' }}>
                      {TEXTS.brief.artDirection}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', mb: 1 }}
                    >
                      {brief.artDirection}
                    </Typography>
                    {images
                      .filter((image) => selected.includes(image.id) && brief.parts[image.id])
                      .map((image) => (
                        <Box key={image.id} sx={{ mb: 1 }}>
                          <Typography variant="caption" fontWeight={800} sx={{ display: 'block' }}>
                            {TEXTS.brief.part} — {image.label}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}
                          >
                            {brief.parts[image.id]}
                          </Typography>
                        </Box>
                      ))}
                  </Collapse>
                </>
              )}
            </Paper>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
              {TEXTS.outcome}
            </Typography>
          </>
        ) : (
          <Alert
            data-testid="ai-lesson-image-regeneration-blocked"
            severity="warning"
            sx={{ borderRadius: 2 }}
          >
            {blockedReason ?? TEXTS.blocked.missing}
          </Alert>
        )}

        {error && (
          <Alert
            data-testid="ai-lesson-image-regeneration-error"
            severity="error"
            sx={{ mt: 2, borderRadius: 2 }}
          >
            {error}
          </Alert>
        )}

        {fullRegeneration && (
          <Paper
            data-testid="ai-lesson-image-regeneration-full"
            variant="outlined"
            sx={{ mt: 3, p: { xs: 1.5, sm: 2 }, borderRadius: 3 }}
          >
            <Typography variant="subtitle2" fontWeight={800}>
              {TEXTS.fullTitle}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 1.5 }}>
              {TEXTS.fullDescription}
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} gap={1}>
              <Button
                data-testid="ai-lesson-image-regeneration-change-choices"
                variant="outlined"
                startIcon={<EditOutlined />}
                disabled={pending}
                onClick={fullRegeneration.onChangeChoices}
                sx={ACTION_SX}
              >
                {TEXTS.fullChangeChoices}
              </Button>
              <Button
                data-testid="ai-lesson-image-regeneration-keep-choices"
                variant="outlined"
                color="warning"
                startIcon={<Replay />}
                disabled={pending || !fullRegeneration.canKeepChoices}
                onClick={fullRegeneration.onKeepChoices}
                sx={ACTION_SX}
              >
                {TEXTS.fullKeepChoices}
              </Button>
            </Stack>
          </Paper>
        )}
      </DialogContent>

      <DialogActions
        sx={{
          px: { xs: 2, sm: 3 },
          py: { xs: 1.5, sm: 2 },
          gap: 1,
          flexDirection: { xs: 'column-reverse', sm: 'row' },
          // Keeps the buttons clear of the phone's home indicator.
          pb: { xs: 'calc(12px + env(safe-area-inset-bottom))', sm: 2 },
          '& > :not(style) ~ :not(style)': { ml: 0 },
        }}
      >
        {/* On a phone the close button of the title already cancels. */}
        {(!mobile || !selectable) && (
          <Button
            onClick={regeneration.close}
            disabled={pending}
            fullWidth={mobile}
            sx={{ ...ACTION_SX, fontWeight: 600 }}
          >
            {TEXTS.cancel}
          </Button>
        )}
        {selectable && (
          <Button
            data-testid="ai-lesson-image-regeneration-confirm"
            variant="contained"
            color="warning"
            startIcon={<AutoAwesome />}
            disabled={pending || selected.length === 0}
            onClick={() => regeneration.submit(selected, instructions)}
            fullWidth={mobile}
            sx={ACTION_SX}
          >
            {pending
              ? TEXTS.submitting
              : selected.length === 0
                ? TEXTS.confirmNone
                : TEXTS.confirm(selected.length)}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
