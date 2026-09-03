import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { MediaItem, MediaPlatform, MediaType, MediaUploadType } from '@/store/slices/types';

import { WeekMaterialMediaDraft } from './types';

const save = vi.fn();
const setValue = vi.fn();
const setMedia = vi.fn();
const reset = vi.fn();
const dismissFeedback = vi.fn();

const formState = {
  values: {
    pageTitle: 'Semana 12',
    pageSubtitle: 'Tema',
    pageDescription: 'Descrição',
    currentWeek: false,
  },
  setValue,
  media: {
    videos: [],
    documents: [],
    images: [],
    audios: [],
  } as WeekMaterialMediaDraft,
  setMedia,
  reset,
  errors: { title: false, subtitle: false, description: false },
  isDirty: false,
  saving: false,
  feedback: null,
  dismissFeedback,
  save,
};

// Só o hook de estado do formulário é substituído: o guard de saída continua
// sendo o real, para que os testes de beforeunload valham alguma coisa.
// A página da edição vem do id na URL; o teste controla o que a busca devolve.
let loadedMaterial: { id: string } | null = { id: 'page-1' };
let loadingMaterial = false;

vi.mock('./hooks', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./hooks')>();
  return {
    ...actual,
    useWeekMaterialForm: () => formState,
    useWeekMaterialById: () => ({
      material: loadedMaterial,
      loading: loadingMaterial,
      error: '',
    }),
  };
});

import WeekMaterialPageForm from './WeekMaterialPageForm';

const renderForm = (props: { fromTemplatePage: boolean }) =>
  render(
    <MemoryRouter>
      <WeekMaterialPageForm {...props} />
    </MemoryRouter>,
  );

const video = (title: string): MediaItem => ({
  id: title,
  title,
  description: 'Descrição',
  mediaType: MediaType.VIDEO,
  uploadType: MediaUploadType.LINK,
  platformType: MediaPlatform.YOUTUBE,
  url: 'https://www.youtube.com/embed/abc',
});

describe('WeekMaterialPageForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    formState.media = { videos: [], documents: [], images: [], audios: [] };
    formState.errors = { title: false, subtitle: false, description: false };
    formState.saving = false;
    formState.isDirty = false;
    loadedMaterial = { id: 'page-1' };
    loadingMaterial = false;
  });

  it('mostra o resumo vazio quando nenhum material foi adicionado', () => {
    renderForm({ fromTemplatePage: true });

    expect(screen.getByText('Nenhum material adicionado')).toBeInTheDocument();
  });

  it('conta os materiais de cada aba e o total da página', () => {
    formState.media = {
      videos: [video('a'), video('b')],
      documents: [],
      images: [video('c')],
      audios: [],
    };

    renderForm({ fromTemplatePage: true });

    expect(screen.getByText('3 materiais nesta página')).toBeInTheDocument();
    expect(
      screen.getByRole('tab', { name: 'Vídeos: 2' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('tab', { name: 'Imagens: 1' }),
    ).toBeInTheDocument();
  });

  it('usa o singular quando há um único material', () => {
    formState.media = {
      videos: [video('a')],
      documents: [],
      images: [],
      audios: [],
    };

    renderForm({ fromTemplatePage: true });

    expect(screen.getByText('1 material nesta página')).toBeInTheDocument();
  });

  it('troca o editor ao mudar de aba', async () => {
    renderForm({ fromTemplatePage: true });

    expect(screen.getByRole('button', { name: 'Adicionar Vídeo' })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('tab', { name: /Documentos/ }));

    expect(
      screen.getByRole('button', { name: 'Adicionar Documento' }),
    ).toBeInTheDocument();
  });

  it('avisa sobre campos obrigatórios na barra de ações', () => {
    formState.errors = { title: true, subtitle: false, description: false };

    renderForm({ fromTemplatePage: true });

    expect(
      screen.getByText('Preencha todos os campos obrigatórios.'),
    ).toBeInTheDocument();
  });

  it('dispara o salvamento pelo botão da barra de ações', async () => {
    renderForm({ fromTemplatePage: true });

    await userEvent.click(screen.getByRole('button', { name: /salvar página/i }));

    expect(save).toHaveBeenCalledTimes(1);
  });

  it('desabilita o botão enquanto salva', () => {
    formState.saving = true;

    renderForm({ fromTemplatePage: true });

    expect(screen.getByRole('button', { name: /salvando/i })).toBeDisabled();
  });

  it('confirma antes de descartar um item começado ao trocar de aba', async () => {
    renderForm({ fromTemplatePage: true });

    await userEvent.type(
      screen.getByLabelText(/^Título do Vídeo/),
      'Rascunho',
    );
    await userEvent.click(screen.getByRole('tab', { name: /Documentos/ }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole('button', { name: 'Continuar preenchendo' }),
    );
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );

    // Continua na aba de vídeos, com o preenchimento intacto.
    expect(
      screen.getByRole('button', { name: 'Adicionar Vídeo' }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/^Título do Vídeo/)).toHaveValue('Rascunho');
  });

  it('troca de aba ao confirmar o descarte do rascunho', async () => {
    renderForm({ fromTemplatePage: true });

    await userEvent.type(
      screen.getByLabelText(/^Título do Vídeo/),
      'Rascunho',
    );
    await userEvent.click(screen.getByRole('tab', { name: /Documentos/ }));
    await userEvent.click(screen.getByRole('button', { name: 'Descartar' }));
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );

    expect(
      screen.getByRole('button', { name: 'Adicionar Documento' }),
    ).toBeInTheDocument();
  });

  it('troca de aba direto quando não há rascunho', async () => {
    renderForm({ fromTemplatePage: true });

    await userEvent.click(screen.getByRole('tab', { name: /Documentos/ }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Adicionar Documento' }),
    ).toBeInTheDocument();
  });

  it('avisa o navegador ao sair com alterações não salvas', async () => {
    formState.isDirty = true;
    const addEventListener = vi.spyOn(window, 'addEventListener');

    renderForm({ fromTemplatePage: true });

    expect(addEventListener).toHaveBeenCalledWith(
      'beforeunload',
      expect.any(Function),
    );
    addEventListener.mockRestore();
  });

  it('não bloqueia a saída quando nada foi alterado', () => {
    const addEventListener = vi.spyOn(window, 'addEventListener');

    renderForm({ fromTemplatePage: true });

    expect(addEventListener).not.toHaveBeenCalledWith(
      'beforeunload',
      expect.any(Function),
    );
    addEventListener.mockRestore();
  });

  it('avisa quando a edição é aberta sem página carregada, em vez de um formulário vazio', () => {
    loadedMaterial = null;

    renderForm({ fromTemplatePage: false });

    expect(screen.getByText('Página não encontrada')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /salvar página/i }),
    ).not.toBeInTheDocument();
  });

  it('mostra o formulário de criação mesmo sem página carregada', () => {
    loadedMaterial = null;

    renderForm({ fromTemplatePage: true });

    expect(
      screen.getByRole('button', { name: /salvar página/i }),
    ).toBeInTheDocument();
  });

  it('mostra o título apenas no modo de edição', () => {
    renderForm({ fromTemplatePage: true });
    expect(screen.queryByText('Editar Semana')).not.toBeInTheDocument();

    renderForm({ fromTemplatePage: false });
    expect(screen.getByText('Editar Semana')).toBeInTheDocument();
  });
});
