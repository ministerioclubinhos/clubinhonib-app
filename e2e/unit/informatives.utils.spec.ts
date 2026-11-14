import { expect, test } from '@playwright/test';

import type { InformativeResponse } from '@/features/informatives/types';
import {
  formatDate,
  hasErrors,
  informativeInitials,
  parseSortOption,
  toFormValues,
  toRequest,
  validateForm,
} from '@/features/informatives/utils';

const buildResponse = (
  overrides: Partial<InformativeResponse> = {},
): InformativeResponse => ({
  id: 'informative-1',
  title: 'Retiro de julho',
  description: 'Inscrições abertas.',
  public: true,
  routePath: 'informativo_retiro_de_julho',
  createdAt: '2026-01-10T12:00:00.000Z',
  updatedAt: '2026-01-11T12:00:00.000Z',
  ...overrides,
});

test.describe('contrato de /informatives', () => {
  test('lê exatamente os campos que a API devolve', () => {
    const values = toFormValues(buildResponse());

    expect(values).toEqual({
      title: 'Retiro de julho',
      description: 'Inscrições abertas.',
      public: true,
    });
  });

  test('trata informativo sem rota', () => {
    const informative = buildResponse({ routePath: null });

    expect(informative.routePath).toBeNull();
    expect(toFormValues(informative).title).toBe('Retiro de julho');
  });

  test('nasce publicado quando é criação', () => {
    expect(toFormValues(null)).toEqual({
      title: '',
      description: '',
      public: true,
    });
  });

  test('envia apenas os três campos que o DTO aceita', () => {
    // A validação global recusa a requisição inteira quando chega uma chave a
    // mais — foi assim que o `id` no corpo derrubava toda edição.
    const payload = toRequest({
      title: '  Retiro  ',
      description: '  Vagas  ',
      public: false,
    });

    expect(Object.keys(payload).sort()).toEqual([
      'description',
      'public',
      'title',
    ]);
    expect(payload.title).toBe('Retiro');
    expect(payload.description).toBe('Vagas');
  });
});

test.describe('validação do formulário', () => {
  test('exige título e descrição', () => {
    const errors = validateForm({ title: ' ', description: '', public: true });

    expect(errors).toEqual({ title: true, description: true });
    expect(hasErrors(errors)).toBe(true);
  });

  test('aceita o formulário preenchido', () => {
    const errors = validateForm({
      title: 'Retiro',
      description: 'Vagas',
      public: false,
    });

    expect(hasErrors(errors)).toBe(false);
  });
});

test.describe('apresentação', () => {
  test('formata a data e protege contra valor inválido', () => {
    expect(formatDate('2026-01-10T12:00:00.000Z')).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    expect(formatDate('data-quebrada')).toBe('—');
    expect(formatDate(null)).toBe('—');
  });

  test('monta as iniciais do avatar', () => {
    expect(informativeInitials('Retiro de julho')).toBe('RD');
    expect(informativeInitials('Retiro')).toBe('RE');
    expect(informativeInitials('  ')).toBe('?');
  });

  test('divide a opção de ordenação em campo e direção', () => {
    expect(parseSortOption('title:ASC')).toEqual({
      sort: 'title',
      order: 'ASC',
    });
    expect(parseSortOption('qualquer')).toEqual({
      sort: 'createdAt',
      order: 'DESC',
    });
  });
});
