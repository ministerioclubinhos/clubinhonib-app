import {
  Box,
  Button,
  FormControl,
  Grid2,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { UploadFile } from '@mui/icons-material';

import { MediaPlatform, MediaUploadType } from '@/store/slices/types';

import { MeditationFormValues } from '../types';

interface MeditationMediaFieldProps {
  values: MeditationFormValues;
  onChange: <K extends keyof MeditationFormValues>(
    key: K,
    value: MeditationFormValues[K],
  ) => void;
  /** Nome do arquivo já salvo, exibido quando nenhum novo foi escolhido. */
  savedFileName?: string;
}

const PLATFORM_LABELS: Record<MediaPlatform, string> = {
  [MediaPlatform.YOUTUBE]: 'YouTube',
  [MediaPlatform.GOOGLE_DRIVE]: 'Google Drive',
  [MediaPlatform.ONEDRIVE]: 'OneDrive',
  [MediaPlatform.DROPBOX]: 'Dropbox',
  [MediaPlatform.ANY]: 'Outro',
};

const PLATFORM_OPTIONS = [
  MediaPlatform.GOOGLE_DRIVE,
  MediaPlatform.ONEDRIVE,
  MediaPlatform.DROPBOX,
  MediaPlatform.ANY,
];

/** Documento da meditação: link externo ou arquivo enviado. */
export default function MeditationMediaField({
  values,
  onChange,
  savedFileName,
}: MeditationMediaFieldProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const isLink = values.uploadType === MediaUploadType.LINK;
  const fileName = values.file?.name ?? savedFileName ?? '';

  return (
    <Grid2 container spacing={2}>
      <Grid2 size={{ xs: 12, sm: 6 }}>
        <FormControl fullWidth>
          <InputLabel id="meditation-upload-type">Tipo do material</InputLabel>
          <Select
            labelId="meditation-upload-type"
            label="Tipo do material"
            value={values.uploadType}
            onChange={(event) => {
              const uploadType = event.target.value as MediaUploadType;
              onChange('uploadType', uploadType);
              onChange('url', '');
              onChange('file', null);
            }}
          >
            <MenuItem value={MediaUploadType.LINK}>Link</MenuItem>
            <MenuItem value={MediaUploadType.UPLOAD}>Upload</MenuItem>
          </Select>
        </FormControl>
      </Grid2>

      {isLink && (
        <>
          <Grid2 size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth>
              <InputLabel id="meditation-platform">Plataforma</InputLabel>
              <Select
                labelId="meditation-platform"
                label="Plataforma"
                value={values.platformType}
                onChange={(event) =>
                  onChange('platformType', event.target.value as MediaPlatform)
                }
              >
                {PLATFORM_OPTIONS.map((platform) => (
                  <MenuItem key={platform} value={platform}>
                    {PLATFORM_LABELS[platform]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid2>

          <Grid2 size={12}>
            <TextField
              label="Link do documento"
              fullWidth
              required
              value={values.url}
              onChange={(event) => onChange('url', event.target.value)}
              helperText="Endereço do PDF ou documento da meditação"
            />
          </Grid2>
        </>
      )}

      {!isLink && (
        <Grid2 size={12}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            alignItems={{ xs: 'flex-start', sm: 'center' }}
          >
            <Button
              variant="outlined"
              component="label"
              startIcon={<UploadFile />}
              fullWidth={isMobile}
              sx={{ minHeight: 44, textTransform: 'none', flexShrink: 0 }}
            >
              Enviar documento
              <input
                type="file"
                hidden
                accept=".pdf,.doc,.docx"
                onChange={(event) =>
                  onChange('file', event.target.files?.[0] ?? null)
                }
              />
            </Button>

            <Box>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ wordBreak: 'break-all' }}
              >
                {fileName || 'Nenhum arquivo selecionado'}
              </Typography>
              {!values.file && savedFileName && (
                <Typography variant="caption" color="text.secondary">
                  Arquivo atual; escolha outro apenas se quiser substituí-lo.
                </Typography>
              )}
            </Box>
          </Stack>
        </Grid2>
      )}
    </Grid2>
  );
}
