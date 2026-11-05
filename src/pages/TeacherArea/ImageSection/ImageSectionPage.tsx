import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { ArrowBack, CheckCircleOutline, SendOutlined } from '@mui/icons-material';
import {
  apiCreateImageSection,
  buildSectionFormData,
  buildSectionUpload,
  ClubinhoMediaEditor,
  validateClubinhoPublication,
} from '@/features/image-sections';
import type { SectionData } from '@/store/slices/image-section/imageSectionSlice';
import { extractErrorMessage } from '@/utils/apiError';

export default function ImageSectionPage() {
  const navigate = useNavigate();
  const [draft, setDraft] = useState<SectionData>({
    caption: '',
    description: '',
    public: false,
    mediaItems: [],
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const handleSave = async () => {
    if (isSaving) return;
    const validation = !draft.caption.trim()
      ? 'Preencha o título da publicação.'
      : !draft.description.trim()
        ? 'Conte um pouco sobre esse momento na descrição.'
        : validateClubinhoPublication(draft.mediaItems);
    if (validation) {
      setError(validation);
      return;
    }
    setIsSaving(true);
    setError('');
    try {
      const { payload, uploads } = buildSectionUpload({
        caption: draft.caption.trim(),
        description: draft.description.trim(),
        mediaItems: draft.mediaItems,
      });
      await apiCreateImageSection(buildSectionFormData(payload, uploads));
      setSubmitted(true);
      setDraft({ caption: '', description: '', public: false, mediaItems: [] });
    } catch (failure: unknown) {
      setError(
        extractErrorMessage(
          failure,
          'Não foi possível enviar. Seus arquivos continuam aqui para tentar novamente.'
        )
      );
    } finally {
      setIsSaving(false);
    }
  };
  return (
    <Box
      data-testid="teacher-area-image-section-image-section-page"
      sx={{ bgcolor: 'grey.50', minHeight: '100vh', py: { xs: 3, md: 5 } }}
    >
      <Container maxWidth="lg">
        <Button
          type="button"
          disabled={isSaving}
          startIcon={<ArrowBack />}
          onClick={() => navigate('/area-do-professor')}
          sx={{ minHeight: 44, mb: 2 }}
        >
          Área do professor
        </Button>
        <Typography variant="overline" color="success.main" display="block" fontWeight={700}>
          Momentos do Clubinho
        </Typography>
        <Typography
          component="h1"
          variant="h3"
          fontWeight={800}
          sx={{ fontSize: { xs: '1.8rem', md: '2.6rem' }, mb: 1 }}
        >
          Uma história para compartilhar.
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 4, maxWidth: 650 }}>
          Envie fotos ou um vídeo do seu Clubinho. Compartilhe as descobertas, a alegria e os
          encontros que merecem ser lembrados.
        </Typography>
        {submitted ? (
          <Paper
            data-testid="clubinho-upload-success"
            variant="outlined"
            sx={{ p: { xs: 3, md: 6 }, textAlign: 'center', borderRadius: 3 }}
          >
            <CheckCircleOutline color="success" sx={{ fontSize: 56 }} />
            <Typography component="h2" variant="h5" mt={2} fontWeight={700}>
              Seu momento foi enviado!
            </Typography>
            <Typography color="text.secondary" mt={1}>
              A equipe vai revisar sua publicação. Após a aprovação, ela aparecerá no feed com seu
              nome.
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="center" gap={2} mt={3}>
              <Button
                type="button"
                variant="contained"
                color="success"
                onClick={() => navigate('/feed-clubinho')}
                sx={{ minHeight: 44 }}
              >
                Ir para o feed
              </Button>
              <Button
                type="button"
                variant="outlined"
                onClick={() => setSubmitted(false)}
                sx={{ minHeight: 44 }}
              >
                Enviar outro momento
              </Button>
            </Stack>
          </Paper>
        ) : (
          <>
            <ClubinhoMediaEditor
              initialCaption={draft.caption}
              initialDescription={draft.description}
              initialIsPublic={false}
              initialMediaItems={draft.mediaItems}
              disabled={isSaving}
              onChange={(changes) => {
                setDraft((current) => ({ ...current, ...changes }));
                setError('');
              }}
            />
            {error && (
              <Alert data-testid="clubinho-upload-error" severity="error" sx={{ mt: 3 }}>
                {error}
              </Alert>
            )}
            <Paper variant="outlined" sx={{ p: 2.5, mt: 3, borderRadius: 3 }}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent="space-between"
                alignItems={{ xs: 'stretch', sm: 'center' }}
                gap={2}
              >
                <Typography variant="body2" color="text.secondary">
                  {isSaving
                    ? 'Enviando arquivos. Aguarde até a confirmação.'
                    : 'Tudo pronto? Envie seu registro para a equipe.'}
                </Typography>
                <Button
                  data-testid="clubinho-upload-submit"
                  type="button"
                  variant="contained"
                  color="success"
                  disabled={isSaving}
                  onClick={() => void handleSave()}
                  startIcon={
                    isSaving ? <CircularProgress size={18} color="inherit" /> : <SendOutlined />
                  }
                  sx={{ minHeight: 48, px: 3 }}
                >
                  {isSaving ? 'Enviando…' : 'Enviar para revisão'}
                </Button>
              </Stack>
            </Paper>
          </>
        )}
      </Container>
    </Box>
  );
}
