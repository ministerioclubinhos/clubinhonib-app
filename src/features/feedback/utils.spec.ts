import { describe, expect, it } from 'vitest';

import { FeedbackCategory } from '@/store/slices/types';
import { FeedbackFormValues } from './types';
import { buildFeedbackRequest, validateFeedbackForm } from './utils';

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
