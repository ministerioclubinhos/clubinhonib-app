import { expect, test } from '@playwright/test';

import { DEFAULT_APP_TITLE } from '@/constants/app';
import { CHILDREN_BROWSER_PAGE_TITLE } from '@/features/pagela-teacher/constants';
import { IDEAS_SECTION_PAGE_TITLE } from '@/features/ideas-sections/constants';
import { resolveDocumentTitle, resolveRestoredTitle } from '@/utils/documentTitle';

test.describe('documentTitle utils', () => {
  test.describe('resolveDocumentTitle', () => {
    test('usa o título da página quando fornecido', () => {
      expect(resolveDocumentTitle(CHILDREN_BROWSER_PAGE_TITLE)).toBe(
        'Lançar Pagela • Selecionar Criança',
      );
      expect(resolveDocumentTitle(IDEAS_SECTION_PAGE_TITLE)).toBe(
        'Compartilhar Ideia Incrível',
      );
    });

    test('remove espaços em branco ao redor do título', () => {
      expect(resolveDocumentTitle('  Página de Teste  ')).toBe('Página de Teste');
    });

    test('reverte para o título padrão quando o título é vazio ou nulo', () => {
      expect(resolveDocumentTitle(null)).toBe(DEFAULT_APP_TITLE);
      expect(resolveDocumentTitle(undefined)).toBe(DEFAULT_APP_TITLE);
      expect(resolveDocumentTitle('')).toBe(DEFAULT_APP_TITLE);
      expect(resolveDocumentTitle('   ')).toBe(DEFAULT_APP_TITLE);
    });

    test('aceita um título padrão customizado como fallback', () => {
      expect(resolveDocumentTitle('', 'Fallback Customizado')).toBe('Fallback Customizado');
    });
  });

  test.describe('resolveRestoredTitle', () => {
    test('restaura o título anterior quando ele for diferente do atual', () => {
      const restored = resolveRestoredTitle(
        'Clubinhos NIB',
        'Lançar Pagela • Selecionar Criança',
      );
      expect(restored).toBe('Clubinhos NIB');
    });

    test('reverte para o padrão se o título anterior for igual ao atual', () => {
      const restored = resolveRestoredTitle(
        'Lançar Pagela • Selecionar Criança',
        'Lançar Pagela • Selecionar Criança',
      );
      expect(restored).toBe(DEFAULT_APP_TITLE);
    });

    test('reverte para o padrão se o título anterior for nulo, indefinido ou vazio', () => {
      expect(resolveRestoredTitle(null, 'Título')).toBe(DEFAULT_APP_TITLE);
      expect(resolveRestoredTitle(undefined, 'Título')).toBe(DEFAULT_APP_TITLE);
      expect(resolveRestoredTitle('', 'Título')).toBe(DEFAULT_APP_TITLE);
      expect(resolveRestoredTitle('   ', 'Título')).toBe(DEFAULT_APP_TITLE);
    });

    test('permite customizar o fallback restaurado', () => {
      expect(resolveRestoredTitle('', 'Título', 'Fallback')).toBe('Fallback');
    });
  });
});
