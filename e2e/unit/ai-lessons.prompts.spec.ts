import { expect, test } from '@playwright/test';

import {
  firstName,
  isClearingSavedPrompt,
  promptCustomisationSummary,
  promptPendingCount,
  promptSavedLabel,
  promptSummaryLabel,
  promptValidationMessage,
} from '@/features/ai-lessons/prompt.utils';
import { LessonStageType, type AdminPromptPreference } from '@/features/ai-lessons/types';

const preference = (stage: LessonStageType, customPrompt: string | null): AdminPromptPreference => ({
  stage,
  basePrompt: 'Regras oficiais',
  customPrompt,
  effectivePrompt: 'Regras oficiais',
  lockVersion: customPrompt ? 1 : null,
});

test.describe('orientações de criação: regras', () => {
  test('conta as etapas personalizadas; texto só com espaços não conta', () => {
    const summary = promptCustomisationSummary([
      preference(LessonStageType.LESSON, 'Use frases curtas.'),
      preference(LessonStageType.LESSON_VISUALS, '   '),
      preference(LessonStageType.STANDARD_GAME, null),
    ]);

    expect(summary).toEqual({ customised: 1, total: 3 });
    expect(promptSummaryLabel(summary)).toBe('1 etapa personalizada de 3');
    expect(promptSummaryLabel({ customised: 2, total: 8 })).toBe('2 etapas personalizadas de 8');
    expect(promptSummaryLabel({ customised: 0, total: 8 })).toBe('Todas as etapas no padrão oficial');
    expect(promptSummaryLabel(promptCustomisationSummary(undefined))).toBe('');
  });

  test('apagar o texto de uma orientação salva é voltar ao padrão', () => {
    const saved = preference(LessonStageType.LESSON, 'Use frases curtas.');
    const official = preference(LessonStageType.LESSON, null);

    expect(isClearingSavedPrompt('', saved)).toBe(true);
    expect(isClearingSavedPrompt('   \n', saved)).toBe(true);
    expect(isClearingSavedPrompt('Outro texto', saved)).toBe(false);
    // Sem nada salvo, campo vazio não é remoção: não há o que remover.
    expect(isClearingSavedPrompt('', official)).toBe(false);
  });

  test('explica por que o texto não pode ser salvo', () => {
    expect(promptValidationMessage('')).toBeNull();
    expect(promptValidationMessage('curto')).toContain('pelo menos');
    expect(promptValidationMessage('Use frases curtas e diretas.')).toBeNull();
    expect(promptValidationMessage('a'.repeat(12_001))).toContain('limite');
  });

  test('conta as etapas com texto não salvo', () => {
    expect(promptPendingCount(undefined)).toBe(0);
    expect(
      promptPendingCount({
        LESSON: { value: 'x', base: preference(LessonStageType.LESSON, null) },
      })
    ).toBe(1);
  });

  test('mostra quando foi salva e de quem são as orientações', () => {
    expect(promptSavedLabel(null)).toBe('');
    expect(promptSavedLabel('data inválida')).toBe('');
    expect(promptSavedLabel('2026-11-11T15:30:00.000Z')).toMatch(/^salva em \d{2}\/\d{2}\/2026 às \d{2}:\d{2}$/);
    expect(firstName('Ana Clara Souza')).toBe('Ana');
    expect(firstName(null)).toBe('');
  });
});
