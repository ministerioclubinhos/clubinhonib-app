import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { clearImageData } from '../../../../store/slices/image/imageSlice';

import {
  Box,
  Typography,
  Select,
  MenuItem,
  Paper,
  FormControl,
  InputLabel,
  SelectChangeEvent,
} from '@mui/material';
import { ReactElement } from 'react';
import VideoPageCreator from '../Templates/VideoPageCreator/VideoPageCreator';
import PhotoPageCreator from '../Templates/ImagePageCreator/ImagePageCreator';
import EventPageCreator from '../Templates/EventPageCreator/EventPageCreator';
import MeditationPageCreator from '../Templates/MeditationPageCreator/MeditationPageCreator';
import WeekMaterialPageCreator from '../Templates/WeekMaterialPageCreator/WeekMaterialPageCreator';
import { IdeasMaterialPageCreator } from '../Templates/IdeasMaterialPageCreator/IdeasMaterialPageCreator';

enum Options {
  WEEK_MATERIALS = 'Adicionar Materiais da Semana',
  MEDITATION = 'Adicionar meditação da Semana',
  GALLERY = 'Adicionar galeria de Fotos',
  VIDEOS = 'Adicionar galeria de Videos',
  IDEAS = 'Adicionar uma pagina de Ideias',
  EVENTS = 'Adicionar pagina de Eventos',
}

const componentMap: Record<keyof typeof Options, () => ReactElement> = {
  GALLERY: () => <PhotoPageCreator fromTemplatePage={true} />,
  VIDEOS: () => <VideoPageCreator fromTemplatePage={true} />,
  MEDITATION: () => <MeditationPageCreator fromTemplatePage={true} />,
  IDEAS: () => <IdeasMaterialPageCreator fromTemplatePage={true} />,
  WEEK_MATERIALS: () => <WeekMaterialPageCreator fromTemplatePage={true} />,
  EVENTS: () => <EventPageCreator />,
};

export default function SelecPageTemplate() {
  const [selectedOption, setSelectedOption] = useState<keyof typeof Options | ''>('');
  const dispatch = useDispatch();

  const handleChange = (event: SelectChangeEvent) => {
    const selected = event.target.value as keyof typeof Options;
    setSelectedOption(selected);

    if (selected === 'GALLERY') {
      dispatch(clearImageData());
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        px: { xs: 0, md: 0 },
        py: { xs: 0, md: 8 },
        mt: { xs: 0, md: 0 },
        mb: { xs: 0, md: 0 },
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        bgcolor: 'linear-gradient(to bottom, #f4f4f4, #e8e8e8)',
        textAlign: 'center',
      }}
    >
      <Typography
        variant="h4"
        fontWeight="bold"
        gutterBottom
        sx={{
          mt: { xs: 0, md: 0 },
          mb: { xs: 1, md: 3 },
          fontSize: { xs: '1.5rem', md: '2.4rem' },
        }}
      >
        Escolha um Modelo
      </Typography>

      <Typography
        variant="subtitle1"
        color="text.secondary"
        sx={{ mt: { xs: 0, md: 0 }, mb: { xs: 2, md: 3 }, fontSize: { xs: '1rem', md: '1.5rem' } }}
      >
        Selecione um modelo abaixo para visualizar e criar um novo conteúdo.
      </Typography>

      <FormControl sx={{ minWidth: 300, mb: 4 }} fullWidth>
        <InputLabel id="template-select-label">Selecione uma página</InputLabel>
        <Select
          labelId="template-select-label"
          value={selectedOption}
          onChange={handleChange}
          label="Selecione uma página"
        >
          <MenuItem value="">
            <em>Nenhuma</em>
          </MenuItem>
          {Object.entries(Options).map(([key, label]) => (
            <MenuItem key={key} value={key}>
              {label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Paper
        elevation={3}
        sx={{
          width: '95%',
          maxWidth: '95%',
          p: 1,
          mt: 2,
          transition: 'all 0.3s ease-in-out',
          opacity: selectedOption ? 1 : 0.5,
        }}
      >
        {selectedOption ? (
          componentMap[selectedOption as keyof typeof Options]()
        ) : (
          <Typography variant="body1" color="text.secondary">
            Selecione um template para visualizar.
          </Typography>
        )}
      </Paper>
    </Box>
  );
}
