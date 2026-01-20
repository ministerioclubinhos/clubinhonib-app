import { useState, useEffect, useMemo, Fragment } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Paper,
  Snackbar,
  Alert,
  CircularProgress,
  IconButton,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from 'store/slices';
import { fetchRoutes } from 'store/slices/route/routeSlice';
import { clearIdeasData, IdeasSection } from 'store/slices/ideas/ideasSlice';
import api from '@/config/axiosConfig';
import { MediaUploadType } from 'store/slices/types';
import { ConfirmDeleteDialog } from './ConfirmDeleteDialog';
import { IdeasMaterialSection } from './IdeasMaterialSection';
import { GENERIC_ERROR_MESSAGES, FORM_VALIDATION_MESSAGES } from '@/constants/errorMessages';
import { FEATURE_SUCCESS_MESSAGES } from '@/constants/successMessages';

interface PageCreatorProps {
  fromTemplatePage?: boolean;
}

export function IdeasMaterialPageCreator({ fromTemplatePage }: PageCreatorProps) {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const ideasData = useSelector((state: RootState) => state.ideas.ideasData);

  const [pageTitle, setPageTitle] = useState('');
  const [pageDescription, setPageDescription] = useState('');
  const [sections, setSections] = useState<IdeasSection[]>([]);
  const [expandedSectionIndex, setExpandedSectionIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sectionToDelete, setSectionToDelete] = useState<number | null>(null);

  useEffect(() => {
    if (fromTemplatePage) {
      dispatch(clearIdeasData());
      setPageTitle('');
      setPageDescription('');
      setSections([]);
    } else if (ideasData) {
      setPageTitle(ideasData.title || '');
      setPageDescription(ideasData.description || '');
      setSections(ideasData.sections || []);
    }
  }, [fromTemplatePage, ideasData, dispatch]);

  const errors = useMemo(() => ({
    title: !pageTitle.trim(),
    description: !pageDescription.trim(),
    sections: sections.length === 0,
  }), [pageTitle, pageDescription, sections]);

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
    setDeleteDialogOpen(true);
  };

  const confirmDeleteSection = () => {
    if (sectionToDelete !== null) {
      setSections((prev) => prev.filter((_, i) => i !== sectionToDelete));
      if (expandedSectionIndex === sectionToDelete) {
        setExpandedSectionIndex(null);
      }
      setSectionToDelete(null);
    }
    setDeleteDialogOpen(false);
  };

  const handleSavePage = async () => {
    if (Object.values(errors).some(Boolean)) {
      setSnackbar({
        open: true,
        message: FORM_VALIDATION_MESSAGES.REQUIRED_GENERIC,
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
              }
              return { ...baseItem, url: media.url };
            }),
          };
          return sectionPayload;
        }),
      };

      formData.append('ideasMaterialsPageData', JSON.stringify(payload));

      const response = await (fromTemplatePage
        ? api.post('/ideas-pages', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
        : api.patch(`/ideas-pages/${ideasData?.id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }));

      if (!response?.data) throw new Error(GENERIC_ERROR_MESSAGES.SAVE_ERROR);

      setSnackbar({
        open: true,
        message: FEATURE_SUCCESS_MESSAGES.PAGE_SAVED,
        severity: 'success',
      });

      await dispatch(fetchRoutes());
      navigate(`/${response.data.route.path}`);
    } catch (error) {
      console.error('Erro ao salvar:', error);
      setSnackbar({
        open: true,
        message: GENERIC_ERROR_MESSAGES.SAVE_ERROR,
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        py: { xs: 0, md: 4 },
        px: { xs: 0, md: 4 },
        mt: { xs: 0, md: 4 },
        mb: { xs: 0, md: 0 },
      }}
    >
      <Typography
        variant="h4"
        align="center"
        gutterBottom
        sx={{
          mb: { xs: 4, md: 6 },
          fontWeight: 'bold',
          fontSize: { xs: '1.5rem', md: '2.5rem' },
        }}
      >
        {fromTemplatePage ? 'Nova Página de Ideias' : 'Editar Página de Ideias'}
      </Typography>

      <Paper elevation={2} sx={{ p: { xs: 1, md: 4 }, mx: { xs: 0, md: 4 }, mb: 4 }}>
        <TextField
          label="Título da Página"
          fullWidth
          value={pageTitle}
          onChange={(e) => setPageTitle(e.target.value)}
          error={errors.title}
          helperText={errors.title ? FORM_VALIDATION_MESSAGES.REQUIRED_FIELD : ''}
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
          helperText={errors.description ? FORM_VALIDATION_MESSAGES.REQUIRED_FIELD : ''}
        />
      </Paper>

      {sections.length > 0 && (
        <Fragment>
          <Typography variant="h5" align="center" gutterBottom sx={{ fontWeight: 'bold' }}>
            Seções
          </Typography>
          {sections.map((section, index) => (
            <Accordion
              key={index}
              expanded={expandedSectionIndex === index}
              onChange={() => setExpandedSectionIndex(expandedSectionIndex === index ? null : index)}
              sx={{ mb: 2, borderRadius: 2 }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6" sx={{ flexGrow: 1 }}>
                  {section.title || `Seção ${index + 1}`}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <IdeasMaterialSection
                  section={section}
                  onUpdate={(updatedSection) => handleUpdateSection(index, updatedSection)}
                />
              </AccordionDetails>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
                <IconButton
                  color="error"
                  onClick={() => handleDeleteSectionClick(index)}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Accordion>
          ))}
        </Fragment>
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

      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDeleteSection}
      />

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
