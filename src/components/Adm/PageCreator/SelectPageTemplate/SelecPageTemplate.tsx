import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { clearImageData } from '@/store/slices/image/imageSlice';
import {
  Box,
  Typography,
  Select,
  MenuItem,
  Paper,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  IconButton,
  Tooltip,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { ReactElement } from 'react';
import VideoPageCreator from '@/components/Adm/PageCreator/Templates/VideoPageCreator/VideoPageCreator';
import PhotoPageCreator from '@/components/Adm/PageCreator/Templates/ImagePageCreator/ImagePageCreator';
import MeditationPageCreator from '@/components/Adm/PageCreator/Templates/MeditationPageCreator/MeditationPageCreator';
import WeekMaterialPageCreator from '@/components/Adm/PageCreator/Templates/WeekMaterialPageCreator/WeekMaterialPageCreator';
import { IdeasMaterialPageCreator } from '@/components/Adm/PageCreator/Templates/IdeasMaterialPageCreator/IdeasMaterialPageCreator';
import BackHeader from '@/components/common/header/BackHeader';

enum Options {
  WEEK_MATERIALS = 'Adicionar Materiais da Semana',
  MEDITATION = 'Adicionar meditação da Semana',
  GALLERY = 'Adicionar galeria de Fotos',
  VIDEOS = 'Adicionar galeria de Videos',
  IDEAS = 'Adicionar pagina de Ideias',
}

const componentMap: Record<keyof typeof Options, () => ReactElement> = {
  GALLERY: () => <PhotoPageCreator fromTemplatePage={true} />,
  VIDEOS: () => <VideoPageCreator fromTemplatePage={true} />,
  MEDITATION: () => <MeditationPageCreator fromTemplatePage={true} />,
  IDEAS: () => <IdeasMaterialPageCreator fromTemplatePage={true} />,
  WEEK_MATERIALS: () => <WeekMaterialPageCreator fromTemplatePage={true} />,
};

export default function SelecPageTemplate() {
  const [selectedOption, setSelectedOption] = useState<keyof typeof Options | ''>('');
  const dispatch = useDispatch();

  const navigate = useNavigate();
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down('sm'));

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
        px: { xs: 2, md: 4 },
        pt: { xs: 0, md: 4 },
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        bgcolor: 'linear-gradient(to bottom, #f4f4f4, #e8e8e8)',
        textAlign: 'center',
        mt: 0,
        mb: 0,
      }}
    >
      <BackHeader title="Criador de Páginas" />

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
