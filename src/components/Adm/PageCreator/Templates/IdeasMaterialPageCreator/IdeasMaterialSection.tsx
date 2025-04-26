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
}

export function IdeasMaterialSection({ section, onUpdate }: IdeasMaterialSectionProps) {
  const [title, setTitle] = useState(section.title || '');
  const [description, setDescription] = useState(section.description || '');
  const [medias, setMedias] = useState<MediaItem[]>(section.medias || []);
  const [tabIndex, setTabIndex] = useState(0);

  useEffect(() => {
    onUpdate({ ...section, title, description, medias });
  }, [title, description, medias, onUpdate, section]);

  const handleChangeTab = (event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  const documents = medias.filter((i) => i.mediaType === MediaType.DOCUMENT);
  const images = medias.filter((i) => i.mediaType === MediaType.IMAGE);
  const videos = medias.filter((i) => i.mediaType === MediaType.VIDEO);

  return (
    <Box sx={{ p: 2 }}>
      <TextField
        label="Título da Seção"
        fullWidth
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        sx={{ mb: 2 }}
      />
      <TextField
        label="Descrição da Seção"
        fullWidth
        multiline
        rows={3}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        sx={{ mb: 3 }}
      />

      <Typography variant="h6" sx={{ mb: 2 }}>
        Itens de Mídia
      </Typography>

      <Tabs value={tabIndex} onChange={handleChangeTab} sx={{ mb: 2 }}>
        <Tab label="Documentos" />
        <Tab label="Imagens" />
        <Tab label="Vídeos" />
      </Tabs>

      {tabIndex === 0 && (
        <IdeasMaterialDocuments
          documents={documents}
          setDocuments={(docs) => {
            const otherMedias = medias.filter((i) => i.mediaType !== MediaType.DOCUMENT);
            setMedias([...otherMedias, ...docs]);
          }}
        />
      )}
      {tabIndex === 1 && (
        <IdeasMaterialImages
          images={images}
          setImages={(imgs) => {
            const otherMedias = medias.filter((i) => i.mediaType !== MediaType.IMAGE);
            setMedias([...otherMedias, ...imgs]);
          }}
        />
      )}
      {tabIndex === 2 && (
        <IdeasMaterialVideos
          videos={videos}
          setVideos={(vids) => {
            const otherMedias = medias.filter((i) => i.mediaType !== MediaType.VIDEO);
            setMedias([...otherMedias, ...vids]);
          }}
        />
      )}
    </Box>
  );
}
