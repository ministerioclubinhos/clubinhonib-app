import React, { Fragment, useCallback } from 'react';
import {
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Paper,
  alpha,
  Chip,
} from '@mui/material';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import LinkIcon from '@mui/icons-material/Link';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import { MediaUploadType, MediaPlatform } from '../types';

export type ExistingMediaInfo =
  | { type: 'upload'; fileName: string }
  | { type: 'link'; url: string };

interface Props {
  uploadType: MediaUploadType;
  setUploadType: (v: MediaUploadType) => void;
  url: string;
  setUrl: (v: string) => void;
  platformType: MediaPlatform;
  setPlatformType: (v: MediaPlatform) => void;
  file: File | null;
  setFile: (f: File | null) => void;
  /** Quando está editando e já existe mídia vinculada (para mostrar que pode remover e trocar) */
  existingMedia?: ExistingMediaInfo | null;
}

const DocumentMediaForm: React.FC<Props> = ({
  uploadType,
  setUploadType,
  url,
  setUrl,
  platformType,
  setPlatformType,
  file,
  setFile,
  existingMedia,
}) => {
  const hasCurrentAttachment = existingMedia && !file;
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const f = e.dataTransfer.files?.[0];
      if (f && /\.(pdf|doc|docx)$/i.test(f.name)) setFile(f);
    },
    [setFile]
  );
  const handleDragOver = useCallback((e: React.DragEvent) => e.preventDefault(), []);

  return (
    <Fragment>
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth size="small" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}>
          <InputLabel>Tipo de upload</InputLabel>
          <Select
            value={uploadType}
            label="Tipo de upload"
            onChange={(e) => setUploadType(e.target.value as MediaUploadType)}
          >
            <MenuItem value={MediaUploadType.LINK}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LinkIcon fontSize="small" /> Link
              </Box>
            </MenuItem>
            <MenuItem value={MediaUploadType.UPLOAD}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CloudUploadOutlinedIcon fontSize="small" /> Upload
              </Box>
            </MenuItem>
          </Select>
        </FormControl>
      </Grid>

      {uploadType === MediaUploadType.LINK && (
        <Fragment>
          {hasCurrentAttachment && existingMedia?.type === 'link' && (
            <Grid item xs={12}>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  mb: 2,
                  borderRadius: 2,
                  borderColor: 'divider',
                  bgcolor: (t) => alpha(t.palette.primary.main, 0.06),
                  border: '1px solid',
                }}
              >
                <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ display: 'block', mb: 1 }}>
                  Link atual vinculado
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                  <LinkIcon sx={{ color: 'primary.main', fontSize: 28 }} />
                  <Typography variant="body2" fontWeight={500} color="text.primary" sx={{ wordBreak: 'break-all' }}>
                    {existingMedia.url}
                  </Typography>
                  <Chip label="Link" size="small" color="primary" variant="outlined" sx={{ borderRadius: 1 }} />
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                  Use &quot;Remover mídia&quot; acima para desvincular e poder adicionar outro link ou arquivo.
                </Typography>
              </Paper>
            </Grid>
          )}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="URL do documento"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              placeholder="https://..."
              size="small"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}>
              <InputLabel>Plataforma</InputLabel>
              <Select
                value={platformType}
                label="Plataforma"
                onChange={(e) => setPlatformType(e.target.value as MediaPlatform)}
              >
                <MenuItem value={MediaPlatform.GOOGLE_DRIVE}>Google Drive</MenuItem>
                <MenuItem value={MediaPlatform.ONEDRIVE}>OneDrive</MenuItem>
                <MenuItem value={MediaPlatform.DROPBOX}>Dropbox</MenuItem>
                <MenuItem value={MediaPlatform.ANY}>Outro</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Fragment>
      )}

      {uploadType === MediaUploadType.UPLOAD && (
        <Grid item xs={12}>
          {hasCurrentAttachment && existingMedia?.type === 'upload' && (
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                borderRadius: 2,
                borderColor: 'divider',
                bgcolor: (t) => alpha(t.palette.primary.main, 0.06),
                border: '1px solid',
              }}
            >
              <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ display: 'block', mb: 1 }}>
                Documento atual vinculado
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <DescriptionOutlinedIcon sx={{ color: 'primary.main', fontSize: 28 }} />
                <Typography variant="body2" fontWeight={600} color="text.primary">
                  {existingMedia.fileName}
                </Typography>
                <Chip label="Arquivo enviado" size="small" color="primary" variant="outlined" sx={{ borderRadius: 1 }} />
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                Use &quot;Remover mídia&quot; acima para desvincular e poder enviar outro arquivo.
              </Typography>
            </Paper>
          )}
          {existingMedia?.type !== 'upload' && (
            <Paper
              component="label"
              variant="outlined"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              sx={{
                display: 'block',
                p: 3,
                minHeight: 140,
                borderRadius: 2,
                border: '2px dashed',
                borderColor: file ? 'primary.main' : 'divider',
                bgcolor: file ? (t) => alpha(t.palette.primary.main, 0.06) : 'grey.50',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                overflow: 'visible',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: (t) => alpha(t.palette.primary.main, 0.08),
                },
              }}
            >
              <input
                type="file"
                hidden
                accept=".pdf,.doc,.docx"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  width: '100%',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                  <CloudUploadOutlinedIcon
                    sx={{
                      fontSize: 40,
                      color: file ? 'primary.main' : 'text.secondary',
                      flexShrink: 0,
                    }}
                  />
                </Box>
                <Typography variant="body2" color={file ? 'primary.main' : 'text.secondary'} fontWeight={600}>
                  {file ? file.name : 'Arraste um arquivo ou clique para selecionar'}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                  PDF, DOC ou DOCX
                </Typography>
              </Box>
            </Paper>
          )}
        </Grid>
      )}
    </Fragment>
  );
};

export default DocumentMediaForm;
