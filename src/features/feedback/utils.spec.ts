import { describe, expect, it } from 'vitest';

import { FeedbackCategory } from '@/store/slices/types';
import { FeedbackFormValues } from './types';
import {
  buildFeedbackRequest,
  buildFeedbacksQuery,
  ratingAccent,
  validateFeedbackForm,
} from './utils';

const values: FeedbackFormValues = {
  rating: 4,
  comment: '  Site muito bom.  ',
  category: FeedbackCategory.USABILITY,
};

describe('utils de avaliação do site', () => {
  describe('buildFeedbackRequest', () => {
    it('manda só os campos que a API aceita', () => {
      // Enviar createdAt, updatedAt ou published fazia a API recusar a
      // requisição inteira: a validação global rejeita campo desconhecido.
      expect(Object.keys(buildFeedbackRequest(values)).sort()).toEqual([
        'category',
        'comment',
        'rating',
      ]);
    });

    it('não manda nome nem e-mail: quem assina é o perfil autenticado', () => {
      const payload = buildFeedbackRequest(values);

      expect(payload).not.toHaveProperty('name');
      expect(payload).not.toHaveProperty('email');
    });

    it('remove os espaços em volta do comentário', () => {
      expect(buildFeedbackRequest(values).comment).toBe('Site muito bom.');
    });
  });

  describe('validateFeedbackForm', () => {
    it('aceita o formulário preenchido', () => {
      expect(validateFeedbackForm(values)).toEqual({
        rating: false,
        comment: false,
        category: false,
      });
    });

    it('acusa os campos obrigatórios em branco', () => {
      expect(
        validateFeedbackForm({ rating: null, comment: '   ', category: '' }),
      ).toEqual({
        rating: true,
        comment: true,
        category: true,
      });
    });
  });
});

describe('listagem administrativa de avaliações', () => {
  it('envia só o que QueryFeedbacksDto aceita', () => {
    const params = buildFeedbacksQuery({
      page: 2,
      limit: 12,
      filters: {
        searchString: '  ana  ',
        category: FeedbackCategory.USABILITY,
        read: false,
        rating: 4,
      },
    });

    expect(Object.keys(params).sort()).toEqual(
      [
        'category',
        'limit',
        'order',
        'page',
        'rating',
        'read',
        'searchString',
        'sort',
      ].sort(),
    );
    expect(params.searchString).toBe('ana');
  });

  it('busca vazia não vira filtro', () => {
    const params = buildFeedbacksQuery({
      page: 1,
      limit: 12,
      filters: { searchString: '   ' },
    });

    expect(params.searchString).toBeUndefined();
  });

  it('traduz a nota em cor', () => {
    expect(ratingAccent(5)).toBe('success');
    expect(ratingAccent(3)).toBe('warning');
    expect(ratingAccent(1)).toBe('error');
  });
});
