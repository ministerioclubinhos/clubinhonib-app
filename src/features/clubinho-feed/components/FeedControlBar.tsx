import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import AppsRoundedIcon from '@mui/icons-material/AppsRounded';
import ClearRoundedIcon from '@mui/icons-material/ClearRounded';
import CollectionsOutlinedIcon from '@mui/icons-material/CollectionsOutlined';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import ViewDayRoundedIcon from '@mui/icons-material/ViewDayRounded';

import {
  FEED_PALETTE,
  FEED_TEST_IDS,
  FEED_TOUCH_TARGET_PX,
  FEED_VIEW_MODE_OPTIONS,
} from '../constants';
import { type FeedControlBarProps, FeedViewMode } from '../types';
import { formatCountLabel } from '../utils';

function renderModeIcon(mode: FeedViewMode) {
  switch (mode) {
    case FeedViewMode.TIMELINE:
      return <ViewDayRoundedIcon sx={{ fontSize: 18 }} />;
    case FeedViewMode.BENTO:
      return <CollectionsOutlinedIcon sx={{ fontSize: 18 }} />;
    case FeedViewMode.GALLERY:
      return <AppsRoundedIcon sx={{ fontSize: 18 }} />;
  }
}

export function FeedControlBar({
  viewMode,
  searchQuery,
  visibleCount,
  loadedCount,
  totalPhotosCount,
  onViewModeChange,
  onSearchChange,
  onClearSearch,
}: FeedControlBarProps) {
  const hasFilter = searchQuery.trim().length > 0;

  return (
    <Box data-testid={FEED_TEST_IDS.CONTROL_BAR} sx={{ pt: 2.5, mb: 2.5 }}>
      <Stack
        direction={{ xs: 'column-reverse', sm: 'row' }}
        spacing={2}
        alignItems={{ xs: 'stretch', sm: 'center' }}
        justifyContent="space-between"
        sx={{ borderBottom: `1px solid ${FEED_PALETTE.borderSubtle}`, pb: { xs: 0, sm: 1.5 } }}
      >
        <Box
          role="group"
          aria-label="Modo de visualização do Feed Clubinho"
          sx={{ display: 'flex', gap: { xs: 0, sm: 1 }, flexShrink: 0 }}
        >
          {FEED_VIEW_MODE_OPTIONS.map((option) => {
            const isSelected = viewMode === option.mode;
            return (
              <Button
                key={option.mode}
                data-testid={`${FEED_TEST_IDS.VIEW_MODE_PREFIX}-${option.mode}`}
                type="button"
                onClick={() => onViewModeChange(option.mode)}
                aria-pressed={isSelected}
                startIcon={renderModeIcon(option.mode)}
                sx={{
                  minHeight: FEED_TOUCH_TARGET_PX,
                  minWidth: 0,
                  flex: { xs: 1, sm: 'initial' },
                  px: { xs: 1.5, sm: 2 },
                  borderRadius: { xs: '8px 8px 0 0', sm: 2 },
                  textTransform: 'none',
                  fontWeight: isSelected ? 700 : 500,
                  fontSize: '0.85rem',
                  color: isSelected ? FEED_PALETTE.brandLeafDark : FEED_PALETTE.inkSecondary,
                  bgcolor: isSelected ? FEED_PALETTE.brandSoft : 'transparent',
                  borderBottom: `2px solid ${isSelected ? FEED_PALETTE.brandLeaf : 'transparent'}`,
                  '&:hover': { bgcolor: FEED_PALETTE.brandSoft },
                }}
              >
                <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                  {option.label}
                </Box>
                <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>
                  {option.shortLabel}
                </Box>
              </Button>
            );
          })}
        </Box>
        <TextField
          size="small"
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Buscar nas publicações..."
          inputProps={{
            'aria-label': 'Buscar nas publicações carregadas',
            'data-testid': FEED_TEST_IDS.SEARCH_INPUT,
          }}
          sx={{
            width: { xs: '100%', sm: 310 },
            '& .MuiOutlinedInput-root': {
              minHeight: FEED_TOUCH_TARGET_PX,
              pr: 0.5,
              borderRadius: 2,
              bgcolor: FEED_PALETTE.canvasElevated,
              fontSize: '0.85rem',
              '& fieldset': { borderColor: FEED_PALETTE.borderSubtle },
              '&.Mui-focused fieldset': { borderColor: FEED_PALETTE.brandLeafDark },
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchRoundedIcon sx={{ fontSize: 20, color: FEED_PALETTE.inkMuted }} />
              </InputAdornment>
            ),
            endAdornment: hasFilter ? (
              <InputAdornment position="end">
                <IconButton
                  data-testid={FEED_TEST_IDS.SEARCH_CLEAR}
                  type="button"
                  onClick={onClearSearch}
                  aria-label="Limpar busca do feed"
                  sx={{ width: FEED_TOUCH_TARGET_PX, height: FEED_TOUCH_TARGET_PX }}
                >
                  <ClearRoundedIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ) : undefined,
          }}
        />
      </Stack>
      <Typography role="status" sx={{ mt: 2, color: FEED_PALETTE.inkMuted, fontSize: '0.78rem' }}>
        {hasFilter
          ? `${visibleCount} de ${loadedCount} publicações carregadas`
          : viewMode === FeedViewMode.GALLERY
            ? formatCountLabel(totalPhotosCount, 'foto', 'fotos')
            : 'Publicações mais recentes'}
      </Typography>
    </Box>
  );
}
