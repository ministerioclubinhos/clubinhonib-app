import React from 'react';
import { Grid, TextField, FormControl, InputLabel, Select, MenuItem, Button } from '@mui/material';
import { MediaUploadType, MediaPlatform } from 'store/slices/types';

interface Props {
  mediaTitle: string;
  setMediaTitle: (v: string) => void;
  mediaDescription: string;
  setMediaDescription: (v: string) => void;
  uploadType: MediaUploadType;
  setUploadType: (v: MediaUploadType) => void;
  url: string;
  setUrl: (v: string) => void;
  platformType: MediaPlatform;
  setPlatformType: (v: MediaPlatform) => void;
  file: File | null;
  setFile: (f: File | null) => void;
}

const DocumentMediaForm: React.FC<Props> = ({
  mediaTitle,
  setMediaTitle,
  mediaDescription,
  setMediaDescription,
  uploadType,
  setUploadType,
  url,
  setUrl,
  platformType,
  setPlatformType,
  file,
  setFile,
}) => {
  return (
    <>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Título da Mídia"
          value={mediaTitle}
          onChange={(e) => setMediaTitle(e.target.value)}
          required
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Descrição da Mídia"
          value={mediaDescription}
          onChange={(e) => setMediaDescription(e.target.value)}
          multiline
          rows={2}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth>
          <InputLabel>Tipo de Upload</InputLabel>
          <Select
            value={uploadType}
            label="Tipo de Upload"
            onChange={(e) => setUploadType(e.target.value as MediaUploadType)}
          >
            <MenuItem value={MediaUploadType.LINK}>Link</MenuItem>
            <MenuItem value={MediaUploadType.UPLOAD}>Upload</MenuItem>
          </Select>
        </FormControl>
      </Grid>

      {uploadType === MediaUploadType.LINK && (
        <>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="URL da Mídia"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
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
        </>
      )}

      {uploadType === MediaUploadType.UPLOAD && (
        <Grid item xs={12}>
          <Button component="label" variant="outlined" fullWidth>
            {file ? file.name : 'Selecionar Arquivo (PDF, DOC, DOCX)'}
            <input
              type="file"
              hidden
              accept=".pdf,.doc,.docx"
              onChange={(e) => {
                const selected = e.target.files?.[0] || null;
                setFile(selected);
              }}
            />
          </Button>
        </Grid>
      )}
    </>
  );
};

export default DocumentMediaForm;
