import { Fragment, useState } from 'react';
import { Box, Button, Card, CardContent, IconButton, Paper, Stack, Typography } from '@mui/material';
import { Delete, PictureAsPdf, Visibility } from '@mui/icons-material';
import {
  MeditationData, DayItem, WeekDay, WeekDayLabel, setMeditationData,
} from '@/store/slices/meditation/meditationSlice';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store/slices';
import { getMediaPreviewUrl } from 'utils/getMediaPreviewUrl';
import MediaDocumentPreviewModal from 'utils/MediaDocumentPreviewModal';

interface Props {
  meditation: MeditationData;
  onDelete: (meditation: MeditationData) => void;
  onDayClick: (day: DayItem) => void;
  formatDate: (iso: string) => string; // injetado do hook utils
}

export default function MeditationCard({ meditation, onDelete, onDayClick, formatDate }: Props) {
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const previewUrl = getMediaPreviewUrl(meditation.media);

  const handleEdit = () => {
    dispatch(setMeditationData(meditation));
    navigate('/adm/editar-meditacao');
  };

  return (
    <Fragment>
      <Card
        sx={{
          flex: 1,
          borderRadius: 3,
          boxShadow: 3,
          p: 2,
          bgcolor: '#fff',
          border: '1px solid #e0e0e0',
          position: 'relative',
        }}
      >
        <IconButton
          size="small"
          onClick={() => onDelete(meditation)}
          sx={{ position: 'absolute', top: 8, right: 8, color: '#d32f2f' }}
          title="Excluir Meditação"
        >
          <Delete fontSize="small" />
        </IconButton>

        <CardContent>
          <Typography
            variant="h6"
            fontWeight="bold"
            textAlign="center"
            gutterBottom
            sx={{ mt: { xs: 0, md: 2 }, mb: { xs: 1, md: 2 }, fontSize: { xs: '1rem', md: '1.5rem' } }}
          >
            {meditation.topic}
          </Typography>

          <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ fontSize: { xs: '.8rem', md: '1rem' } }}>
            {formatDate(meditation.startDate)} - {formatDate(meditation.endDate)}
          </Typography>

          <Typography fontWeight="bold" mt={2} mb={1}>Dias:</Typography>
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
                  border: '1px solid #dcdcdc',
                  borderRadius: 2,
                  bgcolor: '#fafafa',
                }}
              >
                <Typography fontWeight="medium">{WeekDayLabel[day.day as WeekDay]}</Typography>
                <IconButton size="small" onClick={() => onDayClick(day)} sx={{ color: '#616161' }}>
                  <Visibility fontSize="small" />
                </IconButton>
              </Paper>
            ))}
          </Stack>

          {meditation.media?.url && (
            <Box textAlign="center" mt={2}>
              <Button startIcon={<PictureAsPdf />} variant="text" size="small" onClick={() => setOpen(true)}>
                Ver Material
              </Button>
            </Box>
          )}

          <Box textAlign="center" mt={3}>
            <Button variant="outlined" onClick={handleEdit} fullWidth>Editar</Button>
          </Box>
        </CardContent>
      </Card>

      <MediaDocumentPreviewModal
        open={open}
        onClose={() => setOpen(false)}
        media={{ ...meditation.media, url: previewUrl }}
      />
    </Fragment>
  );
}
