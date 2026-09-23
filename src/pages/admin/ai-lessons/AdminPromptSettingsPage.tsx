import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Box, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Paper, Stack, Tab, Tabs, TextField, Typography } from '@mui/material';
import { ArrowBack, RestartAlt, Save, Settings } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { AdminPromptPreference, aiLessonsService, LessonStageType } from '@/services/aiLessonsService';

const ORDER = Object.values(LessonStageType);
const LABELS: Record<LessonStageType, string> = { LESSON: 'Lição', LESSON_VISUALS: 'Visuais da história', STANDARD_GAME: 'Brincadeira', VERSE_VISUALS: 'Visuais do versículo', VERSE_FIXATION: 'Fixação divertida do versículo', MEDITATION_YOUNGER: 'Meditação dos menores', MEDITATION_OLDER: 'Meditação dos maiores', MANUAL_WORK: 'Trabalho manual' };
const queryKey = ['ai-lessons', 'prompt-preferences'] as const;

export const AdminPromptSettingsPage = () => {
  const navigate = useNavigate(); const client = useQueryClient(); const [stage, setStage] = useState(LessonStageType.LESSON); const [drafts, setDrafts] = useState<Partial<Record<LessonStageType, string>>>({}); const [resetOpen, setResetOpen] = useState(false); const [feedback, setFeedback] = useState<{ severity: 'success' | 'error'; text: string } | null>(null);
  const query = useQuery({ queryKey, queryFn: aiLessonsService.getPromptPreferences, staleTime: 30000 });
  useEffect(() => { if (query.data) setDrafts(Object.fromEntries(query.data.map((item) => [item.stage, item.effectivePrompt]))); }, [query.data]);
  const preference = query.data?.find((item) => item.stage === stage); const value = drafts[stage] ?? preference?.effectivePrompt ?? ''; const dirty = Boolean(preference && value.trim() !== preference.effectivePrompt);
  const dirtyCount = useMemo(() => query.data?.filter((item) => (drafts[item.stage] ?? item.effectivePrompt).trim() !== item.effectivePrompt).length ?? 0, [drafts, query.data]);
  const save = useMutation({ mutationFn: ({ item, prompt }: { item: AdminPromptPreference; prompt: string }) => aiLessonsService.savePromptPreference(item.stage, prompt, item.lockVersion), onSuccess: (saved) => { client.setQueryData<AdminPromptPreference[]>(queryKey, (items = []) => items.map((item) => item.stage === saved.stage ? saved : item)); setFeedback({ severity: 'success', text: 'Prompt salvo. Ele será utilizado nas próximas gerações desta etapa.' }); }, onError: () => setFeedback({ severity: 'error', text: 'Conflito ao salvar. Recarregue a página antes de tentar novamente.' }) });
  const reset = useMutation({ mutationFn: aiLessonsService.resetPromptPreference, onSuccess: (saved) => { client.setQueryData<AdminPromptPreference[]>(queryKey, (items = []) => items.map((item) => item.stage === saved.stage ? saved : item)); setDrafts((current) => ({ ...current, [saved.stage]: saved.basePrompt })); setResetOpen(false); setFeedback({ severity: 'success', text: 'Prompt oficial restaurado.' }); }, onError: () => setFeedback({ severity: 'error', text: 'Não foi possível restaurar o prompt.' }) });
  const leave = () => { if (dirtyCount && !window.confirm('Existem alterações não salvas. Deseja sair?')) return; navigate('/adm/estudio'); };

  return <Box data-testid="admin-prompt-settings-page" sx={{ width: { xs: '98%', md: '95%' }, mx: 'auto', py: { xs: 2, md: 3 } }}>
    <Button startIcon={<ArrowBack />} onClick={leave}>Voltar para o Estúdio Clubinho</Button>
    <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={2} sx={{ my: 2 }}><Box><Typography variant="h4" fontWeight={800} sx={{ display: 'flex', gap: 1, alignItems: 'center', fontSize: { xs: '1.65rem', sm: '2.125rem' } }}><Settings color="primary" />Orientações de criação</Typography><Typography color="text.secondary">Personalize, por etapa, as orientações editoriais vinculadas ao seu usuário administrador.</Typography></Box>{dirtyCount > 0 && <Chip color="warning" label={`${dirtyCount} alteração(ões) não salva(s)`} />}</Stack>
    <Alert severity="info" sx={{ mb: 2 }}>O prompt personalizado complementa o template oficial. Estrutura, segurança, cabeçalhos e campos obrigatórios continuam protegidos pelo backend.</Alert>
    <Paper variant="outlined">
      {query.isLoading ? <Box sx={{ display: 'grid', placeItems: 'center', p: 8 }}><CircularProgress /></Box> : query.isError ? <Alert severity="error" action={<Button onClick={() => query.refetch()}>Tentar novamente</Button>}>Não foi possível carregar os prompts.</Alert> : <>
        <Tabs value={stage} onChange={(_, next: LessonStageType) => { setStage(next); setFeedback(null); }} variant="scrollable" scrollButtons="auto" aria-label="Etapas dos prompts">{ORDER.map((item) => <Tab key={item} value={item} label={LABELS[item]} />)}</Tabs><Divider />
        {preference && <Stack spacing={2} sx={{ p: { xs: 2, md: 3 } }}><Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={1}><Typography variant="h6">Prompt de {LABELS[stage]}</Typography><Chip color={preference.customPrompt ? 'primary' : 'default'} label={preference.customPrompt ? 'Personalizado' : 'Padrão oficial'} /></Stack>
          <TextField label="Prompt-base oficial" value={preference.basePrompt} multiline minRows={4} fullWidth InputProps={{ readOnly: true }} helperText="Referência protegida. Use-a como ponto de partida para sua personalização." />
          <TextField data-testid={`admin-prompt-page-input-${stage}`} label="Seu prompt efetivo" value={value} onChange={(event) => { setDrafts((current) => ({ ...current, [stage]: event.target.value })); setFeedback(null); }} multiline minRows={10} fullWidth error={value.trim().length > 0 && value.trim().length < 10} inputProps={{ maxLength: 12000 }} helperText={`${value.length}/12000 caracteres · mínimo de 10`} />
          {feedback && <Alert severity={feedback.severity}>{feedback.text}</Alert>}
          <Stack direction={{ xs: 'column-reverse', sm: 'row' }} justifyContent="flex-end" spacing={1}><Button color="warning" startIcon={<RestartAlt />} disabled={!preference.customPrompt || reset.isPending} onClick={() => setResetOpen(true)}>Restaurar padrão</Button><Button variant="contained" startIcon={<Save />} disabled={!dirty || value.trim().length < 10 || save.isPending} onClick={() => save.mutate({ item: preference, prompt: value.trim() })}>{save.isPending ? 'Salvando…' : 'Salvar personalização'}</Button></Stack>
        </Stack>}
      </>}
    </Paper>
    <Dialog data-testid="admin-prompt-page-reset-dialog" open={resetOpen} onClose={() => setResetOpen(false)} maxWidth="xs" fullWidth><DialogTitle>Restaurar prompt oficial?</DialogTitle><DialogContent><Typography>A personalização desta etapa será excluída. Materiais já gerados não serão alterados.</Typography></DialogContent><DialogActions><Button onClick={() => setResetOpen(false)}>Cancelar</Button><Button color="warning" variant="contained" onClick={() => reset.mutate(stage)} disabled={reset.isPending}>Restaurar</Button></DialogActions></Dialog>
  </Box>;
};
