import { useState } from 'react';
import { Box, Typography, TextField, Button, Grid, IconButton } from '@mui/material';
import { Delete } from '@mui/icons-material';

interface InfoItem {
  title: string;
  content: string;
}

export default function InforamtivePageCreator() {
  const [pageTitle, setPageTitle] = useState('');
  const [pageDescription, setPageDescription] = useState('');
  const [infos, setInfos] = useState<InfoItem[]>([]);
  const [newInfo, setNewInfo] = useState<InfoItem>({ title: '', content: '' });

  const [errors, setErrors] = useState({
    pageTitle: false,
    pageDescription: false,
    newInfoTitle: false,
    newInfoContent: false,
  });

  const handleAddInfo = () => {
    const hasError = !newInfo.title || !newInfo.content;
    setErrors((prev) => ({
      ...prev,
      newInfoTitle: !newInfo.title,
      newInfoContent: !newInfo.content,
    }));
    if (hasError) return;

    setInfos([...infos, newInfo]);
    setNewInfo({ title: '', content: '' });
  };

  const handleRemoveInfo = (index: number) => {
    setInfos(infos.filter((_, i) => i !== index));
  };

  const handleSavePage = async () => {
    const hasError = !pageTitle || !pageDescription || infos.length === 0;
    setErrors((prev) => ({
      ...prev,
      pageTitle: !pageTitle,
      pageDescription: !pageDescription,
    }));
    if (hasError) return;

    const payload = {
      pageTitle,
      pageDescription,
      infos,
    };

    try {
      const res = await fetch('/informative-page', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Erro ao salvar página');
    } catch (err) {
      console.error('Erro ao salvar página', err);
    }
  };

  return (
    <Box sx={{ width: { xs: '95%', md: '100%' }, maxWidth: 1000, mx: 'auto', p: 0 }}>
      <Typography
        variant="h4"
        mb={3}
        fontWeight="bold"
        sx={{
          textAlign: 'center',
          fontSize: { xs: '1.6rem', sm: '2rem', md: '2.25rem' },
        }}
      >
        Criar Página Informativa
      </Typography>

      <Grid container spacing={2} mb={4}>
        <Grid item xs={12}>
          <TextField
            label="Título da Página"
            fullWidth
            value={pageTitle}
            onChange={(e) => setPageTitle(e.target.value)}
            error={errors.pageTitle}
            helperText={errors.pageTitle ? 'Campo obrigatório' : ''}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Descrição da Página"
            fullWidth
            multiline
            rows={3}
            value={pageDescription}
            onChange={(e) => setPageDescription(e.target.value)}
            error={errors.pageDescription}
            helperText={errors.pageDescription ? 'Campo obrigatório' : ''}
          />
        </Grid>
      </Grid>

      <Typography variant="h6" fontWeight="medium" mb={2}>
        Adicionar Informativo
      </Typography>

      <Grid container spacing={2} mb={4}>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Título da Notícia"
            fullWidth
            value={newInfo.title}
            onChange={(e) => setNewInfo((prev) => ({ ...prev, title: e.target.value }))}
            error={errors.newInfoTitle}
            helperText={errors.newInfoTitle ? 'Campo obrigatório' : ''}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Conteúdo da Notícia"
            fullWidth
            value={newInfo.content}
            onChange={(e) => setNewInfo((prev) => ({ ...prev, content: e.target.value }))}
            error={errors.newInfoContent}
            helperText={errors.newInfoContent ? 'Campo obrigatório' : ''}
          />
        </Grid>
        <Grid item xs={12}>
          <Button variant="contained" fullWidth onClick={handleAddInfo}>
            Adicionar Informativo
          </Button>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {infos.map((info, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Box border={1} borderRadius={2} p={2} position="relative">
              <Typography fontWeight="bold">{info.title}</Typography>
              <Typography variant="body2">{info.content}</Typography>
              <IconButton
                size="small"
                color="error"
                onClick={() => handleRemoveInfo(index)}
                sx={{ position: 'absolute', top: 8, right: 8 }}
              >
                <Delete fontSize="small" />
              </IconButton>
            </Box>
          </Grid>
        ))}
      </Grid>

      <Box textAlign="center" mt={6}>
        <Button variant="contained" size="large" onClick={handleSavePage}>
          Salvar Página
        </Button>
      </Box>
    </Box>
  );
}
