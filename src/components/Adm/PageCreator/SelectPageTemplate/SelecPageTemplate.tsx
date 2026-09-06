import { useCallback, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  Box,
  Button,
  Divider,
  Fade,
  Paper,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';

import BackHeader from '@/components/common/header/BackHeader';
import { clearImageData } from '@/store/slices/image/imageSlice';

import PageTemplateCard from './PageTemplateCard';
import { PAGE_TEMPLATES } from './constants';
import { PageTemplateId } from './types';

/**
 * Escolha do modelo de página. A grade de modelos dá lugar ao criador do modelo
 * selecionado na mesma rota, com um cabeçalho que permite voltar para a grade.
 */
export default function SelecPageTemplate() {
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [selectedId, setSelectedId] = useState<PageTemplateId | null>(null);

  const selectedTemplate = useMemo(
    () => PAGE_TEMPLATES.find((template) => template.id === selectedId) ?? null,
    [selectedId],
  );

  const handleSelect = useCallback(
    (id: PageTemplateId) => {
      // A galeria reaproveita o rascunho do store, que precisa começar vazio.
      if (id === PageTemplateId.GALLERY) {
        dispatch(clearImageData());
      }
      setSelectedId(id);
    },
    [dispatch],
  );

  const handleChangeTemplate = useCallback(() => setSelectedId(null), []);

  return (
    <Box data-testid="adm-page-creator-select-page-template-selec-page-template"
      component="main"
      sx={{
        minHeight: '100vh',
        px: { xs: 2, md: 4 },
        pb: { xs: 4, md: 6 },
        bgcolor: 'background.default',
      }}
    >
      <BackHeader title="Criador de Páginas" />

      {!selectedTemplate ? (
        <Fade in appear>
          <Box sx={{ maxWidth: 1100, mx: 'auto' }}>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mb: { xs: 2.5, md: 3.5 } }}
            >
              Escolha o modelo da página que você quer criar.
            </Typography>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, 1fr)',
                  md: 'repeat(3, 1fr)',
                },
                gap: { xs: 2, md: 2.5 },
              }}
            >
              {PAGE_TEMPLATES.map((template) => (
                <PageTemplateCard
                  key={template.id}
                  template={template}
                  onSelect={handleSelect}
                />
              ))}
            </Box>
          </Box>
        </Fade>
      ) : (
        <Fade in appear>
          <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
            <Paper
              variant="outlined"
              sx={{
                position: 'sticky',
                // O AdminLayout só monta a AppBar fixa abaixo de `md`; sem esse
                // deslocamento o cabeçalho gruda atrás dela no celular.
                top: { xs: 56, sm: 64, md: 0 },
                zIndex: 2,
                px: { xs: 2, md: 2.5 },
                py: { xs: 1.25, md: 1.5 },
                mb: { xs: 2, md: 3 },
                borderRadius: 2,
                bgcolor: 'background.paper',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 2,
                flexWrap: 'wrap',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                {selectedTemplate.icon}
                <Box>
                  <Typography variant="overline" color="text.secondary">
                    Novo conteúdo
                  </Typography>
                  <Typography variant="subtitle1" fontWeight={700} lineHeight={1.2}>
                    {selectedTemplate.title}
                  </Typography>
                </Box>
              </Box>

              <Button
                type="button"
                variant="outlined"
                size="medium"
                startIcon={<ArrowBack />}
                onClick={handleChangeTemplate}
                fullWidth={isMobile}
                sx={{ minHeight: 44, textTransform: 'none' }}
              >
                Trocar modelo
              </Button>
            </Paper>

            <Divider sx={{ mb: { xs: 2, md: 3 } }} />

            {selectedTemplate.render()}
          </Box>
        </Fade>
      )}
    </Box>
  );
}
