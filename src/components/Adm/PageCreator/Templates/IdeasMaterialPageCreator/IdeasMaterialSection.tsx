import { useState, useEffect } from 'react';
import { Box, TextField, Typography, Tabs, Tab } from '@mui/material';
import { IdeasSection } from 'store/slices/ideas/ideasSlice';
import { IdeasMaterialDocuments } from './IdeasMaterialDocuments';
import { IdeasMaterialImages } from './IdeasMaterialImages';
import { IdeasMaterialVideos } from './IdeasMaterialVideos';
import { MediaItem, MediaType } from 'store/slices/types';

interface IdeasMaterialSectionProps {
  section: IdeasSection;
  onUpdate: (updatedSection: IdeasSection) => void;
  isCreationMode?: boolean;
}

export function IdeasMaterialSection({ section, onUpdate, isCreationMode = false }: IdeasMaterialSectionProps) {
  const [title, setTitle] = useState(section.title || '');
  const [description, setDescription] = useState(section.description || '');
  const [medias, setMedias] = useState<MediaItem[]>(section.medias || []);
  const [tabIndex, setTabIndex] = useState(0);

  useEffect(() => {
    setTitle(section.title || '');
    setDescription(section.description || '');
    setMedias(section.medias || []);
  }, [section]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    onUpdate({ ...section, title: newTitle, description, medias });
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDescription = e.target.value;
    setDescription(newDescription);
    onUpdate({ ...section, title, description: newDescription, medias });
  };

  const handleMediasChange = (newMedias: MediaItem[]) => {
    setMedias(newMedias);
    onUpdate({ ...section, title, description, medias: newMedias });
  };

  const handleChangeTab = (event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  const documents = medias.filter((i) => i.mediaType === MediaType.DOCUMENT);
  const images = medias.filter((i) => i.mediaType === MediaType.IMAGE);
  const videos = medias.filter((i) => i.mediaType === MediaType.VIDEO);

  return (
    <Box sx={{
      p: 0,
      '& .MuiTextField-root': {
        '& .MuiOutlinedInput-root': {
          borderRadius: '12px',
        },
      },
    }}>
      <Box sx={{
        display: 'flex',
        gap: 3,
        mb: 4,
        flexDirection: { xs: 'column', md: 'row' }
      }}>
        <TextField
          label={isCreationMode ? "Título da sua ideia brilhante" : "Título da Seção"}
          fullWidth
          value={title}
          onChange={handleTitleChange}
          sx={{
            flex: { xs: 1, md: '0 0 40%' },
            maxWidth: { xs: '100%', md: '40%' },
            '& .MuiInputLabel-root': {
              fontSize: { xs: '0.9rem', md: '1rem' },
              fontWeight: 500,
            },
          }}
        />
        <TextField
          label={isCreationMode ? "Descreva sua ideia (brincadeira, versículo, história, etc.)" : "Descrição da Seção"}
          fullWidth
          multiline
          rows={4}
          value={description}
          onChange={handleDescriptionChange}
          sx={{
            flex: { xs: 1, md: '0 0 60%' },
            maxWidth: { xs: '100%', md: '60%' },
            '& .MuiInputLabel-root': {
              fontSize: { xs: '0.9rem', md: '1rem' },
              fontWeight: 500,
            },
          }}
        />
      </Box>

      <Typography
        variant="h5"
        sx={{
          mb: 3,
          fontWeight: 'bold',
          color: 'primary.main',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          fontSize: { xs: '1.1rem', sm: '1.2rem', md: '1.5rem' },
        }}
      >
        📎 Itens de Mídia
      </Typography>

      <Tabs
        value={tabIndex}
        onChange={handleChangeTab}
        variant="fullWidth"
        scrollButtons="auto"
        sx={{
          mb: 3,
          '& .MuiTab-root': {
            fontSize: { xs: '0.75rem', md: '1rem' },
            fontWeight: 500,
            textTransform: 'none',
            minHeight: { xs: 40, md: 48 },
            px: { xs: 0.5, md: 3 },
            flex: { xs: 'none', md: 1 },
          },
          '& .Mui-selected': {
            color: 'primary.main',
            fontWeight: 'bold',
          },
        }}
      >
        <Tab label="📄 Documentos" />
        <Tab label="🖼️ Imagens" />
        <Tab label="🎥 Vídeos" />
      </Tabs>

      {tabIndex === 0 && (
        <IdeasMaterialDocuments
          documents={documents}
          setDocuments={(docs) => {
            const otherMedias = medias.filter((i) => i.mediaType !== MediaType.DOCUMENT);
            handleMediasChange([...otherMedias, ...docs]);
          }}
          ideaTitle={title}
        />
      )}
      {tabIndex === 1 && (
        <IdeasMaterialImages
          images={images}
          setImages={(imgs) => {
            const otherMedias = medias.filter((i) => i.mediaType !== MediaType.IMAGE);
            handleMediasChange([...otherMedias, ...imgs]);
          }}
          ideaTitle={title}
        />
      )}
      {tabIndex === 2 && (
        <IdeasMaterialVideos
          videos={videos}
          setVideos={(vids) => {
            const otherMedias = medias.filter((i) => i.mediaType !== MediaType.VIDEO);
            handleMediasChange([...otherMedias, ...vids]);
          }}
          ideaTitle={title}
        />
      )}
    </Box>
  );
}
