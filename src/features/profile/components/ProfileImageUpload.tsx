import React, { useState, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { useDispatch } from 'react-redux';
import {
  Box,
  Button,
  Typography,
  Avatar,
  CircularProgress,
  Alert,
  Stack,
  Tooltip,
  Dialog,
  IconButton,
} from '@mui/material';
import { motion } from 'framer-motion';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import CameraswitchIcon from '@mui/icons-material/Cameraswitch';
import CloseIcon from '@mui/icons-material/Close';
import { apiUpdateProfileImage } from '../api';
import { fetchCurrentUser } from '@/store/slices/auth/authSlice';
import type { AppDispatch } from '@/store/slices';
import { extractErrorMessage } from '@/utils/apiError';

interface ProfileImageUploadProps {
  currentImageUrl?: string;
  onUpdate: () => void;
  onError: (error: string) => void;
}

const ProfileImageUpload: React.FC<ProfileImageUploadProps> = ({
  currentImageUrl,
  onUpdate,
  onError,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [cameraFacingMode, setCameraFacingMode] = useState<'environment' | 'user'>('environment');
  const [previewOpen, setPreviewOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const imageToShow = preview || currentImageUrl;
  const canPreview = !!imageToShow;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      onError('Por favor, selecione apenas arquivos de imagem');
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const detectDevice = () => {
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream;
    const isAndroid = /android/i.test(userAgent);
    const isMobile = isIOS || isAndroid;

    const isChrome = /Chrome/.test(userAgent) && /Google Inc/.test(navigator.vendor);
    const isSafari = /Safari/.test(userAgent) && !isChrome;
    const isFirefox = /Firefox/.test(userAgent);

    return { isIOS, isAndroid, isMobile, isChrome, isSafari, isFirefox };
  };

  const handleCameraClick = async () => {
    const device = detectDevice();

    if (device.isIOS && device.isSafari) {
      if (cameraInputRef.current) {
        cameraInputRef.current.setAttribute('capture', cameraFacingMode);
        cameraInputRef.current.click();
      }
      return;
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      if (cameraInputRef.current) {
        cameraInputRef.current.setAttribute('capture', cameraFacingMode);
        cameraInputRef.current.click();
      } else {
        onError('Seu navegador não suporta acesso à câmera. Tente usar a opção de selecionar da galeria.');
      }
      return;
    }

    try {
      const videoConstraints: MediaTrackConstraints = device.isMobile
        ? {
          facingMode: { ideal: cameraFacingMode },
          width: { ideal: 720 },
          height: { ideal: 1280 }
        }
        : {
          width: { ideal: 1280 },
          height: { ideal: 720 }
        };

      const stream = await navigator.mediaDevices.getUserMedia({
        video: videoConstraints,
        audio: false
      });
      let activeStream: MediaStream = stream;
      let activeFacingMode: 'environment' | 'user' = cameraFacingMode;
      let activeDeviceId: string | undefined =
        activeStream.getVideoTracks?.()?.[0]?.getSettings?.()?.deviceId;

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        stream.getTracks().forEach(track => track.stop());
        throw new Error('Não foi possível criar o contexto do canvas');
      }

      const modal = document.createElement('div');
      modal.id = 'camera-modal';
      modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.95);
        z-index: 9999;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 20px;
        padding: ${device.isMobile ? '12px' : '20px'};
        box-sizing: border-box;
      `;

      const videoWrapper = document.createElement('div');
      videoWrapper.style.cssText = `
        position: relative;
        width: ${device.isMobile ? 'min(96vw, 440px)' : 'min(92vw, 980px)'};
        aspect-ratio: ${device.isMobile ? '9 / 16' : '16 / 9'};
        border-radius: 16px;
        overflow: hidden;
        background: #000;
        box-shadow: 0 18px 60px rgba(0,0,0,0.55);
      `;

      const videoElement = document.createElement('video');
      videoElement.srcObject = stream;
      videoElement.style.cssText = `
        width: 100%;
        height: 100%;
        object-fit: cover;
        background: #000;
      `;
      videoElement.autoplay = true;
      videoElement.playsInline = true;
      videoElement.muted = true;

      if (device.isMobile) {
        videoElement.setAttribute('playsinline', 'true');
        videoElement.setAttribute('webkit-playsinline', 'true');
      }

      const buttonContainer = document.createElement('div');
      buttonContainer.style.cssText = `
        display: flex;
        gap: 15px;
        flex-wrap: wrap;
        justify-content: center;
        width: 100%;
        max-width: 500px;
      `;

      const captureButton = document.createElement('button');
      captureButton.type = 'button';
      captureButton.setAttribute('aria-label', 'Capturar foto');
      captureButton.style.cssText = `
        width: 80px;
        height: 80px;
        border-radius: 999px;
        border: 4px solid white;
        background: #1976d2;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: 0 4px 16px rgba(25, 118, 210, 0.4);
      `;
      const captureIconContainer = document.createElement('span');
      captureIconContainer.style.cssText = 'display: flex; align-items: center; justify-content: center;';
      captureButton.appendChild(captureIconContainer);
      createRoot(captureIconContainer).render(
        React.createElement(CameraAltIcon, { sx: { fontSize: 42, color: 'white' } })
      );


      const closeButton = document.createElement('button');
      closeButton.type = 'button';
      closeButton.setAttribute('aria-label', 'Fechar câmera');
      closeButton.style.cssText = `
        position: absolute;
        top: 16px;
        left: 16px;
        width: 72px;
        height: 72px;
        border-radius: 999px;
        border: 1.5px solid rgba(255,255,255,0.45);
        background: rgba(0,0,0,0.82);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        z-index: 7;
        backdrop-filter: blur(6px);
        -webkit-backdrop-filter: blur(6px);
        box-shadow: 0 12px 28px rgba(0,0,0,0.55);
      `;
      const closeIconContainer = document.createElement('span');
      closeIconContainer.style.cssText = 'display: flex; align-items: center; justify-content: center;';
      closeButton.appendChild(closeIconContainer);
      createRoot(closeIconContainer).render(
        React.createElement(CloseIcon, { sx: { fontSize: 42, color: 'white' } })
      );

      const switchCameraIconButton = document.createElement('button');
      switchCameraIconButton.type = 'button';
      switchCameraIconButton.setAttribute('aria-label', 'Trocar câmera');
      switchCameraIconButton.style.cssText = `
        position: absolute;
        top: 16px;
        right: 16px;
        width: 72px;
        height: 72px;
        border-radius: 999px;
        border: 1.5px solid rgba(255,255,255,0.45);
        background: rgba(0,0,0,0.82);
        color: white;
        display: ${device.isMobile ? 'flex' : 'none'};
        align-items: center;
        justify-content: center;
        cursor: pointer;
        z-index: 7;
        backdrop-filter: blur(6px);
        -webkit-backdrop-filter: blur(6px);
        box-shadow: 0 12px 28px rgba(0,0,0,0.55);
      `;
      const switchIconContainer = document.createElement('span');
      switchIconContainer.style.cssText = 'display: flex; align-items: center; justify-content: center;';
      switchCameraIconButton.appendChild(switchIconContainer);
      createRoot(switchIconContainer).render(
        React.createElement(CameraswitchIcon, { sx: { fontSize: 42, color: 'white' } })
      );

      const maskOverlay = document.createElement('div');
      maskOverlay.style.cssText = `
        position: absolute;
        inset: 0;
        pointer-events: none;
        z-index: 4;
      `;
      maskOverlay.innerHTML = `
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <!-- overlay suave para direcionar o olhar ao centro -->
          <rect x="0" y="0" width="100" height="100" fill="rgba(0,0,0,0.28)"></rect>

          <!-- Cabeça -->
          <circle cx="50" cy="32" r="13"
                  fill="transparent"
                  stroke="rgba(255,255,255,0.70)"
                  stroke-width="1.6"
                  vector-effect="non-scaling-stroke"></circle>

          <!-- Ombros (arco) -->
          <path d="M22 86 C26 66 38 58 50 58 C62 58 74 66 78 86"
                fill="transparent"
                stroke="rgba(255,255,255,0.55)"
                stroke-width="1.6"
                vector-effect="non-scaling-stroke"
                stroke-linecap="round"
                stroke-linejoin="round"></path>

          <!-- Linha base bem discreta (para sugerir o enquadramento) -->
          <path d="M20 92 H80"
                stroke="rgba(255,255,255,0.25)"
                stroke-width="1.2"
                vector-effect="non-scaling-stroke"
                stroke-linecap="round"></path>
        </svg>
      `;

      let videoReady = false;

      videoElement.addEventListener('loadedmetadata', () => {
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;
        videoReady = true;
      });

      const cleanup = () => {
        activeStream.getTracks().forEach(track => {
          track.stop();
        });
        const existingModal = document.getElementById('camera-modal');
        if (existingModal) {
          document.body.removeChild(existingModal);
        }
      };

      captureButton.onclick = () => {
        if (!videoReady) {
          onError('Aguarde a câmera carregar completamente');
          return;
        }

        try {
          ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
          canvas.toBlob((blob) => {
            if (blob) {
              const file = new File([blob], `camera-${Date.now()}.jpg`, { type: 'image/jpeg' });
              setSelectedFile(file);
              setPreview(URL.createObjectURL(blob));
            } else {
              onError('Erro ao processar a imagem');
            }
          }, 'image/jpeg', 0.9);

          cleanup();
        } catch {
          onError('Erro ao capturar a foto. Tente novamente.');
          cleanup();
        }
      };

      closeButton.onclick = () => {
        cleanup();
      };

      switchCameraIconButton.onclick = async () => {
        if (!device.isMobile) return;
        const nextFacingMode: 'environment' | 'user' = activeFacingMode === 'environment' ? 'user' : 'environment';
        try {
          activeStream.getTracks().forEach(track => track.stop());
          videoReady = false;

          let nextStream: MediaStream | null = null;
          if (navigator.mediaDevices?.enumerateDevices) {
            try {
              const devices = await navigator.mediaDevices.enumerateDevices();
              const videoInputs = devices.filter((d) => d.kind === 'videoinput');

              const wantFront = nextFacingMode === 'user';
              const frontRegex = /(front|user|facetime)/i;
              const backRegex = /(back|rear|environment)/i;

              const preferred = videoInputs.find((d) =>
                wantFront ? frontRegex.test(d.label) : backRegex.test(d.label)
              );

              const fallbackOther = videoInputs.find((d) => d.deviceId && d.deviceId !== activeDeviceId);
              const chosen = preferred ?? fallbackOther;

              if (chosen?.deviceId) {
                nextStream = await navigator.mediaDevices.getUserMedia({
                  video: {
                    deviceId: { exact: chosen.deviceId },
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                  },
                  audio: false,
                });
              }
            } catch {
            }
          }

          if (!nextStream) {
            const nextConstraints: MediaTrackConstraints = {
              facingMode: { ideal: nextFacingMode },
              width: { ideal: 1280 },
              height: { ideal: 720 },
            };
            nextStream = await navigator.mediaDevices.getUserMedia({
              video: nextConstraints,
              audio: false,
            });
          }

          activeStream = nextStream;
          activeFacingMode = nextFacingMode;
          setCameraFacingMode(nextFacingMode);
          activeDeviceId = activeStream.getVideoTracks?.()?.[0]?.getSettings?.()?.deviceId;
          videoElement.srcObject = activeStream;
        } catch {
          onError('Não foi possível trocar a câmera. Seu dispositivo pode não ter câmera frontal ou o navegador bloqueou.');
          try {
            const fallbackStream = await navigator.mediaDevices.getUserMedia({
              video: { facingMode: { ideal: activeFacingMode }, width: { ideal: 1280 }, height: { ideal: 720 } },
              audio: false,
            });
            activeStream = fallbackStream;
            activeDeviceId = activeStream.getVideoTracks?.()?.[0]?.getSettings?.()?.deviceId;
            videoElement.srcObject = activeStream;
          } catch {
            cleanup();
          }
        }
      };

      buttonContainer.appendChild(captureButton);

      videoWrapper.appendChild(videoElement);
      videoWrapper.appendChild(maskOverlay);
      videoWrapper.appendChild(closeButton);
      videoWrapper.appendChild(switchCameraIconButton);
      modal.appendChild(videoWrapper);
      modal.appendChild(buttonContainer);
      document.body.appendChild(modal);

      videoElement.onerror = () => {
        onError('Erro ao carregar a câmera. Tente novamente ou use a opção de selecionar da galeria.');
        cleanup();
      };

    } catch (err: any) {
      let errorMessage = 'Erro ao acessar a câmera. ';

      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMessage += 'Permissão negada. Por favor, permita o acesso à câmera nas configurações do navegador.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorMessage += 'Nenhuma câmera encontrada.';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        errorMessage += 'A câmera está sendo usada por outro aplicativo.';
      } else if (err.name === 'OverconstrainedError' || err.name === 'ConstraintNotSatisfiedError') {
        errorMessage += 'Configurações da câmera não suportadas.';
      } else {
        errorMessage += 'Tente usar a opção de selecionar da galeria.';
      }

      onError(errorMessage);

      if (cameraInputRef.current) {
        cameraInputRef.current.setAttribute('capture', cameraFacingMode);
        cameraInputRef.current.click();
      }
    }
  };

  const handleSubmit = async () => {
    setSuccess(false);
    onError('');

    if (!selectedFile) {
      onError('Por favor, selecione uma imagem');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('imageData', JSON.stringify({
        title: 'Foto de Perfil',
        description: 'Foto de perfil do usuário',
        uploadType: 'UPLOAD',
        isLocalFile: true,
      }));
      formData.append('file', selectedFile);

      const updatedProfile = await apiUpdateProfileImage(formData);
      setSuccess(true);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      if (cameraInputRef.current) {
        cameraInputRef.current.value = '';
      }

      try {
        await dispatch(fetchCurrentUser()).unwrap();
      } catch {
      }

      const newImage = updatedProfile.image || (updatedProfile.mediaItems && updatedProfile.mediaItems.length > 0 ? updatedProfile.mediaItems[0] : null);

      if (newImage?.url) {
        setPreview(newImage.url);
      }

      onUpdate();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: unknown) {
      const errorMessage = extractErrorMessage(err, 'Erro ao fazer upload da imagem');
      onError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Box sx={{ width: '100%' }}>
        <Box sx={{ mb: 3, textAlign: 'center' }}>
          <Tooltip title={canPreview ? 'Ver foto' : ''} arrow>
            <Avatar
              src={imageToShow}
              onClick={() => canPreview && setPreviewOpen(true)}
              sx={{
                width: { xs: 120, sm: 150, md: 180 },
                height: { xs: 120, sm: 150, md: 180 },
                fontSize: { xs: '3rem', md: '4rem' },
                bgcolor: 'primary.main',
                border: '4px solid white',
                boxShadow: '0 8px 24px rgba(25, 118, 210, 0.3)',
                mx: 'auto',
                mb: 2,
                cursor: canPreview ? 'pointer' : 'default',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': canPreview ? {
                  transform: 'scale(1.05)',
                  boxShadow: '0 12px 32px rgba(25, 118, 210, 0.4)',
                } : {},
              }}
            >
              {!imageToShow && 'U'}
            </Avatar>
          </Tooltip>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Sua foto de perfil será exibida em todo o sistema
          </Typography>
        </Box>

        <Box sx={{ mb: 3 }}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          <Stack spacing={2}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<CloudUploadIcon />}
              onClick={() => {
                fileInputRef.current?.click();
              }}
              sx={{
                py: 1.5,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                borderColor: 'primary.main',
                color: 'primary.main',
                '&:hover': {
                  borderColor: 'primary.dark',
                  backgroundColor: 'rgba(25, 118, 210, 0.04)',
                },
              }}
            >
              Selecionar da Galeria
            </Button>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<CameraAltIcon />}
              onClick={handleCameraClick}
              sx={{
                py: 1.5,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                borderColor: 'primary.main',
                color: 'primary.main',
                '&:hover': {
                  borderColor: 'primary.dark',
                  backgroundColor: 'rgba(25, 118, 210, 0.04)',
                },
              }}
            >
              Abrir Câmera
            </Button>
          </Stack>
          {selectedFile && (
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                Arquivo selecionado: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
              </Typography>
              <Button
                variant="text"
                size="small"
                onClick={() => {
                  setSelectedFile(null);
                  setPreview(currentImageUrl || null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                  if (cameraInputRef.current) {
                    cameraInputRef.current.value = '';
                  }
                }}
                sx={{
                  textTransform: 'none',
                  color: 'primary.main',
                  fontSize: '0.75rem',
                }}
              >
                Remover e escolher outra
              </Button>
            </Box>
          )}
        </Box>

        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(false)}>
            Imagem atualizada com sucesso!
          </Alert>
        )}

        <Box sx={{ display: 'flex', justifyContent: { xs: 'center', sm: 'flex-end' } }}>
          <Button
            variant="contained"
            fullWidth
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedFile}
            startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <PhotoCameraIcon />}
            sx={{
              maxWidth: { xs: '100%', sm: 200 },
              py: 1.5,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
              boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',
                boxShadow: '0 6px 20px rgba(25, 118, 210, 0.4)',
              },
              '&:disabled': {
                background: 'rgba(0, 0, 0, 0.12)',
                color: 'rgba(0, 0, 0, 0.26)',
              },
            }}
          >
            {isSubmitting ? 'Enviando...' : 'Enviar Foto'}
          </Button>
        </Box>
      </Box>

      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth="md"
        slotProps={{
          paper: {
            sx: {
              bgcolor: 'transparent',
              boxShadow: 'none',
              overflow: 'visible',
            },
          },
        }}
      >
        <Box sx={{ position: 'relative' }}>
          <IconButton
            onClick={() => setPreviewOpen(false)}
            sx={{
              position: 'absolute',
              top: -20,
              right: -20,
              bgcolor: 'rgba(0,0,0,0.7)',
              color: 'white',
              '&:hover': {
                bgcolor: 'rgba(0,0,0,0.85)',
              },
              zIndex: 1,
            }}
          >
            <CloseIcon />
          </IconButton>
          <Box
            component="img"
            src={imageToShow || ''}
            alt="Foto de perfil ampliada"
            sx={{
              maxWidth: '90vw',
              maxHeight: '80vh',
              borderRadius: 2,
              objectFit: 'contain',
            }}
          />
        </Box>
      </Dialog>
    </motion.div>
  );
};

export default ProfileImageUpload;
