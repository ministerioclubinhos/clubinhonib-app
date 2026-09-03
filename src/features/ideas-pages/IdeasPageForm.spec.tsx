import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { IdeasSectionDraft } from './types';

const save = vi.fn();
const setValue = vi.fn();
const setSections = vi.fn();
const dismissFeedback = vi.fn();

const formState = {
  values: { title: 'Ideias', description: 'Descrição' },
  setValue,
  sections: [] as IdeasSectionDraft[],
  setSections,
  errors: {
    title: false,
    description: false,
    sections: false,
    sectionTitles: false,
  },
  isDirty: false,
  saving: false,
  feedback: null as { message: string; severity: 'success' | 'error' } | null,
  dismissFeedback,
  save,
};

// Só o hook de estado do formulário é substituído: o guard de saída continua
// sendo o real, para que os testes de beforeunload valham alguma coisa.
// A página da edição vem do id na URL; o teste controla o que a busca devolve.
let loadedPage: { id: string } | null = { id: 'page-1' };
let loadingPage = false;

vi.mock('./hooks', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./hooks')>();
  return {
    ...actual,
    useIdeasPageForm: () => formState,
    useIdeasPageById: () => ({
      page: loadedPage,
      loading: loadingPage,
      error: '',
    }),
  };
});

import IdeasPageForm from './IdeasPageForm';

const renderForm = (props: { fromTemplatePage: boolean }) =>
  render(
    <MemoryRouter>
      <IdeasPageForm {...props} />
    </MemoryRouter>,
  );

const section = (
  overrides: Partial<IdeasSectionDraft> = {},
): IdeasSectionDraft => ({
  title: 'Abertura',
  description: 'Materiais',
  public: false,
  medias: [],
  ...overrides,
});

describe('IdeasPageForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    formState.sections = [];
    formState.errors = {
      title: false,
      description: false,
      sections: false,
      sectionTitles: false,
    };
    formState.saving = false;
    formState.isDirty = false;
    formState.feedback = null;
    loadedPage = { id: 'page-1' };
    loadingPage = false;
  });

  it('mostra o título de edição apenas fora do fluxo de criação', () => {
    renderForm({ fromTemplatePage: false });
    expect(screen.getByText('Editar Página de Ideias')).toBeInTheDocument();
  });

  it('avisa quando a edição é aberta sem a página carregada', () => {
    loadedPage = null;
    renderForm({ fromTemplatePage: false });

    expect(screen.getByText('Página não encontrada')).toBeInTheDocument();
    expect(screen.queryByLabelText(/Título da página/)).not.toBeInTheDocument();
  });

  it('não exige página carregada durante a criação', () => {
    loadedPage = null;
    renderForm({ fromTemplatePage: true });

    expect(screen.getByLabelText(/Título da página/)).toBeInTheDocument();
  });

  it('anuncia que ainda não há seções', () => {
    renderForm({ fromTemplatePage: true });

    expect(
      screen.getByText(/Nenhuma seção criada ainda/),
    ).toBeInTheDocument();
  });

  it('cobra ao menos uma seção depois de uma tentativa de salvar', () => {
    formState.errors = { ...formState.errors, sections: true };
    renderForm({ fromTemplatePage: true });

    expect(
      screen.getByText('Adicione ao menos uma seção antes de salvar.'),
    ).toBeInTheDocument();
  });

  it('adiciona uma seção vazia e restrita', async () => {
    renderForm({ fromTemplatePage: true });

    await userEvent.click(screen.getByRole('button', { name: 'Nova seção' }));

    expect(setSections).toHaveBeenCalledWith([
      { title: '', description: '', public: false, medias: [] },
    ]);
  });

  it('resume seções e mídias na barra de ações', () => {
    formState.sections = [
      section({
        medias: [
          {
            title: 'Vídeo',
            description: '',
            mediaType: 'video',
            uploadType: 'link',
            url: 'https://youtube.com/watch?v=a',
          },
        ] as IdeasSectionDraft['medias'],
      }),
    ];
    renderForm({ fromTemplatePage: true });

    expect(screen.getByText('1 seção · 1 mídia')).toBeInTheDocument();
  });

  it('remove a seção somente depois da confirmação', async () => {
    formState.sections = [section(), section({ title: 'Encerramento' })];
    renderForm({ fromTemplatePage: true });

    await userEvent.click(screen.getByLabelText('Remover seção 1'));
    expect(setSections).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole('button', { name: 'Remover' }));

    await waitFor(() =>
      expect(setSections).toHaveBeenCalledWith([
        expect.objectContaining({ title: 'Encerramento' }),
      ]),
    );
  });

  it('dispara o salvamento', async () => {
    renderForm({ fromTemplatePage: true });

    await userEvent.click(screen.getByRole('button', { name: /Salvar Página/ }));

    expect(save).toHaveBeenCalledTimes(1);
  });

  it('bloqueia o botão enquanto salva', () => {
    formState.saving = true;
    renderForm({ fromTemplatePage: true });

    expect(screen.getByRole('button', { name: /Salvando/ })).toBeDisabled();
  });

  it('mostra o retorno do salvamento', () => {
    formState.feedback = { message: 'Página criada com sucesso!', severity: 'success' };
    renderForm({ fromTemplatePage: true });

    expect(
      screen.getByText('Página criada com sucesso!'),
    ).toBeInTheDocument();
  });
});
