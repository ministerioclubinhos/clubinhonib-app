import { expect, test } from '@playwright/test';

import { LessonQualityIssueKind } from '@/features/ai-lessons/quality.types';
import { countWords, lessonQualityIssues } from '@/features/ai-lessons/quality.utils';
import type { TiptapDocument } from '@/features/ai-lessons/types';

const heading = (text: string, level = 2) => ({
  type: 'heading',
  attrs: { level },
  content: [{ type: 'text', text }],
});
const paragraph = (text: string) => ({ type: 'paragraph', content: [{ type: 'text', text }] });
const lesson = (story: string[], extra: string[] = []): TiptapDocument => ({
  type: 'doc',
  content: [
    heading('PROPÓSITO'),
    paragraph('Mostrar que Jesus tem poder para libertar.'),
    heading('LIÇÃO BÍBLICA'),
    heading('Jesus liberta dois homens (Mateus 8:28-34)', 3),
    ...story.map(paragraph),
    heading('APLICAÇÃO E APELO'),
    ...extra.map(paragraph),
  ],
});
const words = (count: number) => Array.from({ length: count }, () => 'palavra').join(' ');
const kinds = (document: TiptapDocument) => lessonQualityIssues(document).map((issue) => issue.kind);

test.describe('lessonQualityIssues', () => {
  test('lição limpa e com história no tamanho do acervo não gera aviso', () => {
    expect(lessonQualityIssues(lesson([words(950)]))).toEqual([]);
  });

  test('história curta informa a contagem aproximada', () => {
    const [issue] = lessonQualityIssues(lesson([words(600)]));
    expect(issue.kind).toBe(LessonQualityIssueKind.SHORT_STORY);
    expect(issue.storyWords).toBeGreaterThanOrEqual(600);
    expect(issue.storyWords).toBeLessThan(620);
  });

  test('aponta comentário sobre evangelistas com o trecho', () => {
    const issues = lessonQualityIssues(
      lesson([words(950), 'Mateus conta que eram dois; Marcos e Lucas acompanham mais de perto um deles.'])
    );
    const source = issues.find((issue) => issue.kind === LessonQualityIssueKind.SOURCE_COMMENTARY);
    expect(source?.excerpts[0]).toContain('Mateus conta que eram dois');
  });

  test('aponta instruções que vazaram para o texto e Markdown', () => {
    expect(
      kinds(lesson([words(950), 'Narre esse acontecimento sem detalhes assustadores.'], ['**Para quem já crê:** confie.']))
    ).toEqual([LessonQualityIssueKind.PROMPT_LEAK, LessonQualityIssueKind.MARKDOWN]);
  });

  test('uma ressalva passa; a repetição gera aviso', () => {
    const once = 'Confiar em Jesus não significa que nunca teremos problemas.';
    expect(kinds(lesson([words(950), once]))).toEqual([]);
    expect(
      kinds(lesson([words(950), once], ['A Bíblia não ensina que toda doença vem de demônios. Também não quer dizer que sofrer é castigo.']))
    ).toEqual([LessonQualityIssueKind.REPEATED_DISCLAIMER]);
  });

  test('conta palavras com acentos', () => {
    expect(countWords('Jesus é o Filho de Deus, não é?')).toBe(8);
  });
});
