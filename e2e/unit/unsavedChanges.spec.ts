import { expect, test } from '@playwright/test';

import {
  clearFormDirty,
  hasUnsavedChanges,
  markFormDirty,
  resetUnsavedChanges,
} from '@/utils/unsavedChanges';

/**
 * O registro que o menu do painel consulta antes de trocar de tela.
 *
 * O aviso de saída depende inteiro dele: um `false` indevido descarta o
 * rascunho calado, e um `true` que sobrou pergunta "sair sem salvar?" em uma
 * tela que não tem nada a perder.
 */
test.describe('registro de alterações não salvas', () => {
  test.beforeEach(() => resetUnsavedChanges());

  test('começa vazio e responde ao formulário que se anuncia', () => {
    expect(hasUnsavedChanges()).toBe(false);

    markFormDirty('form-1');
    expect(hasUnsavedChanges()).toBe(true);

    clearFormDirty('form-1');
    expect(hasUnsavedChanges()).toBe(false);
  });

  test('anunciar duas vezes o mesmo formulário não exige limpar duas vezes', () => {
    markFormDirty('form-1');
    markFormDirty('form-1');

    clearFormDirty('form-1');
    expect(hasUnsavedChanges()).toBe(false);
  });

  test('uma tela que sai não apaga o aviso da outra que continua aberta', () => {
    markFormDirty('form-1');
    markFormDirty('form-2');

    clearFormDirty('form-1');
    expect(hasUnsavedChanges()).toBe(true);

    clearFormDirty('form-2');
    expect(hasUnsavedChanges()).toBe(false);
  });

  test('limpar um formulário que nunca se anunciou não muda nada', () => {
    markFormDirty('form-1');

    clearFormDirty('form-desconhecido');
    expect(hasUnsavedChanges()).toBe(true);
  });
});
