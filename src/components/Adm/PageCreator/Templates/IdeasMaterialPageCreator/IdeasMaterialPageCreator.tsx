import { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Paper,
  Snackbar,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from 'store/slices';
import { fetchRoutes } from 'store/slices/route/routeSlice';
import { clearIdeasData, IdeasSection } from 'store/slices/ideas/ideasSlice';
import api from 'config/axiosConfig';
import { IdeasMaterialSection } from './IdeasMaterialSection';
import { MediaUploadType } from 'store/slices/types';

interface PageCreatorProps {
  fromTemplatePage?: boolean;
}

export function IdeasMaterialPageCreator({ fromTemplatePage }: PageCreatorProps) {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const ideasData = useSelector((state: RootState) => state.ideas.ideasData);

  const [pageTitle, setPageTitle] = useState('');
  const [pageSubtitle, setPageSubtitle] = useState('');
  const [pageDescription, setPageDescription] = useState('');
  const [sections, setSections] = useState<IdeasSection[]>([]);
  const [expandedSectionIndex, setExpandedSectionIndex] = useState<number | null>(null);

  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  const [errors, setErrors] = useState({
    title: false,
    subtitle: false,
    description: false,
  });

  const [openDeleteSectionDialog, setOpenDeleteSectionDialog] = useState(false);
  const [sectionToDelete, setSectionToDelete] = useState<number | null>(null);

  useEffect(() => {
    if (fromTemplatePage) {
      dispatch(clearIdeasData());
      setPageTitle('');
      setPageSubtitle('');
      setPageDescription('');
      setSections([]);
    } else if (ideasData) {
      setPageTitle(ideasData.title || '');
      setPageSubtitle(ideasData.subtitle || '');
      setPageDescription(ideasData.description || '');
      setSections(ideasData.sections || []);
    }
  }, [fromTemplatePage, ideasData, dispatch]);

  const handleAddSection = () => {
    const newSection: IdeasSection = {
      title: '',
      description: '',
      medias: [],
    };
    setSections((prev) => [...prev, newSection]);
    setExpandedSectionIndex(sections.length);
  };

  const handleUpdateSection = (index: number, updatedSection: IdeasSection) => {
    setSections((prev) => prev.map((s, i) => (i === index ? updatedSection : s)));
  };

  const handleDeleteSectionClick = (index: number) => {
    setSectionToDelete(index);
    setOpenDeleteSectionDialog(true);
  };

  const confirmDeleteSection = () => {
    if (sectionToDelete !== null) {
      setSections((prev) => prev.filter((_, i) => i !== sectionToDelete));
      if (expandedSectionIndex === sectionToDelete) {
        setExpandedSectionIndex(null);
      }
      setSectionToDelete(null);
    }
    setOpenDeleteSectionDialog(false);
  };

  const handleSavePage = async () => {
    const hasError = !pageTitle || !pageSubtitle || !pageDescription || sections.length === 0;
    setErrors({
      title: !pageTitle,
      subtitle: !pageSubtitle,
      description: !pageDescription,
    });

    if (hasError) {
      setSnackbar({
        open: true,
        message: 'Preencha todos os campos obrigatórios e adicione pelo menos uma seção.',
        severity: 'error',
      });
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      const payload: any = {
        ...(fromTemplatePage ? {} : ideasData?.id ? { id: ideasData.id } : {}),
        title: pageTitle,
        subtitle: pageSubtitle,
        description: pageDescription,
        sections: sections.map((section, sectionIndex) => {
          const sectionPayload: any = {
            ...(fromTemplatePage ? {} : section.id ? { id: section.id } : {}),
            title: section.title,
            description: section.description,
            medias: section.medias.map((media, midiaIndex) => {
              const baseItem: any = {
                ...(fromTemplatePage ? {} : media.id ? { id: media.id } : {}),
                title: media.title,
                description: media.description,
                mediaType: media.mediaType,
                uploadType: media.uploadType,
                platformType: media.platformType,
                isLocalFile: media.uploadType === MediaUploadType.UPLOAD,
              };
              if (media.uploadType === MediaUploadType.UPLOAD && media.file) {
                const extension = media.file.name.split('.').pop() || 'bin';
                const fieldKey = `${media.mediaType}_${sectionIndex}_${midiaIndex}.${extension}`;
                formData.append(fieldKey, media.file, fieldKey);
                return { ...baseItem, fieldKey };
              } else {
                return { ...baseItem, url: media.url };
              }
            }),
          };
          return sectionPayload;
        }),
      };

      formData.append('ideasMaterialsPageData', JSON.stringify(payload));

      let res;
      if (fromTemplatePage) {
        res = await api.post('/ideas-pages', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        res = await api.patch(`/ideas-pages/${ideasData?.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      if (!res?.data) throw new Error('Erro ao salvar');

      setSnackbar({
        open: true,
        message: 'Página salva com sucesso!',
        severity: 'success',
      });

      await dispatch(fetchRoutes());
      navigate(`/${res.data.route.path}`);
      window.location.reload();

    } catch (err) {
      console.error('Erro ao salvar:', err);
      setSnackbar({
        open: true,
        message: 'Erro ao salvar a página.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 2, maxWidth: 1200, mx: 'auto', mt: fromTemplatePage ? 0 : 4 }}>
      <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 'bold' }}>
        {fromTemplatePage ? 'Nova Página de Ideias' : 'Editar Página de Ideias'}
      </Typography>

      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <TextField
          label="Título da Página"
          fullWidth
          value={pageTitle}
          onChange={(e) => setPageTitle(e.target.value)}
          error={errors.title}
          helperText={errors.title ? 'Campo obrigatório' : ''}
          sx={{ mb: 2 }}
        />
        <TextField
          label="Subtítulo da Página"
          fullWidth
          value={pageSubtitle}
          onChange={(e) => setPageSubtitle(e.target.value)}
          error={errors.subtitle}
          helperText={errors.subtitle ? 'Campo obrigatório' : ''}
          sx={{ mb: 2 }}
        />
        <TextField
          label="Descrição da Página"
          fullWidth
          multiline
          rows={4}
          value={pageDescription}
          onChange={(e) => setPageDescription(e.target.value)}
          error={errors.description}
          helperText={errors.description ? 'Campo obrigatório' : ''}
        />
      </Paper>

      {sections.length > 0 && (
        <>
          <Typography variant="h5" align="center" gutterBottom sx={{ fontWeight: 'bold' }}>
            Seções
          </Typography>

          {sections.map((section, index) => (
            <Accordion
              key={index}
              expanded={expandedSectionIndex === index}
              onChange={() =>
                setExpandedSectionIndex(expandedSectionIndex === index ? null : index)
              }
              sx={{ mb: 2, borderRadius: 2 }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6" sx={{ flexGrow: 1 }}>
                  {section.title || `Seção ${index + 1}`}
                </Typography>
                <IconButton
                  color="error"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteSectionClick(index);
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </AccordionSummary>
              <AccordionDetails>
                <IdeasMaterialSection
                  section={section}
                  onUpdate={(updatedSection) => handleUpdateSection(index, updatedSection)}
                />
              </AccordionDetails>
            </Accordion>
          ))}
        </>
      )}

      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={handleAddSection}
          sx={{ borderRadius: 20 }}
        >
          Adicionar Seção
        </Button>
      </Box>

      <Box sx={{ textAlign: 'center', mt: 6 }}>
        <Button
          variant="contained"
          size="large"
          onClick={handleSavePage}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
          sx={{ borderRadius: 20, px: 4 }}
        >
          {loading ? 'Salvando...' : 'Salvar Página'}
        </Button>
      </Box>

      <Dialog open={openDeleteSectionDialog} onClose={() => setOpenDeleteSectionDialog(false)}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja excluir esta seção? Esta ação não pode ser desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteSectionDialog(false)}>Cancelar</Button>
          <Button onClick={confirmDeleteSection} color="error">
            Excluir
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      >
        <Alert severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
