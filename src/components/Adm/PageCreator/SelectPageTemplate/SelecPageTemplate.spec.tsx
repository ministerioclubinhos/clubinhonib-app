import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Os criadores reais dependem de store, rotas e rede; a tela só precisa saber
// que renderizou o criador do modelo escolhido.
vi.mock('@/features/week-materials', () => ({
  WeekMaterialPageForm: () => <div>formulário de materiais da semana</div>,
}));
vi.mock('@/features/meditations', () => ({
  MeditationPageForm: () => <div>formulário de meditação</div>,
}));
vi.mock('@/features/image-pages', () => ({
  ImagePageForm: () => <div>formulário de galeria</div>,
}));
vi.mock('@/features/video-pages', () => ({
  VideoPageForm: () => <div>formulário de vídeos</div>,
}));
vi.mock('@/features/ideas-pages', () => ({
  IdeasPageForm: () => <div>formulário de ideias</div>,
}));

const dispatch = vi.fn();
vi.mock('react-redux', () => ({
  useDispatch: () => dispatch,
}));

import { clearImageData } from '@/store/slices/image/imageSlice';

import SelecPageTemplate from './SelecPageTemplate';

const renderScreen = () =>
  render(
    <MemoryRouter>
      <SelecPageTemplate />
    </MemoryRouter>,
  );

describe('SelecPageTemplate', () => {
  beforeEach(() => {
    dispatch.mockClear();
  });

  it('lista todos os modelos disponíveis', () => {
    renderScreen();

    expect(
      screen.getByRole('button', { name: 'Criar Materiais da Semana' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Criar Meditação da Semana' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Criar Galeria de Fotos' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Criar Galeria de Vídeos' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Criar Página de Ideias' }),
    ).toBeInTheDocument();
  });

  it('abre o criador do modelo escolhido e esconde a grade', async () => {
    renderScreen();

    await userEvent.click(
      screen.getByRole('button', { name: 'Criar Materiais da Semana' }),
    );

    expect(
      screen.getByText('formulário de materiais da semana'),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Criar Galeria de Fotos' }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /trocar modelo/i }),
    ).toBeInTheDocument();
  });

  it('volta para a grade ao trocar de modelo', async () => {
    renderScreen();

    await userEvent.click(
      screen.getByRole('button', { name: 'Criar Página de Ideias' }),
    );
    expect(screen.getByText('formulário de ideias')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /trocar modelo/i }));

    expect(screen.queryByText('formulário de ideias')).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Criar Materiais da Semana' }),
    ).toBeInTheDocument();
  });

  it('limpa o rascunho de imagens ao escolher a galeria de fotos', async () => {
    renderScreen();

    await userEvent.click(
      screen.getByRole('button', { name: 'Criar Galeria de Fotos' }),
    );

    expect(dispatch).toHaveBeenCalledWith(clearImageData());
  });

  it('não limpa o rascunho de imagens ao escolher outro modelo', async () => {
    renderScreen();

    await userEvent.click(
      screen.getByRole('button', { name: 'Criar Galeria de Vídeos' }),
    );

    expect(dispatch).not.toHaveBeenCalled();
  });
});
