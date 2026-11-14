import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  DeleteOutline,
  DescriptionOutlined,
  ImageOutlined,
  MovieOutlined,
} from '@mui/icons-material';

import { IDEA_SHARE_ACCEPT_BY_KIND, IDEA_SHARE_MAX_MEDIAS } from '../../constants';
import {
  isValidYoutubeUrl,
  mediaTypeForIdeaMaterial,
  toIdeaUploadMedia,
  toIdeaYoutubeMedia,
  validateIdeaShareFile,
} from '../../share-utils';
import { IdeaMaterialKind, type IdeaShareMaterial } from '../../types';
import type { IdeasSectionDraft } from '../../types';
import { MediaPlatform, MediaType, MediaUploadType } from '@/store/slices/types';

interface IdeasSectionReviewMaterialsProps {
  medias: IdeasSectionDraft['medias'];
  onChange: (medias: IdeasSectionDraft['medias']) => void;
  disabled?: boolean;
}

const kinds = [IdeaMaterialKind.DOCUMENT, IdeaMaterialKind.IMAGE, IdeaMaterialKind.VIDEO] as const;

function kindForMedia(mediaType: MediaType): IdeaMaterialKind | null {
  if (mediaType === MediaType.DOCUMENT) return IdeaMaterialKind.DOCUMENT;
  if (mediaType === MediaType.IMAGE) return IdeaMaterialKind.IMAGE;
  if (mediaType === MediaType.VIDEO) return IdeaMaterialKind.VIDEO;
  return null;
}

function isLegacyMedia(media: IdeasSectionDraft['medias'][number]): boolean {
  if (media.uploadType !== MediaUploadType.LINK) return false;
  return media.mediaType !== MediaType.VIDEO || media.platformType !== MediaPlatform.YOUTUBE;
}

