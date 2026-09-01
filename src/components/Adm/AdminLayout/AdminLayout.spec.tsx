import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { UserRole } from '@/types/shared';

vi.mock('react-redux', () => ({
  useSelector: (selector: (state: unknown) => unknown) =>
    selector({ auth: { isAuthenticated: true, user: { role: UserRole.ADMIN } } }),
}));

vi.mock('@/hooks', () => ({
  useFeatureFlags: () => ({ flags: { coordinator_children_access: true } }),
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
