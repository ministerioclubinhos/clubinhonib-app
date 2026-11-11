import {
  Alert,
  Box,
  Button,
  CardContent,
  CircularProgress,
  Container,
  Divider,
  LinearProgress,
  Paper,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import {
  ArrowBackRounded,
  CheckCircleOutline,
  CloudUploadOutlined,
  DescriptionOutlined,
  ImageOutlined,
  MovieOutlined,
} from '@mui/icons-material';
import { STICKY_ACTION_BAR_Z_INDEX } from '@/constants/app';
import { IDEA_SHARE_ACCEPT_BY_KIND, IDEA_SHARE_MAX_MEDIAS } from '../../constants';
import { IdeaMaterialKind } from '../../types';
import { useIdeaShareForm } from '../../useIdeaShareForm';
import IdeaShareMaterials from './IdeaShareMaterials';
import { summarizeIdeaMaterials } from '../../share-utils';

export function IdeaShareForm() {
  const {
    navigate,
    automaticAi,
    materials,
    removed,
    youtubeUrl,
    setYoutubeUrl,
    selectedKind,
    setSelectedKind,
    alert,
    setAlert,
    share,
    progress,
    apiError,
    register,
    errors,
    values,
    addFiles,
    addYoutube,
    onSubmit,
    resetForm,
    removeMaterial,
    undoRemove,
  } = useIdeaShareForm();

  if (share.isSuccess)
    return (
      <Box
        data-testid="idea-share-success"
        sx={{ bgcolor: 'grey.50', minHeight: '100vh', py: { xs: 3, md: 5 } }}
      >
        <Container maxWidth={false} sx={{ width: { xs: '98%', md: '95%' }, px: '0 !important' }}>
          <Paper
            variant="outlined"
            sx={{ p: { xs: 3, md: 6 }, textAlign: 'center', borderRadius: 3 }}
          >
            <CardContent>
              <Stack spacing={2}>
                <CheckCircleOutline color="success" sx={{ fontSize: 56, alignSelf: 'center' }} />
                <Typography variant="h4" component="h1" fontWeight={700}>
                  Ideia recebida!
                </Typography>
                <Typography role="status">
                  Sua ideia foi salva e enviada para a equipe revisar. Você já pode sair desta
                  página.
                </Typography>
                {automaticAi && (
                  <Alert severity="info" data-testid="idea-share-ai-background">
                    A IA trabalhará na melhoria em segundo plano. Você não precisa aguardar; a
                    coordenação revisará o resultado.
                  </Alert>
                )}
                <Typography color="text.secondary">
                  A equipe poderá preparar o conteúdo para publicação. O vídeo enviado não será
                  alterado.
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                  <Button
                    data-testid="idea-share-success-new-idea"
                    variant="contained"
                    color="success"
                    onClick={resetForm}
                  >
                    Compartilhar outra ideia
                  </Button>
                  <Button
                    data-testid="idea-share-success-back"
                    onClick={() => navigate('/area-do-professor')}
                  >
                    Voltar à área do professor
                  </Button>
                </Stack>
              </Stack>
            </CardContent>
          </Paper>
        </Container>
      </Box>
    );

  return (
    <Box
      component="form"
      onSubmit={onSubmit}
      data-testid="idea-share-form"
      sx={{ bgcolor: 'grey.50', minHeight: '100vh', pt: { xs: 2, md: 3 }, pb: { xs: 17, md: 3 } }}
    >
      <Container maxWidth={false} sx={{ width: { xs: '98%', md: '95%' }, px: '0 !important' }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'minmax(0, 1fr)',
              md: 'minmax(0, 0.9fr) minmax(0, 1.1fr)',
            },
            alignItems: 'start',
            gap: { xs: 2, md: 3 },
          }}
        >
          <Box sx={{ gridColumn: '1 / -1' }}>
            <Button
              type="button"
              startIcon={<ArrowBackRounded />}
              onClick={() => navigate('/area-do-professor')}
              sx={{ mb: 2, minHeight: 44, textTransform: 'none' }}
            >
              Área do professor
            </Button>
            <Typography variant="overline" color="success.main" display="block" fontWeight={700}>
              COMPARTILHAR IDEIA
            </Typography>
            <Typography
              variant="h3"
              component="h1"
              fontWeight={800}
              sx={{ fontSize: { xs: '1.9rem', md: '2.6rem' }, mb: 1 }}
            >
              Uma ideia pode inspirar muitas outras.
            </Typography>
            <Typography color="text.secondary" sx={{ maxWidth: 660 }}>
              Conte como funciona e envie os materiais. A coordenação revisa sua ideia antes de
              publicá-la.
            </Typography>
          </Box>
          <Paper variant="outlined" sx={{ borderRadius: 3, minWidth: 0 }}>
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="h6" component="h2" fontWeight={700}>
                  1. Sobre a ideia
                </Typography>
                <TextField
                  fullWidth
                  label="Título da ideia"
                  placeholder="Ex.: Gincana do Bom Pastor"
                  inputProps={{ 'data-testid': 'idea-share-title', maxLength: 120 }}
                  {...register('title')}
                  disabled={share.isSubmitting}
                  error={Boolean(errors.title)}
                  helperText={errors.title?.message ?? `${values.title.length}/120`}
                />
                <TextField
                  label="Descreva sua ideia"
                  multiline
                  fullWidth
                  minRows={5}
                  placeholder="Conte o passo a passo, os materiais usados e para qual faixa etária é indicada."
                  inputProps={{ 'data-testid': 'idea-share-description', maxLength: 2000 }}
                  {...register('description')}
                  disabled={share.isSubmitting}
                  error={Boolean(errors.description)}
                  helperText={errors.description?.message ?? `${values.description.length}/2000`}
                />
              </Stack>
            </CardContent>
          </Paper>
          <Paper variant="outlined" sx={{ borderRadius: 3, minWidth: 0 }}>
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="h6" component="h2" fontWeight={700}>
                  2. Materiais{' '}
                  <Typography component="span" variant="body2" color="text.secondary">
                    ({materials.length}/{IDEA_SHARE_MAX_MEDIAS})
                  </Typography>
                </Typography>
                <Typography id="idea-share-file-help" variant="body2" color="text.secondary">
                  Documentos PDF, DOC ou DOCX (até 20 MB), imagens JPG, PNG, WEBP ou GIF (até 10 MB)
                  e vídeos MP4 ou WEBM (até 100 MB).
                </Typography>
                <Box>
                  <Typography component="h3" variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
                    O que você vai adicionar?
                  </Typography>
                  <ToggleButtonGroup
                    exclusive
                    disabled={share.isSubmitting}
                    fullWidth
                    value={selectedKind}
                    aria-label="Tipo de arquivo que será enviado"
                    onChange={(_, nextKind: IdeaMaterialKind | null) => {
                      if (nextKind) {
                        setSelectedKind(nextKind);
                        setAlert('');
                      }
                    }}
                    sx={{
                      '& .MuiToggleButton-root': {
                        minHeight: 60,
                        flexDirection: { xs: 'column', sm: 'row' },
                        gap: 0.75,
                        textTransform: 'none',
                      },
                    }}
                  >
                    <ToggleButton
                      data-testid="idea-share-kind-document"
                      value={IdeaMaterialKind.DOCUMENT}
                    >
                      <DescriptionOutlined /> Documento
                    </ToggleButton>
                    <ToggleButton
                      data-testid="idea-share-kind-image"
                      value={IdeaMaterialKind.IMAGE}
                    >
                      <ImageOutlined /> Imagem
                    </ToggleButton>
                    <ToggleButton
                      data-testid="idea-share-kind-video"
                      value={IdeaMaterialKind.VIDEO}
                    >
                      <MovieOutlined /> Vídeo
                    </ToggleButton>
                  </ToggleButtonGroup>
                </Box>
                <Box
                  data-testid="idea-share-dropzone-button"
                  aria-describedby="idea-share-file-help"
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => {
                    event.preventDefault();
                    if (!share.isSubmitting) addFiles(event.dataTransfer.files);
                  }}
                  sx={{
                    border: '2px dashed',
                    borderColor: 'divider',
                    borderRadius: 3,
                    textAlign: 'center',
                    p: { xs: 2.5, md: 4 },
                    bgcolor: 'action.hover',
                  }}
                >
                  <CloudUploadOutlined color="success" sx={{ fontSize: 42, mb: 1 }} />
                  <Typography fontWeight={700}>Seus materiais ajudam a dar vida à ideia</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>
                    {selectedKind === IdeaMaterialKind.DOCUMENT
                      ? 'PDF, DOC ou DOCX · até 20 MB'
                      : selectedKind === IdeaMaterialKind.IMAGE
                        ? 'JPG, PNG, WEBP ou GIF · até 10 MB'
                        : 'MP4 ou WEBM · até 100 MB'}
                    <br />
                    Arraste para cá ou escolha no dispositivo.
                  </Typography>
                  <Button
                    component="label"
                    variant="outlined"
                    disabled={share.isSubmitting}
                    color="success"
                    sx={{ minHeight: 44, textTransform: 'none' }}
                  >
                    Escolher arquivos
                    <input
                      hidden
                      multiple
                      type="file"
                      accept={IDEA_SHARE_ACCEPT_BY_KIND[selectedKind]}
                      data-testid="idea-share-dropzone-input"
                      onChange={(event) => {
                        addFiles(event.target.files);
                        event.currentTarget.value = '';
                      }}
                    />
                  </Button>
                </Box>
                {selectedKind === IdeaMaterialKind.VIDEO && (
                  <Box>
                    <Divider sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        ou use um vídeo do YouTube
                      </Typography>
                    </Divider>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                      <TextField
                        fullWidth
                        label="Link do YouTube"
                        placeholder="https://youtu.be/..."
                        value={youtubeUrl}
                        onChange={(event) => setYoutubeUrl(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') {
                            event.preventDefault();
                            addYoutube();
                          }
                        }}
                        inputProps={{ 'data-testid': 'idea-share-youtube-url-input' }}
                      />
                      <Button
                        type="button"
                        data-testid="idea-share-youtube-add"
                        onClick={addYoutube}
                        disabled={share.isSubmitting}
                        sx={{ minHeight: 48, whiteSpace: 'nowrap', textTransform: 'none' }}
                      >
                        Adicionar vídeo
                      </Button>
                    </Stack>
                  </Box>
                )}
                {alert && (
                  <Alert severity="warning" data-testid="idea-share-validation-alert">
                    {alert}
                  </Alert>
                )}
                <IdeaShareMaterials
                  materials={materials}
                  removed={removed}
                  disabled={share.isSubmitting}
                  onRemove={removeMaterial}
                  onUndo={undoRemove}
                />
              </Stack>
            </CardContent>
          </Paper>
          <Paper
            variant="outlined"
            sx={{ borderRadius: 3, p: { xs: 2, sm: 3 }, gridColumn: '1 / -1', minWidth: 0 }}
          >
            <Stack spacing={1.5}>
              <Typography variant="h6" component="h2" fontWeight={700}>
                3. Revisar e enviar
              </Typography>
              <Typography>
                {materials.length} de {IDEA_SHARE_MAX_MEDIAS} materiais adicionados
              </Typography>
              <Typography color="text.secondary">{summarizeIdeaMaterials(materials)}</Typography>
              <Typography color="text.secondary">
                A coordenação revisará sua ideia antes de publicá-la. Textos, documentos e imagens
                poderão ser processados pelo provedor de IA configurado para melhorar a
                apresentação. O original será preservado e vídeos não serão processados.
              </Typography>
              <Divider sx={{ my: 1, display: { xs: 'none', md: 'block' } }} />
              {apiError && (
                <Alert
                  severity="error"
                  data-testid="idea-share-error-alert"
                  action={
                    <Button
                      type="button"
                      data-testid="idea-share-error-retry"
                      onClick={() => void onSubmit()}
                    >
                      Tentar novamente
                    </Button>
                  }
                >
                  {apiError}
                </Alert>
              )}
              {share.isSubmitting && (
                <Box data-testid="idea-share-progress">
                  <Typography>Enviando materiais… {progress}%</Typography>
                  <LinearProgress variant="determinate" value={progress} />
                </Box>
              )}
              <Stack
                data-testid="idea-share-submit-bar"
                sx={{
                  position: { xs: 'fixed', md: 'static' },
                  bottom: 0,
                  left: 0,
                  right: 0,
                  zIndex: STICKY_ACTION_BAR_Z_INDEX,
                  bgcolor: 'background.paper',
                  p: { xs: 2, md: 0 },
                  pb: { xs: 'max(16px, env(safe-area-inset-bottom))', md: 0 },
                  borderTop: { xs: 1, md: 0 },
                  borderColor: 'divider',
                }}
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent="space-between"
                alignItems={{ xs: 'stretch', sm: 'center' }}
                gap={2}
              >
                <Typography variant="body2" color="text.secondary">
                  {materials.length} materiais prontos para envio
                </Typography>
                <Button
                  data-testid="idea-share-submit"
                  type="submit"
                  variant="contained"
                  color="success"
                  size="large"
                  disabled={share.isSubmitting}
                  startIcon={
                    share.isSubmitting ? <CircularProgress size={18} color="inherit" /> : undefined
                  }
                  sx={{ minHeight: 48, px: 4, textTransform: 'none', fontWeight: 700 }}
                >
                  {share.isSubmitting ? 'Enviando…' : 'Enviar ideia para revisão'}
                </Button>
              </Stack>
            </Stack>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
}