export default function IdeasSectionReviewMaterials({
  medias,
  onChange,
  disabled = false,
}: IdeasSectionReviewMaterialsProps) {
  const [selectedKind, setSelectedKind] = useState<IdeaMaterialKind>(IdeaMaterialKind.DOCUMENT);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const objectUrls = useRef(new Set<string>());

  useEffect(() => () => objectUrls.current.forEach((url) => URL.revokeObjectURL(url)), []);

  const addFiles = (files: FileList | File[]) => {
    const accepted: IdeasSectionDraft['medias'] = [];
    const issues: string[] = [];

    Array.from(files).forEach((file) => {
      const issue = validateIdeaShareFile(file, medias.length + accepted.length, selectedKind);
      if (issue) {
        issues.push(issue);
        return;
      }
      const material: IdeaShareMaterial | null = toIdeaUploadMedia(file, selectedKind);
      if (!material?.file) return;
      if (material.previewUrl) objectUrls.current.add(material.previewUrl);
      accepted.push({
        file: material.file,
        size: material.file.size,
        isLocalFile: true,
        originalName: material.name,
        title: '',
        description: '',
        mediaType: mediaTypeForIdeaMaterial(material.kind),
        uploadType: MediaUploadType.UPLOAD,
        url: material.previewUrl ?? '',
      });
    });

    if (accepted.length) onChange([...medias, ...accepted]);
    setError(issues.join(' '));
  };

  const addYoutube = () => {
    if (!isValidYoutubeUrl(youtubeUrl)) {
      setError('Informe um link válido de vídeo do YouTube.');
      return;
    }
    if (medias.length >= IDEA_SHARE_MAX_MEDIAS) {
      setError(`Você pode incluir até ${IDEA_SHARE_MAX_MEDIAS} materiais.`);
      return;
    }
    const material = toIdeaYoutubeMedia(youtubeUrl);
    if (!material?.url) return;
    onChange([
      ...medias,
      {
        title: '',
        description: '',
        mediaType: MediaType.VIDEO,
        uploadType: MediaUploadType.LINK,
        platformType: MediaPlatform.YOUTUBE,
        isLocalFile: false,
        url: material.url,
      },
    ]);
    setYoutubeUrl('');
    setError('');
  };

  const removeMedia = (index: number) => {
    const media = medias[index];
    if (media?.url.startsWith('blob:')) {
      URL.revokeObjectURL(media.url);
      objectUrls.current.delete(media.url);
    }
    onChange(medias.filter((_, position) => position !== index));
  };

  return (
    <Box data-testid="ideas-section-review-materials">
      <Stack spacing={2.5}>
        {medias.length === 0 ? (
          <Alert severity="info">Esta ideia ainda não tem materiais.</Alert>
        ) : (
          kinds.map((kind) => {
            const entries = medias
              .map((media, index) => ({ media, index }))
              .filter(({ media }) => kindForMedia(media.mediaType) === kind);
            if (!entries.length) return null;
            const label =
              kind === IdeaMaterialKind.DOCUMENT
                ? 'Documentos'
                : kind === IdeaMaterialKind.IMAGE
                  ? 'Imagens'
                  : 'Vídeos';
            return (
              <Box key={kind}>
                <Typography component="h3" variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
                  {label} ({entries.length})
                </Typography>
                <Stack spacing={1}>
                  {entries.map(({ media, index }) => {
                    const legacy = isLegacyMedia(media);
                    const name =
                      media.originalName ||
                      media.title ||
                      (media.mediaType === MediaType.VIDEO &&
                      media.platformType === MediaPlatform.YOUTUBE
                        ? 'Vídeo do YouTube'
                        : 'Arquivo');
                    return (
                      <Card
                        variant="outlined"
                        key={media.id ?? `${media.mediaType}-${index}`}
                        data-testid="ideas-section-review-media-item"
                      >
                        <CardContent
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            /*
                             * No celular o nome do arquivo some atrás das
                             * ações: com `wrap` elas descem para a segunda
                             * linha em vez de reduzir o nome a reticências.
                             */
                            flexWrap: 'wrap',
                            rowGap: 1,
                            gap: 1.5,
                            py: '12px !important',
                          }}
                        >
                          {kind === IdeaMaterialKind.DOCUMENT ? (
                            <DescriptionOutlined color="action" />
                          ) : kind === IdeaMaterialKind.IMAGE ? (
                            <ImageOutlined color="action" />
                          ) : (
                            <MovieOutlined color="action" />
                          )}
                          <Box sx={{ flex: '1 1 160px', minWidth: 0 }}>
                            <Typography title={name} sx={{ overflowWrap: 'anywhere' }}>
                              {name}
                            </Typography>
                            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                              <Typography variant="caption" color="text.secondary">
                                {media.file?.name
                                  ? 'Novo arquivo'
                                  : media.uploadType === MediaUploadType.LINK
                                    ? 'Link'
                                    : 'Arquivo enviado'}
                                {media.size
                                  ? ` · ${(media.size / (1024 * 1024)).toFixed(1)} MB`
                                  : ''}
                              </Typography>
                              {legacy && (
                                <Chip
                                  size="small"
                                  label="Formato antigo"
                                  color="warning"
                                  variant="outlined"
                                />
                              )}
                            </Stack>
                          </Box>
                          <Stack
                            direction="row"
                            alignItems="center"
                            spacing={0.5}
                            sx={{ ml: 'auto', flexShrink: 0 }}
                          >
                            {media.url && (
                              <Button
                                component="a"
                                href={media.url}
                                target="_blank"
                                rel="noreferrer"
                                size="small"
                                sx={{ minHeight: 44 }}
                              >
                                Visualizar
                              </Button>
                            )}
                            <Tooltip title={`Remover ${name}`}>
                              <IconButton
                                data-testid="ideas-section-review-media-remove"
                                aria-label={`Remover ${name}`}
                                disabled={disabled}
                                onClick={() => removeMedia(index)}
                                sx={{ minWidth: 44, minHeight: 44 }}
                              >
                                <DeleteOutline />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </CardContent>
                      </Card>
                    );
                  })}
                </Stack>
              </Box>
            );
          })
        )}

        <Box>
          <Typography component="h3" variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
            Adicionar material
          </Typography>
          <ToggleButtonGroup
            exclusive
            fullWidth
            value={selectedKind}
            aria-label="Tipo de arquivo"
            onChange={(_, kind: IdeaMaterialKind | null) => kind && setSelectedKind(kind)}
            sx={{ '& .MuiToggleButton-root': { minHeight: 48, textTransform: 'none' } }}
          >
            <ToggleButton value={IdeaMaterialKind.DOCUMENT}>Documento</ToggleButton>
            <ToggleButton value={IdeaMaterialKind.IMAGE}>Imagem</ToggleButton>
            <ToggleButton value={IdeaMaterialKind.VIDEO}>Vídeo</ToggleButton>
          </ToggleButtonGroup>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mt: 1.5 }}>
            <Button
              variant="outlined"
              onClick={() => inputRef.current?.click()}
              disabled={disabled || medias.length >= IDEA_SHARE_MAX_MEDIAS}
              sx={{ minHeight: 44, textTransform: 'none' }}
            >
              Escolher{' '}
              {selectedKind === IdeaMaterialKind.DOCUMENT
                ? 'documento'
                : selectedKind === IdeaMaterialKind.IMAGE
                  ? 'imagem'
                  : 'vídeo'}
            </Button>
            <input
              ref={inputRef}
              hidden
              type="file"
              multiple
              accept={IDEA_SHARE_ACCEPT_BY_KIND[selectedKind]}
              onChange={(event) => {
                addFiles(event.target.files ?? []);
                event.currentTarget.value = '';
              }}
            />
            {selectedKind === IdeaMaterialKind.VIDEO && (
              <>
                <TextField
                  fullWidth
                  size="small"
                  aria-label="Link do YouTube"
                  value={youtubeUrl}
                  onChange={(event) => setYoutubeUrl(event.target.value)}
                  placeholder="Link do YouTube"
                  inputProps={{ 'data-testid': 'ideas-section-review-youtube-url' }}
                />
                <Button
                  onClick={addYoutube}
                  disabled={disabled}
                  sx={{ minHeight: 44, textTransform: 'none' }}
                >
                  Adicionar vídeo do YouTube
                </Button>
              </>
            )}
          </Stack>
        </Box>
        {error && (
          <Alert severity="warning" data-testid="ideas-section-review-material-error">
            {error}
          </Alert>
        )}
      </Stack>
    </Box>
  );
}
