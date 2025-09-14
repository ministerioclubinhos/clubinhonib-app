import { Fragment, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Paper,
  Stack,
  Typography,
  Tooltip,
  useMediaQuery,
  Collapse,
} from '@mui/material';
import {
  Delete,
  PictureAsPdf,
  Visibility,
  Edit as EditIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import {
  MeditationData, DayItem, WeekDay, WeekDayLabel, setMeditationData,
} from '@/store/slices/meditation/meditationSlice';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store/slices';
import { getMediaPreviewUrl } from 'utils/getMediaPreviewUrl';
import MediaDocumentPreviewModal from 'utils/MediaDocumentPreviewModal';
import { useTheme } from '@mui/material/styles';

interface Props {
  meditation: MeditationData;
  onDelete: (meditation: MeditationData) => void;
  onDayClick: (day: DayItem) => void;
  formatDate: (iso: string) => string;
  isExpandedMobile: boolean;
  onToggleExpandMobile: () => void;
}

export default function MeditationCard({
  meditation,
  onDelete,
  onDayClick,
  formatDate,
  isExpandedMobile,
  onToggleExpandMobile,
}: Props) {
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const previewUrl = getMediaPreviewUrl(meditation.media);

  const handleEdit = () => {
    dispatch(setMeditationData(meditation));
    navigate('/adm/editar-meditacao');
  };

  const showExpanded = !isMobile || isExpandedMobile;

  return (
    <Fragment>
      <Card
        variant="outlined"
        sx={{
          borderRadius: 2,
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          transition: 'transform .2s, box-shadow .2s',
          '&:hover': { transform: 'translateY(-2px)', boxShadow: 3 },
          position: 'relative',
        }}
      >
        <Tooltip title="Excluir meditação">
          <IconButton
            size="small"
            onClick={() => onDelete(meditation)}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              bgcolor: 'rgba(255,255,255,0.9)',
              '&:hover': { bgcolor: 'rgba(255,255,255,1)' },
              color: '#d32f2f',
              zIndex: 2,
            }}
            aria-label="Excluir meditação"
          >
            <Delete fontSize="small" />
          </IconButton>
        </Tooltip>

        <CardContent sx={{ flexGrow: 1, pb: 1.5 }}>
          <Typography
            variant="subtitle1"
            fontWeight={700}
            sx={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textAlign: 'center',
              mt: 0.5,
            }}
            title={meditation.topic}
            gutterBottom
          >
            {meditation.topic}
          </Typography>

          <Typography variant="body2" color="text.secondary" textAlign="center">
            {formatDate(meditation.startDate)} — {formatDate(meditation.endDate)}
          </Typography>

          <Stack direction="row" alignItems="center" justifyContent="space-between" mt={2} mb={1}>
            <Typography fontWeight="bold">
              Dias ({meditation.days.length})
            </Typography>

            {isMobile && (
              <IconButton
                size="small"
                onClick={onToggleExpandMobile}
                aria-label={showExpanded ? 'Recolher dias' : 'Expandir dias'}
                aria-expanded={showExpanded}
              >
                {showExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            )}
          </Stack>

          <Collapse in={showExpanded} timeout="auto" unmountOnExit>
            <Stack spacing={1}>
              {meditation.days.map((day) => (
                <Paper
                  key={day.id}
                  elevation={0}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 1.2,
                    px: 2,
                    border: '1px solid #e5e7eb',
                    borderRadius: 2,
                    bgcolor: '#fafafa',
                  }}
                >
                  <Typography fontWeight="medium">
                    {WeekDayLabel[day.day as WeekDay]}
                  </Typography>
                  <Tooltip title="Ver detalhes do dia">
                    <IconButton
                      size="small"
                      onClick={() => onDayClick(day)}
                      sx={{ color: 'text.secondary' }}
                    >
                      <Visibility fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Paper>
              ))}
            </Stack>

            {meditation.media?.url && (
              <Box textAlign="center" mt={2}>
                <Button
                  startIcon={<PictureAsPdf />}
                  variant="text"
                  size="small"
                  onClick={() => setOpen(true)}
                >
                  Ver Material
                </Button>
              </Box>
            )}
          </Collapse>
        </CardContent>

        <Collapse in={showExpanded} timeout="auto" unmountOnExit>
          <CardActions
            sx={{
              p: 2,
              pt: 0,
              gap: 1,
              flexDirection: isMobile ? 'column' : 'row',
              alignItems: isMobile ? 'stretch' : 'center',
            }}
          >
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={handleEdit}
              sx={{ flex: 1, minWidth: 120 }}
              fullWidth={isMobile}
            >
              Editar
            </Button>
          </CardActions>
        </Collapse>
      </Card>

      <MediaDocumentPreviewModal
        open={open}
        onClose={() => setOpen(false)}
        media={{ ...meditation.media, url: previewUrl }}
      />
    </Fragment>
  );
}
