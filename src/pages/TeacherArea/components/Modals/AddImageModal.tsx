import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Grid,
  Typography,
  Tabs,
  Tab,
  Box,
  Paper,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import LinkIcon from '@mui/icons-material/Link';
import { motion, AnimatePresence } from 'framer-motion';
import { MediaItem, MediaPlatform, MediaUploadType, MediaType } from 'store/slices/types';

interface AddImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (medias: MediaItem[]) => void;
}

export function AddImageModal({ isOpen, onClose, onSubmit }: AddImageModalProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [tab, setTab] = useState<MediaUploadType>(MediaUploadType.UPLOAD);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [urlInput, setUrlInput] = useState('');
  const [platformType, setPlatformType] = useState<MediaPlatform>(MediaPlatform.ANY);

  useEffect(() => {
    const objectUrls = files.map((file) => URL.createObjectURL(file));
    setPreviews(objectUrls);
    return () => objectUrls.forEach((url) => URL.revokeObjectURL(url));
  }, [files]);

  const reset = () => {
    setFiles([]);
    setPreviews([]);
    setUrlInput('');
    setPlatformType(MediaPlatform.ANY);
    setTab(MediaUploadType.UPLOAD);
  };

  const handleSubmit = () => {
    let medias: MediaItem[] = [];

    if (tab === MediaUploadType.UPLOAD && files.length > 0) {
      medias = files.map(
        (file) =>
          ({
            uploadType: MediaUploadType.UPLOAD,
            mediaType: MediaType.IMAGE,
            isLocalFile: true,
            url: '',
            file,
            originalName: file.name,
            size: file.size,
          }) as MediaItem
      );
    }

    if (tab === MediaUploadType.LINK && urlInput.trim()) {
      medias = urlInput.split(',').map(
        (url) =>
          ({
            uploadType: MediaUploadType.LINK,
            mediaType: MediaType.IMAGE,
            isLocalFile: false,
            url: url.trim(),
            platformType,
          }) as MediaItem
      );
    }

    if (medias.length > 0) {
      onSubmit(medias);
    }

    reset();
    onClose();
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      fullWidth
      maxWidth={isMobile ? 'sm' : 'md'}
      fullScreen={isMobile}
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: isMobile ? 0 : 3,
          background: 'linear-gradient(135deg, #f8f9ff 0%, #f0f2ff 100%)',
        },
      }}
    >
      <DialogTitle
        sx={{
          textAlign: 'center',
          pb: 1,
          background: 'linear-gradient(45deg, #667eea, #764ba2)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontSize: { xs: '1.2rem', md: '1.4rem' },
          fontWeight: 600,
        }}
      >
        📸 Adicionar Imagens
      </DialogTitle>

      <DialogContent sx={{ px: { xs: 2, md: 3 }, py: { xs: 2, md: 3 } }}>
        {/* Tabs com design moderno */}
        <Paper
          elevation={2}
          sx={{
            borderRadius: 2,
            mb: 3,
            overflow: 'hidden',
          }}
        >
          <Tabs
            value={tab}
            onChange={(_, newValue) => setTab(newValue)}
            variant={isMobile ? 'fullWidth' : 'standard'}
            centered={!isMobile}
            sx={{
              '& .MuiTab-root': {
                fontSize: { xs: '0.9rem', md: '1rem' },
                fontWeight: 600,
                textTransform: 'none',
                minHeight: { xs: 48, md: 40 },
              },
              '& .Mui-selected': {
                color: 'primary.main',
              },
              '& .MuiTabs-indicator': {
                height: 3,
                borderRadius: '3px 3px 0 0',
                background: 'linear-gradient(45deg, #667eea, #764ba2)',
              },
            }}
          >
            <Tab
              icon={<CloudUploadIcon />}
              iconPosition="start"
              label="Upload de Arquivos"
              value={MediaUploadType.UPLOAD}
              sx={{
                gap: 1,
                flexDirection: { xs: 'column', sm: 'row' },
                '& .MuiTab-iconWrapper': {
                  fontSize: { xs: '1.2rem', md: '1rem' },
                },
              }}
            />
            <Tab
              icon={<LinkIcon />}
              iconPosition="start"
              label="Links Externos"
              value={MediaUploadType.LINK}
              sx={{
                gap: 1,
                flexDirection: { xs: 'column', sm: 'row' },
                '& .MuiTab-iconWrapper': {
                  fontSize: { xs: '1.2rem', md: '1rem' },
                },
              }}
            />
          </Tabs>
        </Paper>

        <AnimatePresence mode="wait">
          {tab === MediaUploadType.UPLOAD && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <Paper
                elevation={1}
                sx={{
                  p: { xs: 2, md: 3 },
                  borderRadius: 3,
                  border: '2px dashed rgba(102, 126, 234, 0.3)',
                  background: 'rgba(255, 255, 255, 0.8)',
                  mb: 2,
                }}
              >
                <Button
                  variant="contained"
                  component="label"
                  fullWidth
                  size={isMobile ? 'medium' : 'large'}
                  startIcon={<CloudUploadIcon />}
                  sx={{
                    py: { xs: 2, md: 2.5 },
                    fontSize: { xs: '0.9rem', md: '1rem' },
                    fontWeight: 600,
                    borderRadius: 2,
                    background: 'linear-gradient(45deg, #667eea, #764ba2)',
                    boxShadow: '0 4px 16px rgba(102, 126, 234, 0.3)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #5a6fd8, #6a4190)',
                      boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
                    },
                  }}
                >
                  Selecionar Imagens do Dispositivo
                  <input
                    hidden
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      const selected = Array.from(e.target.files || []);
                      setFiles((prev) => [...prev, ...selected]);
                    }}
                  />
                </Button>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  textAlign="center"
                  sx={{ mt: 1, fontSize: { xs: '0.8rem', md: '0.9rem' } }}
                >
                  Formatos aceitos: JPG, PNG, GIF, WebP
                </Typography>
              </Paper>

              {files.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <Typography
                    variant="subtitle2"
                    fontWeight={600}
                    sx={{ mb: 2, color: 'primary.main' }}
                  >
                    📋 Imagens Selecionadas ({files.length})
                  </Typography>

                  <Grid container spacing={{ xs: 1, md: 2 }}>
                    {previews.map((preview, index) => (
                      <Grid item xs={6} sm={4} md={3} key={index}>
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                          <Box
                            sx={{
                              position: 'relative',
                              borderRadius: 2,
                              overflow: 'hidden',
                              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
                              '&:hover': {
                                transform: 'scale(1.02)',
                                transition: 'transform 0.2s ease',
                              },
                            }}
                          >
                            <img
                              src={preview}
                              alt={`Pré-visualização ${index + 1}`}
                              style={{
                                width: '100%',
                                height: 120,
                                objectFit: 'cover',
                              }}
                            />
                            <IconButton
                              onClick={() => setFiles(files.filter((_, i) => i !== index))}
                              sx={{
                                position: 'absolute',
                                top: 4,
                                right: 4,
                                bgcolor: 'rgba(255, 255, 255, 0.9)',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                width: 28,
                                height: 28,
                                '&:hover': {
                                  bgcolor: 'rgba(255, 255, 255, 1)',
                                  transform: 'scale(1.1)',
                                },
                                transition: 'all 0.2s ease',
                              }}
                              size="small"
                            >
                              <DeleteIcon color="error" fontSize="small" />
                            </IconButton>

                            {/* Nome do arquivo */}
                            <Box
                              sx={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                bgcolor: 'rgba(0, 0, 0, 0.7)',
                                color: 'white',
                                px: 1,
                                py: 0.5,
                              }}
                            >
                              <Typography
                                variant="caption"
                                sx={{
                                  fontSize: '0.7rem',
                                  fontWeight: 500,
                                  display: 'block',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {files[index].name}
                              </Typography>
                            </Box>
                          </Box>
                        </motion.div>
                      </Grid>
                    ))}
                  </Grid>
                </motion.div>
              )}
            </motion.div>
          )}

          {tab === MediaUploadType.LINK && (
            <motion.div
              key="link"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <Paper
                elevation={1}
                sx={{
                  p: { xs: 2, md: 3 },
                  borderRadius: 3,
                  background: 'rgba(255, 255, 255, 0.8)',
                }}
              >
                <Typography
                  variant="subtitle2"
                  fontWeight={600}
                  sx={{ mb: 2, color: 'primary.main' }}
                >
                  🔗 Configurações de Link
                </Typography>

                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Plataforma de Origem</InputLabel>
                  <Select
                    value={platformType}
                    label="Plataforma de Origem"
                    size={isMobile ? 'small' : 'medium'}
                    sx={{
                      borderRadius: 2,
                    }}
                    onChange={(e) => setPlatformType(e.target.value as MediaPlatform)}
                  >
                    <MenuItem value={MediaPlatform.ANY}>🌐 Outro</MenuItem>
                    <MenuItem value={MediaPlatform.GOOGLE_DRIVE}>📁 Google Drive</MenuItem>
                    <MenuItem value={MediaPlatform.ONEDRIVE}>☁️ OneDrive</MenuItem>
                    <MenuItem value={MediaPlatform.DROPBOX}>📦 Dropbox</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  label="URLs das Imagens"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="Cole as URLs aqui, separadas por vírgula..."
                  multiline
                  rows={isMobile ? 3 : 4}
                  size={isMobile ? 'small' : 'medium'}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                  helperText="Exemplo: https://exemplo1.com/imagem1.jpg, https://exemplo2.com/imagem2.png"
                />
              </Paper>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>

      <DialogActions
        sx={{
          px: { xs: 2, md: 3 },
          pb: { xs: 2, md: 3 },
          gap: 1,
        }}
      >
        <Button
          onClick={onClose}
          color="inherit"
          size={isMobile ? 'medium' : 'large'}
          sx={{
            borderRadius: 2,
            px: { xs: 3, md: 4 },
            fontWeight: 500,
          }}
        >
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={
            (tab === MediaUploadType.UPLOAD && files.length === 0) ||
            (tab === MediaUploadType.LINK && !urlInput.trim())
          }
          size={isMobile ? 'medium' : 'large'}
          sx={{
            borderRadius: 2,
            px: { xs: 3, md: 4 },
            fontWeight: 600,
            background: 'linear-gradient(45deg, #667eea, #764ba2)',
            boxShadow: '0 4px 16px rgba(102, 126, 234, 0.3)',
            '&:hover': {
              background: 'linear-gradient(45deg, #5a6fd8, #6a4190)',
              boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
            },
            '&:disabled': {
              background: 'rgba(0, 0, 0, 0.12)',
              boxShadow: 'none',
            },
          }}
        >
          ✅ Adicionar Imagens
        </Button>
      </DialogActions>
    </Dialog>
  );
}
