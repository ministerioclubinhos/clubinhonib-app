import { expect, test } from '@playwright/test';

import { FeedbackCategory } from '@/store/slices/types';
import { FeedbackFormValues } from '@/features/feedback/types';
import {
  buildFeedbackRequest,
  buildFeedbacksQuery,
  ratingAccent,
  validateFeedbackForm,
} from '@/features/feedback/utils';

const values: FeedbackFormValues = {
  rating: 4,
  comment: '  Site muito bom.  ',
  category: FeedbackCategory.USABILITY,
};

test.describe('utils de avaliação do site', () => {
  test.describe('buildFeedbackRequest', () => {
    test('manda só os campos que a API aceita', () => {
      // Enviar createdAt, updatedAt ou published fazia a API recusar a
      // requisição inteira: a validação global rejeita campo desconhecido.
      expect(Object.keys(buildFeedbackRequest(values)).sort()).toEqual([
        'category',
        'comment',
        'rating',
      ]);
    });

    test('não manda nome nem e-mail: quem assina é o perfil autenticado', () => {
      const payload = buildFeedbackRequest(values);

      expect(payload).not.toHaveProperty('name');
      expect(payload).not.toHaveProperty('email');
    });

    test('remove os espaços em volta do comentário', () => {
      expect(buildFeedbackRequest(values).comment).toBe('Site muito bom.');
    });
  });

  test.describe('validateFeedbackForm', () => {
    test('aceita o formulário preenchido', () => {
      expect(validateFeedbackForm(values)).toEqual({
        rating: false,
        comment: false,
        category: false,
      });
    });

    test('acusa os campos obrigatórios em branco', () => {
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

test.describe('listagem administrativa de avaliações', () => {
  test('envia só o que QueryFeedbacksDto aceita', () => {
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

  test('busca vazia não vira filtro', () => {
    const params = buildFeedbacksQuery({
      page: 1,
      limit: 12,
      filters: { searchString: '   ' },
    });

    expect(params.searchString).toBeUndefined();
  });

  test('traduz a nota em cor', () => {
    expect(ratingAccent(5)).toBe('success');
    expect(ratingAccent(3)).toBe('warning');
    expect(ratingAccent(1)).toBe('error');
  });
});
