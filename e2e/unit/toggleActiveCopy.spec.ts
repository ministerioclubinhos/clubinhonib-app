import { expect, test } from '@playwright/test';

import { TOGGLE_ACTIVE_COPY } from '@/components/common/modal/constants';
import { ToggleActiveSubject } from '@/components/common/modal/types';

/**
 * O diálogo de ativar/desativar é compartilhado, e o texto dele já veio errado
 * uma vez: desativar um **clubinho** perguntava "criança não frequenta mais o
 * clubinho?" e avisava que "esta criança sairá das estatísticas". A cópia
 * estava fixa no componente.
 */
test.describe('TOGGLE_ACTIVE_COPY', () => {
  test('todo assunto tem os quatro textos e o nome de reserva', () => {
    for (const assunto of Object.values(ToggleActiveSubject)) {
      const copy = TOGGLE_ACTIVE_COPY[assunto];

      expect(copy.deactivate.question.length, assunto).toBeGreaterThan(0);
      expect(copy.deactivate.consequence.length, assunto).toBeGreaterThan(0);
      expect(copy.activate.question.length, assunto).toBeGreaterThan(0);
      expect(copy.activate.consequence.length, assunto).toBeGreaterThan(0);
      expect(copy.fallbackName.length, assunto).toBeGreaterThan(0);
    }
  });

  test('nenhum assunto empresta o texto do outro', () => {
    // O bug foi este: a tela de clubinhos reusava, palavra por palavra, o texto
    // escrito para criança. Citar criança ao descrever o clubinho é legítimo
    // ("as crianças continuam vinculadas"); repetir a frase do outro assunto
    // não é.
    const clube = TOGGLE_ACTIVE_COPY[ToggleActiveSubject.Club];
    const crianca = TOGGLE_ACTIVE_COPY[ToggleActiveSubject.Child];

    const frasesDaCrianca = [
      crianca.deactivate.question,
      crianca.deactivate.consequence,
      crianca.activate.question,
      crianca.activate.consequence,
      crianca.fallbackName,
    ];
    const textoDoClube = [
      clube.deactivate.question,
      clube.deactivate.consequence,
      clube.activate.question,
      clube.activate.consequence,
      clube.fallbackName,
    ].join(' ');

    for (const frase of frasesDaCrianca) {
      expect(textoDoClube, frase).not.toContain(frase);
    }
  });

  test('o clubinho não é tratado como uma criança', () => {
    const clube = TOGGLE_ACTIVE_COPY[ToggleActiveSubject.Club];

    expect(clube.fallbackName).toBe('este clubinho');
    expect(clube.deactivate.consequence).not.toContain('Esta criança');
    expect(clube.activate.consequence).not.toContain('Esta criança');
  });

  test('o texto do clubinho diz o que acontece com o calendário', () => {
    // É a consequência que a pessoa precisa saber antes de confirmar: os dias
    // do clubinho somem do calendário, e reativar os traz de volta.
    const { deactivate, activate } = TOGGLE_ACTIVE_COPY[
      ToggleActiveSubject.Club
    ];

    expect(deactivate.consequence).toContain('calendário');
    expect(activate.consequence).toContain('calendário');
  });

  test('o texto da criança fala de criança e de estatísticas', () => {
    const { deactivate } = TOGGLE_ACTIVE_COPY[ToggleActiveSubject.Child];

    expect(deactivate.question.toLowerCase()).toContain('criança');
    expect(deactivate.consequence).toContain('estatísticas');
  });
});
