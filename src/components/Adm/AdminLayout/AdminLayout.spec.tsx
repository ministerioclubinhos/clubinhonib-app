import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { UserRole } from '@/types/shared';

vi.mock('react-redux', () => ({
  useSelector: (selector: (state: unknown) => unknown) =>
    selector({ auth: { isAuthenticated: true, user: { role: UserRole.ADMIN } } }),
}));

/**
 * As flags que o menu consulta. O teste controla o valor para exercitar o
 * item aparecendo e sumindo.
 */
let flags: Record<string, boolean> = {
  children_area: true,
  pagelas: true,
  club_control: true,
  statistics: true,
  photo_moderation: true,
  idea_moderation: true,
  comment_moderation: true,
};

vi.mock('@/hooks', () => ({
  useFeatureFlags: () => ({ flags }),
}));

import AdminLayout from './AdminLayout';

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <AdminLayout />
    </MemoryRouter>,
  );

/** Cabeçalho do acordeão de uma seção, pelo texto do título. */
const sectionHeader = (title: string) =>
  screen.getAllByRole('button').find((button) => button.textContent === title);

const expandedSection = () =>
  screen
    .getAllByRole('button')
    .find((button) => button.getAttribute('aria-expanded') === 'true')
    ?.textContent;

describe('AdminLayout · sidebar', () => {
  beforeEach(() => {
    flags = {
      children_area: true,
      pagelas: true,
      club_control: true,
      statistics: true,
      photo_moderation: true,
      idea_moderation: true,
      comment_moderation: true,
    };
  });

  describe('seção aberta conforme a rota', () => {
    it('abre Operacional em Controle de Clubinhos', () => {
      renderAt('/adm/controle-clubinhos');

      expect(expandedSection()).toBe('Operacional');
    });

    it('abre Operacional em Estatísticas', () => {
      renderAt('/adm/estatisticas');

      expect(expandedSection()).toBe('Operacional');
    });

    it('abre Materiais em Materiais semanais', () => {
      renderAt('/adm/paginas-materiais-semanais');

      expect(expandedSection()).toBe('Materiais');
    });

    it('abre Materiais em Páginas de ideias', () => {
      renderAt('/adm/paginas-ideias');

      expect(expandedSection()).toBe('Materiais');
    });

    it('abre Conteúdo em Criar Página', () => {
      renderAt('/adm/criar-pagina');

      expect(expandedSection()).toBe('Conteúdo');
    });

    it('abre Pessoas em Coordenadores', () => {
      renderAt('/adm/coordenadores');

      expect(expandedSection()).toBe('Pessoas');
    });

    it('não abre seção alguma numa rota fora do menu', () => {
      // Telas de edição não têm entrada no menu; abrir uma seção arbitrária
      // (o antigo fallback) apontava o usuário para o lugar errado.
      renderAt('/adm/editar-pagina-semana');

      expect(expandedSection()).toBeUndefined();
    });
  });

  describe('feature flags', () => {
    it('esconde o item quando a flag do recurso está desligada', () => {
      // A rota também deixa de existir; deixar o item no menu levaria o
      // administrador a um redirecionamento.
      flags = { ...flags, statistics: false };

      renderAt('/adm/controle-clubinhos');

      expect(screen.queryByText('Estatísticas')).not.toBeInTheDocument();
      expect(screen.getByText('Controle de Clubinhos')).toBeInTheDocument();
    });

    it('esconde a seção inteira quando todos os itens dela estão desligados', () => {
      flags = {
        ...flags,
        statistics: false,
        club_control: false,
      };

      renderAt('/adm');

      expect(sectionHeader('Operacional')).toBeUndefined();
    });

    it('desligar um recurso não derruba os outros', () => {
      flags = { ...flags, pagelas: false };

      renderAt('/adm/paginas-materiais-semanais');

      expect(screen.queryByText('Pagelas')).not.toBeInTheDocument();
      // "Clubinhos" é também o título de uma seção; o item é o do menu.
      expect(screen.getAllByText('Clubinhos').length).toBeGreaterThan(0);
      expect(screen.getByText('Materiais semanais')).toBeInTheDocument();
    });
  });

  describe('agrupamento', () => {
    it('mantém as ideias junto dos materiais, como no dashboard', () => {
      renderAt('/adm/paginas-materiais-semanais');

      const materiais = sectionHeader('Materiais');
      const painel = materiais?.parentElement?.parentElement;

      expect(painel).toBeTruthy();
      expect(within(painel as HTMLElement).getByText('Materiais semanais')).toBeInTheDocument();
      expect(within(painel as HTMLElement).getByText('Páginas de ideias')).toBeInTheDocument();
      expect(
        within(painel as HTMLElement).getByText('Ideias compartilhadas'),
      ).toBeInTheDocument();
    });

    it('deixa Conteúdo apenas com criação e publicações', () => {
      renderAt('/adm/criar-pagina');

      const conteudo = sectionHeader('Conteúdo');
      const painel = conteudo?.parentElement?.parentElement;

      expect(painel).toBeTruthy();
      expect(within(painel as HTMLElement).getByText('Criar Página')).toBeInTheDocument();
      expect(within(painel as HTMLElement).getByText('Meditações')).toBeInTheDocument();
      expect(
        within(painel as HTMLElement).queryByText('Páginas de ideias'),
      ).not.toBeInTheDocument();
    });
  });
});
