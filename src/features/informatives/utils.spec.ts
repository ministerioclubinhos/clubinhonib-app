import { describe, expect, it } from 'vitest';

import type { InformativeResponse } from './types';
import {
  formatDate,
  hasErrors,
  informativeInitials,
  parseSortOption,
  toFormValues,
  toRequest,
  validateForm,
} from './utils';

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

describe('contrato de /informatives', () => {
  it('lê exatamente os campos que a API devolve', () => {
    const values = toFormValues(buildResponse());

    expect(values).toEqual({
      title: 'Retiro de julho',
      description: 'Inscrições abertas.',
      public: true,
    });
  });

  it('trata informativo sem rota', () => {
    const informative = buildResponse({ routePath: null });

    expect(informative.routePath).toBeNull();
    expect(toFormValues(informative).title).toBe('Retiro de julho');
  });

  it('nasce publicado quando é criação', () => {
    expect(toFormValues(null)).toEqual({
      title: '',
      description: '',
      public: true,
    });
  });

  it('envia apenas os três campos que o DTO aceita', () => {
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

describe('validação do formulário', () => {
  it('exige título e descrição', () => {
    const errors = validateForm({ title: ' ', description: '', public: true });

    expect(errors).toEqual({ title: true, description: true });
    expect(hasErrors(errors)).toBe(true);
  });

  it('aceita o formulário preenchido', () => {
    const errors = validateForm({
      title: 'Retiro',
      description: 'Vagas',
      public: false,
    });

    expect(hasErrors(errors)).toBe(false);
  });
});

describe('apresentação', () => {
  it('formata a data e protege contra valor inválido', () => {
    expect(formatDate('2026-01-10T12:00:00.000Z')).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    expect(formatDate('data-quebrada')).toBe('—');
    expect(formatDate(null)).toBe('—');
  });

  it('monta as iniciais do avatar', () => {
    expect(informativeInitials('Retiro de julho')).toBe('RD');
    expect(informativeInitials('Retiro')).toBe('RE');
    expect(informativeInitials('  ')).toBe('?');
  });

  it('divide a opção de ordenação em campo e direção', () => {
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
